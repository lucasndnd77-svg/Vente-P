/* JNR – fonctions communes : données, stockage, panier, en-tête/pied de page */
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
const imgOf=p=>p.img||`images/produits/${p.id}.svg`;
/* Panier de démonstration : { idProduit: quantité } */
const getCart=()=>store.get('jnr_cart',{});
const saveCart=c=>{store.set('jnr_cart',c);updateBadge()};
const cartCount=()=>Object.values(getCart()).reduce((a,b)=>a+b,0);
function addToCart(id,q=1){const c=getCart();c[id]=Math.min(99,(c[id]||0)+q);saveCart(c);toast('Ajouté à la sélection ✓')}
function updateBadge(){const b=document.getElementById('badge');if(b)b.textContent=cartCount()}
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.className='show';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',1800)}
function cardHTML(p){const u='produit.html?id='+encodeURIComponent(p.id);return `<article class="card rv" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}"><a class="cimg" href="${u}"><img src="${esc(imgOf(p))}" alt="Illustration ${esc(p.name)}" loading="lazy"></a><div class="cbody"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><a class="btn sm" href="${u}">Voir la fiche</a></div></article>`}
function observeReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.rv:not(.in)').forEach(el=>io.observe(el))}
function renderLayout(){
 const page=location.pathname.split('/').pop()||'index.html';
 const L=[['index.html','Accueil'],['catalogue.html','Catalogue'],['index.html#presentation','Présentation'],['informations.html','Informations'],['index.html#contact','Contact']];
 document.getElementById('site-header').innerHTML=`<div class="wrap nav"><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><button class="burger" aria-label="Menu" onclick="this.nextElementSibling.classList.toggle('open')">☰</button><ul>${L.map(([h,t])=>`<li><a href="${h}" class="${h===page?'on':''}">${t}</a></li>`).join('')}<li><a href="panier.html" class="${page==='panier.html'?'on':''}">Sélection <span id="badge">0</span></a></li></ul></div>`;
 document.getElementById('site-footer').innerHTML=`<div class="wrap foot"><div><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><p><small>Site de démonstration – aucun paiement, aucune donnée collectée.</small></p></div><div><a href="index.html">Accueil</a><a href="catalogue.html">Catalogue</a><a href="informations.html">Informations & sécurité</a><a href="panier.html">Ma sélection</a><a href="admin.html">Administration (démo)</a></div><div><div class="warn">⚠️ Ce produit contient de la nicotine, substance très addictive. Réservé aux adultes : interdit de vente aux mineurs.</div><p><small>Mentions légales : projet non commercial ; illustrations originales, non officielles.</small></p></div></div>`;
 updateBadge();observeReveal()}
renderLayout();
