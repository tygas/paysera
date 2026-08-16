#!/usr/bin/env node
/**
 * test-validator.mjs — proves the validator would have caught the v1.0 defects.
 *
 * A linter written after the fact is easy to write and easy to fool: it is
 * tempting to tune it until the current files pass. This test points it at the
 * actual pre-audit commit and asserts that every one of the five defect
 * categories still fires. If someone later weakens a check to make a new
 * document pass, this test goes red.
 *
 *   node tools/test-validator.mjs
 *
 * Method: materialise `graph/` from commit f3cbfba ("Add loop graph for Paysera
 * Classifieds 30-day pilot") into a temp directory, drop in the current
 * plan.json as the source of truth, and run the validator there.
 *
 * One honest caveat about C1. The fixture borrows the *corrected* plan.json,
 * so the C1 schedule comparison (agent start day vs gate close day) has nothing
 * to fail against — plan.json is right by construction. What C1 does catch in
 * the fixture is the v1.0 YAML files themselves: eight personal-data agents in
 * Loops A and D that declare no gate at all, Legal review marked "optional",
 * and Loop-B's "proceed pending final legal review" escalation. Those are the
 * defect as it actually existed.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, copyFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const PRE_AUDIT_COMMIT = 'f3cbfba';

const EXPECTED = {
  C1: { min: 8,  what: 'personal-data agents with no gate; Legal review optional; sign-off bypass' },
  C2: { min: 20, what: 'day / agent-name / threshold drift between documents' },
  C3: { min: 10, what: 'OLX, eBay and Vinted used as LT competitors and price comparables' },
  C4: { min: 15, what: 'untagged magnitude claims, invented interview counts, pre-stamped approval, pre-written conclusions' },
  C5: { min: 20, what: 'foreign-language and garbled tokens, Cyrillic character' },
};

let tmp;
try {
  tmp = mkdtempSync(join(tmpdir(), 'graph-v1-'));
  mkdirSync(join(tmp, 'tools'), { recursive: true });

  // File-by-file via `git show` rather than `git archive | tar`: GNU tar on
  // Windows reads the "C:" in an absolute path as a remote host and fails.
  const listed = execFileSync('git', ['ls-tree', '-r', '--name-only', PRE_AUDIT_COMMIT, 'graph'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split(/\r?\n/)
    .filter(Boolean);

  if (!listed.length) throw new Error(`commit ${PRE_AUDIT_COMMIT} has no graph/ directory`);

  for (const path of listed) {
    const content = execFileSync('git', ['show', `${PRE_AUDIT_COMMIT}:${path}`], {
      cwd: ROOT,
      encoding: 'buffer',
      maxBuffer: 32 * 1024 * 1024,
    });
    const dest = join(tmp, ...path.split('/'));
    mkdirSync(join(dest, '..'), { recursive: true });
    writeFileSync(dest, content);
  }

  copyFileSync(join(ROOT, 'graph', 'plan.json'), join(tmp, 'graph', 'plan.json'));
  copyFileSync(join(ROOT, 'tools', 'validate-graph.mjs'), join(tmp, 'tools', 'validate-graph.mjs'));
  writeFileSync(join(tmp, '.gitignore'), 'node_modules/\ndist/\ngraph/output/\n');

  let raw;
  try {
    raw = execFileSync('node', ['tools/validate-graph.mjs', '--json'], {
      cwd: tmp,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (e) {
    raw = e.stdout; // non-zero exit is the expected outcome here
  }

  const report = JSON.parse(raw);
  const counts = {};
  for (const f of report.findings) counts[f.check] = (counts[f.check] || 0) + 1;

  console.log(`\n  regression: validator vs. pre-audit commit ${PRE_AUDIT_COMMIT}\n`);

  let failed = 0;
  for (const [check, { min, what }] of Object.entries(EXPECTED)) {
    const n = counts[check] || 0;
    const ok = n >= min;
    if (!ok) failed++;
    console.log(`    ${ok ? 'ok  ' : 'FAIL'}  ${check}  ${String(n).padStart(3)} findings (expected >= ${min})`);
    console.log(`            ${what}`);
  }

  console.log(`\n    total on v1.0: ${report.findings.length} findings\n`);

  if (failed) {
    console.error(`  ${failed} check(s) no longer detect the defects they were written for.`);
    console.error('  A check was probably weakened to make a new document pass.\n');
    process.exit(1);
  }

  // And the current tree must be clean.
  let current = 0;
  try {
    execFileSync('node', ['tools/validate-graph.mjs'], { cwd: ROOT, encoding: 'utf8' });
  } catch {
    current = 1;
  }
  if (current) {
    console.error('  Current tree does NOT pass validation. Run: node tools/validate-graph.mjs\n');
    process.exit(1);
  }

  console.log('  Current tree passes. v1.0 fails in all five categories. Test green.\n');
  process.exit(0);
} catch (e) {
  console.error(`\n  Could not run regression test: ${e.message}\n`);
  process.exit(2);
} finally {
  if (tmp) try { rmSync(tmp, { recursive: true, force: true }); } catch {}
}
