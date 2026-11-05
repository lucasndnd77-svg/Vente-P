/* Panier + validation : la demande est envoyée par e-mail via Web3Forms (https://web3forms.com).
   Aucun paiement. Clé Web3Forms configurée. */
const ORDER_CONFIG={accessKey:'bb49df1a-a2b4-4100-aa1f-48ca460e1b58',subject:'Nouvelle commande JNR'};
const el=document.getElementById('cart'),checkout=document.getElementById('checkout');
function render(){const cart=getCart(),cat=getCatalog(),items=Object.keys(cart).map(id=>({p:cat.find(x=>x.id===id),n:cart[id]})).filter(x=>x.p);
 checkout.hidden=!items.length;setStep(items.length?2:1);showChips(items);
 if(!items.length){el.innerHTML='<div class="empty"><img src="images/interface/vide.svg" alt="" width="90" style="margin:auto 0 12px;margin-inline:auto"><p>Votre sélection est vide.</p><p><a class="btn" href="catalogue.html" style="margin-top:14px">Parcourir le catalogue</a></p></div>';return}
 const total=items.reduce((a,x)=>a+x.n,0);
 el.innerHTML=items.map(({p,n})=>`<div class="row"><img src="${esc(imgOf(p))}" alt=""><a class="nm" href="produit.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a><div class="qty"><button data-a="minus" data-id="${p.id}" aria-label="Moins">−</button><b>${n}</b><button data-a="plus" data-id="${p.id}" aria-label="Plus">+</button></div><button class="btn danger sm" data-a="del" data-id="${p.id}">Supprimer</button></div>`).join('')+`<div class="sum"><div><b>Récapitulatif</b><br><span class="mut">${items.length} goût(s) · ${total} article(s)</span></div><button class="btn ghost" data-a="clear">Vider la sélection</button></div>`}
el.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const c=getCart(),id=b.dataset.id;
 if(b.dataset.a==='plus')c[id]=Math.min(99,(c[id]||0)+1);
 if(b.dataset.a==='minus'){c[id]=(c[id]||1)-1;if(c[id]<1)delete c[id]}
 if(b.dataset.a==='del')delete c[id];
 if(b.dataset.a==='clear'){if(!confirm('Vider toute la sélection ?'))return;Object.keys(c).forEach(k=>delete c[k])}
 saveCart(c);render()});

/* ---- Étapes, récapitulatif en puces et formulaire (créé une seule fois pour ne pas perdre la saisie) ---- */
function setStep(n){document.querySelectorAll('#steps li').forEach((li,i)=>{li.className=i+1<n?'done':i+1===n?'on':''})}
function showChips(items){const c=document.getElementById('chips');if(c)c.innerHTML=items.map(x=>`<span class="chip">${x.n}× ${esc(x.p.name)}</span>`).join('')}
const FLD=(n,ic,l,t='text',x='')=>`<label class="fld"><span class="ic">${ic}</span><input name="${n}" type="${t}" placeholder=" " required maxlength="80" ${x}><span class="lb">${l}</span></label>`;
checkout.innerHTML=`<div class="co"><form id="of" class="co-in"><h2>Vos informations</h2><p class="mut sub">Juste de quoi vous rappeler pour finaliser la commande.</p><div id="chips" class="chips"></div><div class="fg">${FLD('prenom','👤','Prénom','text','autocomplete="given-name"')}${FLD('nom','🪪','Nom','text','autocomplete="family-name"')}</div>${FLD('tel','📱','Numéro de téléphone','tel','autocomplete="tel" pattern="[0-9 +.\\-]{8,20}" title="Numéro de téléphone valide"')}<label class="fld ta"><span class="ic">💬</span><textarea name="message" rows="2" maxlength="500" placeholder=" "></textarea><span class="lb">Un message ? (facultatif)</span></label><label class="tg"><input type="checkbox" name="age" required><i></i><span>Je certifie avoir <b>18 ans ou plus</b>.</span></label><label class="tg"><input type="checkbox" name="rgpd" required><i></i><span>J'accepte que ces informations soient transmises au vendeur pour traiter ma demande (<a href="informations.html" style="text-decoration:underline">données personnelles</a>).</span></label><input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off"><div class="warn">⚠️ La nicotine est très addictive. Aucun paiement n'est demandé ici.</div><p id="msg" class="err" role="alert"></p><button class="btn big" id="send">Envoyer ma demande →</button></form></div>`;
document.getElementById('of').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,msg=document.getElementById('msg'),btn=document.getElementById('send'),d=Object.fromEntries(new FormData(f));
 if(!ORDER_CONFIG.accessKey){msg.textContent="L'envoi n'est pas configuré (clé manquante dans js/panier.js).";return}
 const cart=getCart(),cat=getCatalog(),lines=Object.keys(cart).map(id=>{const p=cat.find(x=>x.id===id);return p?cart[id]+' x '+p.name:null}).filter(Boolean);
 if(!lines.length){msg.textContent='Votre sélection est vide.';return}
 btn.disabled=true;btn.textContent='Envoi en cours…';msg.textContent='';
 try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:ORDER_CONFIG.accessKey,subject:ORDER_CONFIG.subject+' – '+d.prenom,from_name:'Site JNR',botcheck:d.botcheck?'on':'',name:d.prenom+' '+d.nom,telephone:d.tel,commande:lines.join('\n'),message:d.message||'(aucun)',majeur_confirme:'oui',envoye_le:new Date().toLocaleString('fr-FR')})});
  const j=await r.json();if(!j.success)throw new Error(j.message);
  saveCart({});checkout.hidden=true;setStep(4);window.scrollTo({top:0,behavior:'smooth'});
  el.innerHTML='<div class="ok"><svg viewBox="0 0 52 52"><circle class="c" cx="26" cy="26" r="25" fill="none" stroke="#2fd47a" stroke-width="2"/><path class="t" fill="none" stroke="#2fd47a" stroke-width="3" d="M14 27l8 8 16-17"/></svg><h2>Demande envoyée !</h2><p class="mut">Merci '+esc(d.prenom)+' : le vendeur vous rappelle très vite pour finaliser votre commande.</p><p><a class="btn" href="catalogue.html" style="margin-top:16px">Retour au catalogue</a></p></div>'}
 catch(x){msg.textContent="L'envoi a échoué : "+(x.message||'réessayez plus tard')+'.';btn.disabled=false;btn.textContent='Envoyer ma demande →'}});
render();
