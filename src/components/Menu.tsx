import { open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { initModelDisplay } from "./ModelDisplay";
import { initCodeDisplay } from "./CodeDisplay";

function Menu() {

    var curent_file: string = "";

    /**
     * ajoute le nom du fichier en cours au label
     * @param choice le nom du fichier actuellement chargé
     */
    function updateLabel(choice: string) {
        curent_file = choice;
        const name = choice.split('/').pop();
        if (name) document.getElementById('label')!.innerText = name;
    }

    function refresh(filepath: string) {
        updateLabel(filepath);
        initCodeDisplay(filepath);
        initModelDisplay(filepath);
    }


    /**
     * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le charger
     * dans l'editeur (code et model Display)
     */
    async function load_fichier() {
        const select = await open({
            defaultPath: "./simulation",
            multiple: false,
            filters: [{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
        });
        if (select) {
            const choice: string = String(select);
            refresh(choice);
        }
    }

    /**
     * créer un nouveau fichier et le charge
     */
    function new_fichier() {
        const res: string | null = prompt('nom du fichier:');
        if (res) {
            invoke('new_file', { filename: res }).then(async result => {
                //@ts-ignore
                const filepath: string = result;
                refresh(filepath);
            });
        }
    }

    return (
        <div className="menu">
            <button onClick={new_fichier}>nouveau modèle</button>
            <button onClick={load_fichier}>ouvrir un modèle atomique</button>
        </div>
    );
}

export { Menu }