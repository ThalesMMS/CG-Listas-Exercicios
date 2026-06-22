/*
 * g02-dda.js — Guia: DDA (Digital Differential Analyzer) para rasterização de
 * retas. Por que passos = max(|Δx|,|Δy|), incrementos racionais e arredondamento
 * só na hora de escolher o pixel. Comparação com Bresenham.
 *
 * Reusa window.ALG.ddaLine (traço exato com frações) + EX.Content / EX.Slides.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var P0 = [0, 0],
    P1 = [6, 4];
  var R = ALG.ddaLine(P0, P1); // dx=6, dy=4, passos=6, xinc=1, yinc=2/3
  var BOUNDS = [-1, 7, -1, 5];

  // Reta "ideal" + eventuais pixels já escolhidos.
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
      title: "O problema: acender pixels sobre uma reta",
      body:
        "<p>A tela é uma <b>grade inteira</b>, mas a reta é contínua. Precisamos escolher, para cada " +
        "posição, o pixel mais próximo da reta ideal.</p>" +
        "<p>A receita ingênua <code>y = m·x + b</code> tem dois defeitos: faz uma <b>multiplicação e " +
        "arredondamento por coluna</b> e, quando a reta é <span class='hl'>íngreme</span> (m &gt; 1), " +
        "deixa <b>buracos</b> — pula linhas porque anda só em <code>x</code>.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 2) Ideia central: andar pelo eixo dominante
    steps.push({
      title: "Ideia: dar pequenos passos iguais",
      body:
        "<p>O DDA caminha pela reta em <b>passos uniformes</b>. A pergunta é: quantos passos?</p>" +
        "<p>Escolhemos <span class='hl'>passos = max(|Δx|, |Δy|)</span>. Assim o eixo que anda mais " +
        "(o dominante) avança exatamente <b>1 por passo</b> — nunca pula um inteiro, então " +
        "<b>não há buracos</b>. O outro eixo anda uma fração &lt; 1 por passo.</p>" +
        "<div class='formula'>Δx = 6,  Δy = 4\npassos = max(|6|, |4|) = 6</div>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 3) Incrementos
    steps.push({
      title: "Os incrementos",
      body:
        "<p>Dividimos o deslocamento total pelos passos: cada passo soma " +
        "<code>xinc = Δx/passos</code> e <code>yinc = Δy/passos</code>.</p>" +
        "<div class='formula'>xinc = Δx/passos = 6/6 = " +
        R.xinc.str() +
        "\nyinc = Δy/passos = 4/6 = " +
        R.yinc.str() +
        "</div>" +
        "<p>Como o eixo dominante é <code>x</code>, <code>xinc = 1</code> (anda um pixel inteiro por " +
        "passo) e <code>y</code> sobe <code>" +
        R.yinc.str() +
        "</code> de cada vez. Guardamos o valor <b>exato</b> e só arredondamos para <em>desenhar</em>.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 4..n) Micro-exemplo passo a passo
    R.rows.forEach(function (rw, i) {
      var px = R.pixels[i];
      steps.push({
        title: "Passo i = " + i + " → pixel (" + px[0] + ", " + px[1] + ")",
        body:
          "<p>Acumulado exato: <code>x = " +
          rw.x.str() +
          "</code>, <code>y = " +
          rw.y.str() +
          "</code>.</p>" +
          "<p>Arredondando para o pixel mais próximo (<code>round</code>): " +
          "<span class='ok'>(" +
          px[0] +
          ", " +
          px[1] +
          ")</span>." +
          (i === 0
            ? " Começa no extremo inicial."
            : " O <code>x</code> andou 1; o <code>y</code> subiu " + R.yinc.str() + ".") +
          "</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            scene(plane, i);
            // ponto real (não arredondado) sobre a reta
            plane.point(rw.x.num(), rw.y.num(), { color: COL.yellow, radius: 4 });
            // pixel escolhido em destaque
            plane.pixel(px[0], px[1], { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Tabela completa
    steps.push({
      title: "O traço completo",
      body:
        "<p>Juntando tudo: 7 pontos (passos 0…6), cada um com o acumulado exato e o pixel " +
        "arredondado. Note que o arredondamento acontece <b>só na coluna do pixel</b> — o " +
        "<code>y</code> exato segue intacto, evitando que pequenos erros se somem.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["i", "x", "y (exato)", "pixel"],
            rows: R.rows.map(function (rw, i) {
              return [i, rw.x.str(), rw.y.str(), "(" + R.pixels[i][0] + ", " + R.pixels[i][1] + ")"];
            }),
          });
        },
      },
    });

    // n+2) Comparação com Bresenham
    steps.push(
      EX.Slides.comparison({
        title: "DDA × Bresenham",
        intro:
          "<p>Os dois geram (quase) os mesmos pixels. A diferença é <b>como</b> chegam lá — e isso " +
          "decide qual é mais rápido em hardware.</p>",
        headers: ["", "DDA", "Bresenham"],
        rows: [
          ["Aritmética", "real (frações/float)", "inteira"],
          ["Por passo", "soma + arredonda", "soma + teste de sinal"],
          ["Erro acumulado", "possível em retas longas", "nenhum (exato)"],
          ["Custo", "maior", "menor (ideal p/ hardware)"],
          ["Clareza", "muito intuitivo", "exige a variável de decisão"],
        ],
      })
    );

    // n+3) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<p>Pontos onde se erra com o DDA:</p>" +
        "<ul>" +
        "<li><b>Esquecer o max</b>: usar <code>passos = Δx</code> sempre quebra em retas íngremes.</li>" +
        "<li><b>Arredondar cedo</b>: arredondar o acumulado e reusá-lo soma erro. Mantenha o valor " +
        "exato; arredonde só para desenhar.</li>" +
        "<li><b>Retas longas</b>: em float, o acúmulo de <code>yinc</code> pode derivar — motivo " +
        "histórico para preferir Bresenham.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "warn",
            title: "Regra prática",
            html:
              "<code>passos = max(|Δx|, |Δy|)</code>; incremento = deslocamento ÷ passos; " +
              "arredonde apenas o pixel a desenhar.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g02-dda",
    num: "DDA",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "DDA para retas",
    type: "computacional",
    tags: ["rasterização", "reta", "dda"],
    hubDesc: "Δ, passos = max(|Δx|,|Δy|), incrementos racionais e arredondamento só no pixel.",
    statement:
      "Entenda o DDA: por que o número de passos é max(|Δx|, |Δy|), como saem os incrementos em x e y " +
      "e por que o arredondamento ocorre apenas ao escolher o pixel. Comparação com Bresenham.",
    parts: [{ label: "Guia", build: build }],
  });
})();
