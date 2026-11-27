// Unlocks the encrypted bundle (parts/bundle.NN.b64) with a buyer's license key. No dependencies (Node 18+ and tar).
// usage: node decrypt.mjs <LICENSE_KEY> [outDir]
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { execFileSync } from 'child_process';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const key = (process.argv[2] || '').trim(), out = path.resolve(process.argv[3] || 'code-animation-full');
if (!key) { console.error('Missing license key.'); process.exit(1); }
const keys = JSON.parse(fs.readFileSync(path.join(here, 'keys.json'), 'utf8'));
const id = crypto.createHash('sha256').update(key).digest('hex'), e = keys.buyers[id];
if (!e) { console.error('License key not recognised (wrong, revoked or not yet activated). Contact the seller.'); process.exit(3); }
const open = (k, iv, data, tag) => { const d = crypto.createDecipheriv('aes-256-gcm', k, iv); d.setAuthTag(tag); return Buffer.concat([d.update(data), d.final()]); };
let contentKey;
try { const kek = crypto.pbkdf2Sync(key, Buffer.from(e.salt, 'hex'), keys.iterations, 32, 'sha256');
  contentKey = open(kek, Buffer.from(e.iv, 'hex'), Buffer.from(e.wrapped, 'hex'), Buffer.from(e.tag, 'hex')); }
catch { console.error('License key could not unlock this release.'); process.exit(3); }
const unpack = (dir, re) => { const files = fs.readdirSync(dir).filter(f => re.test(f)).sort();
  const b = Buffer.from(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('').replace(/\s+/g, ''), 'base64');
  const tgz = open(contentKey, b.subarray(0, 12), b.subarray(12, b.length - 16), b.subarray(b.length - 16));
  const tmp = path.join(out, '.bundle.tgz'); fs.writeFileSync(tmp, tgz); execFileSync('tar', ['-xzf', tmp, '-C', out]); fs.unlinkSync(tmp); };
fs.mkdirSync(out, { recursive: true });
unpack(path.join(here, 'parts'), /^bundle\.\d+\.b64$/);
// updates published as patches (patches/pN.MM.b64) are applied in order on top of the base bundle
const pdir = path.join(here, 'patches');
if (fs.existsSync(pdir)) { const ns = [...new Set(fs.readdirSync(pdir).map(f => (f.match(/^p(\d+)\.\d+\.b64$/) || [])[1]).filter(Boolean))].map(Number).sort((a, b) => a - b);
  for (const n of ns) unpack(pdir, new RegExp(`^p${n}\\.\\d+\\.b64$`)); }
console.log(`Unlocked code-animation ${keys.version} -> ${out}`);
