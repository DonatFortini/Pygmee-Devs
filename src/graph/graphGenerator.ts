import { module_factory, link_factory } from './graph';
import * as joint from 'jointjs';

export { parseCodeToGraph }


function parseCodeToGraph(code: string): joint.dia.Graph {
    const graph = new joint.dia.Graph();

    //recherche des modules
    const modulesRegex = /hold in (.+?) for time (\d+)|go to (\w+)|passivate in (\w+)/g;
    let match;
    const modules: { name: string; time: number }[] = [];

    while ((match = modulesRegex.exec(code)) !== null) {
        const [_, name, timeStr, target, passivate] = match;
        const time = timeStr ? parseInt(timeStr) : Infinity;
        const module = { name: name || target || passivate, time: time };

        const isDuplicate = modules.every((m) => m.name !== module.name || m.time !== module.time);

        if (isDuplicate) {
            modules.push(module);
        } 
    }



    //recherche des liens
    const link_name_typeregex = /input on (\w+)|output on (\w+)/g;
    const link_start_regex1 = /after (\w+) output (\w+)/
    const link_start_regex2 = /when in (\w+) and receive (\w+)/;
    const link_transition_regex = /(\w+) go to (\w+)/g;

    const links: { name: string; type: string; source: string; target: string; }[] = [];

    let source: string;
    let target: string = '';
    let type: string;
    let name: string;

    while ((match = link_name_typeregex.exec(code)) !== null) {
        if (match[1]) {
            type = "input";
            name = match[1];
        } else {
            type = "output";
            name = match[2];
        }

        const startMatch1 = link_start_regex1.exec(code);
        const startMatch2 = link_start_regex2.exec(code);


        if (startMatch1 && startMatch1[2] === name) {
            source = startMatch1[1];
        }
        else if (startMatch2 && startMatch2[2] === name) {
            source = startMatch2[1];
        }
        else {
            console.error("No transition found for link", name, type);
            continue;
        }


        let transitionMatch = null;
        while ((transitionMatch = link_transition_regex.exec(code)) !== null) {
            if (transitionMatch[1] === source || transitionMatch[1] === name) {
                target = transitionMatch[2];
                link_transition_regex.lastIndex = 0;
                break;
            }
        }

        const existingLink = links.find((link) => link.name === name && link.type === type && link.source === source);
        if (existingLink) {
            console.error("Link already exists for", name, type, source);
            continue;
        }
        links.push({ name, type, source, target });

    }

    console.log("Modules:", modules);
    console.log("Links:", links);

    let  x=10;
    let y=10;
    for (const iter of modules) {
        const m = module_factory(iter.name, iter.time,{x,y});
        graph.addCell(m);
        x+=100;
    }

 
    for (const iter of links) {
        const module1 = graph.getCell(iter.source) as joint.shapes.basic.Rect;
        const module2 = graph.getCell(iter.target) as joint.shapes.basic.Rect;
        let label:string;
        if(iter.type=='input'){
            label="?"+iter.name
        }
        else{
            label="!"+iter.name
        }
       
        
        const m = link_factory(module1, module2, label);
        graph.addCell(m);
    }

    return graph;
}
