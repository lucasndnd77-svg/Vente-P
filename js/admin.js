/* Administration : les identifiants ne sont PAS stockés en clair, seulement une empreinte PBKDF2 (310 000 itérations, sel aléatoire).
   Limite de 5 essais puis blocage 15 min ; session de 30 min. Reste une protection côté navigateur, pas côté serveur. */
const AUTH={salt:'1708102e6a2e5a8458e6972ea3f59ae4',iter:310000,hash:'27b2b53a688bd7804963bc1a256a215821cb0e73c42dda152bb5b69be58d1f64'},MAX_TRY=5,LOCK_MIN=15,SESSION_MIN=30;
document.head.insertAdjacentHTML('beforeend','<meta name="robots" content="noindex,nofollow">');
const root=document.getElementById('admin');let cat=[];
const $=s=>root.querySelector(s);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hashCred(u,p){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(u+'\u0000'+p),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(AUTH.salt.match(/../g),h=>parseInt(h,16)),iterations:AUTH.iter},k,256))}
const tries=()=>store.get('jnr_try',{n:0,t:0});
const sessionOK=()=>{const t=+sessionStorage.getItem('jnr_admin');return t>0&&Date.now()-t<SESSION_MIN*6e4};
/* Lit une image et la réduit (max 400 px) pour limiter la taille du stockage local */
const readImg=f=>new Promise((ok,ko)=>{const r=new FileReader();r.onerror=ko;r.onload=()=>{const i=new Image();i.onerror=ko;i.onload=()=>{const k=Math.min(1,400/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.8))};i.src=r.result};r.readAsDataURL(f)});
/* Stock : publié dans stock.json du dépôt GitHub (le site est hébergé sur GitHub Pages, mis à jour en ~1 min).
   La clé GitHub est saisie par vous et gardée uniquement dans ce navigateur, jamais dans le code. */
const GH={owner:'lucasndnd77-svg',repo:'Vente-P',branch:'main',path:'stock.json'};
const ghToken=()=>store.get('jnr_gh_token','');
let stockSel=new Set(STOCK);
stockReady.then(j=>{if(j&&Array.isArray(j.enStock)){stockSel=new Set(j.enStock);if(root.querySelector('#stk'))root.querySelectorAll('#stk .sk input').forEach(c=>c.checked=stockSel.has(c.value))}});
/* Enregistre un fichier JSON dans le dépôt GitHub (stock.json, promos.json) */
const b64=s=>btoa(String.fromCharCode(...new TextEncoder().encode(s)));
async function ghPut(path,data,message){const tk=ghToken();if(!tk)throw new Error('NOKEY');
 const api=`https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${path}`,h={Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'};
 const cur=await fetch(api+'?ref='+GH.branch,{headers:h,cache:'no-store'});if(cur.status===401||cur.status===403)throw new Error('clé GitHub refusée');
 const sha=cur.ok?(await cur.json()).sha:undefined;
 const r=await fetch(api,{method:'PUT',headers:h,body:JSON.stringify({message,branch:GH.branch,sha,content:b64(JSON.stringify(data)+'\n')})});
 if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||('erreur '+r.status))}}
const askKey=msg=>{msg.textContent='Ajoutez d\'abord votre clé GitHub (dans le bloc « Stock », en bas).';const k=$('.ghk');k.open=true;k.scrollIntoView({behavior:'smooth',block:'center'})};
async function publishStock(){const msg=$('#pubmsg'),btn=$('#pub');
 if(!ghToken())return askKey(msg);
 btn.disabled=true;msg.textContent='Publication…';
 try{const ids=[...cat,...getLiquids()].map(p=>p.id).filter(id=>stockSel.has(id));
  await ghPut(GH.path,{enStock:ids},'Stock : '+(ids.length?ids.join(', '):'aucun'));
  STOCK=new Set(ids);store.set('jnr_stock',ids);msg.textContent='✅ Publié ! Visible par les clients d\'ici 1 à 2 minutes.'}
 catch(x){msg.textContent='❌ Échec : '+x.message+'.'}
 btn.disabled=false}
/* ---- PROMOTIONS : lots de puffs à prix spécial, publiés dans promos.json (comme le stock).
   « En ligne » = visible sur l'accueil sous « Découvrir le catalogue » ; « Retirée » = cachée (gardée pour plus tard). ---- */
const clonePromos=a=>a.map(x=>({...x,gouts:[...x.gouts]}));
let promoEd=clonePromos(PROMOS),promoEditId=null;
promosReady.then(j=>{if(j&&Array.isArray(j.promos)){promoEd=clonePromos(PROMOS);if(root.querySelector('#prm'))renderPromoAdmin()}});
const promoDirty=()=>{$('#prmsg').textContent='⚠️ Modifications non publiées : cliquez sur « Publier les promotions ».'};
function renderPromoAdmin(){const box=$('#prm-in');if(!box)return;const ed=promoEd.find(x=>x.id===promoEditId),sel=new Set(ed?ed.gouts:[]);
 const thumbs=x=>x.gouts.map(id=>{const p=cat.find(q=>q.id===id);return p?`<img src="${esc(imgOf(p))}" alt="${esc(p.name)}">`:''}).join('');
 const names=x=>x.gouts.map(id=>{const p=cat.find(q=>q.id===id);return p?p.name:'⚠️ goût supprimé'}).join(', ');
 const normal=x=>x.gouts.reduce((a,id)=>{const p=cat.find(q=>q.id===id);return a+(p?priceOf(p):0)},0);
 box.innerHTML=`<div class="pr-list">${promoEd.map(x=>`<div class="pr-item${x.actif?' on':''}" data-id="${esc(x.id)}"><span class="pr-th">${thumbs(x)}</span><div class="pr-tx"><b>${esc(x.titre)}</b><small>${esc(names(x))}</small><span><b>${eur(+x.prix)}</b> le lot <s>${eur(normal(x))}</s></span></div>
  <label class="sw-tg"><input type="checkbox" data-a="toggle" ${x.actif?'checked':''}><i></i><span>${x.actif?'🟢 En ligne':'⚪ Retirée'}</span></label>
  <div class="pr-acts"><button type="button" class="btn ghost sm" data-a="edit">✏️ Modifier</button><button type="button" class="btn danger sm" data-a="del">Supprimer</button></div></div>`).join('')||'<p class="mut">Aucune promotion pour l\'instant. Créez-en une ci-dessous.</p>'}</div>
 <form id="prf" class="pr-form"><h3>${ed?'✏️ Modifier « '+esc(ed.titre)+' »':'➕ Nouvelle promotion'}</h3>
  <div class="pr-fg"><label>Nom de la promo<input name="titre" required maxlength="40" placeholder="ex. Trio Fruits Rouges" value="${ed?esc(ed.titre):''}"></label><label>Prix du lot (€)<input name="prix" type="number" min="1" max="999" step="0.5" required placeholder="36" value="${ed?esc(ed.prix):''}"></label></div>
  <p class="pr-t">Puffs du lot <span class="mut">(cliquez pour les ajouter)</span></p>
  <div class="stk-list">${cat.map(p=>`<label class="sk" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}"><input type="checkbox" name="g" value="${esc(p.id)}" ${sel.has(p.id)?'checked':''}><span><img src="${esc(imgOf(p))}" alt="">${esc(p.name)}<i>Dans le lot</i></span></label>`).join('')}</div>
  <p id="prsum" class="pr-sum"></p>
  <button class="btn">${ed?'Enregistrer les modifications':'Créer la promotion'}</button>${ed?' <button type="button" class="btn ghost sm" id="prc">Annuler</button>':''}</form>`;
 const f=$('#prf'),sum=()=>{const g=[...f.querySelectorAll('input[name=g]:checked')].map(c=>c.value),n=normal({gouts:g}),pr=+f.elements.prix.value;
  $('#prsum').innerHTML=g.length?`📦 <b>${g.length} puff${g.length>1?'s':''}</b> · prix normal ${eur(n)}${pr>0?` → <b>${eur(pr)}</b> ${pr<n?`<span class="promo-save">−${eur(n-pr)}</span>`:'<span class="mut">(pas moins cher que le prix normal)</span>'}`:''}`:'<span class="mut">Choisissez au moins une puff.</span>'};
 f.oninput=sum;sum();
 f.onsubmit=e=>{e.preventDefault();const titre=f.elements.titre.value.trim(),prix=Math.round(+f.elements.prix.value*100)/100,gouts=[...f.querySelectorAll('input[name=g]:checked')].map(c=>c.value);
  if(!titre||!(prix>0))return;if(!gouts.length){alert('Choisissez au moins une puff pour le lot.');return}
  if(ed)Object.assign(ed,{titre,prix,gouts});
  else{let id=slug(titre.normalize('NFD').replace(/[̀-ͯ]/g,''))||'promo',k=id,j=2;while(promoEd.some(x=>x.id===k))k=id+'-'+j++;promoEd.push({id:k,titre,gouts,prix,actif:true})}
  promoEditId=null;renderPromoAdmin();promoDirty()};
 if($('#prc'))$('#prc').onclick=()=>{promoEditId=null;renderPromoAdmin()}}
async function publishPromos(){const msg=$('#prmsg'),btn=$('#prpub');
 if(!ghToken())return askKey(msg);
 btn.disabled=true;msg.textContent='Publication…';
 try{const on=promoEd.filter(x=>x.actif).map(x=>x.titre);
  await ghPut('promos.json',{promos:promoEd},'Promotions en ligne : '+(on.length?on.join(', '):'aucune'));
  PROMOS=clonePromos(promoEd);store.set('jnr_promos',PROMOS);msg.textContent='✅ Publié ! Visible par les clients d\'ici 1 à 2 minutes.'}
 catch(x){msg.textContent='❌ Échec : '+x.message+'.'}
 btn.disabled=false}
function persist(){if(!saveCatalog(cat))alert('Stockage local plein : utilisez une image plus petite.');dash()}
function login(){root.innerHTML=`<form id="lf" class="box narrow"><h1>Administration</h1><p class="note">Accès réservé. Après ${MAX_TRY} échecs, la connexion est bloquée ${LOCK_MIN} minutes.</p><label>Identifiant<input id="u" autocomplete="username" required></label><label>Mot de passe<input id="p" type="password" autocomplete="current-password" required></label><p class="err" id="err"></p><button class="btn">Connexion</button></form>`;
 $('#lf').onsubmit=async e=>{e.preventDefault();const T=tries(),now=Date.now(),err=$('#err');
  if(T.t>now){err.textContent='Trop d\'essais. Réessayez dans '+Math.ceil((T.t-now)/6e4)+' min.';return}
  let h;try{h=await hashCred($('#u').value.trim(),$('#p').value)}catch(x){err.textContent='Connexion impossible : ouvrez le site en https.';return}
  if(h===AUTH.hash){store.set('jnr_try',{n:0,t:0});dash()}
  else{const n=T.n+1;store.set('jnr_try',n>=MAX_TRY?{n:0,t:now+LOCK_MIN*6e4}:{n,t:0});err.textContent='Identifiant ou mot de passe incorrect.'}}}
function dash(){sessionStorage.setItem('jnr_admin',Date.now());cat=getCatalog();const custom=localStorage.getItem('jnr_catalog')!==null;
 root.innerHTML=`<div class="top"><h1>Tableau de bord</h1><div><button class="btn ghost sm" id="rst">Restaurer le catalogue d'origine</button> <button class="btn ghost sm" id="out">Déconnexion</button></div></div>
 <div class="stats"><div><b>${cat.length}</b>produits au catalogue</div><div><b>${new Set(cat.map(p=>p.name.toLowerCase())).size}</b>goûts disponibles</div><div><b style="font-size:1.1rem">${cat.length?'✅ Catalogue actif':'⚠️ Catalogue vide'}</b>${custom?'modifié localement':"version d'origine"}</div></div>
 <div class="box prm" id="prm"><h2 style="margin-top:0">🔥 Promotions</h2><p class="mut">Les promotions <b>en ligne</b> s'affichent sur l'accueil, juste sous « Découvrir le catalogue ». Le client clique dessus, choisit la nicotine et ajoute le lot au panier ; le mail de commande indique bien <b>PROMO</b>. Utilisez l'interrupteur pour <b>mettre en ligne</b> ou <b>retirer</b> une promo (elle reste gardée ici pour plus tard), puis cliquez sur « Publier les promotions ».</p><div id="prm-in"></div>
  <div class="pr-pub"><button class="btn" id="prpub" type="button">Publier les promotions en ligne</button> <span id="prmsg" class="mut"></span></div></div>
 <div class="box stk" id="stk"><h2 style="margin-top:0">📦 Stock</h2><p class="mut">Cochez les goûts que vous avez <b>en stock</b> : les clients verront « ✅ En stock ». Rien n'est affiché pour les goûts non cochés.</p>${[['🔋 Puffs',cat],['💧 E-liquides',getLiquids()]].map(([t,L])=>`<h3>${t}</h3><div class="stk-list">${L.map(p=>`<label class="sk" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}"><input type="checkbox" value="${esc(p.id)}" ${stockSel.has(p.id)?'checked':''}><span><img src="${esc(imgOf(p))}" alt="">${esc(p.name)}<i>En stock</i></span></label>`).join('')}</div>`).join('')}
  <button class="btn" id="pub" type="button">Publier le stock en ligne</button> <span id="pubmsg" class="mut"></span>
  <details class="ghk" ${ghToken()?'':'open'}><summary>🔑 Clé GitHub ${ghToken()?'(enregistrée sur cet appareil)':'(à faire une seule fois par appareil)'}</summary><p class="mut">Pour que le stock soit visible par tous, le site l'enregistre dans le fichier <b>stock.json</b> de votre dépôt GitHub. Créez une clé sur github.com → Settings → Developer settings → Fine-grained tokens → « Generate new token » : dépôt <b>${GH.owner}/${GH.repo}</b> uniquement, permission <b>Contents : Read and write</b>. Collez-la ci-dessous : elle reste seulement sur cet appareil.</p><input id="ghk" type="password" placeholder="github_pat_…" autocomplete="off"><button class="btn ghost sm" id="ghs" type="button" style="margin-top:8px">Enregistrer la clé</button> <button class="btn ghost sm" id="ghd" type="button" style="margin-top:8px">Oublier la clé</button></details></div>
 <form class="box" id="add"><h2 style="margin-top:0">Ajouter un goût</h2><label>Nom<input name="name" required maxlength="60"></label><label>Description<textarea name="desc" rows="2" maxlength="200"></textarea></label><div style="display:flex;gap:14px"><label style="flex:1">Couleur 1<input type="color" name="c1" value="#7a5cff"></label><label style="flex:1">Couleur 2<input type="color" name="c2" value="#ff3b6b"></label></div><label>Image (optionnelle)<input type="file" name="img" accept="image/*"></label><button class="btn">Ajouter</button></form>
 <div class="box"><h2 style="margin-top:0">Catalogue (ordre d'affichage)</h2>${cat.map((p,i)=>`<div class="item" data-i="${i}"><img src="${esc(imgOf(p))}" alt=""><div><input class="fn" value="${esc(p.name)}" aria-label="Nom"><textarea class="fd" rows="2" aria-label="Description">${esc(p.desc)}</textarea><input type="file" class="fi" accept="image/*" aria-label="Changer l'image"></div><div class="acts"><button class="btn sm" data-a="save">Enregistrer</button><button class="btn ghost sm" data-a="up" ${i?'':'disabled'}>↑</button><button class="btn ghost sm" data-a="down" ${i<cat.length-1?'':'disabled'}>↓</button><button class="btn danger sm" data-a="del">Supprimer</button></div></div>`).join('')||'<p class="mut">Aucun élément.</p>'}</div>`;
 renderPromoAdmin();$('#prpub').onclick=publishPromos;
 $('#prm-in').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const id=b.closest('.pr-item').dataset.id,x=promoEd.find(p=>p.id===id);if(!x)return;
  if(b.dataset.a==='edit'){promoEditId=id;renderPromoAdmin();$('#prf').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(b.dataset.a==='del'){if(!confirm('Supprimer définitivement la promotion « '+x.titre+' » ?\n(Pour la cacher seulement, utilisez plutôt l\'interrupteur « En ligne ».)'))return;promoEd=promoEd.filter(p=>p!==x);if(promoEditId===id)promoEditId=null;renderPromoAdmin();promoDirty()}});
 $('#prm-in').addEventListener('change',e=>{const c=e.target.closest('input[data-a=toggle]');if(!c)return;const x=promoEd.find(p=>p.id===c.closest('.pr-item').dataset.id);if(!x)return;x.actif=c.checked;renderPromoAdmin();promoDirty()});
 root.querySelectorAll('#stk .sk input').forEach(c=>c.onchange=()=>{c.checked?stockSel.add(c.value):stockSel.delete(c.value);$('#pubmsg').textContent='Modifications non publiées.'});
 $('#ghs').onclick=()=>{const v=$('#ghk').value.trim();if(!v)return;store.set('jnr_gh_token',v);dash()};
 $('#ghd').onclick=()=>{localStorage.removeItem('jnr_gh_token');dash()};
 $('#pub').onclick=publishStock;
 $('#out').onclick=()=>{sessionStorage.removeItem('jnr_admin');login()};
 $('#rst').onclick=()=>{if(confirm("Restaurer le catalogue d'origine ?")){localStorage.removeItem('jnr_catalog');dash()}};
 $('#add').onsubmit=async e=>{e.preventDefault();const f=e.target,n=f.elements.name.value.trim();if(!n)return;let id=slug(n)||'gout',k=id,j=2;while(cat.some(p=>p.id===k))k=id+'-'+j++;
  let img=null;if(f.elements.img.files[0]){try{img=await readImg(f.elements.img.files[0])}catch(x){alert('Image illisible.');return}}
  cat.push({id:k,name:n,desc:f.elements.desc.value.trim(),c1:f.elements.c1.value,c2:f.elements.c2.value,img});persist()};
 $('.box:last-child').onclick=async e=>{const b=e.target.closest('button[data-a]');if(!b)return;const row=b.closest('.item'),i=+row.dataset.i,a=b.dataset.a;
  if(a==='del'){if(!confirm('Supprimer « '+cat[i].name+' » ?'))return;cat.splice(i,1)}
  else if(a==='up'||a==='down'){const j=a==='up'?i-1:i+1;[cat[i],cat[j]]=[cat[j],cat[i]]}
  else if(a==='save'){const n=row.querySelector('.fn').value.trim();if(!n){alert('Le nom ne peut pas être vide.');return}cat[i].name=n;cat[i].desc=row.querySelector('.fd').value.trim();const f=row.querySelector('.fi').files[0];if(f){try{cat[i].img=await readImg(f)}catch(x){alert('Image illisible.');return}}}
  persist()}}
sessionOK()?dash():login();
