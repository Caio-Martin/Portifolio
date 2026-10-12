/*
  Tema claro/escuro.

  Regras:
  1. Sem escolha salva, o site segue o tema do navegador (prefers-color-scheme)
     e acompanha mudancas do sistema em tempo real.
  2. O botao no cabecalho fixa a preferencia do visitante em localStorage.
  3. Voltar manualmente para o tema do sistema limpa a preferencia salva.

  Carregado de forma sincrona no <head> para o atributo data-theme existir
  antes da primeira pintura, evitando o flash de tela branca.
*/
(() => {
  const STORAGE_KEY = "cmn-theme";
  // acompanha a cor da topbar, primeiro elemento da pagina
  const THEME_COLORS = { light: "#0f172a", dark: "#0e1626" };

  const root = document.documentElement;
  const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");

  const systemTheme = () => (darkMedia.matches ? "dark" : "light");
  const currentTheme = () => (root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  const readPreference = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "dark" || saved === "light" ? saved : null;
    } catch (error) {
      return null;
    }
  };

  const writePreference = (theme) => {
    try {
      if (theme === systemTheme()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch (error) {
      // storage bloqueado (modo privativo): a escolha vale so para esta sessao
    }
  };

  const syncToggles = (theme) => {
    const isDark = theme === "dark";
    const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);

      const icon = button.querySelector("[data-theme-icon]");

      if (icon) {
        icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
      }
    });
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
    syncToggles(theme);
  };

  applyTheme(readPreference() || systemTheme());

  const onSystemChange = () => {
    if (!readPreference()) {
      applyTheme(systemTheme());
    }
  };

  if (typeof darkMedia.addEventListener === "function") {
    darkMedia.addEventListener("change", onSystemChange);
  } else {
    darkMedia.addListener(onSystemChange);
  }

  // mantem abas abertas do site em sincronia
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      applyTheme(readPreference() || systemTheme());
    }
  });

  const init = () => {
    syncToggles(currentTheme());

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        writePreference(next);
        applyTheme(next);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
