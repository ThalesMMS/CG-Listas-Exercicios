/*
 * q13.js — Problema do mapeamento "texture scanning" (direto) e sua correção.
 * Diagrama SVG: mapeamento direto (buracos/sobreposições) × mapeamento inverso.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function grid(svg, g, x, y, cols, rows, cw, fillFn) {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var f = fillFn ? fillFn(c, r) : null;
        svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: f || "none", stroke: "var(--ink-mute)", strokeWidth: 1, parent: g });
      }
    }
  }
  function mark(svg, g, x, y, cw, c, r, fill, label, color) {
    svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: fill, parent: g });
    if (label) svg.text(x + c * cw + cw / 2, y + r * cw + cw / 2, label, { size: 12, weight: 700, color: color, parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 380);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gF = grp("fwd"), gI = grp("inv");

    // ----- Mapeamento direto (forward / texture scanning) -----
    svg.text(190, 56, "Direto (texture scanning)", { size: 14, weight: 700, color: "var(--ink)", parent: gF });
    grid(svg, gF, 50, 96, 4, 4, 26, function () { return "var(--bg-soft)"; });
    svg.text(102, 226, "textura (texels)", { size: 11, color: "var(--ink-dim)", parent: gF });
    svg.arrow(166, 148, 226, 148, { color: "var(--ink-dim)", strokeWidth: 2, head: 9, parent: gF });
    svg.text(196, 134, "varre", { size: 10.5, color: "var(--ink-dim)", parent: gF });
    // tela: alguns buracos e sobreposições
    grid(svg, gF, 236, 92, 5, 5, 22, function () { return "var(--accent-soft)"; });
    mark(svg, gF, 236, 92, 22, 0, 1, "var(--red-soft)", "×", "var(--red)");
    mark(svg, gF, 236, 92, 22, 2, 3, "var(--red-soft)", "×", "var(--red)");
    mark(svg, gF, 236, 92, 22, 4, 0, "var(--red-soft)", "×", "var(--red)");
    mark(svg, gF, 236, 92, 22, 1, 1, "var(--yellow-soft)", "2", "var(--yellow)");
    mark(svg, gF, 236, 92, 22, 3, 2, "var(--yellow-soft)", "2", "var(--yellow)");
    svg.text(291, 226, "tela (pixels)", { size: 11, color: "var(--ink-dim)", parent: gF });
    svg.text(190, 256, "× buracos   ·   2 sobreposições", { size: 11.5, color: "var(--ink-dim)", parent: gF });

    // ----- Mapeamento inverso (correção) -----
    svg.text(560, 56, "Inverso (correção)", { size: 14, weight: 700, color: "var(--ink)", parent: gI });
    grid(svg, gI, 430, 92, 5, 5, 22, function () { return "var(--green-soft)"; });
    svg.text(485, 226, "tela (pixels)", { size: 11, color: "var(--ink-dim)", parent: gI });
    grid(svg, gI, 600, 96, 4, 4, 26, function () { return "var(--bg-soft)"; });
    svg.text(652, 226, "textura", { size: 11, color: "var(--ink-dim)", parent: gI });
    // para cada pixel, volta à textura e amostra (algumas setas representativas)
    [[1, 1], [3, 0], [2, 3], [0, 4], [4, 2]].forEach(function (p) {
      var sx = 430 + p[0] * 22 + 11, sy = 92 + p[1] * 22 + 11;
      svg.arrow(sx, sy, 600 + 60, 96 + 60, { color: "var(--green)", strokeWidth: 1.4, head: 6, dashed: "4 4", opacity: 0.7, parent: gI });
    });
    svg.text(560, 256, "cada pixel amostrado 1× (com filtragem)", { size: 11.5, color: "var(--ink-dim)", parent: gI });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Varrer a textura ou varrer a tela?",
        body:
          "<p>No mapeamento de texturas precisamos relacionar <b>texels</b> (pixels da textura) " +
          "com <b>pixels</b> da tela. A ordem da varredura muda tudo.</p>" +
          "<p>O <b>texture scanning</b> varre a <b>textura</b> — e é aí que mora o problema.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "O problema: mapeamento direto (forward)",
        body:
          "<p>O <span class='hl'>texture scanning</span> percorre cada <b>texel</b> e o projeta na " +
          "tela. Como a transformação <b>não é 1:1</b> (há escala/perspectiva), o resultado falha:</p>" +
          "<ul><li><span class='no'>Buracos</span> — pixels da tela que nenhum texel atinge;</li>" +
          "<li><span class='hl'>Sobreposições</span> — pixels escritos várias vezes.</li></ul>" +
          "<p>Surgem falhas e <i>aliasing</i> na imagem.</p>",
        visual: svgStep(["fwd"]),
      },
      {
        title: "A correção: mapeamento inverso",
        body:
          "<p>Inverte-se a varredura: percorre-se a <b>tela</b> e, para <b>cada pixel</b>, aplica-se " +
          "a transformação <b>inversa</b> para achar a coordenada correspondente na <b>textura</b>, " +
          "amostrando ali.</p>" +
          "<p>Assim <b>cada pixel é preenchido exatamente uma vez</b> — sem buracos nem " +
          "sobreposições. Usa-se <b>filtragem</b> (bilinear, mipmap) para suavizar.</p>",
        visual: svgStep(["inv"]),
      },
      S.comparison({
        title: "Resumo: direto × inverso",
        headers: ["", "Direto (texture scanning)", "Inverso"],
        rows: [
          ["Varre", "A textura (texels)", "A tela (pixels)"],
          ["Para cada elemento", "Projeta o texel na tela", "Busca o texel via transformação inversa"],
          ["Problema", "Buracos e sobreposições", "Nenhum (1 amostra por pixel)"],
          ["Qualidade", "Falhas, aliasing", "Boa, com filtragem"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q13-texture-scanning",
    num: "13",
    subject: "Computação Gráfica — Lista 3",
    section: "IV) Texturas",
    title: "Texture scanning: problema e correção",
    type: "conceitual",
    tags: ["textura", "mapeamento", "aliasing"],
    hubDesc: "Mapeamento direto gera buracos/sobreposições; o inverso corrige varrendo a tela.",
    statement:
      "Qual é o problema apresentado pelo mapeamento de texturas do tipo " +
      "<strong>texture scanning</strong>? Explique o método utilizado para corrigir o problema.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
