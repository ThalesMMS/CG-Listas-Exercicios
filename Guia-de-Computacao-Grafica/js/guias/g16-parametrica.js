/*
 * g16-parametrica.js — Guia: curvas paramétricas interpoladas.
 * Como obter x(u) e y(u) a partir dos pontos de controle, de modo que a curva
 * PASSE por eles em u = 0, ⅓, ⅔, 1. Foco no porquê da matriz de interpolação.
 *
 * Exemplo e coeficientes reaproveitados da Lista 2 (q12). Visual: plane + mat().
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var MAT = EX.Guia.mat, ROW = EX.Guia.row, DOM = EX.Guia.dom;

  var P = [[1, 2], [3, 4], [4, 2], [7, 5]]; // p0..p3
  var NAMES = ["p₀", "p₁", "p₂", "p₃"];
  var CX = [13.5, -18, 10.5, 1]; // x(u) = 13,5u³ − 18u² + 10,5u + 1
  var CY = [40.5, -58.5, 21, 2]; // y(u) = 40,5u³ − 58,5u² + 21u + 2
  var B = [-1, 8, 0, 6];

  function cubic(c, u) { return ((c[0] * u + c[1]) * u + c[2]) * u + c[3]; }
  function at(u) { return [cubic(CX, u), cubic(CY, u)]; }

  var MI = MAT([
    ["−9/2", "27/2", "−27/2", "9/2"],
    ["9", "−45/2", "18", "−9/2"],
    ["−11/2", "9", "−9/2", "1"],
    ["1", "0", "0", "0"],
  ]);

  function drawControls(plane, withCurve) {
    plane.polyline(P, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
    P.forEach(function (p, i) {
      plane.point(p[0], p[1], {
        color: withCurve ? COL.yellow : COL.accent,
        radius: 5,
        label: NAMES[i] + "(" + p[0] + "," + p[1] + ")",
        labelColor: COL.ink,
      });
    });
  }
  function drawCurve(plane) {
    var pts = [];
    for (var u = 0; u <= 1.0001; u += 0.02) pts.push(at(u));
    plane.polyline(pts, { stroke: COL.accent, lineWidth: 3 });
    [0, 1 / 3, 2 / 3, 1].forEach(function (u) {
      var p = at(u);
      plane.point(p[0], p[1], { color: COL.green, radius: 4 });
    });
  }

  function build() {
    return [
      {
        title: "Uma curva que passa pelos pontos",
        body:
          "<p>Dados 4 pontos de controle, queremos uma curva <b>suave</b> que <b>passe por todos</b> " +
          "eles — diferente da Bézier, que só toca os extremos e é “puxada” pelos do meio.</p>" +
          "<p>Descrevemos a curva por duas funções de um parâmetro: <code>x(u)</code> e " +
          "<code>y(u)</code>, com <code>u ∈ [0, 1]</code>.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, false); },
        },
      },
      {
        title: "A condição de interpolação",
        body:
          "<p>Cada coordenada é um <b>polinômio cúbico</b> em u: <code>x(u) = a u³ + b u² + c u + d</code> " +
          "(idem y). São 4 incógnitas por coordenada.</p>" +
          "<p>Impomos que a curva passe pelos pontos em nós <b>igualmente espaçados</b> " +
          "<code>u = 0, ⅓, ⅔, 1</code>. Isso dá 4 equações → resolve-se invertendo a matriz dos " +
          "<code>uⁱ</code> nesses nós, que é a <b>matriz de interpolação</b> <code>M_I</code>.</p>",
        visual: DOM(
          ROW("[a b c d]ₓ = M_I · [x₀ x₁ x₂ x₃]ᵀ") + ROW("M_I =&nbsp;" + MI)
        ),
      },
      {
        title: "Montando os coeficientes",
        body:
          "<p>Multiplicando <code>M_I</code> pelos valores de x dos pontos " +
          "<code>[1, 3, 4, 7]</code>:</p>" +
          "<div class='formula'>u³: −9/2·1 + 27/2·3 − 27/2·4 + 9/2·7 = 27/2 = 13,5\n" +
          "u²: 9·1 − 45/2·3 + 18·4 − 9/2·7 = −18\n" +
          "u¹: −11/2·1 + 9·3 − 9/2·4 + 1·7 = 21/2 = 10,5\n" +
          "u⁰: 1·1 = 1</div>" +
          "<p>O mesmo com os valores de y <code>[2, 4, 2, 5]</code> dá os coeficientes de " +
          "<code>y(u)</code>.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, false); },
        },
      },
      {
        title: "As funções x(u) e y(u)",
        body:
          "<div class='formula'>x(u) = 13,5u³ − 18u² + 10,5u + 1\n" +
          "y(u) = 40,5u³ − 58,5u² + 21u + 2</div>" +
          "<p>Pronto: um único par de polinômios descreve toda a curva. Para desenhar, é só varrer " +
          "<code>u</code> de 0 a 1 e avaliar (Horner é eficiente).</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, true); drawCurve(plane); },
        },
      },
      {
        title: "Desenhando e conferindo",
        body:
          "<p>Os pontos verdes marcam os nós <code>u = 0, ⅓, ⅔, 1</code> — e eles caem <b>exatamente</b> " +
          "sobre os pontos de controle:</p>" +
          "<ul><li><code>x(⅓) = 3, y(⅓) = 4</code> → p₁ ✓</li>" +
          "<li><code>x(⅔) = 4, y(⅔) = 2</code> → p₂ ✓</li></ul>" +
          "<p>É a marca da interpolação: a curva <b>encosta</b> em cada ponto no seu nó.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, true); drawCurve(plane); },
        },
      },
      {
        title: "Comparação e cuidados",
        body: "<p>Interpolada × Bézier — quando usar cada uma:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Interpolada", "Bézier"],
              rows: [
                ["Passa pelos pontos?", "sim (todos)", "só pelos extremos"],
                ["Pontos do meio", "a curva os cruza", "atraem (casca convexa)"],
                ["Boa para", "encostar em dados", "design de formas"],
                ["Risco", "oscila/ondula com pontos ruins", "mais estável"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Impor “passar por p_i em u_i” vira um sistema linear; <b>M_I</b> resolve e entrega os " +
                "coeficientes de x(u), y(u). Nós diferentes → outra M_I.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g16-parametrica",
    num: "x(u)",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Curvas paramétricas interpoladas",
    type: "computacional",
    tags: ["curvas", "paramétrica", "interpolação"],
    hubDesc: "x(u), y(u) a partir dos pontos de controle via M_I; a curva passa por todos os pontos.",
    statement:
      "Entenda como obter as funções x(u) e y(u) de uma curva paramétrica interpolada a partir dos " +
      "pontos de controle, de modo que a curva passe por eles nos nós u = 0, ⅓, ⅔, 1.",
    parts: [{ label: "Guia", build: build }],
  });
})();
