"""Run the actual public helper in installed Chrome; no Node/npm."""
from pathlib import Path
import os
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PublicSpecsTests(unittest.TestCase):
    def test_positive_paths_preserve_sources_and_omit_unapproved_map(self):
        chrome = next((Path(p) / 'Google/Chrome/Application/chrome.exe' for p in
            (os.environ.get('PROGRAMFILES', ''), os.environ.get('PROGRAMFILES(X86)', ''))
            if (Path(p) / 'Google/Chrome/Application/chrome.exe').is_file()), None)
        self.assertIsNotNone(chrome, 'Existing Chrome required for this browser-boundary test')
        source = (ROOT / 'public/order.html').read_text(encoding='utf-8')
        helper = source.split('    function approvedPublicSpecLeaves(', 1)[1].split('    function buildPublicProductPayload(', 1)[0]
        code = 'function approvedPublicSpecLeaves(' + helper
        entry = source.split('    async function confirmImportProductsCSV()', 1)[1].split('\n    }', 1)[0]
        code += '\nasync function confirmImportProductsCSV()' + entry + '\n}\n'
        checks = '''
let attempts=0;
const forbidden=()=>{attempts++;throw Error('write-or-network-attempt')};
const state={pendingImport:{payloads:[{sku:'synthetic-only'}]},db:{batch:forbidden,collection:forbidden}};
const commitOptionCreates=forbidden,toast=()=>{},canManageEquipment=()=>true;
window.fetch=forbidden;window.XMLHttpRequest=class{open(){forbidden()}};
window.WebSocket=class{constructor(){forbidden()}};
await confirmImportProductsCSV();
if(attempts!==0)throw Error('old-entry-attempted-write');
const specs = {容量:2, '容量.L':3, originalRow:{price:123}, priceSource:'private', discount:0.9};
const before = JSON.stringify(specs);
if(JSON.stringify(approvedPublicSpecLeaves(specs, [])) !== '{}') throw Error('empty');
if(JSON.stringify(approvedPublicSpecLeaves(specs, [['容量.L']])) !== '{"容量.L":3}') throw Error('literal-dot');
for(const path of [['originalRow','price'],['priceSource'],['discount'],['__proto__'],['missing']]) {
  let rejected = false;
  try { approvedPublicSpecLeaves(specs, [path]); } catch (_) { rejected = true; }
  if(!rejected) throw Error('unsafe-path');
}
if(JSON.stringify(specs)!==before) throw Error('private-source-mutated');
document.body.textContent='ADR017_BROWSER_PASS';
'''
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            page = root / 'test.html'
            page.write_text('<meta charset="utf-8"><body><script>(async()=>{try{' + code + checks +
                            '}catch(e){document.body.textContent="FAIL:"+e.message}})()</script>', encoding='utf-8')
            run = subprocess.run([str(chrome), '--headless=new', '--disable-gpu', '--no-first-run',
                '--user-data-dir='+str(root/'profile'), '--dump-dom', page.as_uri()], capture_output=True,
                timeout=45)
            self.assertEqual(run.returncode, 0)
            self.assertIn(b'<body>ADR017_BROWSER_PASS</body>', run.stdout)
        self.assertNotIn('specs: p.specs', source)
        self.assertIn('...(approvedSpecPaths.length ?', source)

if __name__ == '__main__':
    unittest.main()
