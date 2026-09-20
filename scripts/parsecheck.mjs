// parsecheck.mjs — a syntax gate that actually works.
//
//     node scripts/parsecheck.mjs src/**/*.js
//
// Found 2026-09-20, the hard way. `node --check` is the obvious thing to reach
// for and on node 24 it DOES NOT PARSE ES MODULES: it returns 0 for
//
//     export const x = { a: { 0x123, b: 1 } };
//
// which is a syntax error. Every "syntax ok" printed by `node --check` over a
// file in src/ this session meant nothing, and one genuinely broken object
// literal went into constants.js behind a green check.
//
// Importing the file does parse it. The import then fails to RESOLVE 'three',
// or to find `document`, which are different failures and are what a PASS
// looks like here — the file was read, understood, and only its environment is
// missing. Anything else is a real error and exits non-zero.
import { pathToFileURL } from 'node:url';
let bad = 0;
for (const f of process.argv.slice(2)) {
  try { await import(pathToFileURL(f).href); console.log('ok      ', f); }
  catch (e) {
    const m = String(e && e.message || e);
    if (/Cannot find (package|module)|Failed to resolve module specifier|only supported in ESM|document is not defined|window is not defined|navigator is not defined/i.test(m)) {
      console.log('parsed  ', f);
    } else { console.log('FAIL    ', f, '\n        ', m.split('\n')[0]); bad++; }
  }
}
process.exit(bad ? 1 : 0);
