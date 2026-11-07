/* JNR – fonctions communes : données, stockage, panier, prix, ventes, en-tête/pied de page */
const PRICE=13;                 // prix unitaire en euros (modifiable)
const CONTACT_EMAIL='lucasndnd77@gmail.com';         // ← mettez votre adresse e-mail de contact ici
const SALES_BASE={};            // ventes de départ par goût, ex. {'cherry-ice':12,'luv-66':7}
const RAW=[
"Strawberry Kiwi|#e92720|#efa939|Fraise sucrée et kiwi acidulé, un duo vif et rafraîchissant.",
"Mixed Berry|#209ce9|#ef4239|Assortiment de baies rouges et bleues, doux et fruité.",
"Strawberry Watermelon|#e92420|#efa639|Fraise mûre et pastèque juteuse, l'équilibre estival.",
"Peach Berry|#e92720|#efa939|Pêche tendre mêlée à des baies sauvages.",
"Black Dragon Ice|#e92720|#efa939|Fruit du dragon exotique avec une touche glacée.",
"Golden Dragon Ice|#e97420|#efc439|Fruit du dragon doré, notes exotiques ensoleillées et fraîcheur glacée.",
"Blackberry Red Raspberry|#9220e9|#ef4539|Mûre profonde et framboise rouge intense.",
"Blueberry Pomegranate Ice|#20bae9|#395aef|Myrtille, grenade et fraîcheur glacée.",
"Mango Passion Fruit|#20e9bd|#39acef|Mangue ensoleillée et fruit de la passion.",
"Watermelon Mango Peach|#e92720|#efa939|Trio gourmand de pastèque, mangue et pêche.",
"Blueberry Raspberry Cherry|#20c1e9|#394eef|Myrtille, framboise et cerise : le trio des baies.",
"Cherry Ice|#20bae9|#395aef|Cerise éclatante sur fond de fraîcheur glacée.",
"Watermelon Ice|#e92420|#efa639|Pastèque désaltérante et sensation glacée.",
"Watermelon Bubblegum|#e92720|#efa939|Pastèque sucrée aux notes de chewing-gum.",
"Cherry Watermelon Freeze|#e92a20|#3969ef|Cerise et pastèque en version très fraîche.",
"Blueberry Sour Raspberry|#20bde9|#ef6339|Myrtille et framboise avec un côté acidulé.",
"Fizzy Cherry Cola|#e97420|#efef39|Cerise pétillante façon cola.",
"Luv 66|#20e9ce|#ef6339|Un mélange mystère à l'identité bien à lui."];
/* Arômes de chaque goût : servent à proposer des goûts ressemblants (« Ce qui pourrait vous plaire ») */
const TASTES={'strawberry-kiwi':['fraise','kiwi','fruits-rouges','acidule'],'mixed-berry':['baies','fruits-rouges','myrtille'],'strawberry-watermelon':['fraise','pasteque','fruits-rouges','ete'],'peach-berry':['peche','baies','fruits-rouges'],'black-dragon-ice':['dragon','exotique','glace'],'golden-dragon-ice':['dragon','exotique','glace','mangue'],'blackberry-red-raspberry':['baies','framboise','mure','fruits-rouges'],'blueberry-pomegranate-ice':['myrtille','baies','grenade','glace'],'mango-passion-fruit':['mangue','exotique','passion'],'watermelon-mango-peach':['pasteque','mangue','peche','exotique','ete'],'blueberry-raspberry-cherry':['myrtille','framboise','cerise','baies','fruits-rouges'],'cherry-ice':['cerise','glace','fruits-rouges'],'watermelon-ice':['pasteque','glace','ete'],'watermelon-bubblegum':['pasteque','bonbon','ete'],'cherry-watermelon-freeze':['cerise','pasteque','glace','fruits-rouges'],'blueberry-sour-raspberry':['myrtille','framboise','acidule','baies'],'fizzy-cherry-cola':['cerise','petillant','bonbon'],'luv-66':['bonbon','mystere','exotique']};
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
function defaultCatalog(){return RAW.map(r=>{const[n,c1,c2,d]=r.split('|');return{id:slug(n),name:n,c1,c2,desc:d,img:null}})}
/* Catalogue modifié dans l'admin : corrige l'ancien « Dragon Ice » et ajoute les goûts manquants */
function migrateCatalog(c){if(!c)return c;const def=defaultCatalog();let ch=false;
 c.forEach(p=>{if(p.id==='dragon-ice'){Object.assign(p,{id:'black-dragon-ice',name:'Black Dragon Ice'});ch=true}});
 def.forEach((d,i)=>{if(d.id==='golden-dragon-ice'&&!c.some(p=>p.id===d.id)){const j=c.findIndex(p=>p.id==='black-dragon-ice');c.splice(j<0?c.length:j+1,0,d);ch=true}});
 if(ch)store.set('jnr_catalog',c);return c}
const getCatalog=()=>migrateCatalog(store.get('jnr_catalog',null))||defaultCatalog();
const saveCatalog=c=>store.set('jnr_catalog',c);
/* Photos réelles (PNG détourés) ; les goûts absents de la liste gardent leur illustration SVG */
const PHOTOS=new Set(['strawberry-kiwi','mixed-berry','strawberry-watermelon','peach-berry','black-dragon-ice','golden-dragon-ice','blackberry-red-raspberry','blueberry-pomegranate-ice','mango-passion-fruit','watermelon-mango-peach','blueberry-raspberry-cherry','cherry-ice','watermelon-ice','watermelon-bubblegum','cherry-watermelon-freeze','blueberry-sour-raspberry','fizzy-cherry-cola','luv-66']);
const isPhoto=p=>p.kind==='liquide'||(!p.img&&PHOTOS.has(p.id));
/* ---- E-LIQUIDES : flacons 10 ml, 3,50 €, nicotine 0 %, 1 % ou 2 %. Images : images/eliquides/<nom>.webp ----
   Une ligne = "Nom|couleur1|couleur2|description|arômes (séparés par des virgules)" */
const LIQ_PRICE=3.5,LIQ_NICS=['0%','1%','2%'],LIQ_ML=10,LIQ_PREFIX='el-';
const LIQ_RAW=[
"Black Dragon Ice|hsl(325 82% 52%)|hsl(264 85% 58%)|Fruit du dragon exotique avec une touche glacée.|dragon,exotique,glace",
"Blackberry Red Raspberry|hsl(80 75% 45%)|hsl(251 85% 58%)|Mûre profonde et framboise rouge intense.|baies,framboise,mure,fruits-rouges",
"Blue Razz Cherry|hsl(194 82% 52%)|hsl(350 85% 58%)|Framboise bleue acidulée et cerise gourmande.|framboise,cerise,bonbon,acidule",
"Blue Razz Ice|hsl(194 82% 52%)|hsl(229 85% 58%)|Framboise bleue façon bonbon, avec un souffle glacé.|framboise,bonbon,glace",
"Blueberry Cherry Cranberry|hsl(356 82% 52%)|hsl(194 85% 58%)|Myrtille, cerise et canneberge : fruité et légèrement acidulé.|myrtille,cerise,baies,fruits-rouges,acidule",
"Blueberry Pomegranate Ice|hsl(194 82% 52%)|hsl(46 85% 58%)|Myrtille, grenade et fraîcheur glacée.|myrtille,baies,grenade,glace",
"Blueberry Raspberry Cherry|hsl(47 82% 52%)|hsl(357 85% 58%)|Myrtille, framboise et cerise : le trio des baies.|myrtille,framboise,cerise,baies,fruits-rouges",
"Blueberry Red Raspberry|hsl(255 82% 52%)|hsl(203 85% 58%)|Myrtille douce et framboise rouge.|myrtille,framboise,baies,fruits-rouges",
"Blueberry Sour Raspberry|hsl(194 82% 52%)|hsl(65 85% 58%)|Myrtille et framboise avec un côté acidulé.|myrtille,framboise,acidule,baies",
"Cherry Berry|hsl(356 82% 52%)|hsl(222 85% 58%)|Cerise juteuse et mélange de baies.|cerise,baies,fruits-rouges",
"Cherry Ice|hsl(1 82% 52%)|hsl(226 85% 58%)|Cerise éclatante sur fond de fraîcheur glacée.|cerise,glace,fruits-rouges",
"Cherry Watermelon Freeze|hsl(194 82% 52%)|hsl(350 85% 58%)|Cerise et pastèque en version très fraîche.|cerise,pasteque,glace,fruits-rouges",
"Fizzy Cherry Cola|hsl(357 82% 52%)|hsl(32 85% 58%)|Cerise pétillante façon cola.|cerise,petillant,bonbon",
"Fresh Mint|hsl(175 82% 52%)|hsl(200 85% 58%)|Menthe fraîche et pure, pour un souffle net.|menthe,glace",
"Green Apple Peach|hsl(2 82% 52%)|hsl(125 85% 58%)|Pomme verte croquante et pêche tendre.|pomme,peche,acidule",
"Lady Killa|hsl(336 82% 52%)|hsl(11 85% 58%)|Un mélange fruité et sucré au caractère affirmé.|bonbon,mystere,fruits-rouges",
"Love 66|hsl(194 82% 52%)|hsl(323 85% 58%)|Un mélange mystère à l'identité bien à lui.|bonbon,mystere,exotique",
"Mango Passion Fruit|hsl(135 82% 52%)|hsl(345 85% 58%)|Mangue ensoleillée et fruit de la passion.|mangue,exotique,passion",
"Mixed Berries|hsl(25 82% 52%)|hsl(223 85% 58%)|Assortiment de baies rouges et bleues, doux et fruité.|baies,fruits-rouges,myrtille",
"Mr Blue|hsl(325 82% 52%)|hsl(213 85% 58%)|Un mélange bleu et rose, fruité façon bonbon.|bonbon,mystere,baies",
"New Blue Cherry Cranberry|hsl(265 82% 52%)|hsl(204 85% 58%)|Nouvelle recette : myrtille, cerise et canneberge.|myrtille,cerise,baies,acidule",
"Passion Fruit Kiwi|hsl(194 82% 52%)|hsl(64 85% 58%)|Fruit de la passion et kiwi acidulé.|passion,kiwi,exotique,acidule",
"Peach Berry|hsl(45 82% 52%)|hsl(341 85% 58%)|Pêche tendre mêlée à des baies sauvages.|peche,baies,fruits-rouges",
"Peach Mango Pineapple|hsl(357 82% 52%)|hsl(45 85% 58%)|Pêche, mangue et ananas : un cocktail tropical.|peche,mangue,exotique,ete",
"Strawberry Bull|hsl(342 82% 52%)|hsl(53 85% 58%)|Fraise et boisson énergisante, pétillant et sucré.|fraise,petillant,bonbon",
"Strawberry Ice|hsl(333 82% 52%)|hsl(200 85% 58%)|Fraise mûre et fraîcheur glacée.|fraise,glace,fruits-rouges",
"Strawberry Kiwi|hsl(55 82% 52%)|hsl(350 85% 58%)|Fraise sucrée et kiwi acidulé, un duo vif et rafraîchissant.|fraise,kiwi,fruits-rouges,acidule",
"Strawberry Raspberry Ice|hsl(341 82% 52%)|hsl(285 85% 58%)|Fraise et framboise sur une note glacée.|fraise,framboise,glace,fruits-rouges",
"Strawberry Watermelon Ice|hsl(354 82% 52%)|hsl(29 85% 58%)|Fraise mûre et pastèque juteuse, en version glacée.|fraise,pasteque,glace,fruits-rouges,ete",
"Summer Holiday|hsl(195 82% 52%)|hsl(230 85% 58%)|Un mélange estival frais et fruité, goût vacances.|ete,glace,mystere,exotique",
"Summer Peach Ice|hsl(40 82% 52%)|hsl(195 85% 58%)|Pêche d'été et touche glacée.|peche,glace,ete",
"Watermelon Bubblegum|hsl(195 82% 52%)|hsl(352 85% 58%)|Pastèque sucrée aux notes de chewing-gum.|pasteque,bonbon,ete",
"Watermelon Ice|hsl(13 82% 52%)|hsl(200 85% 58%)|Pastèque désaltérante et sensation glacée.|pasteque,glace,ete",
"Watermelon Lychee|hsl(348 82% 52%)|hsl(118 85% 58%)|Pastèque juteuse et litchi parfumé.|pasteque,exotique,ete",
"Watermelon Mango Peach|hsl(45 82% 52%)|hsl(350 85% 58%)|Trio gourmand de pastèque, mangue et pêche.|pasteque,mangue,peche,exotique,ete",
"Wild Berries Ice|hsl(195 82% 52%)|hsl(330 85% 58%)|Baies sauvages et fraîcheur glacée.|baies,fruits-rouges,glace"];
const LIQUIDS=LIQ_RAW.map(r=>{const[n,c1,c2,d,t]=r.split('|'),s=slug(n);return{id:LIQ_PREFIX+s,name:n,c1,c2,desc:d,kind:'liquide',price:LIQ_PRICE,img:`images/eliquides/${s}.webp`}});
LIQ_RAW.forEach(r=>{const x=r.split('|');TASTES[LIQ_PREFIX+slug(x[0])]=x[4].split(',')});
const getLiquids=()=>LIQUIDS;
const isLiq=p=>!!p&&p.kind==='liquide';
const findProduct=id=>getCatalog().find(x=>x.id===id)||LIQUIDS.find(x=>x.id===id);
/* Puff → e-liquide du même goût (quand le nom n'est pas identique, on l'indique ici) */
const PUFF_TO_LIQ={'mixed-berry':'mixed-berries','strawberry-watermelon':'strawberry-watermelon-ice','luv-66':'love-66'};
const liquidFor=p=>LIQUIDS.find(x=>x.id===LIQ_PREFIX+(PUFF_TO_LIQ[p.id]||p.id));
const puffFor=l=>getCatalog().find(p=>liquidFor(p)===l);
const nicInfo=v=>({'0%':'0 mg/ml · sans nicotine','1%':'10 mg/ml · doux','2%':'20 mg/ml · intense'})[v]||'';
const liqTagHTML=()=>`<span class="pack liq">💧 Flacon ${LIQ_ML} ml · 0 / 1 / 2 %</span>`;
/* IMG_V : augmentez ce numéro à chaque remplacement d'image pour forcer les navigateurs à recharger */
const IMG_V=7;
const imgOf=p=>p.kind==='liquide'?`${p.img}?v=${IMG_V}`:p.img||`images/produits/${p.id}.${PHOTOS.has(p.id)?'png':'svg'}?v=${IMG_V}`;
const imgCls=p=>isPhoto(p)?' class="photo"':'';
/* Chaque puff est vendue avec 2 recharges du même goût, ajoutées automatiquement */
const RECHARGES=2;
const packHTML=(p,n=1)=>`<span class="pack">🧴 + ${n*RECHARGES} recharge${n*RECHARGES>1?'s':''} incluse${n*RECHARGES>1?'s':''}</span>`;
/* Thème de couleurs tiré de l'image de la puff : teinte dominante (c1) + teinte secondaire (c2) */
function themeFromImage(src){
 const key='jnr_theme_'+src,cached=store.get(key,null);if(cached)return Promise.resolve(cached);
 return new Promise(ok=>{const im=new Image();im.onload=()=>{try{
  const W=48,H=64,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(im,0,0,W,H);
  const d=g.getImageData(0,0,W,H).data,bins=new Float64Array(36),hs=[...Array(36)].map(()=>[]);
  for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const r=d[i]/255,gg=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,dl=mx-mn;if(dl<.12)continue;
   const s=dl/(1-Math.abs(2*l-1));if(s<.3||l<.12||l>.85)continue;
   let h=mx===r?((gg-b)/dl)%6:mx===gg?(b-r)/dl+2:(r-gg)/dl+4;h=(h*60+360)%360;const w=s*(1-Math.abs(l-.5));const k=Math.floor(h/10)%36;bins[k]+=w;hs[k].push(h)}
  const dist=(a,b)=>{const x=Math.abs(a-b)%360;return x>180?360-x:x},hueOf=k=>{const a=hs[k];if(!a.length)return k*10+5;let sx=0,sy=0;a.forEach(h=>{sx+=Math.cos(h*Math.PI/180);sy+=Math.sin(h*Math.PI/180)});return (Math.atan2(sy,sx)*180/Math.PI+360)%360};
  let k1=0;bins.forEach((v,k)=>{if(v>bins[k1])k1=k});if(!bins[k1])return ok(null);
  const h1=hueOf(k1);let k2=-1;bins.forEach((v,k)=>{if(dist(k*10+5,h1)>=35&&v>=bins[k1]*.12&&(k2<0||v>bins[k2]))k2=k});
  const h2=k2<0?(h1+35)%360:hueOf(k2),t={c1:`hsl(${h1|0} 82% 52%)`,c2:`hsl(${h2|0} 85% 58%)`};
  store.set(key,t);ok(t)}catch(e){ok(null)}};im.onerror=()=>ok(null);im.src=src})}
function applyTheme(t,...els){if(!t)return;[document.body,...els].forEach(e=>{e.style.setProperty('--c1',t.c1);e.style.setProperty('--c2',t.c2)});document.body.classList.add('themed')}
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
function addToCart(id,q=1,nic=NICS[NICS.length-1]){const c=getCart(),k=cartKey(id,nic);c[k]=Math.min(99,(c[k]||0)+q);saveCart(c);toast('Ajouté au panier ✓')}
function updateBadge(){const n=cartCount();document.querySelectorAll('#badge,.badge').forEach(b=>b.textContent=n)}
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.className='show';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',1800)}
/* Stock : liste des goûts « En stock » publiée depuis l'administration dans le fichier stock.json.
   Rien n'est affiché pour un goût qui n'est pas en stock. */
let STOCK=new Set(store.get('jnr_stock',[]));
const stockHTML=(id,big)=>STOCK.has(id)?`<span class="instock${big?' big':''}">✅ En stock</span>`:'';
const stockSlot=id=>`<span data-stock="${esc(id)}">${stockHTML(id)}</span>`;
function refreshStock(){document.querySelectorAll('[data-stock]').forEach(e=>e.innerHTML=stockHTML(e.dataset.stock,e.dataset.big))}
const stockReady=fetch('stock.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.enStock)){STOCK=new Set(j.enStock);store.set('jnr_stock',j.enStock);refreshStock()}return j}).catch(()=>null);
function cardHTML(p){const u='produit.html?id='+encodeURIComponent(p.id),liq=isLiq(p),top=!liq&&p.id===topId()?'<span class="top">👑 Top vente</span>':'';return `<article class="card rv${liq?' liqcard':''}" style="--c1:${esc(p.c1)};--c2:${esc(p.c2)}">${top}<a class="cimg" href="${u}"><img src="${esc(imgOf(p))}"${imgCls(p)} alt="${isPhoto(p)?'Photo':'Illustration'} ${esc(p.name)}" loading="lazy"></a><div class="cbody"><h3>${esc(p.name)}</h3>${stockSlot(p.id)}<b class="pr">${eur(priceOf(p))}</b>${liq?liqTagHTML():packHTML(p)}<p>${esc(p.desc)}</p><a class="btn sm" href="${u}">Voir la fiche</a></div></article>`}
function observeReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.rv:not(.in)').forEach(el=>io.observe(el))}
function renderLayout(){
 const page=location.pathname.split('/').pop()||'index.html';
 const L=[['index.html','Accueil'],['catalogue.html','Catalogue'],['informations.html','Informations'],['index.html#contact','Contact']];
 document.getElementById('site-header').innerHTML=`<div class="wrap nav"><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><div class="mright"><a class="mcart" href="panier.html" aria-label="Mon panier">🛒<span class="badge">0</span></a><button class="burger" aria-label="Menu" onclick="this.closest('.nav').querySelector('ul').classList.toggle('open')">☰</button></div><ul>${L.map(([h,t])=>`<li><a href="${h}" class="${h===page?'on':''}">${t}</a></li>`).join('')}<li><a href="panier.html" class="${page==='panier.html'?'on':''}">Panier <span id="badge">0</span></a></li></ul></div>`;
 document.getElementById('site-footer').innerHTML=`<div class="wrap foot"><div><a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="">JNR</a><p><small>Aucun paiement en ligne. Votre commande est envoyée directement au vendeur, et à personne d'autre : aucune information n'est conservée sur le site ni transmise à qui que ce soit. Le vendeur vous recontacte par le moyen que vous avez choisi en fin de commande (téléphone, e-mail ou réseau social).</small></p></div><div><a href="index.html">Accueil</a><a href="catalogue.html">Catalogue</a><a href="informations.html">Informations & sécurité</a><a href="panier.html">Mon panier</a></div><div><div class="warn">⚠️ Ce produit contient de la nicotine, substance très addictive. Réservé aux adultes : interdit de vente aux mineurs.</div><p><small>Chaque puff est livrée avec ${RECHARGES} recharges du même goût. Voir « Données personnelles » dans Informations.</small></p></div></div>${page==='index.html'?'<div class="wrap admin-link"><a href="admin.html">Administration</a></div>':''}`;
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
document.head.insertAdjacentHTML('beforeend','<style>.card{position:relative}.top{position:absolute;top:10px;left:10px;z-index:2;background:linear-gradient(135deg,#ffd447,#ff9f1c);color:#2a1800;font-weight:800;font-size:.8rem;padding:4px 12px;border-radius:99px;box-shadow:0 6px 16px #0007}.pr{font-size:1.15rem}.pr.big{display:block;font-size:1.7rem;margin:8px 0}.lt{min-width:80px;text-align:right}.tot{font-size:1.5rem;font-weight:800}img.photo{object-fit:contain!important;filter:drop-shadow(0 16px 22px #000b) saturate(1.05)}.cimg img.photo{padding:7% 7% 3%;transition:transform .4s}.card:hover .cimg img.photo{transform:scale(1.05) rotate(-2deg)}.pf .big:has(img.photo){background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c1) 45%,transparent),transparent 70%),var(--bg2)}.pf .big img.photo{padding:8%}.row img.photo{background:radial-gradient(circle,#ffffff1a,transparent 70%)}.pack{display:inline-block;margin:6px 0 2px;padding:3px 10px;border-radius:99px;background:#ffffff12;border:1px solid #ffffff22;font-size:.8rem;font-weight:600;color:#e8e8f5}.pack.big{font-size:.95rem;padding:6px 14px;margin:4px 0 10px}.nicb{display:inline-block;margin:6px 0 2px 6px;padding:3px 10px;border-radius:99px;font-size:.8rem;font-weight:800;color:#fff;background:linear-gradient(135deg,#7a5cff,#ff3b6b)}.pack.liq{background:linear-gradient(135deg,#38d6ff22,#7a5cff22);border-color:#38d6ff55}.liqcard .cimg img.photo{padding:5% 14% 2%}.admin-link{text-align:center;padding:6px 20px 14px}.admin-link a{font-size:.72rem;color:#ffffff40;letter-spacing:.05em}.admin-link a:hover{color:#ffffffa0}</style>');
/* Accueil : goûts les plus demandés + contact ; fiche produit : prix */
document.addEventListener('DOMContentLoaded',()=>{
 const pv=document.getElementById('preview');
 if(pv){pv.innerHTML=ranked().slice(0,4).map(cardHTML).join('');if(pv.previousElementSibling)pv.previousElementSibling.textContent='Les goûts préférés de nos clients';observeReveal()}
 const ct=document.getElementById('contact');
 if(ct&&CONTACT_EMAIL)ct.insertAdjacentHTML('beforeend','<p class="lead2" style="margin-top:12px">Une question ? Écrivez-nous : <a href="mailto:'+esc(CONTACT_EMAIL)+'" style="text-decoration:underline">'+esc(CONTACT_EMAIL)+'</a></p>');
});
