KETTY GUIDE — VERSION BILINGUE FR / EN

NOUVEAUTÉS
- écran de choix 🇫🇷 Français / 🇬🇧 English au lancement ;
- Ketty dit « Je parle français maintenant ! » ou « I speak English now! » ;
- petit sélecteur FR/EN toujours disponible sur l'écran principal ;
- toute l'interface FR/EN dans config.json ;
- textes vocaux des 7 lieux FR/EN ;
- phrases de transition Tally FR/EN ;
- voix française et anglaise réglables séparément via ?admin=1 ;
- réglages vocaux mémorisés sur la tablette ;
- formulaire Tally choisi selon la langue.

TALLY
FR déjà configuré :
https://tally.so/r/1Ae6lW

EN à créer :
dans config.json, remplacer :
"en": "URL_FORMULAIRE_TALLY_EN"
par l'URL du formulaire anglais.

L'URL reçoit :
?lieu=palais&langue=fr
ou
?lieu=palais&langue=en

À METTRE SUR GITHUB
Remplacer :
- index.html
- app.js
- style.css
- config.json

Conserver :
- dossier images/
- images/ketty.png
- images/logo-ot.png
- images/sites/*

MODE ADMIN VOIX
https://dsanial2607-art.github.io/ketty-guide/?admin=1
Le ⚙ reste invisible sur l'adresse normale.

IMPORTANT
Le fichier config.json fourni est du JSON valide.
Les phrases vocales sont sur une seule chaîne JSON, sans retours à la ligne invalides.
