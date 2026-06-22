/*
 * q09.js — Tipos de dispersão (espalhamento) nas superfícies.
 * Diagrama SVG: três painéis — especular, difusa e transmissão/refração.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var SY = 210; // y da superfície dentro do painel

  function surf(svg, g, cx) {
    svg.line(cx - 74, SY, cx + 74, SY, { stroke: "var(--ink-mute)", strokeWidth: 2.5, parent: g });
  }
  function normal(svg, g, cx) {
    svg.line(cx, 148, cx, 272, { stroke: "var(--ink-dim)", strokeWidth: 1.5, dashed: "5 5", parent: g });
  }

  function especular(svg, g, cx) {
    normal(svg, g, cx); surf(svg, g, cx);
    svg.arrow(cx - 58, 150, cx, SY, { color: "var(--yellow)", strokeWidth: 2.5, head: 10, parent: g });
    svg.arrow(cx, SY, cx + 58, 150, { color: "var(--orange)", strokeWidth: 2.5, head: 10, parent: g });
    svg.text(cx - 24, 176, "i", { size: 12, weight: 700, color: "var(--yellow)", parent: g });
    svg.text(cx + 24, 176, "r", { size: 12, weight: 700, color: "var(--orange)", parent: g });
  }

  function difusa(svg, g, cx) {
    surf(svg, g, cx);
    svg.arrow(cx - 52, 150, cx, SY, { color: "var(--yellow)", strokeWidth: 2.5, head: 10, parent: g });
    [22, 46, 70, 90, 110, 134, 158].forEach(function (deg) {
      var a = deg * Math.PI / 180;
      svg.arrow(cx, SY, cx + Math.cos(a) * 56, SY - Math.sin(a) * 56,
        { color: "var(--green)", strokeWidth: 1.8, head: 7, parent: g });
    });
  }

  function transmissao(svg, g, cx) {
    svg.rect(cx - 74, SY, 148, 58, { fill: "var(--bg-card)", stroke: "none", opacity: 0.8, parent: g });
    normal(svg, g, cx); surf(svg, g, cx);
    svg.arrow(cx - 52, 150, cx, SY, { color: "var(--yellow)", strokeWidth: 2.5, head: 10, parent: g });
    svg.arrow(cx, SY, cx + 28, 266, { color: "var(--cyan)", strokeWidth: 2.5, head: 10, parent: g }); // refratado (desviado)
    svg.arrow(cx, SY, cx + 48, 160, { color: "var(--orange)", strokeWidth: 1.6, head: 7, dashed: "4 4", opacity: 0.5, parent: g });
    svg.text(cx + 34, 250, "refração", { size: 11, color: "var(--cyan)", parent: g, anchor: "start" });
  }

  function panel(svg, g, x, title, caption, drawer) {
    var cx = x + 105;
    svg.text(cx, 64, title, { size: 14, weight: 700, color: "var(--ink)", parent: g });
    svg.rect(x, 84, 210, 200, { fill: "var(--bg-soft)", stroke: "var(--border)", strokeWidth: 1.5, rx: 10, parent: g });
    drawer(svg, g, cx);
    svg.text(cx, 306, caption, { size: 11, color: "var(--ink-dim)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 340);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    panel(svg, grp("esp"), 40, "Especular", "ângulo de entrada = ângulo de saída", especular);
    panel(svg, grp("dif"), 275, "Difusa (Lambert)", "espalha em todas as direções", difusa);
    panel(svg, grp("tra"), 510, "Transmissão / refração", "atravessa e desvia (Snell)", transmissao);
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    var EXX = window.EX, S = EXX.Slides;
    return [
      S.concept({
        title: "Como a luz deixa a superfície",
        body:
          "<p>Quando a luz atinge uma superfície, ela é <b>espalhada</b> (dispersa) de formas " +
          "diferentes, conforme o material. Os tipos básicos definem o aspecto do objeto " +
          "(brilhante, fosco, transparente).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Reflexão especular",
        body:
          "<p>Reflexão tipo <b>espelho</b>: a luz reflete em uma <b>direção bem definida</b>, com " +
          "o <b>ângulo de reflexão igual ao de incidência</b> (em relação à normal).</p>" +
          "<p>Gera os <b>brilhos</b> (<i>highlights</i>) e depende de <b>onde o observador está</b>. " +
          "Superfícies polidas/metálicas.</p>",
        visual: svgStep(["esp"]),
      },
      {
        title: "Reflexão difusa (Lambertiana)",
        body:
          "<p>A luz é <b>espalhada igualmente em todas as direções</b>. O brilho depende do ângulo " +
          "luz-normal (<b>N·L</b>), mas <b>não</b> da posição do observador.</p>" +
          "<p>É o que dá o aspecto <b>fosco</b> (giz, papel, parede).</p>",
        visual: svgStep(["dif"]),
      },
      {
        title: "Transmissão / refração",
        body:
          "<p>Em superfícies <b>transparentes</b>, parte da luz <b>atravessa</b> o material, " +
          "mudando de direção pela <b>lei de Snell</b> (refração) — e parte ainda reflete.</p>" +
          "<p>Responsável por vidro, água, lentes. (Materiais reais costumam misturar especular, " +
          "difuso e transmissão.)</p>",
        visual: svgStep(["tra"]),
      },
      S.comparison({
        title: "Resumo: tipos de dispersão",
        intro: "<p>A diferença-chave: direção <b>concentrada</b> × <b>espalhada</b> × <b>atravessando</b>.</p>",
        headers: ["Tipo", "Direção da luz", "Depende do observador?", "Aspecto"],
        rows: [
          ["Especular", "Reflete num ângulo definido", "Sim", "Brilhante (highlights)"],
          ["Difusa", "Espalha em todas as direções", "Não", "Fosco / opaco"],
          ["Transmissão/refração", "Atravessa e desvia", "Sim", "Transparente (vidro, água)"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q09-dispersao",
    num: "9",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Tipos de dispersão nas superfícies",
    type: "conceitual",
    tags: ["reflexão", "especular", "difusa", "refração"],
    hubDesc: "Especular (espelho), difusa (Lambert) e transmissão/refração (Snell).",
    statement:
      "Quais são os <strong>tipos de dispersão nas superfícies</strong>? Explique.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
