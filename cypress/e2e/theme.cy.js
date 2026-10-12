describe("tema claro/escuro", () => {
  const STORAGE_KEY = "cmn-theme";

  it("define um tema logo no carregamento", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "data-theme").and("match", /^(light|dark)$/);
  });

  it("alterna e persiste a preferencia do visitante", () => {
    cy.visit("/");

    cy.get("html")
      .invoke("attr", "data-theme")
      .then((initial) => {
        const expected = initial === "dark" ? "light" : "dark";

        cy.get("[data-theme-toggle]").first().click();
        cy.get("html").should("have.attr", "data-theme", expected);
        cy.get("[data-theme-toggle]").first().should("have.attr", "aria-pressed", String(expected === "dark"));

        cy.reload();
        cy.get("html").should("have.attr", "data-theme", expected);
      });
  });

  it("aplica a preferencia salva em todas as paginas", () => {
    cy.visit("/portfolio.html", {
      onBeforeLoad(win) {
        win.localStorage.setItem(STORAGE_KEY, "dark");
      }
    });

    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.get("body").should("have.css", "background-color", "rgb(11, 18, 32)");

    cy.visit("/contato.html");
    cy.get("html").should("have.attr", "data-theme", "dark");
  });
});
