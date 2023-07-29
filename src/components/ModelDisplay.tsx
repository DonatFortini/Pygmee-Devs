import { readTextFile } from '@tauri-apps/api/fs';
import { WebviewWindow } from '@tauri-apps/api/window';
import { ContextMenu } from './contextMenu';
import * as joint from 'jointjs'
import { parseCodeToGraph } from '../script/graphGenerator';


export { initModelDisplay ,Graph}
var Graph:joint.dia.Graph;
/**
 * appele une fonction du front-end qui parse le code du fichier selectioné le renvoi sous forme 
 * de diagramme html et le display dans div modelDisplay
 * 
 *@param filepath chemin du fichier selectioné dans la fenêtre de dialogue 
*/
async function initModelDisplay(filepath: string) {

    let webview: WebviewWindow;
    readTextFile(filepath)
        .then(data => {
            Graph=parseCodeToGraph(data);
            const paper = new joint.dia.Paper({
                el: document.getElementById("modelDisplay"),
                model: Graph,
                height: '70%',
                width: '60%'
            });

            interface cellView {
                model: { id: string }
            }

            paper.on(' cell:pointerdblclick',
                (obj: cellView) => {
                    webview = createWebview('./src/html/code.html', obj.model.id);
                }
            );
            paper.on('cell:contextmenu', (obj: joint.dia.CellView, evt: any, x: number, y: number) => {
                const items = ['supprimer', 'ajouter'];
                const onClick = (item: string) => { alert(`${item} was clicked.`); };
                <ContextMenu items={items} onClick={onClick} />
            });
            paper.on('blank:contextmenu', (event: any, x: number, y: number) => {
                //TODO contextmenu
                console.log(x, y);

            });
        })
        .catch(error => {
            console.error(error);
        });

    function add_link() {
        webview = createWebview("../html/form_link.html", "Ajout_lien");
    }

    function del_link(id: string) {
    }

    function del_modl(id: string) {
        //TODO implementer pour le futur
    }

    function add_modl() {
        webview = createWebview("../html/form_modl.html", "Ajout_module");
    }
}

/**
 * permet d'initaliser des fenêtres d'interaction a partir d'un url
 * @param url:string lien vers un formulaire html 
 * @param titre:string titre de la fenêtre 
 * @returns instance de webview 
 */
function createWebview(url: string, titre: string) {
    const webview = new WebviewWindow(titre, {
        url: url,
        width: 400,
        height: 200,
        resizable: false,
        title: titre
    });
    return webview;
}


function ModelDisplay() {
    return (
        <div id="modelDisplay" className="modelDisplay" ></div>
    );
}

export { ModelDisplay }


