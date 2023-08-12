import { invoke } from "@tauri-apps/api/tauri";
import { confirm } from '@tauri-apps/api/dialog';
import { listen, emit } from '@tauri-apps/api/event'

import { Header } from "./components/Header";
import { ExportButton } from "./components/ExportButton";
import { Menu } from "./components/Menu";
import { ModelDisplay } from "./components/ModelDisplay";
import { CodeDisplay } from "./components/CodeDisplay";

import * as joint from 'jointjs';

import { useEffect } from "react";
import { appendTextToEditor } from './script/ide';
import { module_factory, link_factory, start } from './script/graph';

import { Graph } from "./components/ModelDisplay";
import { editor } from "./components/CodeDisplay";

import "./public/App.css";
import burg from "./assets/vertical.svg";



/**variable globales c'est pas bien mais bon on fait comme on peut*/
var curent_file: string = "";



/**fonction global appelé par le back-end qui permet de crée des liens depuis le graphique  */
window.verifLink = (type: string, name: string, source: string, target: string) => {
  //TODO securiser la creation des lien (modules non existant)
  if (Graph.getCell(name)) alert("lien deja existant");
  else {
    const textToAppend: string = (type == 'output') ? `generates output on ${name}!\nafter ${source} ${type} ${name}!\nfrom ${source} go to ${target}!` : `accepts input on ${name}!\nwhen in ${source} and receive ${name} go to ${target}!`;
    const nom: string = (type == 'output') ? "!" + name : "?" + name;
    appendTextToEditor(editor, textToAppend);
    const l = link_factory(Graph.getCell(source) as joint.shapes.basic.Rect, Graph.getCell(target) as joint.shapes.basic.Rect, nom);
    Graph.addCell(l);
  }
}

/**fonction global appelé par le back-end qui permet de crée des liens depuis le graphique  */
window.verifMod = (name: string, time: number) => {
  if (Graph.getCell(name)) alert("module déja existant");
  else {
    let textToAppend: string = (time == -1) ? `passivate in ${name}!` : `hold in ${name} for time ${time}`;
    const tmp: number = (time == -1) ? Infinity : time;
    const m = module_factory(name, tmp, { x: 10, y: 10 })
    if (Graph.getCells().length != 0) Graph.addCell(m);
    else {
      const startmod = start(m);
      m.embed(startmod);
      Graph.addCells([startmod, m])
      textToAppend="to start,"+textToAppend;
    }
    appendTextToEditor(editor, textToAppend);

  }
}


listen('get-cache', (event: any) => {
  const label: string = event.payload.message;
  const result: string = Graph.getCell(label).attr().code.text;
  emit('get-cache-result', result);
});

window.setCache = (label: string, content: string) => {
  Graph.getCell(label).attr().code.text = content;
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
    const reponse = await confirm('Etes-vous sûr de sauvegarder?');
    if (reponse && editor.getValue() != undefined) {
      const text: string = editor.getValue();
      await invoke('save', { currentFile: curent_file, text: text });
    }
  }

  function fullScreen() {
    document.getElementById('col')!.style.display = 'none';
    document.getElementById('burgH')!.style.display = 'inherit';
  }

  return (
    <div style={{ display: 'flex', height: '100vh', }}>
      <div className="column" id="col">
        <img src={burg} className="burgV" id="burgV" onClick={fullScreen} />
        <div></div>
        <Menu />
        <ExportButton />
        <div></div>
      </div>
      <div className="main">
        <Header />
        <div className="display">
          <CodeDisplay />
          <ModelDisplay />
        </div>
      </div>
    </div>
  );
}

export default App;



