// ============================================
// POLDER SECURITY — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile nav toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('active'))
    );
  }

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));


  // --- Typing effect ---
  const typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    const text = typedEl.getAttribute('data-text');
    typedEl.textContent = '';
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        typedEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 40 + Math.random() * 40);
      }
    }
    setTimeout(typeChar, 800);
  }


  // =============================================
  // Icon Network — connected icon nodes
  // Each node is an SVG icon representing a PS
  // goal, drifting and connected by glowing lines
  // =============================================

  const particleCanvas = document.getElementById('particle-canvas');
  if (!particleCanvas) return;

  const ctx = particleCanvas.getContext('2d');
  let W, H;

  function resize() {
    W = particleCanvas.width = particleCanvas.parentElement.offsetWidth;
    H = particleCanvas.height = particleCanvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Pre-render SVG icons to off-screen canvases ---
  // Each icon is a 24x24 viewBox SVG, rendered at a fixed pixel size
  // We create cyan, magenta, and green variants

  const ICON_SIZE = 22; // px each icon renders at

  const ICON_SVG_STRINGS = [
    // Shield
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    // Terminal
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    // Globe
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    // Graduation cap
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 0 2.5 3 6 3s6-3 6-3v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>',
    // Network nodes
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg>',
    // Wrench
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    // Lock
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    // Users
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    // Book
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    // Key
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    // CPU
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    // Flag
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    // Zap
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    // Search
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  ];

  // Color palette: mostly cyan, some magenta & green
  const COLORS = [
    { stroke: '#00f0ff', glow: 'rgba(0,240,255,0.4)',  line: 'rgba(0,240,255,ALPHA)' },   // cyan
    { stroke: '#00f0ff', glow: 'rgba(0,240,255,0.4)',  line: 'rgba(0,240,255,ALPHA)' },   // cyan
    { stroke: '#00f0ff', glow: 'rgba(0,240,255,0.4)',  line: 'rgba(0,240,255,ALPHA)' },   // cyan
    { stroke: '#ff00aa', glow: 'rgba(255,0,170,0.35)', line: 'rgba(255,0,170,ALPHA)' },   // magenta
    { stroke: '#00ff88', glow: 'rgba(0,255,136,0.35)', line: 'rgba(0,255,136,ALPHA)' },   // green
  ];

  // Pre-render each icon × color combo as an Image for fast drawImage()
  const iconImages = []; // [{img, colorIdx, ready}]

  function buildIconImage(svgStr, color, size) {
    const svg = svgStr.replace(/COLOR/g, color.stroke);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    return new Promise(resolve => {
      img.onload = () => {
        // Draw onto an offscreen canvas at target size with glow
        const oc = document.createElement('canvas');
        oc.width = size + 12;   // extra space for glow
        oc.height = size + 12;
        const octx = oc.getContext('2d');
        octx.shadowColor = color.glow;
        octx.shadowBlur = 6;
        octx.drawImage(img, 6, 6, size, size);
        URL.revokeObjectURL(url);
        resolve(oc);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    });
  }

  // Build all icon images, then start the animation
  const buildPromises = [];
  ICON_SVG_STRINGS.forEach((svg, si) => {
    COLORS.forEach((color, ci) => {
      buildPromises.push(
        buildIconImage(svg, color, ICON_SIZE).then(canvas => {
          if (canvas) iconImages.push({ canvas, colorIdx: ci, svgIdx: si });
        })
      );
    });
  });

  Promise.all(buildPromises).then(() => {
    if (iconImages.length === 0) return;
    initNetwork();
  });

  function initNetwork() {
    const NODE_COUNT = 60;
    const CONNECTION_DIST = 180;
    const nodes = [];

    class Node {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        // Pick a random pre-rendered icon
        const entry = iconImages[Math.floor(Math.random() * iconImages.length)];
        this.icon = entry.canvas;
        this.colorIdx = entry.colorIdx;
        this.size = ICON_SIZE + 12; // includes glow padding
        // Slow rotation
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.003;
        // Subtle pulse
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.opacity = 0.25 + Math.random() * 0.3; // 0.25–0.55
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20 || this.x > W + 20) this.vx *= -1;
        if (this.y < -20 || this.y > H + 20) this.vy *= -1;
        this.angle += this.rotSpeed;
        this.pulsePhase += 0.015;
      }
    }

    for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // --- Draw connection lines ---
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.2;
            const color = COLORS[nodes[i].colorIdx];
            ctx.strokeStyle = color.line.replace('ALPHA', alpha.toFixed(3));
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // --- Draw icon nodes ---
      nodes.forEach(n => {
        n.update();
        const pulse = 1 + Math.sin(n.pulsePhase) * 0.1;
        const alpha = n.opacity * pulse;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(n.x, n.y);
        ctx.rotate(n.angle);
        ctx.drawImage(n.icon, -n.size / 2, -n.size / 2, n.size * pulse, n.size * pulse);
        ctx.restore();
      });

      requestAnimationFrame(draw);
    }

    draw();
  }
});
