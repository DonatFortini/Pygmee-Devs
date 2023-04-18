// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pyo3::prelude::*;

#[tauri::command]
fn test() -> Result<(), String> {
    Python::with_gil::<_, Result<(), PyErr>>(|py| {
        let module = PyModule::import(py, "test").map_err(PyErr::from)?;
        let function = module.getattr("test").map_err(PyErr::from)?.into_py(py);
        function.call(py, (), None).map_err(PyErr::from)?;
        Ok(())
    })
    .map_err(|e| e.to_string())
    .map_err(|e| Into::<Box<dyn std::error::Error>>::into(e))
    .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![test])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
