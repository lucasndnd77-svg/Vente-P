/* Panier de démonstration (localStorage) */
const el=document.getElementById('cart');
function render(){const cart=getCart(),cat=getCatalog(),items=Object.keys(cart).map(id=>({p:cat.find(x=>x.id===id),n:cart[id]})).filter(x=>x.p);
 if(!items.length){el.innerHTML='<div class="empty"><img src="images/interface/vide.svg" alt="" width="90" style="margin:auto 0 12px;margin-inline:auto"><p>Votre sélection est vide.</p><p><a class="btn" href="catalogue.html" style="margin-top:14px">Parcourir le catalogue</a></p></div>';return}
 const total=items.reduce((a,x)=>a+x.n,0);
 el.innerHTML=items.map(({p,n})=>`<div class="row"><img src="${esc(imgOf(p))}" alt=""><a class="nm" href="produit.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a><div class="qty"><button data-a="minus" data-id="${p.id}" aria-label="Moins">−</button><b>${n}</b><button data-a="plus" data-id="${p.id}" aria-label="Plus">+</button></div><button class="btn danger sm" data-a="del" data-id="${p.id}">Supprimer</button></div>`).join('')+`<div class="sum"><div><b>Récapitulatif</b><br><span class="mut">${items.length} goût(s) · ${total} article(s)</span></div><button class="btn ghost" data-a="clear">Vider la sélection</button></div>`}
el.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const c=getCart(),id=b.dataset.id;
 if(b.dataset.a==='plus')c[id]=Math.min(99,(c[id]||0)+1);
 if(b.dataset.a==='minus'){c[id]=(c[id]||1)-1;if(c[id]<1)delete c[id]}
 if(b.dataset.a==='del')delete c[id];
 if(b.dataset.a==='clear'){if(!confirm('Vider toute la sélection ?'))return;Object.keys(c).forEach(k=>delete c[k])}
 saveCart(c);render()});
render();
