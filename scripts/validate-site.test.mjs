import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, unlinkSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { siteFiles } from './site-files.mjs';
import { validateSite } from './validate-site.mjs';
import { readProjects, renderProjects } from './project-content.mjs';

function withFixture(check) {
  const directory = mkdtempSync(resolve(tmpdir(), 'portfolio-validation-'));
  try {
    for (const file of siteFiles) cpSync(file, resolve(directory, file), { recursive: true });
    check(directory);
  } finally {
    if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith('portfolio-validation-')) throw new Error('Diretório temporário inválido.');
    rmSync(directory, { recursive: true });
  }
}

test('valida todos os arquivos necessários para publicação', () => withFixture((root) => validateSite(root)));
test('rejeita pacote sem theme.js', () => withFixture((root) => {
  unlinkSync(resolve(root, 'theme.js'));
  assert.throws(() => validateSite(root), /theme\.js/);
}));
test('rejeita referência a imagem ausente', () => withFixture((root) => {
  const file = resolve(root, 'index.html');
  writeFileSync(file, readFileSync(file, 'utf8').replace('src="lib/img/hero-home.jpg"', 'src="lib/img/ausente.jpg"'));
  assert.throws(() => validateSite(root), /ausente\.jpg/);
}));
test('rejeita caminho relativo na página 404', () => withFixture((root) => {
  const file = resolve(root, '404.html');
  writeFileSync(file, readFileSync(file, 'utf8').replace('href="/styles.css"', 'href="styles.css"'));
  assert.throws(() => validateSite(root), /Caminho relativo na 404/);
}));
test('rejeita HTML gerado que não corresponde à fonte dos projetos', () => withFixture((root) => {
  const file = resolve(root, 'portfolio.html');
  writeFileSync(file, readFileSync(file, 'utf8').replace('<h3>Portfólio profissional</h3>', '<h3>Texto desatualizado</h3>'));
  assert.throws(() => validateSite(root), /Projetos desatualizados/);
}));
test('escapa conteúdo textual dos projetos antes de gerar HTML', () => {
  const projects = readProjects();
  projects[0].title = '<script>alert("teste")</script>';
  const { posts } = renderProjects(projects);
  assert.ok(posts.includes('&lt;script&gt;'));
  assert.ok(!posts.includes('<script>'));
});
