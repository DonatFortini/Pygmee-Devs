// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lazy_static::lazy_static;
use std::{fs, io::Write, path::Path, sync::Mutex};
use tauri::Manager;

lazy_static! {
    static ref MAIN_WINDOW: Mutex<Option<tauri::Window>> = Mutex::new(None);
}

fn get_main_window() -> Option<tauri::Window> {
    (*MAIN_WINDOW.lock().unwrap()).clone()
}

fn set_main_window(window: tauri::Window) {
    *MAIN_WINDOW.lock().unwrap() = Some(window);
}



/*
gestion des erreur python
use pyo3::prelude::*;
use serde::{Serialize, Serializer};
use tauri::{command::private::ResultKind}

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

*/

/*fonction de copy des fichier je l'appelle pour copier les fichiers recuperés par le bouton import du coté front
pour les avoir dans mon dossier simulation pour que l'utilisateur puisse se créer une biblioteque*/
#[tauri::command]
fn copy_files(files: Vec<String>) {
    let simulation_dir = std::env::current_dir().unwrap().join("simulation");
    for file in files {
        let src_path = Path::new(&file);
        if src_path.exists() {
            let file_name = src_path.file_name().unwrap();
            let dest_path = simulation_dir.join(file_name);
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
    if let Ok(mut file) = fs::File::create(path) {
        if let Ok(_) = file.set_len(0) {
            let _ = file.write_all(text.as_bytes());
        }
    }
}

#[tauri::command]
fn new_file(filename: String) -> String {
    let simulation_dir = std::env::current_dir().unwrap().join("simulation");
    let path = simulation_dir.join(filename + ".dnl");
    let cloned_path = path.clone();
    let _ = fs::File::create(&path);
    cloned_path.to_string_lossy().to_string()
}

#[tauri::command]
fn add_link(types: String, name: String, source: String, target: String) {
    let eval_string = format!(
        "verifLink('{}', '{}', '{}', '{}')",
        types, name, source, target
    );
    let main_window = get_main_window().expect("Main window not set");
    main_window.eval(&eval_string).unwrap();
}

#[tauri::command]
fn add_mod(name: String, time: i32) {
    let eval_string = format!("verifMod('{}', '{}')", name, time);
    let main_window = get_main_window().expect("Main window not set");
    main_window.eval(&eval_string).unwrap();
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command(async)]
async fn getcache(label: String) -> String {
    let main_window = get_main_window().expect("Main window not set");
    let (result_tx, result_rx) = std::sync::mpsc::channel();
    let _listener = main_window.listen("get-cache-result", move |event| {
        let result: String = event.payload().expect("Failed to get result").to_owned();
        result_tx.send(result).expect("Failed to send result");
    });

    main_window
        .emit("get-cache", Payload { message: label })
        .expect("Failed to emit event");

    let result = result_rx.recv().expect("Failed to receive result");
    println!("{}", result);
    result
}

#[tauri::command]
fn setcache(label: String, content: String) {
    let eval_string = format!("setCache('{}', '{}')", label, content);
    let main_window = get_main_window().expect("Main window not set");
    main_window.eval(&eval_string).unwrap();
}

//transcript the dnl code into python advance is the content store in the cache
#[tauri::command]
fn transcript(filename: String, advance_content: String)-> Result<(), xdg_user::Error>{
    //create the file in the dowload
    let path = xdg_user::UserDirs::new()?;
    let fpath=path.downloads().unwrap().join(filename+".py");
    let _ = fs::File::create(&fpath);
    //transpile the dnl into python code
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            set_main_window(main_window);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            copy_files, save, new_file, add_link, add_mod, setcache, getcache
        ]) //gestion de l'invoke
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
