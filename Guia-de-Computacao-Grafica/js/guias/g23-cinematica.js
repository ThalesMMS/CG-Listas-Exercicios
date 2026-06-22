/*
 * g23-cinematica.js — Guia: cinemática direta e inversa.
 * Braço articulado de 2 elos. Direta: ângulos → posição da ponta (encadeamento
 * de transformações). Inversa: posição alvo → ângulos (lei dos cossenos,
 * múltiplas soluções). Comparação entre as duas.
 *
 * Visual: SVG. Exemplo/diagrama inspirados na Lista 3 (q20).
 */
(function () {
  "use strict";
  var EX = window.EX;

  function base(svg, p, color) {
    svg.rect(p[0] - 18, p[1], 36, 14, { fill: "var(--ink-mute)", rx: 2 });
    svg.circle(p[0], p[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2 });
  }
  function arm(svg, b, j1, ee, color, dashed) {
    svg.line(b[0], b[1], j1[0], j1[1], { stroke: color, strokeWidth: 7, dashed: dashed });
    svg.line(j1[0], j1[1], ee[0], ee[1], { stroke: color, strokeWidth: 6, dashed: dashed });
    svg.circle(j1[0], j1[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2 });
  }

  // Configuração direta (ângulos conhecidos).
  var BF = [120, 250], J1 = [173, 165], EE = [156, 85];
  // Configuração inversa (dois cotovelos para o mesmo alvo).
  var BI = [150, 250], TGT = [280, 150], JUP = [246.8, 225], JDN = [198.9, 162.8];

  function build() {
    return [
      {
        title: "Um braço, duas perguntas",
        body:
          "<p>Pense num braço de <b>2 elos</b> preso a uma base, com juntas que giram pelos ângulos " +
          "<code>θ₁</code> e <code>θ₂</code>. Há dois problemas opostos:</p>" +
          "<ul>" +
          "<li><b>Direta</b>: sei os ângulos → onde fica a <b>ponta</b>?</li>" +
          "<li><b>Inversa</b>: quero a ponta num <b>alvo</b> → quais ângulos uso?</li>" +
          "</ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BF, J1, EE, "var(--accent)");
            base(svg, BF, "var(--accent)");
            svg.circle(EE[0], EE[1], 8, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(EE[0] - 10, EE[1] - 12, "ponta", { size: 12, weight: 700, color: "var(--green)", anchor: "end" });
          },
        },
      },
      {
        title: "Cinemática direta: ângulos → posição",
        body:
          "<p>Encadeamos os elos. O 1º elo (comprimento L₁) gira θ₁; o 2º (L₂) gira θ₁+θ₂ (acumula). " +
          "Somando os vetores:</p>" +
          "<div class='formula'>x = L₁·cos θ₁ + L₂·cos(θ₁+θ₂)\n" +
          "y = L₁·sin θ₁ + L₂·sin(θ₁+θ₂)</div>" +
          "<p>É <b>direto e único</b>: dados os ângulos, há <b>uma</b> posição da ponta. (É a mesma " +
          "ideia de compor transformações, junta após junta.)</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BF, J1, EE, "var(--accent)");
            base(svg, BF, "var(--accent)");
            // ângulos conhecidos (amarelo)
            svg.text(BF[0] + 30, BF[1] - 14, "θ₁", { size: 14, weight: 800, color: "var(--yellow)" });
            svg.text(J1[0] + 12, J1[1] - 4, "θ₂", { size: 14, weight: 800, color: "var(--yellow)" });
            svg.circle(EE[0], EE[1], 8, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(EE[0] - 10, EE[1] - 12, "P (calculada)", { size: 12, weight: 700, color: "var(--green)", anchor: "end" });
          },
        },
      },
      {
        title: "Cinemática inversa: posição → ângulos",
        body:
          "<p>Agora a ponta deve atingir o <span class='no'>alvo</span>. Com a distância " +
          "<code>d</code> da base ao alvo, a <b>lei dos cossenos</b> dá θ₂:</p>" +
          "<div class='formula'>cos θ₂ = (d² − L₁² − L₂²) / (2·L₁·L₂)\n" +
          "θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂)</div>" +
          "<p>Repare no <b>±</b> do arco-cosseno: em geral há <b>duas</b> soluções — “cotovelo para " +
          "cima” e “para baixo”. E se <code>d &gt; L₁+L₂</code> (longe demais) ou <code>d &lt; |L₁−L₂|</code> " +
          "(perto demais), <b>não há solução</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BI, JDN, TGT, "var(--ink-mute)", "6 5"); // cotovelo baixo (alternativa)
            arm(svg, BI, JUP, TGT, "var(--accent)"); // cotovelo cima
            base(svg, BI, "var(--accent)");
            svg.text(BI[0] + 30, BI[1] - 14, "θ₁ ?", { size: 13, weight: 800, color: "var(--red)" });
            svg.circle(TGT[0], TGT[1], 9, { fill: "none", stroke: "var(--red)", strokeWidth: 2.5 });
            svg.circle(TGT[0], TGT[1], 3, { fill: "var(--red)" });
            svg.text(TGT[0] + 12, TGT[1] - 6, "alvo P*", { size: 12, weight: 700, color: "var(--red)", anchor: "start" });
            svg.text(JDN[0] - 16, JDN[1] + 18, "2ª solução", { size: 11, color: "var(--ink-mute)", anchor: "end" });
          },
        },
      },
      {
        title: "Direta × inversa",
        body: "<p>Por que a inversa é o lado difícil:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Direta", "Inversa"],
              rows: [
                ["Dado", "ângulos θ", "posição alvo"],
                ["Quer", "posição da ponta", "ângulos θ"],
                ["Solução", "fórmula direta", "trigonometria/numérica"],
                ["Nº de soluções", "1 (única)", "0, 1 ou 2 (ou ∞)"],
                ["Dificuldade", "fácil", "não-linear"],
              ],
            });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Direta</b>: some os elos girados — sempre dá uma resposta.</li>" +
          "<li><b>Inversa</b>: lei dos cossenos para 2 elos; escolha o cotovelo (cima/baixo) por " +
          "conveniência (ex.: evitar colisão).</li>" +
          "<li><b>Alcance</b>: confira <code>|L₁−L₂| ≤ d ≤ L₁+L₂</code> antes de resolver.</li>" +
          "<li>Braços com <b>muitas juntas</b> (redundantes) viram otimização — infinitas soluções.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Direta = somar elos girados (única). Inversa = resolver os ângulos para o alvo " +
                "(lei dos cossenos; pode ter 0, 1 ou 2 soluções).",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g23-cinematica",
    num: "⊿",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Cinemática direta e inversa",
    type: "conceitual",
    tags: ["animação", "cinemática", "articulações"],
    hubDesc: "Direta: ângulos→posição. Inversa: posição→ângulos (lei dos cossenos, 0/1/2 soluções).",
    statement:
      "Entenda a cinemática direta e inversa: calcular a posição final a partir das articulações ou, " +
      "inversamente, calcular as articulações a partir de uma posição desejada.",
    parts: [{ label: "Guia", build: build }],
  });
})();
