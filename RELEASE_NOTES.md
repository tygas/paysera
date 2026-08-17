# Release notes

## 2026-08-16 — Graph and tooling hardening

### Fixed

- Made graph validation fail closed for missing or malformed source files, incomplete schemas, and unknown checks.
- Expanded cross-document drift detection across agents, outputs, dependencies, binary requirements, metric definitions, pilot metadata, and threshold types.
- Added runtime state-machine validation for gate closure evidence, loop and agent statuses, dependency completion, milestones, and metric-backed completion states.
- Removed G1 and G2 bypass paths: a denied G1 purpose requires graph revision, and Loop-E remains blocked until G2 closes.
- Prohibited recruitment use of AML/KYC, identity-verification, dispute data, and eligibility decisions derived from those sources.
- Removed personal and live-marketplace data from the ungated Loop-C workflow and aligned device scope, ground truth, hallucination definitions, and actual sample-size reporting.
- Added a durable research-data deletion control that remains tracked after the P30 preparation graph until named deletion evidence is recorded.
- Fixed mutation-test false positives caused by ignored validator exit codes, temporary-directory leaks, and CRLF-sensitive fixture anchors.
- Hardened the pre-publish guard against case changes, Windows executable names, Git options, shell wrappers, command continuations, and staged/working-tree time-of-check differences.
- Centralized validator exemptions so a checked file cannot exempt itself.

### Added

- Strict validator mode in which warnings block publication.
- Exact gate evidence-key validation for G1, G2, and G3.
- Runtime reconciliation of loop completion, below-target completion, failure states, metrics, and binary requirements.
- `tools/test-pre-publish-guard.mjs` for command-detection, fail-closed, full-suite, and snapshot-integrity testing.
- Expanded adversarial mutation coverage from 16 cases to 58 cases.

### Verification

- `node tools/validate-graph.mjs --strict` passes.
- `node tools/test-validator.mjs` passes and reports 413 findings against the historical pre-audit graph.
- `node tools/test-implementation-checks.mjs` detects all 58 injected defects.
- `node tools/test-pre-publish-guard.mjs` passes all guard scenarios.
- JavaScript syntax checks and `git diff --check` pass.
