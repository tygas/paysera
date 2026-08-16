#!/usr/bin/env node
/**
 * validate-graph.mjs — pre-publish validator for this repository.
 *
 * WHY THIS EXISTS
 * ---------------
 * On 2026-08-11 the `graph/` directory was published without review. An audit on
 * 2026-08-16 found defects in five distinct categories. Every check below exists
 * because one of those defects got past a human read-through:
 *
 *   C1  SEQUENCING       personal-data agents scheduled before their legal basis
 *   C2  DRIFT            days / agent names / thresholds disagreeing across docs
 *   C3  MARKET           competitors from the wrong market
 *   C4  CLAIMS           quantitative claims with no source
 *   C5  LANGUAGE         foreign-language and garbled tokens in Lithuanian text
 *
 * Plus two structural checks:
 *   S1  HYGIENE          research output containing personal data must be gitignored
 *   S2  PLAN             plan.json internally consistent (dependency ordering)
 *
 * `graph/plan.json` is the single source of truth. Everything else is checked
 * against it.
 *
 * USAGE
 *   node tools/validate-graph.mjs            # all checks
 *   node tools/validate-graph.mjs --only=C4  # one check
 *   node tools/validate-graph.mjs --json     # machine-readable
 *   node tools/validate-graph.mjs --strict   # warnings also block publishing
 *
 * EXIT CODES
 *   0  clean
 *   1  one or more errors
 *   2  validator could not run (missing files, bad JSON)
 *
 * SCOPE AND HONESTY ABOUT IT
 * --------------------------
 * This is a linter, not a proof. C5 catches known regressions and non-Latin
 * scripts; it cannot detect fluent nonsense. C4 catches untagged magnitude
 * claims; it cannot tell a true number from a false one. C1 and C2 are exact:
 * they compare structure against plan.json and will not miss a violation.
 * The linter is the floor. The human review in
 * `.claude/skills/pre-publish-audit/SKILL.md` is the ceiling.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const GRAPH = join(ROOT, 'graph');

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || null;
const asJson = args.includes('--json');
const strict = args.includes('--strict');
const CHECK_IDS = new Set(['C1', 'C2', 'C3', 'C4', 'C5', 'S1', 'S2']);
const fatal = (message) => {
  if (asJson) console.log(JSON.stringify({ fatal: message, findings: [], exemptions: [] }, null, 2));
  else console.error(`FATAL: ${message}`);
  process.exit(2);
};

const unknownArgs = args.filter((a) => a !== '--json' && a !== '--strict' && !a.startsWith('--only='));
if (unknownArgs.length || (only && !CHECK_IDS.has(only.toUpperCase()))) {
  const message = unknownArgs.length
    ? `unknown argument(s): ${unknownArgs.join(', ')}`
    : `unknown check in --only: ${only}`;
  fatal(`${message}. Valid checks: ${[...CHECK_IDS].join(', ')}`);
}

const findings = [];
const exemptions = [];

const rel = (p) => relative(ROOT, p).split(sep).join('/');

// ---------------------------------------------------------------------------
// Centrally reviewed exemptions.
//
// A document *about* defects has to quote them. This audit report reproduces
// the Indonesian phrase and the Cyrillic character verbatim — without them the
// finding cannot be documented at all.
//
// A marker inside a checked file must never be able to disable its own check.
// Exemptions therefore live here, are exact file/check pairs, and are always
// printed in the report. Adding one is a validator-code review, not a content
// edit that silently turns off enforcement.
// ---------------------------------------------------------------------------
const exemptCache = new Map();
const FILE_EXEMPTIONS = new Map([
  ['AUDIT-graph-2026-08-16.md:C5',
    'This report quotes the exact language artifact it documents; exemption is limited to C5 in this historical audit.'],
]);
function exemptChecks(absPath) {
  const key = rel(absPath);
  if (exemptCache.has(key)) return exemptCache.get(key);
  const map = new Map();
  for (const [pair, reason] of FILE_EXEMPTIONS) {
    const separator = pair.lastIndexOf(':');
    if (pair.slice(0, separator) === key) map.set(pair.slice(separator + 1), reason);
  }
  exemptCache.set(key, map);
  return map;
}

const note = (level, check, file, line, message, detail) => {
  const abs = join(ROOT, file);
  const reason = exemptChecks(abs).get(check);
  if (reason) {
    if (!exemptions.some((e) => e.file === file && e.check === check))
      exemptions.push({ file, check, reason });
    return;
  }
  findings.push({ level, check, file, line, message, detail });
};
const error = (...a) => note('error', ...a);
const warn = (...a) => note('warn', ...a);

function read(p) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'output' || entry === 'dist') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Minimal YAML reader.
//
// The loop files use a narrow, predictable subset: top-level scalars, an
// `agents:` list whose items start with `- name:`, and indented scalars beneath
// each item. A full YAML parser would be a dependency for no extra coverage, so
// this reads exactly the fields the checks need and nothing else.
// ---------------------------------------------------------------------------
function readLoopYaml(path) {
  const src = read(path);
  if (src === null) return null;
  const top = {};
  const agents = [];
  const duplicateAgentFields = [];
  let current = null;
  let inAgents = false;

  src.split(/\r?\n/).forEach((raw, i) => {
    const lineNo = i + 1;
    if (/^\s*#/.test(raw) || raw.trim() === '' || raw.trim() === '---') return;

    if (/^agents:\s*$/.test(raw)) {
      inAgents = true;
      return;
    }
    if (/^[a-z_]+:/.test(raw) && !/^\s/.test(raw)) {
      inAgents = false;
      current = null;
      const m = raw.match(/^([a-z_]+):\s*(.*)$/);
      if (m) top[m[1]] = m[2].trim();
      return;
    }
    if (!inAgents) return;

    const nameMatch = raw.match(/^\s{2}-\s+name:\s*(\S+)/);
    if (nameMatch) {
      current = { name: nameMatch[1], _line: lineNo };
      agents.push(current);
      return;
    }
    if (!current) return;
    const kv = raw.match(/^\s{4}([a-z_]+):\s*(.*)$/);
    if (kv && kv[2] !== '' && !kv[2].startsWith('|') && !kv[2].startsWith('>')) {
      if (kv[1] in current) duplicateAgentFields.push({ agent: current.name, field: kv[1], line: lineNo });
      else current[kv[1]] = kv[2].trim();
    }
  });

  const exitMetrics = {};
  const duplicateMetrics = [];
  const binaryRequirements = [];
  let inExit = false;
  let inCompletion = false;
  let inBinary = false;
  let metric = null;
  let binaryRequirement = null;

  const scalar = (value) => {
    const s = value.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null') return null;
    return s.replace(/^["']|["']$/g, '');
  };

  src.split(/\r?\n/).forEach((raw, i) => {
    if (/^exit_conditions:\s*$/.test(raw)) {
      inExit = true;
      return;
    }
    if (inExit && /^[a-z_]+:/.test(raw)) {
      inExit = false;
      inCompletion = false;
      inBinary = false;
      metric = null;
      binaryRequirement = null;
    }
    if (!inExit) return;

    if (/^\s{2}completion:\s*$/.test(raw)) {
      inCompletion = true;
      inBinary = false;
      metric = null;
      binaryRequirement = null;
      return;
    }
    if (/^\s{2}binary_requirements:\s*$/.test(raw)) {
      inCompletion = false;
      inBinary = true;
      metric = null;
      binaryRequirement = null;
      return;
    }
    if (/^\s{2}[a-z_]+:\s*/.test(raw)) {
      inCompletion = false;
      inBinary = false;
      metric = null;
      binaryRequirement = null;
      return;
    }

    if (inCompletion) {
      const start = raw.match(/^\s{4}-\s+metric:\s*(\S+)/);
      if (start) {
        if (exitMetrics[start[1]]) duplicateMetrics.push({ metric: start[1], line: i + 1 });
        metric = exitMetrics[start[1]] ||= { _line: i + 1 };
        return;
      }
      const kv = raw.match(/^\s{6}([a-z_]+):\s*(.+)$/);
      if (metric && kv && !kv[2].startsWith('|') && !kv[2].startsWith('>')) {
        metric[kv[1]] = scalar(kv[2]);
      }
    } else if (inBinary) {
      const item = raw.match(/^\s{4}-\s+id:\s*(\S+)/);
      if (item) {
        binaryRequirement = { id: item[1], _line: i + 1 };
        binaryRequirements.push(binaryRequirement);
        return;
      }
      const kv = raw.match(/^\s{6}([a-z_]+):\s*(.+)$/);
      if (binaryRequirement && kv && !kv[2].startsWith('|') && !kv[2].startsWith('>'))
        binaryRequirement[kv[1]] = scalar(kv[2]);
    }
  });

  return {
    top,
    agents,
    exitMetrics,
    binaryRequirements,
    duplicateAgentFields,
    duplicateMetrics,
    path,
  };
}

const dayNum = (v) => {
  if (v === undefined || v === null) return null;
  const m = String(v).trim().match(/^P?(\d+)$/);
  return m ? Number(m[1]) : null;
};

// Gates and loop dependencies are lists everywhere. `gated_by: G2` was a scalar
// until 2026-08-16, which is why Loop-E could not say "G1 and G2" and ended up
// claiming that a commercial scope sign-off authorised processing customer
// personal data. Accepts a scalar, a YAML flow list, null, or an array.
const toList = (v) => {
  if (v === undefined || v === null || v === 'null' || v === '') return [];
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== '');
  const s = String(v).trim();
  if (s === '[]' || s === 'none' || s === 'null') return [];
  if (s.startsWith('[') && s.endsWith(']'))
    return s.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return [s];
};

const sameSet = (a, b) => {
  const A = [...new Set(a)].sort();
  const B = [...new Set(b)].sort();
  return A.length === B.length && A.every((x, i) => x === B[i]);
};

// ---------------------------------------------------------------------------
// Load the source of truth
// ---------------------------------------------------------------------------
const planPath = join(GRAPH, 'plan.json');
let plan;
try {
  plan = JSON.parse(read(planPath));
} catch (e) {
  fatal(`cannot read/parse ${rel(planPath)} — ${e.message}`);
}

const requiredPlanObjects = [
  'pilot', 'gates', 'data_classes', 'loops', 'market_scope', 'claim_policy',
  'measurement_definitions', 'data_retention',
];
const missingPlanObjects = requiredPlanObjects.filter(
  (key) => !plan || typeof plan[key] !== 'object' || plan[key] === null || Array.isArray(plan[key]),
);
if (missingPlanObjects.length) {
  fatal(`graph/plan.json is missing required object(s): ${missingPlanObjects.join(', ')}`);
}
if (!Array.isArray(plan.milestones)) {
  fatal('graph/plan.json must define milestones as an array');
}

const exitConditionsPath = join(GRAPH, 'exit-conditions.json');
let exitConditions;
try {
  exitConditions = JSON.parse(read(exitConditionsPath));
  if (!exitConditions || typeof exitConditions !== 'object' || Array.isArray(exitConditions))
    throw new Error('top-level value must be an object');
} catch (e) {
  fatal(`cannot read/parse ${rel(exitConditionsPath)}: ${e.message}`);
}

const LOOP_FILES = {
  loop_a: 'loop-a-interviews.yaml',
  loop_b: 'loop-b-legal.yaml',
  loop_c: 'loop-c-photo-listing.yaml',
  loop_d: 'loop-d-repeat-sellers.yaml',
  loop_e: 'loop-e-synthesis.yaml',
};
const REQUIRED_GATE_EVIDENCE = {
  G1: ['lawful_basis_per_purpose', 'kyc_aml_reuse_decision', 'dpia_screening', 'retention_and_deletion', 'approved_outreach_text', 'permitted_external_sources', 'all_planned_purposes_permitted'],
  G2: ['signed_pilot_legal_checklist', 'named_approver', 'open_constraints_recorded'],
  G3: ['cto_review', 'legal_review'],
};

const loopYaml = {};
for (const [id, file] of Object.entries(LOOP_FILES)) {
  const parsed = readLoopYaml(join(GRAPH, file));
  if (parsed) loopYaml[id] = parsed;
}

const run = (id) => !only || only.toUpperCase() === id;

// ===========================================================================
// C1 — SEQUENCING
//
// The defect: in v1.0 `loop_d.query_paysera_transactions` started on day 3 with
// `dependencies: none`, and outreach to real customers began on day 8, while the
// legal sign-off was scheduled for day 14. INDEX.md said "Dependencies: None
// between loops". In a licensed institution that is processing personal data
// ahead of its lawful basis.
//
// The rule: any agent whose data_class is not "none" must sit behind a gate,
// and must start strictly after that gate closes.
// ===========================================================================
if (run('C1')) {
  const gates = plan.gates || {};
  const requiresLawfulBasis = new Set(['public_personal', 'customer_personal', 'customer_special']);

  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    const file = LOOP_FILES[loopId] || loopId;

    for (const agent of loop.agents || []) {
      if (agent.data_class === 'customer_special') {
        error('C1', 'graph/plan.json', 0,
          `Agent ${loopId}.${agent.id} uses forbidden customer_special data`,
          'This graph forbids AML/KYC, identity-verification, dispute data, and decisions derived from them for recruitment. G1 cannot waive that binary requirement.');
      }
      if (agent.data_class === 'internal_business_contact' && loopId !== 'loop_b') {
        error('C1', 'graph/plan.json', 0,
          `Agent ${loopId}.${agent.id} uses internal_business_contact outside the gate-owner legal loop`,
          'This narrow class exists only so Legal/DPO reviewers can create G1/G2. It is not a general way around G1.');
      }
      const touchesPeople = requiresLawfulBasis.has(agent.data_class);
      if (!touchesPeople) continue;

      const gateIds = toList(loop.gated_by);
      if (!gateIds.length) {
        error('C1', `graph/plan.json`, 0,
          `Agent ${loopId}.${agent.id} handles ${agent.data_class} but its loop declares no gate`,
          'Every agent touching a natural person must be gated on a written lawful-basis decision.');
        continue;
      }

      // A LAWFUL-BASIS gate specifically, not just any gate. Loop-E used to
      // declare G2 (pilot scope sign-off) alone while three of its agents
      // processed customer personal data. This check asked only "is there a
      // gate", so a commercial approval satisfied it.
      const LAWFUL_BASIS_GATE = 'G1';
      if (!gateIds.includes(LAWFUL_BASIS_GATE)) {
        error('C1', 'graph/plan.json', 0,
          `${loopId}.${agent.id} handles ${agent.data_class} but its loop is not gated on ${LAWFUL_BASIS_GATE} (declares: ${gateIds.join(', ') || 'none'})`,
          `Only ${LAWFUL_BASIS_GATE} is a lawful basis for processing a natural person's data. A scope or commercial sign-off is not a substitute.`);
      }

      for (const gateId of gateIds) {
        const gate = Object.hasOwn(gates, gateId) ? gates[gateId] : null;
        if (!gate) {
          error('C1', 'graph/plan.json', 0, `Loop ${loopId} references unknown gate ${gateId}`);
          continue;
        }

        if (agent.start_day <= gate.closes_end_of_day) {
          error('C1', 'graph/plan.json', 0,
            `${loopId}.${agent.id} starts P${agent.start_day} but gate ${gateId} only closes end of P${gate.closes_end_of_day}`,
            `${agent.data_class} processing must begin after the gate, not on or before it.`);
        }

        if (!(gate.blocks_agents || []).includes(`${loopId}.${agent.id}`)) {
          error('C1', 'graph/plan.json', 0,
            `${loopId}.${agent.id} is gated by ${gateId} but is not listed in ${gateId}.blocks_agents`,
            'The gate must know what it blocks, or the block is unenforceable.');
        }
      }

      // The YAML the human actually reads must repeat the gates — and repeat
      // the RIGHT ones. This used to be a truthiness test, so `requires_gate:
      // G1` on a G2-gated agent passed.
      const y = loopYaml[loopId];
      const ya = y && y.agents.find((a) => a.name === agent.id);
      if (ya) {
        const yamlGates = toList(ya.requires_gate);
        if (!yamlGates.length) {
          error('C1', `graph/${file}`, ya._line,
            `Agent ${agent.id} handles ${agent.data_class} but the YAML does not declare requires_gate: [${gateIds.join(', ')}]`,
            'The person executing the loop reads the YAML, not plan.json.');
        } else if (!sameSet(yamlGates, gateIds)) {
          error('C1', `graph/${file}`, ya._line,
            `Agent ${agent.id} declares requires_gate: [${yamlGates.join(', ')}] but plan.json gates its loop on [${gateIds.join(', ')}]`,
            'A YAML naming the wrong gate is worse than one naming none: it reads as a deliberate, checked decision.');
        }
      }
    }
  }

  // No gate may be describable as skippable.
  for (const f of walk(GRAPH).concat([join(ROOT, 'GRAPH-SETUP.md')])) {
    if (!/\.(md|ya?ml|json)$/.test(f)) continue;
    const src = read(f);
    if (!src) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*(#|\/\/|>)/.test(line)) return;
      if (/v1\.0/.test(line)) return; // lines describing the old behaviour
      // Skip prohibitions. "There is no proceed-pending-approval path" states the
      // rule; matching it would make the validator fail on its own enforcement.
      if (/\b(no|not|never|nėra|nera|neturi|draudžiam|draudziam|no_bypass)\b/i.test(line)) return;
      const skippableSignoff =
        /(proceed|tęsiam|tesiam|continue)[^.\n]{0,60}(pending\s+(final\s+)?(legal|approval|sign)|be\s+patvirtinimo|laukdami\s+pritarimo)/i.test(line);
      const optionalLegal = /legal[^.\n]{0,40}\(optional/i.test(line) || /optional[^.\n]{0,30}legal review/i.test(line);
      if (skippableSignoff) {
        error('C1', rel(f), i + 1, 'Escalation path allows proceeding without legal sign-off', line.trim());
      }
      if (optionalLegal) {
        error('C1', rel(f), i + 1, 'Legal review marked optional', line.trim());
      }
    });
  }

  const bypassPatterns = [
    {
      re: /G2\s+NEU\S*DAROMAS[\s\S]{0,200}Loop-E\s+vis\s+tiek/iu,
      message: 'G2 text says Loop-E proceeds while the gate is open',
    },
    {
      re: /G2\s+u\S*darytas\s+arba\s+atviri/iu,
      message: 'Loop-E accepts open items as a substitute for closing G2',
    },
  ];
  for (const file of Object.values(LOOP_FILES)) {
    const src = read(join(GRAPH, file)) || '';
    for (const { re, message } of bypassPatterns) {
      const match = re.exec(src);
      if (!match) continue;
      const line = src.slice(0, match.index).split(/\r?\n/).length;
      error('C1', `graph/${file}`, line, message,
        'G2 is a blocking gate. A later date or narrower scope is allowed; continuing Loop-E is not.');
    }
  }
}

// ===========================================================================
// C2 — CROSS-DOCUMENT DRIFT
//
// The defect: v1.0 had README.md, INDEX.md, exit-conditions.json, GRAPH-SETUP.md
// and five YAML files each carrying their own copy of the days, agent names and
// thresholds. They disagreed — README called Loop-A's agents
// `schedule_call`/`extract_insights` (3 agents) while the YAML had 4 with
// different names; Loop-C's warning threshold was DAY 15 in one file and DAY 10
// in another; every loop had a "deadline" of DAY 14 and a "fail threshold" of
// DAY 15 or 16, after the loop that depended on them had already started.
// ===========================================================================
if (run('C2')) {
  const expectedLoopIds = Object.keys(LOOP_FILES);
  const planLoopIds = Object.keys(plan.loops || {});
  for (const loopId of expectedLoopIds) {
    if (!planLoopIds.includes(loopId))
      error('C2', 'graph/plan.json', 0, `Missing required loop "${loopId}"`);
  }
  for (const loopId of planLoopIds) {
    if (!expectedLoopIds.includes(loopId))
      error('C2', 'graph/plan.json', 0, `Loop "${loopId}" has no mapped YAML file`);
  }

  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    const y = loopYaml[loopId];
    if (!LOOP_FILES[loopId]) continue;
    if (!y) {
      error('C2', `graph/${LOOP_FILES[loopId]}`, 0, 'Loop YAML file is missing');
      continue;
    }
    const file = `graph/${LOOP_FILES[loopId]}`;

    const expectedYamlLoop = loopId.slice('loop_'.length).toUpperCase();
    if ((y.top.loop || null) !== expectedYamlLoop)
      error('C2', file, 0, `Loop id is "${y.top.loop || null}" in YAML, expected "${expectedYamlLoop}"`);
    if ((y.top.name || null) !== (loop.name || null))
      error('C2', file, 0, `Loop name is "${y.top.name || null}" in YAML, plan.json says "${loop.name || null}"`);

    const planNames = (loop.agents || []).map((a) => a.id);
    const yamlNames = y.agents.map((a) => a.name);

    for (const duplicate of y.duplicateAgentFields) {
      error('C2', file, duplicate.line,
        `YAML agent ${duplicate.agent} declares "${duplicate.field}" more than once`,
        'Duplicate YAML keys are parser-dependent. The validator cannot safely choose which value an executor will use.');
    }
    for (const duplicate of y.duplicateMetrics) {
      error('C2', file, duplicate.line,
        `YAML exit_conditions declares metric "${duplicate.metric}" more than once`);
    }
    for (const name of new Set(yamlNames)) {
      if (yamlNames.filter((n) => n === name).length > 1)
        error('C2', file, 0, `YAML defines agent "${name}" more than once`);
    }

    for (const n of planNames)
      if (!yamlNames.includes(n))
        error('C2', file, 0, `plan.json defines agent "${n}" which is missing from the YAML`);
    for (const n of yamlNames)
      if (!planNames.includes(n))
        error('C2', file, 0, `YAML defines agent "${n}" which is not in plan.json`);

    for (const agent of loop.agents || []) {
      const ya = y.agents.find((a) => a.name === agent.id);
      if (!ya) continue;
      const s = dayNum(ya.start_day);
      const e = dayNum(ya.end_day);
      if (s === null)
        error('C2', file, ya._line, `${agent.id} has no valid YAML start_day (expected P${agent.start_day})`);
      else if (s !== agent.start_day)
        error('C2', file, ya._line, `${agent.id} start_day is P${s} in YAML, P${agent.start_day} in plan.json`);
      if (e === null)
        error('C2', file, ya._line, `${agent.id} has no valid YAML end_day (expected P${agent.end_day})`);
      else if (e !== agent.end_day)
        error('C2', file, ya._line, `${agent.id} end_day is P${e} in YAML, P${agent.end_day} in plan.json`);

      if ((ya.data_class || null) !== (agent.data_class || null))
        error('C2', file, ya._line,
          `${agent.id} data_class is "${ya.data_class || null}" in YAML, "${agent.data_class || null}" in plan.json`);
      if (!sameSet(toList(ya.depends_on), toList(agent.depends_on)))
        error('C2', file, ya._line,
          `${agent.id} depends_on is [${toList(ya.depends_on).join(', ')}] in YAML, [${toList(agent.depends_on).join(', ')}] in plan.json`);
      if ((ya.closes_gate || null) !== (agent.closes_gate || null))
        error('C2', file, ya._line,
          `${agent.id} closes_gate is "${ya.closes_gate || null}" in YAML, "${agent.closes_gate || null}" in plan.json`);

      const yamlGates = toList(ya.requires_gate);
      const planGates = toList(loop.gated_by);
      if (!sameSet(yamlGates, planGates))
        error('C2', file, ya._line,
          `${agent.id} requires_gate is [${yamlGates.join(', ')}] in YAML, [${planGates.join(', ')}] in plan.json`);
    }

    const ys = dayNum(y.top.start_day);
    const ye = dayNum(y.top.end_day);
    if (ys === null)
      error('C2', file, 0, `Loop has no valid YAML start_day (expected P${loop.start_day})`);
    else if (ys !== loop.start_day)
      error('C2', file, 0, `Loop start_day is P${ys} in YAML, P${loop.start_day} in plan.json`);
    if (ye === null)
      error('C2', file, 0, `Loop has no valid YAML end_day (expected P${loop.end_day})`);
    else if (ye !== loop.end_day)
      error('C2', file, 0, `Loop end_day is P${ye} in YAML, P${loop.end_day} in plan.json`);

    const yGates = toList(y.top.gated_by);
    const planGates = toList(loop.gated_by);
    if (!sameSet(yGates, planGates))
      error('C2', file, 0,
        `Loop gates are [${yGates.join(', ')}] in YAML, [${planGates.join(', ')}] in plan.json`);

    const yDeps = toList(y.top.depends_on_loops);
    const planDeps = toList(loop.depends_on_loops);
    if (!sameSet(yDeps, planDeps))
      error('C2', file, 0,
        `Loop depends_on_loops is [${yDeps.join(', ')}] in YAML, [${planDeps.join(', ')}] in plan.json`);

    // Incentives are duplicated into the YAML input block and quoted again in
    // the prompt body and in Loop-B's G1 questionnaire. Any change to one needs
    // re-approval under G1, so a silent drift here is a compliance drift.
    if (loop.incentive_eur !== undefined) {
      const src = read(join(GRAPH, LOOP_FILES[loopId])) || '';
      src.split(/\r?\n/).forEach((line, i) => {
        const m = line.match(/^\s*incentive_eur:\s*(\d+)/);
        if (m && Number(m[1]) !== loop.incentive_eur)
          error('C2', file, i + 1,
            `incentive_eur is ${m[1]} in the YAML, ${loop.incentive_eur} in plan.json`,
            'Incentive amounts are approved under G1. A drifted copy is an unapproved amount.');
      });
    }
  }

  const interviewIncentive = plan.loops?.loop_a?.incentive_eur;
  const cohortIncentive = plan.loops?.loop_d?.incentive_eur;
  const incentiveCopies = [
    {
      file: 'loop-a-interviews.yaml',
      expected: interviewIncentive,
      label: 'interview outreach text',
      re: /atsilyginame\s+(\d+)\s*EUR/gi,
    },
    {
      file: 'loop-b-legal.yaml',
      expected: interviewIncentive,
      label: 'G1 interview incentive questionnaire',
      re: /(\d+)\s*EUR\s+pokalbiams/gi,
    },
    {
      file: 'loop-b-legal.yaml',
      expected: interviewIncentive,
      label: 'approved_incentives_eur.interviews',
      re: /approved_incentives_eur:\s*\{[^}\n]*interviews:\s*(\d+)/gi,
    },
    {
      file: 'loop-b-legal.yaml',
      expected: cohortIncentive,
      label: 'G1 cohort incentive questionnaire',
      re: /(\d+)\s*EUR\s+kohortai/gi,
    },
    {
      file: 'loop-b-legal.yaml',
      expected: cohortIncentive,
      label: 'approved_incentives_eur.cohort',
      re: /approved_incentives_eur:\s*\{[^}\n]*cohort:\s*(\d+)/gi,
    },
    {
      file: 'loop-d-repeat-sellers.yaml',
      expected: cohortIncentive,
      label: 'cohort cashback text',
      re: /(\d+)\s*EUR\s+cashback/gi,
    },
    {
      file: 'loop-d-repeat-sellers.yaml',
      expected: cohortIncentive,
      label: 'cohort outreach text',
      re: /SKATINIMAS:\s*(\d+)\s*EUR/gi,
    },
  ];
  for (const copy of incentiveCopies) {
    const src = read(join(GRAPH, copy.file)) || '';
    const matches = [...src.matchAll(copy.re)];
    if (matches.length !== 1)
      error('C2', `graph/${copy.file}`, 0,
        `${copy.label} must appear exactly once; found ${matches.length}`,
        'Removing an approved incentive copy is drift too; every executable prompt must retain the approved amount.');
    for (const match of matches) {
      if (Number(match[1]) !== copy.expected) {
        const line = src.slice(0, match.index).split(/\r?\n/).length;
        error('C2', `graph/${copy.file}`, line,
          `${copy.label} is ${match[1]} EUR, plan.json says ${copy.expected} EUR`,
          'All approved incentive copies must change together and be re-approved under G1.');
      }
    }
  }

  // exit-conditions.json must mirror plan.json exactly.
  const ec = exitConditions;
  {
    for (const field of [
      'name', 'category', 'market', 'prep_window_days', 'live_pilot_days',
      'prep_start_date', 'live_start_date', 'status',
    ]) {
      if (ec.pilot?.[field] !== plan.pilot?.[field])
        error('C2', 'graph/exit-conditions.json', 0,
          `pilot.${field} is ${JSON.stringify(ec.pilot?.[field])}, plan.json says ${JSON.stringify(plan.pilot?.[field])}`);
    }

    for (const [loopId, loop] of Object.entries(plan.loops || {})) {
      const t = ec[loopId];
      if (!t) {
        error('C2', 'graph/exit-conditions.json', 0, `Missing tracking block for ${loopId}`);
        continue;
      }
      if (t.start_day !== loop.start_day || t.end_day !== loop.end_day)
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId} window is P${t.start_day}–P${t.end_day}, plan.json says P${loop.start_day}–P${loop.end_day}`);
      if (!sameSet(toList(t.gated_by), toList(loop.gated_by)))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId} gates are [${toList(t.gated_by).join(', ')}], plan.json says [${toList(loop.gated_by).join(', ')}]`);
      if (!sameSet(toList(t.depends_on_loops), toList(loop.depends_on_loops)))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId} depends_on_loops is [${toList(t.depends_on_loops).join(', ')}], plan.json says [${toList(loop.depends_on_loops).join(', ')}]`);
      if ((t.name || null) !== (loop.name || null))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId}.name is "${t.name || null}", plan.json says "${loop.name || null}"`);
      if ((t.incentive_eur ?? null) !== (loop.incentive_eur ?? null))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId}.incentive_eur is ${JSON.stringify(t.incentive_eur)}, plan.json says ${JSON.stringify(loop.incentive_eur)}`);
      if (!sameSet(toList(t.outputs), toList(loop.outputs)))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId}.outputs drift from plan.json`);

      for (const agent of loop.agents || []) {
        const a = (t.agents || {})[agent.id];
        if (!a) {
          error('C2', 'graph/exit-conditions.json', 0, `${loopId} missing agent ${agent.id}`);
          continue;
        }
        if (a.start_day !== agent.start_day || a.end_day !== agent.end_day)
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${agent.id} window P${a.start_day}–P${a.end_day} != plan.json P${agent.start_day}–P${agent.end_day}`);
        if ((a.closes_gate || null) !== (agent.closes_gate || null))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${agent.id} closes_gate is "${a.closes_gate || null}", plan.json says "${agent.closes_gate || null}"`);
      }

      const planMetrics = Object.keys(loop.thresholds || {}).filter((k) => !k.startsWith('$'));
      const ecMetrics = Object.keys(t.metrics || {}).filter((k) => !k.startsWith('$'));

      for (const metric of planMetrics) {
        const th = loop.thresholds[metric];
        const m = (t.metrics || {})[metric];
        if (!m) {
          error('C2', 'graph/exit-conditions.json', 0, `${loopId} missing metric "${metric}"`);
          continue;
        }
        if ((m.direction || null) !== (th.direction || null))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${metric}.direction is "${m.direction}", plan.json says "${th.direction}"`,
            'Direction decides whether the fail threshold is a floor or a ceiling. The two files may not disagree about it.');
        for (const field of ['definition', 'required_for_target']) {
          if ((m[field] ?? null) !== (th[field] ?? null))
            error('C2', 'graph/exit-conditions.json', 0,
              `${loopId}.${metric}.${field} is ${JSON.stringify(m[field])}, plan.json says ${JSON.stringify(th[field])}`);
        }
        for (const level of ['minimum', 'maximum', 'target', 'stretch']) {
          if (th[level] === undefined && m[level] === undefined) continue;
          if (m[level] !== th[level])
            error('C2', 'graph/exit-conditions.json', 0,
              `${loopId}.${metric}.${level} is ${m[level]}, plan.json says ${th[level]}`);
        }
      }

      // The reverse direction. Until 2026-08-16 this check ran one way only, so
      // exit-conditions.json carried four metrics that plan.json had never heard
      // of — including loop_c.hallucination_rate_pct, which the YAML calls the
      // most important safety indicator and which was therefore unconstrained by
      // the source of truth.
      for (const metric of ecMetrics) {
        if (!planMetrics.includes(metric))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId} tracks metric "${metric}" which plan.json does not define`,
            'exit-conditions.json is derived from plan.json. A metric that exists only here is unconstrained by the source of truth.');
      }

      // And the YAML exit_conditions block, which was never compared to anything
      // at all — the reason Loop-C had three different metric sets in three files.
      const yamlMetricMap = loopYaml[loopId]?.exitMetrics || {};
      const yamlMetrics = Object.keys(yamlMetricMap);
      for (const metric of yamlMetrics) {
        if (!planMetrics.includes(metric))
          error('C2', `graph/${LOOP_FILES[loopId]}`, 0,
            `YAML exit_conditions lists metric "${metric}" which plan.json does not define`);
      }
      for (const metric of planMetrics) {
        if (!yamlMetrics.includes(metric))
          error('C2', `graph/${LOOP_FILES[loopId]}`, 0,
            `plan.json defines metric "${metric}" which the YAML exit_conditions does not list`);
      }

      for (const metric of planMetrics) {
        const th = loop.thresholds[metric];
        const ym = yamlMetricMap[metric];
        if (!ym) continue;
        const inferredDirection = ym.direction ||
          (typeof ym.minimum === 'number' && ym.maximum === undefined ? 'higher_better' : null);
        if (inferredDirection !== (th.direction || null))
          error('C2', `graph/${LOOP_FILES[loopId]}`, ym._line,
            `${metric}.direction is "${inferredDirection}", plan.json says "${th.direction || null}"`);
        for (const level of ['minimum', 'maximum', 'target', 'stretch']) {
          const planValue = th[level];
          const yamlValue = ym[level];
          if (typeof planValue === 'number' && yamlValue !== planValue)
            error('C2', `graph/${LOOP_FILES[loopId]}`, ym._line,
              `${metric}.${level} is ${yamlValue} in YAML, ${planValue} in plan.json`);
          else if (planValue === undefined && typeof yamlValue === 'number')
            error('C2', `graph/${LOOP_FILES[loopId]}`, ym._line,
              `${metric}.${level} is ${yamlValue} in YAML but plan.json defines no numeric ${level}`);
        }
      }

      const planRequirements = Object.keys(loop.binary_requirements || {}).filter((k) => !k.startsWith('$'));
      const trackedRequirements = Object.keys(t.binary_requirements || {}).filter((k) => !k.startsWith('$'));
      const yamlRequirements = (loopYaml[loopId]?.binaryRequirements || []).map((r) => r.id);
      for (const id of new Set(yamlRequirements)) {
        if (yamlRequirements.filter((candidate) => candidate === id).length > 1)
          error('C2', `graph/${LOOP_FILES[loopId]}`, 0,
            `YAML binary_requirements defines "${id}" more than once`);
      }
      for (const [source, ids] of [
        ['exit-conditions.json', trackedRequirements],
        ['YAML binary_requirements', yamlRequirements],
      ]) {
        for (const id of planRequirements) {
          if (!ids.includes(id))
            error('C2', source === 'exit-conditions.json' ? 'graph/exit-conditions.json' : `graph/${LOOP_FILES[loopId]}`, 0,
              `${loopId} ${source} is missing binary requirement "${id}" from plan.json`);
        }
        for (const id of ids) {
          if (!planRequirements.includes(id))
            error('C2', source === 'exit-conditions.json' ? 'graph/exit-conditions.json' : `graph/${LOOP_FILES[loopId]}`, 0,
              `${loopId} ${source} defines binary requirement "${id}" which plan.json does not define`);
        }
      }
      for (const id of planRequirements) {
        const tracked = t.binary_requirements?.[id];
        const yaml = (loopYaml[loopId]?.binaryRequirements || []).find((item) => item.id === id);
        if (tracked && tracked.substitute_allowed !== false)
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${id}.substitute_allowed must be false`);
        if (yaml && yaml.substitute_allowed !== false)
          error('C2', `graph/${LOOP_FILES[loopId]}`, yaml._line,
            `${loopId}.${id}.substitute_allowed must be false in YAML`);
      }
    }

    const trackedLoopIds = Object.keys(ec).filter((id) => /^loop_/.test(id));
    for (const loopId of trackedLoopIds) {
      if (!Object.hasOwn(plan.loops, loopId))
        error('C2', 'graph/exit-conditions.json', 0,
          `Tracks loop ${loopId} which plan.json does not define`);
    }

    for (const [loopId, loop] of Object.entries(plan.loops || {})) {
      const trackedAgents = Object.keys(ec[loopId]?.agents || {});
      const planAgents = (loop.agents || []).map((agent) => agent.id);
      for (const agentId of trackedAgents) {
        if (!planAgents.includes(agentId))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId} tracks agent ${agentId} which plan.json does not define`);
      }
    }

    const executionStatuses = new Set([
      'not_started', 'blocked_by_gate', 'in_progress', 'complete', 'below_target', 'failed', 'cancelled_by_gate',
    ]);
    const startedStatuses = new Set(['in_progress', 'complete', 'below_target', 'failed']);
    const dependencyReadyStatuses = new Set(['complete', 'below_target', 'failed']);
    const completedLoopStatuses = new Set(['complete', 'below_target']);
    const metricStatuses = new Set(['not_started', 'in_progress', 'met', 'below_target', 'failed']);
    const metricOutcome = (threshold, tracked) => {
      const direction = threshold?.direction;
      const current = tracked?.current;
      if (direction === 'informational') return { relevant: false, valid: true };
      if (direction === 'binary')
        return { relevant: true, valid: current === null || typeof current === 'boolean', accepted: current === true, target: current === true, known: typeof current === 'boolean' };
      const valid = current === null || (typeof current === 'number' && Number.isFinite(current));
      if (!valid || current === null) return { relevant: true, valid, accepted: false, target: false, known: false };
      if (direction === 'higher_better')
        return { relevant: true, valid, accepted: current >= threshold.minimum, target: threshold.target === undefined || current >= threshold.target, known: true };
      if (direction === 'lower_better')
        return { relevant: true, valid, accepted: current <= threshold.maximum, target: threshold.target === undefined || current <= threshold.target, known: true };
      return { relevant: true, valid: false, accepted: false, target: false, known: false };
    };
    for (const [loopId, loop] of Object.entries(plan.loops || {})) {
      const trackedLoop = ec[loopId];
      if (!executionStatuses.has(trackedLoop?.status))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId}.status is missing or invalid: ${JSON.stringify(trackedLoop?.status)}`);

      for (const agent of loop.agents || []) {
        const trackedAgent = trackedLoop?.agents?.[agent.id];
        if (!executionStatuses.has(trackedAgent?.status))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${agent.id}.status is missing or invalid: ${JSON.stringify(trackedAgent?.status)}`);
        if (startedStatuses.has(trackedAgent?.status)) {
          for (const dependency of agent.depends_on || []) {
            const dependencyStatus = trackedLoop?.agents?.[dependency]?.status;
            if (dependencyStatus !== 'complete')
              error('C2', 'graph/exit-conditions.json', 0,
                `${loopId}.${agent.id} is ${trackedAgent.status} while dependency ${dependency} is ${dependencyStatus}`);
          }
        }
      }

      if (startedStatuses.has(trackedLoop?.status)) {
        for (const dependency of toList(loop.depends_on_loops)) {
          if (!dependencyReadyStatuses.has(ec[dependency]?.status))
            error('C2', 'graph/exit-conditions.json', 0,
              `${loopId} is ${trackedLoop.status} while dependency ${dependency} is ${ec[dependency]?.status}`);
        }
      }
      if (completedLoopStatuses.has(trackedLoop?.status)) {
        for (const agent of loop.agents || []) {
          if (trackedLoop.agents?.[agent.id]?.status !== 'complete')
            error('C2', 'graph/exit-conditions.json', 0,
              `${loopId} is complete while agent ${agent.id} is ${trackedLoop.agents?.[agent.id]?.status}`);
        }
      }

      const outcomes = [];
      for (const [metric, threshold] of Object.entries(loop.thresholds || {})) {
        if (metric.startsWith('$')) continue;
        const trackedMetric = trackedLoop?.metrics?.[metric];
        const outcome = metricOutcome(threshold, trackedMetric);
        if (!outcome.valid)
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${metric}.current has the wrong type for direction ${threshold.direction}: ${JSON.stringify(trackedMetric?.current)}`);
        if (trackedMetric?.status !== undefined && !metricStatuses.has(trackedMetric.status))
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId}.${metric}.status is invalid: ${JSON.stringify(trackedMetric.status)}`);
        if (outcome.relevant) outcomes.push({ metric, ...outcome });
      }
      const requirements = Object.keys(loop.binary_requirements || {}).filter((id) => !id.startsWith('$'));
      const requirementsMet = requirements.every((id) => trackedLoop?.binary_requirements?.[id]?.met === true);
      const requirementsFailed = requirements.some((id) => trackedLoop?.binary_requirements?.[id]?.met === false);
      if (trackedLoop?.status === 'complete' &&
          (!outcomes.every((outcome) => outcome.known && outcome.target) || !requirementsMet))
        error('C2', 'graph/exit-conditions.json', 0,
          `${loopId} is complete but its target metrics or binary requirements are not all met`);
      if (trackedLoop?.status === 'below_target') {
        const allAccepted = outcomes.every((outcome) => outcome.known && outcome.accepted);
        const anyBelowTarget = outcomes.some((outcome) => !outcome.target);
        if (!allAccepted || !anyBelowTarget || !requirementsMet)
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId} is below_target without complete evidence above every fail boundary and below at least one target`);
      }
      if (trackedLoop?.status === 'failed') {
        const hasFailureEvidence = outcomes.some((outcome) => outcome.known && !outcome.accepted) || requirementsFailed;
        if (!hasFailureEvidence)
          error('C2', 'graph/exit-conditions.json', 0,
            `${loopId} is failed but no metric crosses a fail boundary and no binary requirement is false`);
        for (const agent of loop.agents || []) {
          if (!['complete', 'failed'].includes(trackedLoop.agents?.[agent.id]?.status))
            error('C2', 'graph/exit-conditions.json', 0,
              `${loopId} is failed while agent ${agent.id} is not terminal`);
        }
      }
    }

    const incompleteEvidence = (value, path = '', out = []) => {
      if (value === false || value === null || value === '') {
        out.push(path || '<root>');
        return out;
      }
      if (Array.isArray(value)) {
        if (!value.length) out.push(path || '<root>');
        value.forEach((child, index) => incompleteEvidence(child, `${path}[${index}]`, out));
        return out;
      }
      if (!value || typeof value !== 'object') return out;
      const entries = Object.entries(value).filter(([key]) => !key.startsWith('$') && key !== 'substitute_allowed');
      if (!entries.length) out.push(path || '<root>');
      for (const [key, child] of entries) {
        const childPath = path ? `${path}.${key}` : key;
        incompleteEvidence(child, childPath, out);
      }
      return out;
    };

    for (const [gid, gate] of Object.entries(plan.gates || {})) {
      const g = (ec.gates || {})[gid];
      if (!g) {
        error('C2', 'graph/exit-conditions.json', 0, `Missing gate ${gid}`);
        continue;
      }
      if (g.closes_end_of_day !== gate.closes_end_of_day)
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid} closes P${g.closes_end_of_day}, plan.json says P${gate.closes_end_of_day}`);
      if ((g.name || null) !== (gate.name || null))
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.name is "${g.name || null}", plan.json says "${gate.name || null}"`);
      const expectedOwner = gate.owner_loop && gate.satisfied_by_agent
        ? `${gate.owner_loop}.${gate.satisfied_by_agent}` : null;
      if (expectedOwner && (g.owner || null) !== expectedOwner)
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.owner is "${g.owner || null}", plan.json implies "${expectedOwner}"`);
      if (!expectedOwner && gate.satisfied_by && !g.owner)
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid} is a human-owned gate but exit-conditions.json has no owner`);
      if (!sameSet(toList(g.blocks), toList(gate.blocks)))
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.blocks is [${toList(g.blocks).join(', ')}], plan.json says [${toList(gate.blocks).join(', ')}]`);

      const expectedEvidence = toList(gate.evidence_keys);
      const trackedEvidence = g.deliverables_received && typeof g.deliverables_received === 'object' && !Array.isArray(g.deliverables_received)
        ? Object.keys(g.deliverables_received).filter((key) => !key.startsWith('$'))
        : [];
      if (!sameSet(expectedEvidence, trackedEvidence))
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.deliverables_received keys are [${trackedEvidence.join(', ')}], plan.json requires [${expectedEvidence.join(', ')}]`,
          'Gate evidence must identify every approved deliverable; an arbitrary true flag cannot close a gate.');

      if (!['pending', 'closed'].includes(g.status))
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.status is "${g.status}"; expected "pending" or "closed"`);
      if (g.status === 'closed') {
        if (!g.decided_by || !g.decided_at)
          error('C2', 'graph/exit-conditions.json', 0,
            `${gid} is closed without decided_by and decided_at`,
            'A gate closes only through a named, timestamped written decision.');
        if (expectedEvidence.length &&
            (!g.deliverables_received || typeof g.deliverables_received !== 'object'))
          error('C2', 'graph/exit-conditions.json', 0,
            `${gid} is closed without a deliverables_received evidence object`);
        const incomplete = incompleteEvidence(g.deliverables_received);
        if (incomplete.length)
          error('C2', 'graph/exit-conditions.json', 0,
            `${gid} is closed while required evidence is incomplete`,
            incomplete.join(', '));
      }

      // ---------------------------------------------------------------------
      // THIS CHECK USED TO BE DEAD CODE.
      //
      // It read `gate.blocks_loops` off the **plan.json** gate objects, which
      // define `blocks_agents` and have never had a `blocks_loops` key. The
      // array was empty on every run, so the loop body performed zero
      // comparisons — while INDEX.md told the reader "The validator enforces
      // this". exit-conditions.json could have marked Loop-D `in_progress`
      // with G1 still `pending` and the validator would have exited 0.
      //
      // The blocked loops are now DERIVED from blocks_agents, which is the
      // list C1 already enforces, and the derived set is cross-checked against
      // the blocks_loops declared in both files. Deriving rather than trusting
      // is the point: a hand-maintained second list is what went stale.
      // ---------------------------------------------------------------------
      const derived = [
        ...new Set((gate.blocks_agents || [])
          .map((ref) => String(ref).split('.')[0])
          .filter((l) => Object.hasOwn(plan.loops, l))),
      ];

      if (!sameSet(derived, toList(gate.blocks_loops)))
        error('C2', 'graph/plan.json', 0,
          `${gid}.blocks_loops is [${toList(gate.blocks_loops).join(', ')}] but blocks_agents implies [${derived.join(', ')}]`,
          'The two lists describe the same block and must agree.');

      if (!sameSet(derived, toList(g.blocks_loops)))
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid}.blocks_loops is [${toList(g.blocks_loops).join(', ')}], plan.json blocks_agents implies [${derived.join(', ')}]`);

      // A gated loop may not be tracked as running while its gate is open.
      if (g.status !== 'closed') {
        for (const loopId of derived) {
          const st = (ec[loopId] || {}).status;
          if (st && st !== 'blocked_by_gate')
            error('C2', 'graph/exit-conditions.json', 0,
              `${gid} is "${g.status}" but ${loopId} status is "${st}"`,
              'While a gate is open, everything it blocks must read blocked_by_gate.');
        }
        for (const ref of gate.blocks_agents || []) {
          const [loopId, agentId] = String(ref).split('.');
          const st = ec[loopId]?.agents?.[agentId]?.status;
          if (st !== 'blocked_by_gate')
            error('C2', 'graph/exit-conditions.json', 0,
              `${gid} is "${g.status}" but ${ref} status is "${st}"`,
              'An open gate blocks the executable agent, not only the loop summary row.');
        }
        for (const milestoneId of toList(gate.blocks)) {
          const milestone = (ec.milestones || []).find((item) => item.id === milestoneId);
          if (milestone?.done)
            error('C2', 'graph/exit-conditions.json', 0,
              `${gid} is "${g.status}" but blocked milestone ${milestoneId} is marked done`);
        }
      }
    }

    // Every gate in plan.json must be tracked, and no gate may be invented here.
    for (const gid of Object.keys(ec.gates || {}))
      if (!Object.hasOwn(plan.gates, gid))
        error('C2', 'graph/exit-conditions.json', 0, `Tracks gate ${gid} which plan.json does not define`);

    // Milestones are executable graph nodes too, not decorative prose.
    const planMilestones = new Map((plan.milestones || []).map((m) => [m.id, m]));
    const trackedMilestones = new Map((ec.milestones || []).map((m) => [m.id, m]));
    for (const [id, milestone] of planMilestones) {
      const tracked = trackedMilestones.get(id);
      if (!tracked)
        error('C2', 'graph/exit-conditions.json', 0, `Missing milestone ${id}`);
      else if (tracked.day !== milestone.day)
        error('C2', 'graph/exit-conditions.json', 0,
          `${id} is P${tracked.day}, plan.json says P${milestone.day}`);
    }
    for (const id of trackedMilestones.keys())
      if (!planMilestones.has(id))
        error('C2', 'graph/exit-conditions.json', 0, `Tracks milestone ${id} which plan.json does not define`);

    // Retention may be due after P30, so it is a global control rather than a
    // fake fixed-date agent. It must remain executable: G1 assigns the owner and
    // due date, and the tracker cannot close without named deletion evidence.
    const retentionPlan = plan.data_retention;
    const retention = ec.data_retention;
    if (!retention || typeof retention !== 'object') {
      error('C2', 'graph/exit-conditions.json', 0, 'Missing global data_retention control');
    } else {
      if (retentionPlan.control_id !== 'research_data_deletion' ||
          retention.control_id !== retentionPlan.control_id)
        error('C2', 'graph/exit-conditions.json', 0,
          'data_retention.control_id must be "research_data_deletion" in both files');
      if (retentionPlan.assigned_by_gate !== 'G1' || retention.assigned_by_gate !== 'G1')
        error('C2', 'graph/exit-conditions.json', 0,
          'data_retention must be assigned by G1');
      if (!['pending_g1', 'scheduled', 'complete'].includes(retention.status))
        error('C2', 'graph/exit-conditions.json', 0,
          `data_retention.status is invalid: ${JSON.stringify(retention.status)}`);
      if (retention.deletion_executed?.substitute_allowed !== false)
        error('C2', 'graph/exit-conditions.json', 0,
          'data_retention deletion evidence must set substitute_allowed to false');

      const coveredLoops = [...new Set((retentionPlan.covers || [])
        .map((output) => String(output).match(/^graph\/output\/(loop-[a-e])\//)?.[1]?.replace('-', '_'))
        .filter(Boolean))];
      if (!sameSet(coveredLoops, toList(retention.covers_loops)))
        error('C2', 'graph/exit-conditions.json', 0,
          `data_retention.covers_loops is [${toList(retention.covers_loops).join(', ')}], plan outputs imply [${coveredLoops.join(', ')}]`);

      const g1Closed = ec.gates?.G1?.status === 'closed';
      const unresolved = (value) => value === null || value === undefined || /\[?TBD/i.test(String(value));
      if (g1Closed && (unresolved(retention.retention_days) || unresolved(retention.deletion_owner) || unresolved(retention.deletion_due)))
        error('C2', 'graph/exit-conditions.json', 0,
          'G1 is closed but data_retention owner, period, or due date is still unresolved');
      if (g1Closed && (!Number.isInteger(retention.retention_days) || retention.retention_days <= 0 ||
          typeof retention.deletion_owner !== 'string' || !retention.deletion_owner.trim() ||
          !/^\d{4}-\d{2}-\d{2}$/.test(String(retention.deletion_due))))
        error('C2', 'graph/exit-conditions.json', 0,
          'Closed G1 requires a positive integer retention_days, named deletion_owner, and YYYY-MM-DD deletion_due');
      if (g1Closed && retention.status === 'pending_g1')
        error('C2', 'graph/exit-conditions.json', 0,
          'G1 is closed but data_retention.status is still pending_g1');
      if (retention.status === 'complete' || retention.deletion_executed?.met === true) {
        if (retention.status !== 'complete' || retention.deletion_executed?.met !== true ||
            unresolved(retention.deletion_executed?.executed_by) || unresolved(retention.deletion_executed?.executed_at))
          error('C2', 'graph/exit-conditions.json', 0,
            'data_retention can close only with executed_by and executed_at evidence');
        else if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/.test(String(retention.deletion_executed.executed_at)))
          error('C2', 'graph/exit-conditions.json', 0,
            'data_retention.executed_at must be an ISO date or UTC timestamp');
      }
    }
  }

  // -------------------------------------------------------------------------
  // Agent names in prose that do not exist.
  //
  // The day check below finds a line CONTAINING a real agent id and validates
  // the days near it. It is therefore blind to a wrong NAME: an abbreviation
  // contains no real id, so the line is never examined. That is how the v2.0
  // README.md flow diagram carried `query_transactions`, `enrich_profiles`,
  // `recruit_cohort` and `analyze_cohort` — four Loop-D agents that exist
  // nowhere — in the same directory whose INDEX.md declared this exact defect
  // fixed since v1.0.
  //
  // Anything shaped like an agent id, in a document that lists agents, must be
  // a real agent id, an output filename, or a known structural key.
  // -------------------------------------------------------------------------
  {
    const realIds = new Set(
      Object.values(plan.loops || {}).flatMap((l) => (l.agents || []).map((a) => a.id)),
    );
    const outputStems = new Set(
      Object.values(plan.loops || {})
        .flatMap((l) => l.outputs || [])
        .map((p) => p.split('/').pop().replace(/\.[a-z]+$/, '')),
    );
    // Data-class names are vocabulary, not agents. `customer_personal` happens
    // to contain the substring "persona", which the id-similarity heuristic
    // below would otherwise read as a near-miss for `create_persona`.
    for (const dc of Object.keys(plan.data_classes || {})) outputStems.add(dc);

    // Structural vocabulary: JSON/YAML keys and status values quoted in prose.
    const STRUCTURAL = /^(exit_conditions|binary_requirements|data_class|start_day|end_day|closes_end_of_day|blocks_agents|blocks_loops|gated_by|depends_on|depends_on_loops|depends_on_completion|decided_by|decided_at|market_scope|claim_policy|source_of_scope|schema_version|last_updated|measurement_definitions|pilot_constraints|data_retention|prompt_versions|not_started|in_progress|blocked_by_gate|on_track|loop_[a-e]|product_discovery|incentive_eur|no_bypass|open_items|required_for_target|substitute_allowed|deliverables_received|satisfied_by_agent|owner_loop|closes_gate|requires_gate|prep_start_date|live_start_date|.*_pct|.*_eur|.*_days|.*_score|.*_rate|.*_count|.*_of_10|.*_selected|.*_documented|.*_saturation|.*_identified|.*_completed|.*_covered|.*_enriched|.*_confirmed|.*_integrated|.*_claims|.*_sellers|.*_photos|.*_steps|.*_minutes|.*_interview|.*_reuse|.*_review|.*_complete|.*_consent|.*_conclusions|.*_before_run|.*_scope|.*_decision|.*_docs|.*_basis)$/;

    for (const f of [join(GRAPH, 'README.md'), join(GRAPH, 'INDEX.md'), join(ROOT, 'GRAPH-SETUP.md')]) {
      const src = read(f);
      if (!src) continue;
      const lines = src.split(/\r?\n/);
      lines.forEach((line, i) => {
        if (/^\s*>/.test(line)) return;            // commentary quoting old names
        // Documenting a defect requires naming it. A name is a citation when
        // the surrounding lines say which version it came from — the same
        // context window C3 uses, because the sentence and the list of bad
        // names it introduces are rarely on the same line.
        const context = lines.slice(Math.max(0, i - 3), i + 4).join('\n');
        if (/v1\.0|2026-08-16|which existed|do not exist|matches no agent/i.test(context)) return;
        for (const m of line.matchAll(/\b([a-z]+(?:_[a-z0-9]+)+)\b/g)) {
          const token = m[1];
          if (realIds.has(token) || outputStems.has(token)) continue;
          if (STRUCTURAL.test(token)) continue;
          // Only flag tokens that look like they belong to the agent namespace:
          // a prefix or suffix shared with a real id.
          const looksLikeAgent = [...realIds].some(
            (id) => id.includes(token) || token.includes(id.split('_')[0]) ||
                    id.split('_').some((part) => part.length > 4 && token.includes(part)),
          );
          if (!looksLikeAgent) continue;
          error('C2', rel(f), i + 1,
            `"${token}" is shaped like an agent id but matches no agent in plan.json`,
            `${line.trim()}\n     Real ids: ${[...realIds].filter((id) => id.split('_').some((p) => p.length > 4 && token.includes(p))).join(', ') || '(none close)'}`);
        }
      });
    }
  }

  // Prose documents must not contain a day number for an agent that contradicts
  // plan.json — this is what let "DAY 14 deadline / DAY 16 fail" survive.
  const prose = ['README.md', 'INDEX.md'].map((f) => join(GRAPH, f)).concat([join(ROOT, 'GRAPH-SETUP.md')]);
  for (const f of prose) {
    const src = read(f);
    if (!src) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*>/.test(line)) return;
      // A line may hold several table or diagram cells side by side; each cell is
      // checked on its own, or two adjacent columns would contaminate each other.
      for (const cell of line.split(/[│|]/)) {
        for (const [loopId, loop] of Object.entries(plan.loops || {})) {
          for (const agent of loop.agents || []) {
            if (!cell.includes(agent.id)) continue;
            const days = [...cell.matchAll(/\bP(\d+)\b/g)].map((m) => Number(m[1]));
            if (!days.length) continue;
            const ok = days.every((d) => d === agent.start_day || d === agent.end_day);
            if (!ok)
              error('C2', rel(f), i + 1,
                `Mentions ${agent.id} with days ${days.map((d) => 'P' + d).join(', ')}; plan.json says P${agent.start_day}–P${agent.end_day}`,
                cell.trim());
          }
        }
      }
    });
  }
}

// ===========================================================================
// C3 — MARKET SCOPE
//
// The defect: a Lithuanian consumer-classifieds product was benchmarked against
// OLX, eBay and Vinted, and drew price comparables "from an eBay/Vinted API".
// OLX is not a meaningful player in LT, eBay is marginal here, and Vinted is
// fashion resale. The competitors named in the brief that started this work —
// aruodas, autoplius, skelbiu — appeared nowhere in the graph.
//
// A mention is allowed when the surrounding text explains why the name is out
// of scope. That is what `JUSTIFIERS` matches.
// ===========================================================================
if (run('C3')) {
  const excluded = (plan.market_scope?.excluded || []).map((e) => e.name);
  const adjacent = (plan.market_scope?.adjacent_not_competitors || []).map((e) => e.name);
  // Keep the known out-of-scope set anchored even if plan.json itself is
  // accidentally edited. A policy cannot validate its own removal.
  const watched = [...new Set([...excluded, ...adjacent, 'OLX', 'eBay', 'Craigslist', 'Vinted'])];

  const JUSTIFIERS = [
    /v1\.0/i, /excluded/i, /out of scope/i, /not a (used-electronics )?(competitor|comparable)/i,
    /adjacent/i, /template note/i, /validator/i, /ne ta rinka/i, /netinka/i,
    /nenaudojam/i, /neleid/i, /nepatenka/i, /fashion.resale/i, /drabuž/i,
    /marginal/i, /nėra prasmingas/i, /beveik nenaudojam/i, /design reference/i,
    /must not appear/i, /fails on those names/i, /nerašom/i,
  ];

  const files = walk(GRAPH)
    .concat([join(ROOT, 'GRAPH-SETUP.md')])
    .filter((f) => /\.(md|ya?ml|json)$/.test(f) && !f.endsWith('plan.json'));

  for (const f of files) {
    const src = read(f);
    if (!src) continue;
    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const name of watched) {
        const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (!re.test(line)) continue;
        const context = lines.slice(Math.max(0, i - 3), i + 4).join('\n');
        if (JUSTIFIERS.some((j) => j.test(context))) continue;
        error('C3', rel(f), i + 1,
          `"${name}" named without a scope justification`,
          `${line.trim()}\n     LT competitive set: ${(plan.market_scope?.primary_competitors || []).map((c) => c.name).join(', ')}`);
      }
    });
  }

  // The real competitors must actually appear somewhere.
  const corpus = files.map((f) => read(f) || '').join('\n');
  for (const c of plan.market_scope?.primary_competitors || []) {
    if (!corpus.toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))
      warn('C3', 'graph/', 0, `Primary LT competitor "${c.name}" is never mentioned in the graph`);
  }
}

// ===========================================================================
// C4 — UNSOURCED CLAIMS
//
// The defect: `pilot-brief-template.md` promised, via Application-progress.md,
// not to invent facts, then asserted "2M+ verified users", a "~€2B" EU market,
// "Vinted (600k+ active users)", "12/15 mentions", "7.5/10 accuracy", an
// "NPS 7.8/10" and four verbatim seller quotes. No research had been done.
//
// The rule: a magnitude claim carries a provenance tag from plan.json's
// claim_policy. Blockquotes are commentary and are skipped; that is where the
// corrected template quotes the old numbers in order to name them.
// ===========================================================================
if (run('C4')) {
  const TAG = /\[(A:\d+|A:n|B|C|D|EXT:[^\]]+|HYPOTHESIS|TBD[^\]]*)\]/;

  const MAGNITUDE = [
    { re: /\b\d[\d.,]*\s*(?:M|B|k)\+/i,               what: 'magnitude claim (e.g. "2M+")' },
    { re: /[€$]\s?\d[\d.,]*\s*(?:B|M|k|bn|mln|mlrd)\b/i, what: 'market-size claim' },
    { re: /\b\d[\d.,]*\s*(?:million|billion|mln|mlrd)\b/i, what: 'market-size claim' },
    { re: /\b\d+\s*\/\s*\d+\s+mentions\b/i,            what: 'interview frequency claim' },
    { re: /\b\d+\.\d+\s*\/\s*\d+\b/,                  what: 'measured rating claim' },
    { re: /\bNPS\b(?!\s*is\s+a)/i,                     what: 'NPS reference' },
  ];

  const targets = walk(GRAPH)
    .filter((f) => /\.md$/.test(f))
    .concat([join(ROOT, 'GRAPH-SETUP.md')]);

  for (const f of targets) {
    const src = read(f);
    if (!src) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*>/.test(line)) return;          // commentary about the old version
      if (/^\s*(#|\/\/)/.test(line)) return;
      for (const { re, what } of MAGNITUDE) {
        if (!re.test(line)) continue;
        if (TAG.test(line)) continue;
        error('C4', rel(f), i + 1, `Untagged ${what}`,
          `${line.trim()}\n     Needs one of: ${Object.keys(plan.claim_policy?.tags || {}).join(' ')}`);
      }
    });
  }

  // A template must not ship a pre-drawn approval mark.
  for (const f of targets) {
    const src = read(f);
    if (!src) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*>/.test(line)) return;
      if (/[✅✔]/.test(line) && /(approved|patvirtin|sign[- ]?off)/i.test(line)) {
        error('C4', rel(f), i + 1,
          'Approval tick mark rendered above an unfilled approver field',
          `${line.trim()}\n     A template that ships a tick passes the tick on to everyone who copies it.`);
      }
    });
  }

  // Pre-written conclusions inside agent prompts.
  for (const f of walk(GRAPH).filter((f) => /\.ya?ml$/.test(f))) {
    const src = read(f);
    if (!src) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*#/.test(line)) return;
      if (/v1\.0/.test(line)) return;
      const m = line.match(/(Išvada|Isvada|Conclusion)\s*:\s*["„][^"“]{10,}/i);
      if (m)
        error('C4', rel(f), i + 1,
          'Agent prompt contains a pre-written conclusion',
          `${line.trim()}\n     The agent is being told what to find before the data exists.`);
    });
  }
}

// ===========================================================================
// C5 — LANGUAGE ARTIFACTS
//
// The defect: Lithuanian prose carrying tokens from other languages and from
// nowhere at all — "Untuk setiap" (Indonesian, in loop-c), "parallelliai",
// "pirmaasistripe cohort", "grubul indai", "Laisvieji šneliai", "internorinių",
// "negatim", "Grammatika", plus a Cyrillic je (U+0458) hiding inside what
// looked like the ASCII word `kategorija=auto` in GRAPH-SETUP.md.
//
// Two mechanisms:
//   1. A denylist of the exact tokens found, so they cannot come back.
//   2. Non-Latin scripts, which are always a copy-paste artifact here.
//
// This cannot detect fluent nonsense. That is the human reviewer's job.
// ===========================================================================
if (run('C5')) {
  const KNOWN_BAD = [
    'Untuk setiap', 'parallelliai', 'pirmaasistripe', 'pirmaai cohortai',
    'grubul indai', 'Laisvieji šneliai', 'Laisvieji slotvai', 'internorinių',
    'interiorinių', 'negatim', 'Grammatika', 'Primenantas', 'telefonimai',
    'susatinkęs', 'Detaliaus', 'gaviausiai', 'Testuoki', 'keturų',
    'paskelbeide', 'pasiūlytumete', 'dalyvauto', 'nepasikels', 'sustabus',
    'pikami', 'žaidingas', 'atgra history', 'per informacijas', 'Foruma.lt',
    's/o license', 'rūpestingai grį', 'nesurenka',
  ];

  const SCRIPTS = [
    { name: 'Cyrillic', re: /[\u0400-\u04FF]/ },
    { name: 'Greek',    re: /[\u0370-\u03FF]/ },
    { name: 'CJK',      re: /[\u4E00-\u9FFF\u3040-\u30FF]/ },
    { name: 'Arabic',   re: /[\u0600-\u06FF]/ },
    { name: 'Hebrew',   re: /[\u0590-\u05FF]/ },
  ];

  const files = walk(ROOT).filter(
    (f) => /\.(md|ya?ml|json|mjs|js|jsx)$/.test(f) && !rel(f).startsWith('site/node_modules'),
  );

  for (const f of files) {
    const src = read(f);
    if (!src) continue;
    const isValidator = rel(f) === 'tools/validate-graph.mjs';
    let inFence = false;
    src.split(/\r?\n/).forEach((line, i) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return;
      }
      if (!isValidator) {
        for (const bad of KNOWN_BAD) {
          const lower = line.toLowerCase();
          const token = bad.toLowerCase();
          if (!lower.includes(token)) continue;
          // A citation is not a usage. Documenting a defect requires naming it,
          // so quoted forms are allowed: inside backticks, inside a fenced block,
          // inside a blockquote, or on a line that says which version it came from.
          if (lower.includes('`' + token + '`')) continue;
          if (inFence) continue;
          if (/v1\.0|^\s*>/.test(line)) continue;
          error('C5', rel(f), i + 1, `Known bad token: "${bad}"`, line.trim());
        }
      }
      for (const { name, re } of SCRIPTS) {
        if (re.test(line)) {
          const chars = [...new Set(line.match(new RegExp(re.source, 'g')) || [])].join(' ');
          error('C5', rel(f), i + 1, `${name} character(s) in a Lithuanian/English document: ${chars}`, line.trim());
        }
      }
    });
  }
}

// ===========================================================================
// S1 — HYGIENE: research data containing personal data must not be committable
// ===========================================================================
if (run('S1')) {
  const gi = read(join(ROOT, '.gitignore')) || '';
  if (!/^graph\/output\/?$/m.test(gi))
    error('S1', '.gitignore', 0,
      'graph/output/ is not gitignored',
      'Loop-A transcripts and Loop-D seller profiles are personal data, and this repository is public.');
  const negations = gi.split(/\r?\n/).filter((line) => /^!\/?graph\/output(?:\/|$)/.test(line.trim()));
  if (negations.length)
    error('S1', '.gitignore', 0,
      'A later .gitignore rule makes content under graph/output/ committable',
      negations.join('\n'));

  if (existsSync(join(ROOT, '.git'))) {
    try {
      const tracked = execFileSync('git', ['ls-files', '--', 'graph/output'], {
        cwd: ROOT,
        encoding: 'utf8',
      }).trim();
      if (tracked)
        error('S1', 'graph/output/', 0,
          'Personal-data output is already tracked by git',
          tracked);
    } catch (e) {
      error('S1', '.git', 0, 'Could not verify whether graph/output/ is tracked', e.message);
    }
  }
}

// ===========================================================================
// S2 — PLAN: internal consistency of the source of truth itself
// ===========================================================================

// Direction-aware threshold check.
//
// v1.0's columns meant "floor" in one row and "ceiling" in the next. v2.0
// replaced them with minimum/target/stretch and declared the problem solved —
// then reintroduced it twice, because a lower-is-better metric has nowhere to
// put its fail threshold except `minimum`, where the word means the opposite of
// what it says. `direction` gives it somewhere: `maximum`.
function checkDirection(file, label, th) {
  if (!th || typeof th !== 'object') return;
  const { direction, minimum, maximum, target, stretch } = th;
  const values = { minimum, maximum, target, stretch };
  const defined = Object.entries(values).filter(([, value]) => value !== undefined);

  if (!direction) {
    if (!defined.length) return;
    error('S2', file, 0, `${label}: threshold with no "direction"`,
      'Every threshold declares higher_better, lower_better, binary or informational. Without it, "minimum" is ambiguous.');
    return;
  }

  if (!['higher_better', 'lower_better', 'binary', 'informational'].includes(direction)) {
    error('S2', file, 0, `${label}: unknown direction "${direction}"`,
      'Valid: higher_better, lower_better, binary, informational.');
    return;
  }

  if (direction === 'binary' || direction === 'informational') {
    for (const [level, value] of defined) {
      if (typeof value === 'number')
        error('S2', file, 0, `${label}: direction is ${direction} but it defines numeric "${level}"`);
    }
    return;
  }

  for (const [level, value] of defined) {
    if (typeof value !== 'number')
      error('S2', file, 0,
        `${label}.${level} must be a number, got ${JSON.stringify(value)}`,
        'Encoding a numeric threshold as text disables ordering and boundary checks.');
  }
  if (defined.some(([, value]) => typeof value !== 'number')) return;

  if (direction === 'higher_better') {
    if (minimum === undefined)
      error('S2', file, 0, `${label}: higher_better threshold has no "minimum" fail boundary`);
    if (maximum !== undefined)
      error('S2', file, 0, `${label}: direction is higher_better but it defines "maximum"`,
        'A higher-is-better metric fails at a floor. Use "minimum".');
    const seq = [minimum, target, stretch].filter((v) => typeof v === 'number');
    if (seq.length > 1 && !seq.every((v, i) => i === 0 || seq[i - 1] <= v))
      error('S2', file, 0,
        `${label}: minimum ${minimum} / target ${target} / stretch ${stretch} is not monotonic for higher_better`,
        'This is the inversion that made v1.0 tables mean "floor" in one row and "ceiling" in the next.');
  } else if (direction === 'lower_better') {
    if (maximum === undefined)
      error('S2', file, 0, `${label}: lower_better threshold has no "maximum" fail boundary`);
    if (minimum !== undefined)
      error('S2', file, 0, `${label}: direction is lower_better but it defines "minimum"`,
        'A lower-is-better metric fails at a ceiling. Use "maximum" — writing the ceiling into "minimum" is exactly the v1.0 inversion.');
    const seq = [maximum, target, stretch].filter((v) => typeof v === 'number');
    if (seq.length > 1 && !seq.every((v, i) => i === 0 || seq[i - 1] >= v))
      error('S2', file, 0,
        `${label}: maximum ${maximum} / target ${target} / stretch ${stretch} is not monotonic for lower_better`,
        'For lower_better the sequence must descend: maximum >= target >= stretch.');
  }
}

if (run('S2')) {
  for (const loopId of Object.keys(LOOP_FILES)) {
    if (!Object.hasOwn(plan.loops, loopId))
      error('S2', 'graph/plan.json', 0, `Missing required loop "${loopId}"`);
  }
  for (const gateId of Object.keys(REQUIRED_GATE_EVIDENCE)) {
    if (!Object.hasOwn(plan.gates, gateId))
      error('S2', 'graph/plan.json', 0, `Missing required gate "${gateId}"`);
  }
  if (plan.data_retention?.control_id !== 'research_data_deletion' ||
      plan.data_retention?.assigned_by_gate !== 'G1' ||
      !Array.isArray(plan.data_retention?.covers) || !plan.data_retention.covers.length ||
      typeof plan.data_retention?.binary_requirement !== 'string')
    error('S2', 'graph/plan.json', 0,
      'data_retention must define the research_data_deletion control, G1 assignment, covered outputs, and a binary requirement');
  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    if (!Number.isInteger(loop.start_day) || !Number.isInteger(loop.end_day) || loop.start_day > loop.end_day)
      error('S2', 'graph/plan.json', 0,
        `${loopId} has invalid window ${JSON.stringify(loop.start_day)}..${JSON.stringify(loop.end_day)}`);
    const agents = Array.isArray(loop.agents) ? loop.agents : [];
    if (!Array.isArray(loop.agents))
      error('S2', 'graph/plan.json', 0, `${loopId}.agents must be an array`);
    const ids = agents.map((agent) => agent.id);
    for (const id of new Set(ids)) {
      if (ids.filter((candidate) => candidate === id).length > 1)
        error('S2', 'graph/plan.json', 0, `${loopId} defines agent "${id}" more than once`);
    }
    const byId = new Map(agents.map((agent) => [agent.id, agent]));
    for (const agent of agents) {
      if (!Object.hasOwn(plan.data_classes, agent.data_class))
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} has missing or unknown data_class "${agent.data_class}"`);
      if (!Number.isInteger(agent.start_day) || !Number.isInteger(agent.end_day)) {
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} has non-integer day values ${JSON.stringify(agent.start_day)}..${JSON.stringify(agent.end_day)}`);
        continue;
      }
      if (agent.start_day > agent.end_day)
        error('S2', 'graph/plan.json', 0, `${loopId}.${agent.id} starts P${agent.start_day} after it ends P${agent.end_day}`);
      if (agent.start_day < loop.start_day || agent.end_day > loop.end_day)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} (P${agent.start_day}–P${agent.end_day}) falls outside its loop window P${loop.start_day}–P${loop.end_day}`);
      for (const dep of agent.depends_on || []) {
        const d = byId.get(dep);
        if (!d) {
          error('S2', 'graph/plan.json', 0, `${loopId}.${agent.id} depends on unknown agent "${dep}"`);
          continue;
        }
        if (agent.start_day < d.end_day)
          error('S2', 'graph/plan.json', 0,
            `${loopId}.${agent.id} starts P${agent.start_day} before its dependency ${dep} ends P${d.end_day}`);
      }
    }
    // Dates alone do not reject a same-day A -> B -> A cycle.
    const visiting = new Set();
    const visited = new Set();
    const visit = (id, path = []) => {
      if (visiting.has(id)) {
        error('S2', 'graph/plan.json', 0,
          `${loopId} has an agent dependency cycle: ${[...path, id].join(' -> ')}`);
        return;
      }
      if (visited.has(id) || !byId.has(id)) return;
      visiting.add(id);
      for (const dep of byId.get(id).depends_on || []) visit(dep, [...path, id]);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of byId.keys()) visit(id);
    for (const [metric, th] of Object.entries(loop.thresholds || {})) {
      if (metric.startsWith('$')) continue;
      checkDirection('graph/plan.json', `${loopId}.${metric}`, th);
    }
    for (const gid of toList(loop.gated_by)) {
      const gate = Object.hasOwn(plan.gates, gid) ? plan.gates[gid] : null;
      if (!gate) {
        error('S2', 'graph/plan.json', 0, `${loopId}.gated_by references unknown gate "${gid}"`);
        continue;
      }
      for (const agent of agents) {
        const ref = `${loopId}.${agent.id}`;
        if (!(gate.blocks_agents || []).includes(ref))
          error('S2', 'graph/plan.json', 0,
            `${loopId} is gated by ${gid}, but ${gid}.blocks_agents omits ${ref}`);
      }
    }
  }

  // A gate that claims an agent closes it must point to a real, matching agent
  // whose work ends on the gate's close day. Check the reverse link as well.
  for (const [gid, gate] of Object.entries(plan.gates || {})) {
    if (!Array.isArray(gate.deliverables) || !gate.deliverables.length)
      error('S2', 'graph/plan.json', 0, `${gid}.deliverables must be a non-empty array`);
    if (!Array.isArray(gate.evidence_keys) || !gate.evidence_keys.length ||
        new Set(gate.evidence_keys).size !== gate.evidence_keys.length ||
        gate.evidence_keys.some((key) => typeof key !== 'string' || !/^[a-z][a-z0-9_]*$/.test(key)))
      error('S2', 'graph/plan.json', 0,
        `${gid}.evidence_keys must be a non-empty array of unique snake_case keys`);
    if (REQUIRED_GATE_EVIDENCE[gid] && !sameSet(toList(gate.evidence_keys), REQUIRED_GATE_EVIDENCE[gid]))
      error('S2', 'graph/plan.json', 0,
        `${gid}.evidence_keys must be [${REQUIRED_GATE_EVIDENCE[gid].join(', ')}]`,
        'A source-of-truth edit cannot silently remove the evidence that proves a regulated gate closed.');
    if (gate.owner_loop === null && gate.satisfied_by_agent === null) continue; // human gate (G3)
    const owner = Object.hasOwn(plan.loops, gate.owner_loop) ? plan.loops[gate.owner_loop] : null;
    const agent = (owner?.agents || []).find((a) => a.id === gate.satisfied_by_agent);
    if (!owner)
      error('S2', 'graph/plan.json', 0, `${gid}.owner_loop names unknown loop "${gate.owner_loop}"`);
    else if (!agent)
      error('S2', 'graph/plan.json', 0,
        `${gid}.satisfied_by_agent names unknown agent "${gate.owner_loop}.${gate.satisfied_by_agent}"`);
    else {
      if (agent.closes_gate !== gid)
        error('S2', 'graph/plan.json', 0,
          `${gid} points to ${gate.owner_loop}.${agent.id}, but that agent closes "${agent.closes_gate || null}"`);
      if (agent.end_day !== gate.closes_end_of_day)
        error('S2', 'graph/plan.json', 0,
          `${gid} closes P${gate.closes_end_of_day}, but ${gate.owner_loop}.${agent.id} ends P${agent.end_day}`);
    }
  }
  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    for (const agent of loop.agents || []) {
      if (!agent.closes_gate) continue;
      const gate = Object.hasOwn(plan.gates, agent.closes_gate) ? plan.gates[agent.closes_gate] : null;
      if (!gate)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} closes unknown gate "${agent.closes_gate}"`);
      else if (gate.owner_loop !== loopId || gate.satisfied_by_agent !== agent.id)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} closes ${agent.closes_gate}, but that gate points to ${gate.owner_loop}.${gate.satisfied_by_agent}`);
    }
  }

  const milestoneIds = new Set((plan.milestones || []).map((m) => m.id));
  if (milestoneIds.size !== (plan.milestones || []).length)
    error('S2', 'graph/plan.json', 0, 'Milestone ids must be unique');
  for (const [gid, gate] of Object.entries(plan.gates || {})) {
    for (const ref of gate.blocks_agents || []) {
      const parts = String(ref).split('.');
      const loop = parts.length === 2 && Object.hasOwn(plan.loops, parts[0]) ? plan.loops[parts[0]] : null;
      const agent = (loop?.agents || []).find((candidate) => candidate.id === parts[1]);
      if (!agent) {
        error('S2', 'graph/plan.json', 0, `${gid}.blocks_agents references unknown agent "${ref}"`);
        continue;
      }
      if (!toList(loop.gated_by).includes(gid))
        error('S2', 'graph/plan.json', 0,
          `${gid}.blocks_agents includes ${ref}, but ${parts[0]}.gated_by does not include ${gid}`);
      if (agent.start_day <= gate.closes_end_of_day)
        error('S2', 'graph/plan.json', 0,
          `${gid} closes end of P${gate.closes_end_of_day} but blocked agent ${ref} starts P${agent.start_day}`);
    }
    for (const loopId of toList(gate.blocks_loops)) {
      if (!Object.hasOwn(plan.loops, loopId))
        error('S2', 'graph/plan.json', 0, `${gid}.blocks_loops references unknown loop "${loopId}"`);
    }
    for (const blocked of toList(gate.blocks)) {
      if (!milestoneIds.has(blocked)) {
        error('S2', 'graph/plan.json', 0,
          `${gid}.blocks references unknown milestone "${blocked}"`);
        continue;
      }
      const milestone = plan.milestones.find((item) => item.id === blocked);
      if (milestone.day <= gate.closes_end_of_day)
        error('S2', 'graph/plan.json', 0,
          `${gid} closes end of P${gate.closes_end_of_day} but blocked milestone ${blocked} is P${milestone.day}`);
    }
    const gateMilestone = plan.milestones.find((item) => item.id === `gate_${gid.toLowerCase()}`);
    if (!gateMilestone || gateMilestone.day !== gate.closes_end_of_day)
      error('S2', 'graph/plan.json', 0,
        `${gid} closes P${gate.closes_end_of_day} but milestone gate_${gid.toLowerCase()} is ${gateMilestone ? `P${gateMilestone.day}` : 'missing'}`);
  }

  // The same rule over the other two places thresholds live. S2 used to check
  // plan.json loop thresholds only, which is how `hallucination_rate_pct:
  // minimum 5 / target 0` survived in exit-conditions.json and
  // `listing_time_minutes: minimum 10 / target 5` survived in plan.json's own
  // measurement_definitions.
  for (const [metric, def] of Object.entries(plan.measurement_definitions || {})) {
    if (metric.startsWith('$')) continue;
    checkDirection('graph/plan.json', `measurement_definitions.${metric}`, def);
  }
  {
    for (const [loopId, t] of Object.entries(exitConditions)) {
      for (const [metric, m] of Object.entries((t || {}).metrics || {})) {
        if (metric.startsWith('$')) continue;
        checkDirection('graph/exit-conditions.json', `${loopId}.${metric}`, m);
      }
    }
  }

  // Cross-loop dependency edges. Until 2026-08-16 plan.json had none at all:
  // every depends_on resolved inside its own loop, and loop_e — which consumes
  // all four loops' outputs — had depends_on: []. The ordering that makes this
  // a graph was held by nothing but P21 being greater than P20.
  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    for (const dep of toList(loop.depends_on_loops)) {
      const d = Object.hasOwn(plan.loops, dep) ? plan.loops[dep] : null;
      if (!d) {
        error('S2', 'graph/plan.json', 0, `${loopId}.depends_on_loops names unknown loop "${dep}"`);
        continue;
      }
      if (loop.start_day <= d.end_day)
        error('S2', 'graph/plan.json', 0,
          `${loopId} starts P${loop.start_day} but its dependency ${dep} runs to P${d.end_day}`,
          'depends_on_loops means "that loop must be COMPLETE first". A gate dependency belongs in gated_by.');
    }
  }
  const requiredSynthesisDependencies = Object.keys(LOOP_FILES).filter((id) => id !== 'loop_e');
  if (plan.loops.loop_e && !sameSet(toList(plan.loops.loop_e.depends_on_loops), requiredSynthesisDependencies))
    error('S2', 'graph/plan.json', 0,
      `loop_e.depends_on_loops must be [${requiredSynthesisDependencies.join(', ')}]`,
      'Loop-E claims to synthesize every other loop output, so all four dependency edges are required.');

  // A binary requirement due after its owner has closed has no owner. This is
  // why loop_e's legal_review and cto_review (due_day 26, loop ends P25) became
  // gate G3.
  {
    for (const [loopId, t] of Object.entries(exitConditions)) {
      if (!t || typeof t.start_day !== 'number') continue;
      for (const [req, v] of Object.entries(t.binary_requirements || {})) {
        if (!v || typeof v.due_day !== 'number') continue;
        if (v.due_day < t.start_day || v.due_day > t.end_day)
          error('S2', 'graph/exit-conditions.json', 0,
            `${loopId}.${req} is due P${v.due_day} but ${loopId} runs P${t.start_day}–P${t.end_day}`,
            'A requirement due outside its owner\'s window has no owner. Model it as a gate instead.');
      }
    }
  }

  // Loop-E must start after every loop it depends on has finished.
  const e = plan.loops?.loop_e;
  if (e) {
    for (const [id, l] of Object.entries(plan.loops)) {
      if (id === 'loop_e') continue;
      if (e.start_day <= l.end_day)
        error('S2', 'graph/plan.json', 0,
          `loop_e starts P${e.start_day} but ${id} runs to P${l.end_day}`,
          'v1.0 had exactly this: Loop-E started DAY 15 while Loop-B could still "fail" on DAY 16.');
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const errors = findings.filter((f) => f.level === 'error');
const warns = findings.filter((f) => f.level === 'warn');
const blockingFindings = strict ? findings : errors;
const executedChecks = only ? [only.toUpperCase()] : [...CHECK_IDS];

if (asJson) {
  console.log(JSON.stringify({ executed_checks: executedChecks, strict, errors: errors.length, warnings: warns.length, findings, exemptions }, null, 2));
  process.exit(blockingFindings.length ? 1 : 0);
}

const printExemptions = () => {
  if (!exemptions.length) return;
  console.log('  Centrally reviewed exemptions in force:');
  for (const e of exemptions) console.log(`    ${e.check}  ${e.file}\n         ${e.reason}`);
  console.log('');
};

const CHECK_NAMES = {
  C1: 'SEQUENCING  — personal data before its legal basis',
  C2: 'DRIFT       — days / names / thresholds across documents',
  C3: 'MARKET      — competitors from the wrong market',
  C4: 'CLAIMS      — quantitative claims without a source',
  C5: 'LANGUAGE    — foreign-language and garbled tokens',
  S1: 'HYGIENE     — personal data committable to a public repo',
  S2: 'PLAN        — internal consistency of plan.json',
};

console.log('\n  pre-publish validation — graph/\n');

if (!findings.length) {
  console.log(`  ${only ? 'Selected check passed.' : 'All checks passed.'}\n`);
  for (const id of executedChecks) console.log(`    ok   ${id}  ${CHECK_NAMES[id]}`);
  console.log('');
  printExemptions();
  console.log('  Reminder: this is the floor, not the ceiling. The linter cannot');
  console.log('  read fluent nonsense or verify that a sourced number is true.');
  console.log('  Run the adversarial pass in .claude/skills/pre-publish-audit/ too.\n');
  process.exit(0);
}

const grouped = {};
for (const f of findings) (grouped[f.check] ||= []).push(f);

for (const [check, list] of Object.entries(grouped)) {
  console.log(`  ${check}  ${CHECK_NAMES[check] || ''}`);
  for (const f of list) {
    const tag = f.level === 'error' ? 'ERROR' : 'warn ';
    console.log(`    ${tag}  ${f.file}${f.line ? ':' + f.line : ''}`);
    console.log(`           ${f.message}`);
    if (f.detail)
      for (const l of String(f.detail).split('\n')) console.log(`           ${l}`);
  }
  console.log('');
}

printExemptions();
console.log(`  ${errors.length} error(s), ${warns.length} warning(s)${strict ? ' (strict: warnings block)' : ''}\n`);
process.exit(blockingFindings.length ? 1 : 0);
