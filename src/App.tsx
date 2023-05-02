import { invoke } from "@tauri-apps/api/tauri";
import { confirm, open } from '@tauri-apps/api/dialog';
import "./public/App.css";
import { code_to_parse, parseCodeToGraph, updateGraph } from "./script/graphGenerator";
import * as joint from 'jointjs';
import { readTextFile } from '@tauri-apps/api/fs';
import { useEffect } from "react";
import * as monaco from 'monaco-editor';
import { createMonacoEditor } from './script/ide'
import { module_factory, link_factory } from './script/graph'
import { WebviewWindow } from '@tauri-apps/api/window'


/**variable globales c'est pas bien mais bon on fait comme on peut*/
var curent_file: string = "";
var graph: joint.dia.Graph;
var editor: monaco.editor.IStandaloneCodeEditor;
var paper: joint.dia.Paper;


/**
 * ajoute le nom du fichier en cours au label
 * @param choice le nom du fichier actuellement chargé
 */
function updateLabel(choice: string) {
  curent_file = choice;
  let cut = choice.split('/');
  let name = cut.pop()
  if (name) document.getElementById('label')!.innerText = name;
}

/**
 * lit le contenu du fichier passer en parametre et initialise un editeur de texte avec le contenu
 * 
 * @param filepath chemin du fichier selectioné dans la fenêtre de dialogue
 */
async function initCodeDisplay(filepath: string) {
  if (editor) {
    editor.dispose();
  }
  readTextFile(filepath)
    .then(data => {
      editor = createMonacoEditor();
      editor.setValue(data);
      editor.onKeyDown((event) => {
        if (event.keyCode == 6) {
          var result = updateGraph(code_to_parse(editor.getValue()), graph);
          console.log(result);
          for (const mod of result.mods) {
            var m=module_factory(mod.name, mod.time);
            graph.addCell(m);
          }
          for (const lin of result.links) {
            if (lin.type == "output") {
              console.log(graph.getCell(lin.source));
              
              var l=link_factory(graph.getCell(lin.source) as joint.shapes.basic.Rect, graph.getCell(lin.target) as joint.shapes.basic.Rect, "!" + lin.name);
              graph.addCell(l);
            }
            else {
              var l=link_factory(graph.getCell(lin.source) as joint.shapes.basic.Rect, graph.getCell(lin.target) as joint.shapes.basic.Rect, "?"+lin.name);
              graph.addCell(l);
            }
          }
        }
      })
    });
}

/**
 * appele une fonction du front-end qui parse le code du fichier selectioné le renvoi sous forme 
 * de diagramme html et le display dans div modelDisplay
 * 
 *@param filepath chemin du fichier selectioné dans la fenêtre de dialogue 
 */
async function initModelDisplay(filepath: string) {
  readTextFile(filepath)
    .then(data => {
      graph = parseCodeToGraph(data);
      paper = new joint.dia.Paper({
        el: document.getElementById("modelDisplay"),
        model: graph,
        height: '100%',
        width: '100%'
      });
      paper.on(' cell:pointerdblclick',
        function (cellView: { model: { id: string; }; }) {
          let mod = cellView.model.id;
          const webview = new WebviewWindow('theUniqueLabel', {
            url: './src/html/code.html',
            width: 400,
            height: 200,
            resizable: false,
            title: mod
          });
          graph.getCell(mod).attr().code = { "text": "test" };
          console.log(graph.getCell(mod));
        }
      );
    })
    .catch(error => {
      console.error(error);
    });
}


/**
 * 
 * crée une barre d'outil comportant plusieurs boutons
 * qui interagissent avec le graphique
 */
function Toolbar() {
  var instance: WebviewWindow;
  function createWebview(url: string, titre: string) {
    const webview = new WebviewWindow('theUniqueLabel', {
      url: url,
      width: 400,
      height: 200,
      resizable: false,
      title: titre
    });
    return webview;
  }

  function add_link() {
    instance = createWebview("./src/html/form_link.html", "Ajout lien");

  }

  function del_link() {

  }

  function del_modl() {

  }

  function add_modl() {
    instance = createWebview("./src/html/form_modl.html", "Ajout module");
  }

  return (
    <div className="toolbar">
      <img src="./src/assets/link.svg" onClick={add_link} className="link" />
      <img src="./src/assets/module.svg" onClick={add_modl} className="mod" />
      <img src="./src/assets/del_link.svg" onClick={del_link} className="del_link" />
      <img src="./src/assets/del_module.svg" onClick={del_modl} className="del_mod" />
    </div>
  );
}


function Menu() {

  /**
   * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le charger
   * dans l'editeur (code et model Display)
   */
  async function load_fichier() {
    let select = await open({
      defaultPath: "./simulation",
      multiple: false,
      filters: [{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
    });
    if (select) {
      let choice: string = String(select);
      updateLabel(choice);
      initCodeDisplay(choice);
      initModelDisplay(choice);
    }
  }

  async function new_fichier() {
    const res: string | null = prompt('nom du fichier:');
    if (res) {
      const filepath: string = await invoke('new_file', { filename: res });
      let code: string = await readTextFile(filepath);
      updateLabel(code);
      initCodeDisplay(code);
      initModelDisplay(code);
    }
  }

  return (
    <div className="menu">
      <button onClick={new_fichier}>nouveau modèle</button>
      <button onClick={load_fichier}>ouvrir un modèle atomique</button>
    </div>
  );
}

function ExportButton() {
  /**
   * enregistre le fichier final dnas le dossier téléchargements
   */
  async function finish() {
    let conf = await confirm('êtes-vous sûr de vouloir finir', 'Exporter');
    if (conf) {
      console.log("true");
    }
  }

  return (
    <button onClick={finish} className="export" >Exporter</button>
  );
}

function Header() {
  /**
   * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le copier
   * dans le dossier simulation de l'appli pour l'avoir a disposition
   */
  async function import_sim() {
    let file = await open({
      multiple: true,
      filters: [{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
    });
    if (file != null) {
      if (Array.isArray(file)) {
        invoke('copy_files', { files: file });
      }
    }
  }

  return (
    <div className="header">
      <img className='logo' src="./src/assets/logo_pygmee.png" alt="" />
      <h1>Pygmee-DEVS</h1>
      <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
        <label id="label" className="label"></label>
        <button onClick={import_sim} >Importer</button>
      </div>
    </div>
  );
}

function CodeDisplay() {
  return (
    <div id="codeDisplay" className="codeDisplay" ></div>
  );
}

function ModelDisplay() {
  return (
    <div className="model-container">
      <div id="modelDisplay" className="modelDisplay" ></div>
      <Toolbar />
    </div>
  );
}

function Column() {
  return (
    <div className="column">
      <Menu />
      <ExportButton />
    </div>
  );
}

function MainScreen() {
  return (
    <div className="main">
      <Header />
      <div className="display">
        <CodeDisplay />
        <ModelDisplay />
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        SaveDoc();
      }
    };

    document.addEventListener('keydown', save);

    return () => {
      document.removeEventListener('keydown', save);
    };
  }, []);

  async function SaveDoc() {
    const reponse = await confirm('etes vous sûr de sauvegarder?');
    if (reponse && editor.getValue() != undefined) {
      var text: string = editor.getValue();
      await invoke('save', { currentFile: curent_file, text: text });
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', }}>
      <Column />
      <MainScreen />
    </div>
  );
}

export default App;



