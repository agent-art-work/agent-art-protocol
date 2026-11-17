"""Release-file fault checks only. No SDK imports, install or model calls."""
import hashlib
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
spec = importlib.util.spec_from_file_location('artwork_alpha_verify', HERE / 'verify.py')
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)


class ReleaseVerification(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='aap-alpha-files-')
        self.root = Path(self.temp.name) / 'snapshot'
        shutil.copytree(HERE, self.root)

    def tearDown(self):
        self.temp.cleanup()

    def test_actual_prepared_snapshot(self):
        result = v.verify(self.root)
        self.assertEqual(result['packages'], 2)
        self.assertEqual(result['lockEntries'], 13)
        self.assertFalse(result['sdkRuntimeExecuted'])

    def test_corrupted_npm_archive_is_rejected(self):
        target = self.root / 'consumer/vendor/participation-account-0.0.0-account.1.tgz'
        b = bytearray(target.read_bytes()); b[len(b) // 2] ^= 1; target.write_bytes(b)
        with self.assertRaisesRegex(ValueError, 'payload_mismatch'):
            v.verify(self.root)

    def test_changed_lock_is_rejected_even_if_file_inventory_is_refreshed(self):
        target = self.root / 'consumer/package-lock.json'
        lock = json.loads(target.read_text())
        lock['packages']['node_modules/uncommissioned-package'] = {'version': '1.0.0'}
        target.write_text(json.dumps(lock) + '\n')
        self.refresh_inventory()
        with self.assertRaisesRegex(ValueError, 'consumer_source_mismatch'):
            v.verify(self.root)

    def test_symbolic_link_to_matching_body_is_rejected(self):
        target = self.root / 'INSTALL.md'
        other = Path(self.temp.name) / 'outside.md'
        other.write_bytes(target.read_bytes()); target.unlink(); target.symlink_to(other)
        with self.assertRaisesRegex(ValueError, 'linked_input'):
            v.verify(self.root)

    def test_unselected_file_is_rejected(self):
        (self.root / 'unselected-private-input.txt').write_text('synthetic only\n')
        with self.assertRaisesRegex(ValueError, 'unexpected_release_file'):
            v.verify(self.root)

    def test_outer_archive_never_extracts_unsafe_members(self):
        import gzip
        import io
        import tarfile
        raw = io.BytesIO()
        with tarfile.open(fileobj=raw, mode='w') as t:
            member = tarfile.TarInfo('artwork-alpha.1/../escaped.txt')
            member.size = 1; t.addfile(member, io.BytesIO(b'x'))
        with self.assertRaisesRegex(ValueError, 'unsafe_path'):
            v.members(gzip.compress(raw.getvalue(), mtime=0), 'artwork-alpha.1/')
        self.assertFalse((Path(self.temp.name) / 'escaped.txt').exists())

    def refresh_inventory(self):
        p = self.root / 'MANIFEST.json'; value = json.loads(p.read_text())
        for row in value['files']:
            b = (self.root / row['path']).read_bytes()
            row.update(bytes=len(b), sha256=hashlib.sha256(b).hexdigest())
        p.write_text(json.dumps(value, indent=2) + '\n')
        paths = sorted([x['path'] for x in value['files']] + ['MANIFEST.json'])
        (self.root / 'SHA256SUMS').write_text(''.join(hashlib.sha256((self.root / n).read_bytes()).hexdigest() + '  ' + n + '\n' for n in paths))


if __name__ == '__main__':
    unittest.main()
