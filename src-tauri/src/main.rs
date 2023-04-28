// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pyo3::prelude::*;
use serde::{Serialize, Serializer};
use std::{path::Path, io::{Read, Write}, fs};
use tauri::{command::private::ResultKind};


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


/*fonction de copy des fichier je l'appelle pour copier les fichiers recuperés par le bouton import du coté front
pour les avoir dans mon dossier simulation pour que l'utilisateur puisse se créer une biblioteque*/
#[tauri::command]
fn copy_files(files: Vec<String>) {
    let simulation_dir = std::env::current_dir().unwrap().join("simulation");
    println!("Simulation directory: {:?}", simulation_dir);

    for file in files {
        let src_path = Path::new(&file);
        if src_path.exists() {
            let file_name = src_path.file_name().unwrap();
            let dest_path = simulation_dir.join(file_name);
            println!("Destination path: {:?}", dest_path);

            match std::fs::read(&src_path) {
                Ok(contents) => match std::fs::write(&dest_path, &contents) {
                    Ok(_) => println!("Copied file {} to {}", file, dest_path.display()),
                    Err(e) => println!("Error copying file {}: {:?}", file, e),
                },
                Err(e) => println!("Error reading file {}: {:?}", file, e),
            }
        } else {
            println!("File not found: {}", file);
        }
    }
}

#[tauri::command]
fn format_code(filepath: String) -> Result<String, MyError> {
    /* on spécifie le path du package python (initialisé avec un __init__.py)
    utilisé pour stocké les fonction python que l'on va utilisé  */
    std::env::set_var("PYTHONPATH", "./python");

    Python::with_gil(|py| {
        let module = py.import("codegen")?; //import du module
        let function = module.getattr("formater")?; //import de la fonction
        let args: (String,) = (filepath,); //converti en tuple python
        let result = function.call1(args)?; //call de la fonction avec 0 parametres
        Ok(result.extract()?) // recupere le resultat de la requete et le retourne
    })
}


#[tauri::command]
fn save(destination_file: String) {
    let simulation_dir = std::env::current_dir().unwrap().join("simulation");
    let source_file = simulation_dir.join("temp.txt");

    let mut source = fs::File::open(source_file).unwrap();
    let mut contents = Vec::new();
    source.read_to_end(&mut contents).unwrap();

    let mut destination = fs::File::open(simulation_dir.join(&destination_file)).unwrap();
    destination.set_len(0).unwrap(); 
    destination.write_all(&contents).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![copy_files,format_code,save]) //gestion de l'invoke
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
