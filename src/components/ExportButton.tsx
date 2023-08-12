import { confirm } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api";
import { getAdvanceContent } from "./ModelDisplay";
import { editor } from "./CodeDisplay";
import { curent_file } from "./Menu";


function ExportButton() {
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
        <button onClick={finish} className="export" >Exporter</button>
    );
}

export { ExportButton }