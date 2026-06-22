/*
 * c14-registros-ativacao.js — Guia: Registros de ativação e layout de objetos.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Pilha vertical de células rotuladas (com "dono" opcional à direita).
  function column(svg, x, cells, opts) {
    opts = opts || {};
    var y0 = opts.y0 || 24, w = opts.w || 180, h = 40, gap = 4;
    cells.forEach(function (c, i) {
      var y = y0 + i * (h + gap);
      var hot = opts.hot && opts.hot.indexOf(i) !== -1;
      C.box(svg, x, y, w, h, [c.label], {
        fill: hot ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: hot ? "var(--accent)" : "var(--border)",
        mono: false, size: 13,
      });
      if (c.note) svg.text(x + w + 12, y + h / 2, c.note, { anchor: "start", size: 12, color: "var(--ink-dim)" });
    });
  }

  function build() {
    return [
      {
        title: "O registro de ativação",
        body:
          "<p>Cada <b>chamada</b> de função recebe um <b>registro de ativação</b> (stack frame) na " +
          "pilha, com: os <b>parâmetros</b>, as <b>variáveis locais</b>, o <b>endereço de retorno</b> e " +
          "elos de controle. Ao retornar, o frame é desempilhado.</p>" +
          "<p>Frame de <code>f(x, y, z)</code>:</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 260);
            column(svg, 110, [
              { label: "endereço de retorno" },
              { label: "x", note: "parâmetro" },
              { label: "y", note: "parâmetro" },
              { label: "z", note: "parâmetro" },
            ], { hot: [1, 2, 3] });
          },
        },
      },
      C.tableStep({
        title: "Quem mora no frame de f? (Lista C, Q2)",
        body: "Em <code>f(x,y,z) = if x then g(y) else g(z)</code>, com <code>g(t) = t+1</code>:",
        headers: ["símbolo", "no frame de f?", "por quê"],
        rows: [
          ["x, y, z", "sim", "parâmetros de f"],
          ["t", "não", "é parâmetro de g (frame de g)"],
          ["g", "não", "é o nome da função, não uma variável"],
        ],
      }),
      {
        title: "Layout de objetos",
        body:
          "<p>Um objeto começa com <b>metadados</b> (id da classe, tamanho, ponteiro para a tabela de " +
          "despacho) e, em seguida, os <b>atributos</b> — na <b>ordem de herança</b>: os da classe-base " +
          "primeiro, depois os da subclasse.</p>" +
          "<p>Isso permite que código da base acesse seus atributos no mesmo deslocamento, mesmo num " +
          "objeto da subclasse.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 470);
            column(svg, 110, [
              { label: "id da classe" },
              { label: "tamanho do objeto" },
              { label: "ptr tabela de despacho" },
              { label: "x", note: "de B" },
              { label: "y", note: "de B" },
              { label: "z", note: "de C" },
              { label: "u", note: "de A" },
              { label: "v", note: "de A" },
            ], { hot: [3, 4, 5, 6, 7] });
          },
        },
      },
      C.domStep(
        "Deduzir a herança pelo layout (Lista C, Q4)",
        "Como os atributos aparecem <b>base primeiro</b>, a ordem <code>x, y → z → u, v</code> revela a " +
          "cadeia de herança.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Leitura</div>" +
          "<code>x, y</code> (de B) vêm primeiro → <b>B é a base</b>; depois <code>z</code> (C); por fim " +
          "<code>u, v</code> (A). Logo a cadeia é <b>B → C → A</b> (A é a mais derivada, herda de C, " +
          "que herda de B).</div>"
      ),
      C.domStep(
        "Resumo",
        "Frames e layouts são convenções fixas que tornam chamadas e acesso a atributos previsíveis.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Frame = locais + parâmetros + retorno da chamada. Objeto = metadados + atributos em " +
          "<b>ordem de herança</b> (base primeiro).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c14-registros-ativacao",
    num: "AR",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Registros de ativação e layout de objetos",
    type: "conceitual",
    hubDesc: "Stack frame (parâmetros/locais/retorno) e layout de objeto (metadados + atributos por herança).",
    statement:
      "Entenda o registro de ativação (stack frame) de uma chamada e o layout de memória de um objeto, " +
      "com os atributos dispostos em ordem de herança.",
    parts: [{ label: "Guia", build: build }],
  });
})();
