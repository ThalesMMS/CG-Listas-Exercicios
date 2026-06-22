/*
 * g04-bresenham-circ.js — Guia: Bresenham (ponto médio) para circunferências.
 * Por que basta calcular 1 octante, como a simetria de 8 vias completa o resto,
 * e a variável de decisão p₀ = 1 − r. Comparação com a abordagem trigonométrica.
 *
 * Algoritmo embutido (relativo ao centro), no mesmo estilo do exemplo do template.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var XC = 0,
    YC = 0,
    Rr = 6;
  var BOUNDS = [-Rr - 2, Rr + 2, -Rr - 2, Rr + 2];

  // Octante (2º): pontos RELATIVOS ao centro, de (0,r) até a diagonal x=y.
  function circleBresenham(r) {
    var pts = [],
      x = 0,
      y = r,
      p = 1 - r;
    while (x <= y) {
      pts.push([x, y]);
      if (p < 0) {
        p = p + 2 * x + 3;
        x++;
      } else {
        p = p + 2 * (x - y) + 5;
        x++;
        y--;
      }
    }
    return pts;
  }
  function sym8(x, y, xc, yc) {
    return [
      [xc + x, yc + y],
      [xc - x, yc + y],
      [xc + x, yc - y],
      [xc - x, yc - y],
      [xc + y, yc + x],
      [xc - y, yc + x],
      [xc + y, yc - x],
      [xc - y, yc - x],
    ];
  }
  // Circunferência ideal (anel) desenhada direto no contexto.
  function ring(plane, color) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(plane.cx(XC), plane.cy(YC), Rr * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.restore();
  }

  function build() {
    var octant = circleBresenham(Rr);
    var steps = [];

    function center(plane) {
      plane.point(XC, YC, { color: COL.muted, radius: 3, label: "C(" + XC + "," + YC + ")" });
    }

    // 1) Motivação
    steps.push({
      title: "Desenhar um círculo sem seno e cosseno",
      body:
        "<p>Dá para rasterizar pela equação <code>x = r·cosθ, y = r·sinθ</code>, varrendo θ. Mas isso " +
        "custa <b>trig por ponto</b> e, se o passo de θ for mal escolhido, deixa <b>buracos</b> ou " +
        "repete pixels.</p>" +
        "<p>Bresenham troca tudo isso por <b>somas inteiras</b> e explora a enorme " +
        "<span class='hl'>simetria</span> do círculo.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
        },
      },
    });

    // 2) Por que só um octante
    steps.push({
      title: "Calcular 1/8 e refletir o resto",
      body:
        "<p>O círculo tem <b>8 partes espelhadas</b>. Se eu sei o arco de <code>(0, r)</code> até a " +
        "diagonal <code>x = y</code> (o <span class='hl'>2º octante</span>), obtenho os outros 7 só " +
        "<b>trocando sinais e eixos</b> — sem recalcular nada.</p>" +
        "<p>Isso corta o trabalho por 8 e ainda garante simetria perfeita do desenho.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
          plane.segment([XC, YC], [XC + Rr, YC + Rr], { color: COL.cyan, dashed: true });
          plane.text(XC + Rr, YC + Rr, "x = y", { color: COL.cyan, dx: -28, dy: -6 });
          plane.pixel(XC, YC + Rr, { fill: COL.greenSoft, stroke: COL.green, label: "início" });
        },
      },
    });

    // 3) Variável de decisão
    steps.push({
      title: "A decisão: p₀ = 1 − r",
      body:
        "<p>Começamos em <code>(x, y) = (0, " +
        Rr +
        ")</code>. A cada passo <code>x</code> sobe 1, e a pergunta é se <code>y</code> deve " +
        "<b>cair</b> ou não — exatamente como na reta, mas agora o “meio-fio” é o círculo.</p>" +
        "<p>A variável de decisão (ponto médio, em inteiros) parte de:</p>" +
        "<div class='formula'>p₀ = 1 − r = 1 − " +
        Rr +
        " = " +
        (1 - Rr) +
        "\nse p &lt; 0 → Leste:    x++,      p += 2x+3\nse p ≥ 0 → Sudeste:  x++, y--, p += 2(x−y)+5</div>" +
        "<p>O laço roda enquanto <code>x ≤ y</code> (fim do octante).</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
          plane.pixel(XC, YC + Rr, { fill: COL.greenSoft, stroke: COL.green });
        },
      },
    });

    // 4..n) Octante passo a passo
    octant.forEach(function (rel, i) {
      steps.push({
        title: "Octante — ponto " + (i + 1) + ": (" + rel[0] + ", " + rel[1] + ")",
        body:
          "<p>Pixel relativo <span class='accent'>(" +
          rel[0] +
          ", " +
          rel[1] +
          ")</span> → absoluto <span class='hl'>(" +
          (XC + rel[0]) +
          ", " +
          (YC + rel[1]) +
          ")</span>.</p>" +
          "<p>" +
          (i + 1) +
          " de " +
          octant.length +
          " pixels do octante. Pare quando <code>x &gt; y</code>.</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            center(plane);
            ring(plane, COL.muted);
            for (var k = 0; k < i; k++)
              plane.pixel(XC + octant[k][0], YC + octant[k][1], {
                fill: COL.accentSoft,
                stroke: COL.accent,
              });
            plane.pixel(XC + rel[0], YC + rel[1], { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Simetria de 8 vias
    var base = octant[Math.min(2, octant.length - 1)];
    var sym = sym8(base[0], base[1], XC, YC);
    steps.push({
      title: "Simetria de 8 vias",
      body:
        "<p>Cada pixel <code>(x, y)</code> do octante gera <b>8 pixels</b> por reflexão: " +
        "<code>(±x, ±y)</code> e <code>(±y, ±x)</code>, somando o centro. Para o ponto " +
        "<span class='accent'>(" +
        base[0] +
        ", " +
        base[1] +
        ")</span>:</p>" +
        "<div class='ex-coordlist'>" +
        sym
          .map(function (p) {
            return "<span class='ex-coord green'>(" + p[0] + ", " + p[1] + ")</span>";
          })
          .join("") +
        "</div>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          octant.forEach(function (rel) {
            plane.pixel(XC + rel[0], YC + rel[1], { fill: COL.accentSoft, stroke: COL.accent });
          });
          sym.forEach(function (p) {
            plane.pixel(p[0], p[1], { fill: COL.greenSoft, stroke: COL.green });
          });
        },
      },
    });

    // n+2) Círculo completo
    steps.push({
      title: "Circunferência completa",
      body:
        "<p>Aplicando a simetria a <em>todos</em> os pontos do octante, fechamos o círculo inteiro — " +
        "tendo calculado de verdade só 1/8 dele.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          octant.forEach(function (rel) {
            sym8(rel[0], rel[1], XC, YC).forEach(function (p) {
              plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent });
            });
          });
        },
      },
    });

    // n+3) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Bresenham × trigonometria",
        intro: "<p>Por que o método incremental venceu para desenhar círculos:</p>",
        headers: ["", "x=r·cosθ", "Bresenham"],
        rows: [
          ["Custo por ponto", "seno + cosseno", "somas inteiras"],
          ["Buracos/dupes", "dependem do passo de θ", "nenhum (grade exata)"],
          ["Trabalho", "todo o círculo", "1 octante + simetria"],
          ["Hardware", "ruim", "ótimo"],
        ],
      })
    );

    // n+4) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Sair do octante</b>: o laço termina em <code>x &gt; y</code>; ir além duplica pixels da " +
        "diagonal.</li>" +
        "<li><b>Centro fora da origem</b>: calcule sempre <b>relativo</b> e some <code>(xc, yc)</code> " +
        "só na simetria.</li>" +
        "<li><b>Ponto da diagonal</b> (x = y) tem menos de 8 imagens distintas — normal.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "A grande sacada",
            html:
              "Mesma filosofia da reta de Bresenham (decisão inteira no ponto médio) + a " +
              "<b>simetria do círculo</b> para fazer 1/8 do trabalho.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g04-bresenham-circ",
    num: "○",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "Bresenham para circunferências",
    type: "computacional",
    tags: ["rasterização", "circunferência", "bresenham", "simetria"],
    hubDesc: "Um octante (p₀ = 1 − r) + simetria de 8 vias; por que isso basta.",
    statement:
      "Entenda o algoritmo do ponto médio de Bresenham para circunferências: por que se calcula " +
      "apenas um octante, como a simetria de 8 vias completa o desenho e o papel da variável de decisão.",
    parts: [{ label: "Guia", build: build }],
  });
})();
