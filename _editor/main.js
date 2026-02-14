import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import { createToolbar } from './toolbar.js';
import { initTheme } from './theme.js';

// Custom FontSize extension via TextStyle
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize?.replace(/['"]+/g, '') || null,
          renderHTML: (attrs) => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: size }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// Custom FontWeight extension via TextStyle
const FontWeight = Extension.create({
  name: 'fontWeight',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontWeight: {
          default: null,
          parseHTML: (el) => el.style.fontWeight || null,
          renderHTML: (attrs) => {
            if (!attrs.fontWeight) return {};
            return { style: `font-weight: ${attrs.fontWeight}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontWeight: (weight) => ({ chain }) => {
        return chain().setMark('textStyle', { fontWeight: weight }).run();
      },
      unsetFontWeight: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontWeight: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

initTheme();

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
    }),
    Placeholder.configure({
      placeholder: 'Skriv fritt...',
    }),
    TextStyle,
    FontFamily,
    FontSize,
    FontWeight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap',
    },
  },
  onUpdate({ editor }) {
    updateWordCount(editor);
  },
});

createToolbar(editor, document.querySelector('#toolbar'));

function updateWordCount(ed) {
  const text = ed.state.doc.textContent;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.querySelector('#word-count').textContent = `${words} ord`;
}

updateWordCount(editor);
