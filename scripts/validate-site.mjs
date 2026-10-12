import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { siteFiles } from "./site-files.mjs";
import { generatedPortfolio, readProjects } from "./project-content.mjs";

export function validateSite(root = ".") {
  root = resolve(root);
  for (const file of siteFiles) {
    if (!existsSync(resolve(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
  }
  const validateReference = (reference, source) => {
    if (!reference || /^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(reference)) return;
    const path = decodeURIComponent(reference.split(/[?#]/)[0]);
    const target = path.startsWith("/") ? resolve(root, `.${path}`) : resolve(dirname(source), path);
    if (relative(root, target).startsWith("..") || !existsSync(target)) {
      throw new Error(`Referência local inválida em ${relative(root, source)}: ${reference}`);
    }
  };
  for (const file of readdirSync(root).filter((file) => file.endsWith(".html"))) {
    const source = resolve(root, file);
    const html = readFileSync(source, "utf8");
    for (const snippet of ['lang="pt-BR"', "theme.js", "data-theme-toggle", '<main id="conteudo">']) {
      if (!html.includes(snippet)) throw new Error(`Estrutura incompleta em ${file}: ${snippet}`);
    }
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) validateReference(match[1], source);
    if (file === "404.html") {
      for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
        if (!/^(?:https?:|mailto:|tel:|data:|#|\/)/i.test(match[1])) throw new Error(`Caminho relativo na 404: ${match[1]}`);
      }
    }
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  }
  const cssFile = resolve(root, "styles.css");
  const css = readFileSync(cssFile, "utf8");
  for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) validateReference(match[1], cssFile);
  for (const project of readProjects(root)) {
    validateReference(project.image, resolve(root, "portfolio.html"));
    if (project.url) validateReference(project.url, resolve(root, "portfolio.html"));
  }
  const portfolio = readFileSync(resolve(root, "portfolio.html"), "utf8");
  if (portfolio !== generatedPortfolio(portfolio, root)) throw new Error("Projetos desatualizados. Execute npm run generate:projects.");
  console.log(`Validação estática aprovada: ${root}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) validateSite(process.argv[2]);
