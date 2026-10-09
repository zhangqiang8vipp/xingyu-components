# Markdown-first component boundary

**Markdown owns ordinary document structure.** This repository owns validated, specialized visual expression. It is not a replacement text authoring format or a new Markdown parser.

## Prefer Markdown

Use the host Markdown renderer for paragraphs, headings, blockquotes, emphasis, dividers, fenced code, numbered/bullet/nested lists, task lists, ordinary links, citations and Markdown tables. Simple instruction steps, key/value tables and two-column comparisons also belong there.

## Experimental types pruned before merge

The 40-component development branch was reduced to 24 by removing these 16 Markdown-equivalent or overlapping types:

```text
text, heading, quote, bullet_list, numbered_list,
code_block, divider, table, checklist, sources,
tree_view, key_value, comparison, steps, flowchart, disclosure
```

They are not registered in the package, advertised in the agent-facing capability manifest or shown in the gallery. If source JSON still requests them, the strict parser rejects the document and the renderer safely displays the escaped original source. There is **no silent migration**; XINGYU Web never adopted this experimental protocol.

The single-item `disclosure` is subsumed by the retained multi-item `accordion`. The simple linear `flowchart` was an ordered list, not a general diagram engine. `link_cards` remains because a responsive **card layout** is materially different from an ordinary Markdown link.

## Guardrails for new components

1. Demonstrate value beyond the host's existing Markdown support.
2. Check whether existing blocks can be combined instead.
3. Only trusted code adds schema, renderer, scoped CSS, validated fixture and security/accessibility tests.
4. Do not run authored code, auto-fetch remote content, introduce hidden document writes or add legacy adapters without a verified consumer.
5. Once consumers rely on a published release, preserve its protocol or explicitly version migrations.

## Distinct lightweight additions

- `tip` provides a visual status pill, inline icon hint and small note presentation. This is more than a plain Markdown label or blockquote; the tone is **author-provided**, never validated as real-time truth.
- `metric_transition` relates two numeric counts and computes their absolute difference. This is not a replacement Markdown table or a repeat of the single-value `metric` card.
- Red rectangles in example screenshots are reviewer annotations, not component borders. Both additions preserve source validation and block-only JSON rendering.
