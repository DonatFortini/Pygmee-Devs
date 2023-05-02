import * as monaco from 'monaco-editor';
const div = document.getElementById("editor");
if (div) {
    const Editor = monaco.editor.create(div, {
        language: 'python',
        theme: 'vs-dark',
        lineNumbers: "off",
        minimap: { enabled: false }
    });
}