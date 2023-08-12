import { editor } from '../components/CodeDisplay';
import { Graph } from '../components/ModelDisplay';
import { module_factory, link_factory, start } from './graph';
import * as joint from 'jointjs';

export { parseCodeToGraph, code_to_parse, updateGraph, delElement }

interface Module {
    name: string
    time: number
}

interface Link {
    name: string
    type: string
    source: string
    target: string
}

interface ListeObjets {
    modules: Module[]
    links: Link[]
}


/**
 *Tout d'abord la fonction parse le code pour trouver les modules
 *et les liens, une fois trouvés elle les instancient et les ajoutent
 *au diagramme
 * 
 * @param code:string Le code qui est display dans l'editeur.
 * @returns Un objet `joint.dia.Graph` représentant le Graphique.
 */
function parseCodeToGraph(code: string): joint.dia.Graph {

    const graph = new joint.dia.Graph();

    const res = code_to_parse(code);
    const modules: Module[] = res.modules;
    const links: Link[] = res.links;

    let x = 10;
    let y = 10;
    let premier: boolean = true;
    for (const iter of modules) {
        const m = module_factory(iter.name, iter.time, { x, y });
        if (premier) {
            const startmod = start(m);
            m.embed(startmod);
            graph.addCells([startmod, m])
            premier = false;
        }
        else { graph.addCell(m); }
        x += 100;
    }


    for (const iter of links) {
        const module1 = graph.getCell(iter.source) as joint.shapes.basic.Rect;
        const module2 = graph.getCell(iter.target) as joint.shapes.basic.Rect;
        const label: string = (iter.type == 'input') ? "?" + iter.name : "!" + iter.name;
        const m = link_factory(module1, module2, label);
        graph.addCell(m);
    }

    return graph;
}

/**
 * retourne la liste des modules et liens detecté lors du parsing
 * @param code:string 
 * @returns ListeObjets contenant les modules et liens
 */
function code_to_parse(code: string): ListeObjets {
    //recherche des modules
    const modulesRegex = /hold in (.+?) for time (\d+)|passivate in (\w+)/g;
    let match;
    const modules: Module[] = [];
    // Boucle sur les correspondances trouvées par la regex pour extraire les noms et temps des modules
    while ((match = modulesRegex.exec(code)) !== null) {
        const [_, name, timeStr, target, passivate] = match;
        const time = timeStr ? parseInt(timeStr) : Infinity;
        const module = { name: name || target || passivate, time: time };
        // Vérifie si le module est déjà présent dans le tableau de modules
        const isDuplicate = modules.every((m) => m.name !== module.name || m.time !== module.time);
        // Si le module est unique, l'ajoute au tableau de modules
        if (isDuplicate) modules.push(module);
    }

    //recherche des liens
    const link_name_typeregex = /input on (\w+)|output on (\w+)/g;
    const link_start_regex = /when in (\w+) and receive (\w+)|after (\w+) output (\w+)/g;
    const link_transition_regex = /(\w+) go to (\w+)/g;

    const links: Link[] = [];

    let source: string = '';
    let target: string = '';
    // Boucle sur les correspondances trouvées par la regex pour extraire les informations des liens
    while ((match = link_name_typeregex.exec(code)) !== null) {
        const type: string = (match[1]) ? "input" : "output";
        const name: string = (match[1]) ? match[1] : match[2];
        // Recherche du module source du lien
        let startMatch: string[] | null;

        while ((startMatch = link_start_regex.exec(code)) != null) {
            startMatch = startMatch!.filter((item) => item !== undefined) as RegExpExecArray;
            if (startMatch && startMatch[2] === name) {
                source = startMatch[1];
            }
            if (startMatch == null) {
                console.error("No transition found for link", name, type);
                continue;
            }
        }

        // Recherche du module cible du lien
        let transitionMatch = null;
        while ((transitionMatch = link_transition_regex.exec(code)) !== null) {
            if (transitionMatch[1] === source || transitionMatch[1] === name) {
                target = transitionMatch[2];
                link_transition_regex.lastIndex = 0;
                break;
            }
        }
        // Vérifie si le lien existe déjà
        const existingLink = links.find((link) => link.name === name && link.type === type && link.source === source);
        if (existingLink) {
            console.error("Link already exists for", name, type, source);
            continue;
        }
        // Si le lien est unique, l'ajoute au tableau de liens
        links.push({ name, type, source, target });

    }

    const liste: ListeObjets = { modules, links }

    return liste;
}

/**
 * 
 * @param uparray:ListeObjets la liste actuelle des objets present dans le code
 * @param graph:`joint.dia.Graph` le Graphique.
 * @returns ListeObjets contenant les nouveaux modules et liens a implementer
 */
function updateGraph(uparray: ListeObjets, graph: joint.dia.Graph): ListeObjets {
    var modules: Module[] = uparray.modules;
    var links: Link[] = uparray.links;

    for (const iter of modules) {
        if (graph.getCell(iter.name)) modules = modules.filter((elem) => elem !== iter);
    }

    for (const iter of links) {
        const prefix: string = (iter.type == "output") ? "!" : "?";
        if (graph.getCell(prefix + iter.name)) {
            links = links.filter((elem) => elem !== iter);
        }
    }

    const newListe: ListeObjets = { modules, links };

    return newListe;
}


function filterElement(code: string, element: string) {
    const codeArray: string[] = code.split('\n');
    let modified: string = "";
    element = (element.match(/[?!]/)) ? element.split(/[?!]/)[1] : element;
    for (const iter of codeArray) {
        if (!iter.includes(element) && !iter.includes(element + "!")) modified += iter + "\n";
    }
    return modified;
}

function validModule(id: string) {
    
}

function validLink(id: string) { }

function delElement(id: string) {
    const code: string = editor.getValue();
    const modified: string = filterElement(code, id);
    Graph.removeCells([Graph.getCell(id)]);
    editor.setValue(modified);
}