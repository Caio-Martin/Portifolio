# Portfólio Profissional - Caio Martin

Site estático de portfólio profissional (infraestrutura, cloud e cybersecurity), feito em HTML, CSS e JavaScript puro, publicado no GitHub Pages com domínio próprio (`caiomartin.dev`).

## Estrutura dos arquivos

```text
portifolio-caiomartin/
├── index.html            # página inicial
├── portfolio.html        # vitrine de projetos (carrossel + grade)
├── contato.html          # página de contato
├── 404.html               # página de erro 404 personalizada
├── styles.css             # estilos globais
├── script.js               # comportamento compartilhado (menu, carrossel, formulário...)
├── projects.js             # dados dos projetos exibidos no portfólio
├── robots.txt               # diretivas para crawlers
├── sitemap.xml              # mapa do site para buscadores
├── favicon.ico               # ícone de fallback na raiz
├── CNAME                      # domínio customizado do GitHub Pages
├── lib/img/                    # imagens do site (já otimizadas)
├── scripts/validate-site.mjs    # validação estrutural usada no CI
├── cypress/e2e/site.cy.js        # smoke tests
├── cypress.config.js              # Cypress local
├── cypress.live.config.js          # Cypress contra o site publicado
└── .github/workflows/               # pipelines de CI/CD
```

## Como abrir o site

Como o projeto é estático, não precisa de build nem de dependências instaladas para visualizar:

```text
index.html
portfolio.html
contato.html
404.html
```

Para rodar com um servidor local (recomendado, evita bloqueios de `fetch`/CORS ao testar o formulário de contato):

```bash
npm install
npm run serve
```

Isso sobe o site em `http://127.0.0.1:4173`.

Fontes e ícones (Google Fonts e Bootstrap Icons) são carregados via CDN e dependem de internet para aparecer exatamente como planejado. As demais imagens já estão locais em `lib/img/`.

## Páginas

### `index.html`

Página inicial com o perfil profissional: topbar, menu, hero, áreas de atuação, seção Sobre, Competências, prévia de Projetos e CTA para contato. Inclui dados estruturados (`application/ld+json`, schema `Person`) para melhorar como o site aparece em buscadores.

### `portfolio.html`

Vitrine dedicada aos projetos, com um carrossel em destaque e uma grade completa logo abaixo. Ambos são montados via JavaScript a partir de `projects.js`. Os scripts são carregados nesta ordem, que é importante:

```html
<script src="projects.js" defer></script>
<script src="script.js" defer></script>
```

### `contato.html`

Canais diretos (email, WhatsApp, LinkedIn) e um formulário de contato.

### `404.html`

Página de erro personalizada (mesmo header/footer do site), servida automaticamente pelo GitHub Pages quando uma URL não existe. Tem `<meta name="robots" content="noindex, follow">` para não ser indexada.

## Dados dos projetos: `projects.js`

O arquivo expõe `window.portfolioProjects`, um array de objetos usados tanto no carrossel quanto na grade do `portfolio.html`:

```js
{
  title: "Portfólio profissional",
  category: "Página estática",
  year: "2026",
  summary: "Página institucional para apresentar perfil, competências, projetos e canais de contato de forma responsiva.",
  image: "lib/img/hero-home.jpg",
  url: "index.html",
  cta: "Abrir página",
  tags: ["HTML", "CSS", "Responsivo"]
}
```

Para adicionar um projeto novo, copie um bloco desses e ajuste `title`, `category`, `year`, `summary`, `image`, `url`, `cta` e `tags`.

Quando um projeto ainda não tem link real, use `status: "in-progress"` no lugar de `url`/`cta`. O JavaScript detecta esse campo e mostra um selo "Em elaboração" em vez de um botão, sem parecer um link quebrado:

```js
{
  title: "Cluster de virtualização Proxmox",
  status: "in-progress",
  // ...
}
```

## Formulário de contato

O formulário em `contato.html` envia os dados via `fetch` para a API do [Web3Forms](https://web3forms.com), sem precisar de backend próprio. Tem um campo honeypot (`botcheck`) contra spam automatizado. A lógica de envio e o feedback visual (`[data-form-feedback]`) ficam em `script.js`.

## JavaScript: `script.js`

Comportamentos compartilhados por todas as páginas:

- Abre/fecha o menu mobile e fecha ao clicar em um link.
- Mostra o botão "voltar ao topo" após rolar a página, e aplica sombra no header ao rolar.
- Anima a entrada dos elementos com a classe `.reveal` via `IntersectionObserver`.
- Atualiza o ano do copyright automaticamente (`#copyright-year`).
- Monta o carrossel e a grade de projetos a partir de `window.portfolioProjects`, incluindo o selo "Em elaboração" para projetos sem link.
- Controla o carrossel (setas, dots, teclado) e remove do foco por teclado os links dos slides ocultos, evitando foco invisível para quem navega via Tab.
- Processa o envio do formulário de contato para o Web3Forms.

Principais seletores usados:

```text
.nav__toggle
.nav__menu
.to-top
.site-header
.reveal
#copyright-year
[data-project-carousel]
[data-carousel-track]
[data-carousel-dots]
[data-project-posts]
[data-contact-form]
[data-form-feedback]
```

## CSS: `styles.css`

Centraliza a identidade visual: cores, tipografia, layout de topbar/menu/rodapé, heros de cada página, cards de competências/projetos/posts, carrossel, formulário e responsividade (breakpoints em 900px e 560px). Todas as páginas compartilham as mesmas classes de base.

## SEO e metadados

- `robots.txt` e `sitemap.xml` na raiz, apontando para `https://caiomartin.dev`.
- `<link rel="canonical">` e `og:url`/`og:image`/`og:title`/`og:description` em cada página.
- Dados estruturados (`Person`) no `index.html`.
- `favicon.ico` na raiz como fallback, além do `<link rel="icon">` em PNG.
- `404.html` com `noindex` para não ser indexada por engano.

## Imagens

Todas as imagens usadas pelo site ficam em `lib/img/` e já foram otimizadas (redimensionadas e recomprimidas) para reduzir o peso da página sem perda perceptível de qualidade. A imagem de hero de cada página é pré-carregada via `<link rel="preload" as="image" fetchpriority="high">` para melhorar o carregamento inicial.

## Dependências externas

O projeto não usa pacotes de runtime, mas carrega via CDN:

- Google Fonts: Inter e Sora.
- Bootstrap Icons.

## CI/CD com GitHub Pages e Cypress

Pipelines em `.github/workflows/`:

```text
pr-develop-quality.yml     # roda em PR para Develop
pr-main-release-check.yml  # roda em PR para main
main-deploy-pages.yml      # roda em push para main
```

Fluxo:

```text
feature branch
→ PR para Develop → validação + Cypress local
→ merge para Develop
→ PR para main → validação + Cypress local
→ merge/push para main
→ deploy no GitHub Pages
→ Cypress contra o endpoint publicado
```

`pr-develop-quality.yml` e `pr-main-release-check.yml` instalam as dependências, rodam `npm run validate` e um smoke test do Cypress servindo o site localmente (`npm run serve`).

`main-deploy-pages.yml` valida o projeto, monta um artefato só com os arquivos que devem ir ao ar (HTML, CSS, JS, `lib/`, `robots.txt`, `sitemap.xml`, `favicon.ico`, `404.html`, `CNAME`), publica no GitHub Pages e roda o Cypress contra o site já publicado (`npm run cypress:live`).

Configuração necessária no GitHub: em `Settings > Pages`, `Source` deve estar como `GitHub Actions`.

### Scripts do `package.json`

```bash
npm run serve         # sobe o site em http://127.0.0.1:4173
npm run validate       # checa sintaxe do JS e a estrutura do site (scripts/validate-site.mjs)
npm run cypress:open    # abre o Cypress em modo interativo
npm run cypress:local    # roda o smoke test contra o site local
npm run cypress:live      # roda o smoke test contra o site publicado
```

## O que ainda pode evoluir

- **Analytics**: o site ainda não tem nenhuma ferramenta de analytics conectada (precisa de conta/token em algum serviço como Cloudflare Web Analytics, Plausible ou GA4).
- **Projetos-modelo**: alguns itens em `projects.js` estão marcados como `status: "in-progress"` ("Em elaboração") até terem um link real (repositório, case, demonstração).
