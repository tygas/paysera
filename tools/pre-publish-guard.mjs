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

const REQUIRED_CHECKS = [
  { file: 'tools/validate-graph.mjs', args: ['--strict'] },
  { file: 'tools/test-validator.mjs', args: [] },
  { file: 'tools/test-implementation-checks.mjs', args: [] },
  { file: 'tools/test-pre-publish-guard.mjs', args: [] },
];

const unquote = (token) => {
  if (token.length >= 2 && ((token[0] === '"' && token.at(-1) === '"') ||
      (token[0] === "'" && token.at(-1) === "'"))) return token.slice(1, -1);
  return token;
};

function commandSegments(command) {
  // Hooks receive shell source, not an argv array. We only inspect executable
  // position in each statement. That avoids blocking harmless prose such as
  // `Write-Output 'git push'`, while still handling ;, &&, ||, pipes and lines.
  const normalized = command.replace(/(?:\\|`)\r?\n/g, ' ');
  return normalized.split(/&&|\|\||[;&|\r\n]/)
    .map((segment) => [...segment.matchAll(/"(?:\\.|[^"])*"|'(?:''|[^'])*'|\S+/g)].map((m) => unquote(m[0])))
    .filter((tokens) => tokens.length);
}

function gitSubcommand(tokens) {
  const valueOptions = new Set(['-c', '-C', '--git-dir', '--work-tree', '--namespace', '--config-env']);
  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith('-')) return token.toLowerCase();
    const option = token.split('=')[0];
    if (valueOptions.has(option) && !token.includes('=')) i += 1;
  }
  return null;
}

function publishKind(command, depth = 0) {
  if (depth > 3) return null;
  for (const tokens of commandSegments(command)) {
    const executable = (tokens[0] || '').toLowerCase().split(/[\\/]/).at(-1);
    if (/^git(?:\.exe)?$/.test(executable)) {
      const subcommand = gitSubcommand(tokens);
      if (subcommand === 'commit') return 'commit';
      if (subcommand === 'push') return 'release';
    }
    if (/^npm(?:\.cmd|\.exe)?$/.test(executable)) {
      const words = tokens.slice(1).filter((token) => !token.startsWith('-')).map((token) => token.toLowerCase());
      const runIndex = words.indexOf('run');
      if (runIndex >= 0 && words[runIndex + 1] === 'deploy') return 'release';
    }
    if (/^gh-pages(?:\.cmd|\.exe)?$/.test(executable)) return 'release';
    if (/^(?:cmd(?:\.exe)?)$/.test(executable)) {
      const switchIndex = tokens.findIndex((token, index) => index > 0 && /^\/[ck]$/i.test(token));
      if (switchIndex >= 0) {
        const nested = publishKind(tokens.slice(switchIndex + 1).join(' '), depth + 1);
        if (nested) return nested;
      }
    }
    if (/^(?:powershell|pwsh)(?:\.exe)?$/.test(executable)) {
      const switchIndex = tokens.findIndex((token, index) => index > 0 && /^-(?:command|c)$/i.test(token));
      if (switchIndex >= 0) {
        const nested = publishKind(tokens.slice(switchIndex + 1).join(' '), depth + 1);
        if (nested) return nested;
      }
    }
    if (/^(?:bash|sh)(?:\.exe)?$/.test(executable)) {
      const switchIndex = tokens.findIndex((token, index) => index > 0 && token === '-c');
      if (switchIndex >= 0) {
        const nested = publishKind(tokens.slice(switchIndex + 1).join(' '), depth + 1);
        if (nested) return nested;
      }
    }
    if (/^(?:sudo|env)(?:\.exe)?$/.test(executable)) {
      const nested = publishKind(tokens.slice(1).join(' '), depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

function gitOutput(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15_000 }).trim();
}

function enforceSnapshot(kind) {
  const pathspec = ['--', 'graph', 'tools', '.gitignore'];
  try {
    gitOutput(['rev-parse', '--is-inside-work-tree']);
    if (kind === 'commit') {
      const unstaged = gitOutput(['diff', '--name-only', ...pathspec]);
      const untracked = gitOutput(['ls-files', '--others', '--exclude-standard', ...pathspec]);
      if (unstaged || untracked)
        throw new Error(`Relevant working-tree files differ from the staged snapshot:\n${[unstaged, untracked].filter(Boolean).join('\n')}`);
    } else {
      const dirty = gitOutput(['status', '--porcelain', '--untracked-files=all', ...pathspec]);
      if (dirty)
        throw new Error(`Relevant files differ from the HEAD being published:\n${dirty}`);
    }
  } catch (error) {
    process.stderr.write(
      'BLOCKED by pre-publish-guard: cannot validate the exact snapshot being published.\n\n' +
      `${error.stderr || error.message || error}\n\n` +
      'For commit: stage every graph/tools change and leave no unstaged or untracked copy.\n' +
      'For push/deploy: commit every graph/tools change first.\n',
    );
    process.exit(2);
  }
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(raw || '{}')?.tool_input?.command ?? '';
  } catch {
    process.stderr.write('BLOCKED by pre-publish-guard: malformed hook input.\n');
    process.exit(2);
  }

  if (typeof command !== 'string') {
    process.stderr.write('BLOCKED by pre-publish-guard: tool_input.command must be a string.\n');
    process.exit(2);
  }

  const kind = publishKind(command);
  if (!kind) process.exit(0);

  enforceSnapshot(kind);

  for (const check of REQUIRED_CHECKS) {
    try {
      execFileSync(process.execPath, [check.file, ...check.args], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120_000,
      });
    } catch (e) {
      const out = `${e.stdout || ''}${e.stderr || ''}`.trim();
      process.stderr.write(
        `BLOCKED by pre-publish-guard: ${check.file} is failing.\n\n` +
          out +
          '\n\nThis repository is public and is read as evidence of how I work.\n' +
          'Fix the findings above, then publish. If a finding is a false positive,\n' +
          'fix the check rather than working around it, and keep its mutation test green.\n',
      );
      process.exit(2);
    }
  }
  process.exit(0);
});
