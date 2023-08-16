import { readTextFile } from '@tauri-apps/api/fs';
import { WebviewWindow } from '@tauri-apps/api/window';
import * as joint from 'jointjs';
import { delElement, parseCodeToGraph } from '../script/graphGenerator';

//decommenter en build
/*
import '../html/form_link.html' ;
import '../html/form_modl.html' ;
import '../html/code.html' ;
*/
import '../public/ContextMenu.css';

export { initModelDisplay, Graph, getAdvanceContent }
var Graph: joint.dia.Graph;

interface ContextMenuItem {
    label: string;
    action: () => void;
}

let currentContextMenu: HTMLUListElement | null = null;

function displayContextMenu(options: ContextMenuItem[], x: number, y: number) {
    if (currentContextMenu) currentContextMenu.remove();
    const mainboard = document.getElementById('modelDisplay');
    const menu = document.createElement('ul');
    menu.classList.add('context-menu');
    menu.style.position = 'absolute';

    menu.style.left = (mainboard!.offsetLeft + x) + 'px';
    menu.style.top = (mainboard!.offsetTop + y) + 'px';

    options.forEach((option) => {
        const menuItem = document.createElement('li');
        menuItem.textContent = option.label;
        menuItem.addEventListener('click', () => {
            option.action();
            menu.style.display = 'none';
        });
        menu.appendChild(menuItem);
    });

    mainboard!.appendChild(menu);
    currentContextMenu = menu;
}

document.addEventListener('click', () => { if (currentContextMenu) currentContextMenu.style.display = 'none'; });

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
            Graph = parseCodeToGraph(data);
            const zone = document.getElementById("modelDisplay");
            const paper = new joint.dia.Paper({
                el: zone,
                model: Graph,
                height: '90%',
                width: '65%'
            });

            zone!.style.backgroundColor = '#9FA2B2';

            interface cellView {
                model: { id: string }
            }

            paper.on(' cell:pointerdblclick',
                (obj: cellView) => {
                    webview = createWebview('./src/html/code.html', obj.model.id);
                }
            );
            paper.on('cell:contextmenu', (obj: joint.dia.CellView, evt: any, x: number, y: number) => {
                evt.preventDefault();

                const linkContext: ContextMenuItem[] = [
                    {
                        label: 'Suprimer le lien',
                        action: () => {
                            // @ts-ignore 
                            delElement(obj.model.id);
                        }
                    }
                ];

                const modContext: ContextMenuItem[] = [
                    {
                        label: 'Ajouter un lien',
                        action: () => {
                            // @ts-ignore 
                            add_link(obj.model.id);
                        }
                    },
                    {
                        label: 'Supprimer le module',
                        action: () => {
                            // @ts-ignore 
                            delElement(obj.model.id);
                        }
                    }
                ];
                // @ts-ignore 
                const contextMenuOptions = (obj.model.attributes.type == "basic.Rect") ? modContext : linkContext;
                displayContextMenu(contextMenuOptions, x, y);
            });
            paper.on('blank:contextmenu', (event: any, x: number, y: number) => {
                event.preventDefault();
                const contextMenuOptions: ContextMenuItem[] = [
                    {
                        label: 'Ajouter un module',
                        action: () => {
                            add_modl();
                        }
                    },
                    {
                        label: 'Ajouter un lien',
                        action: () => {
                            add_link();
                        }
                    }
                ];
                displayContextMenu(contextMenuOptions, x, y);
            });
        })
        .catch(error => {
            console.error(error);
        });

    function add_link(args: string = "") {
        webview = createWebview(`./src/html/form_link.html?args=${args}`, "Ajout_lien");
    }


    function add_modl() {
        webview = createWebview("./src/html/form_modl.html", "Ajout_module");
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
        height: 100,
        resizable: false,
        title: titre,
        focus: true
    });
    return webview;
}


function getAdvanceContent(): string {
    const contentObject: Record<string, { content: string }> = {};

    for (const cell of Graph.getCells().slice(1)) {
        const cellId = cell.id;
        const cellContent = cell.attr().code.text;
        contentObject[cellId] = { content: cellContent };
    }

    return JSON.stringify(contentObject, null, 2);
}

function ModelDisplay() {
    return (
        <div id="modelDisplay" className="modelDisplay" ></div>
    );
}

export { ModelDisplay }




