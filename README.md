# Le Registre — structure du site

Site statique, aucun serveur requis. Tout fonctionne en ouvrant les fichiers HTML directement, ou en hébergeant le dossier sur Vercel / Netlify / Cloudflare Pages (glisser-déposer le dossier suffit).

## Arborescence

```
index.html                  → page d'accueil
calculateur-tjm.html        → Fol. 01
portage-salarial.html       → Fol. 02
calculateur-epargne.html    → Fol. 03
simulateur-mensualites.html → Fol. 04
mentions-legales.html       → page légale (à compléter avec tes vraies infos)

blog/
  index.html                → liste des articles (généré, ne pas éditer à la main)
  <slug>.html                → une page par article (générée, ne pas éditer à la main)
  posts/
    <slug>.json              → le contenu source de chaque article (à éditer)

build-blog.js                → script qui génère blog/index.html et blog/<slug>.html
                                à partir des fichiers blog/posts/*.json
```

## Ajouter un nouvel article

1. Crée un fichier `blog/posts/mon-nouvel-article.json` sur ce modèle :

```json
{
  "slug": "mon-nouvel-article",
  "title": "Titre de l'article",
  "excerpt": "Résumé en une ou deux phrases, affiché sur les listes.",
  "date": "2026-07-01",
  "readingTime": "5 min",
  "folio": "B-04",
  "relatedTool": { "href": "calculateur-tjm.html", "label": "Simulateur de TJM" },
  "content": [
    { "type": "p", "text": "Premier paragraphe." },
    { "type": "h2", "text": "Un sous-titre" },
    { "type": "p", "text": "Encore un paragraphe." }
  ]
}
```

   - `slug` : doit être identique au nom du fichier (sans `.json`), utilisé dans l'URL.
   - `relatedTool.href` : le fichier outil vers lequel l'article renvoie (doit exister à la racine).
   - `content` : une liste de blocs, chacun de type `"p"` (paragraphe) ou `"h2"` (sous-titre).

2. Lance le script de génération :

```bash
node build-blog.js
```

3. Ça régénère automatiquement `blog/index.html` (la liste, triée par date décroissante) et crée `blog/mon-nouvel-article.html`.

4. Si tu veux que ce nouvel article apparaisse aussi dans le bloc "Le journal" sur la page d'accueil (`index.html`), il faut ajouter une carte à la main dans la section `id="journal"` de `index.html` (le script ne touche pas à la home, seulement au dossier `blog/`).

## Prérequis pour lancer le script

Node.js doit être installé sur ta machine (n'importe quelle version récente fonctionne, aucune dépendance npm n'est utilisée). Vérifie avec :

```bash
node --version
```

## Ce qui reste à faire avant mise en ligne

- Compléter `mentions-legales.html` : nom, statut juridique, SIREN, adresse, hébergeur choisi (champs entre crochets `[...]`).
- Brancher le formulaire d'inscription (section "Recevoir les nouveaux outils") à un vrai service d'emailing (Mailchimp, Brevo...), il ne fait rien pour l'instant.
- Si tu ajoutes de la pub ou de l'affiliation : mettre à jour la section "Cookies" des mentions légales, et ajouter un bandeau de consentement si nécessaire.
