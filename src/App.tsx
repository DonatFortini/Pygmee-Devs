import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { confirm, open } from '@tauri-apps/api/dialog';
import "./public/App.css";
import { debounce, size } from 'lodash';
import { parseCodeToGraph } from "./graph/graphGenerator";
import * as joint from 'jointjs';
import { readTextFile } from '@tauri-apps/api/fs';


function Input() {
  /**
   * attend que l'utilisateur appuie sur entrée pour envoyer le texte vers le back-end
   * pour qu'il soit analysé
   * 
   * @param e la touche entrée du clavier
   */
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const inputValue = e.currentTarget.value;
      await invoke("get_text", { input: inputValue });
      if (e.currentTarget) {
        e.currentTarget.value = "";
      }
    }
  };


  return (
    <textarea className="input" onKeyDown={handleKeyPress} autoFocus />
  );
}


function Menu() {
  /**
   * appele une fonction du back-end qui format le code du fichier selectioné le renvoi sous forme 
   * html et le display dans div codeDisplay
   * 
   * @param filepath chemin du fichier selectioné dans la fenêtre de dialogue
   */
  async function updateCodeDisplay(filepath: string) {
    try {
      const result: string = await invoke('format_code', { filepath });
      const codeDisplay = document.getElementById("codeDisplay");
      codeDisplay!.innerHTML = result;

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * appele une fonction du front-end qui parse le code du fichier selectioné le renvoi sous forme 
   * de diagramme html et le display dans div modelDisplay
   * 
   *@param filepath chemin du fichier selectioné dans la fenêtre de dialogue 
   */
  async function updateModelDisplay(filepath: string) {
    readTextFile(filepath)
      .then(data => {
        let graph = parseCodeToGraph(data);
        new joint.dia.Paper({
          el: document.getElementById("modelDisplay"),
          model: graph,
          height: '70%',
          width: '60%'
        });
      })
      .catch(error => {
        console.error(error);
      });

  }

  /**
   * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le charger
   * dans l'editeur (code et model Display)
   */
  async function load_fichier() {
    let select = await open({
      defaultPath: "./simulation",
      multiple: false,
    });
    if (select) {
      let choice: string = String(select);
      updateCodeDisplay(choice);
      updateModelDisplay(choice);
    }
  }

  return (
    <div className="menu">
      <button>nouvelle simulation</button>
      <button>creer une librairie</button>
      <button onClick={load_fichier}>ouvrir une simulation</button>
    </div>
  );
}

function ExportButton() {
  /**
   * enregistre le ficgier final dnas le dossier téléchargements
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
      multiple: true
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
        <button>Sauvegarder</button>
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
    <div id="modelDisplay" className="modelDisplay" ></div>
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
  const [showInput, setShowInput] = useState(false);

  const toggleInput = () => {
    setShowInput(!showInput);
  };

  const debouncedToggleInput = debounce(toggleInput, 100);

  useEffect(() => {//lorsque ² est pressé l'input apparais 
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "²") {
        debouncedToggleInput();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [debouncedToggleInput]);

  return (
    <div className="main">
      <Header />
      <div className="display">
        <CodeDisplay />
        <ModelDisplay />
      </div>
      {showInput && <Input />}
    </div>
  );
}

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', }}>
      <Column />
      <MainScreen />
    </div>
  );
}

export default App;

