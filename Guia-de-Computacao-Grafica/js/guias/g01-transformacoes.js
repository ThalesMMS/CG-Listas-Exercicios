/*
 * g01-transformacoes.js — Guia: Transformações geométricas em coordenadas
 * homogêneas. Translação, escala, rotação, reflexão, rotação com ponto fixo e
 * composição (ordem das matrizes). Foco no PORQUÊ de cada matriz e da ordem.
 *
 * Reusa window.ALG (matMul, matCompose, mTranslate/Scale/RotateDeg/ReflectX,
 * applyToPolygon) e os helpers EX.Guia.mat/row/dom.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;
  var MAT = EX.Guia.mat,
    ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  // Triângulo de trabalho: A, B, C.
  var TRI = [
    [2, 1],
    [5, 1],
    [2, 3],
  ];
  var LBL = ["A", "B", "C"];

  // Número -> string curta (inteiro quando possível).
  function n2s(v) {
    var r = ALG.round2(v);
    if (Object.is(r, -0)) r = 0;
    return String(r);
  }
  // Matriz 3x3 numérica -> tabela com colchetes.
  function mat3(M) {
    return MAT(
      M.map(function (row) {
        return row.map(n2s);
      })
    );
  }
  // Desenha um polígono com vértices rotulados.
  function poly(plane, pts, color, opts) {
    opts = opts || {};
    plane.polygon(pts, {
      stroke: color,
      fill: opts.fill || false,
      dashed: opts.dashed,
      lineWidth: opts.lineWidth || 2,
    });
    if (opts.points !== false) {
      pts.forEach(function (p, i) {
        plane.point(p[0], p[1], {
          color: color,
          radius: 3,
          label: opts.labels ? opts.labels[i] : null,
          labelColor: color,
        });
      });
    }
  }
  function asPairs(pts) {
    return pts.map(function (p) {
      return [p.x, p.y];
    });
  }

  var BOUNDS = [-6, 11, -5, 8];

  function build() {
    var steps = [];

    // 1) Motivação
    steps.push({
      title: "Por que coordenadas homogêneas?",
      body:
        "<p>Escala e rotação são <b>lineares</b>: cabem numa multiplicação <code>v' = M·v</code>. " +
        "Mas a <b>translação</b> é uma <em>soma</em> <code>v' = v + t</code> — não é linear, então não " +
        "vira matriz 2×2.</p>" +
        "<p>Isso é um problema quando queremos <span class='hl'>compor</span> várias transformações: " +
        "metade seria multiplicação e metade soma. A solução é representar todas — inclusive a " +
        "translação — como <b>uma única multiplicação de matrizes</b>.</p>",
      visual: DOM(
        ROW(
          "rotação/escala: " +
            MAT([["a", "b"], ["c", "d"]]) +
            "·" +
            MAT([["x"], ["y"]]) +
            "&nbsp;&nbsp;✔"
        ) +
          ROW(
            "translação: " +
              MAT([["x"], ["y"]]) +
              "+" +
              MAT([["t<sub>x</sub>"], ["t<sub>y</sub>"]]) +
              "&nbsp;&nbsp;✘ (soma, não multiplicação)"
          )
      ),
    });

    // 2) A ideia: w = 1
    steps.push({
      title: "A ideia: uma terceira coordenada w = 1",
      body:
        "<p>Acrescentamos uma coordenada: o ponto <code>(x, y)</code> vira <code>(x, y, 1)ᵀ</code>. " +
        "As transformações passam a ser matrizes <b>3×3</b>.</p>" +
        "<p>O truque: a translação cabe na <span class='hl'>última coluna</span>. Ao multiplicar, o " +
        "<code>1</code> do ponto <em>puxa</em> essa coluna para dentro da conta — a soma vira " +
        "multiplicação.</p>",
      visual: DOM(
        ROW(
          MAT([
            ["1", "0", "t<sub>x</sub>"],
            ["0", "1", "t<sub>y</sub>"],
            ["0", "0", "1"],
          ]) +
            "·" +
            MAT([["x"], ["y"], ["1"]]) +
            "=" +
            MAT([["x + t<sub>x</sub>"], ["y + t<sub>y</sub>"], ["1"]])
        )
      ),
    });

    // 3) Translação
    var T = ALG.mTranslate(4, 2);
    var triT = asPairs(ALG.applyToPolygon(T, TRI));
    steps.push({
      title: "Translação T(tₓ, tᵧ)",
      body:
        "<p>A diagonal é a identidade (mantém <code>x</code> e <code>y</code>); a última coluna soma o " +
        "deslocamento. Aqui <span class='accent'>t = (4, 2)</span>.</p>" +
        "<p>Repare: a forma e a orientação não mudam — só a posição. É a única transformação que " +
        "<em>precisava</em> da coluna extra.</p>" +
        ROW(mat3(T)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triT, COL.accent, { fill: COL.accentSoft });
          plane.arrow(TRI[0], triT[0], { color: COL.yellow });
        },
      },
    });

    // 4) Escala
    var S = ALG.mScale(2, 2);
    var triS = asPairs(ALG.applyToPolygon(S, TRI));
    steps.push({
      title: "Escala S(sₓ, sᵧ)",
      body:
        "<p>Os fatores ficam na diagonal: <code>x' = sₓ·x</code>, <code>y' = sᵧ·y</code>. Aqui " +
        "<span class='accent'>s = (2, 2)</span>.</p>" +
        "<p>Detalhe importante: a escala é <b>em relação à origem</b>. Por isso o triângulo não só " +
        "cresce — ele também <span class='hl'>se afasta</span> da origem. Guardar esse efeito ajuda a " +
        "entender por que precisamos de <em>ponto fixo</em> mais adiante.</p>" +
        ROW(mat3(S)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triS, COL.green, { fill: COL.greenSoft });
        },
      },
    });

    // 5) Rotação
    var R = ALG.mRotateDeg(90);
    var triR = asPairs(ALG.applyToPolygon(R, TRI));
    steps.push({
      title: "Rotação R(θ)",
      body:
        "<p>De onde vêm <code>cos</code> e <code>−sin</code>? A matriz simplesmente diz para onde " +
        "vão os <b>eixos</b>: <code>x̂ = (cosθ, sinθ)</code> e <code>ŷ = (−sinθ, cosθ)</code>. " +
        "Cada coluna é o destino de um eixo.</p>" +
        "<p>Com <span class='accent'>θ = 90°</span>: <code>(x, y) → (−y, x)</code>. Também é em " +
        "torno da <b>origem</b>.</p>" +
        ROW(
          MAT([
            ["cosθ", "−sinθ", "0"],
            ["sinθ", "cosθ", "0"],
            ["0", "0", "1"],
          ]) +
            "&nbsp;→&nbsp;" +
            mat3(R)
        ),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triR, COL.purple, { fill: COL.accentSoft });
          plane.point(0, 0, { color: COL.yellow, radius: 4, label: "O" });
        },
      },
    });

    // 6) Reflexão
    var Fx = ALG.mReflectX();
    var triF = asPairs(ALG.applyToPolygon(Fx, TRI));
    steps.push({
      title: "Reflexão",
      body:
        "<p>Refletir no eixo <code>x</code> é trocar o sinal de <code>y</code>: " +
        "<code>(x, y) → (x, −y)</code>. Basta um <code>−1</code> na diagonal.</p>" +
        "<p>Reflexão é um caso particular de escala com fator negativo — por isso também se faz " +
        "<b>em relação a um eixo pela origem</b>. Para refletir em outra reta, usamos o mesmo truque de " +
        "ponto/eixo fixo do próximo passo.</p>" +
        ROW(mat3(Fx)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triF, COL.orange, { fill: COL.redSoft });
        },
      },
    });

    // 7) Rotação com ponto fixo (conjugação)
    var P = [2, 1]; // ponto fixo = vértice A
    var toOrigin = ALG.mTranslate(-P[0], -P[1]);
    var back = ALG.mTranslate(P[0], P[1]);
    // matCompose([1ª aplicada, …, última]) = última·…·primeira
    var Rp = ALG.matCompose([toOrigin, ALG.mRotateDeg(90), back]);
    var triRp = asPairs(ALG.applyToPolygon(Rp, TRI));
    var triMid = asPairs(ALG.applyToPolygon(toOrigin, TRI));
    steps.push({
      title: "Rotação com ponto fixo",
      body:
        "<p>Toda rotação é <b>em torno da origem</b>. Para girar em torno de outro ponto " +
        "<span class='accent'>P(2, 1)</span> usamos três passos: <b>leve P até a origem</b> " +
        "(<code>T(−P)</code>), <b>gire</b> (<code>R</code>), <b>volte</b> (<code>T(P)</code>).</p>" +
        "<p>Por que funciona? Levamos o problema a um sistema onde sabemos resolver (origem), " +
        "resolvemos, e desfazemos a mudança. Esse padrão <em>desfazer–fazer–refazer</em> " +
        "(conjugação) reaparece em reflexão sobre reta qualquer, escala em torno de um ponto, etc.</p>" +
        ROW(
          "M = T(P) · R(90°) · T(−P) =&nbsp;" + mat3(Rp)
        ),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triMid, COL.cyan, { dashed: true, points: false });
          poly(plane, triRp, COL.purple, { fill: COL.accentSoft });
          plane.point(P[0], P[1], { color: COL.yellow, radius: 5, ring: COL.yellow, label: "P (fixo)" });
        },
      },
    });

    // 8) Composição e ordem
    var RT = ALG.matMul(ALG.mRotateDeg(90), ALG.mTranslate(4, 0)); // gira depois translada? cuidado convenção
    var TR = ALG.matMul(ALG.mTranslate(4, 0), ALG.mRotateDeg(90));
    steps.push({
      title: "Composição: a ordem importa",
      body:
        "<p>Compor é multiplicar matrizes. Na convenção de <b>ponto-coluna</b> (<code>v' = M·v</code>), a " +
        "transformação aplicada <b>primeiro</b> fica à <b>direita</b>:</p>" +
        "<p style='text-align:center'><code>C = Mₙ · … · M₂ · M₁</code> &nbsp;(aplica M₁ primeiro).</p>" +
        "<p>E multiplicação de matrizes <span class='hl'>não comuta</span>: girar-depois-transladar é " +
        "diferente de transladar-depois-girar. Compare as duas matrizes ao lado — são distintas.</p>",
      visual: DOM(
        ROW("R · T =&nbsp;" + mat3(RT)) +
          ROW("T · R =&nbsp;" + mat3(TR)) +
          "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>mesmas peças, ordens diferentes → resultados diferentes</p>"
      ),
    });

    // 9) Resumo / comparação
    steps.push({
      title: "Resumo: por que isso é tão usado",
      body:
        "<p>Em coordenadas homogêneas <b>toda</b> transformação afim é uma matriz, e uma sequência " +
        "inteira vira <b>uma única matriz</b> (basta multiplicar uma vez e aplicar a todos os " +
        "vértices). Isso é exatamente o que GPUs fazem com matrizes <b>4×4</b> em 3D.</p>" +
        "<ul>" +
        "<li><b>Translação</b>: última coluna.</li>" +
        "<li><b>Escala/Reflexão</b>: diagonal (em relação à origem/eixo).</li>" +
        "<li><b>Rotação</b>: bloco cos/sin (em relação à origem).</li>" +
        "<li><b>Ponto fixo</b>: <code>T(P)·(…)·T(−P)</code>.</li>" +
        "<li><b>Ordem</b>: a 1ª aplicada vai à direita; não comuta.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Regra de ouro",
            html:
              "Reduza qualquer enunciado a <b>uma</b> matriz composta na ordem certa e só então " +
              "aplique aos pontos. Menos contas, menos erros.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g01-transformacoes",
    num: "T",
    subject: "Computação Gráfica",
    section: "Transformações",
    title: "Transformações geométricas (coordenadas homogêneas)",
    type: "conceitual",
    tags: ["transformações", "matrizes", "homogêneas"],
    hubDesc: "Translação, escala, rotação, reflexão, ponto fixo e por que a ordem das matrizes importa.",
    statement:
      "Entenda como translação, escala, rotação e reflexão viram matrizes 3×3 em coordenadas " +
      "homogêneas, como rotacionar em torno de um ponto fixo e por que a ordem da composição altera o resultado.",
    parts: [{ label: "Guia", build: build }],
  });
})();
