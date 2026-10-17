import fs from 'node:fs';
const files=['exercises','storage','timer','training','generator','audio','anatomy','movement','app'];
let js=files.map(name=>fs.readFileSync(`src/${name}.js`,'utf8').replace(/^import .+;\s*$/gm,'').replace(/^export /gm,'')).join('\n');
js=js.replaceAll('</script','<\\/script');
const css=fs.readFileSync('styles.css','utf8');
let html=fs.readFileSync('index.html','utf8').replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`).replace('<script type="module" src="src/app.js"></script>',`<script>(()=>{\n${js}\n})();</script>`);
html=html.replace('<link rel="manifest" href="manifest.webmanifest">','').replaceAll('href="assets/icon.svg"',`href="data:image/svg+xml,${encodeURIComponent(fs.readFileSync('assets/icon.svg','utf8'))}"`);
fs.writeFileSync('BodyWOD.html',html);
console.log(`BodyWOD.html: ${Math.round(Buffer.byteLength(html)/1024)} KB, sem dependências externas.`);
