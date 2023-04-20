// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pyo3::prelude::*;
use serde::{Serialize, Serializer};
use tauri::command::private::ResultKind;

/*
gestion des erreur python
 */
#[derive(Debug)]
struct MyError(String);

impl From<PyErr> for MyError {
    fn from(error: PyErr) -> Self {
        MyError(format!("{:?}", error))
    }
}

impl ResultKind for MyError {}

impl Serialize for MyError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0)
    }
}

/**/

#[tauri::command]
fn test() -> Result<(), MyError> {
    /* on spécifie le path du package python (initialisé avec un __init__.py)
    utilisé pour stocké les fonction python que l'on va utilisé  */
    std::env::set_var("PYTHONPATH", "./python");

    Python::with_gil(|py| {
        let module = py.import("test")?;//import du module
        let function = module.getattr("test")?;//import de la fonction
        let _result = function.call0()?;//call de la fonction avec 0 parametres
        Ok(())
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![test])//gestion de l'invoke
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
