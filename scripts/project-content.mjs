import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { resolve } from "node:path";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

export function readProjects(root = ".") {
  const context = { window: {} };
  runInNewContext(readFileSync(resolve(root, "projects.js"), "utf8"), context, { timeout: 1000 });
  const projects = context.window.portfolioProjects;
  if (!Array.isArray(projects) || !projects.length) throw new Error("A lista de projetos está vazia.");
  for (const project of projects) {
    for (const key of ["title", "category", "year", "summary", "image"]) {
      if (typeof project[key] !== "string" || !project[key].trim()) throw new Error(`Campo inválido: ${key}`);
    }
    if (!Array.isArray(project.tags)) throw new Error(`Tags inválidas: ${project.title}`);
    if (project.url && !/^(?:https:\/\/[^\s"'<>]+|[\w-]+\.html(?:#[\w-]+)?)$/.test(project.url)) throw new Error(`Link inválido: ${project.title}`);
  }
  return projects;
}

function projectCta(project, className) {
  if (!project.url) return '<span class="project-status"><i class="bi bi-hourglass-split" aria-hidden="true"></i> Estudo planejado</span>';
  const external = project.url.startsWith("https://") ? ' target="_blank" rel="noopener"' : "";
  return `<a class="btn ${className}" href="${escapeHtml(project.url)}"${external}>${escapeHtml(project.cta || "Conhecer projeto")} <i class="bi bi-arrow-right-short" aria-hidden="true"></i></a>`;
}

export function renderProjects(projects) {
  const render = (project, carousel) => {
    const prefix = carousel ? "carousel-slide" : "post-card";
    const tags = project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
    return `<article class="${prefix}"${carousel ? ` aria-label="${escapeHtml(project.title)}" data-carousel-slide` : ""}>
  <img class="${prefix}${carousel ? "__media" : "__image"}" src="${escapeHtml(project.image)}" width="1600" height="1068" alt="${escapeHtml(project.imageAlt || project.title)}" loading="lazy" decoding="async">
  <div class="${prefix}__body">
    <div class="${prefix}__meta"><span>${escapeHtml(project.category)}</span><span>${escapeHtml(project.year)}</span></div>
    <h3>${escapeHtml(project.title)}</h3>
    <p>${escapeHtml(project.summary)}</p>
    <ul class="${prefix}__tags">${tags}</ul>
    ${projectCta(project, carousel ? "btn--primary" : "btn--outline")}
  </div>
</article>`;
  };
  return {
    carousel: projects.map((project) => render(project, true)).join("\n"),
    posts: projects.map((project) => render(project, false)).join("\n")
  };
}

export function generatedPortfolio(html, root = ".") {
  const content = renderProjects(readProjects(root));
  for (const [key, value] of Object.entries(content)) {
    const pattern = new RegExp(`(<!-- projects:${key}:start -->)[\\s\\S]*?(<!-- projects:${key}:end -->)`);
    if (!pattern.test(html)) throw new Error(`Marcadores de geração ausentes: ${key}`);
    html = html.replace(pattern, (_, start, end) => `${start}\n${value}\n${end}`);
  }
  return html;
}
