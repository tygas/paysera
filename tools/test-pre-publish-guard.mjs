#!/usr/bin/env node
/** Adversarial tests for command detection, fail-closed behavior and snapshot integrity. */

import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'graph-guard-'));
const log = join(temp, 'checks.log');
let failures = 0;

const git = (args) => execFileSync('git', args, {
  cwd: temp,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

const invoke = (command, { failCheck, raw } = {}) => spawnSync(
  process.execPath,
  [join(temp, 'tools', 'pre-publish-guard.mjs')],
  {
    cwd: temp,
    encoding: 'utf8',
    input: raw ?? JSON.stringify({ tool_input: { command } }),
    env: { ...process.env, CHECK_LOG: log, FAIL_CHECK: failCheck || '' },
    timeout: 30_000,
  },
);

function expect(label, command, expected, options) {
  const result = invoke(command, options);
  const ok = result.status === expected;
  console.log(`    ${ok ? 'ok  ' : 'FAIL'}  ${label}`);
  if (!ok) {
    failures += 1;
    console.log(`          exit ${result.status}, expected ${expected}`);
    const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
    if (output) console.log(output.split(/\r?\n/).map((line) => `          ${line}`).join('\n'));
  }
  return result;
}

try {
  mkdirSync(join(temp, 'tools'), { recursive: true });
  mkdirSync(join(temp, 'graph'), { recursive: true });
  copyFileSync(join(ROOT, 'tools', 'pre-publish-guard.mjs'), join(temp, 'tools', 'pre-publish-guard.mjs'));
  writeFileSync(join(temp, 'graph', 'marker.txt'), 'clean\n');
  writeFileSync(join(temp, '.gitignore'), 'graph/output/\n');

  const checks = [
    'validate-graph.mjs',
    'test-validator.mjs',
    'test-implementation-checks.mjs',
    'test-pre-publish-guard.mjs',
  ];
  for (const check of checks) {
    writeFileSync(join(temp, 'tools', check), [
      "import { appendFileSync } from 'node:fs';",
      "const name = new URL(import.meta.url).pathname.split('/').at(-1);",
      "if (process.env.CHECK_LOG) appendFileSync(process.env.CHECK_LOG, JSON.stringify({ name, args: process.argv.slice(2) }) + '\\n');",
      "if (process.env.FAIL_CHECK === name) { console.error('intentional fixture failure'); process.exit(1); }",
      '',
    ].join('\n'));
  }

  git(['init', '-q']);
  git(['config', 'user.email', 'guard-test@example.invalid']);
  git(['config', 'user.name', 'Guard Test']);
  git(['add', '.']);
  git(['commit', '-qm', 'fixture']);

  console.log('\n  pre-publish guard tests\n');

  const publishCommands = [
    ['git push', 'git push'],
    ['uppercase', 'GIT PUSH'],
    ['Windows git', 'git.exe push'],
    ['quoted git path', '& "C:\\Program Files\\Git\\bin\\git.exe" push'],
    ['global option', 'git -C . push'],
    ['PowerShell continuation', 'git `\npush'],
    ['cmd wrapper', 'cmd.exe /c git push'],
    ['PowerShell wrapper', 'powershell.exe -Command "git push"'],
    ['shell wrapper', 'bash -c "git push"'],
    ['commit', 'git --no-pager commit -m test'],
    ['Windows npm', 'npm.cmd run deploy'],
    ['npm prefix', 'npm --prefix . run deploy'],
    ['gh-pages', 'gh-pages -d dist'],
  ];
  for (const [label, command] of publishCommands)
    expect(label, command, 2, { failCheck: 'validate-graph.mjs' });

  expect('harmless git status', 'git status', 0, { failCheck: 'validate-graph.mjs' });
  expect('quoted prose is not a command', "Write-Output 'git push'", 0, { failCheck: 'validate-graph.mjs' });
  expect('quoted call-operator prose is not a command', "Write-Output '& git push'", 0, { failCheck: 'validate-graph.mjs' });
  expect('malformed hook JSON fails closed', '', 2, { raw: '{' });

  writeFileSync(log, '');
  expect('clean HEAD may push after every check passes', 'git push', 0);
  const calls = readFileSync(log, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const validatorCall = calls.find((call) => call.name === 'validate-graph.mjs');
  if (calls.length !== checks.length || !validatorCall?.args.includes('--strict')) {
    failures += 1;
    console.log('    FAIL  full suite / strict validator invocation');
  } else {
    console.log('    ok    full suite / strict validator invocation');
  }

  writeFileSync(join(temp, 'graph', 'marker.txt'), 'unstaged\n');
  expect('commit rejects relevant unstaged drift', 'git commit -m test', 2);
  git(['add', 'graph/marker.txt']);
  expect('commit validates the staged snapshot', 'git commit -m test', 0);
  expect('push rejects staged-but-uncommitted drift', 'git push', 2);
  git(['reset', '--hard', '-q', 'HEAD']);

  writeFileSync(join(temp, 'tools', 'untracked.mjs'), 'export {};\n');
  expect('commit rejects relevant untracked drift', 'git commit -m test', 2);

  console.log(`\n  ${failures ? `${failures} guard test(s) failed.` : 'All guard tests passed.'}\n`);
} catch (error) {
  failures += 1;
  console.error(error.stack || error);
} finally {
  const resolved = realpathSync(temp);
  const base = realpathSync(tmpdir());
  const rel = relative(base, resolved);
  if (!rel.startsWith('..' + sep) && rel !== '..' && rel !== '') rmSync(resolved, { recursive: true, force: true });
}

process.exitCode = failures ? 1 : 0;
