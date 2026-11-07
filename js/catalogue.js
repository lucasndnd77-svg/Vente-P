/* Catalogue : affichage de la grille + recherche instantanée + filtres (type de goût, en stock) */
const grid=document.getElementById('grid'),q=document.getElementById('q'),none=document.getElementById('none'),count=document.getElementById('count'),ftypes=document.getElementById('ftypes'),fstock=document.getElementById('fstock');
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
/* Types de goût proposés dans le filtre : [arôme (voir TASTES dans main.js), icône, libellé, couleur] */
const TYPES=[['','✨','Tous','#7a5cff'],['glace','❄️','Glacé','#38d6ff'],['fruits-rouges','🍓','Fruits rouges','#ff3b6b'],['baies','🫐','Baies','#6a5cff'],['exotique','🥭','Exotique','#ff9f1c'],['pasteque','🍉','Pastèque','#2fd47a'],['cerise','🍒','Cerise','#e0123f'],['acidule','🍋','Acidulé','#d8e021'],['bonbon','🍬','Bonbon','#ff6bd6']];
let type='';
ftypes.innerHTML=TYPES.map(([v,ic,l,c],i)=>`<label class="ft" style="--fc:${c}"><input type="radio" name="ft" value="${v}" ${i?'':'checked'}><span>${ic} ${l}</span></label>`).join('');
function render(){const t=norm(q.value),list=getCatalog().filter(p=>norm(p.name).includes(t)&&(!type||(TASTES[p.id]||[]).includes(type))&&(!fstock.checked||STOCK.has(p.id)));
 grid.innerHTML=list.map(cardHTML).join('');none.hidden=list.length>0;count.textContent=list.length+' goût'+(list.length>1?'s':'');observeReveal()}
q.addEventListener('input',render);
ftypes.addEventListener('change',e=>{type=e.target.value;render()});
fstock.addEventListener('change',render);
document.getElementById('reset').addEventListener('click',()=>{q.value='';type='';ftypes.querySelector('input').checked=true;fstock.checked=false;render();q.focus()});
stockReady.then(()=>{if(fstock.checked)render()});
render();
