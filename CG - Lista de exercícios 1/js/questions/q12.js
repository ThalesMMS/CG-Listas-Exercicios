/*
 * q12.js — "Explique o porquê de delta sempre ser positivo." (conceitual, Bresenham)
 * Usa-se |Δx|, |Δy| (magnitudes); o sentido vai para sx, sy.
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [-8, 8, -6, 6];
  var O = { x: 0, y: 0 };
  var ENDS = [
    { p: { x: 6, y: 3 }, sx: "+1", sy: "+1", c: COL.accent },
    { p: { x: -6, y: 3 }, sx: "−1", sy: "+1", c: COL.green },
    { p: { x: 6, y: -3 }, sx: "+1", sy: "−1", c: COL.orange },
    { p: { x: -6, y: -3 }, sx: "−1", sy: "−1", c: COL.purple },
  ];

  window.GUI.register({
    id: 12,
    num: "12",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Por que delta é sempre positivo",
    type: "conceitual",
    hubDesc: "Trabalha-se com |Δx| e |Δy|; o sentido da reta vai para sx, sy.",
    enunciado: "Explique o porquê de delta sempre ser positivo.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "p vem de distâncias (magnitudes)",
              explicacao:
                "<p>A variável de decisão <code>p</code> nasce de uma comparação de " +
                "<b>distâncias</b> (o erro em relação à reta ideal). Distâncias são " +
                "<b>magnitudes</b> — não-negativas.</p>" +
                "<p>Por isso usam-se <span class='hl'>Δx = |x₁ − x₀|</span> e " +
                "<span class='hl'>Δy = |y₁ − y₀|</span>, sempre ≥ 0.</p>",
            },
            {
              titulo: "O sentido vai para sx, sy",
              explicacao:
                "<p>A <b>direção</b> da reta (esquerda/direita, cima/baixo) é tratada " +
                "<b>separadamente</b> pelos sinais do passo <code>sx = ±1</code> e " +
                "<code>sy = ±1</code>.</p>" +
                "<p>As 4 retas abaixo têm o <b>mesmo</b> Δx=6, Δy=3 (positivos); só mudam sx, sy:</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                ENDS.forEach(function (e) {
                  plane.segment(O, e.p, { color: e.c, lineWidth: 2 });
                  plane.point(e.p.x, e.p.y, { color: e.c, radius: 4, label: "sx=" + e.sx + " sy=" + e.sy, labelColor: e.c, labelSize: 10 });
                });
                plane.point(0, 0, { color: COL.ink, radius: 4 });
              },
            },
            {
              titulo: "Uma fórmula para todos os octantes",
              explicacao:
                "<p>Mantendo Δ <b>positivo</b>, a <b>mesma</b> fórmula de decisão serve a todos os " +
                "octantes — só mudam <code>sx, sy</code>. Se Δ pudesse ser negativo, os sinais em " +
                "<code>p</code> e nos incrementos <code>2Δy</code>, <code>2Δy−2Δx</code> se " +
                "inverteriam e a lógica de decisão <span class='no'>quebraria</span>.</p>",
            },
          ];
        },
      },
    ],
  });
})();
