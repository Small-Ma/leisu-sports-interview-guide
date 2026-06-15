(function () {
  "use strict";

  const palette = ["#1677a8", "#d9872b", "#37896b", "#8b62a8", "#c85359", "#5d7fbd"];

  function readConfig(node) {
    const script = node.querySelector('script[type="application/json"]');
    if (!script) return null;
    try {
      return JSON.parse(script.textContent);
    } catch (error) {
      node.innerHTML = '<p class="aw-source">图表数据格式错误，暂时无法渲染。</p>';
      console.error("Analytics widget config error", error);
      return null;
    }
  }

  function header(config) {
    const title = config.title ? `<h3 class="aw-chart-title">${config.title}</h3>` : "";
    const subtitle = config.subtitle ? `<p class="aw-chart-subtitle">${config.subtitle}</p>` : "";
    return `<div class="aw-chart-header">${title}${subtitle}</div>`;
  }

  function formatValue(value, unit) {
    return `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}${unit || ""}`;
  }

  function renderHorizontalBar(node, config) {
    const values = config.data.map(item => Number(item.value));
    const max = config.max || Math.max(...values, 1);
    const rows = config.data.map((item, index) => {
      const width = Math.max(2, Number(item.value) / max * 100);
      const color = item.color || palette[index % palette.length];
      return `
        <div class="aw-hbar-row">
          <span class="aw-hbar-label">${item.label}</span>
          <span class="aw-hbar-track" aria-hidden="true">
            <span class="aw-hbar-fill" style="width:${width}%;background:${color}"></span>
          </span>
          <span class="aw-hbar-value">${formatValue(item.value, config.unit)}</span>
        </div>`;
    }).join("");
    node.innerHTML = `${header(config)}<div class="aw-hbar-list">${rows}</div>`;
  }

  function renderVerticalBar(node, config) {
    const values = config.data.map(item => Number(item.value));
    const max = config.max || Math.max(...values, 1);
    const bars = config.data.map((item, index) => {
      const height = Math.max(2, Number(item.value) / max * 100);
      const color = item.color || palette[index % palette.length];
      return `
        <div class="aw-vbar-item">
          <span class="aw-vbar-value">${formatValue(item.value, config.unit)}</span>
          <span class="aw-vbar-column" style="height:${height}%;background:${color}"></span>
          <span class="aw-vbar-label">${item.label}</span>
        </div>`;
    }).join("");
    node.innerHTML = `${header(config)}<div class="aw-vbar-plot">${bars}</div>`;
  }

  function renderLine(node, config) {
    const width = 760;
    const height = 320;
    const pad = { top: 20, right: 20, bottom: 42, left: 48 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const values = config.series.flatMap(series => series.values.map(Number));
    const max = config.max || Math.max(...values, 1);
    const min = config.min || 0;
    const xCount = Math.max(config.x.length - 1, 1);
    const xPos = index => pad.left + index / xCount * plotW;
    const yPos = value => pad.top + (max - value) / (max - min || 1) * plotH;
    const yTicks = [0, .25, .5, .75, 1].map(ratio => min + (max - min) * ratio);

    const grid = yTicks.map(value => {
      const y = yPos(value);
      return `
        <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#dce5ed" stroke-width="1"/>
        <text x="${pad.left - 8}" y="${y + 4}" text-anchor="end">${formatValue(value, config.unit)}</text>`;
    }).join("");

    const xLabels = config.x.map((value, index) => `
      <text x="${xPos(index)}" y="${height - 14}" text-anchor="middle">${config.xPrefix || ""}${value}</text>
    `).join("");

    const seriesSvg = config.series.map((series, seriesIndex) => {
      const color = series.color || palette[seriesIndex % palette.length];
      const points = series.values.map((value, index) => `${xPos(index)},${yPos(Number(value))}`).join(" ");
      const circles = series.values.map((value, index) => `
        <circle cx="${xPos(index)}" cy="${yPos(Number(value))}" r="3.5" fill="#fff" stroke="${color}" stroke-width="2"/>
      `).join("");
      return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${circles}`;
    }).join("");

    const legend = config.series.map((series, index) => {
      const color = series.color || palette[index % palette.length];
      return `<span class="aw-legend-item"><span class="aw-legend-swatch" style="background:${color}"></span>${series.name}</span>`;
    }).join("");

    node.innerHTML = `
      ${header(config)}
      <svg class="aw-line-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${config.title || "折线图"}">
        ${grid}${xLabels}${seriesSvg}
      </svg>
      <div class="aw-legend">${legend}</div>`;
  }

  const renderers = {
    "horizontal-bar": renderHorizontalBar,
    "vertical-bar": renderVerticalBar,
    line: renderLine
  };

  function addReadingProgress() {
    const progress = document.createElement("div");
    progress.className = "aw-reading-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = distance > 0 ? Math.min(1, window.scrollY / distance) : 1;
      progress.style.width = `${ratio * 100}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function addAutoOverview() {
    if (document.querySelector(".aw-dashboard")) return;

    const main = document.querySelector("main") || document.body;
    const moduleCount = Math.max(
      document.querySelectorAll("section").length,
      document.querySelectorAll("h2").length
    );
    const tableCount = document.querySelectorAll("table").length;
    const qaCount = document.querySelectorAll(".qa, .qa-item, .question").length;
    const text = document.body.innerText;
    const methods = ["漏斗", "Cohort", "A/B", "留存", "LTV", "ROI", "实验", "指标", "用户分层", "因果"];
    const methodCount = methods.filter(keyword => text.includes(keyword)).length;

    const dashboard = document.createElement("section");
    dashboard.className = "aw-dashboard aw-auto-overview";
    dashboard.setAttribute("aria-label", "页面内容分析看板");
    dashboard.innerHTML = `
      <div class="aw-heading">
        <div>
          <h2>页面内容分析看板</h2>
          <p>快速了解本页的知识结构、数据证据和面试材料密度，阅读时优先进入与当前目标最相关的模块。</p>
        </div>
        <span class="aw-badge">CONTENT ANALYTICS</span>
      </div>
      <div class="aw-kpis">
        <article class="aw-kpi"><span class="aw-kpi-label">内容模块</span><strong class="aw-kpi-value">${moduleCount}</strong><span class="aw-kpi-note">按章节结构统计</span></article>
        <article class="aw-kpi"><span class="aw-kpi-label">数据表格</span><strong class="aw-kpi-value">${tableCount}</strong><span class="aw-kpi-note">支持比较与口径查阅</span></article>
        <article class="aw-kpi"><span class="aw-kpi-label">面试问答</span><strong class="aw-kpi-value">${qaCount}</strong><span class="aw-kpi-note">可直接用于模拟追问</span></article>
        <article class="aw-kpi"><span class="aw-kpi-label">分析方法覆盖</span><strong class="aw-kpi-value">${methodCount}/10</strong><span class="aw-kpi-note">漏斗、留存、实验、因果等关键词</span></article>
      </div>
      <div class="aw-chart" data-aw-chart="horizontal-bar">
        <script type="application/json">${JSON.stringify({
          title: "页面分析资产分布",
          subtitle: "结构统计用于判断该页面更偏知识框架、数据证据还是面试演练。",
          unit: "项",
          data: [
            { label: "内容模块", value: moduleCount, color: "#1677a8" },
            { label: "数据表格", value: tableCount, color: "#37896b" },
            { label: "面试问答", value: qaCount, color: "#d9872b" },
            { label: "方法覆盖", value: methodCount, color: "#8b62a8" }
          ]
        })}</script>
      </div>
      <p class="aw-source">统计口径：基于当前页面结构自动生成，不代表业务经营数据。</p>`;

    const header = main.querySelector("header");
    if (header && header.parentNode === main) {
      header.insertAdjacentElement("afterend", dashboard);
    } else {
      main.insertBefore(dashboard, main.firstChild);
    }
  }

  addAutoOverview();
  addReadingProgress();

  document.querySelectorAll("table").forEach(table => {
    if (table.parentElement && table.parentElement.classList.contains("aw-table-scroll")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "aw-table-scroll";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  document.querySelectorAll("[data-aw-chart]").forEach(node => {
    const config = readConfig(node);
    const renderer = renderers[node.dataset.awChart];
    if (config && renderer) renderer(node, config);
  });
})();
