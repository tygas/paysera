#!/usr/bin/env node
/**
 * test-implementation-checks.mjs — mutation tests for the checks added on
 * 2026-08-16 after the implementation audit.
 *
 * WHY THIS EXISTS
 * ---------------
 * `test-validator.mjs` proves the validator still fails the v1.0 tree. It
 * cannot prove that a NEW check works, because v1.0 predates the structures the
 * new checks read — v1.0 has no `direction`, no `depends_on_loops`, no G3.
 *
 * The finding that motivated this file is F1: C2's gate/status check read
 * `blocks_loops` off the plan.json gates, which have never had that key. It
 * iterated an empty array on every run and reported nothing, for as long as it
 * existed, while INDEX.md told readers "The validator enforces this". A green
 * validator run is not evidence that a check runs.
 *
 * So each case below reintroduces one defect into a temporary copy of the tree
 * and asserts the validator reports it. A check that cannot be made to fail is
 * not a check.
 *
 * USAGE
 *   node tools/test-implementation-checks.mjs
 *
 * EXIT CODES
 *   0  every check detected its defect
 *   1  one or more checks failed to detect the defect it exists for
 */

import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const editJson = (path, fn) => {
  const o = JSON.parse(readFileSync(path, 'utf8'));
  fn(o);
  writeFileSync(path, JSON.stringify(o, null, 2));
};
const editText = (path, from, to) => {
  const s = readFileSync(path, 'utf8');
  if (!s.includes(from)) throw new Error(`fixture anchor not found in ${path}: ${from}`);
  writeFileSync(path, s.replace(from, to));
};

const CASES = [
  {
    id: 'F1',
    what: 'a gated loop tracked as running while its gate is still open',
    expect: /G1 is "pending" but loop_d status is "in_progress"/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_d.status = 'in_progress';
    }),
  },
  {
    id: 'F1b',
    what: 'blocks_loops silently disagreeing with blocks_agents',
    expect: /blocks_loops .* but blocks_agents implies/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.gates.G1.blocks_loops = ['loop_a'];
    }),
  },
  {
    id: 'F2',
    what: 'an abbreviated agent name in a prose diagram',
    expect: /"recruit_cohort" is shaped like an agent id but matches no agent/,
    mutate: (d) => editText(join(d, 'graph/README.md'),
      'P11–P17 recruit_pilot_cohort', 'P11–P17 recruit_cohort      '),
  },
  {
    id: 'F3',
    what: 'a loop processing personal data behind a non-lawful-basis gate only',
    expect: /is not gated on G1/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => {
        o.loops.loop_e.gated_by = ['G2'];
      });
      editText(join(d, 'graph/loop-e-synthesis.yaml'), 'gated_by: [G1, G2]', 'gated_by: [G2]');
    },
  },
  {
    id: 'F4',
    what: 'a lower-is-better metric writing its ceiling into "minimum"',
    expect: /direction is lower_better but it defines "minimum"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      const m = o.loops.loop_c.thresholds.hallucination_rate_pct;
      delete m.maximum;
      m.minimum = 5;
    }),
  },
  {
    id: 'F4b',
    what: 'a numeric threshold with no declared direction',
    expect: /numeric threshold with no "direction"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      delete o.loops.loop_a.thresholds.contacts_identified.direction;
    }),
  },
  {
    id: 'F5',
    what: 'a metric tracked in exit-conditions that the source of truth does not define',
    expect: /tracks metric "invented_metric" which plan.json does not define/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_c.metrics.invented_metric = { direction: 'higher_better', minimum: 1, target: 2, stretch: 3 };
    }),
  },
  {
    id: 'F6',
    what: 'a YAML exit-condition metric that exists in no other file',
    expect: /YAML exit_conditions lists metric "ghost_metric"/,
    mutate: (d) => editText(join(d, 'graph/loop-b-legal.yaml'),
      '    - metric: legal_meetings_completed', '    - metric: ghost_metric\n      direction: higher_better\n      minimum: 1\n\n    - metric: legal_meetings_completed'),
  },
  {
    id: 'F7',
    what: 'a loop starting before a loop it declares a dependency on has finished',
    expect: /loop_e starts P21 but its dependency loop_a runs to P24/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.loops.loop_a.end_day = 24;
      o.loops.loop_a.agents[3].end_day = 24;
    }),
  },
  {
    id: 'F8',
    what: 'a binary requirement due after its own loop has closed',
    expect: /is due P26 but loop_e runs P21–P25/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_e.binary_requirements.legal_review = { due_day: 26, met: null, substitute_allowed: false };
    }),
  },
  {
    id: 'F12',
    what: 'an incentive amount in a YAML prompt drifting from the approved figure',
    expect: /incentive_eur is 40 in the YAML, 20 in plan.json/,
    mutate: (d) => editText(join(d, 'graph/loop-a-interviews.yaml'),
      '      incentive_eur: 20', '      incentive_eur: 40'),
  },
  {
    id: 'F15',
    what: 'a YAML agent naming a different gate than its loop is gated on',
    expect: /declares requires_gate: \[G2\] but plan.json gates its loop on \[G1\]/,
    mutate: (d) => editText(join(d, 'graph/loop-d-repeat-sellers.yaml'),
      '  - name: recruit_pilot_cohort\n    type: outreach + consent_management\n    start_day: P11\n    end_day: P17\n    data_class: customer_personal\n    depends_on: [enrich_seller_profiles]\n    requires_gate: [G1]',
      '  - name: recruit_pilot_cohort\n    type: outreach + consent_management\n    start_day: P11\n    end_day: P17\n    data_class: customer_personal\n    depends_on: [enrich_seller_profiles]\n    requires_gate: [G2]'),
  },
  {
    id: 'F16',
    what: 'a gate pointing to an agent that does not close it',
    expect: /G1 points to loop_b\.legal_basis_review, but that agent closes "G2"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.loops.loop_b.agents[1].closes_gate = 'G2';
    }),
  },
  {
    id: 'F17',
    what: 'a milestone day drifting from the source of truth',
    expect: /ceo_decision is P29, plan.json says P27/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.milestones.find((m) => m.id === 'ceo_decision').day = 29;
    }),
  },
  {
    id: 'F18',
    what: 'a gate blocking a graph node that does not exist',
    expect: /G3\.blocks references unknown milestone "ceo_presentation"/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => { o.gates.G3.blocks = ['ceo_presentation']; });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => { o.gates.G3.blocks = ['ceo_presentation']; });
    },
  },
  {
    id: 'F19',
    what: 'a same-day circular dependency between agents',
    expect: /agent dependency cycle/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      const agents = o.loops.loop_e.agents;
      agents[1].depends_on = ['generate_workflow_checklist'];
      agents[2].depends_on = ['create_persona'];
    }),
  },
];

console.log('\n  mutation tests — checks added 2026-08-16\n');
console.log('  Each case reintroduces one defect and asserts the validator reports it.\n');

let failed = 0;

// Sanity gate: the clean tree must pass, or every result below is meaningless.
try {
  execFileSync('node', [join(ROOT, 'tools/validate-graph.mjs')], { cwd: ROOT, encoding: 'utf8' });
} catch {
  console.error('  FATAL: the clean tree does not pass. Fix that before reading these results.\n');
  process.exit(1);
}

for (const c of CASES) {
  const dir = mkdtempSync(join(tmpdir(), 'graphcheck-'));
  try {
    cpSync(join(ROOT, 'graph'), join(dir, 'graph'), { recursive: true });
    cpSync(join(ROOT, 'tools'), join(dir, 'tools'), { recursive: true });
    cpSync(join(ROOT, '.gitignore'), join(dir, '.gitignore'));

    c.mutate(dir);

    let out = '';
    try {
      out = execFileSync('node', [join(dir, 'tools/validate-graph.mjs')], { cwd: dir, encoding: 'utf8' });
      // exit 0 means the defect went undetected
    } catch (e) {
      out = (e.stdout || '') + (e.stderr || '');
    }

    if (c.expect.test(out)) {
      console.log(`    ok      ${c.id.padEnd(5)} ${c.what}`);
    } else {
      failed++;
      console.log(`    FAIL    ${c.id.padEnd(5)} ${c.what}`);
      console.log(`            expected output matching ${c.expect}`);
      console.log(`            validator said:\n${out.split('\n').map((l) => '              ' + l).join('\n')}`);
    }
  } catch (e) {
    failed++;
    console.log(`    ERROR   ${c.id.padEnd(5)} ${c.what}`);
    console.log(`            ${e.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log('');
if (failed) {
  console.log(`  ${failed} of ${CASES.length} checks did not detect the defect they exist for.\n`);
  process.exit(1);
}
console.log(`  All ${CASES.length} checks detected their defect. A check that cannot be`);
console.log('  made to fail is not a check — that is what F1 was.\n');
process.exit(0);
