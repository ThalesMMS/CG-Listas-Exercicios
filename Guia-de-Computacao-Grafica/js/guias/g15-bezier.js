/*
 * g15-bezier.js — Guia: conversão de curva interpolada para Bézier.
 * Procedimento matricial de troca de base: Q(u)=U·M_B·G_B = U·M_I·G_I, logo
 * G_B = (M_B⁻¹·M_I)·G_I. Foco no PORQUÊ de cancelar U e inverter M_B.
 *
 * Derivação adaptada da Lista 2 (q11). Usa EX.Guia.mat/row/dom.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var MAT = EX.Guia.mat,
    ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  var U = MAT([["u³", "u²", "u", "1"]]);
  var MB = MAT([
    ["−1", "3", "−3", "1"],
    ["3", "−6", "3", "0"],
    ["−3", "3", "0", "0"],
    ["1", "0", "0", "0"],
  ]);
  var MI = MAT([
    ["−9/2", "27/2", "−27/2", "9/2"],
    ["9", "−45/2", "18", "−9/2"],
    ["−11/2", "9", "−9/2", "1"],
    ["1", "0", "0", "0"],
  ]);
  var MBinv = MAT([
    ["0", "0", "0", "1"],
    ["0", "0", "1/3", "1"],
    ["0", "1/3", "2/3", "1"],
    ["1", "1", "1", "1"],
  ]);
  var CONV = MAT([
    ["6", "0", "0", "0"],
    ["−5", "18", "−9", "2"],
    ["2", "−9", "18", "−5"],
    ["0", "0", "0", "6"],
  ]);
  var GB = MAT([["B₀"], ["B₁"], ["B₂"], ["B₃"]]);
  var GI = MAT([["P₀"], ["P₁"], ["P₂"], ["P₃"]]);

  function build() {
    return [
      // 1) Motivação
      {
        title: "Por que converter de base",
        body:
          "<p>Uma curva <b>interpolada</b> passa <em>por</em> todos os seus pontos P₀…P₃ — ótimo para " +
          "“encostar” em dados. Uma curva de <b>Bézier</b> passa só pelos extremos e usa os do meio " +
          "como “ímãs”; é a base que motores gráficos, fontes e ferramentas de desenho entendem " +
          "(de Casteljau, casca convexa, subdivisão).</p>" +
          "<p>Conversão = <b>mesma curva</b>, outra descrição. Queremos os pontos de controle de " +
          "Bézier B₀…B₃ que desenham <em>exatamente</em> a curva interpolada dada.</p>",
        visual: DOM(
          ROW("interpolada: passa por&nbsp;" + GI) +
            ROW("Bézier: controlada por&nbsp;" + GB) +
            "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>a curva é a mesma; mudam só os pontos que a descrevem</p>"
        ),
      },
      // 2) Mesma curva, duas bases
      {
        title: "Mesma curva, duas bases",
        body:
          "<p>Toda cúbica se escreve <code>Q(u) = U · M · G</code>, com <code>U = [u³ u² u 1]</code>, " +
          "<b>M</b> a matriz da base e <b>G</b> a geometria (pontos de controle).</p>" +
          "<p>Escrevendo a <b>mesma</b> curva nas duas bases:</p>" +
          "<p style='text-align:center'><code>U·M<sub>B</sub>·G<sub>B</sub> = U·M<sub>I</sub>·G<sub>I</sub></code></p>",
        visual: DOM(ROW("Q(u) =&nbsp;" + U + "· M ·" + MAT([["g₀"], ["g₁"], ["g₂"], ["g₃"]]))),
      },
      // 3) As matrizes de base
      {
        title: "As duas matrizes de base",
        body:
          "<p><b>M<sub>B</sub></b> é a matriz de Bézier. <b>M<sub>I</sub></b> é a da interpolada para nós " +
          "igualmente espaçados <code>u = 0, ⅓, ⅔, 1</code> — obtida invertendo a matriz dos " +
          "<code>uⁱ</code> avaliados nesses nós.</p>" +
          "<p>É por isso que a parametrização importa: M<sub>I</sub> <b>depende dos nós escolhidos</b>.</p>",
        visual: DOM(ROW("M<sub>B</sub> =&nbsp;" + MB) + ROW("M<sub>I</sub> =&nbsp;" + MI)),
      },
      // 4) Igualando as bases
      {
        title: "Cancelar U e isolar G_B",
        body:
          "<p>A igualdade vale para <b>todo u</b>. Como <code>U</code> aparece dos dois lados e é " +
          "arbitrário, podemos <b>cancelá-lo</b>:</p>" +
          "<p style='text-align:center'><code>M<sub>B</sub>·G<sub>B</sub> = M<sub>I</sub>·G<sub>I</sub></code></p>" +
          "<p>Agora multiplicamos à esquerda por <code>M<sub>B</sub>⁻¹</code> para deixar " +
          "<code>G<sub>B</sub></code> sozinho:</p>" +
          "<p style='text-align:center'><code>G<sub>B</sub> = (M<sub>B</sub>⁻¹·M<sub>I</sub>)·G<sub>I</sub></code></p>" +
          "<p>A <span class='hl'>matriz de conversão</span> é <code>M = M<sub>B</sub>⁻¹·M<sub>I</sub></code>.</p>",
        visual: DOM(ROW("M<sub>B</sub>⁻¹ =&nbsp;" + MBinv)),
      },
      // 5) A matriz de conversão
      {
        title: "A matriz de conversão",
        body:
          "<p>Efetuando o produto <code>M<sub>B</sub>⁻¹·M<sub>I</sub></code> chega-se a:</p>" +
          "<p style='text-align:center;font-family:var(--mono)'>B₀ = P₀<br>" +
          "B₁ = (−5P₀ + 18P₁ − 9P₂ + 2P₃)/6<br>" +
          "B₂ = (2P₀ − 9P₁ + 18P₂ − 5P₃)/6<br>" +
          "B₃ = P₃</p>",
        visual: DOM(ROW(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
      // 6) Verificação
      {
        title: "Por que a matriz faz sentido",
        body:
          "<p>Dois testes rápidos confirmam:</p>" +
          "<ul>" +
          "<li><b>B₀ = P₀</b> e <b>B₃ = P₃</b>: a Bézier resultante <b>interpola os extremos</b> — " +
          "exatamente o que se espera (a Bézier toca as pontas).</li>" +
          "<li>cada linha <b>soma 1</b> (ex.: (−5+18−9+2)/6 = 1): preserva pontos e é <b>invariante a " +
          "translações</b> (mover todos os P move a curva igual).</li>" +
          "</ul>",
        visual: DOM(ROW(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
      // 7) Resumo / cuidados
      {
        title: "Resumo e cuidados",
        body:
          "<p>O método é geral: para converter <b>entre quaisquer duas bases</b> cúbicas, a matriz é " +
          "<code>M<sub>destino</sub>⁻¹·M<sub>origem</sub></code>. Aqui foi Bézier ← interpolada.</p>" +
          "<ul>" +
          "<li><b>Nós</b>: M<sub>I</sub> assume <code>u = 0, ⅓, ⅔, 1</code>. Nós diferentes → outra " +
          "M<sub>I</sub> → outra matriz de conversão.</li>" +
          "<li><b>Ponto-linha vs ponto-coluna</b>: trocar a convenção transpõe tudo; seja consistente.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html:
                "Mudar de curva é <b>mudar de base</b>: iguale <code>U·M·G</code> nas duas bases, " +
                "cancele <code>U</code> e inverta a matriz da base de destino.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g15-bezier",
    num: "B←",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Conversão interpolada → Bézier",
    type: "computacional",
    tags: ["curvas", "bézier", "matriz", "base"],
    hubDesc: "G_B = M_B⁻¹·M_I·G_I; por que cancelar U e inverter M_B; B₁=(−5P₀+18P₁−9P₂+2P₃)/6.",
    statement:
      "Entenda o procedimento matricial para converter uma curva interpolada em Bézier: igualar as " +
      "duas bases, cancelar U e obter a matriz de conversão M = M_B⁻¹·M_I.",
    parts: [{ label: "Guia", build: build }],
  });
})();
