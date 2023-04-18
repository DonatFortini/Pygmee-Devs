import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function Input(props:{}) {
  return (
    <input className="input" {...props} />
  );
}

function Menu() {
  return (
    <div className="menu">
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
    </div>
  );
}

function ExportButton() {
  return (
    <button className="export" >Exporter</button>
  );
}

function Header() {
  return (
    <div className="header">
      <img className='logo' src="./src/assets/logo_pygmee.png" alt="" />
      <h1>Title</h1>
      <div style={{display: 'flex', justifyContent:"space-evenly"}}>
        <button>Button 1</button>
        <button>Button 2</button>
      </div>
    </div>
  );
}

function CodeDisplay() {
  return (
    <div className="codeDisplay">Code display</div>
  );
}

function ModelDisplay() {
  return (
    <div className="modelDisplay">Drawings display</div>
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

