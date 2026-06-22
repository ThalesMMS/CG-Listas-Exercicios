/*
 * q01.js — Cor física, cor do objeto e cor percebida.
 * Diagrama SVG da "cadeia da cor": fonte de luz -> objeto -> olho/cérebro.
 * Revelação por etapas (física / objeto / percebida).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  // Espectro visível (do violeta ao vermelho) usando as cores do tema.
  var SPECTRUM = [
    "var(--purple)", "var(--accent)", "var(--cyan)",
    "var(--green)", "var(--yellow)", "var(--orange)", "var(--red)",
  ];

  // Desenha a cena. stage: "fisica" | "objeto" | "percebida" | "all".
  function scene(svg, stage) {
    svg.view(760, 440);

    // Cria um grupo com opacidade conforme as etapas em que ele está "aceso".
    function grp(names) {
      var g = svg.group({});
      var on = stage === "all" || names.indexOf(stage) !== -1;
      g.setAttribute("opacity", on ? 1 : 0.16);
      return g;
    }
    var gF = grp(["fisica"]);       // fonte de luz + espectro
    var gO = grp(["objeto"]);       // objeto + reflectância
    var gR = grp(["objeto", "percebida"]); // luz refletida
    var gP = grp(["percebida"]);    // olho + cérebro

    // ---- Fonte de luz (lâmpada/sol) ----
    var i, a;
    for (i = 0; i < 12; i++) {
      a = (i / 12) * Math.PI * 2;
      svg.line(100 + Math.cos(a) * 38, 180 + Math.sin(a) * 38,
               100 + Math.cos(a) * 54, 180 + Math.sin(a) * 54,
               { stroke: "var(--yellow)", strokeWidth: 3, parent: gF });
    }
    svg.circle(100, 180, 30, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 3, parent: gF });
    svg.text(100, 234, "Fonte de luz", { size: 14, color: "var(--ink)", weight: 700, parent: gF });

    // ---- Feixe = espectro (luz física) ----
    svg.text(232, 138, "luz branca = espectro", { size: 12.5, color: "var(--ink-dim)", parent: gF });
    for (i = 0; i < SPECTRUM.length; i++) {
      svg.rect(146, 150 + i * 9, 170, 9, { fill: SPECTRUM[i], parent: gF });
    }

    // ---- Objeto (reflete o vermelho, absorve o resto) ----
    svg.rect(320, 122, 118, 118, { fill: "var(--red)", stroke: "var(--ink-mute)", strokeWidth: 2, rx: 8, opacity: 0.9, parent: gO });
    svg.text(379, 264, "Objeto", { size: 14, color: "var(--ink)", weight: 700, parent: gO });
    svg.text(379, 284, "(reflete o vermelho)", { size: 11.5, color: "var(--ink-dim)", parent: gO });
    // Setas curtas das cores absorvidas "entrando" e sumindo no objeto.
    svg.text(300, 110, "absorve", { size: 11, color: "var(--ink-mute)", parent: gO });

    // ---- Luz refletida (somente o vermelho) ----
    svg.arrow(440, 150, 596, 138, { color: "var(--red)", strokeWidth: 3, head: 12, parent: gR });
    svg.text(520, 116, "reflexão (vermelho)", { size: 12, color: "var(--red)", parent: gR });

    // ---- Olho / observador ----
    svg.ellipse(648, 138, 46, 28, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2, parent: gP });
    svg.circle(648, 138, 16, { fill: "var(--accent)", parent: gP });
    svg.circle(648, 138, 7, { fill: "var(--ink)", parent: gP });
    svg.text(648, 184, "Olho / observador", { size: 13, color: "var(--ink)", weight: 700, parent: gP });
    // Cérebro / percepção
    svg.arrow(648, 168, 648, 250, { color: "var(--purple)", strokeWidth: 2, head: 10, parent: gP });
    svg.rect(566, 252, 164, 50, { fill: "var(--bg-soft)", stroke: "var(--purple)", strokeWidth: 2, rx: 10, parent: gP });
    svg.text(648, 277, "percepção (cérebro)", { size: 13, color: "var(--purple)", weight: 700, parent: gP });
  }

  function svgStep(stage) {
    return { type: "svg", draw: function (svg) { scene(svg, stage); } };
  }

  function build() {
    return [
      S.concept({
        title: "A cor é uma cadeia: luz → objeto → observador",
        body:
          "<p>Em Computação Gráfica, <b>cor não é uma propriedade única</b>. Ela nasce da " +
          "interação entre três coisas: a <span class='hl'>luz</span> que ilumina, o " +
          "<span class='no'>objeto</span> que reflete e o <span class='accent'>observador</span> " +
          "que percebe.</p>" +
          "<p>Por isso distinguimos <b>cor física</b>, <b>cor do objeto</b> e " +
          "<b>cor percebida</b> — cada uma em um ponto dessa cadeia (ao lado).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "1) Cor física — a luz em si",
        body:
          "<p>A <span class='hl'>cor física</span> é a própria <b>luz/energia</b>: a radiação " +
          "eletromagnética emitida pela fonte, descrita pelo seu <b>espectro</b> " +
          "(comprimentos de onda) e intensidade.</p>" +
          "<p>É objetiva e mensurável — independe de haver objeto ou observador. " +
          "Ex.: a luz branca do Sol contém todo o espectro visível.</p>",
        visual: svgStep("fisica"),
      },
      {
        title: "2) Cor do objeto — reflexão seletiva",
        body:
          "<p>A <span class='no'>cor do objeto</span> resulta da <b>reflexão e absorção " +
          "seletivas</b>: o material <b>absorve</b> alguns comprimentos de onda e " +
          "<b>reflete</b> outros, conforme sua <b>reflectância</b>.</p>" +
          "<p>Uma maçã \"vermelha\" reflete os comprimentos longos (vermelho) e absorve o resto. " +
          "A cor do objeto depende, então, do <b>material</b> — e da luz que incide sobre ele.</p>",
        visual: svgStep("objeto"),
      },
      {
        title: "3) Cor percebida — a sensação no observador",
        body:
          "<p>A <span class='accent'>cor percebida</span> é a <b>sensação</b> construída pelo " +
          "sistema visual: a luz refletida chega à retina e o <b>cérebro</b> a interpreta.</p>" +
          "<p>Depende do observador e do <b>contexto</b> (iluminação ao redor, cores vizinhas, " +
          "adaptação do olho). Por isso a cor percebida pode <b>diferir</b> da cor física — duas " +
          "pessoas, ou a mesma pessoa sob luzes diferentes, podem perceber cores distintas.</p>",
        visual: svgStep("percebida"),
      },
      S.comparison({
        title: "Resumo: as três cores",
        intro: "<p>Cada conceito mora em um ponto da cadeia <b>luz → objeto → olho</b>.</p>",
        headers: ["", "Cor física", "Cor do objeto", "Cor percebida"],
        rows: [
          ["O que é", "A luz/energia em si", "Reflexão seletiva da luz", "Sensação no observador"],
          ["Depende de", "Fonte (espectro)", "Material (reflectância)", "Olho + cérebro + contexto"],
          ["Natureza", "Objetiva, mensurável", "Físico-óptica", "Subjetiva, perceptual"],
          ["Exemplo", "Luz branca do Sol", "Maçã reflete o vermelho", "Percebemos \"vermelho\""],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q01-cores",
    num: "1",
    subject: "Computação Gráfica — Lista 3",
    section: "I) Cor e Percepção",
    title: "Cor física, cor do objeto e cor percebida",
    type: "conceitual",
    tags: ["cor", "percepção", "luz"],
    hubDesc: "A cadeia da cor: a luz emitida, a reflexão do objeto e a sensação no observador.",
    statement:
      "Conceitue <strong>cor física</strong>, <strong>cor do objeto</strong> e " +
      "<strong>cor percebida</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
