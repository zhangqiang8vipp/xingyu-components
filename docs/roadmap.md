# Roadmap — capabilities, not widget count

**Phase 0 — this initial scaffold:** a production-independent package boundary, trusted registry, render-only v1 contract, seven basic primitives, React renderer, MCP capability manifest, tests and component-only styles.

**Phase 1 — general composition (current):** expand from seven to 19 generic content/layout/data primitives under one new protocol, with bounded arrays, data tables, comparisons, timelines, progress and dependency-free SVG charts. Add a copyable showcase and validation/security tests. No legacy adapters or site changes.

**Phase 2 — depth and quality:** move toward 20–30 audited primitives, prioritizing keyboard-accessible tabs, safe source citations, more chart types and flexible layout. Reuse reviewed OSS libraries where practical, with SSR/mobile/dark tests, composition samples and stable theme tokens.

**Phase 3 — extensible ecosystem:** offer around 100+ **presentation patterns through composition**, not necessarily 100 unique components. Introduce optional framework adapters and model-agnostic capability discovery only when real consumers require them.

**Before public npm release:** choose a LICENSE with the owner, add a committed npm lockfile and reproducible CI, conduct accessibility and dependency audits, provide a real gallery/demo, write semver and security policies, and verify a fresh XINGYU Web integration of this new format when actually needed.

Constraints: no AI composer, no arbitrary executable content in documents, no secret exposure, no private ACL in a public UI package, no direct production deployment from component work.
