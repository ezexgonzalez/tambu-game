import { EventEmitter } from 'node:events';

export function makeUiScene(width = 1280, height = 720) {
  const objects = [];
  const keys = new Map();
  function make(type, x = 0, y = 0, text = '', style = {}) {
    const object = { type, x, y, text, style, visible: true, destroyed: false, destroyCount: 0, rectangles: [],
      setPosition(x,y) { this.x=x; this.y=y; return this; },
      setOrigin(x,y=x) { this.originX=x; this.originY=y; return this; },
      setScrollFactor(v) { this.scrollFactor=v; return this; },
      setDepth(v) { this.depth=v; return this; },
      setVisible(v) { this.visible=v; return this; },
      setStrokeStyle() { return this; },
      setStyle(v) { Object.assign(this.style,v); return this; },
      setText(v) { this.text=v; return this; },
      setTexture(key,frame) { this.texture=key; this.frame=frame; return this; },
      setScale(x,y) { this.scaleX=x; this.scaleY=y; return this; },
      setFillStyle() { return this; },
      clear() { this.rectangles=[]; this.clears=(this.clears??0)+1; return this; },
      fillStyle() { return this; },
      fillRect(...rect) { this.rectangles.push(rect); return this; },
      fillTriangle() { return this; }, lineStyle() { return this; }, strokeRect() { return this; }, lineBetween() { return this; },
      destroy() { this.destroyed=true; this.destroyCount++; this.visible=false; },
    };
    objects.push(object); return object;
  }
  return { objects, keys, scale: {width,height}, events: new EventEmitter(),
    input: {keyboard: {addKey(code) { if(!keys.has(code))keys.set(code,{justDown:false});return keys.get(code); }}},
    add: { graphics: ()=>make('graphics'), text:(x,y,text,style)=>make('text',x,y,text,style),
      rectangle:(x,y,width,height)=>Object.assign(make('rectangle',x,y),{width,height}),
      image:(x,y,key,frame)=>make('image',x,y).setTexture(key,frame) },
  };
}
export function assertUiFits(assert, scene, elements = scene.objects) {
  for(const o of elements.filter(o=>!o.destroyed)) {
    if(o.uiRect) {
      const r=o.uiRect;
      assert.ok(r.width>0 && r.height>0, 'positive UI rectangle');
      assert.ok(r.x>=0 && r.y>=0 && r.x+r.width<=scene.scale.width+1 && r.y+r.height<=scene.scale.height+1,
        `viewport bounds: ${o.uiRole??o.text}`);
      if(o.bodyMetrics)assert.ok(o.bodyMetrics.height<=r.height, `body fit: ${o.text}`);
    }
    if(o.pixelMetrics) {
      const m=o.pixelMetrics;
      const align=o.pixelAlign??'center';
      const left=o.x-(align==='center'?m.width/2:align==='right'?m.width:0);
      assert.ok(left>=-1 && left+m.width<=scene.scale.width+1 && o.y-m.height/2>=-1
        && o.y+m.height/2<=scene.scale.height+1, `pixel fit: ${o.text}`);
    }
  }
}
