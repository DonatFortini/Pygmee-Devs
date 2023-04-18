import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./public/App.css";

function Input(props:{}) {
  return (
    <input className="input" {...props} />
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
  return (
    <button className="export" >Exporter</button>
  );
}

function Header() {

  async function test() {
    try{
      await invoke('test');
      console.log('cote js done');
    }
    catch(error){
      console.error(error);
    }
  }

  return (
    <div className="header">
      <img className='logo' src="./src/assets/logo_pygmee.png" alt="" />
      <h1>Pygmee-DEVS</h1>
      <div style={{display: 'flex', justifyContent:"space-evenly"}}>
        <button>Sauvegarder</button>
        <button onClick={test} >Importer</button>
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

