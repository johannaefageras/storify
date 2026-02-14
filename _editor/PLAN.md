# Editor Toolbar — Implementation Plan

## Context

The current `_editor/` prototype has a minimal toolbar with text-label buttons (B, E, S, H1-H3, lists, blockquote, undo/redo). We're replacing it with a proper toolbar matching the full feature set below. All buttons use SVG icons (inline in JS) instead of text labels.

---

## Full Feature List

| # | Feature | Type | Tiptap Extension |
|---|---------|------|------------------|
| 1 | Undo | icon button | `StarterKit` (History) — already included |
| 2 | Redo | icon button | `StarterKit` (History) — already included |
| 3 | Text alignment (left, center, right, justify) | icon button group | `@tiptap/extension-text-align` — **new dep** |
| 4 | Font family dropdown | custom select | `@tiptap/extension-font-family` + `@tiptap/extension-text-style` — **new deps** |
| 5 | Italic toggle | icon button | `StarterKit` (Italic) — already included |
| 6 | Font size input (+/−) | number input with buttons | `@tiptap/extension-font-size` or custom via `TextStyle` — **new dep** |
| 7 | Font weight dropdown (font-dependent) | custom select | Custom extension via `TextStyle` `span[style]` — no extra dep |
| 8 | Block type presets (H1-H4, paragraph, blockquote) | custom select/dropdown | `StarterKit` (Heading, Blockquote) — already included; add level 4 |
| 9 | Element-level selection on click | editor behavior | ProseMirror `NodeSelection` + custom plugin |
| 10 | Clear formatting | icon button | `@tiptap/extension-text-style` (for `unsetAllMarks()` + `clearNodes()`) |
| 11 | Link insert/edit | icon button + popover | `@tiptap/extension-link` — **new dep** |
| 12 | Horizontal divider | icon button | `StarterKit` (HorizontalRule) — already included |
| 13 | Indent / outdent | icon button pair | Custom commands using `sinkListItem` / `liftListItem` + blockquote/paragraph margin |

---

## New Dependencies

```
npm install @tiptap/extension-text-align @tiptap/extension-font-family @tiptap/extension-text-style @tiptap/extension-link
```

`@tiptap/extension-text-style` is a peer dependency for font-family and font-size. Font size will be implemented as a custom extension that writes `font-size` to the `style` attribute via TextStyle.

Font weight will be a lightweight custom extension that sets `font-weight` on TextStyle spans.

---

## Toolbar Layout (left → right)

```
[ Undo ] [ Redo ]
|
[ Block Type ▾ ]  (H1, H2, H3, H4, Paragraph, Blockquote)
|
[ Font Family ▾ ]
[ Font Weight ▾ ]  (dependent on selected font)
[ − ] [ size ] [ + ]
|
[ Italic ] [ Clear Formatting ]
|
[ Align Left ] [ Align Center ] [ Align Right ] [ Align Justify ]
|
[ Indent ] [ Outdent ]
|
[ Link ] [ Divider ]
```

Separators (`|`) between logical groups. The toolbar wraps on narrow screens via `flex-wrap: wrap`.

---

## File Changes

### `package.json` — add 4 new dependencies

### `main.js` — rewrite editor setup

- Import and register new extensions:
  - `TextAlign.configure({ types: ['heading', 'paragraph'] })`
  - `FontFamily`
  - `TextStyle`
  - `Link.configure({ openOnClick: false })` (so clicks don't navigate away)
- Expand heading levels to `[1, 2, 3, 4]`
- Import new toolbar builder

### `toolbar.js` — full rewrite

Current approach: flat array of `{ label, cmd, active }` objects creating `<button>` elements.

New approach: a `buildToolbar(editor, container)` function that creates grouped sections. Each group is either:
- **Icon buttons** — `<button class="toolbar-btn">` with inline SVG
- **Custom selects** — `<div class="toolbar-select">` with a trigger button + dropdown panel
- **Number input** — `<div class="toolbar-number">` with `−`, `<input>`, `+`

#### Icon set

All icons as small inline SVG strings (~18×18 viewBox) in an `icons.js` module. Keeps them co-located, no external icon library. Icons needed:

- `undo`, `redo`
- `italic`, `clearFormatting`
- `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`
- `indent`, `outdent`
- `link`, `horizontalRule`
- `chevronDown` (for dropdown triggers)
- `minus`, `plus` (for font size stepper)

#### Font family dropdown

Font config object:

```js
const FONTS = {
  'GT Pressura': {
    family: "'GT Pressura', system-ui, sans-serif",
    weights: [
      { value: 300, label: 'Light' },
      { value: 375, label: 'Book' },
      { value: 415, label: 'Regular' },
      { value: 450, label: 'News' },
      { value: 480, label: 'Medium' },
      { value: 560, label: 'Semibold' },
      { value: 650, label: 'Bold' },
      { value: 750, label: 'Heavy' },
      { value: 900, label: 'Black' },
    ],
  },
  'GT Pressura Mono': {
    family: "'GT Pressura Mono', ui-monospace, monospace",
    weights: [
      { value: 300, label: 'Light' },
      { value: 415, label: 'Regular' },
      { value: 480, label: 'Medium' },
      { value: 650, label: 'Bold' },
      { value: 900, label: 'Black' },
    ],
  },
  'Lyric': {
    family: "'Lyric', serif",
    weights: [
      { value: 200, label: 'Thin' },
      { value: 283, label: 'Light' },
      { value: 400, label: 'Regular' },
      { value: 488, label: 'Medium' },
      { value: 592, label: 'Semibold' },
      { value: 700, label: 'Bold' },
    ],
  },
};
```

When font family changes → the weight dropdown re-populates with that font's available weights. If the current weight isn't available in the new font, snap to the nearest available weight.

Each dropdown option in the font family list renders in its own font (`style="font-family: ..."`) so the user sees a preview.

#### Font weight dropdown

Populated dynamically based on selected font (see above). Each option renders at its own weight (`style="font-weight: ..."`) for visual preview.

#### Font size input

- Default: 17 (matches `--text-base` which is ~17px)
- Range: 8–96
- The `−` / `+` buttons step by 1
- The input accepts direct typing
- Applies via a custom TextStyle extension that sets `font-size: Xpx` on the span
- On `transaction`, reads the current font-size from the selection's marks to update the input display

#### Block type dropdown

Options:
- Paragraph (default)
- Heading 1
- Heading 2
- Heading 3
- Heading 4
- Blockquote

The trigger button shows the current block type name. On selection, applies `setParagraph()`, `toggleHeading({ level })`, or `toggleBlockquote()`.

#### Link button

- If no link: prompts with a small popover/modal to enter URL
- If cursor is inside a link: toggle removes it (`unsetLink()`)
- Active state lights up when cursor is inside a `<a>` tag
- The popover is a minimal `<div class="link-popover">` absolutely positioned below the button, with a text input and confirm/cancel buttons

#### Clear formatting button

Runs: `editor.chain().focus().unsetAllMarks().clearNodes().run()`

This removes all inline marks (bold, italic, font-size, font-weight, font-family, etc.) and converts block nodes back to paragraphs.

#### Indent / outdent

Two behaviors depending on context:
- **Inside a list**: `sinkListItem('listItem')` / `liftListItem('listItem')` — native Tiptap list nesting
- **Outside a list**: apply/remove a `margin-left` via a custom node attribute on paragraph/heading (or wrap in a custom indent node). Simpler approach: use a custom extension that adds a `data-indent` attribute (0-5) to paragraph/heading nodes, with CSS `padding-left: calc(attr(data-indent) * 2rem)`. The indent/outdent buttons increment/decrement this attribute.

### `icons.js` — new file

Exports an object of SVG strings. Each icon is a function returning an SVG element (or a string used with `innerHTML`). Keep SVGs minimal — single-color, `currentColor` stroke/fill, 18×18 viewBox.

### `fonts.js` — new file

Exports the `FONTS` config object (font families, their CSS values, and available weights). Shared between the font family dropdown and font weight dropdown.

### `styles.css` — additions

New CSS for:
- `.toolbar` — add `flex-wrap: wrap; gap: 0.25rem` for row wrapping
- `.toolbar-select` — custom dropdown container (relative positioned)
- `.toolbar-select-trigger` — the button that opens the dropdown
- `.toolbar-select-dropdown` — absolute positioned panel, with `var(--color-bg-elevated)` background, `var(--color-border)` border, `var(--radius-sm)` radius
- `.toolbar-select-option` — items in the dropdown, hover = `var(--color-neutral)`
- `.toolbar-number` — flex container for `−` input `+`
- `.toolbar-number input` — narrow number input (~3ch wide), no spinner, centered text
- `.link-popover` — absolute positioned panel for URL input
- `.tiptap h4` — heading 4 styles (add)
- `.tiptap [data-indent]` — indentation levels via padding-left
- `.tiptap a` — link styling inside editor content

### `index.html` — no changes needed

The toolbar is already dynamically built via JS.

---

## Element-Level Selection Behavior (#9)

When the user clicks into a heading, paragraph, blockquote, or other block node, formatting commands should affect the entire block. This is achieved by:

1. A custom ProseMirror plugin (registered as a Tiptap extension) that listens to `click` events on the editor.
2. On click, resolve the position to the nearest block-level node.
3. For **block-level formatting** commands (block type, alignment, indent), they already operate on the current block node by default in Tiptap — no special handling needed.
4. For **inline formatting** commands (font-family, font-weight, font-size, italic): if the selection is a cursor (collapsed), expand it to select the full text content of the parent block node before applying the mark. This is done by wrapping the relevant toolbar commands: detect if selection is collapsed → if so, `selectParentNode()` or manually set a TextSelection spanning the block → apply the mark → restore cursor.

This is the most nuanced feature. Implementation approach: a helper function `withBlockSelection(editor, fn)` that:
- Checks if selection is collapsed
- If so, finds the parent block node boundaries
- Creates a TextSelection spanning start-to-end of that node
- Calls `fn` (which applies the mark)
- Optionally restores the cursor position

This helper is used by font-family, font-weight, font-size, and italic commands.

---

## Implementation Order

1. **Add dependencies** — `npm install` the 4 new packages
2. **Create `icons.js`** — all SVG icons
3. **Create `fonts.js`** — font config with families and weights
4. **Rewrite `main.js`** — register all new extensions
5. **Rewrite `toolbar.js`** — full toolbar with all controls
6. **Update `styles.css`** — dropdown, number input, link popover, h4, indent, and toolbar wrap styles
7. **Test** — verify all features work, dark mode, responsive

---

## Verification

```bash
cd _editor && npm install && npm run dev
```

Test checklist:
- [ ] Undo/redo buttons work and show correct icons
- [ ] Block type dropdown shows current type, switching works
- [ ] Font family dropdown shows 3 fonts, each previewed in its own font
- [ ] Font weight dropdown updates when font changes, shows only valid weights
- [ ] Font size +/− buttons step correctly, typing works, range 8-96
- [ ] Italic toggles on/off
- [ ] Clear formatting strips all marks and resets block to paragraph
- [ ] Alignment buttons work on headings and paragraphs
- [ ] Indent/outdent works in lists (nesting) and outside lists (margin)
- [ ] Link button opens popover, inserts link, toggling removes it
- [ ] Horizontal divider inserts `<hr>`
- [ ] Clicking into a block and applying inline formatting affects the whole block
- [ ] All controls reflect current state when cursor moves
- [ ] Dark mode: all dropdowns, popovers, and inputs use theme colors
- [ ] Responsive: toolbar wraps cleanly on narrow widths
