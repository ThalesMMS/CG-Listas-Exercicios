/*
 * g03-bresenham-reta.js — Guia: Bresenham (ponto médio) para retas. A variável
 * de decisão p, por que p₀ = 2Δy − Δx, os incrementos inteiros e o tratamento
 * dos octantes (sx, sy, steep). Comparação direta com o DDA.
 *
 * Reusa window.ALG.bresenhamLine (traço inteiro) + EX.Content / EX.Slides.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var P0 = [0, 0],
    P1 = [6, 4];
  var R = ALG.bresenhamLine(P0, P1); // dx=6, dy=4, p0=2, incNeg=8, incPos=-4
  var BOUNDS = [-1, 7, -1, 5];

  function scene(plane, upto) {
    plane.segment(P0, P1, { color: COL.muted, dashed: true });
    plane.point(P0[0], P0[1], { color: COL.muted, radius: 3 });
    plane.point(P1[0], P1[1], { color: COL.muted, radius: 3, label: "(6,4)" });
    for (var k = 0; k < upto; k++) {
      var px = R.pixels[k];
      plane.pixel(px[0], px[1], { fill: COL.accentSoft, stroke: COL.accent });
    }
  }

  function build() {
    var steps = [];

    // 1) Motivação
    steps.push({
      title: "Mesma meta do DDA, sem números reais",
      body:
        "<p>O DDA acerta os pixels, mas usa frações/float e arredonda a cada passo. Bresenham faz a " +
        "<b>mesma reta usando só inteiros</b> — somas e comparações de sinal, sem divisão e sem " +
        "arredondamento.</p>" +
        "<p>Por isso virou o algoritmo clássico de hardware: barato, exato e sem erro acumulado.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 2) Ideia: ponto médio
    steps.push({
      title: "A ideia: o ponto médio decide",
      body:
        "<p>Estando num pixel <code>(x, y)</code> e indo para a direita, só há <b>dois candidatos</b>: " +
        "<span class='accent'>E = (x+1, y)</span> ou <span class='hl'>NE = (x+1, y+1)</span>.</p>" +
        "<p>Para escolher, olhamos o <b>ponto médio</b> <code>M = (x+1, y+½)</code>: se a reta ideal " +
        "passa <b>acima</b> de M, ela está mais perto de NE; se passa <b>abaixo</b>, mais perto de E. " +
        "A <span class='hl'>variável de decisão p</span> é justamente o sinal de “reta − M”.</p>",
      visual: {
        type: "plane",
        bounds: [1, 5, 0, 3],
        draw: function (plane) {
          plane.segment(P0, P1, { color: COL.muted, dashed: true });
          // a partir de (2,1): candidatos E e NE
          plane.pixel(2, 1, { fill: COL.accentSoft, stroke: COL.accent, label: "(x,y)" });
          plane.pixel(3, 1, { fill: "transparent", stroke: COL.cyan, label: "E" });
          plane.pixel(3, 2, { fill: "transparent", stroke: COL.green, label: "NE" });
          plane.point(3, 1.5, { color: COL.yellow, radius: 4, label: "M", labelColor: COL.yellow });
        },
      },
    });

    // 3) Derivação dos inteiros
    steps.push({
      title: "Por que p₀ = 2Δy − Δx",
      body:
        "<p>Avaliar a reta no ponto médio dá uma expressão com <code>Δy/Δx</code> (fração). " +
        "Multiplicamos tudo por <code>2Δx</code> para <b>limpar o denominador</b> e o ½ — e o que " +
        "sobra é <b>inteiro</b>. O valor inicial vira:</p>" +
        "<div class='formula'>p₀ = 2Δy − Δx = 2·4 − 6 = " +
        R.p0val +
        "</div>" +
        "<p>Os incrementos também são inteiros e <b>pré-calculados</b> (não dependem do passo):</p>" +
        "<div class='formula'>se p &lt; 0 → escolhe E:   p += 2Δy = " +
        R.incNeg +
        "\nse p ≥ 0 → escolhe NE:  p += 2Δy − 2Δx = " +
        R.incPos +
        "</div>" +
        "<p>Cada passo é uma soma e um teste <code>p &lt; 0?</code>. Nada de multiplicar ou dividir.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 4..n) Traço
    R.rows.forEach(function (rw, i) {
      var last = i === R.rows.length - 1;
      steps.push({
        title: "i = " + i + ": pixel (" + rw.x + ", " + rw.y + ")",
        body:
          "<p>Pixel atual <span class='ok'>(" +
          rw.x +
          ", " +
          rw.y +
          ")</span> com <code>p = " +
          rw.p +
          "</code>.</p>" +
          (last
            ? "<p>Chegamos ao extremo final. Fim do laço.</p>"
            : "<p>Como <code>p " +
              (rw.p < 0 ? "&lt; 0" : "≥ 0") +
              "</code>, o próximo é <span class='hl'>" +
              (rw.p < 0 ? "E (só x++)" : "NE (x++, y++)") +
              "</span> e atualizamos <code>p += " +
              (rw.p < 0 ? R.incNeg : R.incPos) +
              "</code>.</p>"),
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            scene(plane, i);
            plane.pixel(rw.x, rw.y, { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Octantes
    steps.push({
      title: "E as outras inclinações?",
      body:
        "<p>A derivação acima vale para o <b>1º octante</b> (reta suave subindo à direita, " +
        "<code>0 ≤ Δy ≤ Δx</code>). Os outros 7 casos saem por <b>simetria</b>, sem refazer a conta:</p>" +
        "<ul>" +
        "<li><b>Sentido</b>: <code>sx, sy = ±1</code> tratam retas que descem ou vão para a esquerda.</li>" +
        "<li><b>Inclinação &gt; 45°</b> (<code>Δy &gt; Δx</code>, <em>steep</em>): trocamos os papéis de " +
        "<code>x</code> e <code>y</code> — andamos 1 em <code>y</code> e decidimos <code>x</code>.</li>" +
        "</ul>" +
        "<p>Assim um único núcleo cobre os 360°.</p>",
      visual: {
        type: "plane",
        bounds: [-5, 5, -5, 5],
        draw: function (plane) {
          var c = [0, 0];
          var dirs = [
            [4, 1],
            [1, 4],
            [-1, 4],
            [-4, 1],
            [-4, -1],
            [-1, -4],
            [1, -4],
            [4, -1],
          ];
          dirs.forEach(function (d, k) {
            plane.segment(c, d, {
              color: k === 0 ? COL.green : COL.accent,
              lineWidth: k === 0 ? 3 : 1.5,
            });
          });
          plane.point(0, 0, { color: COL.yellow, radius: 3 });
          plane.text(4, 1, "1º octante", { color: COL.green, dx: -30, dy: -8 });
        },
      },
    });

    // n+2) Comparação
    steps.push({
      title: "Bresenham × DDA, lado a lado",
      body:
        "<p>Para esta mesma reta (0,0)→(6,4), os <b>dois geram os pixels idênticos</b>: " +
        "(0,0)(1,1)(2,1)(3,2)(4,3)(5,3)(6,4). A diferença está por baixo do capô.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.prosCons(host, {
            pros: [
              "Só inteiros: soma e teste de sinal",
              "Sem divisão, sem arredondar",
              "Sem erro acumulado (exato)",
              "Ideal para implementar em hardware",
            ],
            cons: [
              "Menos óbvio: precisa entender a variável p",
              "Derivação muda de eixo nos casos steep",
            ],
          });
        },
      },
    });

    // n+3) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Empate (p = 0)</b>: é convenção. Aqui usamos <code>p ≥ 0 → NE</code>; outra " +
        "convenção daria o pixel vizinho num ponto. Só seja consistente.</li>" +
        "<li><b>Octante errado</b>: aplicar a fórmula do 1º octante a uma reta steep gera buracos — " +
        "lembre de trocar <code>x</code>↔<code>y</code>.</li>" +
        "<li><b>p e (x,y)</b> são lidos <b>antes</b> de atualizar; o pixel desenhado é o atual.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html:
              "O ponto médio entre os dois candidatos transforma “qual pixel?” num " +
              "<b>teste de sinal inteiro</b> que se atualiza somando uma constante.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g03-bresenham-reta",
    num: "B",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "Bresenham para retas",
    type: "computacional",
    tags: ["rasterização", "reta", "bresenham"],
    hubDesc: "A variável de decisão p, por que p₀ = 2Δy − Δx, incrementos inteiros e octantes.",
    statement:
      "Entenda o algoritmo de Bresenham para retas: a variável de decisão p (ponto médio), por que " +
      "p₀ = 2Δy − Δx, a atualização incremental inteira e o tratamento dos octantes.",
    parts: [{ label: "Guia", build: build }],
  });
})();
