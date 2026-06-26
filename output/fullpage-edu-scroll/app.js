const vehicles = [
  {
    id: "audi-a4",
    image: "./assets/vehicles/audi-a4.png",
    english: "Audi A4",
    chinese: "奥迪 A4",
    category: "City Cars",
    use: "A city car can take people around town.",
    fact: "It has four doors, so a family can get in easily.",
    rarity: "Common I"
  },
  {
    id: "ferrari-458",
    image: "./assets/vehicles/ferrari-458.png",
    english: "Ferrari 458",
    chinese: "法拉利 458",
    category: "Sports Cars",
    use: "A sports car is built to move quickly.",
    fact: "Its low body helps it stay steady on the road.",
    rarity: "Rare III"
  },
  {
    id: "redbull-rb7",
    image: "./assets/vehicles/redbull-rb7.png",
    english: "Red Bull RB7",
    chinese: "红牛 RB7",
    category: "Race Cars",
    use: "A race car runs on a track.",
    fact: "Big wings push the car down so it can turn fast.",
    rarity: "Super IV"
  },
  {
    id: "excavator",
    image: "./assets/vehicles/excavator.png",
    english: "Excavator",
    chinese: "挖掘机",
    category: "Construction Vehicles",
    use: "An excavator digs soil and moves rocks.",
    fact: "Its long arm works like a strong scoop.",
    rarity: "Nice II"
  },
  {
    id: "ducati-v4",
    image: "./assets/vehicles/ducati-v4.png",
    english: "Ducati V4",
    chinese: "杜卡迪 V4",
    category: "Motorcycles",
    use: "A motorcycle carries one or two riders.",
    fact: "It balances on two wheels.",
    rarity: "Rare III"
  },
  {
    id: "boeing-777",
    image: "./assets/vehicles/boeing-777.png",
    english: "Boeing 777",
    chinese: "波音 777",
    category: "Aircraft",
    use: "An airplane flies people far away.",
    fact: "Its wings lift it into the sky.",
    rarity: "Super IV"
  },
  {
    id: "benz-g63",
    image: "./assets/vehicles/benz-g63.png",
    english: "Mercedes G63",
    chinese: "奔驰 G63",
    category: "Off-road Vehicles",
    use: "An off-road car can drive on rough ground.",
    fact: "Big tires help it climb and grip.",
    rarity: "Rare III"
  },
  {
    id: "beetle",
    image: "./assets/vehicles/beetle.png",
    english: "Beetle",
    chinese: "大众甲壳虫",
    category: "Classic Cars",
    use: "A classic car shows old design ideas.",
    fact: "Its round shape is easy to remember.",
    rarity: "Nice II"
  },
  {
    id: "byd-bus",
    image: "./assets/vehicles/byd-bus.png",
    english: "BYD Bus",
    chinese: "比亚迪公交车",
    category: "Public Transport",
    use: "A bus carries many people together.",
    fact: "Taking a bus can mean fewer cars on the road.",
    rarity: "Common I"
  },
  {
    id: "willys-mb",
    image: "./assets/vehicles/willys-mb.png",
    english: "Willys MB",
    chinese: "军用吉普",
    category: "Special Vehicles",
    use: "A special vehicle helps with hard jobs.",
    fact: "A jeep can be small, strong, and simple.",
    rarity: "Rare III"
  },
  {
    id: "ferrari-f40",
    image: "./assets/vehicles/ferrari-f40.png",
    english: "Ferrari F40",
    chinese: "法拉利 F40",
    category: "Sports Cars",
    use: "A super sports car is made for speed.",
    fact: "Air flows over its body to help it move smoothly.",
    rarity: "Super IV"
  },
  {
    id: "crane",
    image: "./assets/vehicles/crane.png",
    english: "Truck Crane",
    chinese: "汽车起重机",
    category: "Construction Vehicles",
    use: "A crane lifts heavy things high up.",
    fact: "Its long boom can reach places people cannot.",
    rarity: "Nice II"
  }
];

const zones = [
  {
    id: "city",
    title: "城市街区",
    english: "City",
    copy: "Taxi, bus and daily cars live here.",
    vehicleId: "audi-a4",
    bg: "linear-gradient(145deg, #eef6ff, #dff0ff)"
  },
  {
    id: "track",
    title: "赛车场",
    english: "Race Track",
    copy: "Fast cars wait for a counting mission.",
    vehicleId: "redbull-rb7",
    bg: "linear-gradient(145deg, #fff3d3, #ffe8b5)"
  },
  {
    id: "site",
    title: "工地",
    english: "Work Site",
    copy: "Diggers and cranes are ready to help.",
    vehicleId: "excavator",
    bg: "linear-gradient(145deg, #fff0df, #ffe2d1)"
  },
  {
    id: "airport",
    title: "机场",
    english: "Airport",
    copy: "Aircraft cards hide near the runway.",
    vehicleId: "boeing-777",
    bg: "linear-gradient(145deg, #e9fbff, #d9f6ff)"
  },
  {
    id: "garage",
    title: "车库",
    english: "Garage",
    copy: "Classic and special vehicles rest here.",
    vehicleId: "beetle",
    bg: "linear-gradient(145deg, #f1efff, #e6e0ff)"
  }
];

const missionVehicles = ["redbull-rb7", "ferrari-458", "ferrari-f40", "audi-a4", "benz-g63", "byd-bus"];
const targetIds = new Set(["redbull-rb7", "ferrari-458", "ferrari-f40"]);
const initialUnlocked = ["audi-a4", "redbull-rb7", "excavator"];
const storageKey = "vehicle-card-collection-state";

const screens = Array.from(document.querySelectorAll(".screen"));
const navTabs = Array.from(document.querySelectorAll(".nav-tab"));
const mapGrid = document.querySelector("#map-grid");
const vehicleField = document.querySelector("#vehicle-field");
const missionCount = document.querySelector("#mission-count");
const progressFill = document.querySelector("#progress-fill");
const feedbackCard = document.querySelector("#feedback-card");
const mathPanel = document.querySelector("#math-panel");
const answerRow = document.querySelector("#answer-row");
const garageGrid = document.querySelector("#garage-grid");
const filterRow = document.querySelector("#filter-row");
const starCount = document.querySelector("#star-count");
const cardCount = document.querySelector("#card-count");
const rewardPop = document.querySelector("#reward-pop");
const rewardTitle = document.querySelector("#reward-title");
const rewardText = document.querySelector("#reward-text");
const vehicleModal = document.querySelector("#vehicle-modal");
const detailBody = document.querySelector("#detail-body");
const parentModal = document.querySelector("#parent-modal");
const missionArea = document.querySelector("#mission-area");

const state = loadState();
let activeFilter = "All";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.unlocked)) {
      return {
        screen: "home",
        stars: Number(saved.stars) || 0,
        unlocked: new Set([...initialUnlocked, ...saved.unlocked]),
        found: new Set(),
        mathDone: false,
        selectedZone: "track"
      };
    }
  } catch {
    // Ignore broken local data and start fresh.
  }

  return {
    screen: "home",
    stars: 0,
    unlocked: new Set(initialUnlocked),
    found: new Set(),
    mathDone: false,
    selectedZone: "track"
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify({
    stars: state.stars,
    unlocked: Array.from(state.unlocked)
  }));
}

function getVehicle(id) {
  return vehicles.find((vehicle) => vehicle.id === id);
}

function setScreen(screenName) {
  state.screen = screenName;
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
  navTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.screenTarget === screenName);
  });

  if (screenName === "garage") renderGarage();
  if (screenName === "play") renderMission();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStats() {
  starCount.textContent = state.stars;
  cardCount.textContent = state.unlocked.size;
}

function renderMap() {
  mapGrid.replaceChildren(...zones.map((zone) => {
    const vehicle = getVehicle(zone.vehicleId);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "zone-card";
    card.style.setProperty("--zone-bg", zone.bg);
    card.innerHTML = `
      <div>
        <h3>${zone.title}</h3>
        <p>${zone.copy}</p>
      </div>
      <img src="${vehicle.image}" alt="${vehicle.english}">
      <div class="zone-meta">
        <span>${zone.english}</span>
        <span>${zone.id === "track" ? "Start" : "Soon"}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedZone = zone.id;
      missionArea.textContent = zone.english;
      resetMission();
      setScreen("play");
    });
    return card;
  }));
}

function renderMission() {
  vehicleField.replaceChildren(...missionVehicles.map((vehicleId, index) => {
    const vehicle = getVehicle(vehicleId);
    const token = document.createElement("button");
    token.type = "button";
    token.className = "vehicle-token";
    token.style.setProperty("--token-bg", index % 2 === 0 ? "#eef6ff" : "#fff7e4");
    token.dataset.vehicleId = vehicle.id;
    token.innerHTML = `
      <span>${vehicle.category}</span>
      <img src="${vehicle.image}" alt="${vehicle.english}">
    `;
    token.classList.toggle("is-found", state.found.has(vehicle.id));
    token.addEventListener("click", () => handleVehicleTap(vehicle.id, token));
    return token;
  }));
  updateMissionUI();
}

function handleVehicleTap(vehicleId, token) {
  if (state.mathDone) {
    setFeedback("All done", "You already finished this mission. Check your garage.", "good");
    return;
  }

  if (!targetIds.has(vehicleId)) {
    setFeedback("Try again", "Let’s count together. This one is not a race car.", "try");
    return;
  }

  if (state.found.has(vehicleId)) {
    setFeedback("Already found", "Good eyes. Try finding another race car.", "try");
    return;
  }

  state.found.add(vehicleId);
  token.classList.add("is-found");
  setFeedback("Great find", `${getVehicle(vehicleId).english} is a race car. Keep counting.`, "good");
  updateMissionUI();

  if (state.found.size === targetIds.size) {
    showMathQuestion();
  }
}

function updateMissionUI() {
  const found = state.found.size;
  const total = targetIds.size;
  missionCount.textContent = `${found} / ${total} found`;
  progressFill.style.width = `${(found / total) * 100}%`;
}

function setFeedback(title, message, tone) {
  feedbackCard.classList.remove("good", "try");
  if (tone) feedbackCard.classList.add(tone);
  feedbackCard.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
}

function showMathQuestion() {
  mathPanel.classList.remove("is-hidden");
  setFeedback("Math time", "You found 3 race cars. Add 2 more and pick the answer.", "good");
  answerRow.replaceChildren(...[4, 5, 6, 7].map((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(answer, button));
    return button;
  }));
}

function handleAnswer(answer, button) {
  if (state.mathDone) return;

  if (answer !== 5) {
    button.classList.add("wrong");
    setFeedback("Try again", "Let’s count together: 3 cars plus 2 cars makes 5 cars.", "try");
    return;
  }

  button.classList.add("correct");
  state.mathDone = true;
  state.stars += 3;
  state.unlocked.add("ferrari-f40");
  state.unlocked.add("ferrari-458");
  saveState();
  updateStats();
  renderGarage();
  setFeedback("Card unlocked", "You earned new sports car cards for your garage.", "good");
  showReward("New cards unlocked", "Ferrari F40 and Ferrari 458 are now in your garage.");
}

function resetMission() {
  state.found.clear();
  state.mathDone = false;
  mathPanel.classList.add("is-hidden");
  answerRow.replaceChildren();
  setFeedback("Ready", "Try tapping a race car.", "");
  renderMission();
}

function renderFilters() {
  const categories = ["All", ...new Set(vehicles.map((vehicle) => vehicle.category))];
  filterRow.replaceChildren(...categories.map((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.classList.toggle("is-active", activeFilter === category);
    chip.textContent = category;
    chip.addEventListener("click", () => {
      activeFilter = category;
      renderFilters();
      renderGarage();
    });
    return chip;
  }));
}

function renderGarage() {
  const visibleVehicles = vehicles.filter((vehicle) => activeFilter === "All" || vehicle.category === activeFilter);
  garageGrid.replaceChildren(...visibleVehicles.map((vehicle) => {
    const unlocked = state.unlocked.has(vehicle.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `garage-card${unlocked ? "" : " locked"}`;
    card.innerHTML = `
      <span class="rarity ${rarityClass(vehicle.rarity)}">${unlocked ? vehicle.rarity : "Locked"}</span>
      <img src="${vehicle.image}" alt="${vehicle.english}">
      <h3>${unlocked ? vehicle.english : "Mystery Vehicle"}</h3>
      <p>${unlocked ? vehicle.chinese : `Find it in ${hintFor(vehicle.category)}.`}</p>
      <div class="card-meta">
        <span class="category-tag">${vehicle.category}</span>
        <span>${unlocked ? "Collected" : "Hidden"}</span>
      </div>
    `;
    card.addEventListener("click", () => openVehicleDetail(vehicle.id));
    return card;
  }));
}

function rarityClass(rarity) {
  if (rarity.includes("Super")) return "rarity-super";
  if (rarity.includes("Rare")) return "rarity-rare";
  if (rarity.includes("Nice")) return "rarity-nice";
  return "rarity-common";
}

function hintFor(category) {
  const hints = {
    "City Cars": "City",
    "Sports Cars": "Race Track",
    "Race Cars": "Race Track",
    "Construction Vehicles": "Work Site",
    "Motorcycles": "Garage",
    "Aircraft": "Airport",
    "Off-road Vehicles": "Garage",
    "Classic Cars": "Garage",
    "Public Transport": "City",
    "Special Vehicles": "Garage"
  };
  return hints[category] || "the map";
}

function openVehicleDetail(vehicleId) {
  const vehicle = getVehicle(vehicleId);
  const unlocked = state.unlocked.has(vehicleId);
  detailBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-art">
        <img src="${vehicle.image}" alt="${vehicle.english}">
      </div>
      <div class="detail-info">
        <span class="rarity ${rarityClass(vehicle.rarity)}">${unlocked ? vehicle.rarity : "Locked card"}</span>
        <h2 id="vehicle-detail-title">${unlocked ? vehicle.english : "Mystery Vehicle"}</h2>
        <p>${unlocked ? vehicle.chinese : `Complete a mission in ${hintFor(vehicle.category)} to unlock this card.`}</p>
        <div class="fact-list">
          <span><b>分类</b>${vehicle.category}</span>
          <span><b>用途</b>${unlocked ? vehicle.use : "Unlock this card to read its use."}</span>
          <span><b>小知识</b>${unlocked ? vehicle.fact : "A small fact will appear after collection."}</span>
        </div>
      </div>
    </div>
  `;
  vehicleModal.showModal();
}

function showReward(title, text) {
  rewardTitle.textContent = title;
  rewardText.textContent = text;
  rewardPop.classList.remove("is-hidden");
  window.setTimeout(() => rewardPop.classList.add("is-hidden"), 5200);
}

document.querySelectorAll("[data-screen-target]").forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.screenTarget));
});

document.querySelector("[data-reset-mission]").addEventListener("click", resetMission);

document.querySelector("[data-parent-open]").addEventListener("click", () => {
  parentModal.showModal();
});

renderMap();
renderFilters();
renderGarage();
renderMission();
updateStats();
