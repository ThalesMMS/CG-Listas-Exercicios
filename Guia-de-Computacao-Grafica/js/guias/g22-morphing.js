/*
 * g22-morphing.js — Guia: morphing por vértices (e por arestas).
 * Transformação gradual de uma forma em outra (pentágono → heptágono); o
 * problema da correspondência quando o número de vértices difere, e a
 * interpolação 1-a-1 dos vértices.
 *
 * Visual: plane (polígonos). Exemplo e reamostragem da Lista 3 (q18).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  function ngon(n, R) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var a = (90 + (k * 360) / n) * Math.PI / 180;
      out.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    return out;
  }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }

  var A = ngon(5, 4); // pentágono
  var B = ngon(7, 4); // heptágono
  var Ap = [A[0], A[1], mid(A[1], A[2]), A[2], A[3], mid(A[3], A[4]), A[4]]; // 7 pontos
  var BND = [-6.5, 6.5, -6, 6.5];

  function build() {
    var steps = [];

    steps.push({
      title: "Transformar uma forma na outra",
      body:
        "<p>Morphing faz uma forma <b>A</b> virar outra <b>B</b> de modo contínuo. Cada vértice de A " +
        "“caminha” até um vértice de B.</p>" +
        "<p>O obstáculo aqui: <span class='accent'>A é um pentágono (5)</span> e " +
        "<span class='ok'>B é um heptágono (7)</span> — contagens diferentes. Não dá para parear " +
        "1-a-1 direto.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(A, { stroke: COL.accent, lineWidth: 2.5 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 2.5 });
          plane.text(-6.2, 5.6, "A: pentágono", { color: COL.accent });
          plane.text(-6.2, -5.4, "B: heptágono", { color: COL.green });
        },
      },
    });

    steps.push({
      title: "Igualar a contagem: reamostrar",
      body:
        "<p>Para parear 1-a-1, levamos A a <b>7 pontos</b> inserindo <b>pontos médios</b> de algumas " +
        "arestas (aqui, nas posições 2 e 5). A forma de A <b>não muda</b> — só ganha vértices extras.</p>" +
        "<p>Agora A′ e B têm 7 vértices cada, prontos para a correspondência.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2.5 });
          Ap.forEach(function (p, i) {
            var ins = i === 2 || i === 5;
            plane.point(p[0], p[1], { color: ins ? COL.orange : COL.accent, radius: ins ? 6 : 4, label: "A'" + i, labelColor: COL.ink });
          });
        },
      },
    });

    steps.push({
      title: "Correspondência 1-a-1",
      body:
        "<p>Pareamos <code>A′ₖ ↔ Bₖ</code> (as linhas tracejadas). Cada par define o <b>trajeto</b> de " +
        "um vértice durante o morph.</p>" +
        "<p>A qualidade do morph depende dessa correspondência: um pareamento ruim faz a forma " +
        "<b>dobrar</b> ou se auto-cruzar no meio do caminho.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          for (var k = 0; k < 7; k++)
            plane.segment(Ap[k], B[k], { color: COL.muted, dashed: true, lineWidth: 1.2 });
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 2 });
        },
      },
    });

    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      var poly = Ap.map(function (p, k) { return lerp(p, B[k], t); });
      var c = t <= 0.001 ? COL.accent : t >= 0.999 ? COL.green : COL.yellow;
      steps.push({
        title: "Morph por vértices — t = " + t,
        body:
          "<p>Cada vértice interpola linearmente:</p>" +
          "<div class='formula'>Pₖ(t) = (1 − t)·A′ₖ + t·Bₖ</div>" +
          "<p>" +
          (t <= 0.001 ? "Em t = 0 é exatamente A." : t >= 0.999 ? "Em t = 1 é exatamente B." :
            "Estado intermediário: a forma está “entre” o pentágono e o heptágono.") +
          "</p>",
        visual: {
          type: "plane", bounds: BND,
          draw: function (plane) {
            plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1, dashed: true });
            plane.polygon(B, { stroke: COL.green, lineWidth: 1, dashed: true });
            plane.polygon(poly, { stroke: c, lineWidth: 3 });
            poly.forEach(function (p) { plane.point(p[0], p[1], { color: c, radius: 3.5 }); });
            plane.text(-6, 5.4, "t = " + t, { color: c });
          },
        },
      });
    });

    steps.push({
      title: "Variante: morphing por arestas",
      body:
        "<p>Em vez dos vértices, pode-se interpolar os <b>pontos médios das arestas</b> (e suas " +
        "direções), reconstruindo a forma a partir das arestas em cada t.</p>" +
        "<p>Útil quando preservar o <b>comprimento/ângulo das arestas</b> importa mais do que a " +
        "posição exata dos vértices.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1.5 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 1.5 });
          for (var i = 0; i < 7; i++) {
            var ma = mid(Ap[i], Ap[(i + 1) % 7]);
            var mb = mid(B[i], B[(i + 1) % 7]);
            plane.segment(ma, mb, { color: COL.muted, dashed: true, lineWidth: 1 });
            var m = lerp(ma, mb, 0.5);
            plane.point(m[0], m[1], { color: COL.yellow, radius: 3.5 });
          }
        },
      },
    });

    steps.push({
      title: "Resumo e cuidados",
      body:
        "<ul>" +
        "<li><b>Correspondência</b> é tudo: alinhe quem vira quem (e por onde começa) para evitar " +
        "dobras e auto-interseções.</li>" +
        "<li><b>Contagens diferentes</b>: reamostre a forma com menos vértices até igualar.</li>" +
        "<li><b>Por vértices × por arestas</b>: escolha conforme o que precisa ficar “rígido”.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html: "Iguale as contagens, <b>pareie</b> os vértices e interpole cada par: " +
              "<code>(1−t)A′ₖ + tBₖ</code>.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g22-morphing",
    num: "⬠⬢",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Morphing por vértices e arestas",
    type: "computacional",
    tags: ["animação", "morphing", "interpolação"],
    hubDesc: "Pentágono→heptágono: reamostrar p/ igualar vértices, parear e interpolar 1-a-1.",
    statement:
      "Entenda o morphing por vértices e por arestas: a transformação gradual de uma forma em outra " +
      "(como pentágono → heptágono), a correspondência de vértices e a interpolação.",
    parts: [{ label: "Guia", build: build }],
  });
})();
