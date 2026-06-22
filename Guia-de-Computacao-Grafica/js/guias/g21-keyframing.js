/*
 * g21-keyframing.js — Guia: key framing e in-betweening.
 * Quadros-chave (poses críticas) + geração automática dos quadros intermediários
 * por interpolação. Linear vs suavizado (timing).
 *
 * Visual: SVG (svg.circle/line/polyline/text). Exemplo: bola em arco (q16).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var X0 = 110, X1 = 600, BASE = 190, AMP = 96, TL = 300;
  function pos(t) { return [X0 + (X1 - X0) * t, BASE - AMP * Math.sin(Math.PI * t)]; }
  function ball(svg, t, solid) {
    var p = pos(t);
    svg.circle(p[0], p[1], solid ? 16 : 11, {
      fill: solid ? "var(--accent)" : "var(--accent-soft)",
      stroke: solid ? "var(--ink)" : "var(--accent)",
      strokeWidth: solid ? 2 : 1.5,
      dashed: solid ? null : "4 3",
    });
    svg.line(p[0], TL - 6, p[0], TL + 6, { stroke: solid ? "var(--accent)" : "var(--ink-mute)", strokeWidth: solid ? 3 : 1.5 });
  }
  function timeline(svg) {
    svg.line(X0, TL, X1, TL, { stroke: "var(--ink-mute)", strokeWidth: 2 });
    svg.text((X0 + X1) / 2, TL + 28, "tempo  t ∈ [0, 1]", { size: 12, color: "var(--ink-dim)" });
  }

  function build() {
    return [
      {
        title: "Desenhar só os momentos-chave",
        body:
          "<p>Animar é exibir muitos quadros por segundo. Desenhar todos à mão é inviável. A " +
          "solução: o animador cria só os <b>quadros-chave</b> (poses críticas — começo, fim, " +
          "extremos), e o computador gera os <b>intermediários</b> (in-betweens).</p>" +
          "<p>Aqui, dois key frames: a bola em <code>t = 0</code> e em <code>t = 1</code>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            timeline(svg);
            ball(svg, 0, true); ball(svg, 1, true);
            svg.text(pos(0)[0], pos(0)[1] + 38, "key frame 1", { size: 12, weight: 700, color: "var(--accent)" });
            svg.text(pos(1)[0], pos(1)[1] + 38, "key frame 2", { size: 12, weight: 700, color: "var(--accent)" });
          },
        },
      },
      {
        title: "In-between = interpolação",
        body:
          "<p>Para um quadro intermediário no instante <code>t</code>, interpolamos cada atributo " +
          "entre os key frames:</p>" +
          "<div class='formula'>P(t) = (1 − t)·P₀ + t·P₁</div>" +
          "<p>Posição, cor, escala, ângulo… cada um “anda” de P₀ a P₁ conforme t vai de 0 a 1. É a " +
          "mesma ideia da reta paramétrica, aplicada a <b>atributos de uma pose</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            timeline(svg);
            ball(svg, 0, true); ball(svg, 1, true);
            svg.line(pos(0)[0], 250, pos(1)[0], 250, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
          },
        },
      },
      {
        title: "A trajetória e os intermediários",
        body:
          "<p>Avaliando <code>P(t)</code> em vários <code>t</code> obtemos a sequência de in-betweens. " +
          "Aqui a bola segue um <b>arco</b> (a altura usa um seno), dando um salto natural.</p>" +
          "<p>Os quadros sólidos são os key frames; os tracejados, gerados automaticamente.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            var pts = [];
            for (var t = 0; t <= 1.0001; t += 0.04) pts.push(pos(t));
            svg.polyline(pts, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
            timeline(svg);
            [0.2, 0.4, 0.6, 0.8].forEach(function (t) { ball(svg, t, false); });
            ball(svg, 0, true); ball(svg, 1, true);
          },
        },
      },
      {
        title: "Timing: linear ou suavizado",
        body:
          "<p>Como <code>t</code> avança no tempo muda a sensação:</p>" +
          "<ul>" +
          "<li><b>linear</b>: in-betweens igualmente espaçados → velocidade constante (robótico);</li>" +
          "<li><b>ease in/out</b>: t segue uma curva → acelera e desacelera (natural).</li>" +
          "</ul>" +
          "<p>Daí a importância das curvas de animação: a interpolação diz <em>o caminho</em>; o " +
          "timing diz <em>o ritmo</em>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 200);
            svg.line(80, 70, 620, 70, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.text(350, 44, "linear: espaçamento uniforme", { size: 12, color: "var(--ink-dim)" });
            [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (t) {
              svg.circle(80 + 540 * t, 70, 7, { fill: "var(--accent)" });
            });
            svg.line(80, 150, 620, 150, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.text(350, 124, "ease: aperta nas pontas (acelera/desacelera)", { size: 12, color: "var(--ink-dim)" });
            [0, 0.06, 0.2, 0.5, 0.8, 0.94, 1].forEach(function (t) {
              var e = t * t * (3 - 2 * t);
              svg.circle(80 + 540 * e, 150, 7, { fill: "var(--green)" });
            });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Economia</b>: poucas poses-chave geram toda a animação.</li>" +
          "<li><b>Atributo certo</b>: posição interpola linear; <b>rotação</b> pede interpolação " +
          "angular (slerp) para não “encolher” no meio.</li>" +
          "<li><b>Splines</b> entre vários key frames dão trajetórias suaves (sem “quinas” nas poses).</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Key frames = poses; in-betweens = <code>(1−t)P₀ + tP₁</code>. A <b>curva de timing</b> " +
                "controla o ritmo.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g21-keyframing",
    num: "⏯",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Key framing e in-betweening",
    type: "conceitual",
    tags: ["animação", "keyframe", "interpolação"],
    hubDesc: "Poses-chave + geração dos quadros intermediários por interpolação; linear vs ease.",
    statement:
      "Entenda key framing e in-betweening: a geração dos quadros intermediários entre quadros-chave " +
      "por interpolação, e como o timing (linear ou suavizado) muda o movimento.",
    parts: [{ label: "Guia", build: build }],
  });
})();
