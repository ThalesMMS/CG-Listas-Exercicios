/*
 * c07-parsing-ll1.js — Guia: Parsing preditivo LL(1) (pilha + tabela).
 * Trace da string (();0) com a gramática S→(T; T→CA|); A→;B|); B→CA|); C→0|1|S.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      G.gstep(
        "Como o parser preditivo trabalha",
        "Com a tabela pronta, o parsing LL(1) é mecânico: usa uma <b>pilha</b> e lê a entrada da " +
          "esquerda para a direita, <b>sem backtracking</b>. Vamos analisar <code>( ( ) ; 0 )</code> " +
          "com a gramática:",
        ["S → ( T", "T → C A | )", "A → ; B | )", "B → C A | )", "C → 0 | 1 | S"]
      ),
      C.domStep(
        "O algoritmo",
        "A pilha começa com <code>S $</code> e a entrada termina em <code>$</code>. Repita olhando o " +
          "<b>topo da pilha</b>:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Passos</div>" +
          "<ul>" +
          "<li><b>topo é terminal</b>: tem que <b>casar</b> com o próximo símbolo da entrada (consome " +
          "os dois);</li>" +
          "<li><b>topo é não-terminal A</b>, lookahead <code>a</code>: aplique <code>M[A, a]</code>, " +
          "desempilhe A e empilhe o lado direito <b>ao contrário</b> (para o 1º símbolo ficar no topo);</li>" +
          "<li>pilha e entrada em <code>$</code> → <b>aceita</b>; célula vazia → <b>erro de sintaxe</b>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Trace — entrada (();0)",
        body: "O topo da pilha fica à esquerda. Cada linha aplica a tabela ou casa um terminal.",
        headers: ["pilha", "entrada", "ação"],
        rows: [
          ["S $", "(();0)$", "S → (T"],
          ["( T $", "(();0)$", "casa ("],
          ["T $", "();0)$", "T → CA"],
          ["C A $", "();0)$", "C → S"],
          ["S A $", "();0)$", "S → (T"],
          ["( T A $", "();0)$", "casa ("],
          ["T A $", ");0)$", "T → )"],
          [") A $", ");0)$", "casa )"],
          ["A $", ";0)$", "A → ;B"],
          ["; B $", ";0)$", "casa ;"],
          ["B $", "0)$", "B → CA"],
          ["C A $", "0)$", "C → 0"],
          ["0 A $", "0)$", "casa 0"],
          ["A $", ")$", "A → )"],
          [") $", ")$", "casa )"],
          ["$", "$", "aceita!"],
        ],
      }),
      C.domStep(
        "Armadilhas e resumo",
        "O parsing LL(1) é determinístico: cada passo é uma consulta de tabela ou um casamento.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Pontos de atenção</div>" +
          "<ul>" +
          "<li><b>Empilhe ao contrário</b>: para <code>S → ( T</code>, empilha-se T e depois ( (o " +
          "<code>(</code> fica no topo);</li>" +
          "<li>note a <b>recursão</b> em ação: <code>C → S → ( T</code> reabre um parêntese;</li>" +
          "<li><b>célula vazia</b> na tabela = rejeita (erro de sintaxe).</li>" +
          "</ul></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c07-parsing-ll1",
    num: "LL1",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Parsing preditivo LL(1)",
    type: "computacional",
    hubDesc: "Pilha + tabela, casamento de terminais e expansão de não-terminais; trace de (();0).",
    statement:
      "Entenda o parsing preditivo LL(1): a pilha iniciada com S$, o casamento de terminais, a " +
      "expansão de não-terminais pela tabela e a sequência de ações até aceitar.",
    parts: [{ label: "Guia", build: build }],
  });
})();
