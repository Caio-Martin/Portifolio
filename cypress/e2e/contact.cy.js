describe('formulário de contato', () => {
  const endpoint = 'https://api.web3forms.com/submit';
  const fillForm = () => {
    cy.get('[name="nome"]').type('Pessoa de Teste');
    cy.get('[name="email"]').type('teste@example.com');
    cy.get('[name="mensagem"]').type('Mensagem simulada para validar o formulário.');
  };
  const submit = () => cy.get('button[type="submit"]').click();

  it('valida campos obrigatórios antes de enviar', () => {
    const request = cy.stub().as('request');
    cy.intercept('POST', endpoint, request);
    cy.visit('/contato.html');
    submit();
    cy.get('[name="nome"]').then(($input) => expect($input[0].validity.valueMissing).to.be.true);
    cy.get('@request').should('not.have.been.called');
  });

  it('envia os campos, bloqueia duplicação e limpa o formulário no sucesso', () => {
    cy.intercept('POST', endpoint, { statusCode: 200, body: { success: true }, delay: 500 }).as('submit');
    cy.visit('/contato.html');
    fillForm();
    submit();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('[data-contact-form]').should('have.attr', 'aria-busy', 'true');
    cy.wait('@submit').its('request.body').should('include', {
      nome: 'Pessoa de Teste', email: 'teste@example.com', from_name: 'Pessoa de Teste',
      replyto: 'teste@example.com', telefone: 'Não informado'
    });
    cy.get('[data-form-feedback]').should('contain', 'Mensagem enviada com sucesso');
    cy.get('[name="nome"]').should('have.value', '');
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('@submit.all').should('have.length', 1);
  });

  for (const [name, response] of [
    ['erro HTTP', { statusCode: 500, body: { success: true } }],
    ['recusa da API', { statusCode: 200, body: { success: false } }],
    ['resposta inválida', { statusCode: 200, body: 'não é JSON' }],
    ['falha de rede', { forceNetworkError: true }]
  ]) {
    it(`preserva a mensagem e permite nova tentativa após ${name}`, () => {
      cy.intercept('POST', endpoint, response).as('submit');
      cy.visit('/contato.html');
      fillForm();
      submit();
      cy.get('[data-form-feedback]').should('contain', 'Não foi possível enviar');
      cy.get('[name="mensagem"]').should('have.value', 'Mensagem simulada para validar o formulário.');
      cy.get('button[type="submit"]').should('not.be.disabled');
      cy.get('[data-contact-form]').should('not.have.attr', 'aria-busy');
    });
  }

  it('interrompe uma requisição que excede o tempo limite', () => {
    cy.visit('/contato.html', {
      onBeforeLoad(win) {
        win.fetch = (_url, options) => new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new Error('timeout')));
        });
      }
    });
    cy.clock();
    fillForm();
    submit();
    cy.tick(15001);
    cy.get('[data-form-feedback]').should('contain', 'Não foi possível enviar');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});
