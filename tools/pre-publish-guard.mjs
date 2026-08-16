#!/usr/bin/env node
/**
 * pre-publish-guard.mjs — Claude Code PreToolUse hook.
 *
 * Wired in .claude/settings.json. Fires before every Bash/PowerShell call and
 * blocks the ones that publish — `git commit`, `git push`, `npm run deploy`,
 * `gh-pages` — unless `tools/validate-graph.mjs` passes.
 *
 * This is the part of the process change that does not depend on remembering.
 * On 2026-08-11 the graph was generated, committed and pushed in one motion.
 * A checklist would not have stopped that, because a checklist is something you
 * have to decide to open. A hook is not.
 *
 * Contract: read the tool call as JSON on stdin; exit 0 to allow, exit 2 to
 * block with the reason on stderr.
 */

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const PUBLISHING = [
  /\bgit\s+commit\b/,
  /\bgit\s+push\b/,
  /\bnpm\s+run\s+deploy\b/,
  /\bgh-pages\b/,
];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(raw || '{}')?.tool_input?.command ?? '';
  } catch {
    process.exit(0); // unparseable input is not this hook's problem
  }

  if (!PUBLISHING.some((re) => re.test(command))) process.exit(0);

  try {
    execFileSync('node', ['tools/validate-graph.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    process.exit(0);
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`.trim();
    process.stderr.write(
      'BLOCKED by pre-publish-guard: tools/validate-graph.mjs is failing.\n\n' +
        out +
        '\n\nThis repository is public and is read as evidence of how I work.\n' +
        'Fix the findings above, then publish. If a finding is a false positive,\n' +
        'fix the check in tools/validate-graph.mjs rather than working around it —\n' +
        'and run tools/test-validator.mjs to confirm the check still catches the\n' +
        'defects it was written for.\n',
    );
    process.exit(2);
  }
});
