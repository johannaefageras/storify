import { icons } from './icons.js';
import { FONTS, DEFAULT_FONT, DEFAULT_WEIGHT, DEFAULT_SIZE, MIN_SIZE, MAX_SIZE, nearestWeight } from './fonts.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Expand a collapsed selection to cover the entire parent block node */
function withBlockSelection(editor, fn) {
  const { state } = editor;
  const { from, to, empty } = state.selection;

  if (!empty) {
    fn();
    return;
  }

  // Find parent block node
  const $pos = state.doc.resolve(from);
  const parent = $pos.parent;
  const start = $pos.start();
  const end = start + parent.content.size;

  editor.chain().focus().setTextSelection({ from: start, to: end }).run();
  fn();
  // Restore cursor position
  editor.chain().setTextSelection(from).run();
}

function createIconButton(icon, title, onClick) {
  const btn = document.createElement('button');
  btn.className = 'toolbar-btn';
  btn.type = 'button';
  btn.title = title;
  btn.innerHTML = icon;
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onClick();
  });
  return btn;
}

function createSeparator() {
  const sep = document.createElement('div');
  sep.className = 'toolbar-separator';
  return sep;
}

function createRow() {
  const row = document.createElement('div');
  row.className = 'toolbar-row';
  return row;
}

// ---------------------------------------------------------------------------
// Dropdown helper
// ---------------------------------------------------------------------------

function createSelect(triggerLabel, options, onSelect, opts = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'toolbar-select';

  const trigger = document.createElement('button');
  trigger.className = 'toolbar-select-trigger';
  trigger.type = 'button';
  trigger.innerHTML = `<span class="toolbar-select-label">${triggerLabel}</span>${icons.chevronDown}`;
  wrapper.appendChild(trigger);

  const dropdown = document.createElement('div');
  dropdown.className = 'toolbar-select-dropdown';
  dropdown.hidden = true;
  wrapper.appendChild(dropdown);

  function rebuild(optionList, selectedValue) {
    dropdown.innerHTML = '';
    optionList.forEach((opt) => {
      const item = document.createElement('button');
      item.className = 'toolbar-select-option';
      item.type = 'button';
      item.textContent = opt.label;
      if (opt.style) item.style.cssText = opt.style;
      if (opt.value === selectedValue) item.classList.add('is-selected');
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onSelect(opt.value, opt);
        close();
      });
      dropdown.appendChild(item);
    });
  }

  function close() {
    dropdown.hidden = true;
    wrapper.classList.remove('is-open');
  }

  function open() {
    // Close all other open dropdowns
    document.querySelectorAll('.toolbar-select.is-open').forEach((el) => {
      if (el !== wrapper) {
        el.querySelector('.toolbar-select-dropdown').hidden = true;
        el.classList.remove('is-open');
      }
    });
    dropdown.hidden = false;
    wrapper.classList.add('is-open');
  }

  trigger.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (dropdown.hidden) open();
    else close();
  });

  // Close on outside click
  document.addEventListener('mousedown', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  return { el: wrapper, trigger, rebuild, setLabel(text) { trigger.querySelector('.toolbar-select-label').textContent = text; } };
}

// ---------------------------------------------------------------------------
// Main toolbar builder
// ---------------------------------------------------------------------------

export function createToolbar(editor, container) {
  const updaters = [];

  function addUpdater(fn) { updaters.push(fn); }

  // Create two rows
  const row1 = createRow();
  const row2 = createRow();
  container.appendChild(row1);
  container.appendChild(row2);

  // =========================================================================
  // ROW 1: Save | Undo/Redo | Block type | Font family | Font weight | Italic | Size
  // =========================================================================

  // === Save ===
  const saveBtn = createIconButton(icons.save, 'Spara', () => {});
  row1.appendChild(saveBtn);
  row1.appendChild(createSeparator());

  // === Undo / Redo ===
  const undoBtn = createIconButton(icons.undo, 'Ångra', () => editor.chain().focus().undo().run());
  const redoBtn = createIconButton(icons.redo, 'Gör om', () => editor.chain().focus().redo().run());
  row1.appendChild(undoBtn);
  row1.appendChild(redoBtn);
  row1.appendChild(createSeparator());

  // === Block Type ===
  const blockTypes = [
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'h4', label: 'Heading 4' },
  ];

  const blockSelect = createSelect('Paragraph', blockTypes, (val) => {
    if (val === 'paragraph') editor.chain().focus().setParagraph().run();
    else {
      const level = parseInt(val.replace('h', ''));
      editor.chain().focus().toggleHeading({ level }).run();
    }
  });
  row1.appendChild(blockSelect.el);
  row1.appendChild(createSeparator());

  addUpdater(() => {
    let current = 'paragraph';
    if (editor.isActive('heading', { level: 1 })) current = 'h1';
    else if (editor.isActive('heading', { level: 2 })) current = 'h2';
    else if (editor.isActive('heading', { level: 3 })) current = 'h3';
    else if (editor.isActive('heading', { level: 4 })) current = 'h4';
    const found = blockTypes.find((b) => b.value === current);
    blockSelect.setLabel(found ? found.label : 'Paragraph');
    blockSelect.rebuild(blockTypes, current);
  });

  // === Font Family ===
  const fontNames = Object.keys(FONTS);
  const fontOptions = fontNames.map((name) => ({
    value: name,
    label: name,
    style: `font-family: ${FONTS[name].family}`,
  }));

  let currentFont = DEFAULT_FONT;
  let currentWeight = DEFAULT_WEIGHT;

  const fontSelect = createSelect(DEFAULT_FONT, fontOptions, (val) => {
    currentFont = val;
    withBlockSelection(editor, () => {
      editor.chain().focus().setFontFamily(FONTS[val].family).run();
    });
    // Snap weight
    const snapped = nearestWeight(val, currentWeight);
    if (snapped !== currentWeight) {
      currentWeight = snapped;
      withBlockSelection(editor, () => {
        editor.chain().focus().setFontWeight(String(snapped)).run();
      });
    }
    updateWeightOptions();
  });
  row1.appendChild(fontSelect.el);

  // === Font Weight ===
  const weightSelect = createSelect('Regular', [], (val) => {
    currentWeight = val;
    withBlockSelection(editor, () => {
      editor.chain().focus().setFontWeight(String(val)).run();
    });
  });
  row1.appendChild(weightSelect.el);
  row1.appendChild(createSeparator());

  function updateWeightOptions() {
    const weights = FONTS[currentFont]?.weights || [];
    const options = weights.map((w) => ({
      value: w.value,
      label: w.label,
      style: `font-weight: ${w.value}`,
    }));
    weightSelect.rebuild(options, currentWeight);
    const found = weights.find((w) => w.value === currentWeight);
    weightSelect.setLabel(found ? found.label : 'Regular');
  }
  updateWeightOptions();

  // === Italic ===
  const italicBtn = createIconButton(icons.italic, 'Kursiv', () => editor.chain().focus().toggleItalic().run());
  row1.appendChild(italicBtn);
  row1.appendChild(createSeparator());

  addUpdater(() => {
    italicBtn.classList.toggle('is-active', editor.isActive('italic'));
  });

  // === Font Size ===
  const sizeWrapper = document.createElement('div');
  sizeWrapper.className = 'toolbar-number';

  const sizeDown = document.createElement('button');
  sizeDown.className = 'toolbar-btn toolbar-number-btn';
  sizeDown.type = 'button';
  sizeDown.innerHTML = icons.minus;
  sizeDown.title = 'Minska storlek';

  const sizeInput = document.createElement('input');
  sizeInput.className = 'toolbar-number-input';
  sizeInput.type = 'text';
  sizeInput.value = DEFAULT_SIZE;
  sizeInput.title = 'Textstorlek';

  const sizeUp = document.createElement('button');
  sizeUp.className = 'toolbar-btn toolbar-number-btn';
  sizeUp.type = 'button';
  sizeUp.innerHTML = icons.plus;
  sizeUp.title = 'Öka storlek';

  let currentSize = DEFAULT_SIZE;

  function applySize(size) {
    size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
    currentSize = size;
    sizeInput.value = size;
    withBlockSelection(editor, () => {
      editor.chain().focus().setFontSize(`${size}px`).run();
    });
  }

  sizeDown.addEventListener('mousedown', (e) => { e.preventDefault(); applySize(currentSize - 1); });
  sizeUp.addEventListener('mousedown', (e) => { e.preventDefault(); applySize(currentSize + 1); });
  sizeInput.addEventListener('change', () => {
    const val = parseInt(sizeInput.value);
    if (!isNaN(val)) applySize(val);
    else sizeInput.value = currentSize;
  });
  sizeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sizeInput.blur(); }
  });

  sizeWrapper.appendChild(sizeDown);
  sizeWrapper.appendChild(sizeInput);
  sizeWrapper.appendChild(sizeUp);
  row1.appendChild(sizeWrapper);

  // =========================================================================
  // ROW 2: Save | Align | Indent/Outdent | Link | Blockquote | HR | Image |
  //         Archive | PNG | PDF | Copy | Email | Clear formatting
  // =========================================================================

  // === Text Alignment ===
  const alignments = [
    { icon: icons.alignLeft, value: 'left', title: 'Vänsterjustera' },
    { icon: icons.alignCenter, value: 'center', title: 'Centrera' },
    { icon: icons.alignRight, value: 'right', title: 'Högerjustera' },
    { icon: icons.alignJustify, value: 'justify', title: 'Marginaljustera' },
  ];
  const alignBtns = alignments.map(({ icon, value, title }) => {
    const btn = createIconButton(icon, title, () => editor.chain().focus().setTextAlign(value).run());
    row2.appendChild(btn);
    return { btn, value };
  });
  row2.appendChild(createSeparator());

  addUpdater(() => {
    alignBtns.forEach(({ btn, value }) => {
      btn.classList.toggle('is-active', editor.isActive({ textAlign: value }));
    });
  });

  // === Indent / Outdent ===
  const indentBtn = createIconButton(icons.indent, 'Indrag', () => {});
  const outdentBtn = createIconButton(icons.outdent, 'Minska indrag', () => {});
  row2.appendChild(indentBtn);
  row2.appendChild(outdentBtn);
  row2.appendChild(createSeparator());

  // === Link ===
  const linkWrap = document.createElement('div');
  linkWrap.className = 'toolbar-link-wrap';

  const linkBtn = createIconButton(icons.link, 'Länk', () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!linkPopover.classList.contains('is-open')) openLinkPopover();
    else closeLinkPopover();
  });
  linkWrap.appendChild(linkBtn);

  // Link popover
  const linkPopover = document.createElement('div');
  linkPopover.className = 'link-popover';
  linkPopover.innerHTML = `
    <input type="url" class="link-popover-input" placeholder="https://…" />
    <div class="link-popover-actions">
      <button type="button" class="link-popover-btn link-popover-confirm">OK</button>
      <button type="button" class="link-popover-btn link-popover-cancel">Avbryt</button>
    </div>
  `;
  linkWrap.appendChild(linkPopover);
  row2.appendChild(linkWrap);

  addUpdater(() => {
    linkBtn.classList.toggle('is-active', editor.isActive('link'));
  });

  const linkInput = linkPopover.querySelector('.link-popover-input');

  function openLinkPopover() {
    const existing = editor.getAttributes('link').href || '';
    linkInput.value = existing;
    linkPopover.classList.add('is-open');
    setTimeout(() => linkInput.focus(), 0);
  }

  function closeLinkPopover() {
    linkPopover.classList.remove('is-open');
  }

  function confirmLink() {
    const url = linkInput.value.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    closeLinkPopover();
  }

  linkPopover.querySelector('.link-popover-confirm').addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); confirmLink(); });
  linkPopover.querySelector('.link-popover-cancel').addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); closeLinkPopover(); });
  linkInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmLink(); }
    if (e.key === 'Escape') { e.preventDefault(); closeLinkPopover(); }
  });
  linkPopover.addEventListener('mousedown', (e) => { e.stopPropagation(); });
  document.addEventListener('mousedown', (e) => {
    if (!linkWrap.contains(e.target)) closeLinkPopover();
  });

  // === Blockquote ===
  const bqBtn = createIconButton(icons.blockquote, 'Blockcitat', () => {
    editor.chain().focus().toggleBlockquote().run();
  });
  row2.appendChild(bqBtn);

  addUpdater(() => {
    bqBtn.classList.toggle('is-active', editor.isActive('blockquote'));
  });

  // === Horizontal Rule ===
  const hrBtn = createIconButton(icons.horizontalRule, 'Horisontell linje', () => editor.chain().focus().setHorizontalRule().run());
  row2.appendChild(hrBtn);
  row2.appendChild(createSeparator());

  // === Upload Image (placeholder) ===
  const imageBtn = createIconButton(icons.image, 'Ladda upp bild', () => {});
  row2.appendChild(imageBtn);
  row2.appendChild(createSeparator());

  // === Save to Journal Archive (placeholder) ===
  const archiveBtn = createIconButton(icons.archive, 'Spara till arkiv', () => {});
  row2.appendChild(archiveBtn);

  // === Save as PNG (placeholder) ===
  const pngBtn = createIconButton(icons.image, 'Spara som PNG', () => {});
  row2.appendChild(pngBtn);

  // === Save as PDF (placeholder) ===
  const pdfBtn = createIconButton(icons.pdf, 'Spara som PDF', () => {});
  row2.appendChild(pdfBtn);

  // === Copy Text (placeholder) ===
  const copyBtn = createIconButton(icons.clipboard, 'Kopiera text', () => {});
  row2.appendChild(copyBtn);

  // === Send as Email (placeholder) ===
  const emailBtn = createIconButton(icons.email, 'Skicka som e-post', () => {});
  row2.appendChild(emailBtn);
  row2.appendChild(createSeparator());

  // === Clear Formatting ===
  const clearBtn = createIconButton(icons.clearFormatting, 'Rensa formatering', () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  });
  row2.appendChild(clearBtn);

  // =========================================================================
  // State sync on transaction
  // =========================================================================

  addUpdater(() => {
    // Read current font from marks
    const fontAttr = editor.getAttributes('textStyle').fontFamily;
    if (fontAttr) {
      const match = fontNames.find((name) => FONTS[name].family === fontAttr);
      if (match && match !== currentFont) {
        currentFont = match;
        fontSelect.setLabel(currentFont);
        fontSelect.rebuild(fontOptions, currentFont);
        updateWeightOptions();
      }
    }

    // Read current weight
    const weightAttr = editor.getAttributes('textStyle').fontWeight;
    if (weightAttr) {
      const w = parseInt(weightAttr);
      if (!isNaN(w) && w !== currentWeight) {
        currentWeight = w;
        updateWeightOptions();
      }
    }

    // Read current font size
    const sizeAttr = editor.getAttributes('textStyle').fontSize;
    if (sizeAttr) {
      const s = parseInt(sizeAttr);
      if (!isNaN(s) && s !== currentSize) {
        currentSize = s;
        sizeInput.value = s;
      }
    }
  });

  editor.on('transaction', () => {
    updaters.forEach((fn) => fn());
  });

  // Run initial state sync
  updaters.forEach((fn) => fn());
}
