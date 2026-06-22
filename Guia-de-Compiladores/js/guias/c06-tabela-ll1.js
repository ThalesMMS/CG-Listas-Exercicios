/*
 * c06-tabela-ll1.js — Guia: Tabela de parsing LL(1) e teste de LL(1).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      C.domStep(
        "A tabela preditiva M[A, a]",
        "A tabela LL(1) diz, para cada <b>não-terminal A</b> no topo da pilha e cada <b>terminal a</b> " +
          "de entrada (lookahead), <b>qual produção</b> usar. Uma consulta, zero backtracking.",
        C.codeHtml("se topo = A (não-terminal) e entrada = a\n   produção = M[A, a]")
      ),
      C.domStep(
        "Como preencher a tabela",
        "Para cada produção <code>A → α</code>:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Construção</div>" +
          "<ul>" +
          "<li>para cada <code>a ∈ FIRST(α)</code>: <code>M[A, a] = (A → α)</code>;</li>" +
          "<li>se <code>λ ∈ FIRST(α)</code>: para cada <code>b ∈ FOLLOW(A)</code>, " +
          "<code>M[A, b] = (A → α)</code>.</li>" +
          "</ul>" +
          "<p>Se alguma célula receber <b>duas</b> produções, há <b>conflito</b> → a gramática " +
          "<b>não</b> é LL(1).</p></div>"
      ),
      C.tableStep({
        title: "Tabela LL(1) — exemplo (Lista A)",
        body: "Para a gramática S → ( T; T → C A | ); A → ; B | ); B → C A | ); C → 0 | 1 | S, " +
          "usando os FIRST/FOLLOW do guia anterior:",
        headers: ["", "(", ")", ";", "0", "1", "$"],
        rows: [
          ["S", "S→(T", "", "", "", "", ""],
          ["T", "T→CA", "T→)", "", "T→CA", "T→CA", ""],
          ["A", "", "A→)", "A→;B", "", "", ""],
          ["B", "B→CA", "B→)", "", "B→CA", "B→CA", ""],
          ["C", "C→S", "", "", "C→0", "C→1", ""],
        ],
      }),
      C.domStep(
        "Teste: a gramática é LL(1)?",
        "Equivale a dizer que <b>nenhuma célula tem conflito</b>. Dois testes locais bastam:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Condições LL(1)</div>" +
          "<p>Para alternativas <code>A → α | β</code>:</p>" +
          "<ul>" +
          "<li><b>FIRST/FIRST</b>: <code>FIRST(α) ∩ FIRST(β) = ∅</code>;</li>" +
          "<li><b>FIRST/FOLLOW</b>: se <code>β ⇒ λ</code>, então <code>FIRST(α) ∩ FOLLOW(A) = ∅</code>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Diagnóstico (Lista A, Q7)",
        body: "Aplicando os dois testes a quatro gramáticas:",
        headers: ["gramática", "LL(1)?", "motivo"],
        rows: [
          ["X→aY|Z ; Y→a|c ; Z→bY", "sim", "FIRST(aY)={a}, FIRST(Z)={b} — disjuntos"],
          ["P→dR ; R→o|S ; S→g|og", "não", "FIRST(o) ∩ FIRST(S) ∋ o — conflito FIRST/FIRST"],
          ["J→aKL ; K→c|λ ; L→c", "não", "K⇒λ e FIRST(c) ∩ FOLLOW(K)={c} — FIRST/FOLLOW"],
          ["J→aKL ; K→c|λ ; L→b", "sim", "FIRST(K)={c} ∩ FOLLOW(K)={b} = ∅"],
        ],
      }),
      C.domStep(
        "Resumo",
        "A tabela é a “máquina de decidir” do parser LL(1).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Preencha M[A,a] por FIRST (e por FOLLOW quando há λ). <b>Sem conflitos ⇔ LL(1)</b>. " +
          "Gramáticas com recursão à esquerda ou prefixo comum costumam gerar conflitos — daí " +
          "fatorar e remover recursão antes.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c06-tabela-ll1",
    num: "M",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Tabela LL(1) e teste de LL(1)",
    type: "computacional",
    hubDesc: "Preencher M[A,a] por FIRST/FOLLOW; conflito ⇔ não é LL(1); diagnóstico por gramática.",
    statement:
      "Entenda a construção da tabela de parsing LL(1) a partir de FIRST/FOLLOW e o teste para decidir " +
      "se uma gramática é LL(1) (ausência de conflitos).",
    parts: [{ label: "Guia", build: build }],
  });
})();
