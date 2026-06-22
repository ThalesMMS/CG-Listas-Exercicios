/*
 * g19-sombreamento.js — Guia: sombreamento Flat, Gouraud e Phong.
 * Onde a iluminação é calculada: por face (Flat), por vértice com interpolação
 * de cor (Gouraud) ou por pixel com interpolação de normais (Phong). Distinção
 * entre o SOMBREAMENTO de Phong e o MODELO de iluminação de Phong.
 *
 * Visual: SVG (polígonos + gradientes lineares/radiais).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var svgEl = EX.util.svgEl;

  function lgrad(svg, id, x1, y1, x2, y2, stops) {
    var defs = svgEl("defs");
    var g = svgEl("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2, gradientUnits: "userSpaceOnUse" });
    stops.forEach(function (s) { g.appendChild(svgEl("stop", { offset: s[0], "stop-color": s[1] })); });
    defs.appendChild(g); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }
  function rgrad(svg, id, cx, cy, r, stops) {
    var defs = svgEl("defs");
    var g = svgEl("radialGradient", { id: id, cx: cx, cy: cy, r: r, gradientUnits: "userSpaceOnUse" });
    stops.forEach(function (s) { g.appendChild(svgEl("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] })); });
    defs.appendChild(g); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }
  function facetSphere(svg, cx, cy, R, n) {
    function w(y) { var t = R * R - (y - cy) * (y - cy); return t > 0 ? Math.sqrt(t) : 0; }
    for (var b = 0; b < n; b++) {
      var y0 = cy - R + b * (2 * R / n), y1 = y0 + 2 * R / n;
      var w0 = w(y0), w1 = w(y1), ym = (y0 + y1) / 2;
      var lit = Math.max(0.16, Math.min(1, 0.34 + 0.6 * (1 - Math.abs(ym - (cy - R * 0.4)) / (R * 1.4))));
      svg.polygon([[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]],
        { fill: "var(--accent)", opacity: lit, stroke: "var(--bg)", strokeWidth: 1 });
    }
  }

  function build() {
    return [
      {
        title: "Onde calcular a luz na malha?",
        body:
          "<p>Uma superfície curva vira uma <b>malha de polígonos</b>. Aplicar o modelo de iluminação " +
          "exige uma escolha: calcular a luz <b>por face</b>, <b>por vértice</b> ou <b>por pixel</b>?</p>" +
          "<p>Essas três respostas são <b>Flat</b>, <b>Gouraud</b> e <b>Phong</b> — cada uma troca " +
          "custo por qualidade de um jeito diferente.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            svg.circle(180, 120, 90, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
            svg.text(180, 120, "malha", { size: 13, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Flat: uma cor por face",
        body:
          "<p>Usa <b>uma normal por face</b> e calcula a luz <b>uma vez</b> → a face inteira recebe " +
          "<b>uma cor</b>.</p>" +
          "<p>É o mais barato, mas as <b>facetas ficam visíveis</b> (a curva parece poligonal). Para " +
          "poliedros de faces realmente planas (cubo, prisma), porém, Flat é <b>exato</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            facetSphere(svg, 180, 120, 92, 7);
            svg.text(180, 228, "facetas visíveis: 1 cor por face", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Gouraud: interpola a COR dos vértices",
        body:
          "<p>Calcula a luz <b>nos vértices</b> e <b>interpola a cor</b> resultante pelo interior da " +
          "face. O resultado é <b>suave</b> — some o aspecto facetado.</p>" +
          "<p>Problema clássico: se um <b>brilho especular</b> cairia no meio de uma face, ele " +
          "<b>desaparece</b> (não há vértice ali para “acendê-lo”).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 280);
            var A = [180, 40], B = [70, 240], C = [300, 240];
            var f = lgrad(svg, "g19g", 180, 40, 185, 240, [[0, "var(--yellow)"], [0.5, "var(--accent)"], [1, "#14223a"]]);
            svg.polygon([A, B, C], { fill: f, stroke: "var(--ink-dim)", strokeWidth: 1.5 });
            svg.circle(A[0], A[1], 7, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(B[0], B[1], 7, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(C[0], C[1], 7, { fill: "#14223a", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(180, 268, "cor calculada nos vértices, interpolada", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Phong: interpola as NORMAIS, ilumina por pixel",
        body:
          "<p>Interpola as <b>normais</b> dos vértices para <b>cada pixel</b> e só então calcula a luz, " +
          "pixel a pixel.</p>" +
          "<p>O brilho fica <b>correto e bem-formado</b> mesmo no meio da face — porque cada fragmento " +
          "tem sua própria normal. Custa mais (uma avaliação de iluminação por pixel).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 280);
            var A = [180, 40], B = [70, 240], C = [300, 240];
            svg.polygon([A, B, C], { fill: "var(--accent)", opacity: 0.4, stroke: "var(--ink-dim)", strokeWidth: 1.5 });
            [100, 140, 180, 220, 260].forEach(function (x, i) {
              var tilt = (i - 2) * 9;
              svg.arrow(x, 232, x + tilt, 198, { color: "var(--cyan)", strokeWidth: 1.6, head: 6 });
            });
            var hl = rgrad(svg, "g19h", 188, 150, 42, [[0, "var(--yellow)", 0.95], [0.5, "var(--yellow)", 0.4], [1, "var(--yellow)", 0]]);
            svg.circle(188, 150, 42, { fill: hl });
            svg.text(180, 268, "normais interpoladas → brilho por pixel", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Cuidado: dois “Phong” diferentes",
        body:
          "<p>Não confunda:</p>" +
          "<ul>" +
          "<li><b>Modelo de iluminação de Phong</b> = <em>o que</em> calcular (ambiente + difusa + " +
          "especular) — o tema do guia anterior;</li>" +
          "<li><b>Sombreamento de Phong</b> = <em>onde</em> calcular (por pixel, interpolando normais).</li>" +
          "</ul>" +
          "<p>São independentes: dá para usar o <b>modelo</b> de Phong com sombreamento Flat, Gouraud " +
          "ou Phong.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "warn",
              title: "Modelo ≠ sombreamento",
              html: "“Phong” nomeia tanto <b>o que</b> calcular (o modelo de iluminação) quanto " +
                "<b>onde</b> calcular (o sombreamento por pixel).",
            });
          },
        },
      },
      {
        title: "Comparação e resumo",
        body: "<p>Custo sobe, qualidade sobe:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Flat", "Gouraud", "Phong"],
              rows: [
                ["Calcula em", "face", "vértices", "cada pixel"],
                ["Interpola", "nada", "a cor", "as normais"],
                ["Aparência", "facetada", "suave", "suave + brilho certo"],
                ["Highlight", "impossível", "pode sumir", "correto"],
                ["Custo", "baixo", "médio", "alto"],
              ],
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g19-sombreamento",
    num: "◐",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Sombreamento Flat, Gouraud e Phong",
    type: "conceitual",
    tags: ["sombreamento", "gouraud", "phong"],
    hubDesc: "Iluminação por face, por vértice (interpola cor) ou por pixel (interpola normais).",
    statement:
      "Entenda os sombreamentos Flat, Gouraud e Phong: o cálculo da iluminação por face, por vértice " +
      "(interpolando cores) ou por pixel/fragmento (interpolando normais), e suas diferenças.",
    parts: [{ label: "Guia", build: build }],
  });
})();
