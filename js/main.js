/* JNR – fonctions communes : données, stockage, panier, prix, ventes, en-tête/pied de page */
const PRICE=13;                 // prix unitaire en euros (modifiable)
const CONTACT_EMAIL='';         // ← mettez votre adresse e-mail de contact ici
const SALES_BASE={};            // ventes de départ par goût, ex. {'cherry-ice':12,'luv-66':7}
const RAW=[
"Strawberry Kiwi|#ff3b52|#3ddc84|Fraise sucrée et kiwi acidulé, un duo vif et rafraîchissant.",
"Mixed Berry|#8a4dff|#3d8bff|Assortiment de baies rouges et bleues, doux et fruité.",
"Strawberry Watermelon|#ff3b6b|#2fd47a|Fraise mûre et pastèque juteuse, l'équilibre estival.",
"Peach Berry|#ff9a76|#b04dff|Pêche tendre mêlée à des baies sauvages.",
"Dragon Ice|#ff3d9a|#38d6ff|Fruit du dragon exotique avec une touche glacée.",
"Blackberry Red Raspberry|#5b2a86|#ff3b5c|Mûre profonde et framboise rouge intense.",
"Blueberry Pomegranate Ice|#3d5bff|#d4194f|Myrtille, grenade et fraîcheur glacée.",
"Mango Passion Fruit|#ff9f1c|#ffe14d|Mangue ensoleillée et fruit de la passion.",
"Watermelon Mango Peach|#ff4d5e|#ffb347|Trio gourmand de pastèque, mangue et pêche.",
"Blueberry Raspberry Cherry|#4a5bff|#e0245e|Myrtille, framboise et cerise : le trio des baies.",
"Cherry Ice|#e0143c|#3da5ff|Cerise éclatante sur fond de fraîcheur glacée.",
"Watermelon Ice|#2fd47a|#ff3b5c|Pastèque désaltérante et sensation glacée.",
"Watermelon Bubblegum|#ff6ec7|#2fd47a|Pastèque sucrée aux notes de chewing-gum.",
"Cherry Watermelon Freeze|#c4122f|#5be3c1|Cerise et pastèque en version très fraîche.",
"Blueberry Sour Raspberry|#3f5bff|#ff3d8b|Myrtille et framboise avec un côté acidulé.",
"Fizzy Cherry Cola|#d4142f|#ff9d3d|Cerise pétillante façon cola.",
"Luv 66|#ff2d6f|#7a2dff|Un mélange mystère à l'identité bien à lui."];
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
function defaultCatalog(){return RAW.map(r=>{const[n,c1,c2,d]=r.split('|');return{id:slug(n),name:n,c1,c2,desc:d,img:null}})}
const getCatalog=()=>store.get('jnr_catalog',null)||defaultCatalog();
const saveCatalog=c=>store.set('jnr_catalog',c);
/* Photos réelles (PNG détourés) ; les goûts absents de la liste gardent leur illustration SVG */
const PHOTOS=new Set(['strawberry-kiwi','mixed-berry','strawberry-watermelon','peach-berry','dragon-ice','blackberry-red-raspberry','blueberry-pomegranate-ice','mango-passion-fruit','watermelon-mango-peach','blueberry-raspberry-cherry','cherry-ice','watermelon-ice','watermelon-bubblegum','cherry-watermelon-freeze','blueberry-sour-raspberry','fizzy-cherry-cola','luv-66']);
const isPhoto=p=>!p.img&&PHOTOS.has(p.id);
/* IMG_V : augmentez ce numéro à chaque remplacement d'image pour forcer les navigateurs à recharger */
const IMG_V=3;
const imgOf=p=>p.img||`images/produits/${p.id}.${PHOTOS.has(p.id)?'png':'svg'}?v=${IMG_V}`;
const imgCls=p=>isPhoto(p)?' class="photo"':'';
/* Chaque puff est vendue avec 2 recharges du même goût, ajoutées automatiquement */
const RECHARGES=2;
const packHTML=(p,n=1)=>`<span class="pack">🧴 + ${n*RECHARGES} recharge${n*RECHARGES>1?'s':''} incluse${n*RECHARGES>1?'s':''}</span>`;
/* Prix */
const eur=n=>n.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const priceOf=p=>p.price||PRICE;
/* Ventes : SALES_BASE + commandes validées sur ce navigateur. Le goût le plus vendu reçoit la couronne. */
const getSales=()=>store.get('jnr_sales',{});
const salesOf=id=>(SALES_BASE[id]||0)+(getSales()[id]||0);
function recordSales(cart){const s=getSales();for(const k in cart){const id=parseKey(k).id;s[id]=(s[id]||0)+cart[k]}store.set('jnr_sales',s)}
function ranked(){return getCatalog().map((p,i)=>({p,i,s:salesOf(p.id)})).sort((a,b)=>b.s-a.s||a.i-b.i).map(x=>x.p)}
function topId(){const r=ranked()[0];return r&&salesOf(r.id)>0?r.id:null}
/* Panier : { "idProduit|taux": quantité }, ex. {"peach-berry|2%":3} (un même goût peut être pris en 1 % et en 2 %) */
const NICS=['1%','2%'];
const cartKey=(id,nic)=>id+'|'+nic;
const parseKey=k=>{const i=k.lastIndexOf('|');return i<0?{id:k,nic:null}:{id:k.slice(0,i),nic:k.slice(i+1)}};
const getCart=()=>store.get('jnr_cart',{});
const saveCart=c=>{store.set('jnr_cart',c);updateBadge()};
const cartCount=()=>Object.values(getCart()).reduce((a,b)=>a+b,0);
function addToCart(id,q=1,nic=NICS[NICS.length-1]){const c=getCart(),k=cartKey(id,nic);c[k]=Math.min(99,(c[k]||0)+q);saveCart(c);toast('Ajouté à la sélection ✓')}
function updateBadge(){const b=document.getElementById('badge');if(b)b.textContent=cartCount()}
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.className='show';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',1800)}
function cardHTML(p){const u='produit.html?id='+encodeURIComponent(p.id),top=p.id===topId()?'<span class="top">👑 Top vente</span>':'';return `<article class="card rv" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}">${top}<a class="cimg" href="${u}"><img src="${esc(imgOf(p))}"${imgCls(p)} alt="${isPhoto(p)?'Photo':'Illustration'} ${esc(p.name)}" loading="lazy"></a><div class="cbody"><h3>${esc(p.name)}</h3><b class="pr">${eur(priceOf(p))}</b>${packHTML(p)}<p>${esc(p.desc)}</p><a class="btn sm" href="${u}">Voir la fiche</a></div></article>`}
function observeReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.rv:not(.in)').forEach(el=>io.observe(el))}
function renderLayout(){
 const page=location.pathname.split('/').pop()||'index.html';
 const L=[['index.html','Accueil'],['catalogue.html','Catalogue'],['informations.html','Informations'],['index.html#contact','Contact']];
 document.getElementById('site-header').innerHTML=`<div class="wrap nav"><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><button class="burger" aria-label="Menu" onclick="this.nextElementSibling.classList.toggle('open')">☰</button><ul>${L.map(([h,t])=>`<li><a href="${h}" class="${h===page?'on':''}">${t}</a></li>`).join('')}<li><a href="panier.html" class="${page==='panier.html'?'on':''}">Sélection <span id="badge">0</span></a></li></ul></div>`;
 document.getElementById('site-footer').innerHTML=`<div class="wrap foot"><div><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><p><small>Aucun paiement en ligne. Les demandes de commande sont envoyées par e-mail au vendeur.</small></p></div><div><a href="index.html">Accueil</a><a href="catalogue.html">Catalogue</a><a href="informations.html">Informations & sécurité</a><a href="panier.html">Ma sélection</a></div><div><div class="warn">⚠️ Ce produit contient de la nicotine, substance très addictive. Réservé aux adultes : interdit de vente aux mineurs.</div><p><small>Chaque puff est livrée avec ${RECHARGES} recharges du même goût. Voir « Données personnelles » dans Informations.</small></p></div></div>${page==='index.html'?'<div class="wrap admin-link"><a href="admin.html">Administration</a></div>':''}`;
 updateBadge();observeReveal()}
renderLayout();

/* ---- Accès privé : seules les personnes ayant le code peuvent voir le site.
   Le code n'est pas écrit en clair, seulement son empreinte SHA-256. Mémorisé GATE_DAYS jours sur l'appareil. ---- */
const GATE_HASH='02cbb7f5ee80fcd0f6cdfff0224cbf0ac1329d8d838040ff0f6574f9b7fa2f1c',GATE_DAYS=30;
function sha256hex(str){const rr=(v,a)=>(v>>>a)|(v<<(32-a)),K=[];let H=[],p=2;
 for(let c=0;c<64;p++){let pr=1;for(let d=2;d*d<=p;d++)if(p%d===0){pr=0;break}if(pr){if(c<8)H[c]=(Math.pow(p,1/2)*4294967296)|0;K[c++]=(Math.pow(p,1/3)*4294967296)|0}}
 const m=[...new TextEncoder().encode(str)],bits=m.length*8;m.push(0x80);while(m.length%64!==56)m.push(0);m.push(0,0,0,0,(bits>>>24)&255,(bits>>>16)&255,(bits>>>8)&255,bits&255);
 for(let j=0;j<m.length;j+=64){const w=[];for(let i=0;i<16;i++)w[i]=(m[j+4*i]<<24)|(m[j+4*i+1]<<16)|(m[j+4*i+2]<<8)|m[j+4*i+3];
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(rr(a,7)^rr(a,18)^(a>>>3))+w[i-7]+(rr(b,17)^rr(b,19)^(b>>>10)))|0}
  let [a,b,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const t1=(h+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0,t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}
  H=[a,b,c,d,e,f,g,h].map((v,i)=>(v+H[i])|0)}
 return H.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('')}
function gate(){
 const acc=store.get('jnr_access',null);
 if(acc&&acc.h===GATE_HASH&&acc.t>Date.now()){document.body.classList.add('unlocked');return}
 const g=document.createElement('div');g.id='gate';
 g.innerHTML=`<form autocomplete="off"><div class="logo"><img src="images/logo/logo.svg" alt="">JNR</div><h1>Accès réservé</h1><p>Ce site est privé. Saisissez le code d'accès qui vous a été communiqué.</p><input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="••••••" aria-label="Code d'accès" required><div class="gerr" role="alert"></div><button>Entrer</button><small>Réservé aux personnes majeures. Site privé, non publicitaire, accessible uniquement sur invitation.</small></form>`;
 document.body.appendChild(g);
 const inp=g.querySelector('input'),err=g.querySelector('.gerr');inp.focus();
 g.querySelector('form').onsubmit=e=>{e.preventDefault();const T=store.get('jnr_gate_try',{n:0,t:0}),now=Date.now();
  if(T.t>now){err.textContent='Trop d\'essais. Réessayez dans '+Math.ceil((T.t-now)/6e4)+' min.';return}
  if(sha256hex('jnr-gate:'+inp.value.trim())===GATE_HASH){store.set('jnr_gate_try',{n:0,t:0});store.set('jnr_access',{h:GATE_HASH,t:now+GATE_DAYS*864e5});document.body.classList.add('unlocked');g.remove();observeReveal()}
  else{const n=T.n+1;store.set('jnr_gate_try',n>=5?{n:0,t:now+5*6e4}:{n,t:0});err.textContent=n>=5?'Trop d\'essais. Réessayez dans 5 min.':'Code incorrect.';inp.value='';g.classList.remove('shake');void g.offsetWidth;g.classList.add('shake')}}}
gate();
/* Styles prix / couronne */
document.head.insertAdjacentHTML('beforeend','<style>.card{position:relative}.top{position:absolute;top:10px;left:10px;z-index:2;background:linear-gradient(135deg,#ffd447,#ff9f1c);color:#2a1800;font-weight:800;font-size:.8rem;padding:4px 12px;border-radius:99px;box-shadow:0 6px 16px #0007}.pr{font-size:1.15rem}.pr.big{display:block;font-size:1.7rem;margin:8px 0}.lt{min-width:80px;text-align:right}.tot{font-size:1.5rem;font-weight:800}img.photo{object-fit:contain!important;filter:drop-shadow(0 16px 22px #000b) saturate(1.05)}.cimg img.photo{padding:7% 7% 3%;transition:transform .4s}.card:hover .cimg img.photo{transform:scale(1.05) rotate(-2deg)}.pf .big:has(img.photo){background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c1) 45%,transparent),transparent 70%),var(--bg2)}.pf .big img.photo{padding:8%}.row img.photo{background:radial-gradient(circle,#ffffff1a,transparent 70%)}.pack{display:inline-block;margin:6px 0 2px;padding:3px 10px;border-radius:99px;background:#ffffff12;border:1px solid #ffffff22;font-size:.8rem;font-weight:600;color:#e8e8f5}.pack.big{font-size:.95rem;padding:6px 14px;margin:4px 0 10px}.nicb{display:inline-block;margin:6px 0 2px 6px;padding:3px 10px;border-radius:99px;font-size:.8rem;font-weight:800;color:#fff;background:linear-gradient(135deg,#7a5cff,#ff3b6b)}.admin-link{text-align:center;padding:6px 20px 14px}.admin-link a{font-size:.72rem;color:#ffffff40;letter-spacing:.05em}.admin-link a:hover{color:#ffffffa0}</style>');
/* Accueil : goûts les plus demandés + contact ; fiche produit : prix */
document.addEventListener('DOMContentLoaded',()=>{
 const pv=document.getElementById('preview');
 if(pv){pv.innerHTML=ranked().slice(0,4).map(cardHTML).join('');if(pv.previousElementSibling)pv.previousElementSibling.textContent='Les goûts préférés de nos clients';observeReveal()}
 const ct=document.getElementById('contact');
 if(ct&&CONTACT_EMAIL)ct.insertAdjacentHTML('beforeend','<p class="lead2">Une question ? Écrivez-nous : <a href="mailto:'+esc(CONTACT_EMAIL)+'" style="text-decoration:underline">'+esc(CONTACT_EMAIL)+'</a></p>');
});
