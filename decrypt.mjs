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
const pd = path.join(here, 'parts');
const parts = fs.readdirSync(pd).filter(f => /^bundle\.\d+\.b64$/.test(f)).sort();
const b = Buffer.from(parts.map(f => fs.readFileSync(path.join(pd, f), 'utf8')).join('').replace(/\s+/g, ''), 'base64');
const tgz = open(contentKey, b.subarray(0, 12), b.subarray(12, b.length - 16), b.subarray(b.length - 16));
fs.mkdirSync(out, { recursive: true }); const tmp = path.join(out, '.bundle.tgz'); fs.writeFileSync(tmp, tgz);
execFileSync('tar', ['-xzf', tmp, '-C', out]); fs.unlinkSync(tmp);
console.log(`Unlocked code-animation ${keys.version} -> ${out}`);
