import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

interface EditorPaneProps {
  code: string;
  charCount: number;
  onCodeChange: (nextCode: string) => void;
  onDecodeEntities: () => void;
  onEncodeInvisible: () => void;
}

const cssBattleTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--editor-bg)",
      color: "var(--editor-text)"
    },
    ".cm-content": {
      caretColor: "var(--editor-caret)"
    },
    ".cm-line": {
      paddingInline: "10px"
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "var(--editor-selection)"
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--editor-caret)",
      borderLeftWidth: "2px"
    },
    ".cm-activeLine": {
      backgroundColor: "var(--editor-active-line)"
    },
    ".cm-gutters": {
      backgroundColor: "var(--editor-gutter-bg)",
      borderRight: "1px solid var(--editor-gutter-border)",
      color: "var(--editor-gutter-text)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--editor-active-gutter-bg)",
      color: "var(--editor-active-gutter-text)"
    }
  },
  { dark: true }
);

const cssBattleHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "var(--editor-syntax-comment)" },
  { tag: [tags.propertyName, tags.attributeName], color: "var(--editor-syntax-property)" },
  { tag: [tags.number, tags.integer, tags.float, tags.unit], color: "var(--editor-syntax-number)" },
  { tag: [tags.string, tags.attributeValue], color: "var(--editor-syntax-string)" },
  { tag: [tags.keyword, tags.operatorKeyword], color: "var(--editor-syntax-keyword)" },
  { tag: [tags.tagName, tags.typeName, tags.className], color: "var(--editor-syntax-tag)" },
  { tag: tags.punctuation, color: "var(--editor-syntax-punctuation)" }
]);

const editorExtensions = [html(), EditorView.lineWrapping, cssBattleTheme, syntaxHighlighting(cssBattleHighlightStyle)];

export function EditorPane({
  code,
  charCount,
  onCodeChange,
  onDecodeEntities,
  onEncodeInvisible
}: EditorPaneProps) {
  return (
    <section className="panel editorPanel">
      <div className="panelHeader">
        <div className="panelHeaderMain">
          <h2>Editor</h2>
          <span>{charCount} characters</span>
        </div>
        <div className="buttonRow compact">
          <button type="button" className="secondaryButton" onClick={onDecodeEntities}>
            Decode Entity
          </button>
          <button type="button" className="secondaryButton" onClick={onEncodeInvisible}>
            Encode Invisible
          </button>
        </div>
      </div>

      <div className="editorWrap">
        <CodeMirror
          value={code}
          height="100%"
          extensions={editorExtensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true
          }}
          onChange={onCodeChange}
        />
      </div>
    </section>
  );
}
