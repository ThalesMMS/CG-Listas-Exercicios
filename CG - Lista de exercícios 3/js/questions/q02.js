/*
 * q02.js — Diferença entre os modelos RGB e CMYK.
 * Diagrama SVG: roda aditiva (RGB, sobre preto, blend "screen") e roda
 * subtrativa (CMYK, sobre branco, blend "multiply").
 *
 * Observação: as cores das rodas são PURAS (R/G/B, C/M/Y) e os fundos são
 * fixos (preto p/ aditiva, branco p/ subtrativa) de propósito — fazem parte do
 * conceito (a mistura aditiva parte do preto; a subtrativa, do branco) e por
 * isso não seguem o tema. O texto fora dos painéis usa as cores do tema.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  // Desenha uma roda de 3 círculos com mistura por blend-mode dentro de `parent`.
  function wheel(svg, parent, cx, cy, kind) {
    var g = svg.group({ parent: parent });
    g.style.isolation = "isolate"; // contém o blend dentro do grupo
    var bg = kind === "rgb" ? "#0a0a0f" : "#fbfbfb";
    var blend = kind === "rgb" ? "screen" : "multiply";
    var cols = kind === "rgb"
      ? ["#ff2d2d", "#22e04a", "#2d7bff"]   // R, G, B
      : ["#16e0e0", "#ff3df0", "#ffe11a"];  // C, M, Y
    var labels = kind === "rgb" ? ["R", "G", "B"] : ["C", "M", "Y"];
    var ink = kind === "rgb" ? "#f4f7fa" : "#171717";

    svg.rect(cx - 90, cy - 96, 180, 188, { fill: bg, stroke: "var(--border)", strokeWidth: 1.5, rx: 16, parent: g });
    var r = 54;
    var pos = [[cx, cy - 34], [cx - 30, cy + 20], [cx + 30, cy + 20]];
    for (var i = 0; i < 3; i++) {
      var c = svg.circle(pos[i][0], pos[i][1], r, { fill: cols[i], parent: g });
      c.style.mixBlendMode = blend;
      c.setAttribute("fill-opacity", "0.92");
    }
    // rótulos das primárias
    var lp = [[cx, cy - 60], [cx - 56, cy + 40], [cx + 56, cy + 40]];
    for (i = 0; i < 3; i++) {
      svg.text(lp[i][0], lp[i][1], labels[i], { size: 16, weight: 800, color: ink, parent: g });
    }
    // resultado no centro
    svg.text(cx, cy + 4, kind === "rgb" ? "branco" : "preto (K)", { size: 11.5, weight: 700, color: ink, parent: g });
    return g;
  }

  function scene(svg, stage) {
    svg.view(760, 440);
    function grp(name) {
      var g = svg.group({});
      g.setAttribute("opacity", stage === "all" || stage === name ? 1 : 0.18);
      return g;
    }
    var gL = grp("rgb");
    var gR = grp("cmyk");

    svg.text(210, 70, "RGB — síntese aditiva", { size: 15, weight: 700, color: "var(--ink)", parent: gL });
    svg.text(210, 360, "fundo preto · somar luz → branco", { size: 12, color: "var(--ink-dim)", parent: gL });
    wheel(svg, gL, 210, 200, "rgb");

    svg.text(550, 70, "CMYK — síntese subtrativa", { size: 15, weight: 700, color: "var(--ink)", parent: gR });
    svg.text(550, 360, "fundo branco · somar tinta → preto (K)", { size: 12, color: "var(--ink-dim)", parent: gR });
    wheel(svg, gR, 550, 200, "cmyk");
  }

  function svgStep(stage) {
    return { type: "svg", draw: function (svg) { scene(svg, stage); } };
  }

  function build() {
    return [
      S.concept({
        title: "Dois jeitos de formar cor: somar luz ou somar tinta",
        body:
          "<p>RGB e CMYK são <b>modelos de cor</b> que descrevem como uma cor é composta. " +
          "A diferença essencial é a <b>síntese</b>:</p>" +
          "<ul><li><span class='accent'>RGB</span> — <b>aditiva</b>: combina <b>luz</b> " +
          "(Vermelho, Verde, Azul).</li>" +
          "<li><span class='hl'>CMYK</span> — <b>subtrativa</b>: combina <b>pigmentos</b> " +
          "(Ciano, Magenta, Amarelo + Preto).</li></ul>",
        visual: svgStep("all"),
      }),
      {
        title: "RGB — aditiva (luz)",
        body:
          "<p>No <span class='accent'>RGB</span> partimos do <b>preto</b> (ausência de luz) e " +
          "<b>somamos</b> luz das três primárias. Quanto mais luz, mais claro:</p>" +
          "<ul><li>R + G = amarelo; G + B = ciano; R + B = magenta;</li>" +
          "<li>R + G + B no máximo = <span class='ok'>branco</span>; tudo a zero = preto.</li></ul>" +
          "<p>É o modelo das <b>fontes emissoras</b>: monitores, TVs, projetores, câmeras.</p>",
        visual: svgStep("rgb"),
      },
      {
        title: "CMYK — subtrativa (tinta)",
        body:
          "<p>No <span class='hl'>CMYK</span> partimos do <b>branco</b> (papel) e cada tinta " +
          "<b>subtrai</b> (absorve) parte da luz. Quanto mais tinta, mais escuro:</p>" +
          "<ul><li>C + M = azul; C + Y = verde; M + Y = vermelho;</li>" +
          "<li>C + M + Y ≈ preto — mas na prática some-se o <b>K</b> (preto) para um preto " +
          "real, mais nitidez e economia de tinta.</li></ul>" +
          "<p>É o modelo da <b>impressão</b> (pigmentos que refletem luz).</p>",
        visual: svgStep("cmyk"),
      },
      S.comparison({
        title: "Resumo: RGB × CMYK",
        intro: "<p>Mesma cor, lógicas opostas: emitir luz × absorver luz.</p>",
        headers: ["", "RGB", "CMYK"],
        rows: [
          ["Síntese", "Aditiva (luz)", "Subtrativa (pigmento)"],
          ["Primárias", "Vermelho, Verde, Azul", "Ciano, Magenta, Amarelo (+ Preto K)"],
          ["Ponto de partida", "Preto (sem luz)", "Branco (papel)"],
          ["Soma das primárias", "Branco", "Preto"],
          ["Origem da cor", "Emissão de luz", "Absorção de luz refletida"],
          ["Uso típico", "Telas, monitores, projetores", "Impressão, gráfica"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q02-rgb-cmyk",
    num: "2",
    subject: "Computação Gráfica — Lista 3",
    section: "I) Cor e Percepção",
    title: "Modelo RGB × CMYK",
    type: "conceitual",
    tags: ["cor", "rgb", "cmyk"],
    hubDesc: "Síntese aditiva (luz) versus subtrativa (pigmento), com as rodas de cor.",
    statement: "Diferencie o modelo <strong>RGB</strong> de <strong>CMYK</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
