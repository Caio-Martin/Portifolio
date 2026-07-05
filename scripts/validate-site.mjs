import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "portfolio.html",
  "contato.html",
  "styles.css",
  "script.js",
  "projects.js"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Required file not found: ${file}`);
  }
}

const checks = [
  {
    file: "index.html",
    includes: ['href="portfolio.html"', 'href="contato.html"']
  },
  {
    file: "portfolio.html",
    includes: ['src="projects.js"', "data-project-carousel", "data-project-posts"]
  },
  {
    file: "contato.html",
    includes: ["data-contact-form", 'href="portfolio.html"']
  }
];

for (const check of checks) {
  const content = readFileSync(check.file, "utf8");

  for (const snippet of check.includes) {
    if (!content.includes(snippet)) {
      throw new Error(`Validation failed in ${check.file}: missing ${snippet}`);
    }
  }
}

console.log("Static site validation passed.");
