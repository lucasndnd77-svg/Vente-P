/* Panier + validation : la demande est envoyée par e-mail via Web3Forms (https://web3forms.com).
   Aucun paiement. Clé Web3Forms configurée. */
const ORDER_CONFIG={accessKey:'bb49df1a-a2b4-4100-aa1f-48ca460e1b58',subject:'Nouvelle commande JNR'};
const el=document.getElementById('cart'),checkout=document.getElementById('checkout');
function render(){const cart=getCart(),cat=getCatalog(),items=Object.keys(cart).map(id=>({p:cat.find(x=>x.id===id),n:cart[id]})).filter(x=>x.p);
 checkout.hidden=!items.length;
 if(!items.length){el.innerHTML='<div class="empty"><img src="images/interface/vide.svg" alt="" width="90" style="margin:auto 0 12px;margin-inline:auto"><p>Votre sélection est vide.</p><p><a class="btn" href="catalogue.html" style="margin-top:14px">Parcourir le catalogue</a></p></div>';return}
 const total=items.reduce((a,x)=>a+x.n,0);
 el.innerHTML=items.map(({p,n})=>`<div class="row"><img src="${esc(imgOf(p))}" alt=""><a class="nm" href="produit.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a><div class="qty"><button data-a="minus" data-id="${p.id}" aria-label="Moins">−</button><b>${n}</b><button data-a="plus" data-id="${p.id}" aria-label="Plus">+</button></div><button class="btn danger sm" data-a="del" data-id="${p.id}">Supprimer</button></div>`).join('')+`<div class="sum"><div><b>Récapitulatif</b><br><span class="mut">${items.length} goût(s) · ${total} article(s)</span></div><button class="btn ghost" data-a="clear">Vider la sélection</button></div>`}
el.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const c=getCart(),id=b.dataset.id;
 if(b.dataset.a==='plus')c[id]=Math.min(99,(c[id]||0)+1);
 if(b.dataset.a==='minus'){c[id]=(c[id]||1)-1;if(c[id]<1)delete c[id]}
 if(b.dataset.a==='del')delete c[id];
 if(b.dataset.a==='clear'){if(!confirm('Vider toute la sélection ?'))return;Object.keys(c).forEach(k=>delete c[k])}
 saveCart(c);render()});

/* ---- Formulaire de validation (créé une seule fois pour ne pas perdre la saisie) ---- */
const F=(n,l,t='text',r=true)=>`<label>${l}${r?' *':''}<input name="${n}" type="${t}" ${r?'required':''} maxlength="120"></label>`;
checkout.innerHTML=`<form id="of" class="box"><h2 style="margin-top:0">Valider ma demande</h2><div class="fg">${F('prenom','Prénom')}${F('nom','Nom')}${F('email','E-mail','email')}${F('tel','Téléphone','tel')}${F('adresse','Adresse')}${F('cp','Code postal')}${F('ville','Ville')}</div><label>Message (facultatif)<textarea name="message" rows="2" maxlength="500"></textarea></label><input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off"><label class="chk"><input type="checkbox" name="age" required> Je certifie avoir 18 ans ou plus. *</label><label class="chk"><input type="checkbox" name="rgpd" required> J'accepte que ces informations soient envoyées au vendeur pour traiter ma demande (<a href="informations.html" style="text-decoration:underline">données personnelles</a>). *</label><div class="warn">⚠️ La nicotine est très addictive. Aucun paiement n'est demandé ici : le vendeur vous recontacte.</div><p id="msg" class="err" role="alert"></p><button class="btn" id="send">Envoyer ma demande</button></form>`;
document.getElementById('of').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,msg=document.getElementById('msg'),btn=document.getElementById('send'),d=Object.fromEntries(new FormData(f));
 if(!ORDER_CONFIG.accessKey){msg.textContent="L'envoi par e-mail n'est pas encore configuré (clé manquante dans js/panier.js).";return}
 const cart=getCart(),cat=getCatalog(),lines=Object.keys(cart).map(id=>{const p=cat.find(x=>x.id===id);return p?cart[id]+' x '+p.name:null}).filter(Boolean);
 if(!lines.length){msg.textContent='Votre sélection est vide.';return}
 btn.disabled=true;btn.textContent='Envoi…';msg.textContent='';
 try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:ORDER_CONFIG.accessKey,subject:ORDER_CONFIG.subject,from_name:'Site JNR',botcheck:d.botcheck?'on':'',name:d.prenom+' '+d.nom,email:d.email,telephone:d.tel,adresse:d.adresse+', '+d.cp+' '+d.ville,commande:lines.join('\n'),message:d.message||'(aucun)',majeur_confirme:'oui'})});
  const j=await r.json();if(!j.success)throw new Error(j.message);
  saveCart({});checkout.hidden=true;el.innerHTML='<div class="empty"><h2>✅ Demande envoyée</h2><p>Merci ! Le vendeur vous recontacte rapidement pour finaliser la commande.</p><p><a class="btn" href="catalogue.html" style="margin-top:14px">Retour au catalogue</a></p></div>'}
 catch(x){msg.textContent="Échec de l'envoi : "+(x.message||'réessayez plus tard')+'.';btn.disabled=false;btn.textContent='Envoyer ma demande'}});
render();
