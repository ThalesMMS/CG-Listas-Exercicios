/*
 * q24.js — "O ponto inicial pode ser atualizado mais de uma vez. Exemplifique."
 * (conceitual)
 *
 * Exemplo do gabarito (lado CA): C(9,2) está acima/à direita do que cabe na
 * janela; é recortado na fronteira direita para (5,0); o novo ponto AINDA está
 * abaixo, e o segmento com A(-1,-3) é rejeitado. Usamos o traço real de
 * ALG.cohenSutherland para animar a atualização sucessiva de C.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-4, 11, -5, 9];

  var C = { x: 9, y: 2 };
  var A = { x: -1, y: -3 };

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  function drawEdge(plane, edge) {
    var B = ALG.BITS;
    var a, b;
    if (edge & B.TOP) {
      a = { x: W.xmin, y: W.ymax };
      b = { x: W.xmax, y: W.ymax };
    } else if (edge & B.BOTTOM) {
      a = { x: W.xmin, y: W.ymin };
      b = { x: W.xmax, y: W.ymin };
    } else if (edge & B.RIGHT) {
      a = { x: W.xmax, y: W.ymin };
      b = { x: W.xmax, y: W.ymax };
    } else {
      a = { x: W.xmin, y: W.ymin };
      b = { x: W.xmin, y: W.ymax };
    }
    plane.segment(a, b, { color: COL.yellow, lineWidth: 3 });
  }

  // Segmento CA original esmaecido + extremo fixo A.
  function bg(plane) {
    drawWindow(plane);
    plane.segment(C, A, { color: "rgba(120,140,170,0.45)", lineWidth: 1.5, dashed: [5, 4] });
    plane.point(A.x, A.y, { color: COL.purple, radius: 4, label: "A(-1,-3) 0100", labelColor: COL.ink, labelDy: 16 });
  }

  var run = ALG.cohenSutherland(ALG.P(C.x, C.y), ALG.P(A.x, A.y), W);
  // run.steps: [codes, clip(direita -> (5,0)), reject]
  var codesStep = run.steps[0];
  var clipStep = run.steps[1];
  var rejectStep = run.steps[2];

  window.GUI.register({
    id: 24,
    num: "24",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "O ponto inicial pode ser atualizado mais de uma vez",
    type: "conceitual",
    hubDesc: "Um extremo fora por 2 fronteiras é recortado em etapas (CA: C→(5,0)→rejeição).",
    enunciado:
      "O ponto inicial pode ser atualizado mais de uma vez. Exemplifique.",
    parts: [
      {
        label: "Explicação + exemplo",
        build: function () {
          return [
            {
              titulo: "Sim: um ponto pode estar fora por mais de uma fronteira",
              explicacao:
                "<p>O código de região tem <b>até dois bits ligados</b> ao mesmo tempo (um canto). Por exemplo, um ponto pode estar <b>acima E à direita</b> da janela.</p>" +
                "<p>Cada iteração do Cohen-Sutherland corrige <span class='hl'>apenas uma fronteira</span>: move o extremo para a interseção com aquela aresta e <b>recalcula o código</b>. Se o novo ponto continuar fora por outro lado, ele será <span class='hl'>atualizado de novo</span>.</p>" +
                "<p class='muted'>Por isso o mesmo ponto inicial pode ser substituído várias vezes antes de o algoritmo aceitar ou rejeitar o segmento.</p>",
            },
            {
              titulo: "Exemplo — lado CA: códigos iniciais",
              explicacao:
                "<p>Tomamos o lado <b>CA</b>, de <b>C(9,2)</b> a <b>A(-1,-3)</b>, contra a janela <b>-2 ≤ x ≤ 5</b>, <b>1 ≤ y ≤ 6</b>:</p>" +
                "<div class='formula'>C(9, 2)  → " + ALG.codeBits(codesStep.ca) + "  (" + ALG.codeNames(codesStep.ca) + ")\n" +
                "A(-1,-3) → " + ALG.codeBits(codesStep.cb) + "  (" + ALG.codeNames(codesStep.cb) + ")</div>" +
                "<p>C está fora pela <span class='hl'>direita</span> e A está fora <span class='hl'>abaixo</span>. Não há aceitação nem rejeição trivial ainda — o algoritmo começa recortando C.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                plane.point(C.x, C.y, { color: COL.orange, radius: 5, ring: COL.orange, label: "C(9,2) " + ALG.codeBits(codesStep.ca), labelColor: COL.orange });
              },
            },
            {
              titulo: "1ª atualização de C — recorte na direita",
              explicacao:
                "<p>C está fora pela <b>direita</b>, então o recortamos na fronteira <b>x = 5</b>:</p>" +
                "<div class='formula'>C(9,2)  recorta em  x=5\n→ novo ponto " + ALG.plabel(clipStep.to) + "</div>" +
                "<p>O ponto antigo (9,2) é descartado. Recalculamos o código do novo ponto:</p>" +
                "<div class='formula'>" + ALG.plabel(clipStep.to) + " → " + ALG.codeBits(clipStep.ca) + "  (" + ALG.codeNames(clipStep.ca) + ")</div>" +
                "<p>Atenção: o novo C <span class='no'>ainda não está dentro</span> — ele caiu <b>abaixo</b> da janela.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                drawEdge(plane, clipStep.edge);
                // ponto antigo descartado
                plane.point(C.x, C.y, { color: COL.red, radius: 5, ring: COL.red, label: "(9,2) descartado", labelColor: COL.red });
                // novo C
                plane.point(ALG.nx(clipStep.to), ALG.ny(clipStep.to), {
                  color: COL.green, radius: 5, ring: COL.green,
                  label: ALG.plabel(clipStep.to) + " → " + ALG.codeBits(clipStep.ca), labelColor: COL.green, labelDy: 16,
                });
              },
            },
            {
              titulo: "O mesmo extremo seria atualizado de novo (mas aqui há rejeição)",
              explicacao:
                "<p>O novo ponto " + ALG.plabel(clipStep.to) + " tem código <span class='hl'>" + ALG.codeBits(clipStep.ca) +
                "</span> (abaixo). Em um caso geral, ele seria recortado <b>outra vez</b> na fronteira inferior — daí o ponto inicial mudar mais de uma vez.</p>" +
                "<p>Neste exemplo específico, porém, A também está abaixo. Os dois extremos compartilham o bit <b>B</b>:</p>" +
                "<div class='formula'>" + ALG.codeBits(rejectStep.ca) + " & " + ALG.codeBits(rejectStep.cb) +
                " = " + ALG.codeBits(rejectStep.ca & rejectStep.cb) + " ≠ 0  →  rejeição trivial</div>" +
                "<p>Logo o segmento CA é <span class='no'>descartado</span>. A lição permanece: depois de cada recorte é obrigatório <b>recalcular o código</b>, pois o mesmo ponto pode precisar de novos recortes.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                plane.segment(clipStep.to, A, { color: COL.red, lineWidth: 2, dashed: [6, 5] });
                plane.point(ALG.nx(clipStep.to), ALG.ny(clipStep.to), {
                  color: COL.red, radius: 5, ring: COL.red,
                  label: ALG.plabel(clipStep.to) + " " + ALG.codeBits(rejectStep.ca), labelColor: COL.red, labelDy: 16,
                });
                plane.point(A.x, A.y, { color: COL.red, radius: 5, ring: COL.red });
              },
            },
          ];
        },
      },
    ],
  });
})();
