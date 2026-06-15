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
