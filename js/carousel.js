/* Carrousel 3D "enroulé" de la page d'accueil.
   Les produits viennent de getCatalog() (tableau RAW dans js/main.js, ou catalogue modifié dans l'admin) :
   ajouter un goût là-bas l'ajoute automatiquement ici. */
(()=>{
const root=document.getElementById('c3d'),ring=document.getElementById('c3dRing');if(!root||!ring)return;
const items=getCatalog(),N=items.length;if(!N)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Réglages selon la largeur : pas angulaire (°), rayon du cylindre (px), nombre de produits visibles de chaque côté */
const cfg=()=>innerWidth<600?{step:36,R:215,vis:1}:innerWidth<900?{step:30,R:470,vis:2}:{step:22,R:700,vis:3};
let C=cfg(),pos=0,prev=new Array(N).fill(null);

ring.innerHTML=items.map((p,i)=>`<a class="c3d-item" href="produit.html?id=${encodeURIComponent(p.id)}" data-i="${i}" tabindex="-1" draggable="false" style="--c1:${esc(p.c1)}"><img src="${esc(imgOf(p))}" alt="${esc(p.name)}" loading="lazy" draggable="false"><img class="c3d-refl" src="${esc(imgOf(p))}" alt="" aria-hidden="true" loading="lazy" draggable="false"></a>`).join('');
const els=[...ring.children];
const wrapD=d=>{d=((d%N)+N)%N;return d>=N/2?d-N:d};
const center=()=>((Math.round(pos)%N)+N)%N;

function render(){
 els.forEach((el,i)=>{
  const d=wrapD(i-pos),a=Math.abs(d),th=d*C.step,rad=th*Math.PI/180;
  const x=C.R*Math.sin(rad),z=C.R*(Math.cos(rad)-1)-a*40,s=Math.max(.5,1.12-a*.1);
  const hidden=a>C.vis+.6;
  // un produit qui "fait le tour" (d saute d'un côté à l'autre) ne doit pas traverser l'écran
  const jump=prev[i]!==null&&Math.abs(d-prev[i])>N/2;prev[i]=d;
  if(jump){el.style.transition='none';requestAnimationFrame(()=>requestAnimationFrame(()=>el.style.transition=''))}
  el.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${th.toFixed(2)}deg) scale(${s.toFixed(3)})`;
  el.style.opacity=hidden?0:Math.max(0,1-a*.17).toFixed(2);
  el.style.zIndex=100-Math.round(a*10);
  el.style.pointerEvents=hidden?'none':'';
  el.classList.toggle('on',a<.5);
  el.setAttribute('aria-hidden',a<.5?'false':'true')});
 const p=items[center()];
 document.getElementById('c3dName').textContent=p.name;
 document.getElementById('c3dMeta').textContent=eur(priceOf(p))+' · + '+RECHARGES+' recharges incluses';
 document.getElementById('c3dLink').href='produit.html?id='+encodeURIComponent(p.id);
}
const go=n=>{pos=Math.round(pos)+n;render()};
const goTo=i=>{pos=Math.round(pos)+wrapD(i-pos);render()};

/* Flèches */
root.querySelector('.prev').onclick=()=>go(-1);
root.querySelector('.next').onclick=()=>go(1);
/* Clavier */
root.addEventListener('keydown',e=>{
 if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}
 else if(e.key==='ArrowRight'){e.preventDefault();go(1)}
 else if(e.key==='Enter'&&e.target===root){location.href=els[center()].href}});
/* Molette (horizontale ou verticale), limitée à un cran par geste */
let wheelT=0;
root.addEventListener('wheel',e=>{const v=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(v)<4)return;e.preventDefault();
 const now=Date.now();if(now-wheelT<420)return;wheelT=now;go(v>0?1:-1)},{passive:false});
/* Glisser au doigt / à la souris */
let drag=null,blockClick=false;
const pxPerStep=()=>Math.max(60,C.R*Math.sin(C.step*Math.PI/180));
root.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.c3d-arrow'))return;drag={x:e.clientX,p:pos,moved:false,id:e.pointerId}});
root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;
 if(!drag.moved&&Math.abs(dx)>6){drag.moved=true;root.classList.add('dragging');try{root.setPointerCapture(drag.id)}catch(x){}}
 if(drag.moved){pos=drag.p-dx/pxPerStep();render()}});
const end=e=>{if(!drag)return;if(drag.moved){blockClick=true;setTimeout(()=>blockClick=false,50);root.classList.remove('dragging');pos=Math.round(pos);render()}drag=null};
root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
/* Clic : un produit latéral vient au centre, le produit central ouvre sa fiche */
ring.addEventListener('click',e=>{const a=e.target.closest('.c3d-item');if(!a)return;
 if(blockClick){e.preventDefault();return}
 const i=+a.dataset.i;if(i!==center()){e.preventDefault();goTo(i)}});
/* Rotation automatique lente, en pause au survol / au focus / pendant un glissement */
let paused=false;
['mouseenter','focusin','pointerdown'].forEach(t=>root.addEventListener(t,()=>paused=true));
['mouseleave','focusout'].forEach(t=>root.addEventListener(t,()=>paused=false));
if(!reduce)setInterval(()=>{if(!paused&&!drag&&!document.hidden&&document.body.classList.contains('unlocked'))go(1)},3800);
/* Adaptation à la taille d'écran */
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{C=cfg();render()},120)});
render();
})();
