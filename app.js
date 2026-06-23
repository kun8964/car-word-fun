const panels = Array.from(document.querySelectorAll(".panel"));
const dots = Array.from(document.querySelectorAll(".rail-dot"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const gameCards = Array.from(document.querySelectorAll(".game-card"));
const previewTitle = document.querySelector("#game-preview-title");
const previewDesc = document.querySelector("#game-preview-desc");
const previewChips = document.querySelector("#game-preview-chips");
const gameFeedback = document.querySelector("#game-feedback");
const startGameButton = document.querySelector("[data-start-game]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentIndex = 0;
let isSnapping = false;
let touchStartY = 0;

const gameModes = {
  word: {
    title: "车车找词",
    desc: "看车模画面，选择正确的中文或英文词卡。",
    chips: ["wheel", "car", "road"],
    ready: "已选择：车车找词。先看画面，再选出正确词卡。"
  },
  parts: {
    title: "零件配对",
    desc: "把轮胎、车灯、车门等部件和名称配起来。",
    chips: ["轮胎", "车灯", "车门"],
    ready: "已选择：零件配对。把部件和名称连起来。"
  },
  route: {
    title: "路线排序",
    desc: "按启动、转弯、加速、停车，把动作顺序排对。",
    chips: ["启动", "转弯", "停车"],
    ready: "已选择：路线排序。把动作放到正确顺序。"
  },
  speaker: {
    title: "小小讲解员",
    desc: "用给定词卡讲一句作品说明，练观察和表达。",
    chips: ["我看到", "它可以", "我想改"],
    ready: "已选择：小小讲解员。用词卡讲一句自己的发现。"
  }
};

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

function setGameMode(gameKey, options = {}) {
  const mode = gameModes[gameKey] || gameModes.word;

  gameCards.forEach((card) => {
    const selected = card.dataset.game === gameKey;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });

  if (previewTitle) previewTitle.textContent = mode.title;
  if (previewDesc) previewDesc.textContent = mode.desc;
  if (gameFeedback) gameFeedback.textContent = mode.ready;
  if (startGameButton) startGameButton.dataset.startGame = gameKey;
  if (!previewChips) return;

  previewChips.replaceChildren(...mode.chips.map((chipText) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = chipText;
    chip.addEventListener("click", () => {
      if (gameFeedback) {
        gameFeedback.textContent = `你点了“${chipText}”。这一局会在当前页面内继续。`;
      }
    });
    return chip;
  }));

  if (options.reveal && window.innerWidth < 860) {
    document.querySelector(".game-preview")?.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }
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

gameCards.forEach((card) => {
  card.addEventListener("click", () => {
    setGameMode(card.dataset.game, { reveal: true });
  });
});

if (startGameButton) {
  startGameButton.addEventListener("click", () => {
    const mode = gameModes[startGameButton.dataset.startGame] || gameModes.word;
    if (gameFeedback) {
      gameFeedback.textContent = `准备开始：${mode.title}。当前版本会在这个单页里展开游戏，不跳转。`;
    }
  });
}

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
setGameMode("word");
