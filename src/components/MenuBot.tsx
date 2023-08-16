import { open,confirm } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { getAdvanceContent } from "./ModelDisplay";
import { editor } from "./CodeDisplay";
import { curent_file } from "./MenuTop";


function MenuBot(){
    /**
     * ouvre une fenêtre de dialogue qui permet de selectioner un fichier pour le copier
     * dans le dossier simulation de l'appli pour l'avoir a disposition
     */
    async function import_sim() {
        let file = await open({
            multiple: true,
            filters: [{ name: 'DNL Files', extensions: ['dnl', 'DNL'] }]
        });
        if (file != null) {
            if (Array.isArray(file)) {
                invoke('copy_files', { files: file });
            }
        }
    }

    /**
     * enregistre le fichier final dans le dossier téléchargements
     */
    async function finish() {
        if (editor) {
            let conf = await confirm('êtes-vous sûr de vouloir finir', 'Exporter');
            if (conf) {
                await invoke('transcript', { filename: curent_file.split('/').pop()!.split('.')[0], advanceContent: getAdvanceContent() });
            }
        }
        else alert("Aucun fichier chargé!!");
    }

    return (
        <div className='menu'>
            <button onClick={import_sim} id='import'>Importer</button>
            <button onClick={finish} className="export" >Exporter</button>
        </div>
    );
}

export{MenuBot}