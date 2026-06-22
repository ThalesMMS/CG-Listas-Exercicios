/*
 * g18-phong.js — Guia: modelo de iluminação de Phong.
 * Componentes ambiente, difusa (N·L) e especular (R·V)^n; os vetores N, L, R, V
 * e a distinção entre iluminação local e global.
 *
 * Visual: SVG (svg.arrow/line/circle/polyline/text).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var P = [300, 260];
  var Nend = [300, 150], Lend = [190, 162], Rend = [410, 162], Vend = [462, 196];
  var LIGHT = [176, 146], EYEp = [478, 182];

  function ang(end) { return Math.atan2(end[1] - P[1], end[0] - P[0]); }
  function arcPoly(svg, a0, a1, r, color) {
    var pts = [];
    for (var i = 0; i <= 10; i++) {
      var a = a0 + (a1 - a0) * i / 10;
      pts.push([P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)]);
    }
    svg.polyline(pts, { stroke: color, strokeWidth: 2 });
  }
  function surface(svg) {
    svg.line(120, P[1], 480, P[1], { stroke: "var(--ink)", strokeWidth: 2.5 });
    for (var x = 130; x < 480; x += 22)
      svg.line(x, P[1], x - 10, P[1] + 12, { stroke: "var(--ink-mute)", strokeWidth: 1 });
    svg.circle(P[0], P[1], 4, { fill: "var(--ink)" });
  }
  function vec(svg, end, color, label, op, dashed) {
    svg.arrow(P[0], P[1], end[0], end[1], { color: color, strokeWidth: 3, head: 11, opacity: op, dashed: dashed });
    svg.text(end[0] + (end[0] < P[0] ? -12 : 12), end[1] - 6, label, { size: 14, weight: 800, color: color, opacity: op });
  }

  function build() {
    return [
      {
        title: "A cor de um ponto, em três parcelas",
        body:
          "<p>O modelo de Phong calcula a luz que sai de um ponto da superfície somando três efeitos:</p>" +
          "<ul><li><b>ambiente</b> — preenchimento de fundo;</li>" +
          "<li><b>difusa</b> — o “corpo” da cor, depende de onde está a luz;</li>" +
          "<li><b>especular</b> — o brilho, depende de onde está o observador.</li></ul>" +
          "<p>Quatro vetores no ponto contam a história: <span class='accent'>N</span> (normal), " +
          "<span class='hl'>L</span> (para a luz), <span class='orange'>R</span> (reflexo de L) e " +
          "<b>V</b> (para o observador).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            svg.circle(LIGHT[0], LIGHT[1], 11, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2 });
            svg.ellipse(EYEp[0], EYEp[1], 16, 11, { fill: "var(--bg-soft)", stroke: "var(--green)", strokeWidth: 1.5 });
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
          },
        },
      },
      {
        title: "Ambiente: k_a · I_a",
        body:
          "<p>Uma parcela <b>constante</b>, igual em todo ponto, que simula a luz que já “ricocheteou” " +
          "pelo ambiente e chega de todos os lados.</p>" +
          "<p>É uma <b>aproximação grosseira</b> da iluminação global (que Phong não calcula de " +
          "verdade) — serve para o lado na sombra não ficar totalmente preto.</p>" +
          "<div class='formula'>I_ambiente = k_a · I_a</div>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            for (var a = 0; a < Math.PI; a += Math.PI / 8)
              svg.arrow(P[0] + 70 * Math.cos(a + Math.PI), P[1] - 70 * Math.sin(a) - 0, P[0] + 30 * Math.cos(a + Math.PI), P[1] - 30 * Math.sin(a), { color: "var(--ink-mute)", strokeWidth: 1.2, head: 5 });
            svg.circle(P[0], P[1], 5, { fill: "var(--ink-dim)" });
            svg.text(P[0], 150, "vem de todos os lados", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Difusa: k_d · I_L · (N · L)",
        body:
          "<p>É a lei de <b>Lambert</b>: o brilho depende do <b>ângulo θ entre a normal N e a direção " +
          "da luz L</b>. Como <code>N·L = cos θ</code> (vetores unitários):</p>" +
          "<ul><li>luz <b>de frente</b> (θ = 0) → N·L = 1 → máximo;</li>" +
          "<li>luz <b>rasante</b> (θ → 90°) → N·L → 0 → some.</li></ul>" +
          "<p>Não depende do observador: uma superfície fosca parece igual de qualquer ângulo.</p>" +
          "<div class='formula'>I_difusa = k_d · I_L · (N · L)</div>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 0.18, "7 5");
            vec(svg, Vend, "var(--green)", "V", 0.18);
            arcPoly(svg, ang(Nend), ang(Lend), 48, "var(--yellow)");
            svg.text(250, 196, "θ", { size: 15, weight: 800, color: "var(--yellow)" });
          },
        },
      },
      {
        title: "Especular: k_s · I_L · (R · V)ⁿ",
        body:
          "<p>É o <b>brilho</b> (highlight). A luz reflete em <code>R</code> (espelho de L em torno de " +
          "N): <code>R = 2(N·L)N − L</code>. Quanto mais <code>R</code> aponta para o observador " +
          "<code>V</code>, mais forte o brilho.</p>" +
          "<p>O expoente <b>n</b> controla o tamanho: n alto = brilho pequeno e duro (superfície " +
          "polida); n baixo = brilho amplo e suave.</p>" +
          "<div class='formula'>I_especular = k_s · I_L · (R · V)ⁿ</div>" +
          "<p>Depende do observador — por isso o brilho “anda” quando você muda de ângulo.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            vec(svg, Nend, "var(--accent)", "N", 0.25);
            vec(svg, Lend, "var(--yellow)", "L", 0.25);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
            arcPoly(svg, ang(Rend), ang(Vend), 64, "var(--green)");
            svg.text(404, 196, "α", { size: 15, weight: 800, color: "var(--green)" });
          },
        },
      },
      {
        title: "A soma (sobre todas as luzes)",
        body:
          "<p>Juntando tudo, com uma parcela difusa+especular por <b>fonte de luz</b>:</p>" +
          "<div class='formula'>I = k_a·I_a  +  Σ_luzes [ k_d·I_L·(N·L) + k_s·I_L·(R·V)ⁿ ]</div>" +
          "<p>Os coeficientes <code>k_a, k_d, k_s</code> são propriedades do material; <code>n</code> " +
          "é o brilho. Termos com produto escalar negativo são zerados (a luz não ilumina o verso).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            svg.circle(LIGHT[0], LIGHT[1], 11, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2 });
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
          },
        },
      },
      {
        title: "Local × global",
        body: "<p>Onde Phong para e a iluminação global começa:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Phong (local)", "Global"],
              rows: [
                ["Luz considerada", "direta + ambiente fake", "inter-reflexões reais"],
                ["Sombras", "não (sem mais cálculo)", "sim"],
                ["Sangramento de cor", "não", "sim (radiosidade)"],
                ["Custo", "barato (por ponto)", "caro"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Cor = <b>ambiente + difusa(N·L) + especular(R·V)ⁿ</b>. É <b>local</b>: olha só a luz " +
                "direta; o resto entra como o termo ambiente.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g18-phong",
    num: "I",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Modelo de iluminação de Phong",
    type: "conceitual",
    tags: ["iluminação", "phong", "especular"],
    hubDesc: "Ambiente + difusa (N·L) + especular (R·V)ⁿ; e por que é iluminação local.",
    statement:
      "Entenda o modelo de iluminação de Phong: o cálculo das componentes ambiente, difusa e especular, " +
      "o papel dos vetores N, L, R, V e a distinção em relação à iluminação global.",
    parts: [{ label: "Guia", build: build }],
  });
})();
