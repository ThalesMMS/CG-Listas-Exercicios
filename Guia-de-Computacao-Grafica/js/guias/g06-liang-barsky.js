/*
 * g06-liang-barsky.js — Guia: recorte de retas por Liang-Barsky (paramétrico).
 * A reta P(u) = P0 + u·(P1−P0), as quatro condições p·u ≤ q, o significado de
 * p<0 (entrada) e p>0 (saída), e a atualização de u1 = max e u2 = min.
 * Comparação com Cohen-Sutherland.
 *
 * Reusa window.ALG.liangBarsky (traço exato com frações).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var P0 = { x: -4, y: 0 },
    P1 = { x: 6, y: 8 };
  var DX = P1.x - P0.x,
    DY = P1.y - P0.y;
  var BOUNDS = [-6, 8, -2, 9];

  function at(u) {
    return [P0.x + u * DX, P0.y + u * DY];
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }
  function frpair(P) {
    return "(" + P.x.str() + ", " + P.y.str() + ")";
  }

  function build() {
    var steps = [];
    var res = ALG.liangBarsky(P0, P1, W);

    // 1) Motivação
    steps.push({
      title: "A reta como um parâmetro u",
      body:
        "<p>Liang-Barsky descreve a reta por um <b>parâmetro</b>:</p>" +
        "<div class='formula'>P(u) = P₀ + u·(P₁ − P₀),   u ∈ [0, 1]</div>" +
        "<p>Em <code>u = 0</code> estamos em P₀; em <code>u = 1</code>, em P₁. Recortar vira uma " +
        "pergunta só: <b>para qual faixa de u o ponto está dentro da janela?</b></p>" +
        "<p>Achamos essa faixa <code>[u₁, u₂]</code> sem testar pixel por pixel — direto na álgebra.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, lineWidth: 2 });
          plane.point(P0.x, P0.y, { color: COL.yellow, radius: 4, label: "u=0" });
          plane.point(P1.x, P1.y, { color: COL.yellow, radius: 4, label: "u=1" });
        },
      },
    });

    // 2) As quatro condições
    steps.push({
      title: "Quatro bordas → quatro condições p·u ≤ q",
      body:
        "<p>“Estar dentro” são 4 desigualdades (uma por borda). Cada uma se arruma na forma " +
        "<code>p·u ≤ q</code>:</p>" +
        "<div class='formula'>esquerda x ≥ xmin :  p = −Δx ,  q = x₀ − xmin\n" +
        "direita  x ≤ xmax :  p = +Δx ,  q = xmax − x₀\n" +
        "inferior y ≥ ymin :  p = −Δy ,  q = y₀ − ymin\n" +
        "superior y ≤ ymax :  p = +Δy ,  q = ymax − y₀</div>" +
        "<p>O <b>sinal de p</b> conta a história:</p>" +
        "<ul><li><code>p &lt; 0</code>: a reta <b>entra</b> por essa borda → candidata a <b>u₁</b>;</li>" +
        "<li><code>p &gt; 0</code>: a reta <b>sai</b> por essa borda → candidata a <b>u₂</b>;</li>" +
        "<li><code>p = 0</code>: paralela à borda (caso especial, ver final).</li></ul>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, dashed: true });
        },
      },
    });

    // 3) u1 = max, u2 = min
    steps.push({
      title: "Juntando: u₁ = max, u₂ = min",
      body:
        "<p>Cada entrada empurra o início para frente; cada saída puxa o fim para trás. A parte " +
        "visível é a <b>interseção</b> de todos esses limites:</p>" +
        "<div class='formula'>u₁ = max(0, todas as entradas q/p)\nu₂ = min(1, todas as saídas q/p)</div>" +
        "<p>Começamos com o segmento inteiro <code>u₁ = 0, u₂ = 1</code> e vamos apertando. No fim:</p>" +
        "<ul><li>se <code>u₁ ≤ u₂</code> → existe parte visível;</li>" +
        "<li>se <code>u₁ &gt; u₂</code> → a reta passa fora: <b>rejeita</b>.</li></ul>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, dashed: true });
        },
      },
    });

    // 4..n) Por borda
    res.steps.forEach(function (st) {
      if (st.type !== "boundary") return;
      var e = st.table[st.i];
      var u1 = st.u1.num(),
        u2 = st.u2.num();
      steps.push({
        title: "Borda " + e.name,
        body:
          "<p><code>p = " +
          e.p.str() +
          "</code>, <code>q = " +
          e.q.str() +
          "</code>" +
          (e.r ? ", <code>q/p = " + e.r.str() + "</code>" : "") +
          ".</p>" +
          "<p>" +
          e.action +
          "</p>" +
          "<p>Faixa atual: <span class='hl'>u₁ = " +
          st.u1.str() +
          ", u₂ = " +
          st.u2.str() +
          "</span>.</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            win(plane);
            plane.segment(P0, P1, { color: COL.muted, dashed: true });
            if (u1 <= u2) {
              plane.segment(at(u1), at(u2), { color: COL.orange, lineWidth: 3 });
              plane.point(at(u1)[0], at(u1)[1], { color: COL.orange, radius: 4 });
              plane.point(at(u2)[0], at(u2)[1], { color: COL.orange, radius: 4 });
            }
          },
        },
      });
    });

    // n+1) Resultado
    if (res.accepted) {
      steps.push({
        title: "Resultado",
        body:
          "<p><code>u₁ = " +
          res.u1.str() +
          " ≤ u₂ = " +
          res.u2.str() +
          "</code> → aceito. A parte visível vai de <span class='ok'>" +
          frpair(res.A) +
          "</span> (na borda esquerda) a <span class='ok'>" +
          frpair(res.B) +
          "</span> (na borda superior).</p>" +
          "<p>Repare: aqui <b>u₁ veio de uma borda em x</b> e <b>u₂ de uma borda em y</b> — o recorte " +
          "real costuma misturar as duas direções.</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            win(plane);
            plane.segment(P0, P1, { color: COL.muted, dashed: true });
            plane.segment([res.A.x.num(), res.A.y.num()], [res.B.x.num(), res.B.y.num()], {
              color: COL.green,
              lineWidth: 3.5,
            });
            plane.point(res.A.x.num(), res.A.y.num(), { color: COL.green, radius: 5 });
            plane.point(res.B.x.num(), res.B.y.num(), { color: COL.green, radius: 5 });
          },
        },
      });
    }

    // n+2) Tabela
    steps.push({
      title: "O traço em tabela",
      body: "<p>As quatro bordas, na ordem, e como cada uma mexeu em u₁/u₂.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["borda", "p", "q", "q/p", "u₁", "u₂"],
            rows: res.table.map(function (e) {
              return [e.name, e.p.str(), e.q.str(), e.r ? e.r.str() : "—", e.u1.str(), e.u2.str()];
            }),
          });
        },
      },
    });

    // n+3) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Liang-Barsky × Cohen-Sutherland",
        intro: "<p>Mesma tarefa, filosofias diferentes:</p>",
        headers: ["", "Liang-Barsky", "Cohen-Sutherland"],
        rows: [
          ["Base", "paramétrica (u)", "códigos de região"],
          ["Interseções", "só calcula u (1 divisão/borda)", "pode recortar várias vezes"],
          ["Eficiência", "geralmente melhor", "ótimo se maioria é trivial"],
          ["Rejeita cedo", "u₁ > u₂", "AND dos códigos ≠ 0"],
        ],
      })
    );

    // n+4) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>p = 0 (paralela)</b>: não há divisão. Se <code>q &lt; 0</code>, está totalmente fora " +
        "daquela borda → rejeita; se <code>q ≥ 0</code>, ignore a borda.</li>" +
        "<li><b>Entrada vs saída</b>: trocar o papel de p&lt;0 e p&gt;0 inverte u₁/u₂ e quebra tudo.</li>" +
        "<li><b>Clamp</b>: u₁ nunca abaixo de 0, u₂ nunca acima de 1.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html:
              "Recortar vira achar <b>o maior intervalo de u</b> em que a reta fica dentro — quatro " +
              "razões <code>q/p</code> e um <code>max</code>/<code>min</code>.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g06-liang-barsky",
    num: "u",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Liang-Barsky (recorte de retas)",
    type: "computacional",
    tags: ["recorte", "clipping", "paramétrica"],
    hubDesc: "P(u)=P₀+u·(P₁−P₀); condições p·u≤q; u₁=max, u₂=min; aceita se u₁≤u₂.",
    statement:
      "Entenda o recorte de retas por Liang-Barsky: a forma paramétrica, as quatro condições contra as " +
      "bordas, o significado de p<0 (entrada) e p>0 (saída) e a atualização de u₁ e u₂.",
    parts: [{ label: "Guia", build: build }],
  });
})();
