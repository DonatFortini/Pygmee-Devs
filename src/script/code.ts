import { editor } from "monaco-editor"
const div = document.getElementById("editor");
if (div) {
    const Editor = editor.create(div, {
        language: 'python',
        theme: 'vs-dark',
        lineNumbers: "off",
        minimap: { enabled: false }
    });
}