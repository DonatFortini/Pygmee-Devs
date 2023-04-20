import { useState } from "react";
import { InvokeArgs, invoke } from "@tauri-apps/api/tauri";
import { confirm } from '@tauri-apps/api/dialog';
import { open } from '@tauri-apps/api/dialog';
import "./public/App.css";



function Input() {
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const inputValue = e.currentTarget.value;
      await invoke("get_text", { input: inputValue });
      e.currentTarget.value = "";
    }
  };

  return (
    <input className="input" onKeyDown={handleKeyPress} />
  );
}
function Menu() {
  return (
    <div className="menu">
      <button>nouvelle simulation</button>
      <button>creer une librairie</button>
      <button>importer une simulation</button>
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
      if(Array.isArray(file)){
        invoke('copy_files',{ files: file }); 
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
    <div className="codeDisplay"></div>
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
      <Input />
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
  return (
    <div style={{ display: 'flex', height: '100vh', }}>
      <Column />
      <MainScreen />
    </div>
  );
}

export default App;

