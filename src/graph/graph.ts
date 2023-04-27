export { module_factory, link_factory }
import * as joint from 'jointjs';

/**
 * Crée un module de forme rectangulaire pour un diagramme.
 * 
 * @param name Le nom du module.
 * @param time Le temps de traitement du module (par défaut, temps infini).
 * @param pos La position du module (par défaut, { x: 0, y: 0 }).
 * @returns Un objet `joint.shapes.basic.Rect` représentant le module.
 */
function module_factory(name: string, time = Infinity, pos = { x: 0, y: 0 }): joint.shapes.basic.Rect {
    // formatage du temps
    const timeString = `ta=${time}`;
    var rect = new joint.shapes.basic.Rect({
        position: pos,
        size: { width: 100, height: 50 },
        attrs: {
            rect: { fill: '#FFFFFF', stroke: '#000000', 'stroke-width': 2 },
            text: { text: name + "\n" + timeString, 'font-size': 10, 'text-anchor': 'middle', 'y-alignment': 'middle', fill: '#000000' }
        },
        id: name
    });

    return rect;
}


/**
 * Crée un lien pour connecter deux modules dans un diagramme.
 * 
 * @param rect1 Le premier module à connecter.
 * @param rect2 Le second module à connecter.
 * @param labelText Le texte à afficher sur le lien.
 * @returns Un objet `joint.dia.Link` représentant le lien.
 */
function link_factory(rect1: joint.shapes.basic.Rect, rect2: joint.shapes.basic.Rect, labelText: string): joint.shapes.standard.Link {
    var link = new joint.shapes.standard.Link({
        source: { id: rect1.id },
        target: { id: rect2.id },
        labels: [
          { position: 0.5, attrs: { text: { text: labelText } } }
        ]
      });
      

    return link;
}









