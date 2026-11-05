JNR-SITE – site de démonstration (HTML / CSS / JavaScript)
=========================================================
OUVRIR LE SITE : décompressez le dossier, puis double-cliquez sur index.html (aucun serveur nécessaire).

PAGES
- index.html        accueil, présentation, aperçu des goûts, contact (fictif)
- catalogue.html    17 goûts, recherche instantanée + bouton Réinitialiser
- produit.html      fiche d'un goût (produit.html?id=strawberry-kiwi)
- panier.html       sélection (localStorage) : quantités, suppression, vidage + formulaire de validation qui envoie la demande par e-mail. Aucun paiement.
- admin.html        administration de DÉMO : ajouter / renommer / décrire / changer l'image / supprimer / réordonner
- informations.html avertissements nicotine, interdiction aux mineurs

IDENTIFIANTS ADMIN (démo) : admin / jnr2026 – modifiables en haut de js/admin.js.
ATTENTION : cette connexion est faite en JavaScript côté navigateur : elle ne protège RIEN. Ne l'utilisez jamais sur un vrai site de vente.

DONNÉES : tout est stocké dans le navigateur (localStorage) : catalogue modifié (jnr_catalog) et sélection (jnr_cart).
Bouton « Restaurer le catalogue d'origine » dans l'admin pour tout remettre à zéro.

MODIFIER LE CONTENU
- Liste des 17 goûts, couleurs, descriptions : tableau RAW en haut de js/main.js (nom|couleur1|couleur2|description).
- Illustrations : images/produits/<nom-du-goût>.svg (remplaçables par vos propres images du même nom).
- Couleurs générales : variables :root dans css/style.css.

NOTES
- Les illustrations sont originales et non officielles.
- Avertissements santé présents sur le site : à conserver. En France, la publicité pour les produits de vapotage/nicotinés est très encadrée : vérifiez la réglementation avant toute publication en ligne.

ENVOI DES COMMANDES PAR E-MAIL (Web3Forms)
1. Allez sur web3forms.com, saisissez VOTRE adresse e-mail : une clé d'accès (access key) vous est envoyée.
2. Ouvrez js/panier.js et remplacez COLLE_TA_CLE_ICI par cette clé (en haut du fichier).
3. Mettez le site en ligne, faites une commande test : le mail arrive sur votre adresse.
