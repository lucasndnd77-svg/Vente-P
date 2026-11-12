/* Catalogue : choix Puffs / E-liquides, puis grille + recherche instantanée + filtres (type de goût, en stock)
   L'adresse retient le choix : catalogue.html?cat=puff ou catalogue.html?cat=eliquide */
const grid=document.getElementById('grid'),q=document.getElementById('q'),none=document.getElementById('none'),count=document.getElementById('count'),ftypes=document.getElementById('ftypes'),fstock=document.getElementById('fstock'),kinds=document.getElementById('kinds'),browse=document.getElementById('browse'),pick=document.getElementById('pick');
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
/* Les deux familles de produits : [clé, icône, titre, sous-titre, image, liste, couleurs] */
const KINDS=[['puff','🔋','Puffs',()=>`${getCatalog().length} goûts · ${eur(PRICE)} · 2 recharges offertes`,'images/produits/peach-berry.png',getCatalog,'#ff3b6b','#7a5cff'],
 ['eliquide','💧','E-liquides',()=>`${getLiquids().length} goûts · ${eur(LIQ_PRICE)} · 10 ml · 0, 1 ou 2 %`,'images/eliquides/peach-berry.webp',getLiquids,'#38d6ff','#7a5cff']];
/* Types de goût proposés dans le filtre : [arôme (voir TASTES dans main.js), icône, libellé, couleur] */
const TYPES=[['','✨','Tous','#7a5cff'],['glace','❄️','Glacé','#38d6ff'],['fruits-rouges','🍓','Fruits rouges','#ff3b6b'],['baies','🫐','Baies','#6a5cff'],['exotique','🥭','Exotique','#ff9f1c'],['pasteque','🍉','Pastèque','#2fd47a'],['cerise','🍒','Cerise','#e0123f'],['peche','🍑','Pêche','#ffa36b'],['acidule','🍋','Acidulé','#d8e021'],['bonbon','🍬','Bonbon','#ff6bd6'],['menthe','🌿','Menthe','#1fd8b0']];
let type='',kind=new URLSearchParams(location.search).get('cat');if(!KINDS.some(k=>k[0]===kind))kind=null;
kinds.innerHTML=KINDS.map(([k,ic,t,sub,img,,c1,c2])=>`<button class="kind" type="button" role="tab" data-k="${k}" style="--c1:${c1};--c2:${c2}"><img src="${img}" alt=""><span><b>${ic} ${t}</b><small>${sub()}</small></span><i>→</i></button>`).join('');
const list=()=>KINDS.find(k=>k[0]===kind)[5]();
/* N'affiche dans le filtre que les types qui existent pour la famille choisie */
function buildTypes(){const L=list(),has=v=>!v||L.some(p=>(TASTES[p.id]||[]).includes(v));if(!has(type))type='';
 ftypes.innerHTML=TYPES.filter(t=>has(t[0])).map(([v,ic,l,c])=>`<label class="ft" style="--fc:${c}"><input type="radio" name="ft" value="${v}" ${v===type?'checked':''}><span>${ic} ${l}</span></label>`).join('')}
function setKind(k,push){kind=k;kinds.classList.toggle('compact',!!k);browse.hidden=!k;pick.hidden=!!k;
 kinds.querySelectorAll('.kind').forEach(b=>{b.classList.toggle('on',b.dataset.k===k);b.setAttribute('aria-selected',b.dataset.k===k)});
 if(push)history.replaceState(null,'',k?'catalogue.html?cat='+k:'catalogue.html');
 let lw=document.getElementById('liqwarn');
 if(!lw){lw=document.createElement('div');lw.id='liqwarn';lw.className='warn';lw.style.margin='0 0 16px';lw.innerHTML='☠️ Les e-liquides sont toxiques en cas d\'ingestion : gardez-les hors de portée des enfants. <a href="informations.html#eliquide" style="text-decoration:underline">Précautions et que faire en cas d\'accident</a>';browse.prepend(lw)}
 lw.hidden=k!=='eliquide';
 if(k){q.placeholder=k==='puff'?'Rechercher une puff…':'Rechercher un e-liquide…';buildTypes();render()}}
function render(){if(!kind)return;const t=norm(q.value),L=list().filter(p=>norm(p.name).includes(t)&&(!type||(TASTES[p.id]||[]).includes(type))&&(!fstock.checked||STOCK.has(p.id)));
 grid.innerHTML=L.map(cardHTML).join('');none.hidden=L.length>0;count.textContent=L.length+' '+(kind==='puff'?'puff':'e-liquide')+(L.length>1?'s':'');observeReveal()}
kinds.addEventListener('click',e=>{const b=e.target.closest('.kind');if(b)setKind(b.dataset.k,true)});
q.addEventListener('input',render);
ftypes.addEventListener('change',e=>{type=e.target.value;render()});
fstock.addEventListener('change',render);
document.getElementById('reset').addEventListener('click',()=>{q.value='';type='';buildTypes();fstock.checked=false;render();q.focus()});
stockReady.then(()=>{if(fstock.checked)render()});
setKind(kind,false);
