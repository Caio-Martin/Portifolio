describe("portfolio site", () => {
  it("loads the home page and main navigation", () => {
    cy.visit("/");
    cy.contains("Caio Martin").should("be.visible");
    cy.get('a[href="portfolio.html"]').first().should("exist");
    cy.get('a[href="contato.html"]').first().should("exist");
  });

  it("loads the portfolio page", () => {
    cy.visit("/portfolio.html");
    cy.contains("Portfólio em carrossel").should("be.visible");
    cy.get("[data-project-carousel]").should("exist");
    cy.get("[data-project-posts]").should("exist");
  });

  it("loads the contact page", () => {
    cy.visit("/contato.html");
    cy.contains("Vamos conversar").should("be.visible");
    cy.get("[data-contact-form]").should("exist");
  });
});
