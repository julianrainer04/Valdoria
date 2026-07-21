'use strict';

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const dataFiles=['life-actions','scenarios','petitions','emergent','private-incidents','living-history','deep-strategy','deep-systems'];
let source=dataFiles.map(file=>fs.readFileSync(path.join(root,'data',file+'.js'),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'game.js'),'utf8');
const uiBindings=source.indexOf("document.addEventListener('click',e=>{let b=e.target.closest('[data-view]')");
if(uiBindings<0)throw new Error('Browser-Bindungen nicht gefunden');
source=source.slice(0,uiBindings)+'\n;globalThis.__mapGuide={state,mapSvg};';
const element={innerHTML:'',close(){},showModal(){},classList:{add(){},remove(){}},querySelector(){return element},querySelectorAll(){return[]}};
const context={structuredClone,Intl,console,Math,Date,localStorage:{getItem(){return null},setItem(){},removeItem(){}},document:{querySelector(){return element},querySelectorAll(){return[]}},window:{scrollTo(){}},requestAnimationFrame(fn){fn()},setTimeout(){}};
vm.runInNewContext(source,context,{filename:'valdoria-map-guide.js'});
const html=context.__mapGuide.mapSvg();
let svg=html.match(/<svg[\s\S]*<\/svg>/)?.[0];
if(!svg)throw new Error('Vektorkarte konnte nicht gerendert werden');
const maskMode=process.argv.includes('--mask');
const guideStyle=`<style>
.vector-ocean{fill:#9dbac0}.vector-ocean-pattern{opacity:.12}.vector-land{fill:#d6c48e;stroke:#2b2117;stroke-width:5;stroke-linejoin:round}.vector-land-texture{display:none}[data-territory="caerhaven"] .vector-land{fill:#315b7d}[data-territory="falkenkrone"] .vector-land{fill:#547a8f}[data-territory="nordhaven"] .vector-land{fill:#b9c7c3}[data-territory="ravengar"] .vector-land{fill:#c2a26a}[data-territory="eldoria"] .vector-land{fill:#9cab76}[data-territory="aurelia"] .vector-land{fill:#d0b56f}[data-territory="lysara"] .vector-land{fill:#a9beb1}[data-territory="islands"] .vector-land{fill:#91b2c1}.atlas-routes,.movement-layer,.rgn,.terrain,.sea-names,.sea-currents,.carto-compass,.atlas-fleet,.vector-map-frame{display:none}
</style>`;
const maskStyle=`<style>
.vector-ocean{fill:#000}.vector-ocean-pattern,.vector-land-texture,.atlas-routes,.movement-layer,.rgn,.terrain,.sea-names,.sea-currents,.carto-compass,.atlas-fleet,.vector-map-frame{display:none}.vector-territories{filter:none!important}.vector-land{fill:#fff!important;stroke:#fff;stroke-width:1}
</style>`;
const style=maskMode?maskStyle:guideStyle;
svg=svg.replace(/(<svg[^>]*>)/,'$1'+style);
const out=path.resolve(process.argv[2]||path.join(root,'map-boundary-guide.svg'));
fs.writeFileSync(out,svg);
console.log(out);
