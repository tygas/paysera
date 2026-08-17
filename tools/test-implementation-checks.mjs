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
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const editJson = (path, fn) => {
  const o = JSON.parse(readFileSync(path, 'utf8'));
  fn(o);
  writeFileSync(path, JSON.stringify(o, null, 2));
};
const editText = (path, from, to) => {
  const s = readFileSync(path, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  const source = from.replace(/\r?\n/g, eol);
  const replacement = to.replace(/\r?\n/g, eol);
  const matches = s.split(source).length - 1;
  if (matches !== 1)
    throw new Error(`fixture anchor must occur exactly once in ${path}; found ${matches}: ${from}`);
  writeFileSync(path, s.replace(source, replacement));
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
    expect: /threshold with no "direction"/,
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
    what: 'the Loop-A outreach prose drifting from the approved incentive',
    expect: /interview outreach text is 40 EUR, plan.json says 20 EUR/,
    mutate: (d) => editText(join(d, 'graph/loop-a-interviews.yaml'),
      'Už pokalbį atsilyginame 20 EUR.', 'Už pokalbį atsilyginame 40 EUR.'),
  },
  {
    id: 'F12b',
    what: 'the G1 structured interview incentive drifting from plan.json',
    expect: /approved_incentives_eur.interviews is 40 EUR, plan.json says 20 EUR/,
    mutate: (d) => editText(join(d, 'graph/loop-b-legal.yaml'),
      'approved_incentives_eur: {interviews: 20, cohort: 25}',
      'approved_incentives_eur: {interviews: 40, cohort: 25}'),
  },
  {
    id: 'F12c',
    what: 'the Loop-D cashback prose drifting from the approved incentive',
    expect: /cohort cashback text is 40 EUR, plan.json says 25 EUR/,
    mutate: (d) => editText(join(d, 'graph/loop-d-repeat-sellers.yaml'),
      '25 EUR cashback už pirmą pardavimą', '40 EUR cashback už pirmą pardavimą'),
  },
  {
    id: 'F12d',
    what: 'an approved incentive copy being deleted instead of updated',
    expect: /interview outreach text must appear exactly once; found 0/,
    mutate: (d) => editText(join(d, 'graph/loop-a-interviews.yaml'),
      'Už pokalbį atsilyginame 20 EUR.', 'Už pokalbį atsilyginame pagal atskirai patvirtintą sumą.'),
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
  {
    id: 'F20',
    what: 'a missing exit-conditions.json failing closed as an execution error',
    status: 2,
    expect: /cannot read\/parse graph\/exit-conditions.json/,
    mutate: (d) => rmSync(join(d, 'graph/exit-conditions.json')),
  },
  {
    id: 'F21',
    what: 'an empty source-of-truth object failing closed',
    status: 2,
    expect: /missing required object/,
    mutate: (d) => writeFileSync(join(d, 'graph/plan.json'), '{}\n'),
  },
  {
    id: 'F22',
    what: 'an extra loop invented only in exit-conditions',
    expect: /Tracks loop loop_z which plan.json does not define/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_z = { agents: {}, metrics: {} };
    }),
  },
  {
    id: 'F23',
    what: 'an extra runtime agent not defined by the plan',
    expect: /loop_a tracks agent ghost_agent which plan.json does not define/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_a.agents.ghost_agent = { start_day: 1, end_day: 1, status: 'not_started' };
    }),
  },
  {
    id: 'F24',
    what: 'a YAML dependency edge drifting from plan.json',
    expect: /schedule_calls depends_on is \[\] in YAML, \[find_contacts\] in plan.json/,
    mutate: (d) => editText(join(d, 'graph/loop-a-interviews.yaml'),
      '  - name: schedule_calls\n    type: outreach + calendar\n    start_day: P9\n    end_day: P12\n    data_class: public_personal\n    depends_on: [find_contacts]',
      '  - name: schedule_calls\n    type: outreach + calendar\n    start_day: P9\n    end_day: P12\n    data_class: public_personal\n    depends_on: []'),
  },
  {
    id: 'F25',
    what: 'a missing executable YAML date',
    expect: /collect_test_photos has no valid YAML start_day/,
    mutate: (d) => editText(join(d, 'graph/loop-c-photo-listing.yaml'),
      '  - name: collect_test_photos\n    type: data_collection\n    start_day: P1',
      '  - name: collect_test_photos\n    type: data_collection'),
  },
  {
    id: 'F26',
    what: 'a YAML numeric threshold drifting from plan.json',
    expect: /test_photos.minimum is 7 in YAML, 8 in plan.json/,
    mutate: (d) => editText(join(d, 'graph/loop-c-photo-listing.yaml'),
      '    - metric: test_photos\n      minimum: 8',
      '    - metric: test_photos\n      minimum: 7'),
  },
  {
    id: 'F27',
    what: 'a YAML binary requirement identity drifting from plan.json',
    expect: /YAML binary_requirements is missing binary requirement "blind_review"/,
    mutate: (d) => editText(join(d, 'graph/loop-c-photo-listing.yaml'),
      '    - id: blind_review', '    - id: unblind_review'),
  },
  {
    id: 'F28',
    what: 'a gate block-list containing a dangling agent reference',
    expect: /G1.blocks_agents references unknown agent "loop_z.ghost"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.gates.G1.blocks_agents.push('loop_z.ghost');
    }),
  },
  {
    id: 'F29',
    what: 'a gate claiming to block an agent that starts before it closes',
    expect: /blocked agent loop_b.extract_compliance_docs starts P1/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.gates.G1.blocks_agents.push('loop_b.extract_compliance_docs');
    }),
  },
  {
    id: 'F30',
    what: 'a blocked milestone scheduled before its gate can close',
    expect: /G3 closes end of P26 but blocked milestone ceo_decision is P26/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => { o.milestones.find((m) => m.id === 'ceo_decision').day = 26; });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => { o.milestones.find((m) => m.id === 'ceo_decision').day = 26; });
    },
  },
  {
    id: 'F31',
    what: 'all Loop-E dependency edges being removed consistently from documents',
    expect: /loop_e.depends_on_loops must be \[loop_a, loop_b, loop_c, loop_d\]/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => { o.loops.loop_e.depends_on_loops = []; });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => { o.loop_e.depends_on_loops = []; });
      editText(join(d, 'graph/loop-e-synthesis.yaml'),
        'depends_on_loops: [loop_a, loop_b, loop_c, loop_d]', 'depends_on_loops: []');
    },
  },
  {
    id: 'F32',
    what: 'a numeric threshold encoded as text',
    expect: /loop_a.contacts_identified.minimum must be a number/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.loops.loop_a.thresholds.contacts_identified.minimum = '15';
    }),
  },
  {
    id: 'F33',
    what: 'a non-monotonic higher-is-better threshold',
    expect: /contacts_identified: minimum 25 \/ target 20 \/ stretch 30 is not monotonic/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.loops.loop_a.thresholds.contacts_identified.minimum = 25;
    }),
  },
  {
    id: 'F34',
    what: 'an untagged decimal rating claim',
    expect: /Untagged measured rating claim/,
    mutate: (d) => {
      const path = join(d, 'graph/pilot-brief-template.md');
      writeFileSync(path, readFileSync(path, 'utf8') + '\nMeasured quality was 7.5/10.\n');
    },
  },
  {
    id: 'F35',
    what: 'a later gitignore negation making personal-data output committable',
    expect: /later .gitignore rule makes content under graph\/output\/ committable/,
    mutate: (d) => {
      const path = join(d, '.gitignore');
      writeFileSync(path, readFileSync(path, 'utf8') + '\n!graph/output/leak.csv\n');
    },
  },
  {
    id: 'F36',
    what: 'an inherited Object.prototype name used as an agent dependency',
    expect: /depends on unknown agent "constructor"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.loops.loop_b.agents.find((a) => a.id === 'legal_basis_review').depends_on = ['constructor'];
    }),
  },
  {
    id: 'F37',
    what: 'a plan agent omitting its data classification',
    expect: /has missing or unknown data_class "undefined"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      delete o.loops.loop_c.agents[0].data_class;
    }),
  },
  {
    id: 'F38',
    what: 'forbidden AML/KYC special data being introduced into recruitment',
    expect: /uses forbidden customer_special data/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => {
        o.loops.loop_d.agents.find((a) => a.id === 'query_paysera_transactions').data_class = 'customer_special';
      });
      editText(join(d, 'graph/loop-d-repeat-sellers.yaml'),
        '  - name: query_paysera_transactions\n    type: database_query\n    start_day: P7\n    end_day: P9\n    data_class: customer_personal',
        '  - name: query_paysera_transactions\n    type: database_query\n    start_day: P7\n    end_day: P9\n    data_class: customer_special');
    },
  },
  {
    id: 'F39',
    what: 'a gate marked closed without a named written decision',
    expect: /G1 is closed without decided_by and decided_at/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.gates.G1.status = 'closed';
    }),
  },
  {
    id: 'F40',
    what: 'regulated gate evidence removed from both source and tracker',
    expect: /G1.evidence_keys must be \[lawful_basis_per_purpose/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => {
        o.gates.G1.evidence_keys = o.gates.G1.evidence_keys.filter((key) => key !== 'permitted_external_sources');
      });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => {
        delete o.gates.G1.deliverables_received.permitted_external_sources;
      });
    },
  },
  {
    id: 'F41',
    what: 'a loop marked complete while metrics and binary requirements are unmet',
    expect: /loop_b is complete but its target metrics or binary requirements are not all met/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_b.status = 'complete';
      for (const agent of Object.values(o.loop_b.agents)) agent.status = 'complete';
    }),
  },
  {
    id: 'F42',
    what: 'a downstream agent running before its dependency completes',
    expect: /map_to_pilot_scope is in_progress while dependency conduct_legal_consultation is not_started/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_b.agents.map_to_pilot_scope.status = 'in_progress';
    }),
  },
  {
    id: 'F43',
    what: 'an exit-condition output path drifting from plan.json',
    expect: /loop_c.outputs drift from plan.json/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_c.outputs.pop();
    }),
  },
  {
    id: 'F44',
    what: 'an arbitrary runtime state value',
    expect: /loop_c.status is missing or invalid: "running"/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_c.status = 'running';
    }),
  },
  {
    id: 'F45',
    what: 'G2 prose allowing Loop-E to proceed while the gate is open',
    expect: /G2 text says Loop-E proceeds while the gate is open/,
    mutate: (d) => {
      const path = join(d, 'graph/loop-e-synthesis.yaml');
      writeFileSync(path, readFileSync(path, 'utf8') + '\nG2 NEUŽDAROMAS, tačiau Loop-E vis tiek vyksta.\n');
    },
  },
  {
    id: 'F46',
    what: 'a checked file trying to exempt itself from language validation',
    expect: new RegExp('Known bad token: "Untuk ' + 'setiap"'),
    mutate: (d) => {
      const path = join(d, 'graph/README.md');
      writeFileSync(path, readFileSync(path, 'utf8') +
        '\n<!-- validator:allow-file C5 — self approval -->\n' + 'Untuk ' + 'setiap\n');
    },
  },
  {
    id: 'F47',
    what: 'eBay made primary after removing its policy entry',
    expect: /"eBay" named without a scope justification/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => {
        o.market_scope.excluded = o.market_scope.excluded.filter((item) => item.name !== 'eBay');
        o.market_scope.primary_competitors.push({ name: 'eBay' });
      });
      const path = join(d, 'graph/README.md');
      writeFileSync(path, readFileSync(path, 'utf8') + '\nPrimary price source: eBay.\n');
    },
  },
  {
    id: 'F48',
    what: 'a gated agent omitted from its gate membership',
    expect: /loop_a.find_contacts is gated by G1 but is not listed in G1.blocks_agents/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.gates.G1.blocks_agents = o.gates.G1.blocks_agents.filter((ref) => ref !== 'loop_a.find_contacts');
    }),
  },
  {
    id: 'F49',
    what: 'a measurement definition losing its direction',
    expect: /measurement_definitions.listing_time_minutes: threshold with no "direction"/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      delete o.measurement_definitions.listing_time_minutes.direction;
    }),
  },
  {
    id: 'F50',
    what: 'a required publication gate being deleted consistently',
    expect: /Missing required gate "G3"/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => { delete o.gates.G3; });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => { delete o.gates.G3; });
    },
  },
  {
    id: 'F51',
    what: 'the global research-data deletion control renamed out of existence',
    expect: /data_retention.control_id must be "research_data_deletion"/,
    mutate: (d) => {
      editJson(join(d, 'graph/plan.json'), (o) => { o.data_retention.control_id = 'disabled'; });
      editJson(join(d, 'graph/exit-conditions.json'), (o) => { o.data_retention.control_id = 'disabled'; });
    },
  },
  {
    id: 'F52',
    what: 'G1 closing while the retention owner and due date remain unresolved',
    expect: /G1 is closed but data_retention owner, period, or due date is still unresolved/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      const gate = o.gates.G1;
      gate.status = 'closed';
      gate.decided_by = 'Named DPO';
      gate.decided_at = '2026-08-16T12:00:00Z';
      for (const key of Object.keys(gate.deliverables_received)) gate.deliverables_received[key] = true;
    }),
  },
  {
    id: 'F53',
    what: 'strict publication mode turning a warning into a blocking result',
    args: ['--strict'],
    expect: /Primary LT competitor "GhostMarket" is never mentioned/,
    mutate: (d) => editJson(join(d, 'graph/plan.json'), (o) => {
      o.market_scope.primary_competitors.push({ name: 'GhostMarket' });
    }),
  },
  {
    id: 'F54',
    what: 'a closed G1 encoding the retention period as text',
    expect: /Closed G1 requires a positive integer retention_days/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      const gate = o.gates.G1;
      gate.status = 'closed';
      gate.decided_by = 'Named DPO';
      gate.decided_at = '2026-08-16T12:00:00Z';
      for (const key of Object.keys(gate.deliverables_received)) gate.deliverables_received[key] = true;
      o.data_retention.status = 'scheduled';
      o.data_retention.retention_days = '30';
      o.data_retention.deletion_owner = 'Named owner';
      o.data_retention.deletion_due = '2026-09-15';
    }),
  },
  {
    id: 'F55',
    what: 'a safety-metric definition drifting between plan and tracker',
    expect: /loop_c.hallucination_rate_pct.definition is "visible only"/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_c.metrics.hallucination_rate_pct.definition = 'visible only';
    }),
  },
  {
    id: 'F56',
    what: 'a binary requirement silently allowing a substitute',
    expect: /loop_d.no_kyc_aml_reuse.substitute_allowed must be false/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.loop_d.binary_requirements.no_kyc_aml_reuse.substitute_allowed = true;
    }),
  },
  {
    id: 'F57',
    what: 'pilot metadata drifting from the source of truth',
    expect: /pilot.category is "used_electronics", plan.json says "used_electronics_phones_laptops"/,
    mutate: (d) => editJson(join(d, 'graph/exit-conditions.json'), (o) => {
      o.pilot.category = 'used_electronics';
    }),
  },
  {
    id: 'F58',
    what: 'an invalid YAML double-quoted scalar with an unescaped inner quote',
    expect: /Invalid YAML scalar: double-quoted scalar contains 3 unescaped quote characters/,
    mutate: (d) => editText(join(d, 'graph/loop-e-synthesis.yaml'),
      "      minimum: '1 persona su žymomis ir „ko nežinome“ skyriumi'",
      '      minimum: "1 persona su žymomis ir „ko nežinome" skyriumi"'),
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

    const child = spawnSync(process.execPath, [join(dir, 'tools/validate-graph.mjs'), '--json', ...(c.args || [])], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 30_000,
    });
    if (child.error) throw child.error;
    if (child.signal) throw new Error(`validator terminated by ${child.signal}`);
    const expectedStatus = c.status ?? 1;
    if (child.status === 2 && expectedStatus !== 2)
      throw new Error(`validator could not run:\n${child.stdout}${child.stderr}`);

    let report;
    try {
      report = JSON.parse(child.stdout);
    } catch (e) {
      throw new Error(`validator returned invalid JSON: ${e.message}\n${child.stdout}${child.stderr}`);
    }
    const reportFindings = report.findings || [];
    const out = [report.fatal, ...reportFindings
      .flatMap((finding) => [finding.check, finding.file, finding.message, finding.detail])
    ].filter(Boolean)
      .join('\n');

    if (child.status === expectedStatus && c.expect.test(out)) {
      console.log(`    ok      ${c.id.padEnd(5)} ${c.what}`);
    } else {
      failed++;
      console.log(`    FAIL    ${c.id.padEnd(5)} ${c.what}`);
      console.log(`            validator exit: ${child.status} (expected ${expectedStatus})`);
      console.log(`            expected output matching ${c.expect}`);
      console.log(`            validator said:\n${out.split('\n').map((l) => '              ' + l).join('\n')}`);
    }
  } catch (e) {
    failed++;
    console.log(`    ERROR   ${c.id.padEnd(5)} ${c.what}`);
    console.log(`            ${e.message}`);
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
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
