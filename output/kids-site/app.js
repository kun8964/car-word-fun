const ASSET_BASE = "./assets/vehicles/";

const categoryLabels = {
  all: "全部车车",
  race: "速度车",
  city: "城市车",
  construction: "工程车",
  adventure: "冒险车",
  moto: "两轮水上",
  special: "特别交通"
};

const vehicles = [
  { id: "cat797", zh: "CAT 797 矿用自卸卡车", en: "haul truck", category: "construction", file: "CAT 797矿用自卸卡车.png", fact: "它能在矿区搬运很重的石头。" },
  { id: "ram1500", zh: "RAM 1500 皮卡", en: "pickup truck", category: "adventure", file: "RAM 1500 Rebel.png", fact: "皮卡可以装工具，也能去野外。" },
  { id: "willys", zh: "Willys MB 吉普", en: "jeep", category: "adventure", file: "Willys MB 二战军用吉普.png", fact: "吉普车适合走不平的路。" },
  { id: "vespa", zh: "Vespa 小踏板", en: "scooter", category: "moto", file: "vespa150.png", fact: "小踏板适合城市短途出行。" },
  { id: "sany-crane", zh: "三一汽车起重机", en: "crane truck", category: "construction", file: "三一重工汽车起重机.png", fact: "起重机可以把重物吊起来。" },
  { id: "sany-pump", zh: "三一混凝土泵车", en: "concrete pump", category: "construction", file: "三一重工混凝土泵车.png", fact: "泵车能把混凝土送到高处。" },
  { id: "ae86", zh: "丰田 AE86", en: "coupe", category: "race", file: "丰田AE86.png", fact: "它是一辆轻巧的小跑车。" },
  { id: "tracked", zh: "履带装甲车", en: "tracked vehicle", category: "special", file: "主战坦克.png", fact: "履带能帮助车辆通过泥地和不平的路。" },
  { id: "double-bus", zh: "伦敦双层巴士", en: "double decker bus", category: "city", file: "伦敦双层巴士.png", fact: "双层巴士可以坐更多乘客。" },
  { id: "krupp", zh: "斗轮挖掘机", en: "bucket wheel excavator", category: "construction", file: "克虏伯288斗轮挖掘机.png", fact: "它有巨大的轮子来挖土。" },
  { id: "countach", zh: "兰博基尼 Countach", en: "supercar", category: "race", file: "兰博基尼Countach.png", fact: "楔形车身看起来像飞船。" },
  { id: "liebherr", zh: "利勃海尔矿用自卸卡车", en: "mining truck", category: "construction", file: "利勃海尔T282B矿用自卸卡车.png", fact: "它的轮子比很多人还高。" },
  { id: "belaz", zh: "别拉斯 75710", en: "giant truck", category: "construction", file: "别拉斯75710矿用自卸卡车.png", fact: "这是一辆巨型矿用卡车。" },
  { id: "bulldozer", zh: "卡特彼勒推土机", en: "bulldozer", category: "construction", file: "卡特彼勒D11推土机.png", fact: "推土机前面有一块大铲板。" },
  { id: "beetle", zh: "大众甲壳虫", en: "beetle car", category: "city", file: "大众甲壳虫.png", fact: "圆圆的外形像一只小甲壳虫。" },
  { id: "g63", zh: "奔驰 G63", en: "off road car", category: "adventure", file: "奔驰G63.png", fact: "方方的车身适合冒险路线。" },
  { id: "slk", zh: "奔驰 SLK", en: "roadster", category: "race", file: "奔驰slk.png", fact: "敞篷车可以打开车顶。" },
  { id: "a4", zh: "奥迪 A4", en: "sedan", category: "city", file: "奥迪A4.png", fact: "轿车常见于城市道路。" },
  { id: "r8", zh: "奥迪 R8", en: "sports car", category: "race", file: "奥迪R8.png", fact: "跑车通常很低很宽。" },
  { id: "fw14b", zh: "威廉姆斯 FW14B", en: "formula car", category: "race", file: "威廉姆斯FW14B.png", fact: "方程式赛车有很大的前翼。" },
  { id: "pc8000", zh: "小松 PC8000", en: "excavator", category: "construction", file: "小松PC8000.png", fact: "挖掘机有长长的机械臂。" },
  { id: "ninja", zh: "川崎忍者 400", en: "motorcycle", category: "moto", file: "川崎 忍者400.png", fact: "摩托车只有两个轮子。" },
  { id: "bgp001", zh: "布朗 GP BGP001", en: "race car", category: "race", file: "布朗GP BGP001.png", fact: "赛车会使用空气动力学外形。" },
  { id: "seadoo-gti", zh: "喜度 GTI 水上摩托", en: "jet ski", category: "moto", file: "庞巴迪喜度GTI.png", fact: "水上摩托在水面行驶。" },
  { id: "seadoo-rxt", zh: "喜度 RXT-X 水上摩托", en: "water scooter", category: "moto", file: "庞巴迪喜度RXT-X 400.png", fact: "它适合在安全水域体验速度。" },
  { id: "h1", zh: "悍马 H1", en: "hummer", category: "adventure", file: "悍马H1.png", fact: "宽大的车身让它很有力量感。" },
  { id: "digger", zh: "挖挖机", en: "digger", category: "construction", file: "挖挖机.png", fact: "挖挖机能挖土，也能帮忙修路。" },
  { id: "etype", zh: "捷豹 E-Type", en: "classic car", category: "race", file: "捷豹E-Type.png", fact: "经典车有很特别的线条。" },
  { id: "gtr", zh: "日产 GTR", en: "fast car", category: "race", file: "日产GTR.png", fact: "它是一辆很受欢迎的性能车。" },
  { id: "cub", zh: "本田幼兽", en: "little bike", category: "moto", file: "本田幼兽.png", fact: "轻便小车适合短距离移动。" },
  { id: "ducati", zh: "杜卡迪 V4", en: "sport bike", category: "moto", file: "杜卡迪v4.png", fact: "运动摩托车外形很锋利。" },
  { id: "w07", zh: "梅赛德斯 W07", en: "formula racer", category: "race", file: "梅赛德斯W07 Hybrid.png", fact: "它属于方程式赛车家族。" },
  { id: "byd-bus", zh: "比亚迪公交车", en: "electric bus", category: "city", file: "比亚迪公交车.png", fact: "公交车可以把大家一起送到目的地。" },
  { id: "ferrari156", zh: "法拉利 156 F1", en: "formula one", category: "race", file: "法拉利 156 F1.png", fact: "老赛车有像雪茄一样的车身。" },
  { id: "f2004", zh: "法拉利 F2004", en: "grand prix car", category: "race", file: "法拉利 F2004.png", fact: "这是一辆红色方程式赛车。" },
  { id: "250gto", zh: "法拉利 250GTO", en: "classic racer", category: "race", file: "法拉利250GTO.png", fact: "经典赛车常常有圆润车身。" },
  { id: "312t", zh: "法拉利 312T", en: "historic race car", category: "race", file: "法拉利312T.png", fact: "它是很有历史感的赛车。" },
  { id: "f458", zh: "法拉利 458", en: "red sports car", category: "race", file: "法拉利458.png", fact: "红色跑车很容易被孩子记住。" },
  { id: "f40", zh: "法拉利 F40", en: "super sports car", category: "race", file: "法拉利F40.png", fact: "尾翼能帮助车在高速时更稳定。" },
  { id: "boeing777", zh: "波音 777", en: "airplane", category: "special", file: "波音777.png", fact: "飞机不是汽车，但也是重要交通工具。" },
  { id: "greyhound", zh: "灰狗旅游巴士", en: "coach bus", category: "city", file: "灰狗旅游巴士.png", fact: "长途巴士适合城市之间旅行。" },
  { id: "modelt", zh: "福特 T 型车", en: "model t", category: "city", file: "福特T型车.png", fact: "它是汽车历史里很重要的车型。" },
  { id: "mustang", zh: "福特野马", en: "mustang", category: "race", file: "福特野马.png", fact: "野马车名来自奔跑的马。" },
  { id: "rb7", zh: "红牛 RB7", en: "formula racing car", category: "race", file: "红牛RB7.png", fact: "赛车上有许多空气导流部件。" },
  { id: "lotus79a", zh: "莲花 79 经典赛车", en: "lotus race car", category: "race", file: "莲花79-01.png", fact: "经典赛车有醒目的涂装。" },
  { id: "lotus79b", zh: "莲花 79 黑金赛车", en: "black race car", category: "race", file: "莲花79-02.png", fact: "深色赛车适合做高级展示卡。" },
  { id: "es8", zh: "蔚来 ES8", en: "electric suv", category: "city", file: "蔚来ES8.png", fact: "电动车用电池提供能量。" },
  { id: "transport", zh: "越野运输车", en: "utility truck", category: "adventure", file: "越野运输车.png", fact: "运输车可以帮忙搬运物资。" },
  { id: "sidecar", zh: "边三轮", en: "sidecar", category: "moto", file: "边三轮.png", fact: "边三轮比普通摩托多一个座舱。" },
  { id: "mclarenf1", zh: "迈凯轮 F1", en: "mclaren f1", category: "race", file: "迈凯轮F1.png", fact: "它是很多车迷喜欢的超级跑车。" },
  { id: "mp4", zh: "迈凯轮 MP4", en: "silver race car", category: "race", file: "迈凯轮MP4.png", fact: "银白赛车看起来很像小火箭。" },
  { id: "rs01", zh: "雷诺 RS01", en: "yellow race car", category: "race", file: "雷诺RS01.png", fact: "鲜亮颜色能帮助孩子做颜色识别。" }
];

const stationData = [
  { title: "认车馆", label: "看图选名字", copy: "从大图开始，让孩子先熟悉车车的轮廓、用途和中文名称。", vehicle: "beetle", bg: "#fff2d0" },
  { title: "字母加油站", label: "听发音学 ABC", copy: "把英文首字母做成加油能量，孩子点一下就能听到单词。", vehicle: "byd-bus", bg: "#e8f5ff" },
  { title: "工程车工地", label: "用途配对", copy: "挖掘机去工地，巴士去车站，孩子在场景里理解车辆用途。", vehicle: "digger", bg: "#fff4dc" },
  { title: "安全斑马线", label: "交通规则", copy: "红灯停、绿灯行、斑马线慢慢走，把安全意识做成小游戏。", vehicle: "double-bus", bg: "#ecfff4" },
  { title: "修车小工坊", label: "零件认知", copy: "轮子、车灯、车身颜色和贴纸，拼一辆自己的学习车车。", vehicle: "g63", bg: "#f1f3ff" },
  { title: "徽章领奖台", label: "轻收集", copy: "完成关卡点亮车车，不做焦虑排行，保留持续探索动力。", vehicle: "f458", bg: "#fff0ee" }
];

const gamePoolIds = ["beetle", "byd-bus", "digger", "double-bus", "f458", "g63", "r8", "willys", "vespa", "pc8000", "boeing777", "modelt"];
const gamePool = vehicles.filter((vehicle) => gamePoolIds.includes(vehicle.id));

const state = {
  mode: "recognition",
  round: 0,
  score: 0,
  current: null,
  answered: false,
  unlocked: new Set(JSON.parse(localStorage.getItem("cheche_unlocked") || "[]")),
  filter: "all"
};

function $(selector) {
  return document.querySelector(selector);
}

function imagePath(file) {
  return encodeURI(ASSET_BASE + file);
}

function byId(id) {
  return vehicles.find((vehicle) => vehicle.id === id) || vehicles[0];
}

function sample(list, count, excludeId) {
  const pool = list.filter((item) => item.id !== excludeId);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count);
}

function shuffle(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function renderHero() {
  $("#hero-car-main").src = imagePath(byId("f458").file);
  $("#hero-car-a").src = imagePath(byId("byd-bus").file);
  $("#hero-car-b").src = imagePath(byId("digger").file);
}

function renderShelf() {
  const shelfVehicles = ["beetle", "digger", "byd-bus", "f458", "willys"].map(byId);
  const shelf = $("#shelf-rail");
  shelf.innerHTML = shelfVehicles.map((vehicle, index) => `
    <article class="shelf-card" style="--i:${index}; --tilt:${index % 2 ? "1.5deg" : "-1deg"}">
      <img src="${imagePath(vehicle.file)}" alt="${vehicle.zh}">
      <div>
        <strong>${vehicle.zh}</strong>
        <small>${vehicle.en}</small>
      </div>
    </article>
  `).join("");
}

function renderStations() {
  const rail = $("#track-rail");
  rail.innerHTML = stationData.map((station, index) => {
    const vehicle = byId(station.vehicle);
    return `
      <article class="station-card" style="--station-bg:${station.bg}">
        <div class="station-visual">
          <img src="${imagePath(vehicle.file)}" alt="${vehicle.zh}">
        </div>
        <div>
          <span class="station-number">${index + 1}</span>
          <h3>${station.title}</h3>
          <p>${station.copy}</p>
          <span class="station-pill">${station.label}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderFilters() {
  const filterRow = $("#filter-row");
  filterRow.innerHTML = Object.entries(categoryLabels).map(([key, label]) => `
    <button class="filter-chip ${state.filter === key ? "is-active" : ""}" type="button" data-filter="${key}">
      ${label}
    </button>
  `).join("");

  filterRow.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderGarage();
    });
  });
}

function renderGarage() {
  const garage = $("#garage-grid");
  const shown = state.filter === "all" ? vehicles : vehicles.filter((vehicle) => vehicle.category === state.filter);
  garage.innerHTML = shown.map((vehicle, index) => {
    const unlocked = state.unlocked.has(vehicle.id);
    return `
      <article class="vehicle-card" style="--i:${index}">
        <div class="vehicle-image-wrap">
          <span class="vehicle-badge">${unlocked ? "已点亮" : categoryLabels[vehicle.category]}</span>
          <img src="${imagePath(vehicle.file)}" alt="${vehicle.zh}">
        </div>
        <div>
          <strong>${vehicle.zh}</strong>
          <small>${vehicle.en}</small>
        </div>
      </article>
    `;
  }).join("");
  $("#game-unlocked").textContent = String(state.unlocked.size);
}

function saveUnlocked() {
  localStorage.setItem("cheche_unlocked", JSON.stringify([...state.unlocked]));
}

function updateGameHeader() {
  $("#game-mode-label").textContent = state.mode === "recognition" ? "车车认认看" : "字母加油站";
  $("#game-progress").textContent = `${state.round + 1} / 6`;
  $("#game-score").textContent = String(state.score);
  $("#game-unlocked").textContent = String(state.unlocked.size);
}

function startRound() {
  state.answered = false;
  state.current = gamePool[Math.floor(Math.random() * gamePool.length)];
  updateGameHeader();

  const questionImage = $("#question-image");
  const letterDisplay = $("#letter-display");
  questionImage.src = imagePath(state.current.file);
  questionImage.alt = state.current.zh;
  questionImage.style.transform = "translateY(0) scale(1)";

  if (state.mode === "recognition") {
    letterDisplay.hidden = true;
    $("#question-title").textContent = "这辆车车叫什么？";
    $("#question-hint").textContent = "选择正确的中文名称。";
    renderOptions(shuffle([state.current, ...sample(gamePool, 3, state.current.id)]), "zh");
  } else {
    const initial = state.current.en.charAt(0).toUpperCase();
    letterDisplay.hidden = false;
    letterDisplay.textContent = initial;
    $("#question-title").textContent = `哪个车车英文以 ${initial} 开头？`;
    $("#question-hint").textContent = `听一听 ${state.current.en}，再找对应车车。`;
    const distractors = sample(gamePool.filter((vehicle) => vehicle.en.charAt(0).toUpperCase() !== initial), 3, state.current.id);
    renderOptions(shuffle([state.current, ...distractors]), "en");
  }

  $("#game-feedback").className = "game-feedback";
  $("#game-feedback").textContent = "选择一个答案开始。";
}

function renderOptions(options, mode) {
  const optionGrid = $("#option-grid");
  optionGrid.innerHTML = options.map((vehicle) => `
    <button class="option-button" type="button" data-id="${vehicle.id}">
      <img src="${imagePath(vehicle.file)}" alt="${vehicle.zh}">
      <span>
        <strong>${mode === "zh" ? vehicle.zh : vehicle.en}</strong>
        <small>${categoryLabels[vehicle.category]}</small>
      </span>
    </button>
  `).join("");

  optionGrid.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => handleAnswer(button));
  });
}

function handleAnswer(button) {
  if (state.answered) return;
  state.answered = true;

  const correct = button.dataset.id === state.current.id;
  const feedback = $("#game-feedback");
  const buttons = [...document.querySelectorAll(".option-button")];

  buttons.forEach((item) => {
    if (item.dataset.id === state.current.id) item.classList.add("is-correct");
    if (item === button && !correct) item.classList.add("is-wrong");
  });

  if (correct) {
    state.score += 10;
    state.unlocked.add(state.current.id);
    saveUnlocked();
    feedback.className = "game-feedback success";
    feedback.textContent = `答对了。${state.current.fact}`;
    $("#question-image").style.transform = "translateY(-8px) scale(1.04)";
  } else {
    feedback.className = "game-feedback retry";
    feedback.textContent = `再试一条路线。正确答案是 ${state.current.zh}。`;
  }

  updateGameHeader();
  renderGarage();
}

function nextRound() {
  state.round = (state.round + 1) % 6;
  startRound();
}

function setMode(mode) {
  state.mode = mode;
  state.round = 0;
  state.score = 0;
  document.querySelectorAll(".mode-button").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  startRound();
}

function speakCurrentWord() {
  if (!("speechSynthesis" in window) || !state.current) {
    $("#game-feedback").className = "game-feedback retry";
    $("#game-feedback").textContent = "当前浏览器没有可用的发音功能。";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(state.current.en);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function setupGame() {
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  $("#next-button").addEventListener("click", nextRound);
  $("#sound-button").addEventListener("click", speakCurrentWord);
  startRound();
}

function setupParallax() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  function update() {
    const y = window.scrollY || 0;
    document.documentElement.style.setProperty("--scroll-y", y.toFixed(0));

    const section = $(".track-town-section");
    const sticky = $(".track-sticky");
    const rail = $("#track-rail");
    const viewport = $(".track-viewport");
    const canHorizontal = window.innerWidth > 1080 && !reducedMotion.matches;

    if (section && sticky && rail && viewport && canHorizontal) {
      const rect = section.getBoundingClientRect();
      const maxMove = Math.max(0, rail.scrollWidth - viewport.clientWidth + 160);
      const total = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      rail.style.transform = `translate3d(${-progress * maxMove}px, 0, 0)`;
    } else if (rail) {
      rail.style.transform = "none";
    }

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);
}

function init() {
  renderHero();
  renderShelf();
  renderStations();
  renderFilters();
  renderGarage();
  setupGame();
  setupParallax();
}

document.addEventListener("DOMContentLoaded", init);
