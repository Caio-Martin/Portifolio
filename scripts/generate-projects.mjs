import { readFileSync, writeFileSync } from "node:fs";
import { generatedPortfolio } from "./project-content.mjs";

const file = "portfolio.html";
writeFileSync(file, generatedPortfolio(readFileSync(file, "utf8")));
console.log("Conteúdo estático dos projetos atualizado.");
