/*
 * c17-vivacidade.js — Guia: Análise de vivacidade (liveness).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "O que é uma variável 'viva'",
        "Uma variável está <b>viva</b> num ponto do programa se o valor que ela tem ali <b>pode ser " +
          "usado</b> depois — antes de ser sobrescrita. Variáveis mortas não precisam ocupar " +
          "registrador: por isso a vivacidade é a base da alocação de registradores.",
        C.codeHtml("... a := 5 ...        a está VIVA se algum caminho à frente lê 'a'\n                      antes de redefini-la; senão está MORTA")
      ),
      C.domStep(
        "Cálculo para trás (backward)",
        "A vivacidade flui do <b>uso futuro para trás</b>. Para cada bloco do CFG:",
        C.codeHtml("LIVE_out[B] = ∪ LIVE_in[sucessores de B]\nLIVE_in[B]  = USE[B] ∪ ( LIVE_out[B] − DEF[B] )") +
          "<p><code>USE</code> = lidas antes de escritas no bloco; <code>DEF</code> = escritas. " +
          "Itera-se até o ponto fixo.</p>"
      ),
      C.codeStep({
        title: "Exemplo (Lista C, Q8)",
        body: "Quais variáveis estão vivas <b>antes do teste</b>? Olhe o que cada caminho à frente usa:",
        code: "if X > 0\n  then Y := Y + 1\n  else Z := W + 4",
        active: [1],
        lang: "text",
      }),
      C.tableStep({
        title: "Vivas antes do teste",
        body: "Uma variável é viva se <em>algum</em> caminho à frente a usa antes de redefini-la:",
        headers: ["variável", "viva?", "por quê"],
        rows: [
          ["X", "sim", "usada na condição do teste"],
          ["Y", "sim", "usada no ramo then (Y + 1)"],
          ["W", "sim", "usada no ramo else (W + 4)"],
          ["Z", "não", "só é escrita (else), nunca lida depois"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Vivacidade diz, em cada ponto, quais valores ainda importam.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Calcule <b>para trás</b>: uma variável é viva se há um uso futuro <b>antes</b> de uma " +
          "redefinição. Duas variáveis vivas ao mesmo tempo não podem dividir registrador (próximo guia).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c17-vivacidade",
    num: "Live",
    subject: "Compiladores",
    section: "Otimização",
    title: "Análise de vivacidade",
    type: "computacional",
    hubDesc: "Variável viva = uso futuro antes de redefinir; equações backward USE/DEF.",
    statement:
      "Entenda a análise de vivacidade: o que torna uma variável viva, as equações de fluxo para trás " +
      "(USE/DEF) e seu papel na alocação de registradores.",
    parts: [{ label: "Guia", build: build }],
  });
})();
