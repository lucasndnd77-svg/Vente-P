/* Catalogue : affichage de la grille + recherche instantanée */
const grid=document.getElementById('grid'),q=document.getElementById('q'),none=document.getElementById('none'),count=document.getElementById('count');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function render(){const t=norm(q.value),list=getCatalog().filter(p=>norm(p.name).includes(t));
 grid.innerHTML=list.map(cardHTML).join('');none.hidden=list.length>0;count.textContent=list.length+' goût'+(list.length>1?'s':'');observeReveal()}
q.addEventListener('input',render);
document.getElementById('reset').addEventListener('click',()=>{q.value='';render();q.focus()});
render();
