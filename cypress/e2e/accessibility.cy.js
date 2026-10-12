describe('acessibilidade automática', () => {
  for (const theme of ['light', 'dark']) {
    for (const route of ['index.html', 'portfolio.html', 'projeto-portfolio.html', 'contato.html', '404.html']) {
      it(`verifica WCAG AA em ${route}, tema ${theme}`, () => {
        cy.visit(`/${route}`, { onBeforeLoad(win) {
          win.localStorage.setItem('cmn-theme', theme);
          // Audita o estado estável da página, respeitando a preferência por menos movimento.
          const matchMedia = win.matchMedia.bind(win);
          win.matchMedia = (query) => matchMedia(query === '(prefers-reduced-motion: reduce)' ? '(min-width: 0px)' : query);
        } });
        cy.readFile('node_modules/axe-core/axe.min.js').then((source) => {
          cy.window().then((win) => { win.eval(source); });
        });
        cy.window().then((win) => win.axe.run(win.document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).then((result) => {
          const violations = result.violations.map((v) => ({ id: v.id, impact: v.impact, elements: v.nodes.map((n) => n.target) }));
          expect(violations, JSON.stringify(violations)).to.deep.equal([]);
        });
      });
    }
  }
});
