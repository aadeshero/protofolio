/**
 * stars.js
 * Animated starfield using HTML5 Canvas.
 * Renders the hero background and footer background.
 */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  /* ── Star constructor ────────────────────────── */
  function Star(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  Star.prototype.reset = function () {
    var w = this.canvas.width;
    var h = this.canvas.height;
    this.x = rand(0, w);
    this.y = rand(0, h);
    this.radius = rand(0.3, 2);
    this.alpha = rand(0.2, 1);
    this.speed = rand(0.02, 0.08);   // twinkle speed
    this.dir    = Math.random() > 0.5 ? 1 : -1;
    // Parallax drift
    this.vx = rand(-0.08, 0.08);
    this.vy = rand(-0.05, 0.05);
  };

  Star.prototype.update = function () {
    // Twinkle
    this.alpha += this.speed * this.dir;
    if (this.alpha >= 1)    { this.alpha = 1;   this.dir = -1; }
    if (this.alpha <= 0.1)  { this.alpha = 0.1; this.dir =  1; }
    // Drift
    this.x += this.vx;
    this.y += this.vy;
    // Wrap
    var w = this.canvas.width;
    var h = this.canvas.height;
    if (this.x < 0)  this.x = w;
    if (this.x > w)  this.x = 0;
    if (this.y < 0)  this.y = h;
    if (this.y > h)  this.y = 0;
  };

  Star.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.colour || '#ffffff';
    ctx.fill();
    ctx.restore();
  };

  /* ── Shooting star ───────────────────────────── */
  function ShootingStar(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  ShootingStar.prototype.reset = function (initial) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    this.x     = rand(0, w * 0.7);
    this.y     = rand(0, h * 0.4);
    this.len   = rand(60, 160);
    this.speed = rand(8, 18);
    this.angle = rand(20, 45) * (Math.PI / 180);
    this.alpha = initial ? 0 : 1;
    this.alive  = !initial;
    // Delay before first appearance
    this.delay = initial ? rand(2000, 8000) : rand(4000, 14000);
    this.lastTime = performance.now();
  };

  ShootingStar.prototype.update = function (now) {
    var elapsed = now - this.lastTime;
    if (!this.alive) {
      if (elapsed >= this.delay) { this.alive = true; this.lastTime = now; }
      return;
    }
    var t = elapsed / 1000; // seconds
    this.cx = this.x + Math.cos(this.angle) * this.speed * t * 60;
    this.cy = this.y + Math.sin(this.angle) * this.speed * t * 60;
    this.alpha = 1 - (t / 1.2);
    if (this.alpha <= 0) this.reset(false);
  };

  ShootingStar.prototype.draw = function (ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha) * 0.9;
    var grad = ctx.createLinearGradient(
      this.cx, this.cy,
      this.cx - Math.cos(this.angle) * this.len,
      this.cy - Math.sin(this.angle) * this.len
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(
      this.cx - Math.cos(this.angle) * this.len,
      this.cy - Math.sin(this.angle) * this.len
    );
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  };

  /* ── Starfield class ─────────────────────────── */
  function Starfield(canvasId, options) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx  = this.canvas.getContext('2d');
    this.opts = Object.assign({
      count: 180,
      shooting: 3,
      colours: ['#ffffff', '#c9d8ff', '#ffd6f0', '#cce8ff']
    }, options || {});
    this.stars = [];
    this.shooters = [];
    this.rafId = null;
    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.init();
    this.start();
  }

  Starfield.prototype.resize = function () {
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width  = rect.width  || window.innerWidth;
    this.canvas.height = rect.height || window.innerHeight;
    // re-scatter stars on resize
    for (var i = 0; i < this.stars.length; i++) { this.stars[i].reset(); }
  };

  Starfield.prototype.init = function () {
    var colours = this.opts.colours;
    for (var i = 0; i < this.opts.count; i++) {
      var s = new Star(this.canvas);
      s.colour = colours[randInt(0, colours.length - 1)];
      this.stars.push(s);
    }
    for (var j = 0; j < this.opts.shooting; j++) {
      this.shooters.push(new ShootingStar(this.canvas));
    }
  };

  Starfield.prototype.start = function () {
    var self = this;
    function loop(now) {
      self.rafId = requestAnimationFrame(loop);
      var ctx = self.ctx;
      ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      for (var i = 0; i < self.stars.length; i++) {
        self.stars[i].update();
        self.stars[i].draw(ctx);
      }
      for (var j = 0; j < self.shooters.length; j++) {
        self.shooters[j].update(now);
        self.shooters[j].draw(ctx);
      }
    }
    requestAnimationFrame(loop);
  };

  Starfield.prototype.stop = function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this._onResize);
  };

  /* ── Loader canvas (denser, static glow) ────── */
  function LoaderStarfield(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.rafId = null;
    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.init();
    this.start();
  }

  LoaderStarfield.prototype.resize = function () {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  LoaderStarfield.prototype.init = function () {
    for (var i = 0; i < 250; i++) {
      var s = new Star(this.canvas);
      s.colour = ['#ffffff','#c9d8ff','#b0e0ff','#e0c8ff'][randInt(0,3)];
      s.radius = rand(0.3, 1.5);
      this.stars.push(s);
    }
  };

  LoaderStarfield.prototype.start = function () {
    var self = this;
    function loop() {
      self.rafId = requestAnimationFrame(loop);
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      for (var i = 0; i < self.stars.length; i++) {
        self.stars[i].update();
        self.stars[i].draw(self.ctx);
      }
    }
    requestAnimationFrame(loop);
  };

  LoaderStarfield.prototype.stop = function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this._onResize);
  };

  /* ── Export ─────────────────────────────────── */
  window.Starfield = Starfield;
  window.LoaderStarfield = LoaderStarfield;

})();
