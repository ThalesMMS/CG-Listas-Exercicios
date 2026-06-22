/*
 * g14-mandelbrot.js — Guia: conjunto de Mandelbrot / fractais.
 * A iteração z ← z² + c, o critério de escape |z| > 2, a coloração por tempo de
 * escape e a renderização do conjunto. Foco no PORQUÊ do processo iterativo.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var B = [-2.3, 0.9, -1.3, 1.3];
  var MAXIT = 50;

  // Iterações até |z| > 2 (ou MAXIT se não escapar). c = cr + i·ci.
  function escape(cr, ci, maxit) {
    var zr = 0, zi = 0, n = 0;
    while (n < maxit && zr * zr + zi * zi <= 4) {
      var t = zr * zr - zi * zi + cr;
      zi = 2 * zr * zi + ci;
      zr = t;
      n++;
    }
    return n;
  }
  function tint(n, maxit) {
    if (n >= maxit) return "#0a0a16"; // dentro do conjunto
    var t = n / maxit;
    var L = Math.round(14 + 68 * Math.sqrt(t));
    return "hsl(" + Math.round(212 - 130 * t) + ",78%," + L + "%)";
  }
  function render(plane, maxit) {
    var ctx = plane.ctx;
    var NX = 120, NY = 96;
    var x0 = plane.xmin, x1 = plane.xmax, y0 = plane.ymin, y1 = plane.ymax;
    var sx = (x1 - x0) / NX, sy = (y1 - y0) / NY;
    var w = sx * plane.scale + 1, h = sy * plane.scale + 1;
    ctx.save();
    for (var i = 0; i < NX; i++) {
      var cr = x0 + (i + 0.5) * sx;
      for (var j = 0; j < NY; j++) {
        var ci = y0 + (j + 0.5) * sy;
        ctx.fillStyle = tint(escape(cr, ci, maxit), maxit);
        ctx.fillRect(plane.cx(cr - sx / 2), plane.cy(ci + sy / 2), w, h);
      }
    }
    ctx.restore();
  }

  // Órbita real (ci=0) para os exemplos numéricos.
  function orbit(cr, steps) {
    var z = 0, seq = [0];
    for (var k = 0; k < steps; k++) {
      z = z * z + cr;
      seq.push(z);
      if (Math.abs(z) > 1e6) break;
    }
    return seq;
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Complexidade infinita de uma regra mínima",
      body:
        "<p>Fractais mostram como uma <b>regra simples, repetida</b>, gera estrutura infinitamente " +
        "detalhada e <b>auto-similar</b>. O conjunto de Mandelbrot é o exemplo célebre.</p>" +
        "<p>Toda a figura vem de uma única equação iterada — nada de armazenar a forma; ela é " +
        "<b>computada</b>, ponto a ponto.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "A regra: z ← z² + c",
      body:
        "<p>Para cada ponto <code>c = (cᵣ, cᵢ)</code> do plano complexo, itere a partir de " +
        "<code>z₀ = 0</code>:</p>" +
        "<div class='formula'>z_{n+1} = z_n² + c</div>" +
        "<p><b>c pertence ao conjunto</b> se a sequência <b>nunca foge para o infinito</b>. Se ela " +
        "dispara, c está fora.</p>" +
        "<p>Por que <code>|z| &gt; 2</code> decide? Porque uma vez que o módulo passa de 2, é possível " +
        "provar que ele só cresce — o ponto <b>escapou</b>, não precisa iterar mais.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    var inSeq = orbit(-0.5, 6);
    var outSeq = orbit(1, 5);
    steps.push({
      title: "Dois pontos, dois destinos",
      body:
        "<p>Acompanhe a órbita (aqui com <code>cᵢ = 0</code>, só parte real):</p>" +
        "<ul>" +
        "<li><b>c = −0,5</b> (dentro): <code>" +
        inSeq.map(function (z) { return (Math.round(z * 1000) / 1000); }).join(" → ") +
        "</code> … fica <span class='ok'>preso</span> perto de −0,37. Nunca passa de 2.</li>" +
        "<li><b>c = 1</b> (fora): <code>" +
        outSeq.map(function (z) { return Math.round(z); }).join(" → ") +
        "</code> … <span class='no'>dispara</span>. Já em |z| = 5 &gt; 2 sabemos que escapou.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["n", "z (c = −0,5)", "z (c = 1)"],
            rows: [0, 1, 2, 3, 4].map(function (n) {
              return [
                n,
                inSeq[n] == null ? "" : String(Math.round(inSeq[n] * 1000) / 1000),
                outSeq[n] == null ? "" : String(Math.round(outSeq[n])),
              ];
            }),
          });
        },
      },
    });

    steps.push({
      title: "Colorir pelo tempo de escape",
      body:
        "<p>Os pontos de <b>dentro</b> ficam pretos (nunca escapam em N iterações). Os de fora ganham " +
        "cor pelo <b>número de iterações até escapar</b>: poucos passos = uma cor, muitos passos = " +
        "outra.</p>" +
        "<p>São essas “curvas de nível” do tempo de escape que formam as <b>bandas coloridas</b> ao " +
        "redor do conjunto — e revelam a borda fractal.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "Zoom e auto-similaridade",
      body:
        "<p>Aproximando a borda, reaparecem cópias do conjunto inteiro e detalhes que nunca terminam — " +
        "a <b>auto-similaridade</b>. Como a figura é só a regra iterada, dá para ampliar " +
        "indefinidamente: é só reavaliar a equação na nova janela.</p>" +
        "<p>(Aqui aproximamos a região do “vale” à esquerda do bulbo principal.)</p>",
      visual: {
        type: "plane",
        bounds: [-0.9, -0.1, -0.4, 0.4],
        draw: function (plane) { render(plane, 80); },
      },
    });

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Limite de iterações</b>: pontos que escapam <em>devagar</em> parecem “dentro” se N for " +
        "baixo. Mais iterações = borda mais fiel (e mais custo).</li>" +
        "<li><b>Critério |z| &gt; 2</b>: parar antes (ex.: &gt; 1) classificaria errado.</li>" +
        "<li><b>Custo</b>: é uma iteração por pixel × N — fractais são naturalmente paralelos (cada " +
        "pixel é independente).</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "A grande ideia",
            html: "A forma não é armazenada — é <b>gerada</b> por <code>z ← z² + c</code> mais o teste " +
              "de escape, ponto a ponto.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g14-mandelbrot",
    num: "✺",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Mandelbrot / fractais",
    type: "conceitual",
    tags: ["fractais", "mandelbrot", "iteração"],
    hubDesc: "z ← z² + c, critério |z|>2, coloração por tempo de escape e auto-similaridade.",
    statement:
      "Entenda a geração do conjunto de Mandelbrot: o processo iterativo z ← z² + c, o critério de " +
      "escape |z| > 2 e a coloração por tempo de escape que desenha o fractal.",
    parts: [{ label: "Guia", build: build }],
  });
})();
