/**
 * Trusted gallery-only controls, not part of the document renderer.
 * No network requests, analytics, persistence or third-party services.
 */
const root = document.documentElement;
const cards = [...document.querySelectorAll(".component-card")];
const frames = [...document.querySelectorAll(".preview-frame")];
const filters = [...document.querySelectorAll("[data-filter]")];
const themes = [...document.querySelectorAll("[data-theme-option]")];
const devices = [...document.querySelectorAll("[data-device-option]")];
const search = document.querySelector("#gallery-search");
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const reset = document.querySelector("#reset-filters");

let activeFilter = "all";

function updateResults() {
  const query = search.value.trim().toLocaleLowerCase("zh-CN");
  let shown = 0;
  for (const card of cards) {
    const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
    const queryMatches = !query || card.dataset.search.includes(query);
    card.hidden = !categoryMatches || !queryMatches;
    if (!card.hidden) shown++;
  }
  count.textContent = "显示 " + shown + " / " + cards.length + " 种组件";
  empty.hidden = shown !== 0;
}

function selectOption(buttons, activeKey, selectedValue) {
  for (const button of buttons) {
    const chosen = button.dataset[activeKey] === selectedValue;
    button.classList.toggle("is-active", chosen);
    button.setAttribute("aria-pressed", chosen ? "true" : "false");
  }
}

function applyThemeToFrame(frame) {
  try {
    const doc = frame.contentDocument;
    if (doc && doc.documentElement) doc.documentElement.dataset.theme = root.dataset.theme;
  } catch {
    // If a browser blocks frame DOM access, the gallery itself still works.
  }
}

for (const frame of frames) frame.addEventListener("load", () => applyThemeToFrame(frame));

for (const filter of filters) {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    selectOption(filters, "filter", activeFilter);
    updateResults();
  });
}

search.addEventListener("input", updateResults);

for (const button of themes) {
  button.addEventListener("click", () => {
    root.dataset.theme = button.dataset.themeOption;
    selectOption(themes, "themeOption", root.dataset.theme);
    for (const frame of frames) applyThemeToFrame(frame);
  });
}

for (const button of devices) {
  button.addEventListener("click", () => {
    root.dataset.device = button.dataset.deviceOption;
    selectOption(devices, "deviceOption", root.dataset.device);
  });
}

reset.addEventListener("click", () => {
  activeFilter = "all";
  search.value = "";
  selectOption(filters, "filter", activeFilter);
  updateResults();
  search.focus();
});

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const source = button.closest(".source-box")?.querySelector("code")?.textContent;
    if (!source) return;
    const oldLabel = button.textContent;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(source);
      button.textContent = "已复制";
    } catch {
      button.textContent = "无法复制，请手动选择";
    }
    button.addEventListener("blur", () => { button.textContent = oldLabel; }, { once: true });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = event.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
  event.preventDefault();
  search.focus();
});

updateResults();
