# Decision record: A2UI-first, no more bespoke visual widgets

Status: **pilot / not adopted**. Owner: XINGYU Components. No production changes.

## Why

Maintaining one React implementation for every visual variant does not scale. Adopt a standardized declarative UI language and official renderer for generic composition; write custom React only for approved capabilities that the standard basic catalog cannot express. Preserve Markdown as the only general prose renderer in the host.

## References and actual compatibility

- A2UI protocol (current production): https://github.com/a2ui-project/a2ui/blob/main/specification/v0_9_1/docs/a2ui_protocol.md
- Upstream React renderer: https://github.com/a2ui-project/a2ui/blob/main/renderers/react/README.md
- Official basic catalog: https://github.com/a2ui-project/a2ui/blob/main/specification/v0_9_1/catalogs/basic/catalog.json

A2UI uses `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface` to convey a component graph and content. `@a2ui/web_core` owns processing/state, and `@a2ui/react` renders the surface. The upstream library's versioned entry point is `/v0_9`; compatibility with the `v0.9.1` wire envelope must be verified by the pilot rather than inferred from the path.

**Important**: The v0.9.1 basic catalog does not specify a generic `Badge`, `Chart`, semantic callout tones, or HTML/CSS supplied by the agent. Arbitrary SVG path is allowed by the upstream Icon schema but is intentionally blocked for this pilot. HTML, JS, URL and actions are likewise not accepted.

## Responsibilities

| Layer | Responsibility |
| --- | --- |
| Host Markdown | Ordinary paragraphs, headings, tables, lists, links, code and citations |
| Agent | Choose components from *approved* catalog and supply factual, bounded properties and data |
| A2UI | Surface messages, flat component graph, data binding, standard catalog, lifecycle |
| Official React renderer | Component tree, rendering, binding updates |
| XINGYU theme & presets | Consistent appearance, reuse of generic compositions, no new wire protocol |
| Optional trusted extensions | Charts, special interaction or read-only progress not available in basic catalog |
| XINGYU Web / Typora | Host adapters, authorization, data provenance, persistence, sandbox and actions |

## Review of all 26 current experimental types

| Existing type | Proposed path | Notes |
| --- | --- | --- |
| `callout` | Composition + theme | Card, Row, Icon, Text; exact status colors need host design token |
| `metric` | Composition | Column(Text label, Text value) |
| `stack` | Composition | Column |
| `grid` | Composition + responsive host layout | Row/Column; breakpoint behavior must be validated |
| `badge` | Composition + theme | Icon + Text; upstream lacks generic pill/background |
| `progress` | Trusted extension | Do not misuse interactive Slider for read-only progress |
| `timeline` | Composition + theme | Repeated Rows/Columns; graphical connectors are visual enhancement |
| `bar_chart` | Trusted chart extension | Not in basic catalog |
| `accordion` | Trusted interaction extension | Tabs/Modal are not equivalent to disclosure |
| `status_list` | Composition + theme | List/Column, Icon, Text |
| `line_chart` | Trusted chart extension | Not in basic catalog |
| `pie_chart` | Trusted chart extension | Not in basic catalog |
| `pros_cons` | Composition | Row of two Cards and Text |
| `glossary` | Composition | Column of term/definition pairs |
| `tag_list` | Composition + theme | Row/Text, small pill appearance from theme |
| `panel` | Composition | Card/Column/Text |
| `hero` | Composition + theme | Column/Text with variants and spacing |
| `link_cards` | Trusted link/navigation adapter | Basic Card/Text cannot safely implement arbitrary navigation |
| `stacked_bar_chart` | Trusted chart extension | Not in basic catalog |
| `scatter_chart` | Trusted chart extension | Not in basic catalog |
| `heatmap` | Trusted chart extension | Not in basic catalog |
| `rating_group` | Composition with numeric display | Repeat Icon/Row/Text; preserve accessible score |
| `agenda` | Composition | Column/Rows, Text |
| `kanban_board` | Composition + responsive host layout | Columns/Cards; maintain read-only semantics |
| `tip` | Composition + theme | Row/Icon/Text or Card; status is authored, not verified |
| `metric_transition` | Composition + deterministic calculation | Row/Columns/Text; derive delta in trusted code from two values |

This is an **evaluation matrix**, not evidence that all 26 have been migrated, are pixel-identical, or meet WCAG.

## Migration gates

1. **Pilot**: Pin official packages in isolated experiment, run standard envelope through official processor + renderer, show at least three combinations.
2. **Security**: Bound nodes/characters/depth, allowlist catalog, disallow arbitrary remote resources, actions and SVG, check malformed stream/cycles and unknown fields.
3. **Real browser acceptance**: Test narrow viewport and the official React rendering in Chromium, with screenshot artifact. Then separately inspect dark/light, keyboard navigation, screen-reader semantics, reactive data updates and CSS fidelity. CI build success alone is not full visual acceptance.
4. **Choose version**: Verify production v0.9.1 compatibility in the actual published dependencies and pin them with a reproducible lockfile before consumer adoption.
5. **SSR boundary**: Official v0.12.0 A2uiSurface cannot SSR via React renderToStaticMarkup without getServerSnapshot. Do not claim static/server rendering parity; use verified client React path until upstream fixes it or a reviewed host adapter exists.
6. **Only after pilot passes**: Design stable host adapter and migration story; preserve current `xingyu-document/v1` sources until a consumer is tested. No silent persisted document conversion.
7. **Adopt later**: XINGYU Web / Typora integration in separate reviewed PR with ACL and tenancy tests, and host-owned action handling.

**Explicit non-goals**: new custom Markdown renderer, rewriting or deleting the 26 existing implementations, changing main site, auto-publishing to npm, claiming official renderer magically implements every design primitive.
