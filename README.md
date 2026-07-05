# Portfólio Profissional - Caio Martin

Este projeto é um site estático de portfólio profissional criado em HTML, CSS e JavaScript puro.

## O que foi feito

Foram criadas três páginas principais:

- `index.html`: página inicial do portfólio.
- `portfolio.html`: página separada para mostrar os projetos em carrossel e em grade de posts.
- `contato.html`: página de contato destacada, com canais diretos e formulário.

Também foram criados/atualizados os arquivos compartilhados:

- `styles.css`: estilos globais, responsividade, layout das páginas, carrossel, cards e formulário.
- `script.js`: comportamento do menu mobile, botão de voltar ao topo, animações de entrada, carrossel e formulário de contato.
- `projects.js`: fonte de dados dos projetos exibidos no carrossel e na grade do portfólio.

## Estrutura dos arquivos

```text
portifolio-caiomartin/
├── index.html
├── portfolio.html
├── contato.html
├── styles.css
├── script.js
├── projects.js
└── README.md
```

## Como abrir o site

Como o projeto é estático, não precisa de servidor, build ou instalação de dependências.

Abra qualquer um destes arquivos no navegador:

```text
index.html
portfolio.html
contato.html
```

Alguns recursos externos, como fontes, ícones e imagens remotas, dependem de internet para aparecer exatamente como planejado.

## CI/CD com GitHub Pages, SonarQube Cloud e Cypress

O projeto agora está estruturado para uma esteira com qualidade, release e deploy.

Arquivos da pipeline:

```text
.github/workflows/pr-develop-quality.yml
.github/workflows/pr-main-release-check.yml
.github/workflows/main-deploy-pages.yml
```

### Fluxo proposto

```text
feature branch
-> PR para Develop
-> validacao + Cypress local
-> merge aprovado para Develop
-> PR para main
-> validacao + Cypress local
-> merge para main
-> SonarQube Cloud na branch principal
-> deploy no GitHub Pages
-> Cypress no endpoint publicado apos deploy
```

### 1. PR para Develop

Workflow:

```text
pr-develop-quality.yml
```

Esse workflow roda quando um pull request aponta para `Develop`.

Ele executa:

- instalacao das dependencias Node;
- validacao estrutural do site;
- Cypress local servindo o projeto estatico.

Se qualquer etapa falhar, o PR nao deve ser aprovado para merge.

### 2. PR para main

Workflow:

```text
pr-main-release-check.yml
```

Esse workflow roda quando um pull request aponta para `main`.

Ele executa:

- instalacao das dependencias;
- validacao estrutural;
- Cypress local servindo o site estatico.

A ideia aqui e validar se a release candidata para `main` continua funcionando antes do merge.

### 3. Push em main

Workflow:

```text
main-deploy-pages.yml
```

Esse workflow roda quando houver `push` no branch `main`.

Ele executa:

1. validacao do projeto;
2. analise SonarQube Cloud na branch principal;
3. deploy no GitHub Pages;
4. smoke test com Cypress no endpoint retornado pelo proprio deploy.

Assim a esteira nao para no ato de publicar: ela confirma tambem que o site subiu e respondeu.

### Configuracoes necessarias no GitHub

Em:

```text
Settings > Pages
```

configure:

- `Source`: `GitHub Actions`

Em:

```text
Settings > Secrets and variables > Actions
```

adicione o secret:

- `SONAR_TOKEN`

Observacao:

- no plano atual do SonarQube Cloud, a analise foi mantida apenas na `main`, porque branch analysis de PR nao esta disponivel.

### Arquivos de apoio da automacao

Foram adicionados tambem:

- `package.json`: scripts e dependencias do Cypress;
- `cypress.config.js`: Cypress local;
- `cypress.live.config.js`: Cypress apontando para endpoint publicado;
- `cypress/e2e/site.cy.js`: smoke test das paginas principais;
- `scripts/validate-site.mjs`: validacao estrutural do site;
- `sonar-project.properties`: configuracao base da analise do SonarQube Cloud.

Observacao sobre coverage no SonarQube Cloud:

- como este projeto e um site estatico sem relatorio formal de cobertura publicado para o Sonar, os arquivos front-end foram excluidos da metrica de coverage no `sonar-project.properties`;
- assim o Quality Gate da `main` continua avaliando a analise do projeto sem bloquear o deploy por falta de instrumentacao de cobertura.

## Como as páginas se comunicam

As páginas se comunicam por links HTML comuns. Não existe roteador, framework ou backend.

Fluxo principal:

```text
index.html
├── linka para portfolio.html
├── linka para contato.html
└── linka para seções internas como #sobre, #competencias, #processo

portfolio.html
├── linka para index.html
├── linka para contato.html
└── carrega projects.js para montar os posts de projetos

contato.html
├── linka para index.html
├── linka para portfolio.html
└── usa mailto para abrir o aplicativo de e-mail do visitante
```

Todas as páginas usam os mesmos arquivos `styles.css` e `script.js`, por isso mantêm o mesmo visual, menu, rodapé, animações e comportamento responsivo.

## Página inicial: `index.html`

A página inicial apresenta o perfil profissional de Caio Martin.

Principais seções:

- Topbar com e-mail e LinkedIn.
- Menu principal com links para Sobre, Competências, Portfólio, Processo e Contato.
- Hero principal com chamada profissional.
- Cards de áreas de atuação: Web, Dados e Processos.
- Seção Sobre.
- Seção Competências.
- Seção Projetos com chamada para a página de portfólio.
- Seção Processo.
- CTA final para a página de contato.
- Rodapé com navegação rápida.

Os botões principais da home foram atualizados para apontar para:

```html
portfolio.html
contato.html
```

## Página de portfólio: `portfolio.html`

Esta página foi criada para funcionar como uma vitrine separada de projetos.

Ela contém:

- Hero próprio da página.
- Breadcrumb simples: Início > Portfólio.
- Carrossel de projetos em destaque.
- Grade com todos os posts de projetos.
- CTA para contato.

O carrossel e a grade não são escritos manualmente no HTML. Eles são gerados pelo JavaScript com base no conteúdo do arquivo `projects.js`.

No `portfolio.html`, os scripts são carregados nesta ordem:

```html
<script src="projects.js" defer></script>
<script src="script.js" defer></script>
```

Essa ordem é importante porque `projects.js` cria a lista de projetos antes de `script.js` tentar montar o carrossel.

## Dados dos projetos: `projects.js`

O arquivo `projects.js` contém o array `window.portfolioProjects`.

Cada item representa um post/projeto:

```js
{
  title: "Portfólio profissional",
  category: "Página estática",
  year: "2026",
  summary: "Página institucional para apresentar perfil, competências, projetos e canais de contato de forma responsiva.",
  image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  url: "index.html",
  cta: "Abrir página",
  tags: ["HTML", "CSS", "Responsivo"]
}
```

Para adicionar um novo projeto ao carrossel, basta copiar um bloco desses e alterar:

- `title`: nome do projeto.
- `category`: tipo do projeto.
- `year`: ano, status ou contexto.
- `summary`: descrição curta.
- `image`: imagem do projeto.
- `url`: link para a página, demo, repositório ou estudo de caso.
- `cta`: texto do botão.
- `tags`: tecnologias ou temas.

Se o campo `url` ficar como `"#"`, o botão aparece visualmente, mas fica desativado para indicar que o link ainda precisa ser configurado.

## Página de contato: `contato.html`

A página de contato foi criada inspirada na referência indicada, com uma estrutura mais destacada do que um simples bloco no fim da home.

Ela contém:

- Hero próprio da página.
- Breadcrumb: Início > Contato.
- Lista de canais diretos:
  - Email.
  - WhatsApp.
  - LinkedIn.
  - Link para o portfólio.
- Cards auxiliares de atendimento e retorno.
- Formulário de contato.
- CTA para acessar o portfólio.

O formulário não envia dados para servidor. Ele usa JavaScript para montar um link `mailto:` e abrir o aplicativo de e-mail do visitante com a mensagem preenchida.

Campos do formulário:

- Nome.
- Email.
- Telefone ou WhatsApp.
- Assunto.
- Mensagem.

## JavaScript: `script.js`

O arquivo `script.js` controla os comportamentos compartilhados do site.

Funções principais:

- Abre e fecha o menu mobile.
- Fecha o menu mobile ao clicar em um link.
- Mostra o botão "voltar ao topo" depois de rolar a página.
- Aplica animações de entrada nos elementos com a classe `.reveal`.
- Monta o carrossel de projetos usando `window.portfolioProjects`.
- Monta a grade de posts usando os mesmos dados do carrossel.
- Processa o formulário de contato e abre o e-mail com `mailto:`.

Principais seletores usados pelo JavaScript:

```text
.nav__toggle
.nav__menu
.to-top
.reveal
[data-project-carousel]
[data-carousel-track]
[data-carousel-dots]
[data-project-posts]
[data-contact-form]
[data-form-feedback]
```

## CSS: `styles.css`

O arquivo `styles.css` centraliza toda a identidade visual.

Ele define:

- Cores principais.
- Tipografia.
- Layout da topbar, menu e rodapé.
- Hero da home.
- Heros internos de portfólio e contato.
- Cards de competências, projetos, posts e contato.
- Carrossel.
- Formulário.
- Responsividade para tablet e celular.
- Estados de foco, hover e botão desativado.

As páginas usam as mesmas classes de base para manter consistência visual.

## Dependências externas

O projeto não usa pacotes instalados, mas carrega alguns recursos via CDN:

- Google Fonts:
  - Inter.
  - Sora.
- Bootstrap Icons.
- Imagens remotas do Unsplash.

Se quiser deixar o site 100% independente de internet, o próximo passo seria baixar fontes, ícones essenciais e imagens para pastas locais.

## Dados que ainda devem ser personalizados

Alguns dados foram deixados como placeholder e devem ser trocados pelos dados reais:

- Email: `contato@caiomartin.dev`.
- LinkedIn: `https://www.linkedin.com/in/caiomartin/`.
- WhatsApp: `https://wa.me/5511999999999`.
- Imagens dos projetos.
- Links reais dos projetos em `projects.js`.
- Textos específicos sobre experiência, formação, serviços e cases reais.

## Como adicionar uma nova página de projeto

Uma forma simples de evoluir o site é criar páginas individuais para cada projeto.

Exemplo:

```text
projeto-dashboard.html
projeto-automacao.html
projeto-landing-page.html
```

Depois, basta atualizar o campo `url` no `projects.js`:

```js
url: "projeto-dashboard.html"
```

Assim o post do carrossel passa a abrir a página detalhada daquele projeto.

## Validação feita

Foi feita uma checagem de sintaxe do JavaScript:

```text
node --check script.js
```

O arquivo passou sem erros de sintaxe.

## Resumo do fluxo do usuário

O visitante pode entrar pela home, entender o perfil profissional, abrir o portfólio para ver os projetos em formato de posts e então ir para contato.

Fluxo esperado:

```text
Home
→ Portfólio
→ Projeto ou post
→ Contato
```

Também é possível acessar contato diretamente pelo menu ou pelos CTAs distribuídos nas páginas.
