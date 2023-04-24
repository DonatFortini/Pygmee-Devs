export { module_factory, link_factory }
import * as joint from 'jointjs';

function module_factory(name: string, time = Infinity, pos = { x: 0, y: 0 }): joint.shapes.basic.Rect {
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



function link_factory(rect1: joint.shapes.basic.Rect, rect2: joint.shapes.basic.Rect, labelText: string): joint.dia.Link {
    var link = new joint.dia.Link({
        source: { id: rect1.id },
        target: { id: rect2.id },
        attrs: {
          '.connection': { stroke: 'black', 'stroke-width': 2 },
          '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z', fill: 'black' },
          '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: 'black' }
        },
        labels: [
          { position: 0.5, attrs: { text: { text: labelText } } }
        ]
      });
      

    return link;
}









