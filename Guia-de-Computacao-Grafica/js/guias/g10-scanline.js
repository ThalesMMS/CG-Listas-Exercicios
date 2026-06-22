/*
 * g10-scanline.js — Guia: preenchimento de polígonos por Scan-Line (varredura).
 * Para cada linha, interseções com as arestas, ordenação e preenchimento dos
 * intervalos internos pela regra par-ímpar. Comparação com os fills por semente.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  // Polígono côncavo (entalhe no topo) — alguns y cruzam 4 arestas.
  var POLY = [[2, 1], [10, 1], [10, 8], [7, 4], [4, 8]];
  var B = [0, 12, 0, 10];
  var LINES = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5];

  // Interseções (x ordenados) da reta horizontal y com as arestas do polígono.
  function scanX(poly, y) {
    var xs = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i],
        b = poly[(i + 1) % poly.length];
      var y0 = a[1],
        y1 = b[1];
      // meia-aberta: conta a aresta se y0<=y<y1 (ou o inverso) — evita vértices.
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        var t = (y - y0) / (y1 - y0);
        xs.push(a[0] + t * (b[0] - a[0]));
      }
    }
    return xs.sort(function (p, q) {
      return p - q;
    });
  }
  function outline(plane) {
    plane.polygon(POLY, { stroke: COL.muted, fill: false, lineWidth: 2 });
    POLY.forEach(function (p) {
      plane.point(p[0], p[1], { color: COL.muted, radius: 2.5 });
    });
  }
  function bars(plane, yList) {
    yList.forEach(function (y) {
      var xs = scanX(POLY, y);
      for (var i = 0; i + 1 < xs.length; i += 2) {
        plane.polygon(
          [[xs[i], y - 0.45], [xs[i + 1], y - 0.45], [xs[i + 1], y + 0.45], [xs[i] + 0, y + 0.45]],
          { fill: COL.accentSoft, stroke: false }
        );
      }
    });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Preencher um polígono sem semente",
      body:
        "<p>Os fills por semente precisam de um ponto interno e de um contorno já desenhado. O " +
        "<b>Scan-Line</b> preenche direto da <b>definição geométrica</b> (a lista de vértices), " +
        "varrendo a tela linha por linha.</p>" +
        "<p>É o método clássico de rasterização de polígonos — não precisa de semente nem de “cor de borda”.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { outline(plane); } },
    });

    steps.push({
      title: "A regra par-ímpar",
      body:
        "<p>Pegue uma linha horizontal <code>y</code> e marque onde ela <b>cruza as arestas</b>. " +
        "Ordenando esses x, a linha entra e sai do polígono alternadamente.</p>" +
        "<p>Logo, basta pintar <b>entre pares</b>: do 1º ao 2º cruzamento (dentro), pula do 2º ao 3º " +
        "(fora), pinta do 3º ao 4º (dentro)… É por isso que polígonos <b>côncavos</b> funcionam: a " +
        "linha pode ter 4, 6, … cruzamentos.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          outline(plane);
          var y = 4.5;
          var xs = scanX(POLY, y);
          plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
          bars(plane, [y]);
          xs.forEach(function (x, i) {
            plane.point(x, y, { color: COL.green, radius: 4, label: String(i + 1), labelColor: COL.green });
          });
          plane.text(B[0] + 0.2, y, "y=" + y, { color: COL.yellow, dy: -6 });
        },
      },
    });

    steps.push({
      title: "Como montar, linha a linha",
      body:
        "<p>Para cada linha de varredura, de baixo para cima:</p>" +
        "<ol>" +
        "<li>encontre os <b>x de interseção</b> com cada aresta que a linha cruza;</li>" +
        "<li><b>ordene</b> os x;</li>" +
        "<li>preencha os <b>spans</b> entre pares consecutivos (1–2, 3–4, …).</li>" +
        "</ol>" +
        "<p>Implementações eficientes mantêm uma <em>tabela de arestas ativas</em> e atualizam os x " +
        "incrementalmente (como no Bresenham), mas a ideia é esta.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { outline(plane); } },
    });

    // Animação acumulando linhas
    LINES.forEach(function (y, idx) {
      var shown = LINES.slice(0, idx + 1);
      var xs = scanX(POLY, y);
      var spans = [];
      for (var i = 0; i + 1 < xs.length; i += 2)
        spans.push("[" + xs[i].toFixed(1) + ", " + xs[i + 1].toFixed(1) + "]");
      steps.push({
        title: "Varrendo y = " + y,
        body:
          "<p>Interseções: <span class='ok'>" +
          xs.map(function (x) { return x.toFixed(2); }).join(", ") +
          "</span>.</p>" +
          "<p>Spans preenchidos (pares): <span class='hl'>" +
          (spans.length ? spans.join("  ") : "—") +
          "</span>." +
          (xs.length === 4 ? " Quatro cruzamentos → o entalhe fica de fora." : "") +
          "</p>",
        visual: {
          type: "plane",
          bounds: B,
          draw: function (plane) {
            bars(plane, shown);
            outline(plane);
            plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
            xs.forEach(function (x) {
              plane.point(x, y, { color: COL.green, radius: 3.5 });
            });
          },
        },
      });
    });

    steps.push({
      title: "Casos especiais (vértices e horizontais)",
      body:
        "<p>Dois detalhes evitam erros de paridade:</p>" +
        "<ul>" +
        "<li><b>Arestas horizontais</b> não geram interseção (são ignoradas) — senão contariam " +
        "infinitos pontos.</li>" +
        "<li><b>Vértices</b>: usa-se o intervalo <b>meia-aberto</b> em y (conta a aresta só na ponta " +
        "inferior). Assim um vértice em “pico” conta 2 (entra e sai) e um vértice de passagem conta 1 " +
        "— mantendo a paridade correta.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "warn",
            title: "Por que meia-aberta",
            html: "Tratar <code>y₀ ≤ y &lt; y₁</code> faz cada vértice ser contado de forma consistente, " +
              "evitando linhas ou buracos espúrios na altura dos vértices.",
          });
        },
      },
    });

    steps.push(
      EX.Slides.comparison({
        title: "Scan-Line × fills por semente",
        intro: "<p>Duas filosofias de preenchimento:</p>",
        headers: ["", "Scan-Line", "Boundary/Flood"],
        rows: [
          ["Entrada", "vértices do polígono", "semente + raster pronto"],
          ["Precisa de", "as arestas", "um ponto interno"],
          ["Côncavos", "trata por paridade", "trata naturalmente"],
          ["Uso", "rasterizar polígonos", "pintar regiões já na tela"],
        ],
      })
    );

    return steps;
  }

  EX.registry.add({
    id: "g10-scanline",
    num: "≣",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Scan-Line (preenchimento de polígonos)",
    type: "computacional",
    tags: ["preenchimento", "varredura", "polígono"],
    hubDesc: "Interseções por linha, ordenação e regra par-ímpar; vértices e arestas horizontais.",
    statement:
      "Entenda o preenchimento por Scan-Line: a varredura por linhas, o cálculo e a ordenação das " +
      "interseções com as arestas, e o preenchimento dos intervalos internos pela regra par-ímpar.",
    parts: [{ label: "Guia", build: build }],
  });
})();
