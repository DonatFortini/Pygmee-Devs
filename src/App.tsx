import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { confirm, open } from '@tauri-apps/api/dialog';
import "./public/App.css";
import { debounce } from 'lodash';


function Input() {
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
  async function updateCodeDisplay(filepath:string) {
    try {
      const result: string = await invoke('format_code', { filepath });
      const codeDisplay = document.getElementById("codeDisplay") ;
      codeDisplay!.innerHTML = result;

    } catch (error) {
      console.error(error);
    }
  }

  async function load_fichier() {
    let select = await open({
      defaultPath: "./simulation",
      multiple: false,
    });
    if (select) {
      let choice:string=String(select);
      updateCodeDisplay(choice);
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
    <div className="modelDisplay"></div>
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

  useEffect(() => {
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

