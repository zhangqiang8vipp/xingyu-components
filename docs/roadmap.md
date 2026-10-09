# Roadmap — unique capabilities, not widget count

**Phase 0 — foundation (done):** independent React package, typed registry, render-only v1 document contract, safe source fallback, MCP capability manifest and CI.

**Phase 1 — exploration (done):** expand the palette experimentally to 40 visual and content blocks to establish schema, gallery and visualization quality.

**Phase 2 — Markdown-first simplification (done):** remove 16 components duplicating Markdown or existing primitives, resulting in **24** distinct, scoped components. No historical-protocol adapter or changes to XINGYU Web.

**Phase 2.5 — small hints and metric transitions (in review):** add `tip` and `metric_transition` as non-Markdown visual patterns. Support pill/inline/note variants and automatically computed numeric difference, with responsive gallery fixtures and strict tests.

**Phase 3 — acceptance and consumers:** validate real-browser mobile, dark/light, focus and accessibility; confirm successful GitHub Pages deployment; then pilot an agent-facing consumer. Keep the host's Markdown renderer as the only prose path.

**Phase 4 — extensibility where justified:** add new presentation patterns by composing existing visual components. Only introduce new primitives when Markdown and composition cannot solve the use case.

Before public npm release: select an explicit license, commit lockfile, reproducible dependency/a11y audits, semver/security policy and a verified consumer integration.

Constraints: no AI composer, document-authored scripts, secret exposure, host ACL, Markdown parser duplication or direct deployment of XINGYU Web.
