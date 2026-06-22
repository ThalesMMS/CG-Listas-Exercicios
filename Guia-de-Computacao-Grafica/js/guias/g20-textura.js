/*
 * g20-textura.js — Guia: correção do mapeamento de textura.
 * O problema do texture scanning direto (buracos e sobreposições), a correção
 * por mapeamento inverso, e a interpolação perspectivamente correta (u/z, v/z, 1/z).
 *
 * Visual: SVG (grades de texels/pixels, setas, trapézio em perspectiva).
 */
(function () {
  "use strict";
  var EX = window.EX;

  function grid(svg, x, y, cols, rows, cw, fill) {
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: fill || "none", stroke: "var(--ink-mute)", strokeWidth: 1 });
  }
  function mark(svg, x, y, cw, c, r, fill, label, color) {
    svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: fill });
    if (label) svg.text(x + c * cw + cw / 2, y + r * cw + cw / 2, label, { size: 13, weight: 800, color: color });
  }

  function build() {
    return [
      {
        title: "Colar uma imagem numa superfície",
        body:
          "<p>Mapear textura é associar cada ponto da superfície a um <b>texel</b> (pixel da imagem). " +
          "O jeito ingênuo — <b>texture scanning direto</b> — percorre a <b>textura</b> e projeta cada " +
          "texel na tela.</p>" +
          "<p>Parece natural, mas quebra: a transformação textura→tela quase nunca é <b>1:1</b> (há " +
          "escala e perspectiva).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 240);
            grid(svg, 40, 40, 4, 4, 28, "var(--bg-soft)");
            svg.text(96, 188, "textura (texels)", { size: 11, color: "var(--ink-dim)" });
            svg.arrow(180, 96, 240, 96, { color: "var(--ink-dim)", strokeWidth: 2, head: 9 });
            grid(svg, 250, 40, 5, 5, 24, "var(--accent-soft)");
            svg.text(310, 188, "tela (pixels)", { size: 11, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "O problema: buracos e sobreposições",
        body:
          "<p>Como a grade de origem e a de destino têm <b>tamanhos diferentes</b>, ao projetar " +
          "texel→pixel acontecem dois defeitos:</p>" +
          "<ul>" +
          "<li><span class='no'>× buracos</span> — pixels que <b>nenhum</b> texel atinge;</li>" +
          "<li><span class='hl'>2 sobreposições</span> — pixels escritos <b>mais de uma vez</b>.</li>" +
          "</ul>" +
          "<p>O resultado tem falhas e <em>aliasing</em>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            grid(svg, 60, 40, 5, 5, 26, "var(--accent-soft)");
            mark(svg, 60, 40, 26, 0, 1, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 2, 3, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 4, 0, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 1, 1, "var(--yellow-soft)", "2", "var(--yellow)");
            mark(svg, 60, 40, 26, 3, 2, "var(--yellow-soft)", "2", "var(--yellow)");
            svg.text(125, 198, "× buracos   ·   2 sobreposições", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "A correção: mapeamento inverso",
        body:
          "<p>Inverta a varredura: percorra a <b>tela</b> e, para <b>cada pixel</b>, aplique a " +
          "transformação <b>inversa</b> para achar a coordenada na textura, amostrando ali.</p>" +
          "<p>Assim <b>todo pixel é preenchido exatamente uma vez</b> — sem buracos nem sobreposições. " +
          "E como caímos entre texels, usa-se <b>filtragem</b> (bilinear, mipmap) para suavizar.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 240);
            grid(svg, 40, 40, 5, 5, 24, "var(--green-soft)");
            svg.text(100, 188, "tela (pixels)", { size: 11, color: "var(--ink-dim)" });
            grid(svg, 300, 40, 4, 4, 28, "var(--bg-soft)");
            svg.text(356, 188, "textura", { size: 11, color: "var(--ink-dim)" });
            [[1, 1], [3, 0], [2, 3], [0, 4]].forEach(function (p) {
              svg.arrow(40 + p[0] * 24 + 12, 40 + p[1] * 24 + 12, 320, 96, { color: "var(--green)", strokeWidth: 1.3, head: 6, dashed: "4 4", opacity: 0.75 });
            });
            svg.text(220, 214, "cada pixel amostra a textura 1×", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Sob perspectiva: não interpole u, v direto",
        body:
          "<p>Numa face em perspectiva, interpolar <code>u, v</code> <b>linearmente na tela</b> está " +
          "<b>errado</b>: a profundidade comprime a textura ao longe, e a interpolação afim “entorta” " +
          "a imagem (textura nadando, xadrez deformado na diagonal).</p>" +
          "<p>O certo é interpolar <b>linearmente</b> as quantidades divididas por z e dividir no fim:</p>" +
          "<div class='formula'>interpola:  u/z ,  v/z ,  1/z\n" +
          "no pixel:   u = (u/z)/(1/z) ,  v = (v/z)/(1/z)</div>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 230);
            // chão em perspectiva (trapézio) com linhas que convergem ao fundo
            var tl = [160, 40], tr = [280, 40], br = [400, 200], bl = [40, 200];
            svg.polygon([tl, tr, br, bl], { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 2 });
            // linhas transversais aproximando o espaçamento correto (bunching ao fundo)
            [0.12, 0.28, 0.48, 0.72, 1].forEach(function (t) {
              var lx = bl[0] + (tl[0] - bl[0]) * (1 - t);
              var ly = bl[1] + (tl[1] - bl[1]) * (1 - t);
              var rx = br[0] + (tr[0] - br[0]) * (1 - t);
              var ry = br[1] + (tr[1] - br[1]) * (1 - t);
              svg.line(lx, ly, rx, ry, { stroke: "var(--accent)", strokeWidth: 1.4 });
            });
            svg.text(220, 220, "espaçamento certo: aperta ao fundo (1/z)", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Sempre inverso</b>: varra os pixels e busque o texel — nunca o contrário.</li>" +
          "<li><b>Perspectiva</b>: interpole <code>u/z, v/z, 1/z</code> e divida; senão a textura " +
          "“nada”.</li>" +
          "<li><b>Filtragem</b>: bilinear/mipmap evitam serrilhado e cintilação ao minificar.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Varra a <b>tela</b>, não a textura; e sob perspectiva interpole <b>u/z, v/z, 1/z</b>, " +
                "dividindo no pixel.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g20-textura",
    num: "▦",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Correção do mapeamento de textura",
    type: "conceitual",
    tags: ["textura", "perspectiva", "mapeamento inverso"],
    hubDesc: "Texture scanning direto falha (buracos/sobreposições); correção por mapeamento inverso e u/z,v/z,1/z.",
    statement:
      "Entenda a correção do mapeamento de textura: o problema da interpolação incorreta no texture " +
      "scanning direto e a correção por mapeamento inverso e interpolação perspectivamente correta.",
    parts: [{ label: "Guia", build: build }],
  });
})();
