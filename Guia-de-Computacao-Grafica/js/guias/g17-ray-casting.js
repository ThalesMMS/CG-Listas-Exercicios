/*
 * g17-ray-casting.js — Guia: Ray Casting.
 * Um raio por pixel, do observador através do plano de visualização; o primeiro
 * objeto atingido é o visível. Otimizações e comparação com a rasterização.
 *
 * Visual: SVG (svg.line/circle/ellipse/rect/arrow/text).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var EYE = [70, 170];
  var PX = 190; // x do plano de visualização
  var PYS = [90, 130, 170, 210, 250]; // centros dos pixels
  var S1 = [430, 150], R1 = 60; // esfera próxima
  var S2 = [470, 250], R2 = 40; // esfera distante

  function camera(svg) {
    svg.ellipse(EYE[0], EYE[1], 24, 16, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2 });
    svg.circle(EYE[0], EYE[1], 8, { fill: "var(--ink)" });
    svg.text(EYE[0], EYE[1] + 34, "olho", { size: 12, color: "var(--ink-dim)", weight: 700 });
    PYS.forEach(function (py) {
      svg.rect(PX - 13, py - 18, 26, 36, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.3 });
    });
    svg.text(PX, 290, "plano de visualização", { size: 11, color: "var(--ink-dim)" });
  }
  function scene(svg) {
    svg.circle(S2[0], S2[1], R2, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
    svg.circle(S1[0], S1[1], R1, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
  }
  // raio do olho pelo pixel py, prolongado até x=far
  function rayTo(py, far) {
    var dx = PX - EYE[0], dy = py - EYE[1];
    var t = (far - EYE[0]) / dx;
    return [far, EYE[1] + dy * t];
  }

  function build() {
    return [
      {
        title: "O que cada pixel enxerga?",
        body:
          "<p>Ray Casting inverte a pergunta da projeção: em vez de jogar objetos na tela, para " +
          "<b>cada pixel</b> lançamos um <b>raio</b> a partir do observador, atravessando aquele pixel " +
          "rumo à cena.</p>" +
          "<p>O <b>primeiro objeto atingido</b> é o que aquele pixel mostra. A visibilidade " +
          "(o que está na frente) sai <b>de graça</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 310);
            camera(svg);
            scene(svg);
          },
        },
      },
      {
        title: "Um raio por pixel",
        body:
          "<p>O raio é uma semirreta: <code>P(t) = olho + t·d</code>, com <code>d</code> apontando do " +
          "olho para o centro do pixel. Variando <code>t &gt; 0</code> avançamos na cena.</p>" +
          "<p>São tantos raios quantos pixels — cada um percorrendo a cena à procura de interseções.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 310);
            PYS.forEach(function (py) {
              var e = rayTo(py, 540);
              svg.line(EYE[0], EYE[1], e[0], e[1], { stroke: "var(--ink-mute)", strokeWidth: 1.3, dashed: "5 5" });
            });
            camera(svg);
            scene(svg);
          },
        },
      },
      {
        title: "A primeira interseção vence",
        body:
          "<p>Um raio pode cruzar <b>vários</b> objetos. Calculamos todos os <code>t &gt; 0</code> e " +
          "ficamos com o <b>menor</b> — o ponto mais próximo do olho.</p>" +
          "<p>Tudo que estiver <b>atrás</b> desse ponto é automaticamente <b>ocultado</b>. Sem " +
          "z-buffer, sem ordenar polígonos.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 310);
            var hit = [S1[0] - R1, 170];
            var beyond = rayTo(170, 540);
            svg.line(EYE[0], EYE[1], beyond[0], beyond[1], { stroke: "var(--ink-mute)", strokeWidth: 1.2, dashed: "4 4" });
            svg.line(EYE[0], EYE[1], hit[0], hit[1], { stroke: "var(--yellow)", strokeWidth: 3 });
            camera(svg); scene(svg);
            svg.circle(hit[0], hit[1], 6, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(hit[0] - 6, hit[1] - 16, "1ª interseção", { size: 11, color: "var(--yellow)", weight: 700, anchor: "end" });
          },
        },
      },
      {
        title: "Otimizações: não testar tudo",
        body:
          "<p>Testar cada raio contra cada objeto é caro. Acelera-se com:</p>" +
          "<ul>" +
          "<li><b>Volumes envolventes</b> (caixas/esferas): se o raio nem toca a caixa, pula o objeto;</li>" +
          "<li><b>Estruturas espaciais</b> (grade, BVH, octree, BSP): descartam regiões inteiras;</li>" +
          "<li><b>Parada no 1º acerto</b> quando só importa visibilidade.</li>" +
          "</ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 310);
            svg.rect(S1[0] - R1 - 6, S1[1] - R1 - 6, 2 * R1 + 12, 2 * R1 + 12, { fill: "none", stroke: "var(--orange)", strokeWidth: 1.5, dashed: "6 4" });
            svg.text(S1[0], S1[1] - R1 - 14, "bounding box", { size: 11, color: "var(--orange)", weight: 700 });
            camera(svg); scene(svg);
          },
        },
      },
      {
        title: "Comparação e resumo",
        body: "<p>Ray Casting × rasterização — duas ordens de processar a cena:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Ray Casting", "Rasterização"],
              rows: [
                ["Laço externo", "por pixel (image-order)", "por primitiva (object-order)"],
                ["Visibilidade", "1ª interseção (natural)", "z-buffer"],
                ["Sombras/reflexos", "fáceis (lançar mais raios)", "exigem truques"],
                ["Custo", "maior por pixel", "muito rápido em GPU"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Um raio por pixel, fique com a <b>interseção mais próxima</b>. É a base do " +
                "<b>ray tracing</b> (que continua lançando raios para sombra/reflexo/refração).",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g17-ray-casting",
    num: "⟶",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Ray Casting",
    type: "conceitual",
    tags: ["ray casting", "visibilidade", "renderização"],
    hubDesc: "Um raio por pixel do observador; 1ª interseção é visível; otimizações; vs rasterização.",
    statement:
      "Entenda o Ray Casting: o cálculo dos pixels do plano de visualização a partir do observador, o " +
      "lançamento de um raio por pixel, a primeira interseção como superfície visível e otimizações.",
    parts: [{ label: "Guia", build: build }],
  });
})();
