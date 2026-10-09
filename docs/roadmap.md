# Roadmap — capabilities, not widget count

**Phase 0 — this initial scaffold:** a production-independent package boundary, trusted registry, render-only v1 contract, seven basic primitives, React renderer, MCP capability manifest, tests and component-only styles.

**Phase 1 — product compatibility:** write an adapter for existing XINGYU Web `xingyu-block` Markdown fences and the original nine component semantics. Test old documents byte-for-byte through a dedicated integration PR. No silent schema migration.

**Phase 2 — general composition:** build a documented primitive set (roughly 20–30), such as tabs, accessible tables, status badges, source citations, additional charts and layout. Reuse audited OSS libraries where practical rather than writing one widget per appearance. Keep mobile/dark/read-only budgets.

**Phase 3 — extensible ecosystem:** offer around 100+ **presentation patterns through composition**, not necessarily 100 unique components. Introduce optional framework adapters and model-agnostic capability discovery only when real consumers require them.

**Before public npm release:** choose a LICENSE with the owner, add a committed npm lockfile and reproducible CI, conduct accessibility and dependency audits, provide a real gallery/demo, write semver and security policies, and explicitly version compatibility with existing XINGYU Web content.

Constraints: no AI composer, no arbitrary executable content in documents, no secret exposure, no private ACL in a public UI package, no direct production deployment from component work.
