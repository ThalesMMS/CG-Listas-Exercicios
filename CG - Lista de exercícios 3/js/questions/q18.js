/*
 * q18.js — Morphing de um pentágono para um heptágono (por vértices e por arestas).
 * ÚNICA questão computacional: usa o plano cartesiano (canvas) + cálculos reais
 * de interpolação linear. Pentágono A (5) e heptágono B (7), centrados, raio 4.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;
  var COL = EX.CartesianPlane.COLORS;

  function ngon(n, R) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var a = (90 + k * 360 / n) * Math.PI / 180;
      out.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    return out;
  }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  function polyAt(Aps, Bs, t) { return Aps.map(function (p, k) { return lerp(p, Bs[k], t); }); }
  function r2(n) { return (Math.round(n * 100) / 100).toFixed(2); }

  var A = ngon(5, 4);                 // pentágono original (5)
  var B = ngon(7, 4);                 // heptágono (7)
  // A' = pentágono reamostrado p/ 7 pontos (insere ponto médio em 2 arestas)
  var Ap = [A[0], A[1], mid(A[1], A[2]), A[2], A[3], mid(A[3], A[4]), A[4]];
  var midsA = Ap.map(function (p, i) { return mid(p, Ap[(i + 1) % 7]); });
  var midsB = B.map(function (p, i) { return mid(p, B[(i + 1) % 7]); });

  var BOUNDS = [-6.5, 6.5, -6, 6.5];

  function faintBoth(plane) {
    plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1.5, dashed: true });
    plane.polygon(B, { stroke: COL.green, lineWidth: 1.5, dashed: true });
  }

  // ---- tabela HTML de um ponto k ao longo de t ----
  function tbl(P0, P1, name, activeT) {
    var ts = [0, 0.25, 0.5, 0.75, 1];
    var rows = ts.map(function (t) {
      var p = lerp(P0, P1, t);
      return "<tr class='" + (t === activeT ? "active" : "") + "'><td>" + t +
        "</td><td>" + r2(p[0]) + "</td><td>" + r2(p[1]) + "</td></tr>";
    }).join("");
    return "<p class='muted'>" + name + "</p><table class='ex-table'><thead><tr><th>t</th>" +
      "<th>x</th><th>y</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function planeStep(draw) { return { type: "plane", bounds: BOUNDS, draw: draw }; }

  function build() {
    var steps = [];

    // 1) problema
    steps.push(S.concept({
      title: "O problema: 5 vértices × 7 vértices",
      body:
        "<p><b>Morphing</b> deforma uma forma A em outra B interpolando seus pontos: " +
        "<b>P(t) = (1−t)·A + t·B</b>, com t de 0 a 1.</p>" +
        "<p>Mas isso exige uma <b>correspondência 1‑para‑1</b> entre os pontos. O " +
        "<span class='accent'>pentágono</span> tem 5 vértices e o " +
        "<span class='ok'>heptágono</span>, 7 — não dá para parear direto.</p>",
      visual: planeStep(function (plane) {
        plane.polygon(A, { stroke: COL.accent, lineWidth: 2.5 });
        plane.polygon(B, { stroke: COL.green, lineWidth: 2.5 });
        plane.text(-6.3, 5.7, "A: pentágono", { color: COL.accent });
        plane.text(-6.3, -5.5, "B: heptágono", { color: COL.green });
      }),
    }));

    // 2) reamostragem
    steps.push({
      title: "Solução: reamostrar para 7 pontos",
      body:
        "<p>Igualamos o número de pontos: inserimos <b>2 pontos médios</b> em duas arestas do " +
        "pentágono (entre A₁A₂ e entre A₃A₄). Agora <b>A′</b> também tem <b>7 pontos</b>.</p>" +
        "<div class='formula'>A′₂ = (A₁+A₂)/2 = (" + r2(Ap[2][0]) + ", " + r2(Ap[2][1]) + ")\n" +
        "A′₅ = (A₃+A₄)/2 = (" + r2(Ap[5][0]) + ", " + r2(Ap[5][1]) + ")</div>" +
        "<p class='muted'>(A reamostragem totalmente uniforme usaria mmc(5,7)=35 pontos; 7 já " +
        "basta e é mais claro.)</p>",
      visual: planeStep(function (plane) {
        plane.polygon(B, { stroke: COL.green, lineWidth: 1.5, dashed: true });
        plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2.5 });
        Ap.forEach(function (p, i) {
          var inserted = (i === 2 || i === 5);
          plane.point(p[0], p[1], {
            color: inserted ? COL.orange : COL.accent, radius: inserted ? 6 : 5,
            label: "A'" + i, labelColor: COL.ink,
          });
        });
      }),
    });

    // 3) correspondência
    steps.push({
      title: "Correspondência ponto-a-ponto",
      body:
        "<p>Pareamos por índice: <b>A′<sub>k</sub> ↔ B<sub>k</sub></b> (k = 0…6). Cada linha " +
        "tracejada liga um ponto de origem ao seu destino.</p>" +
        "<p>Agora cada par tem um caminho próprio a percorrer.</p>",
      visual: planeStep(function (plane) {
        for (var k = 0; k < 7; k++) plane.segment(Ap[k], B[k], { color: COL.muted, dashed: true, lineWidth: 1.2 });
        plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2 });
        plane.polygon(B, { stroke: COL.green, lineWidth: 2 });
        for (k = 0; k < 7; k++) {
          plane.point(Ap[k][0], Ap[k][1], { color: COL.accent, radius: 4 });
          plane.point(B[k][0], B[k][1], { color: COL.green, radius: 4 });
        }
      }),
    });

    // 4–8) interpolação por vértices
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      steps.push({
        title: "Por vértices — t = " + t,
        body:
          "<p><b>Por vértices:</b> interpolamos a <b>posição de cada vértice</b>:</p>" +
          "<div class='formula'>P_k(t) = (1−t)·A′_k + t·B_k</div>" +
          tbl(Ap[1], B[1], "Exemplo — vértice k = 1 (A′₁→B₁):", t),
        visual: planeStep(function (plane) {
          faintBoth(plane);
          var P = polyAt(Ap, B, t);
          var c = t <= 0.001 ? COL.accent : (t >= 0.999 ? COL.green : COL.yellow);
          plane.polygon(P, { stroke: c, lineWidth: 3 });
          P.forEach(function (p) { plane.point(p[0], p[1], { color: c, radius: 4 }); });
          plane.text(-6, 5.4, "t = " + t, { color: c });
        }),
      });
    });

    // 9) arestas como primitiva
    steps.push({
      title: "Por arestas — a aresta é a primitiva",
      body:
        "<p><b>Por arestas:</b> em vez do vértice, a unidade do morphing é a <b>aresta</b>. " +
        "Pareamos as arestas e interpolamos um <b>representante</b> de cada uma — tipicamente o " +
        "seu <b>ponto médio</b>.</p>" +
        "<div class='formula'>M_i(t) = (1−t)·M_i^A + t·M_i^B</div>" +
        tbl(midsA[0], midsB[0], "Exemplo — aresta i = 0 (médios):", null),
      visual: planeStep(function (plane) {
        faintBoth(plane);
        for (var i = 0; i < 7; i++) plane.segment(midsA[i], midsB[i], { color: COL.muted, dashed: true, lineWidth: 1.2 });
        midsA.forEach(function (m) { plane.point(m[0], m[1], { color: COL.orange, radius: 4 }); });
        midsB.forEach(function (m) { plane.point(m[0], m[1], { color: COL.green, radius: 4 }); });
        plane.text(-6, 5.4, "médios A′ (laranja) → B (verde)", { color: COL.ink });
      }),
    });

    // 10) interpolando as arestas (t=0.5)
    steps.push({
      title: "Por arestas — interpolando (t = 0,5)",
      body:
        "<p>Em t = 0,5 cada ponto médio caminhou metade do trajeto. As arestas do polígono " +
        "intermediário passam por esses <b>médios interpolados</b> (em amarelo).</p>" +
        "<div class='formula'>M_0(0,5) = (" + r2(lerp(midsA[0], midsB[0], 0.5)[0]) + ", " +
        r2(lerp(midsA[0], midsB[0], 0.5)[1]) + ")</div>" +
        "<p>Os <b>vértices</b> do intermediário saem da <b>interseção de arestas consecutivas</b> " +
        "(aqui mostramos o polígono já reconstruído).</p>",
      visual: planeStep(function (plane) {
        faintBoth(plane);
        var P = polyAt(Ap, B, 0.5);
        plane.polygon(P, { stroke: COL.yellow, lineWidth: 3 });
        for (var i = 0; i < 7; i++) {
          var m = lerp(midsA[i], midsB[i], 0.5);
          plane.point(m[0], m[1], { color: COL.yellow, radius: 4 });
        }
        plane.text(-6, 5.4, "arestas em t = 0,5", { color: COL.yellow });
      }),
    });

    // 11) resumo
    steps.push(S.comparison({
      title: "Resumo: por vértices × por arestas",
      intro: "<p>Mesma ideia de interpolação linear, primitivas diferentes.</p>",
      headers: ["", "Por vértices", "Por arestas"],
      rows: [
        ["Primitiva", "O vértice", "A aresta"],
        ["O que se interpola", "Posição dos cantos", "Pontos médios das arestas"],
        ["Vértices do intermediário", "Diretos (são o resultado)", "Interseção de arestas consecutivas"],
        ["Quando preferir", "Caso geral, simples", "Preservar estrutura/orientação das arestas"],
      ],
    }));

    return steps;
  }

  EX.registry.add({
    id: "q18-morphing",
    num: "18",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "Morphing: pentágono → heptágono",
    type: "computacional",
    tags: ["morphing", "interpolação", "animação"],
    hubDesc: "Reamostragem para 7 pontos e interpolação linear — por vértices e por arestas.",
    statement:
      "Mostre os cálculos de <strong>morphing por vértices e por arestas</strong> de um " +
      "<strong>pentágono para um heptágono</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
