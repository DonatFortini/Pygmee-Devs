// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pyo3::prelude::*;
use serde::{Serialize, Serializer};
use std::{path::Path, io::Write, fs};
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
fn save(current_file: String, text: String) {
    let path = Path::new(&current_file);

    // Open the file in write-only mode, creating it if it doesn't exist
    if let Ok(mut file) = fs::File::create(path) {
        // Truncate the file to 0 bytes
        if let Ok(_) = file.set_len(0) {
            // Write the text to the file
            let _ = file.write_all(text.as_bytes());
        }
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![copy_files,save]) //gestion de l'invoke
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
