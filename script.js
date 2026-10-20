/* Welcome Back Massage Therapy — interactions */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");
  const bookBar = document.querySelector(".book-bar");
  const hero = document.querySelector(".hero");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    if (bookBar && hero) bookBar.classList.toggle("is-shown", y > hero.offsetHeight * 0.7);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.hidden = true;
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    if (open) return closeMenu();
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.hidden = false;
    nav.classList.add("is-scrolled");
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    // stagger siblings slightly
    const groups = new Map();
    reveals.forEach((el) => {
      const p = el.parentElement;
      const i = groups.get(p) || 0;
      el.style.setProperty("--d", `${Math.min(i * 0.09, 0.45)}s`);
      groups.set(p, i + 1);
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Looping videos: play only while on screen ---------- */
  const videos = document.querySelectorAll(".loop-video");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const vio = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          v.muted = true;
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          v.pause();
        }
      }),
      { threshold: 0.25 }
    );
    videos.forEach((v) => vio.observe(v));
  }

  /* ---------- Starfield (echoes the studio's star projector) ---------- */
  const canvas = document.querySelector(".hero__stars");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let stars = [], w, h, dpr, running = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 9000);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.012 + 0.004,
        hue: Math.random() < 0.18 ? "160,200,255" : Math.random() < 0.3 ? "170,230,190" : "240,225,210",
        vx: (Math.random() - 0.5) * 0.04,
      }));
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.p += s.s; s.x += s.vx;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        const a = 0.25 + Math.sin(s.p) * 0.35 + 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.hue},${Math.max(a, 0)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) draw();
    }).observe(canvas);
    draw();
  }

  /* ---------- Breathing guide ---------- */
  const breathe = document.querySelector(".breathe");
  const orb = document.querySelector(".breathe__orb");
  const word = document.querySelector(".breathe__word");
  let timer = null, phase = "out";
  const step = () => {
    phase = phase === "in" ? "out" : "in";
    breathe.classList.toggle("is-in", phase === "in");
    breathe.classList.toggle("is-out", phase === "out");
    word.textContent = phase === "in" ? "breathe in" : "breathe out";
    timer = setTimeout(step, phase === "in" ? 4000 : 6000);
  };
  const start = () => { if (!timer) step(); };
  const stop = () => {
    clearTimeout(timer); timer = null; phase = "out";
    breathe.classList.remove("is-in", "is-out");
    word.textContent = "tap to begin";
  };
  orb.addEventListener("click", () => (timer ? stop() : start()));
  // auto-start gently when the section comes into view
  if ("IntersectionObserver" in window && !reduceMotion) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0.6 }).observe(orb);
  }

  /* ---------- Loyalty hearts fill in ---------- */
  const hearts = document.querySelectorAll(".hearts span");
  if (hearts.length && "IntersectionObserver" in window) {
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      hearts.forEach((h, i) => setTimeout(() => h.classList.add("is-on"), reduceMotion ? 0 : 180 * i));
      obs.disconnect();
    }, { threshold: 0.5 }).observe(document.querySelector(".hearts"));
  }

  /* ---------- Hours: today + open now (Reno time) ---------- */
  const hours = { 1: [12, 18], 2: [11, 18], 3: [11, 18], 5: [12, 18], 6: [12, 18] };
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const now = (parseInt(get("hour"), 10) % 24) + parseInt(get("minute"), 10) / 60;
    document.querySelector(`.hours tr[data-day="${day}"]`)?.classList.add("is-today");
    const status = document.querySelector("[data-status]");
    const today = hours[day];
    if (today && now >= today[0] && now < today[1]) {
      status.textContent = "Open now";
      status.classList.add("is-open");
    } else if (today && now < today[0]) {
      status.textContent = `Opens today at ${today[0] > 12 ? today[0] - 12 : today[0]}${today[0] >= 12 ? " PM" : " AM"}`;
    } else {
      status.textContent = "Closed now · book online anytime";
    }
  } catch (_) { /* leave default */ }

  /* ---------- Footer year ---------- */
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
