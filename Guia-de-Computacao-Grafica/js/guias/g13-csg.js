/*
 * g13-csg.js — Guia: CSG (Constructive Solid Geometry).
 * Sólidos como árvores de operações booleanas (união ∪, interseção ∩,
 * diferença −) sobre primitivas. Por que a ordem importa e como se avalia.
 *
 * Visual: SVG (svg.circle/rect/ellipse/text) + EX.Diagram.tree.
 */
(function () {
  "use strict";
  var EX = window.EX;

  function build() {
    return [
      {
        title: "Montar sólidos como uma fórmula",
        body:
          "<p>Em vez de listar milhares de triângulos, CSG descreve um sólido como uma <b>combinação " +
          "de primitivas</b> (esfera, cubo, cilindro…) por <b>operações de conjunto</b>.</p>" +
          "<p>O modelo vira uma <b>árvore</b>: compacta, exata e fácil de editar (mude um parâmetro e " +
          "tudo se recompõe). É como peças se encaixando ou se subtraindo.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 200);
            svg.circle(110, 100, 52, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
            svg.text(110, 100, "esfera", { size: 12, color: "var(--accent)", weight: 700 });
            svg.rect(210, 60, 90, 90, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
            svg.text(255, 105, "cubo", { size: 12, color: "var(--green)", weight: 700 });
          },
        },
      },
      {
        title: "As três operações booleanas",
        body:
          "<p>Sobre dois sólidos A e B:</p>" +
          "<ul>" +
          "<li><b>União A ∪ B</b>: o que está em A <b>ou</b> B (juntar peças);</li>" +
          "<li><b>Interseção A ∩ B</b>: o que está em A <b>e</b> B (só a sobreposição);</li>" +
          "<li><b>Diferença A − B</b>: o que está em A e <b>não</b> em B (furar/cortar).</li>" +
          "</ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(720, 230);
            function pair(cx, mode, label) {
              var ax = cx - 26, bx = cx + 26, y = 110, r = 52;
              if (mode === "union") {
                svg.circle(ax, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
              } else if (mode === "inter") {
                svg.circle(ax, y, r, { fill: "var(--accent)", opacity: 0.4, stroke: "var(--accent)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--accent)", opacity: 0.4, stroke: "var(--accent)", strokeWidth: 1.5 });
                svg.text(cx, y, "∩", { size: 20, color: "var(--ink)", weight: 800 });
              } else {
                svg.circle(ax, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
              }
              svg.text(cx, 200, label, { size: 13, color: "var(--ink-dim)", weight: 700 });
            }
            pair(140, "union", "A ∪ B");
            pair(380, "inter", "A ∩ B");
            pair(600, "diff", "A − B");
          },
        },
      },
      {
        title: "A árvore CSG",
        body:
          "<p>As <b>folhas</b> são primitivas (cada uma com suas transformações: posição, rotação, " +
          "escala). Os <b>nós internos</b> são operações booleanas, sempre combinando <b>duas</b> " +
          "subárvores.</p>" +
          "<p>Exemplo: uma <em>lupa</em> = <code>círculo ∪ cilindro</code>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 280);
            EX.Diagram.tree(
              svg,
              { id: "u", label: "∪", children: [{ id: "c", label: "círculo" }, { id: "y", label: "cilindro" }] },
              { nodeShape: "box", highlight: ["u"], view: [480, 280] }
            );
          },
        },
      },
      {
        title: "Exemplo: diferença (uma lua)",
        body:
          "<p>Um crescente sai de <code>A − B</code>: tome o disco A e <b>remova</b> o disco B " +
          "(deslocado). O contorno tracejado mostra a parte cortada.</p>" +
          "<p>B age como <b>ferramenta de corte</b> — não aparece no resultado, só molda A.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 280);
            svg.circle(190, 150, 86, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(248, 110, 80, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "6 4" });
            svg.text(150, 150, "A", { size: 16, color: "var(--bg)", weight: 800 });
            svg.text(286, 92, "B", { size: 15, color: "var(--ink-dim)", weight: 800 });
            svg.text(220, 258, "A − B = crescente", { size: 13, color: "var(--ink-dim)", weight: 700 });
          },
        },
      },
      {
        title: "A ordem importa",
        body:
          "<p>União e interseção <b>comutam</b> (A ∪ B = B ∪ A), mas a <b>diferença não</b>: " +
          "<code>A − B ≠ B − A</code>. “Furar A com B” é diferente de “furar B com A”.</p>" +
          "<p>E como cada primitiva carrega suas <b>transformações</b>, mover B muda onde o corte " +
          "acontece. A árvore captura tudo isso de forma editável.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 230);
            svg.circle(150, 120, 64, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(196, 92, 58, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
            svg.text(120, 200, "A − B", { size: 12, color: "var(--ink-dim)", weight: 700 });
            svg.circle(330, 120, 58, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(286, 148, 64, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
            svg.text(330, 200, "B − A", { size: 12, color: "var(--ink-dim)", weight: 700 });
          },
        },
      },
      {
        title: "Como se avalia e comparação",
        body:
          "<p>Para saber se um ponto (ou um raio) está no sólido, percorre-se a árvore: testa-se " +
          "contra cada primitiva e combinam-se os resultados pelas operações (ray-casting através da " +
          "árvore CSG). Nada de gerar a malha de antemão.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Representação compacta e exata (primitivas + operações)",
                "Editável: muda um parâmetro e o sólido se recompõe",
                "Casa bem com ray casting (testa a árvore por raio)",
              ],
              cons: [
                "Renderizar como malha exige avaliar/converter (boolean em superfícies)",
                "Árvores profundas ficam caras de avaliar",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Sólido = <b>árvore de ∪/∩/− sobre primitivas</b>. Compacto, exato e editável; a " +
                "diferença não comuta.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g13-csg",
    num: "∪",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "CSG — Constructive Solid Geometry",
    type: "conceitual",
    tags: ["sólidos", "csg", "booleanas"],
    hubDesc: "União, interseção e diferença sobre primitivas; a árvore CSG e por que a ordem importa.",
    statement:
      "Entenda a CSG: composição de sólidos por operações de união, interseção e diferença sobre " +
      "primitivas, organizadas numa árvore, e como ela é avaliada.",
    parts: [{ label: "Guia", build: build }],
  });
})();
