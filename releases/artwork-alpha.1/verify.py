#!/usr/bin/env python3
"""Pre-install, file-only release verification. Never extracts or runs SDK code.

Trust the acquired release/checksum source separately: matching digests do not
establish authorship, complete evidence, consent or independent provenance.
"""
import base64
import hashlib
import io
import json
import sys
import tarfile
from pathlib import Path

sys.dont_write_bytecode = True
import package_verify

RELEASE = 'artwork-alpha.1'
BUNDLE = 'agent-art-artwork-alpha.1.tar.gz'
EXPECTED = {
    '@agent-art/artwork-sdk': ('0.0.0-mcp.1', 'be028bbfcbc46959e38b862e5c44d3a084a756deaaeda8c6df3e8d19c6caa0a1'),
    '@agent-art/participation-account': ('0.0.0-account.1', 'e3e8751b48de68a509d986ffb294569f40ad9dba452b41e1a7124a0525aa7fa2'),
}


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def sha(body):
    return hashlib.sha256(body).hexdigest()


def relative(name):
    require(isinstance(name, str) and name and not name.startswith('/')
            and '\\' not in name and all(x not in ('', '.', '..') for x in name.split('/')), 'unsafe_path')
    return name


def read(root, name):
    relative(name)
    p = Path(root)
    for part in name.split('/'):
        p = p / part
        require(not p.is_symlink(), 'linked_input')
    require(p.is_file() and p.stat().st_size <= 33554432, 'regular_bounded_input_required')
    return p.read_bytes()


def parse(body):
    def pairs(items):
        value = {}
        for key, item in items:
            require(key not in value, 'duplicate_key')
            value[key] = item
        return value
    def constant(_):
        raise ValueError('nonfinite_json')
    return json.loads(body, object_pairs_hook=pairs, parse_constant=constant)


def members(body, prefix):
    files, total = {}, 0
    with tarfile.open(fileobj=io.BytesIO(body), mode='r:gz') as stream:
        for item in stream:
            require(item.isfile() and item.name.startswith(prefix) and item.size <= 8388608, 'unsafe_member')
            name = relative(item.name[len(prefix):])
            total += item.size
            require(name not in files and len(files) < 2048 and total <= 33554432, 'unsafe_inventory')
            files[name] = stream.extractfile(item).read()
    return files


def verify(root):
    root = Path(root)
    manifest = parse(read(root, 'MANIFEST.json'))
    require(manifest['schema'] == 'aap.artwork-alpha.manifest.v1'
            and manifest['release'] == RELEASE, 'release_identity')
    payload = {}
    for row in manifest['files']:
        name = relative(row['path'])
        require(name not in payload and name not in {'MANIFEST.json', 'SHA256SUMS', 'BUNDLE.json', BUNDLE}, 'duplicate_inventory')
        body = read(root, name)
        require(len(body) == row['bytes'] and sha(body) == row['sha256'], 'payload_mismatch')
        payload[name] = body
    payload['MANIFEST.json'] = read(root, 'MANIFEST.json')
    checksums = ''.join(sha(b) + '  ' + name + '\n' for name, b in sorted(payload.items())).encode()
    require(read(root, 'SHA256SUMS') == checksums, 'checksum_inventory')
    payload['SHA256SUMS'] = checksums
    actual = set()
    for p in root.rglob('*'):
        require(not p.is_symlink(), 'linked_input')
        if p.is_file():
            actual.add(p.relative_to(root).as_posix())
    require(actual - {'BUNDLE.json', BUNDLE} == set(payload), 'unexpected_release_file')

    artifacts = parse(payload['ARTIFACTS.json'])
    require(artifacts['schema'] == 'aap.artwork-alpha.artifacts.v1'
            and artifacts['release'] == RELEASE and artifacts['state'] == 'prepared-unpublished', 'artifact_identity')
    packages = artifacts['packages']
    require(len(packages) == 2 and {p['name'] for p in packages} == set(EXPECTED), 'artifact_cohort')
    lock = parse(payload['consumer/package-lock.json'])
    consumer = parse(payload['consumer/package.json'])
    require(sha(payload['consumer/package.json']) == artifacts['consumer']['manifestSha256']
            and sha(payload['consumer/package-lock.json']) == artifacts['consumer']['lockSha256'], 'consumer_source_mismatch')
    require(consumer['private'] is True and consumer['engines'] == {'node': '22.23.4'}
            and not consumer.get('scripts') and lock['lockfileVersion'] == 3
            and lock['packages'][''] == {k: consumer[k] for k in ['name', 'version', 'dependencies', 'engines']}, 'consumer_profile')
    expected_lock = {''}
    expected_deps = {}
    notice_count = 0
    for item in packages:
        identity = parse(payload[item['identity']])
        version, digest = EXPECTED[item['name']]
        require((item['version'], item['sha256']) == (version, digest)
                and (identity['name'], identity['version'], identity['sha256']) == (item['name'], version, digest), 'cohort_pin')
        body = payload[item['path']]
        require(len(body) == item['bytes'] and sha(body) == digest, 'artifact_bytes')
        package_verify.verify(root / item['path'], identity, lock=root / 'consumer/package-lock.json')
        files = members(body, 'package/')
        meta = parse(files['package.json'])
        require(meta['license'] == 'MIT' and not meta.get('scripts') and meta['os'] == ['darwin']
                and meta['cpu'] == ['arm64'] and meta['engines'] == {'node': '22.23.4'}, 'package_profile')
        if item['name'] == '@agent-art/participation-account':
            require(meta['peerDependencies'] == {'@agent-art/artwork-sdk': EXPECTED['@agent-art/artwork-sdk'][0]}, 'peer_mismatch')
        prefix = 'node_modules/' + item['name']
        expected_lock.add(prefix)
        for dependency in meta['dependencies']:
            expected_lock.add(prefix + '/node_modules/' + dependency)
        expected_deps[item['name']] = 'file:./vendor/' + identity['archive']
        require(lock['packages'][prefix]['resolved'] == 'file:vendor/' + identity['archive']
                and lock['packages'][prefix]['integrity'] == 'sha512-' + base64.b64encode(hashlib.sha512(body).digest()).decode(), 'lock_artifact')
        for dep in parse(files['NOTICE-INVENTORY.json'])['dependencies']:
            require(dep['notices'], 'missing_notice')
            for notice in dep['notices']:
                require(sha(files[relative(notice['path'])]) == notice['sha256'], 'notice_mismatch')
                notice_count += 1
    require(consumer['dependencies'] == expected_deps and set(lock['packages']) == expected_lock
            and len(expected_lock) == artifacts['consumer']['lockEntries'] == 13, 'lock_cohort')
    if 'BUNDLE.json' in actual or BUNDLE in actual:
        require({'BUNDLE.json', BUNDLE} <= actual, 'incomplete_bundle')
        info = parse(read(root, 'BUNDLE.json'))
        body = read(root, BUNDLE)
        require(info['archive'] == BUNDLE and info['release'] == RELEASE
                and len(body) == info['bytes'] and sha(body) == info['sha256'], 'bundle_mismatch')
        require(members(body, RELEASE + '/') == payload, 'bundle_inventory')
    return {'state': 'prepared-files-verified', 'release': RELEASE, 'packages': 2,
            'payloadFiles': len(payload), 'lockEntries': 13, 'noticeFilesChecked': notice_count,
            'sdkRuntimeExecuted': False, 'installerExecuted': False, 'publication': False}


if __name__ == '__main__':
    try:
        print(json.dumps(verify(Path(__file__).resolve().parent)))
    except Exception:
        print(json.dumps({'state': 'failed', 'code': 'release_file_verification_failed'}))
        raise SystemExit(1)
