import { confirm } from "@tauri-apps/api/dialog";

function ExportButton() {
    /**
     * enregistre le fichier final dans le dossier téléchargements
     */
    async function finish() {
        let conf = await confirm('êtes-vous sûr de vouloir finir', 'Exporter');
        if (conf) {
            // TODO finir le projet connard
        }
    }

    return (
        <button onClick={finish} className="export" >Exporter</button>
    );
}

export {ExportButton}