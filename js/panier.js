/* Panier + validation : la demande est envoyée par e-mail via Web3Forms (https://web3forms.com).
   Aucun paiement. Clé Web3Forms configurée. */
const ORDER_CONFIG={accessKey:'bb49df1a-a2b4-4100-aa1f-48ca460e1b58',subject:'Nouvelle commande JNR'};
const el=document.getElementById('cart'),checkout=document.getElementById('checkout');
/* Lignes du panier : {k: clé "id|taux", p: produit, nic: "1%"/"2%", n: quantité} */
const cartItems=()=>{const cart=getCart();return Object.keys(cart).map(k=>{const {id,nic}=parseKey(k);return {k,p:findProduct(id),nic,n:cart[k]}}).filter(x=>x.p)};
const nicTxt=nic=>nic?'Nicotine '+nic:'Nicotine non précisée';
/* Puffs : recharges incluses ; e-liquides : flacon 10 ml */
const extraHTML=(p,n)=>isLiq(p)?liqTagHTML().replace('0 / 1 / 2 %','e-liquide'):packHTML(p,n);
const recOf=items=>items.reduce((a,x)=>a+(isLiq(x.p)?0:x.n*RECHARGES),0);
function recapTxt(items){const pf=items.filter(x=>!isLiq(x.p)).reduce((a,x)=>a+x.n,0),lq=items.filter(x=>isLiq(x.p)).reduce((a,x)=>a+x.n,0),out=[items.length+' goût(s)'];
 if(pf)out.push(pf+' puff(s)',recOf(items)+' recharge(s) incluse(s)');if(lq)out.push(lq+' e-liquide(s) 10 ml');return out.join(' · ')}
function render(){const items=cartItems();
 checkout.hidden=!items.length;setStep(items.length?2:1);showChips(items);
 if(!items.length){el.innerHTML='<div class="empty"><img src="images/interface/vide.svg" alt="" width="90" style="margin:auto 0 12px;margin-inline:auto"><p>Votre panier est vide.</p><p><a class="btn" href="catalogue.html" style="margin-top:14px">Parcourir le catalogue</a></p></div>';return}
 const total=items.reduce((a,x)=>a+x.n,0),sum=items.reduce((a,x)=>a+priceOf(x.p)*x.n,0);
 el.innerHTML=items.map(({k,p,nic,n})=>`<div class="row"><img src="${esc(imgOf(p))}"${imgCls(p)} alt=""><div class="nm"><a href="produit.html?id=${encodeURIComponent(p.id)}">${isLiq(p)?'E-liquide ':''}${esc(p.name)}</a><br>${extraHTML(p,n)}<span class="nicb">${esc(nicTxt(nic))}</span></div><span class="mut">${eur(priceOf(p))}</span><div class="qty"><button data-a="minus" data-id="${esc(k)}" aria-label="Moins">−</button><b>${n}</b><button data-a="plus" data-id="${esc(k)}" aria-label="Plus">+</button></div><b class="lt">${eur(priceOf(p)*n)}</b><button class="btn danger sm" data-a="del" data-id="${esc(k)}">Supprimer</button></div>`).join('')+`<div class="sum"><div><b>Récapitulatif</b><br><span class="mut">${recapTxt(items)}</span></div><div class="tot">Total : ${eur(sum)}</div><button class="btn ghost" data-a="clear">Vider le panier</button></div>`}
el.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const c=getCart(),id=b.dataset.id;
 if(b.dataset.a==='plus')c[id]=Math.min(99,(c[id]||0)+1);
 if(b.dataset.a==='minus'){c[id]=(c[id]||1)-1;if(c[id]<1)delete c[id]}
 if(b.dataset.a==='del')delete c[id];
 if(b.dataset.a==='clear'){if(!confirm('Vider tout le panier ?'))return;Object.keys(c).forEach(k=>delete c[k])}
 saveCart(c);render()});

/* ---- Étapes, récapitulatif en puces et formulaire (créé une seule fois pour ne pas perdre la saisie) ---- */
function setStep(n){document.querySelectorAll('#steps li').forEach((li,i)=>{li.className=i+1<n?'done':i+1===n?'on':''})}
function showChips(items){const c=document.getElementById('chips');if(c)c.innerHTML=items.map(x=>`<span class="chip">${x.n}× ${isLiq(x.p)?'💧 ':''}${esc(x.p.name)} ${esc(x.nic||'')}${isLiq(x.p)?' · 10 ml':' + '+x.n*RECHARGES+' recharges'}</span>`).join('')}
const FLD=(n,ic,l,t='text',x='')=>`<label class="fld"><span class="ic">${ic}</span><input name="${n}" type="${t}" placeholder=" " required maxlength="80" ${x}><span class="lb">${l}</span></label>`;
/* Moyen de contact : téléphone, e-mail ou autre (réseau + nom d'utilisateur) */
const MODES=[['tel','📱','Téléphone'],['mail','✉️','E-mail'],['autre','💬','Autre']];
const modeHTML=MODES.map(([v,ic,l],i)=>`<label class="cm"><input type="radio" name="mode" value="${v}" ${i?'':'checked'}><span><i>${ic}</i>${l}</span></label>`).join('');
checkout.innerHTML=`<div class="co"><form id="of" class="co-in"><h2>Vos informations</h2><p class="mut sub">Juste de quoi vous recontacter pour finaliser la commande.</p><div id="chips" class="chips"></div><div class="fg">${FLD('prenom','👤','Prénom','text','autocomplete="given-name"')}${FLD('nom','🪪','Nom','text','autocomplete="family-name"')}</div><p class="cm-t">Comment voulez-vous être recontacté(e) ?</p><div class="cms" role="radiogroup" aria-label="Moyen de contact">${modeHTML}</div><div data-m="tel">${FLD('tel','📱','Numéro de téléphone','tel','autocomplete="tel" pattern="[0-9 +.\\-]{8,20}" title="Numéro de téléphone valide"')}</div><div data-m="mail" hidden>${FLD('email','✉️','Adresse e-mail','email','autocomplete="email"')}</div><div data-m="autre" hidden><div class="fg">${FLD('reseau','🌐','Quel réseau ? (Snapchat, Instagram…)')}${FLD('pseudo','🙋','Votre nom d\'utilisateur')}</div></div><label class="fld ta"><span class="ic">💬</span><textarea name="message" rows="2" maxlength="500" placeholder=" "></textarea><span class="lb">Un message ? (facultatif)</span></label><label class="tg"><input type="checkbox" name="age" required><i></i><span>Je certifie avoir <b>18 ans ou plus</b>.</span></label><label class="tg"><input type="checkbox" name="rgpd" required><i></i><span>J'accepte que ces informations soient envoyées au vendeur pour qu'il me recontacte. Elles ne sont ni conservées sur le site, ni transmises à quelqu'un d'autre (<a href="informations.html" style="text-decoration:underline">données personnelles</a>).</span></label><input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off"><div class="warn">⚠️ La nicotine est très addictive. Aucun paiement n'est demandé ici.</div><p id="msg" class="err" role="alert"></p><button class="btn big" id="send">Envoyer ma demande →</button></form></div>`;
/* Affiche seulement le(s) champ(s) du moyen choisi ; seuls ceux-là sont obligatoires */
const of=document.getElementById('of');
function showMode(){const m=of.querySelector('input[name=mode]:checked').value;of.querySelectorAll('[data-m]').forEach(b=>{const on=b.dataset.m===m;b.hidden=!on;b.querySelectorAll('input').forEach(i=>i.disabled=!on)})}
of.querySelectorAll('input[name=mode]').forEach(r=>r.onchange=showMode);showMode();
const contactTxt=d=>d.mode==='tel'?'Téléphone : '+d.tel:d.mode==='mail'?'E-mail : '+d.email:'Réseau : '+d.reseau+' – utilisateur : '+d.pseudo;
document.getElementById('of').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,msg=document.getElementById('msg'),btn=document.getElementById('send'),d=Object.fromEntries(new FormData(f));
 if(!ORDER_CONFIG.accessKey){msg.textContent="L'envoi n'est pas configuré (clé manquante dans js/panier.js).";return}
 const cart=getCart(),items=cartItems(),lines=items.map(({p,nic,n})=>isLiq(p)?n+' x E-liquide '+LIQ_ML+' ml - '+p.name+' - JNR - '+nicTxt(nic)+' ('+eur(priceOf(p))+')':n+' x Puff Falcon X 28000 - '+p.name+' - JNR - '+nicTxt(nic)+' ('+eur(priceOf(p))+') + '+n*RECHARGES+' recharges '+p.name+' incluses');
 if(!lines.length){msg.textContent='Votre panier est vide.';return}
 const tot=items.reduce((a,{p,n})=>a+priceOf(p)*n,0);
 btn.disabled=true;btn.textContent='Envoi en cours…';msg.textContent='';
 try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:ORDER_CONFIG.accessKey,subject:ORDER_CONFIG.subject+' – '+d.prenom,from_name:'Site JNR',botcheck:d.botcheck?'on':'',name:d.prenom+' '+d.nom,recontacter_par:contactTxt(d),...(d.mode==='mail'?{email:d.email}:{}),commande:lines.join('\n'),total:eur(tot),message:d.message||'(aucun)',majeur_confirme:'oui',envoye_le:new Date().toLocaleString('fr-FR')})});
  const j=await r.json();if(!j.success)throw new Error(j.message);
  recordSales(cart);saveCart({});checkout.hidden=true;setStep(4);window.scrollTo({top:0,behavior:'smooth'});
  el.innerHTML='<div class="ok"><svg viewBox="0 0 52 52"><circle class="c" cx="26" cy="26" r="25" fill="none" stroke="#2fd47a" stroke-width="2"/><path class="t" fill="none" stroke="#2fd47a" stroke-width="3" d="M14 27l8 8 16-17"/></svg><h2>Demande envoyée !</h2><p class="mut">Merci '+esc(d.prenom)+' : votre commande ('+eur(tot)+') a été envoyée directement au vendeur. Il vous recontacte très vite ('+esc(contactTxt(d))+') pour la finaliser.</p><p><a class="btn" href="catalogue.html" style="margin-top:16px">Retour au catalogue</a></p></div>'}
 catch(x){msg.textContent="L'envoi a échoué : "+(x.message||'réessayez plus tard')+'.';btn.disabled=false;btn.textContent='Envoyer ma demande →'}});
render();
