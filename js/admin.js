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
stockReady.then(j=>{if(j&&Array.isArray(j.enStock)){stockSel=new Set(j.enStock);if(root.querySelector('#stk'))root.querySelectorAll('.sk input').forEach(c=>c.checked=stockSel.has(c.value))}});
async function publishStock(){const msg=$('#pubmsg'),btn=$('#pub'),tk=ghToken();
 if(!tk){msg.textContent='Ajoutez d\'abord votre clé GitHub (ci-dessous).';$('.ghk').open=true;return}
 const api=`https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.path}`,h={Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'};
 btn.disabled=true;msg.textContent='Publication…';
 try{const cur=await fetch(api+'?ref='+GH.branch,{headers:h,cache:'no-store'});if(cur.status===401||cur.status===403)throw new Error('clé GitHub refusée');
  const sha=cur.ok?(await cur.json()).sha:undefined,ids=cat.map(p=>p.id).filter(id=>stockSel.has(id));
  const r=await fetch(api,{method:'PUT',headers:h,body:JSON.stringify({message:'Stock : '+(ids.length?ids.join(', '):'aucun'),branch:GH.branch,sha,content:btoa(JSON.stringify({enStock:ids})+'\n')})});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||('erreur '+r.status))}
  STOCK=new Set(ids);store.set('jnr_stock',ids);msg.textContent='✅ Publié ! Visible par les clients d\'ici 1 à 2 minutes.'}
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
 <div class="box stk" id="stk"><h2 style="margin-top:0">📦 Stock</h2><p class="mut">Cochez les goûts que vous avez <b>en stock</b> : les clients verront « ✅ En stock ». Rien n'est affiché pour les goûts non cochés.</p><div class="stk-list">${cat.map(p=>`<label class="sk" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}"><input type="checkbox" value="${esc(p.id)}" ${stockSel.has(p.id)?'checked':''}><span><img src="${esc(imgOf(p))}" alt="">${esc(p.name)}<i>En stock</i></span></label>`).join('')}</div>
  <button class="btn" id="pub" type="button">Publier le stock en ligne</button> <span id="pubmsg" class="mut"></span>
  <details class="ghk" ${ghToken()?'':'open'}><summary>🔑 Clé GitHub ${ghToken()?'(enregistrée sur cet appareil)':'(à faire une seule fois par appareil)'}</summary><p class="mut">Pour que le stock soit visible par tous, le site l'enregistre dans le fichier <b>stock.json</b> de votre dépôt GitHub. Créez une clé sur github.com → Settings → Developer settings → Fine-grained tokens → « Generate new token » : dépôt <b>${GH.owner}/${GH.repo}</b> uniquement, permission <b>Contents : Read and write</b>. Collez-la ci-dessous : elle reste seulement sur cet appareil.</p><input id="ghk" type="password" placeholder="github_pat_…" autocomplete="off"><button class="btn ghost sm" id="ghs" type="button" style="margin-top:8px">Enregistrer la clé</button> <button class="btn ghost sm" id="ghd" type="button" style="margin-top:8px">Oublier la clé</button></details></div>
 <form class="box" id="add"><h2 style="margin-top:0">Ajouter un goût</h2><label>Nom<input name="name" required maxlength="60"></label><label>Description<textarea name="desc" rows="2" maxlength="200"></textarea></label><div style="display:flex;gap:14px"><label style="flex:1">Couleur 1<input type="color" name="c1" value="#7a5cff"></label><label style="flex:1">Couleur 2<input type="color" name="c2" value="#ff3b6b"></label></div><label>Image (optionnelle)<input type="file" name="img" accept="image/*"></label><button class="btn">Ajouter</button></form>
 <div class="box"><h2 style="margin-top:0">Catalogue (ordre d'affichage)</h2>${cat.map((p,i)=>`<div class="item" data-i="${i}"><img src="${esc(imgOf(p))}" alt=""><div><input class="fn" value="${esc(p.name)}" aria-label="Nom"><textarea class="fd" rows="2" aria-label="Description">${esc(p.desc)}</textarea><input type="file" class="fi" accept="image/*" aria-label="Changer l'image"></div><div class="acts"><button class="btn sm" data-a="save">Enregistrer</button><button class="btn ghost sm" data-a="up" ${i?'':'disabled'}>↑</button><button class="btn ghost sm" data-a="down" ${i<cat.length-1?'':'disabled'}>↓</button><button class="btn danger sm" data-a="del">Supprimer</button></div></div>`).join('')||'<p class="mut">Aucun élément.</p>'}</div>`;
 root.querySelectorAll('.sk input').forEach(c=>c.onchange=()=>{c.checked?stockSel.add(c.value):stockSel.delete(c.value);$('#pubmsg').textContent='Modifications non publiées.'});
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
