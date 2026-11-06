/* Fiche produit : lit ?id=... dans l'adresse */
const box=document.getElementById('fiche'),id=new URLSearchParams(location.search).get('id'),p=getCatalog().find(x=>x.id===id);
if(!p){box.innerHTML='<h1>Goût introuvable</h1><p><a class="btn" href="catalogue.html">Retour au catalogue</a></p>'}
else{document.title=p.name+' – JNR';
 const nicHTML=NICS.map((v,i)=>`<label class="seg"><input type="radio" name="nic" value="${v}" ${i===NICS.length-1?'checked':''}><span><b>${v}</b><small>${v==='1%'?'10 mg/ml · doux':'20 mg/ml · intense'}</small></span></label>`).join('');
 box.innerHTML=`<a class="back" href="catalogue.html">← Catalogue</a><div class="pf" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)};margin-top:18px"><div class="big"><img src="${esc(imgOf(p))}"${imgCls(p)} alt="${esc(p.name)}"></div><div><h1>${esc(p.name)}</h1>${packHTML(p).replace('class="pack"','class="pack big"')}<p class="lead2">${esc(p.desc)}</p>
 <div class="buybox">
  <div class="bb-top"><div><span class="lbl">Prix</span><b class="bb-price">${eur(priceOf(p))}</b><span class="mut"> / puff</span></div><span class="bb-gift">🎁 ${RECHARGES} recharges offertes par puff</span></div>
  <span class="lbl">Taux de nicotine</span><div class="segs" role="radiogroup" aria-label="Taux de nicotine">${nicHTML}</div>
  <span class="lbl">Quantité</span>
  <div class="bb-row"><div class="stepper"><button type="button" data-s="-1" aria-label="Moins">−</button><input id="n" type="number" min="1" max="99" value="1" aria-label="Quantité" inputmode="numeric"><button type="button" data-s="1" aria-label="Plus">+</button></div>
   <div class="bb-sum"><span class="lbl">Total</span><b id="bbTot">${eur(priceOf(p))}</b><small id="bbRec">+ ${RECHARGES} recharges incluses</small></div></div>
  <button class="bb-add" id="add"><span>🛒 Ajouter à la sélection</span></button>
  <a class="bb-link" href="panier.html">Voir ma sélection →</a>
 </div>
 <h2>Informations</h2><ul><li>Produit contenant de la nicotine (1 % ou 2 % au choix).</li><li>Chaque puff est livrée avec <b>${RECHARGES} recharges ${esc(p.name)}</b>, ajoutées automatiquement à votre commande.</li><li>Composition et contenance : se référer à l'emballage officiel.</li></ul>
 <div class="warn">⚠️ La nicotine est très addictive. Interdit aux mineurs. <a href="informations.html" style="text-decoration:underline">En savoir plus</a></div></div></div>`;
 /* toute la page prend les couleurs de la puff : d'abord celles du catalogue, puis celles lues dans l'image */
 const pf=box.querySelector('.pf');applyTheme({c1:p.c1,c2:p.c2},pf);
 if(isPhoto(p))themeFromImage(imgOf(p)).then(t=>applyTheme(t,pf));
 const n=document.getElementById('n'),clamp=v=>Math.max(1,Math.min(99,parseInt(v)||1));
 const upd=()=>{const q=clamp(n.value);document.getElementById('bbTot').textContent=eur(priceOf(p)*q);document.getElementById('bbRec').textContent='+ '+q*RECHARGES+' recharges incluses'};
 box.querySelectorAll('.stepper button').forEach(b=>b.onclick=()=>{n.value=clamp(+n.value+ +b.dataset.s);upd();n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')});
 n.oninput=upd;n.onchange=()=>{n.value=clamp(n.value);upd()};
 const add=document.getElementById('add');
 add.onclick=()=>{const nic=box.querySelector('input[name=nic]:checked').value;addToCart(p.id,clamp(n.value),nic);
  add.classList.add('done');add.firstElementChild.textContent='✓ Ajouté ('+clamp(n.value)+' × '+nic+')';clearTimeout(add._t);add._t=setTimeout(()=>{add.classList.remove('done');add.firstElementChild.textContent='🛒 Ajouter à la sélection'},1800)}}
