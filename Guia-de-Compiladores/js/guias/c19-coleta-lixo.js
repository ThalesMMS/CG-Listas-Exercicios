/*
 * c19-coleta-lixo.js — Guia: Coleta de lixo (Mark-and-Sweep e Stop-and-Copy).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var BEFORE = {
    cells: ["A", "B", "C", "D", "E", "F"], root: 0, free: [],
    pointers: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 4 },
      { from: 3, to: 5, side: "top" }, { from: 5, to: 3, side: "bottom" },
    ],
    note: "raiz → A. Alcançáveis: A, B, C, E. D e F só se apontam (ciclo inalcançável).",
  };

  function build() {
    return [
      {
        title: "O que é lixo",
        body:
          "<p>Um objeto é <b>lixo</b> quando não há mais como o programa alcançá-lo a partir das " +
          "<b>raízes</b> (variáveis na pilha, registradores, globais). O coletor encontra os " +
          "alcançáveis e libera o resto.</p>" +
          "<p>Aqui, A→B→C e A→E são alcançáveis; <b>D e F</b> formam um ciclo que ninguém alcança.</p>",
        visual: { type: "svg", draw: function (svg) { C.heap(svg, BEFORE); } },
      },
      {
        title: "Mark-and-Sweep",
        body:
          "<p>Dois passos:</p>" +
          "<ol><li><b>Marcar</b>: a partir das raízes, percorra (DFS/BFS) e marque tudo que é " +
          "alcançável;</li>" +
          "<li><b>Varrer</b>: passe linearmente pelo heap e mande os <b>não marcados</b> para a lista " +
          "de livres.</li></ol>" +
          "<p>Os objetos <b>não se movem</b> → simples, mas o heap fica <b>fragmentado</b> (livres " +
          "espalhados).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["A", "B", "C", "D", "E", "F"], root: 0, free: [3, 5],
              pointers: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 4 }],
              note: "varrido: D e F (não marcados) viram livres; A, B, C, E ficam no lugar.",
            });
          },
        },
      },
      {
        title: "Stop-and-Copy",
        body:
          "<p>O heap é dividido em <b>dois espaços</b>. O coletor <b>copia</b> os objetos alcançáveis " +
          "(em ordem de varredura) para o espaço novo, <b>atualizando os ponteiros</b>, e depois troca " +
          "os espaços.</p>" +
          "<p>Efeito colateral ótimo: os vivos ficam <b>contíguos</b> (compactação, sem fragmentação). " +
          "Custo: usa só metade da memória por vez.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["A", "B", "E", "C", "·", "·"], root: 0, free: [4, 5],
              pointers: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }],
              note: "copiado e compactado no novo espaço; D e F simplesmente não vêm.",
            });
          },
        },
      },
      C.tableStep({
        title: "Mark-Sweep × Stop-Copy",
        body: "Duas técnicas de <b>rastreamento</b> (ambas partem das raízes):",
        headers: ["", "Mark-and-Sweep", "Stop-and-Copy"],
        rows: [
          ["Move objetos?", "não", "sim (copia)"],
          ["Fragmentação", "sim", "não (compacta)"],
          ["Memória usada", "todo o heap", "metade por vez"],
          ["Custo", "∝ heap todo (sweep)", "∝ objetos vivos"],
          ["Ciclos inalcançáveis", "coletados", "coletados"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Coletores de rastreamento definem “vivo” como “alcançável das raízes”.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "<b>Marca</b> os alcançáveis e <b>varre</b> o resto (Mark-Sweep), ou <b>copia</b> os vivos e " +
          "compacta (Stop-Copy). Ambos coletam ciclos de lixo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c19-coleta-lixo",
    num: "GC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Coleta de lixo: Mark-Sweep e Stop-Copy",
    type: "conceitual",
    hubDesc: "Rastreamento das raízes: marcar-e-varrer (fragmenta) vs parar-e-copiar (compacta).",
    statement:
      "Entenda a coleta de lixo por rastreamento: as técnicas Mark-and-Sweep (marcar e varrer) e " +
      "Stop-and-Copy (parar e copiar), e suas diferenças quanto a compactação e custo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
