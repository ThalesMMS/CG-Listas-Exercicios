/*
 * g05-cohen-sutherland.js — Guia: recorte de retas por Cohen-Sutherland.
 * Os códigos de região (4 bits), por que aceitação/rejeição trivial são
 * operações bit a bit, e o recorte iterativo fronteira a fronteira.
 * Comparação com Liang-Barsky.
 *
 * Reusa window.ALG.cohenSutherland / outCode / codeBits / codeNames.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var A = { x: -4, y: 4 },
    B = { x: 7, y: 3 };
  var BOUNDS = [-7, 10, -2, 9];

  function pt(P) {
    return [P.x.num(), P.y.num()];
  }
  function frpair(P) {
    return "(" + P.x.str() + ", " + P.y.str() + ")";
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }

  function build() {
    var steps = [];
    var res = ALG.cohenSutherland(A, B, W);

    // 1) Motivação
    steps.push({
      title: "Para que serve o recorte (clipping)",
      body:
        "<p>Antes de rasterizar, descartamos o que está <b>fora da janela</b> e aparamos o que entra " +
        "e sai. Pintar pixels fora da tela é desperdício.</p>" +
        "<p>O segredo do Cohen-Sutherland é <b>decidir rápido</b> os casos óbvios (totalmente dentro ou " +
        "totalmente fora) com pouquíssimo cálculo, e só então fazer interseções.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(A, B, { color: COL.yellow, lineWidth: 2 });
          plane.point(A.x, A.y, { color: COL.yellow, radius: 4, label: "A" });
          plane.point(B.x, B.y, { color: COL.yellow, radius: 4, label: "B" });
        },
      },
    });

    // 2) Region codes
    steps.push({
      title: "Códigos de região (4 bits)",
      body:
        "<p>As 4 retas da janela dividem o plano em <b>9 regiões</b>. Cada ponto ganha um código " +
        "<code>TBRL</code>: 1 bit por “está acima / abaixo / à direita / à esquerda da janela”.</p>" +
        "<p>Por que bits? Porque tornam dois testes <b>triviais</b>:</p>" +
        "<ul>" +
        "<li><b>Aceita</b> se <code>code₀ OR code₁ = 0000</code> (ambos dentro).</li>" +
        "<li><b>Rejeita</b> se <code>code₀ AND code₁ ≠ 0000</code> (ambos do mesmo lado externo).</li>" +
        "</ul>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          // linhas das fronteiras estendidas
          [W.xmin, W.xmax].forEach(function (x) {
            plane.segment([x, BOUNDS[2]], [x, BOUNDS[3]], { color: COL.muted, dashed: true, lineWidth: 1 });
          });
          [W.ymin, W.ymax].forEach(function (y) {
            plane.segment([BOUNDS[0], y], [BOUNDS[1], y], { color: COL.muted, dashed: true, lineWidth: 1 });
          });
          win(plane);
          var cells = [
            [-5, 8, "1001"], [1.5, 8, "1000"], [8, 8, "1010"],
            [-5, 3.5, "0001"], [1.5, 3.5, "0000"], [8, 3.5, "0010"],
            [-5, -1, "0101"], [1.5, -1, "0100"], [8, -1, "0110"],
          ];
          cells.forEach(function (c) {
            plane.text(c[0], c[1], c[2], { color: c[2] === "0000" ? COL.green : COL.ink, align: "center", font: "12px ui-monospace, monospace" });
          });
        },
      },
    });

    // 3) O laço
    steps.push({
      title: "Quando não é trivial: recorta e repete",
      body:
        "<p>Se não aceita nem rejeita de cara, a reta <b>cruza</b> alguma fronteira. Então:</p>" +
        "<ol>" +
        "<li>pegue um extremo que esteja <b>fora</b> (código ≠ 0);</li>" +
        "<li>recorte-o contra <b>uma</b> fronteira que seu código acusa;</li>" +
        "<li>substitua o extremo pela interseção e <b>recalcule</b> seu código.</li>" +
        "</ol>" +
        "<p>Repete até cair num caso trivial. Cada volta remove <b>um</b> bit de “fora”.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(A, B, { color: COL.yellow, dashed: true });
          plane.point(A.x, A.y, { color: COL.yellow, radius: 4 });
          plane.point(B.x, B.y, { color: COL.yellow, radius: 4 });
        },
      },
    });

    // 4..n) Animação do recorte
    res.steps.forEach(function (st) {
      if (st.type === "codes") {
        steps.push({
          title: "Códigos dos extremos",
          body:
            "<p><span class='accent'>A" +
            frpair(st.a) +
            "</span> → <code>" +
            ALG.codeBits(st.ca) +
            "</code> (" +
            ALG.codeNames(st.ca) +
            ")<br>" +
            "<span class='accent'>B" +
            frpair(st.b) +
            "</span> → <code>" +
            ALG.codeBits(st.cb) +
            "</code> (" +
            ALG.codeNames(st.cb) +
            ")</p>" +
            "<p>OR = " +
            ALG.codeBits(st.ca | st.cb) +
            " (≠0, não aceita) · AND = " +
            ALG.codeBits(st.ca & st.cb) +
            " (=0, não rejeita) → <b>precisa recortar</b>.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(st.a, st.b, { color: COL.yellow, lineWidth: 2 });
              plane.point(st.a.x.num(), st.a.y.num(), { color: COL.yellow, radius: 4, label: "A" });
              plane.point(st.b.x.num(), st.b.y.num(), { color: COL.yellow, radius: 4, label: "B" });
            },
          },
        });
      } else if (st.type === "clip") {
        steps.push({
          title: "Recorte em " + st.edgeName,
          body:
            "<p>O extremo <span class='accent'>" +
            frpair(st.from) +
            "</span> está fora (" +
            ALG.codeNames(st.edge) +
            "). Interseção exata com <code>" +
            st.edgeName +
            "</code>:</p>" +
            "<p><span class='ok'>" +
            frpair(st.to) +
            "</span>. Novo código: <code>" +
            ALG.codeBits(st.which === "a" ? st.ca : st.cb) +
            "</code>.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(A, B, { color: COL.muted, dashed: true });
              plane.segment(pt(st.a), pt(st.b), { color: COL.orange, lineWidth: 2.5 });
              plane.point(st.to.x.num(), st.to.y.num(), { color: COL.green, radius: 5, ring: COL.green });
            },
          },
        });
      } else if (st.type === "accept") {
        steps.push({
          title: "Segmento visível",
          body:
            "<p>Ambos os extremos agora estão <span class='ok'>DENTRO</span>. A parte visível vai de " +
            "<span class='ok'>" +
            frpair(st.a) +
            "</span> a <span class='ok'>" +
            frpair(st.b) +
            "</span>.</p>" +
            "<p>Repare nas frações exatas (ex.: <code>42/11</code>) — o recorte é geométrico, não " +
            "“pixelado”.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(A, B, { color: COL.muted, dashed: true });
              plane.segment(pt(st.a), pt(st.b), { color: COL.green, lineWidth: 3.5 });
              plane.point(st.a.x.num(), st.a.y.num(), { color: COL.green, radius: 5 });
              plane.point(st.b.x.num(), st.b.y.num(), { color: COL.green, radius: 5 });
            },
          },
        });
      }
    });

    // n+1) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Cohen-Sutherland × Liang-Barsky",
        intro: "<p>Dois jeitos de recortar uma reta — escolha conforme o cenário.</p>",
        headers: ["", "Cohen-Sutherland", "Liang-Barsky"],
        rows: [
          ["Abordagem", "códigos + interseções", "paramétrica (u)"],
          ["Casos triviais", "muito rápidos (bit a bit)", "também trata, via p,q"],
          ["Interseções", "pode calcular várias", "no máximo o necessário"],
          ["Melhor quando", "maioria fora/dentro", "muitos cruzamentos parciais"],
        ],
      })
    );

    // n+2) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Não é uma passada só</b>: pode recortar a mesma reta 1–4 vezes até ficar trivial.</li>" +
        "<li><b>Escolha da fronteira</b>: recorte contra um bit que o código realmente acusa, senão a " +
        "interseção cai fora do segmento.</li>" +
        "<li><b>Recalcule o código</b> após cada corte — esquecer trava o laço.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html:
              "Codificar a posição em 4 bits transforma “dá para descartar?” em um " +
              "<b>OR/AND</b> instantâneo; interseção só quando inevitável.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g05-cohen-sutherland",
    num: "▭",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Cohen-Sutherland (recorte de retas)",
    type: "computacional",
    tags: ["recorte", "clipping", "retas"],
    hubDesc: "Códigos de 4 bits, aceitação/rejeição trivial bit a bit e recorte iterativo.",
    statement:
      "Entenda o recorte de retas por Cohen-Sutherland: os códigos de região de 4 bits, por que a " +
      "aceitação e a rejeição triviais são operações bit a bit, e o recorte iterativo das interseções.",
    parts: [{ label: "Guia", build: build }],
  });
})();
