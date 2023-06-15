import { invoke } from "@tauri-apps/api/tauri";
import { confirm, open } from '@tauri-apps/api/dialog';
import "./public/App.css";
import dellink from './assets/del_link.svg';
import addlink from './assets/link.svg';
import delmod from './assets/del_module.svg';
import addmod from './assets/module.svg';
import logo from './assets/logo_pygmee.png';
import { code_to_parse, parseCodeToGraph, updateGraph } from "./script/graphGenerator";
import * as joint from 'jointjs';
import { readTextFile } from '@tauri-apps/api/fs';
import { useEffect } from "react";
import * as monaco from 'monaco-editor';
import { createMonacoEditor, appendTextToEditor } from './script/ide'
import { module_factory, link_factory } from './script/graph'
import { WebviewWindow } from '@tauri-apps/api/window'
import { listen, emit } from '@tauri-apps/api/event'



/**variable globales c'est pas bien mais bon on fait comme on peut*/
var curent_file: string = "";
var graph: joint.dia.Graph;
var editor: monaco.editor.IStandaloneCodeEditor;
var paper: joint.dia.Paper;

/**fonction global appelé par le back-end qui permet de crée des liens depuis le graphique  */
window.verifLink = (type: string, name: string, source: string, target: string) => {
  if (graph) {//TODO securiser la creation des lien (modules non existant)
    if (graph.getCell(name)) { alert("lien deja existant"); }
    else {
      var textToAppend: string;
      var nom: string;
      if (type == "output") {
        textToAppend = `generates output on ${name}!\nafter ${source} ${type} ${name}!\nfrom ${source} go to ${target}!`;
        nom = "!" + name;
      }
      else {
        textToAppend = `accepts input on ${name}!\nwhen in ${source} and receive ${name} go to ${target}!`;
        nom = "?" + name;
      }
      appendTextToEditor(editor, textToAppend);
      var l = link_factory(graph.getCell(source) as joint.shapes.basic.Rect, graph.getCell(target) as joint.shapes.basic.Rect, nom);
      graph.addCell(l);
    }
  } else { alert("aucun editeur chargé") }
}

/**fonction global appelé par le back-end qui permet de crée des liens depuis le graphique  */
window.verifMod = (name: string, time: number) => {
  if (graph) {
    if (graph.getCell(name)) { alert("lien deja existant"); }
    else {
      var textToAppend: string;
      var tmp: number;
      if (time == -1) {
        textToAppend = `passivate in ${name}!`;
        tmp = Infinity;
      }
      else {
        textToAppend = `hold in ${name} for time ${time}`;
        tmp = time;
      }
      appendTextToEditor(editor, textToAppend);
      var m = module_factory(name, tmp)
      graph.addCell(m);
    }
  } else { alert("aucun editeur chargé") }
}


listen('get-cache', (event: any) => {
  const label = event.payload.message;
  const result = graph.getCell(label).attr().code.text;
  emit('get-cache-result', result);
});

window.setCache = (label: string, content: string) => {
  graph.getCell(label).attr().code = { text: content };
}

/**
 * permet d'initaliser des fenêtres d'interaction a partir d'un url
 * @param url:string lien vers un formulaire html 
 * @param titre:string titre de la fenêtre 
 * @returns instance de webview
 */
function createWebview(url: string, titre: string) {
  const webview = new WebviewWindow(titre, {
    url:  url,
    width: 400,
    height: 200,
    resizable: false,
    title: titre
  });
  return webview;
}

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
          for (const mod of result.modules) {
            var m = module_factory(mod.name, mod.time);
            graph.addCell(m);
          }
          for (const lin of result.links) {
            if (lin.type == "output") {
              var l = link_factory(graph.getCell(lin.source) as joint.shapes.basic.Rect, graph.getCell(lin.target) as joint.shapes.basic.Rect, "!" + lin.name);
              graph.addCell(l);
            }
            else {
              var l = link_factory(graph.getCell(lin.source) as joint.shapes.basic.Rect, graph.getCell(lin.target) as joint.shapes.basic.Rect, "?" + lin.name);
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
          const webview = createWebview('./src/html/code.html', mod);
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


  function add_link() {
    instance = createWebview("./src/html/form_link.html", "Ajout_lien");
  }

  function del_link() {
    //TODO implementer pour le futur
  }

  function del_modl() {
    //TODO implementer pour le futur
  }

  function add_modl() {
    instance = createWebview("./src/html/form_modl.html", "Ajout_module");
  }

  return (
    <div className="toolbar">
      <img src={addlink} onClick={add_link} className="link" />
      <img src={addmod} onClick={add_modl} className="mod" />
      <img src={dellink} onClick={del_link} className="del_link" />
      <img src={delmod} onClick={del_modl} className="del_mod" />
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

  /**
   * créer un nouveau fichier et le charge
   */
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
   * enregistre le fichier final dans le dossier téléchargements
   */
  async function finish() {
    let conf = await confirm('êtes-vous sûr de vouloir finir', 'Exporter');
    if (conf) {
      // TODO finir le projet connard
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
      <img className='logo' src={logo} alt="" />
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

  /**
   * enregistre le contenu de l'editeur dans le fichier en cours
   */
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



