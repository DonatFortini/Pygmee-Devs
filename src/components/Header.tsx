import { invoke } from '@tauri-apps/api/tauri';
import logo from '../assets/logo_pygmee.png'
import {open} from '@tauri-apps/api/dialog'
 

function Header() {
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

    return (
        <div className="header">
            <img className='logo' src={logo} alt="" />
            <h1>Pygmee-DEVS</h1>
            <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
                <label id="label" className="label"></label>
                <button onClick={import_sim} >Importer</button>
            </div>
        </div>
    );
}

export {Header}