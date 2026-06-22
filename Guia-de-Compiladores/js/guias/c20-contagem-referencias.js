/*
 * c20-contagem-referencias.js — Guia: Coleta de lixo por contagem de referências.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      {
        title: "Contar quem aponta para cada objeto",
        body:
          "<p>Em vez de rastrear das raízes, cada objeto guarda um <b>contador de referências</b>: " +
          "quantos ponteiros apontam para ele. Quando o contador chega a <b>0</b>, ninguém mais o " +
          "alcança → libera <b>na hora</b>.</p>" +
          "<p>É <b>incremental</b> (sem pausas longas), mas tem um ponto cego importante.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["A", "B", "C", "E"], root: 0,
              pointers: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 1, side: "bottom" }, { from: 0, to: 3 }],
              note: "B tem 2 referências (de A e de C); C tem 1 (de B).",
            });
          },
        },
      },
      C.domStep(
        "As operações",
        "Toda mudança de ponteiro atualiza contadores:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Regras</div>" +
          "<ul>" +
          "<li>criar um ponteiro para X → <code>X.count += 1</code>;</li>" +
          "<li>remover um ponteiro para X → <code>X.count −= 1</code>;</li>" +
          "<li>se <code>X.count == 0</code> → libere X e <b>decremente</b> os contadores de todos os " +
          "objetos que X apontava (efeito <b>cascata</b>).</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Exemplo (Lista C, Q14)",
        body: "Executando C.ptrParaB = D e depois A.ptrParaB = NULL:",
        headers: ["operação", "efeito nos contadores", "libera?"],
        rows: [
          ["C.ptrParaB = D", "B: 2→1 ; D: 1→2", "—"],
          ["A.ptrParaB = NULL", "B: 1→0", "libera B"],
          ["cascata ao liberar B", "C: 1→0 (B apontava C)", "libera C"],
        ],
      }),
      {
        title: "O ponto cego: ciclos",
        body:
          "<p>Se dois objetos se apontam (<b>ciclo</b>), seus contadores nunca chegam a 0 — mesmo que " +
          "<b>ninguém de fora</b> os alcance. A contagem de referências <b>não coleta ciclos</b>: eles " +
          "<b>vazam</b>.</p>" +
          "<p>É justamente o caso que o rastreamento (Mark-Sweep / Stop-Copy) resolve.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["D", "F"], x: 240, root: null,
              pointers: [{ from: 0, to: 1, side: "top" }, { from: 1, to: 0, side: "bottom" }],
              note: "D e F se apontam (count 1 cada), mas são inalcançáveis → vazamento.",
            });
          },
        },
      },
      C.tableStep({
        title: "Contagem de referências × rastreamento",
        body: "Abordagens complementares:",
        headers: ["", "Contagem de refs", "Rastreamento (GC)"],
        rows: [
          ["Quando coleta", "na hora (count = 0)", "em ciclos de coleta"],
          ["Pausas", "curtas, espalhadas", "pausa para coletar"],
          ["Ciclos", "vaza (não coleta)", "coleta"],
          ["Custo por ponteiro", "atualizar contador", "nenhum"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Contagem de referências troca rastreamento por bookkeeping incremental.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Conte ponteiros; libere ao chegar a 0 (com cascata). Simples e imediato — mas " +
          "<b>ciclos vazam</b>, exigindo um coletor de rastreamento de apoio.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c20-contagem-referencias",
    num: "RC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Contagem de referências",
    type: "conceitual",
    hubDesc: "Contador por objeto; libera ao zerar (cascata); ciclos vazam.",
    statement:
      "Entenda a coleta de lixo por contagem de referências: as operações de incremento/decremento, a " +
      "liberação em cascata e a limitação dos ciclos.",
    parts: [{ label: "Guia", build: build }],
  });
})();
