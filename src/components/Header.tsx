import { invoke } from '@tauri-apps/api/tauri';
import logo from '../assets/logo_pygmee.png';
import { open } from '@tauri-apps/api/dialog';
import burgH from '../assets/horizontal.svg';

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

    function sideScreen() {
        document.getElementById('burgH')!.style.display = 'none';
        document.getElementById('col')!.style.display = 'inherit';
    }

    return (
        <div className="header">
            <img id='burgH' className='burgH' src={burgH} onClick={sideScreen} />
            <img className='logo' src={logo} alt="" />
            <h1 id='title'>Pygmee-DEVS</h1>
            <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
                <label id="label" className="label"></label>
                <button onClick={import_sim} id='import'>Importer</button>
            </div>
        </div>
    );
}

export { Header }