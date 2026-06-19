// build-blog.js
// Génère les pages HTML statiques du blog à partir des fichiers JSON dans blog/posts/.
// Usage : node build-blog.js
// Sortie : un fichier blog/<slug>.html par article, et blog/index.html pour la liste.

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'blog', 'posts');
const OUTPUT_DIR = path.join(__dirname, 'blog');

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  const posts = files.map(f => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
    return JSON.parse(raw);
  });
  // Tri du plus récent au plus ancien
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function formatDateFR(isoDate) {
  const d = new Date(isoDate);
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}

function renderContentBlock(block) {
  if (block.type === 'h2') {
    return `<h2 class="article-h2 display">${block.text}</h2>`;
  }
  if (block.type === 'p') {
    return `<p class="article-p">${block.text}</p>`;
  }
  return '';
}

const HEAD_STYLE = `
  :root {
    --paper: #F7F4ED;
    --paper-line: #E4DECE;
    --ink: #1C2B24;
    --ink-soft: #44524A;
    --rust: #C65D3B;
    --rust-dark: #A8492C;
    --sage: #8A9B7E;
    --gold: #D4A857;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--paper); color: var(--ink); font-family: 'Inter', sans-serif;
    font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased;
  }
  body::before {
    content: ""; position: fixed; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(28,43,36,0.025) 28px);
    z-index: 1;
  }
  .display { font-family: 'Fraunces', 'Georgia', serif; font-optical-sizing: auto; }
  .mono { font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace; }
  a { color: inherit; text-decoration: none; }
  header { position: sticky; top: 0; z-index: 10; background: var(--paper); border-bottom: 1px solid var(--paper-line); }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 32px; max-width: 1140px; margin: 0 auto; }
  .logo { display: flex; align-items: baseline; gap: 10px; }
  .logo-mark {
    width: 30px; height: 30px; border: 1.5px solid var(--ink); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .logo-text { font-family: 'Fraunces', serif; font-size: 21px; font-weight: 600; letter-spacing: -0.01em; }
  .nav-links { display: flex; gap: 36px; font-size: 14.5px; color: var(--ink-soft); }
  .nav-links a:hover { color: var(--rust); }
  .nav-links .nav-cta { color: var(--ink); border-bottom: 1.5px solid var(--gold); padding-bottom: 2px; }
  @media (max-width: 720px) { .nav-links { display: none; } }
  .breadcrumb {
    max-width: 760px; margin: 0 auto; padding: 22px 32px 0;
    font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: var(--ink-soft);
    position: relative; z-index: 2;
  }
  .breadcrumb a:hover { color: var(--rust); }
  .breadcrumb .sep { margin: 0 8px; color: var(--paper-line); }
  .breadcrumb .current { color: var(--ink); }
  footer { border-top: 1px solid var(--paper-line); position: relative; z-index: 2; }
  .footer-inner {
    max-width: 1140px; margin: 0 auto; padding: 48px 32px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
  }
  .footer-left { display: flex; align-items: baseline; gap: 10px; color: var(--ink-soft); font-size: 13.5px; }
  .footer-links { display: flex; gap: 28px; font-size: 13.5px; color: var(--ink-soft); }
  .footer-links a:hover { color: var(--rust); }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--rust); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }
`;

const HEADER_HTML = `
<header>
  <div class="nav">
    <a href="../index.html" class="logo">
      <div class="logo-mark">R</div>
      <div class="logo-text">Le Registre</div>
    </a>
    <nav class="nav-links">
      <a href="../index.html#outils">Les outils</a>
      <a href="index.html">Le journal</a>
      <a href="../index.html#abonnement" class="nav-cta">Recevoir les nouveaux outils</a>
    </nav>
  </div>
</header>
`;

const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-left">
      <span class="display" style="font-size:15px; color: var(--ink);">Le Registre</span>
      <span>— outils de calcul pour indépendants</span>
    </div>
    <div class="footer-links">
      <a href="../index.html#outils">Les outils</a>
      <a href="index.html">Le journal</a>
      <a href="../mentions-legales.html">Mentions légales</a>
      <a href="#">Contact</a>
    </div>
  </div>
</footer>
`;

function renderArticlePage(post) {
  const contentHtml = post.content.map(renderContentBlock).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} — Le Registre</title>
<meta name="description" content="${post.excerpt}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
${HEAD_STYLE}

  .article-head { max-width: 760px; margin: 0 auto; padding: 34px 32px 48px; position: relative; z-index: 2; }

  .article-eyebrow {
    font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--rust); margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .article-eyebrow::before { content: ""; width: 7px; height: 7px; background: var(--rust); border-radius: 50%; display: inline-block; }

  .article-title { font-size: clamp(28px, 4.4vw, 44px); line-height: 1.14; font-weight: 500; }

  .article-meta {
    margin-top: 18px; display: flex; gap: 18px; font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px; color: var(--ink-soft);
  }

  .article-body { max-width: 760px; margin: 0 auto; padding: 0 32px 70px; position: relative; z-index: 2; }

  .article-h2 { font-size: clamp(21px, 2.6vw, 26px); font-weight: 500; margin: 40px 0 16px; line-height: 1.25; }
  .article-body .article-h2:first-child { margin-top: 0; }

  .article-p { font-size: 16px; color: var(--ink-soft); line-height: 1.75; margin-bottom: 18px; }

  .article-tool-card {
    margin-top: 48px; border: 1px solid var(--ink); padding: 28px;
    display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
  }

  .article-tool-label { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--sage); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .article-tool-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 500; }

  .article-tool-btn {
    background: var(--ink); color: var(--paper); padding: 12px 22px;
    font-size: 14px; font-weight: 500; white-space: nowrap;
  }
  .article-tool-btn:hover { background: var(--rust-dark); }

  .article-back { margin-top: 56px; }
  .article-back a { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ink-soft); }
  .article-back a:hover { color: var(--rust); }
</style>
</head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HL2LYEEQE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-HL2LYEEQE3');
</script>
<body>

${HEADER_HTML}

<div class="breadcrumb">
  <a href="../index.html">Le registre</a><span class="sep">/</span><a href="index.html">Le journal</a><span class="sep">/</span><span class="current">${post.title}</span>
</div>

<section class="article-head">
  <div class="article-eyebrow">${post.folio} · Journal</div>
  <h1 class="article-title display">${post.title}</h1>
  <div class="article-meta">
    <span>${formatDateFR(post.date)}</span>
    <span>·</span>
    <span>${post.readingTime} de lecture</span>
  </div>
</section>

<article class="article-body">
${contentHtml}

  <div class="article-tool-card">
    <div>
      <div class="article-tool-label">Outil lié à cet article</div>
      <div class="article-tool-title display">${post.relatedTool.label}</div>
    </div>
    <a href="../${post.relatedTool.href}" class="article-tool-btn">Ouvrir l'outil →</a>
  </div>

  <div class="article-back">
    <a href="index.html">← Retour au journal</a>
  </div>
</article>

${FOOTER_HTML}

</body>
</html>
`;
}

function renderIndexPage(posts) {
  const cards = posts.map(post => `
    <a href="${post.slug}.html" class="post-card">
      <div class="post-card-meta mono">${formatDateFR(post.date)} · ${post.readingTime}</div>
      <div class="post-card-title display">${post.title}</div>
      <div class="post-card-excerpt">${post.excerpt}</div>
      <div class="post-card-read">Lire l'article →</div>
    </a>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Le journal — Le Registre</title>
<meta name="description" content="Des articles de fond sur le statut d'indépendant, la fiscalité et l'épargne, en lien avec les outils du Registre.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
${HEAD_STYLE}

  .page-head { max-width: 1140px; margin: 0 auto; padding: 34px 32px 56px; position: relative; z-index: 2; }

  .page-eyebrow {
    font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--rust); margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .page-eyebrow::before { content: ""; width: 7px; height: 7px; background: var(--rust); border-radius: 50%; display: inline-block; }

  .page-title { font-size: clamp(32px, 4.6vw, 50px); line-height: 1.08; font-weight: 500; max-width: 700px; }
  .page-sub { margin-top: 18px; font-size: 17px; color: var(--ink-soft); max-width: 580px; line-height: 1.6; }

  .posts-grid {
    max-width: 1140px; margin: 0 auto; padding: 0 32px 100px;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
    position: relative; z-index: 2;
  }

  @media (max-width: 880px) { .posts-grid { grid-template-columns: 1fr; } }

  .post-card {
    border: 1px solid var(--paper-line); padding: 28px;
    display: flex; flex-direction: column; transition: border-color 0.15s ease;
  }
  .post-card:hover { border-color: var(--ink); }

  .post-card-meta { font-size: 11.5px; color: var(--sage); margin-bottom: 14px; }
  .post-card-title { font-size: 19px; font-weight: 500; line-height: 1.3; margin-bottom: 12px; }
  .post-card-excerpt { font-size: 14px; color: var(--ink-soft); line-height: 1.6; flex-grow: 1; }
  .post-card-read { margin-top: 18px; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: var(--rust); }
</style>
</head>
<body>

${HEADER_HTML}

<div class="breadcrumb">
  <a href="../index.html">Le registre</a><span class="sep">/</span><span class="current">Le journal</span>
</div>

<section class="page-head">
  <div class="page-eyebrow">Le journal</div>
  <h1 class="page-title display">Comprendre avant de calculer.</h1>
  <p class="page-sub">Des articles de fond sur le statut d'indépendant, la fiscalité et l'épargne — chacun renvoie vers l'outil du Registre qui permet de passer à l'application concrète.</p>
</section>

<div class="posts-grid">
${cards}
</div>

${FOOTER_HTML}

</body>
</html>
`;
}

function main() {
  const posts = loadPosts();

  posts.forEach(post => {
    const html = renderArticlePage(post);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${post.slug}.html`), html, 'utf-8');
    console.log(`Généré : blog/${post.slug}.html`);
  });

  const indexHtml = renderIndexPage(posts);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf-8');
  console.log(`Généré : blog/index.html (${posts.length} articles listés)`);
}

main();
