import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, realpathSync, rmSync } from "node:fs";
import { resolve, relative } from "node:path";
import { siteFiles } from "./site-files.mjs";
import { generatedPortfolio } from "./project-content.mjs";
import { validateSite } from "./validate-site.mjs";

const destination = resolve("dist");
if (relative(resolve("."), destination) !== "dist") throw new Error("Destino de build inválido.");
if (existsSync(destination)) {
  if (realpathSync(destination) !== destination) throw new Error("O destino de build não pode ser um link.");
  rmSync(destination, { recursive: true });
}
mkdirSync(destination, { recursive: true });
for (const file of siteFiles) cpSync(file, resolve(destination, file), { recursive: true });
writeFileSync(resolve(destination, "portfolio.html"), generatedPortfolio(readFileSync("portfolio.html", "utf8")));
validateSite(destination);
console.log("Pacote de publicação criado e validado em dist/.");
