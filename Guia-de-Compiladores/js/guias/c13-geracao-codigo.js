/*
 * c13-geracao-codigo.js — Guia: Geração de código (máquina de pilha).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Gerar código para expressões",
        "Um gerador simples trata a CPU como uma <b>máquina de pilha</b> com um acumulador " +
          "(<code>$a0</code>). Avalia-se cada subexpressão deixando o resultado no acumulador e, quando " +
          "preciso, <b>empilha-se</b> na pilha (<code>$sp</code>) para liberar o acumulador.",
        C.codeHtml("cgen(e1 op e2):\n   cgen(e1)            # resultado em $a0\n   push $a0            # guarda na pilha\n   cgen(e2)            # resultado em $a0\n   $t1 <- pop         # recupera e1\n   $a0 <- $t1 op $a0  # aplica a operação")
      ),
      C.domStep(
        "Por que uma pilha",
        "Com <b>um</b> acumulador não dá para segurar dois resultados ao mesmo tempo. A pilha guarda os " +
          "valores intermediários enquanto a outra metade da expressão é avaliada — e isso compõe " +
          "recursivamente para <b>qualquer</b> aninhamento.",
        C.codeHtml("para 5 + (4 - 3):\n  avalia 5, empilha\n  avalia (4 - 3): avalia 4 empilha, avalia 3, subtrai → 1\n  desempilha 5, soma → 6")
      ),
      C.codeStep({
        title: "Lendo o assembly (Lista C, Q1)",
        body: "A ordem das operações na pilha revela a expressão. As linhas em destaque consomem da " +
          "pilha: <code>sub</code> faz 4−3, depois <code>add</code> faz 5+(4−3).",
        code:
          "li $a0 5\n" +
          "sw $a0 0($sp)\n" +
          "addiu $sp $sp -4\n" +
          "li $a0 4\n" +
          "sw $a0 0($sp)\n" +
          "addiu $sp $sp -4\n" +
          "li $a0 3\n" +
          "lw $t1 4($sp)\n" +
          "sub $a0 $t1 $a0   # 4 - 3\n" +
          "addiu $sp $sp 4\n" +
          "lw $t1 4($sp)\n" +
          "add $a0 $t1 $a0   # 5 + (4 - 3)\n" +
          "addiu $sp $sp 4",
        active: [9, 12],
        lang: "text",
      }),
      C.domStep(
        "Resultado",
        "Reconstruindo a árvore a partir da ordem de push/pop:",
        "<p style='text-align:center;font-size:18px'><code>5 + (4 − 3)</code></p>" +
          "<p>O operando empilhado primeiro (5) é o da <b>esquerda</b> da soma final; o " +
          "<code>sub</code> mais interno corresponde aos parênteses.</p>"
      ),
      C.tableStep({
        title: "Quantos temporários? (Lista C, Q3)",
        body: "O número de temporários é o <b>pico</b> simultâneo, não a soma — e os ramos de um " +
          "<code>if</code> não coexistem. Para potenciaDeDois (x%2==0 ? pot(x/2) : x==1):",
        headers: ["subexpressão", "temporários", "por quê"],
        rows: [
          ["x % 2 == 0", "2", "um para x%2, outro para a comparação"],
          ["potenciaDeDois(x/2)", "1", "um para o argumento x/2"],
          ["x == 1", "0", "comparação direta"],
          ["total da função", "2", "pico, não soma (then/else não coexistem)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "A máquina de pilha gera código correto para qualquer expressão aninhada.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Avalie no acumulador, <b>empilhe</b> o que precisa esperar; o nº de temporários é o " +
          "<b>pico</b> de valores vivos ao mesmo tempo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c13-geracao-codigo",
    num: "cgen",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Geração de código (máquina de pilha)",
    type: "computacional",
    hubDesc: "cgen com acumulador + pilha; reconstruir a expressão do assembly; pico de temporários.",
    statement:
      "Entenda a geração de código por máquina de pilha: o padrão cgen com acumulador e pilha, como ler " +
      "o assembly gerado e como contar os temporários necessários.",
    parts: [{ label: "Guia", build: build }],
  });
})();
