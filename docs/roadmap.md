# Roadmap — capabilities, not widget count

**Phase 0 — this initial scaffold:** a production-independent package boundary, trusted registry, render-only v1 contract, seven basic primitives, React renderer, MCP capability manifest, tests and component-only styles.

**Phase 1 — general composition (done):** seven to 19 audited primitives under one `xingyu-document/v1` protocol, with responsive data tables, compare/timeline/progress, static SVG bars and real-renderer gallery. No legacy adapters or site changes.

**Phase 2 — editorial depth (current):** 19 to 30 approved primitives, including native keyboard-friendly accordion, read-only checklists/status, escaped code, validated HTTPS citation sources, static line/pie charts with original data, flowchart, pros/cons, glossary and topics. Extend strict schema tests and automatically generated gallery previews. Browser-dependent tab hydration remains a future task, not a fake static preview.

**Phase 3 — information and data patterns (in review):** 30 to 40 components. Add panel/hero, curated resource cards, hierarchy, stacked bar, scatter, heatmap, ratings, agenda and read-only kanban. Keep v1 protocol, static SSR, accessible data tables and existing trust boundaries. Run CI and real browser review before merging.

**Phase 4 — extensible ecosystem:** offer around 100+ **presentation patterns through composition**, not necessarily 100 unique components. Introduce optional framework adapters and model-agnostic capability discovery only when real consumers require them.

**Before public npm release:** choose a LICENSE with the owner, add a committed npm lockfile and reproducible CI, conduct accessibility and dependency audits, provide a real gallery/demo, write semver and security policies, and verify a fresh XINGYU Web integration of this new format when actually needed.

Constraints: no AI composer, no arbitrary executable content in documents, no secret exposure, no private ACL in a public UI package, no direct production deployment from component work.
