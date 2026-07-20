const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = $(".site-header");
const pageProgress = $("#pageProgress");
const backToTop = $("#backToTop");
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

  pageProgress.style.width = `${progress}%`;
  header.classList.toggle("scrolled", scrollTop > 14);
  backToTop.classList.toggle("visible", scrollTop > 600);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

menuToggle.addEventListener("click", () => {
  const open = !mainNav.classList.contains("open");
  mainNav.classList.toggle("open", open);
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

$$(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");

    entry.target.querySelectorAll?.(".progress-fill, .monitor-progress i").forEach(bar => {
      const value = bar.dataset.progress || bar.style.width || "0";
      requestAnimationFrame(() => {
        bar.style.width = typeof value === "string" && value.includes("%") ? value : `${value}%`;
      });
    });

    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => revealObserver.observe(el));

const sections = $$("main section[id]");
const navLinks = $$(".main-nav a");

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

// Risk tool
const probabilityRange = $("#probabilityRange");
const impactRange = $("#impactRange");
const probabilityValue = $("#probabilityValue");
const impactValue = $("#impactValue");
const riskForm = $("#riskForm");
const riskResult = $("#riskResult");
const matrixMarker = $("#matrixMarker");

function riskEvaluation(probability, impact) {
  const score = probability * impact;

  if (probability >= 55 && impact >= 55) {
    return {
      level: "Riesgo crítico",
      advice: "Reduce la probabilidad de inmediato y prepara una contingencia completa.",
      color: "critical"
    };
  }

  if (score >= 2500 || impact >= 70) {
    return {
      level: "Riesgo alto",
      advice: "Aplica acciones preventivas y deja preparada una respuesta correctiva.",
      color: "high"
    };
  }

  if (score >= 1000 || probability >= 65) {
    return {
      level: "Riesgo moderado",
      advice: "Vigila el riesgo, define señales de alerta y valora acciones preventivas.",
      color: "medium"
    };
  }

  return {
    level: "Riesgo bajo",
    advice: "Puede aceptarse con monitoreo periódico y una respuesta básica.",
    color: "low"
  };
}

function updateRiskMarker() {
  const p = Number(probabilityRange.value);
  const i = Number(impactRange.value);
  probabilityValue.textContent = `${p}%`;
  impactValue.textContent = `${i}%`;
  matrixMarker.style.left = `${Math.max(3, Math.min(97, p))}%`;
  matrixMarker.style.top = `${100 - Math.max(3, Math.min(97, i))}%`;
}

function renderRiskResult() {
  const p = Number(probabilityRange.value);
  const i = Number(impactRange.value);
  const result = riskEvaluation(p, i);

  const colorMap = {
    critical: ["#dc2626", "#fee2e2"],
    high: ["#ea580c", "#ffedd5"],
    medium: ["#d97706", "#fef3c7"],
    low: ["#16a34a", "#dcfce7"]
  };

  const [dot, bg] = colorMap[result.color];
  riskResult.style.background = bg;
  $(".result-dot", riskResult).style.background = dot;
  $("strong", riskResult).textContent = result.level;
  $("p", riskResult).textContent = result.advice;
}

[probabilityRange, impactRange].forEach(input => {
  input.addEventListener("input", () => {
    updateRiskMarker();
    renderRiskResult();
  });
});

riskForm.addEventListener("submit", event => {
  event.preventDefault();
  renderRiskResult();
  riskResult.animate(
    [{ transform: "scale(.98)", opacity: .7 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 260, easing: "ease-out" }
  );
});

$$(".matrix-cell").forEach(cell => {
  cell.addEventListener("click", () => {
    probabilityRange.value = cell.dataset.prob;
    impactRange.value = cell.dataset.impact;
    updateRiskMarker();
    renderRiskResult();
  });
});

updateRiskMarker();
renderRiskResult();

// Diagram tabs
const diagramTabs = $$(".diagram-tab");
const diagramPanels = {
  mindmap: $("#mindmapPanel"),
  wbs: $("#wbsPanel")
};

diagramTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    diagramTabs.forEach(button => button.classList.toggle("active", button === tab));
    Object.entries(diagramPanels).forEach(([key, panel]) => {
      panel.classList.toggle("active", key === tab.dataset.diagram);
    });
  });
});

const mindDetail = $("#mindDetail");
$$(".mind-node[data-detail]").forEach(node => {
  node.addEventListener("click", () => {
    $("small", mindDetail).textContent = $("span", node).textContent;
    $("p", mindDetail).textContent = node.dataset.detail;
    mindDetail.animate(
      [{ opacity: .4, transform: "translateX(-50%) translateY(8px)" }, { opacity: 1, transform: "translateX(-50%) translateY(0)" }],
      { duration: 300, easing: "ease-out" }
    );
  });
});

// Time calculator
const timeCalculator = $("#timeCalculator");

function calculateExpectedTime() {
  const optimistic = Math.max(0, Number($("#timeOptimistic").value) || 0);
  const likely = Math.max(0, Number($("#timeMostLikely").value) || 0);
  const pessimistic = Math.max(0, Number($("#timePessimistic").value) || 0);

  const expected = (optimistic + 4 * likely + pessimistic) / 6;
  const spread = Math.max(0, (pessimistic - optimistic) / 6);
  const planned = expected + spread;

  $("#expectedTime").textContent = `${expected.toFixed(1)} días`;
  $("#bufferTime").textContent = `+${spread.toFixed(1)} días`;
  $("#timeAdvice").textContent =
    `Planea una ventana aproximada de ${Math.ceil(planned)} días para absorber variaciones razonables.`;
}

timeCalculator.addEventListener("submit", event => {
  event.preventDefault();
  calculateExpectedTime();
});

calculateExpectedTime();

// Budget simulator
const budgetBody = $("#budgetBody");
const addBudgetRow = $("#addBudgetRow");
const budgetColors = ["#2563eb", "#0ea5e9", "#38bdf8", "#93c5fd", "#1d4ed8", "#60a5fa"];

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

function shortMoney(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

function updateBudget() {
  const rows = $$("tr", budgetBody);
  const data = rows.map(row => {
    const name = $(".budget-name", row).value.trim() || "Concepto";
    const qty = Math.max(0, Number($(".budget-qty", row).value) || 0);
    const price = Math.max(0, Number($(".budget-price", row).value) || 0);
    const subtotal = qty * price;
    $(".budget-subtotal", row).textContent = money(subtotal);
    return { name, subtotal };
  });

  const subtotal = data.reduce((sum, item) => sum + item.subtotal, 0);
  const reserve = subtotal * 0.10;
  const total = subtotal + reserve;

  $("#budgetSubtotal").textContent = money(subtotal);
  $("#budgetReserve").textContent = money(reserve);
  $("#budgetTotal").textContent = money(total);
  $("#donutTotal").textContent = shortMoney(total);

  const positive = data.filter(item => item.subtotal > 0);
  let cumulative = 0;
  const parts = positive.map((item, index) => {
    const start = cumulative;
    const percentage = subtotal > 0 ? (item.subtotal / subtotal) * 100 : 0;
    cumulative += percentage;
    return `${budgetColors[index % budgetColors.length]} ${start.toFixed(2)}% ${cumulative.toFixed(2)}%`;
  });

  $("#budgetDonut").style.background = parts.length
    ? `conic-gradient(${parts.join(",")})`
    : "conic-gradient(#dbeafe 0 100%)";

  const legend = $("#budgetLegend");
  legend.innerHTML = "";

  positive.slice(0, 6).forEach((item, index) => {
    const percent = subtotal > 0 ? Math.round((item.subtotal / subtotal) * 100) : 0;
    const div = document.createElement("div");
    div.innerHTML = `
      <span style="--legend:${budgetColors[index % budgetColors.length]}"></span>
      <p>${item.name}</p>
      <strong>${percent}%</strong>
    `;
    legend.appendChild(div);
  });
}

function bindBudgetRow(row) {
  $$("input", row).forEach(input => input.addEventListener("input", updateBudget));
  $(".remove-row", row).addEventListener("click", () => {
    row.remove();
    updateBudget();
  });
}

$$("tr", budgetBody).forEach(bindBudgetRow);

addBudgetRow.addEventListener("click", () => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input class="budget-name" value="Nuevo concepto" /></td>
    <td><input class="budget-qty" type="number" min="0" value="1" /></td>
    <td><input class="budget-price" type="number" min="0" value="0" /></td>
    <td class="budget-subtotal">$0</td>
    <td><button class="remove-row" aria-label="Eliminar">×</button></td>
  `;
  budgetBody.appendChild(row);
  bindBudgetRow(row);
  $(".budget-name", row).select();
  updateBudget();
});

updateBudget();

// Checklist
const checklistInputs = $$(".check-item input");
const readinessRing = $("#readinessRing");
const readinessValue = $("#readinessValue");
const readinessLabel = $("#readinessLabel");
const readinessMessage = $("#readinessMessage");

function updateReadiness() {
  const checked = checklistInputs.filter(input => input.checked).length;
  const percent = Math.round((checked / checklistInputs.length) * 100);
  const degrees = percent * 3.6;

  readinessRing.style.setProperty("--progress", `${degrees}deg`);
  readinessValue.textContent = `${percent}%`;

  if (percent === 100) {
    readinessLabel.textContent = "Listo para ejecutar";
    readinessMessage.textContent = "La planificación esencial está completa. Mantén el seguimiento activo.";
  } else if (percent >= 70) {
    readinessLabel.textContent = "Casi listo";
    readinessMessage.textContent = "Revisa los puntos pendientes antes de iniciar formalmente.";
  } else if (percent >= 40) {
    readinessLabel.textContent = "En construcción";
    readinessMessage.textContent = "Ya existe una base, pero aún faltan decisiones importantes.";
  } else {
    readinessLabel.textContent = "Comienza tu revisión";
    readinessMessage.textContent = "Completa los puntos esenciales antes de iniciar la ejecución.";
  }
}

checklistInputs.forEach(input => input.addEventListener("change", updateReadiness));
updateReadiness();

// Subtle pointer parallax for hero dashboard
const heroVisual = $(".hero-visual");
const dashboardMain = $(".dashboard-main");

if (window.matchMedia("(pointer:fine)").matches) {
  heroVisual.addEventListener("pointermove", event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    dashboardMain.style.animation = "none";
    dashboardMain.style.transform = `rotateY(${x * 7 - 3}deg) rotateX(${-y * 6 + 1}deg) translateY(-4px)`;
  });

  heroVisual.addEventListener("pointerleave", () => {
    dashboardMain.style.transform = "";
    dashboardMain.style.animation = "";
  });
}

// Animate dashboard progress once visible
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$(".progress-fill", entry.target).forEach(bar => {
      bar.style.width = `${bar.dataset.progress}%`;
    });
    progressObserver.unobserve(entry.target);
  });
}, { threshold: .35 });

progressObserver.observe($(".hero-visual"));
