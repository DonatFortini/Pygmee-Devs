import { readTextFile } from '@tauri-apps/api/fs';
import { code_to_parse, updateGraph } from '../script/graphGenerator';
import { link_factory, module_factory } from '../script/graph';
import { createMonacoEditor } from '../script/ide';
import { Graph } from './ModelDisplay';
import * as monaco from 'monaco-editor';

export { initCodeDisplay, editor }
var editor: monaco.editor.IStandaloneCodeEditor;
/**
 * lit le contenu du fichier passer en parametre et initialise un editeur de texte avec le contenu
 * 
 * @param filepath chemin du fichier selectioné dans la fenêtre de dialogue
 */
async function initCodeDisplay(filepath: string) {
    if (editor) editor.dispose();
    readTextFile(filepath)
        .then(data => {
            editor = createMonacoEditor();
            editor.setValue(data);
            editor.onKeyDown((event) => {
                if (event.keyCode == 6) {
                    const result = updateGraph(code_to_parse(editor.getValue()), Graph);
                    for (const mod of result.modules) {
                        const m = module_factory(mod.name, mod.time);
                        Graph.addCell(m);
                    }
                    for (const lin of result.links) {
                        const name = (lin.type == "output") ? "!" + lin.name : "?" + lin.name;
                        const l = link_factory(Graph.getCell(lin.source) as joint.shapes.basic.Rect, Graph.getCell(lin.target) as joint.shapes.basic.Rect, name);
                        Graph.addCell(l);
                    }
                }
            })
        });
}

function CodeDisplay() {
    return (
        <div id="codeDisplay" className="codeDisplay" ></div>
    );
}

export { CodeDisplay };