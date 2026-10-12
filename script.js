const copyrightYear = document.getElementById("copyright-year");
if (copyrightYear) copyrightYear.textContent = copyrightYear.textContent.replace(/\d{4}/, String(new Date().getFullYear()));

const navToggle = document.querySelector(".nav__toggle");
const navMenu = document.querySelector(".nav__menu");
const toTop = document.querySelector(".to-top");
const siteHeader = document.querySelector(".site-header");

if (navToggle && navMenu) {
  document.documentElement.classList.add("nav-ready");
  const setMenu = (open) => {
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    navToggle.innerHTML = `<i class="bi ${open ? "bi-x-lg" : "bi-list"}" aria-hidden="true"></i>`;
  };
  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("is-open")));
  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
      setMenu(false);
      navToggle.focus();
    }
  });
}

const updateScrollState = () => {
  toTop?.classList.toggle("is-visible", window.scrollY > 520);
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};
window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();
toTop?.addEventListener("click", () => window.scrollTo({
  top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
}));

// O conteúdo é visível por padrão. Apenas elementos fora da tela recebem animação.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("reveal--pending");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((item) => {
    if (item.getBoundingClientRect().top >= window.innerHeight) {
      item.classList.add("reveal--pending");
      observer.observe(item);
    }
  });
}

const setupProjectCarousel = () => {
  const shell = document.querySelector("[data-project-carousel]");
  const track = shell?.querySelector("[data-carousel-track]");
  const dots = shell?.querySelector("[data-carousel-dots]");
  const slides = Array.from(track?.querySelectorAll("[data-carousel-slide]") || []);
  if (!shell || !track || !dots || !slides.length) return;

  const dotButtons = slides.map((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.carouselDot = String(index);
    button.setAttribute("aria-label", `Mostrar ${slide.querySelector("h3").textContent}`);
    dots.append(button);
    return button;
  });
  const announcement = document.createElement("p");
  announcement.className = "sr-only";
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  shell.append(announcement);
  let currentIndex = 0;
  const updateCarousel = (nextIndex, announce = true) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, index) => {
      const hidden = index !== currentIndex;
      slide.setAttribute("aria-hidden", String(hidden));
      slide.inert = hidden;
    });
    dotButtons.forEach((dot, index) => dot.setAttribute("aria-current", String(index === currentIndex)));
    if (announce) announcement.textContent = `${currentIndex + 1} de ${slides.length}: ${slides[currentIndex].querySelector("h3").textContent}`;
  };
  shell.querySelector("[data-carousel-prev]")?.addEventListener("click", () => updateCarousel(currentIndex - 1));
  shell.querySelector("[data-carousel-next]")?.addEventListener("click", () => updateCarousel(currentIndex + 1));
  dotButtons.forEach((dot, index) => dot.addEventListener("click", () => updateCarousel(index)));
  shell.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const focusedSlide = event.target.closest("[data-carousel-slide]");
      updateCarousel(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
      if (focusedSlide) shell.querySelector(`[data-carousel-dot="${currentIndex}"]`).focus();
    }
  });
  shell.classList.add("carousel-ready");
  updateCarousel(0, false);
};

const setupContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  const feedback = document.querySelector("[data-form-feedback]");
  if (!form) return;
  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = false;
  let sending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    data.set("subject", `Contato pelo portfólio: ${data.get("assunto")}`);
    data.set("telefone", data.get("telefone") || "Não informado");
    data.set("from_name", data.get("nome"));
    data.set("replyto", data.get("email"));
    sending = true;
    submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    feedback.textContent = "Enviando sua mensagem...";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Falha no envio");
      feedback.textContent = "Mensagem enviada com sucesso! Retorno em breve.";
      form.reset();
    } catch {
      feedback.textContent = "Não foi possível enviar agora. Tente novamente ou entre em contato por e-mail ou WhatsApp.";
    } finally {
      clearTimeout(timeout);
      sending = false;
      submitButton.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
};
setupProjectCarousel();
setupContactForm();
