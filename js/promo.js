/* Page d'une promotion (lot de puffs à prix spécial) : lit ?id=... dans l'adresse.
   On attend promos.json pour être sûr que la promo est toujours en ligne. */
const box=document.getElementById('fiche'),pid=new URLSearchParams(location.search).get('id');
promosReady.then(()=>{const p=findProduct(PROMO_PREFIX+pid);
 if(!isPromo(p)){box.innerHTML='<h1>Promotion terminée</h1><p class="lead2">Cette promotion n\'est plus disponible. Retrouvez tous nos goûts dans le catalogue.</p><p style="margin-top:18px"><a class="btn" href="catalogue.html?cat=puff">Voir le catalogue</a></p>';return}
 document.title='Promo '+p.name+' – JNR';
 const k=p.puffs.length,rec=k*RECHARGES,save=p.normal-p.price;
 const nicHTML=NICS.map((v,i)=>`<label class="seg"><input type="radio" name="nic" value="${v}" ${i===NICS.length-1?'checked':''}><span><b>${v}</b><small>${nicInfo(v)}</small></span></label>`).join('');
 const list=p.puffs.map(q=>`<a class="twin" href="produit.html?id=${encodeURIComponent(q.id)}" style="--t1:${esc(q.c1)};--t2:${esc(q.c2)}"><img src="${esc(imgOf(q))}" alt=""><span><small>Puff Falcon X 28000</small><b>${esc(q.name)}</b><em>${esc(q.desc)}</em></span><i>→</i></a>`).join('');
 box.innerHTML=`<a class="back" href="index.html">← Accueil</a><div class="pf" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)};margin-top:18px"><div class="big">${trioHTML(p,'lg')}</div><div><span class="kindtag promo">🔥 Promotion</span><h1>${esc(p.name)}</h1><span class="pack big">📦 Lot de ${k} puffs · 🧴 + ${rec} recharges incluses</span><p class="lead2">${k} Puff Falcon X 28000 JNR réunies dans un lot à prix réduit : ${esc(p.puffs.map(q=>q.name).join(', '))}.</p>
 <div class="buybox">
  <div class="bb-top"><div><span class="lbl">Prix du lot</span><b class="bb-price">${eur(p.price)}</b>${save>0?` <s class="mut">${eur(p.normal)}</s>`:''}</div>${save>0?`<span class="promo-save">Économisez ${eur(save)}</span>`:''}</div>
  <span class="lbl">Taux de nicotine (pour tout le lot)</span><div class="segs" role="radiogroup" aria-label="Taux de nicotine">${nicHTML}</div>
  <span class="lbl">Nombre de lots</span>
  <div class="bb-row"><div class="stepper"><button type="button" data-s="-1" aria-label="Moins">−</button><input id="n" type="number" min="1" max="99" value="1" aria-label="Nombre de lots" inputmode="numeric"><button type="button" data-s="1" aria-label="Plus">+</button></div>
   <div class="bb-sum"><span class="lbl">Total</span><b id="bbTot">${eur(p.price)}</b><small id="bbRec"></small></div></div>
  <button class="bb-add" id="add"><span>🛒 Ajouter la promo au panier</span></button>
  <a class="bb-link" href="panier.html">Aller dans votre panier →</a>
 </div>
 <h2>Dans ce lot</h2>${list}
 <h2>Informations</h2><ul><li>Offre valable tant que la promotion est affichée sur le site.</li><li>Chaque puff est livrée avec <b>${RECHARGES} recharges du même goût</b> : ${rec} recharges au total par lot.</li><li>Composition et contenance : se référer à l'emballage officiel.</li></ul>
 <div class="warn">⚠️ La nicotine est très addictive. Interdit aux mineurs. <a href="informations.html" style="text-decoration:underline">En savoir plus</a></div></div></div>`;
 const pf=box.querySelector('.pf');applyTheme({c1:p.c1,c2:p.c2},pf);
 const n=document.getElementById('n'),clamp=v=>Math.max(1,Math.min(99,parseInt(v)||1));
 const upd=()=>{const q=clamp(n.value);document.getElementById('bbTot').textContent=eur(p.price*q);document.getElementById('bbRec').textContent=q*k+' puffs + '+q*rec+' recharges incluses'};upd();
 box.querySelectorAll('.stepper button').forEach(b=>b.onclick=()=>{n.value=clamp(+n.value+ +b.dataset.s);upd();n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')});
 n.oninput=upd;n.onchange=()=>{n.value=clamp(n.value);upd()};
 const add=document.getElementById('add');
 add.onclick=()=>{const nic=box.querySelector('input[name=nic]:checked').value;addToCart(p.id,clamp(n.value),nic);
  add.classList.add('done');add.firstElementChild.textContent='✓ Promo ajoutée ('+clamp(n.value)+' lot'+(clamp(n.value)>1?'s':'')+' · '+nic+')';clearTimeout(add._t);add._t=setTimeout(()=>{add.classList.remove('done');add.firstElementChild.textContent='🛒 Ajouter la promo au panier'},1800)}
 observeReveal()});
