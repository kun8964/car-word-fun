const panels = Array.from(document.querySelectorAll(".panel"));
const dots = Array.from(document.querySelectorAll(".rail-dot"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentIndex = 0;
let isSnapping = false;
let touchStartY = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setActive(index) {
  currentIndex = clamp(index, 0, panels.length - 1);

  panels.forEach((panel, panelIndex) => {
    const active = panelIndex === currentIndex;
    panel.classList.toggle("is-active", active);
    panel.querySelectorAll("video").forEach((video) => {
      if (active) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentIndex);
  });

  navLinks.forEach((link, linkIndex) => {
    link.classList.toggle("is-active", linkIndex === currentIndex);
  });
}

function goTo(index) {
  const next = clamp(index, 0, panels.length - 1);
  if (next === currentIndex && isSnapping) return;

  isSnapping = true;
  panels[next].scrollIntoView({
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    block: "start"
  });
  setActive(next);
  window.setTimeout(() => {
    isSnapping = false;
  }, prefersReducedMotion.matches ? 80 : 880);
}

function handleWheel(event) {
  if (prefersReducedMotion.matches || window.innerWidth < 860) return;
  if (Math.abs(event.deltaY) < 18) return;
  event.preventDefault();
  if (isSnapping) return;
  goTo(currentIndex + (event.deltaY > 0 ? 1 : -1));
}

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  if (prefersReducedMotion.matches) return;
  const delta = touchStartY - event.changedTouches[0].clientY;
  if (Math.abs(delta) < 54) return;
  goTo(currentIndex + (delta > 0 ? 1 : -1));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const rect = entry.target.getBoundingClientRect();
    const viewportMiddle = window.innerHeight / 2;
    if (entry.isIntersecting && rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
      setActive(Number(entry.target.dataset.index));
    }
  });
}, { threshold: [0, 0.25, 0.5, 0.75] });

panels.forEach((panel) => observer.observe(panel));

dots.forEach((dot) => {
  dot.addEventListener("click", () => goTo(Number(dot.dataset.target)));
});

navLinks.forEach((link, index) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    goTo(index);
  });
});

document.querySelectorAll('a[href^="#panel-"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    goTo(Number(target.dataset.index));
  });
});

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchend", handleTouchEnd, { passive: true });

window.addEventListener("scroll", () => {
  if (prefersReducedMotion.matches) return;
  const viewport = window.innerHeight || 1;
  panels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const centerDelta = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const parallax = clamp(centerDelta * -42, -42, 42);
    panel.style.setProperty("--parallax-y", `${parallax.toFixed(2)}px`);
    panel.style.setProperty("--panel-progress", `${centerDelta.toFixed(3)}`);
  });
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    goTo(currentIndex + 1);
  }
  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goTo(currentIndex - 1);
  }
  if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
  }
  if (event.key === "End") {
    event.preventDefault();
    goTo(panels.length - 1);
  }
});

setActive(0);
