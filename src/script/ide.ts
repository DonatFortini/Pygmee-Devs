import * as monaco from 'monaco-editor';
export { createMonacoEditor ,appendTextToEditor}

/**definie la syntaxe de base du dnl */
monaco.languages.register({
    id: 'dnl'
});

const keywords = [
    "to", "accepts", "input", "on", "generates", "output",
    "start", "hold", "in", "for", "time", "after", "from",
    "go", "passivate", "when", "and", "receive", "the",
    "perspective", "is", "made", "of", "sends"
];

monaco.languages.registerCompletionItemProvider('dnl', {
    provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const currentWord = wordInfo.word;
        const filteredSuggestions = keywords
            .filter(keyword =>
                keyword.toLowerCase().startsWith(currentWord.toLowerCase())
            )
            .map(keyword => ({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword,
                range: {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: wordInfo.startColumn,
                    endColumn: wordInfo.endColumn,
                },
            }));

        return {
            suggestions: filteredSuggestions,
        };
    },
});

monaco.languages.setMonarchTokensProvider('dnl', {
    keywords: keywords,
    tokenizer: {
        root: [
            [/\b\d+\b/, "number"],
            [/[a-z_$][\w$]*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],
            [/[ \t\r\n]+/, "white"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*$/, "comment"]
        ],

        comment: [
            [/[^*/]+/, "comment"],
            [/\/\*/, "comment.invalid"],
            ["\\*/", "comment", "@pop"],
            [/./, "comment"]
        ],
    }
});

function createMonacoEditor() {
    const codeDisplayElement = document.getElementById('codeDisplay');
    if (!codeDisplayElement) {
        throw new Error("Erreur code display");
    }

    monaco.editor.defineTheme('dnlTheme', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'number', foreground: '#00FF00' },
            { token: 'keyword', foreground: '#8b008b' }
        ],
        colors: {
            'editor.background': '#9FA2B2',
            'editorSuggestWidget.background': '#9FA2B2',
            'editorSuggestWidget.foreground': '#000000',
            'editorSuggestWidget.selectedBackground': '#A0A0A0',
            'editorSuggestWidget.highlightForeground': '#0000FF',
        }
    });

    const editor = monaco.editor.create(codeDisplayElement, {
        value: '',
        language: 'dnl',
        theme: 'dnlTheme',
        lineNumbers: "off",
        automaticLayout: true,
        minimap: { enabled: false }
    });

    return editor;
}

function appendTextToEditor(editor: monaco.editor.IStandaloneCodeEditor, text:string) {
    const model = editor.getModel();
    const currentPosition = model!.getPositionAt(model!.getValueLength());
    const range = new monaco.Range(
        currentPosition.lineNumber,
        currentPosition.column,
        currentPosition.lineNumber,
        currentPosition.column
    );
    const editOperation = {
        range: range,
        text: `\n${text}`
    };
    model!.pushEditOperations([], [editOperation], () => { 
        return null;
    });
    editor.revealPositionInCenter(currentPosition);
}