const pages = ['index.html', 'portfolio.html', 'projeto-portfolio.html', 'contato.html', '404.html'];

describe('navegação, portfólio e recursos publicados', () => {
  it('publica todos os scripts e estilos necessários', () => {
    for (const file of ['theme.js', 'script.js', 'styles.css', 'favicon.ico', 'robots.txt', 'sitemap.xml']) {
      cy.request(`/${file}`).its('status').should('eq', 200);
    }
  });

  it('abre e fecha o menu mobile por link e por Escape', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.get('.nav__toggle').click().should('have.attr', 'aria-expanded', 'true');
    cy.get('.nav__menu a[href="index.html#sobre"]').click();
    cy.get('.nav__toggle').should('have.attr', 'aria-expanded', 'false');
    cy.get('.nav__toggle').click();
    cy.get('.nav__toggle').focus().trigger('keydown', { key: 'Escape' });
    cy.get('.nav__toggle').should('have.attr', 'aria-expanded', 'false').and('be.focused');
  });

  it('controla o carrossel e impede foco nos slides ocultos', () => {
    cy.visit('/portfolio.html');
    cy.get('[data-carousel-slide]').should('have.length', 4);
    cy.get('[data-project-posts] article').should('have.length', 4);
    cy.get('[data-carousel-next]').click();
    cy.get('[data-carousel-slide]').eq(1).should('have.attr', 'aria-hidden', 'false');
    cy.get('[data-carousel-slide]').first().should('have.attr', 'inert');
    cy.get('[data-carousel-next]').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-carousel-slide]').first().should('have.attr', 'aria-hidden', 'false');
    cy.get('[data-carousel-prev]').click();
    cy.get('[data-carousel-slide]').last().should('have.attr', 'aria-hidden', 'false');
    cy.get('[data-carousel-dot="0"]').click().should('have.attr', 'aria-current', 'true');
  });

  it('preserva foco visível ao mudar um slide por teclado', () => {
    cy.visit('/portfolio.html');
    cy.get('[data-carousel-slide]').first().find('a').focus().trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-carousel-dot="1"]').should('be.focused');
  });

  it('distingue projeto publicado de estudos e abre o caso documentado', () => {
    cy.visit('/portfolio.html');
    cy.get('[data-project-posts] .project-status').should('have.length', 3).first().should('contain', 'Estudo planejado');
    cy.get('[data-project-posts] a').first().click();
    cy.location('pathname').should('eq', '/projeto-portfolio.html');
    cy.get('#case-title').should('be.visible');
  });

  it('carrega estilos e navegação da 404 em um endereço aninhado', () => {
    cy.readFile('404.html').then((html) => {
      cy.intercept('GET', '**/pasta/pagina-inexistente', { statusCode: 404, body: html, headers: { 'content-type': 'text/html' } });
    });
    cy.visit('/pasta/pagina-inexistente', { failOnStatusCode: false });
    cy.get('#notfound-title').should('be.visible');
    cy.get('body').should('have.css', 'font-family').and('include', 'Inter');
    cy.get('.nav__menu a[href="/portfolio.html"]').click();
    cy.location('pathname').should('eq', '/portfolio.html');
  });

  for (const width of [320, 390, 768, 1440]) {
    for (const page of pages) {
      it(`mantém ${page} sem rolagem horizontal em ${width}px`, () => {
        cy.viewport(width, 900);
        cy.visit(`/${page}`);
        cy.get('h1').should('be.visible');
        cy.document().then((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(width));
      });
    }
  }
});

describe('conteúdo disponível quando os scripts falham', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/script.js', { body: '// script indisponível', headers: { 'content-type': 'application/javascript' } });
    cy.intercept('GET', '**/theme.js', { body: '// script indisponível', headers: { 'content-type': 'application/javascript' } });
  });
  it('mantém o perfil e a navegação mobile visíveis', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.get('#hero-title').should('be.visible');
    cy.get('.nav__menu a[href="portfolio.html"]').should('be.visible');
    cy.get('#sobre').scrollIntoView().find('h2').should('be.visible');
  });
  it('apresenta os projetos e links no HTML inicial', () => {
    cy.visit('/portfolio.html');
    cy.get('[data-project-posts] article').should('have.length', 4);
    cy.get('[data-project-posts] a').first().should('be.visible');
    cy.get('[data-carousel-next]').should('not.be.visible');
  });
});
