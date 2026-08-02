const copyrightYear = document.getElementById("copyright-year");

if (copyrightYear) {
  copyrightYear.textContent = copyrightYear.textContent.replace(/\d{4}/, String(new Date().getFullYear()));
}

const navToggle = document.querySelector(".nav__toggle");
const navMenu = document.querySelector(".nav__menu");
const toTop = document.querySelector(".to-top");
const revealItems = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".site-header");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.innerHTML = isOpen
      ? '<i class="bi bi-x-lg" aria-hidden="true"></i>'
      : '<i class="bi bi-list" aria-hidden="true"></i>';
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    }
  });
}

if (toTop) {
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("is-visible", window.scrollY > 520);
  }, { passive: true });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (siteHeader) {
  window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  }, { passive: true });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character]));

const projectLinkAttributes = (url) => ({
  href: url,
  target: /^https?:\/\//i.test(url) ? ' target="_blank"' : "",
  rel: /^https?:\/\//i.test(url) ? ' rel="noopener"' : ""
});

const renderProjectCta = (project, btnClass) => {
  if (!project.url || project.url === "#") {
    return '<span class="project-status"><i class="bi bi-hourglass-split" aria-hidden="true"></i> Em elaboração</span>';
  }

  const link = projectLinkAttributes(project.url);

  return `<a class="btn ${btnClass}" href="${escapeHtml(link.href)}"${link.target}${link.rel}>${escapeHtml(project.cta || "Abrir projeto")} <i class="bi bi-arrow-right-short" aria-hidden="true"></i></a>`;
};

const renderProjectCarousel = () => {
  const projects = window.portfolioProjects || [];
  const shell = document.querySelector("[data-project-carousel]");
  const track = document.querySelector("[data-carousel-track]");
  const dots = document.querySelector("[data-carousel-dots]");
  const postsGrid = document.querySelector("[data-project-posts]");

  if (!projects.length) {
    return;
  }

  if (track && dots && shell) {
    track.innerHTML = projects.map((project, index) => {
      const tags = (project.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

      return `
        <article class="carousel-slide" aria-label="${escapeHtml(project.title)}" data-carousel-slide>
          <div class="carousel-slide__media" style="background-image:url('${escapeHtml(project.image)}')" role="img" aria-label="Imagem do projeto ${escapeHtml(project.title)}"></div>
          <div class="carousel-slide__body">
            <div class="carousel-slide__meta">
              <span>${escapeHtml(project.category)}</span>
              <span>${escapeHtml(project.year)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary)}</p>
            <ul class="carousel-slide__tags">${tags}</ul>
            ${renderProjectCta(project, "btn--primary")}
          </div>
        </article>
      `;
    }).join("");

    dots.innerHTML = projects.map((project, index) => `
      <button type="button" data-carousel-dot="${index}" aria-label="Mostrar ${escapeHtml(project.title)}"></button>
    `).join("");

    let currentIndex = 0;
    const slides = Array.from(track.querySelectorAll("[data-carousel-slide]"));
    const dotButtons = Array.from(dots.querySelectorAll("[data-carousel-dot]"));

    const updateCarousel = (nextIndex) => {
      currentIndex = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, index) => {
        const isHidden = index !== currentIndex;
        slide.setAttribute("aria-hidden", String(isHidden));
        slide.querySelectorAll("a[href], button").forEach((focusable) => {
          if (isHidden) {
            focusable.setAttribute("tabindex", "-1");
          } else {
            focusable.removeAttribute("tabindex");
          }
        });
      });

      dotButtons.forEach((dot, index) => {
        dot.setAttribute("aria-current", String(index === currentIndex));
      });
    };

    shell.querySelector("[data-carousel-prev]")?.addEventListener("click", () => updateCarousel(currentIndex - 1));
    shell.querySelector("[data-carousel-next]")?.addEventListener("click", () => updateCarousel(currentIndex + 1));

    dotButtons.forEach((dot, index) => {
      dot.addEventListener("click", () => updateCarousel(index));
    });

    shell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        updateCarousel(currentIndex - 1);
      }

      if (event.key === "ArrowRight") {
        updateCarousel(currentIndex + 1);
      }
    });

    updateCarousel(0);
  }

  if (postsGrid) {
    postsGrid.innerHTML = projects.map((project) => {
      const tags = (project.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

      return `
        <article class="post-card">
          <div class="post-card__image" style="background-image:url('${escapeHtml(project.image)}')" role="img" aria-label="Imagem do projeto ${escapeHtml(project.title)}"></div>
          <div class="post-card__body">
            <div class="post-card__meta">
              <span>${escapeHtml(project.category)}</span>
              <span>${escapeHtml(project.year)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary)}</p>
            <ul class="post-card__tags">${tags}</ul>
            ${renderProjectCta(project, "btn--outline")}
          </div>
        </article>
      `;
    }).join("");
  }
};

const setupContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  const feedback = document.querySelector("[data-form-feedback]");

  if (!form) {
    return;
  }

  const submitButton = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    data.set("subject", `Contato pelo portfólio: ${data.get("assunto")}`);
    data.set("telefone", data.get("telefone") || "Não informado");
    data.set("from_name", data.get("nome"));
    data.set("replyto", data.get("email"));

    if (submitButton) {
      submitButton.disabled = true;
    }
    if (feedback) {
      feedback.textContent = "Enviando sua mensagem...";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(Object.fromEntries(data))
      });
      const result = await response.json();

      if (result.success) {
        if (feedback) {
          feedback.textContent = "Mensagem enviada com sucesso! Retorno em breve.";
        }
        form.reset();
      } else {
        throw new Error(result.message || "Falha no envio");
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent = "Não foi possível enviar agora. Tente novamente ou use o e-mail/WhatsApp ao lado.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
};

renderProjectCarousel();
setupContactForm();
