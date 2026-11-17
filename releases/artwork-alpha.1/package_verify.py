#!/usr/bin/env python3
"""File-only verification of a selected internal archive/installed consumer.

The identity file is the caller's trust input. This verifies bytes/inventory,
not provenance, Agent participation, licensing conclusions or runtime behavior.
Never extracts an archive or follows member paths onto the filesystem.
"""
import argparse
import base64
import hashlib
import io
import json
import tarfile
from pathlib import Path


def digest(body):
    return hashlib.sha256(body).hexdigest()


def regular(path):
    path = Path(path)
    if path.is_symlink() or not path.is_file() or path.stat().st_nlink != 1:
        raise ValueError('regular_file_required')
    return path.read_bytes()


def relative(name):
    if not isinstance(name, str) or name.startswith('/') or '\\' in name or any(
            part in ('', '.', '..') for part in name.split('/')):
        raise ValueError('invalid_member')
    return name


def verify(archive, identity, installed=None, lock=None):
    body = regular(archive)
    if digest(body) != identity['sha256']:
        raise ValueError('archive_digest_mismatch')
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(body).digest()).decode()
    if integrity != identity['sha512Integrity']:
        raise ValueError('archive_integrity_mismatch')
    files = {}
    total = 0
    with tarfile.open(fileobj=io.BytesIO(body), mode='r:gz') as stream:
        for member in stream:
            if not member.isfile() or not member.name.startswith('package/') or member.size > 8388608:
                raise ValueError('invalid_member')
            name = relative(member.name[len('package/'):])
            total += member.size
            if total > 33554432 or name in files:
                raise ValueError('invalid_inventory')
            files[name] = stream.extractfile(member).read()
    manifest_name = 'artwork-manifest.json'
    manifest_bytes = files[manifest_name]
    if digest(manifest_bytes) != identity['manifestSha256']:
        raise ValueError('manifest_digest_mismatch')
    manifest = json.loads(manifest_bytes)
    rows = {relative(row['path']): row for row in manifest['files']}
    if len(rows) != len(manifest['files']) or set(files) != set(rows) | {manifest_name}:
        raise ValueError('inventory_mismatch')
    for name, row in rows.items():
        if len(files[name]) != row['bytes'] or digest(files[name]) != row['sha256']:
            raise ValueError('member_digest_mismatch')
    package = json.loads(files['package.json'])
    if package['name'] != identity['name'] or package['version'] != identity['version'] or package.get('private') is not True:
        raise ValueError('package_identity_mismatch')
    if len(files) != identity['files'] or len(body) != identity['bytes']:
        raise ValueError('archive_shape_mismatch')
    if installed is not None:
        root = Path(installed)
        if root.is_symlink() or not root.is_dir():
            raise ValueError('installed_root_link_rejected')
        root = root.resolve()
        actual = set()
        for file in root.rglob('*'):
            if file.is_symlink():
                raise ValueError('installed_link_rejected')
            if file.is_file():
                name = file.relative_to(root).as_posix()
                actual.add(name)
                if name not in files or regular(file) != files[name]:
                    raise ValueError('installed_body_mismatch')
        if actual != set(files):
            raise ValueError('installed_inventory_mismatch')
    if lock is not None:
        document = json.loads(regular(lock))
        packages = document['packages']
        prefix = 'node_modules/' + package['name']
        entry = packages[prefix]
        if document.get('lockfileVersion') != 3 or entry['version'] != package['version'] or entry['integrity'] != integrity:
            raise ValueError('consumer_lock_mismatch')
        for name, version in package['dependencies'].items():
            dependency = packages[prefix + '/node_modules/' + name]
            if dependency['version'] != version or dependency.get('inBundle') is not True:
                raise ValueError('bundled_lock_mismatch')
    return {'status': 'verified', 'name': package['name'], 'version': package['version'],
            'archiveSha256': digest(body), 'manifestSha256': digest(manifest_bytes),
            'files': len(files), 'installedChecked': installed is not None, 'consumerLockChecked': lock is not None}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--identity', required=True)
    parser.add_argument('--archive', required=True)
    parser.add_argument('--installed')
    parser.add_argument('--lock')
    args = parser.parse_args()
    try:
        result = verify(args.archive, json.loads(regular(args.identity)), args.installed, args.lock)
        print(json.dumps(result))
    except Exception:
        print(json.dumps({'status': 'failed', 'code': 'candidate_verification_failed'}))
        raise SystemExit(1)
