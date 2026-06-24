# CMS.HTML — Mini site de prise de rendez-vous (client-side)

Résumé
- Projet statique HTML/CSS/JS pour démonstration d'un flux de prise de rendez-vous.
- Stockage local : `localStorage` pour brouillons et identification, `IndexedDB` (via `directory.js`) pour un annuaire client-side.

Fichiers clés
- `login.html` — identification patient (génère un `numero_dossier` unique).
- `Rdv.html` — formulaire de rendez-vous (prérempli depuis identification ou annuaire).
- `confirmation.html` — récapitulatif et bouton `Enregistrer le profil` (sauvegarde dans IndexedDB).
- `cms.js` — logique client: gestion de `localStorage`, génération de `numero_dossier`, navigation et actions de confirmation.
- `directory.js` — wrapper IndexedDB exposant `Directory.addPatient()`, `Directory.renderDirectory()` et `Directory.addSamplePatients()`.

Tester localement
1. Ouvrez `login.html` dans votre navigateur (double-clic ou serveurs statiques).
2. Remplissez l'identification puis soumettez → un `numero_dossier` est généré et vous êtes redirigé vers `Rdv.html`.
3. Complétez le RDV et soumettez → vous arrivez sur `confirmation.html`.
4. Cliquez sur `Enregistrer le profil` pour ajouter le patient à l'annuaire IndexedDB.
5. Ouvrez les DevTools → Application → IndexedDB → `cms_directory_db` pour vérifier les entrées.

Notes d'implémentation
- `numero_dossier` est stocké via la clé `dossier_counter` dans `localStorage`; il s'incrémente à chaque identification.
- `directory.js` crée un object store `patients` et utilise `numero_dossier` comme index unique.

Prochaines améliorations possibles
- Ajouter une API serveur (PHP + SQLite dans `Codage.php/`) pour persister côté serveur.
- Gérer doublons et mise à jour de profils existants dans IndexedDB.
- Ajouter UI pour rechercher et éditer profils depuis une page dédiée.

Hébergement et évolution
- Structure recommandée :
  - `index.html` ou `Cms.html` à la racine
  - `assets/css/` pour les styles
  - `assets/js/` pour les scripts
  - `profiles.html`, `Rdv.html`, `confirmation.html`, `login.html` comme pages publiques
  - `Codage.php/` ou `api/` pour les services backend
- Pour un site statique : GitHub Pages, Netlify ou Vercel fonctionnent bien.
- Pour un site PHP : un hébergement LAMP (Linux, Apache, MySQL, PHP) ou un serveur mutualisé est adapté.
- À long terme, préférez une API séparée (`api/`) et une base SQL (`db/`) pour que le site puisse évoluer proprement.
- Pensez à sécuriser les données patients, même en local : utiliser HTTPS, validation côté serveur, et stockage chiffré si vous ajoutez un backend.

Auteur
- Généré via GitHub Copilot (GPT-5 mini) — agent local.
