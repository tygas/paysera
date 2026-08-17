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
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const GRAPH = join(ROOT, 'graph');

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || null;
const asJson = args.includes('--json');

const findings = [];
const exemptions = [];

const rel = (p) => relative(ROOT, p).split(sep).join('/');

// ---------------------------------------------------------------------------
// Exemptions.
//
// A document *about* defects has to quote them. This audit report reproduces
// the Indonesian phrase and the Cyrillic character verbatim — without them the
// finding cannot be documented at all.
//
// So exemptions exist, but on three conditions, because a silent exemption is
// just a disabled check:
//   1. Declared in the file itself, where a reader will see it.
//   2. Scoped to one check.
//   3. Carrying a reason. No reason, no exemption.
// Every exemption is printed in the summary, so they cannot accumulate unseen.
//
//   <!-- validator:allow-file C5 — reason goes here -->
// ---------------------------------------------------------------------------
const exemptCache = new Map();
function exemptChecks(absPath) {
  const key = rel(absPath);
  if (exemptCache.has(key)) return exemptCache.get(key);
  const src = read(absPath) || '';
  const map = new Map();
  for (const m of src.matchAll(/validator:allow-file\s+([A-Z]\d)\s*[—:-]\s*(.+?)\s*(?:-->|\*\/|$)/gm)) {
    map.set(m[1], m[2].trim());
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
      if (!(kv[1] in current)) current[kv[1]] = kv[2].trim();
    }
  });

  return { top, agents, path };
}

const dayNum = (v) => {
  if (v === undefined || v === null) return null;
  const m = String(v).match(/^P?(\d+)/);
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
  console.error(`FATAL: cannot read/parse ${rel(planPath)} — ${e.message}`);
  process.exit(2);
}

const LOOP_FILES = {
  loop_a: 'loop-a-interviews.yaml',
  loop_b: 'loop-b-legal.yaml',
  loop_c: 'loop-c-photo-listing.yaml',
  loop_d: 'loop-d-repeat-sellers.yaml',
  loop_e: 'loop-e-synthesis.yaml',
};

const loopYaml = {};
for (const [id, file] of Object.entries(LOOP_FILES)) {
  const parsed = readLoopYaml(join(GRAPH, file));
  if (!parsed) error('C2', file, 0, 'Loop file missing', `plan.json defines ${id}`);
  else loopYaml[id] = parsed;
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

  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    const file = LOOP_FILES[loopId] || loopId;

    for (const agent of loop.agents || []) {
      const touchesPeople = agent.data_class && agent.data_class !== 'none';
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
        const gate = gates[gateId];
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
  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    const y = loopYaml[loopId];
    if (!y) continue;
    const file = `graph/${LOOP_FILES[loopId]}`;

    const planNames = (loop.agents || []).map((a) => a.id);
    const yamlNames = y.agents.map((a) => a.name);

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
      if (s !== null && s !== agent.start_day)
        error('C2', file, ya._line, `${agent.id} start_day is P${s} in YAML, P${agent.start_day} in plan.json`);
      if (e !== null && e !== agent.end_day)
        error('C2', file, ya._line, `${agent.id} end_day is P${e} in YAML, P${agent.end_day} in plan.json`);
    }

    const ys = dayNum(y.top.start_day);
    const ye = dayNum(y.top.end_day);
    if (ys !== null && ys !== loop.start_day)
      error('C2', file, 0, `Loop start_day is P${ys} in YAML, P${loop.start_day} in plan.json`);
    if (ye !== null && ye !== loop.end_day)
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

  // exit-conditions.json must mirror plan.json exactly.
  let ec;
  try {
    ec = JSON.parse(read(join(GRAPH, 'exit-conditions.json')));
  } catch (e) {
    error('C2', 'graph/exit-conditions.json', 0, 'Unparseable JSON', e.message);
  }
  if (ec) {
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
      const yamlSrc = read(join(GRAPH, LOOP_FILES[loopId])) || '';
      const yamlMetrics = [...yamlSrc.matchAll(/^\s*-\s+metric:\s*(\S+)/gm)].map((m) => m[1]);
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
    }

    for (const [gid, gate] of Object.entries(plan.gates || {})) {
      const g = (ec.gates || {})[gid];
      if (!g) {
        error('C2', 'graph/exit-conditions.json', 0, `Missing gate ${gid}`);
        continue;
      }
      if (g.closes_end_of_day !== gate.closes_end_of_day)
        error('C2', 'graph/exit-conditions.json', 0,
          `${gid} closes P${g.closes_end_of_day}, plan.json says P${gate.closes_end_of_day}`);
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
          .filter((l) => plan.loops && plan.loops[l])),
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
      }
    }

    // Every gate in plan.json must be tracked, and no gate may be invented here.
    for (const gid of Object.keys(ec.gates || {}))
      if (!(plan.gates || {})[gid])
        error('C2', 'graph/exit-conditions.json', 0, `Tracks gate ${gid} which plan.json does not define`);

    // Milestones are executable graph nodes too, not decorative prose.
    const planMilestones = Object.fromEntries((plan.milestones || []).map((m) => [m.id, m]));
    const trackedMilestones = Object.fromEntries((ec.milestones || []).map((m) => [m.id, m]));
    for (const [id, milestone] of Object.entries(planMilestones)) {
      const tracked = trackedMilestones[id];
      if (!tracked)
        error('C2', 'graph/exit-conditions.json', 0, `Missing milestone ${id}`);
      else if (tracked.day !== milestone.day)
        error('C2', 'graph/exit-conditions.json', 0,
          `${id} is P${tracked.day}, plan.json says P${milestone.day}`);
    }
    for (const id of Object.keys(trackedMilestones))
      if (!planMilestones[id])
        error('C2', 'graph/exit-conditions.json', 0, `Tracks milestone ${id} which plan.json does not define`);
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
  const watched = [...excluded, ...adjacent];

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
  const numeric = [minimum, maximum, target, stretch].some((v) => typeof v === 'number');
  if (!numeric) return;

  if (!direction) {
    error('S2', file, 0, `${label}: numeric threshold with no "direction"`,
      'Every threshold declares higher_better, lower_better, binary or informational. Without it, "minimum" is ambiguous.');
    return;
  }

  if (direction === 'higher_better') {
    if (maximum !== undefined)
      error('S2', file, 0, `${label}: direction is higher_better but it defines "maximum"`,
        'A higher-is-better metric fails at a floor. Use "minimum".');
    const seq = [minimum, target, stretch].filter((v) => typeof v === 'number');
    if (seq.length > 1 && !seq.every((v, i) => i === 0 || seq[i - 1] <= v))
      error('S2', file, 0,
        `${label}: minimum ${minimum} / target ${target} / stretch ${stretch} is not monotonic for higher_better`,
        'This is the inversion that made v1.0 tables mean "floor" in one row and "ceiling" in the next.');
  } else if (direction === 'lower_better') {
    if (minimum !== undefined)
      error('S2', file, 0, `${label}: direction is lower_better but it defines "minimum"`,
        'A lower-is-better metric fails at a ceiling. Use "maximum" — writing the ceiling into "minimum" is exactly the v1.0 inversion.');
    const seq = [maximum, target, stretch].filter((v) => typeof v === 'number');
    if (seq.length > 1 && !seq.every((v, i) => i === 0 || seq[i - 1] >= v))
      error('S2', file, 0,
        `${label}: maximum ${maximum} / target ${target} / stretch ${stretch} is not monotonic for lower_better`,
        'For lower_better the sequence must descend: maximum >= target >= stretch.');
  } else if (direction !== 'binary' && direction !== 'informational') {
    error('S2', file, 0, `${label}: unknown direction "${direction}"`,
      'Valid: higher_better, lower_better, binary, informational.');
  }
}

if (run('S2')) {
  for (const [loopId, loop] of Object.entries(plan.loops || {})) {
    const byId = Object.fromEntries((loop.agents || []).map((a) => [a.id, a]));
    for (const agent of loop.agents || []) {
      if (agent.start_day > agent.end_day)
        error('S2', 'graph/plan.json', 0, `${loopId}.${agent.id} starts P${agent.start_day} after it ends P${agent.end_day}`);
      if (agent.start_day < loop.start_day || agent.end_day > loop.end_day)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} (P${agent.start_day}–P${agent.end_day}) falls outside its loop window P${loop.start_day}–P${loop.end_day}`);
      for (const dep of agent.depends_on || []) {
        const d = byId[dep];
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
      if (visited.has(id) || !byId[id]) return;
      visiting.add(id);
      for (const dep of byId[id].depends_on || []) visit(dep, [...path, id]);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of Object.keys(byId)) visit(id);
    for (const [metric, th] of Object.entries(loop.thresholds || {})) {
      if (metric.startsWith('$')) continue;
      checkDirection('graph/plan.json', `${loopId}.${metric}`, th);
    }
  }

  // A gate that claims an agent closes it must point to a real, matching agent
  // whose work ends on the gate's close day. Check the reverse link as well.
  for (const [gid, gate] of Object.entries(plan.gates || {})) {
    if (gate.owner_loop === null && gate.satisfied_by_agent === null) continue; // human gate (G3)
    const owner = (plan.loops || {})[gate.owner_loop];
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
      const gate = (plan.gates || {})[agent.closes_gate];
      if (!gate)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} closes unknown gate "${agent.closes_gate}"`);
      else if (gate.owner_loop !== loopId || gate.satisfied_by_agent !== agent.id)
        error('S2', 'graph/plan.json', 0,
          `${loopId}.${agent.id} closes ${agent.closes_gate}, but that gate points to ${gate.owner_loop}.${gate.satisfied_by_agent}`);
    }
  }

  const milestoneIds = new Set((plan.milestones || []).map((m) => m.id));
  for (const [gid, gate] of Object.entries(plan.gates || {})) {
    for (const blocked of toList(gate.blocks))
      if (!milestoneIds.has(blocked))
        error('S2', 'graph/plan.json', 0,
          `${gid}.blocks references unknown milestone "${blocked}"`);
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
    let ec2;
    try {
      ec2 = JSON.parse(read(join(GRAPH, 'exit-conditions.json')));
    } catch { /* C2 reports the parse failure */ }
    for (const [loopId, t] of Object.entries(ec2 || {})) {
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
      const d = (plan.loops || {})[dep];
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

  // A binary requirement due after its owner has closed has no owner. This is
  // why loop_e's legal_review and cto_review (due_day 26, loop ends P25) became
  // gate G3.
  {
    let ec3;
    try {
      ec3 = JSON.parse(read(join(GRAPH, 'exit-conditions.json')));
    } catch { /* reported by C2 */ }
    for (const [loopId, t] of Object.entries(ec3 || {})) {
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

if (asJson) {
  console.log(JSON.stringify({ errors: errors.length, warnings: warns.length, findings, exemptions }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

const printExemptions = () => {
  if (!exemptions.length) return;
  console.log('  Exemptions in force (declared in-file, each with a reason):');
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
  console.log('  All checks passed.\n');
  for (const [id, name] of Object.entries(CHECK_NAMES)) console.log(`    ok   ${id}  ${name}`);
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
console.log(`  ${errors.length} error(s), ${warns.length} warning(s)\n`);
process.exit(errors.length ? 1 : 0);
