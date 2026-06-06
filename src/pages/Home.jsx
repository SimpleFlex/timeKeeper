import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const trailRef = useRef(null);

  useEffect(() => {
    // Starfield
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        speed: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.15,
      });
    }

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.a += s.speed * 0.01;
        s.x += s.drift;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        const opacity = (Math.sin(s.a) * 0.5 + 0.5) * 0.8 + 0.1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(drawStars);
    };
    drawStars();

    // Cursor
    const handleMouse = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX - 6 + "px";
        cursorRef.current.style.top = e.clientY - 6 + "px";
      }
      if (trailRef.current) {
        trailRef.current.style.left = e.clientX + "px";
        trailRef.current.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", handleMouse);

    // Scroll reveal
    const reveals = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    reveals.forEach((el) => obs.observe(el));

    // Week days bar animation
    setTimeout(() => {
      document.querySelectorAll(".day-bar-fill").forEach((bar) => {
        bar.style.transition = "width 1.2s cubic-bezier(.22,.68,0,1.2)";
        bar.style.width = bar.dataset.width;
      });
    }, 800);

    // Counter
    const countEl = document.getElementById("userCount");
    if (countEl) {
      let start = 0;
      const target = 2847;
      const step = target / (1800 / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          countEl.textContent = target.toLocaleString();
          clearInterval(timer);
          return;
        }
        countEl.textContent = Math.floor(start).toLocaleString();
      }, 16);
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animId);
    };
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const progresses = [100, 85, 60, 40, 0, 0, 0];

  return (
    <>
      <style>{`
        .home-page *{box-sizing:border-box}
        .home-cursor{position:fixed;width:12px;height:12px;background:#d4f244;border-radius:50%;pointer-events:none;z-index:9999;transition:transform 0.15s,opacity 0.2s;mix-blend-mode:difference}
        .home-trail{position:fixed;width:36px;height:36px;border:1px solid #d4f244;border-radius:50%;pointer-events:none;z-index:9998;transition:left 0.12s,top 0.12s;opacity:0.4;transform:translate(-50%,-50%)}
        .home-page{min-height:100vh;background:#04040c;color:#eeeef5;font-family:'Cabinet Grotesk',sans-serif;overflow-x:hidden;cursor:none;position:relative}
        .home-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}
        .home-noise{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");background-size:200px}
        .home-orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
        .home-orb1{width:600px;height:600px;background:radial-gradient(circle,#d4f24418 0%,transparent 70%);top:-200px;right:-100px;animation:orbDrift 12s ease-in-out infinite alternate}
        .home-orb2{width:500px;height:500px;background:radial-gradient(circle,#00f0d412 0%,transparent 70%);bottom:-150px;left:-100px;animation:orbDrift 15s ease-in-out infinite alternate-reverse}
        .home-orb3{width:300px;height:300px;background:radial-gradient(circle,#f5c84210 0%,transparent 70%);top:40%;left:40%;animation:orbDrift 9s ease-in-out infinite alternate}
        .home-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(#ffffff0e 1px,transparent 1px),linear-gradient(90deg,#ffffff0e 1px,transparent 1px);background-size:80px 80px;opacity:0.6;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)}
        .home-inner{position:relative;z-index:2}

        /* NAV */
        .hnav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 3rem;height:72px;background:linear-gradient(180deg,#04040cee 0%,transparent 100%);backdrop-filter:blur(10px)}
        .hnav-brand{display:flex;align-items:center;gap:0.7rem;text-decoration:none}
        .hnav-icon{width:36px;height:36px;border-radius:10px;background:#d4f244;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#04040c;font-weight:900;box-shadow:0 0 20px #d4f24460;animation:iconPulse 3s ease-in-out infinite}
        .hnav-word{font-family:'Clash Display',sans-serif;font-weight:700;font-size:1.1rem;color:#eeeef5;letter-spacing:0.02em}
        .hnav-links{display:flex;align-items:center;gap:0.3rem}
        .hnav-link{padding:0.4rem 1rem;border-radius:8px;color:#6060a0;font-size:0.88rem;font-weight:500;text-decoration:none;transition:color 0.2s;background:none;border:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif}
        .hnav-link:hover{color:#eeeef5}
        .hnav-cta{background:#d4f244;color:#04040c;border:none;border-radius:10px;padding:0.55rem 1.4rem;font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Clash Display',sans-serif;letter-spacing:0.02em;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 24px #d4f24440;text-decoration:none;display:inline-block}
        .hnav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 40px #d4f24460}

        /* HERO */
        .hhero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 4rem;position:relative}
        .hhero-badge{display:inline-flex;align-items:center;gap:0.6rem;background:#13132a;border:1px solid #ffffff0e;border-radius:99px;padding:0.4rem 1.1rem;font-size:0.78rem;color:#6060a0;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2rem;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) both}
        .hhero-dot{width:7px;height:7px;border-radius:50%;background:#d4f244;box-shadow:0 0 10px #d4f244;animation:blink 2s ease-in-out infinite;display:inline-block}
        .hhero-title{font-family:'Clash Display',sans-serif;font-size:clamp(3rem,8vw,7rem);font-weight:700;line-height:1;letter-spacing:-0.02em;margin-bottom:1.5rem;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.1s both}
        .hhero-line1{display:block;color:#eeeef5}
        .hhero-line2{display:block;background:linear-gradient(90deg,#d4f244 0%,#00f0d4 50%,#f5c842 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 4s ease-in-out infinite alternate;background-size:200%}
        .hhero-sub{font-size:clamp(1rem,2vw,1.2rem);color:#6060a0;max-width:540px;line-height:1.7;margin-bottom:3rem;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.2s both}
        .hhero-sub strong{color:#eeeef5;font-weight:600}
        .hhero-actions{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:center;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.3s both;margin-bottom:4rem}
        .hbtn-primary{background:#d4f244;color:#04040c;border:none;border-radius:14px;padding:1rem 2.4rem;font-size:1rem;font-weight:800;cursor:pointer;font-family:'Clash Display',sans-serif;letter-spacing:0.02em;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 8px 40px #d4f24450;display:inline-flex;align-items:center;gap:0.6rem;text-decoration:none}
        .hbtn-primary:hover{transform:translateY(-3px);box-shadow:0 16px 60px #d4f24470}
        .hbtn-secondary{background:transparent;color:#eeeef5;border:1px solid #ffffff0e;border-radius:14px;padding:1rem 2rem;font-size:0.95rem;font-weight:600;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all 0.2s;backdrop-filter:blur(10px);text-decoration:none;display:inline-block}
        .hbtn-secondary:hover{border-color:#6060a0;background:#0e0e20}
        .hticker-row{display:flex;gap:0.8rem;flex-wrap:wrap;justify-content:center;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.4s both;margin-bottom:5rem}
        .hticker-pill{background:#0e0e20;border:1px solid #ffffff0e;border-radius:99px;padding:0.35rem 1rem;font-size:0.78rem;color:#6060a0;display:flex;align-items:center;gap:0.5rem}
        .hstats{display:flex;gap:3rem;align-items:center;justify-content:center;flex-wrap:wrap;animation:hfadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.5s both}
        .hstat-num{font-family:'Clash Display',sans-serif;font-size:2rem;font-weight:700;color:#d4f244;text-align:center}
        .hstat-label{font-size:0.8rem;color:#6060a0;text-align:center;margin-top:0.2rem}
        .hstat-div{width:1px;height:40px;background:#ffffff0e}
        .hscroll{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:#6060a0;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;animation:hfadeIn 1s ease 1.2s both}
        .hscroll-mouse{width:24px;height:38px;border:1.5px solid #ffffff0e;border-radius:12px;display:flex;align-items:flex-start;justify-content:center;padding-top:6px}
        .hscroll-wheel{width:3px;height:7px;background:#d4f244;border-radius:99px;animation:scrollWheel 2s ease-in-out infinite}
        .hfloater{position:absolute;pointer-events:none;animation:hfloat 8s ease-in-out infinite}

        /* FEATURES */
        .hsection{padding:6rem 2rem;max-width:1100px;margin:0 auto;position:relative}
        .hsec-label{text-align:center;font-size:0.78rem;color:#d4f244;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;margin-bottom:1rem}
        .hsec-title{font-family:'Clash Display',sans-serif;font-size:clamp(2rem,4vw,3.4rem);font-weight:700;text-align:center;color:#eeeef5;line-height:1.15;margin-bottom:1.2rem;letter-spacing:-0.02em}
        .hsec-sub{text-align:center;color:#6060a0;font-size:1rem;max-width:500px;margin:0 auto 4rem;line-height:1.7}
        .hfeatures{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
        .hfcard{background:#13132a;border:1px solid #ffffff0e;border-radius:20px;padding:2rem;transition:transform 0.3s,border-color 0.3s,box-shadow 0.3s;position:relative;overflow:hidden}
        .hfcard:hover{transform:translateY(-6px);border-color:#d4f24430;box-shadow:0 20px 60px #00000060}
        .hficon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:1.2rem}
        .hfcard-title{font-family:'Clash Display',sans-serif;font-size:1.05rem;font-weight:700;color:#eeeef5;margin-bottom:0.6rem}
        .hfcard-desc{font-size:0.88rem;color:#6060a0;line-height:1.7}
        .hftag{display:inline-block;margin-top:1rem;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.25rem 0.7rem;border-radius:99px}

        /* WEEK */
        .hweek{max-width:1100px;margin:0 auto;padding:0 2rem 6rem;text-align:center}
        .hweek-title{font-family:'Clash Display',sans-serif;font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;color:#eeeef5;margin-bottom:0.8rem}
        .hweek-sub{color:#6060a0;font-size:0.95rem;margin-bottom:3rem;line-height:1.7}
        .hdays{display:flex;gap:0.8rem;overflow-x:auto;padding-bottom:1rem}
        .hday{flex:1;min-width:110px;background:#13132a;border:1px solid #ffffff0e;border-radius:16px;padding:1.2rem 1rem;text-align:center;transition:all 0.3s}
        .hday.today{border-color:#d4f24450;background:#d4f2440a}
        .hday.done{border-color:#00f0d430}
        .hday-name{font-size:0.72rem;color:#6060a0;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;margin-bottom:0.5rem}
        .hday-num{font-family:'Clash Display',sans-serif;font-size:1.6rem;font-weight:700;color:#eeeef5;margin-bottom:0.5rem}
        .hday.today .hday-num{color:#d4f244}
        .hday-track{height:4px;background:#0e0e20;border-radius:99px;overflow:hidden;margin-bottom:0.5rem}
        .hday-fill{height:100%;border-radius:99px;width:0%;transition:width 1.2s cubic-bezier(.22,.68,0,1.2)}
        .hday-lbl{font-size:0.7rem;color:#6060a0}

        /* CTA */
        .hcta{max-width:800px;margin:0 auto;padding:0 2rem 8rem;text-align:center}
        .hcta-box{background:#13132a;border:1px solid #ffffff0e;border-radius:28px;padding:4rem 3rem;position:relative;overflow:hidden}
        .hcta-box::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,#d4f24410 0%,transparent 70%);pointer-events:none}
        .hcta-title{font-family:'Clash Display',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#eeeef5;margin-bottom:1rem;letter-spacing:-0.02em}
        .hcta-title span{color:#d4f244}
        .hcta-sub{color:#6060a0;font-size:1rem;margin-bottom:2.5rem;line-height:1.7}
        .hcta-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

        /* FOOTER */
        .hfooter{border-top:1px solid #ffffff0e;padding:2rem 3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
        .hfooter-brand{font-family:'Clash Display',sans-serif;font-size:0.95rem;font-weight:700;color:#6060a0}
        .hfooter-copy{font-size:0.8rem;color:#6060a0}

        /* reveal */
        .reveal{opacity:0;transform:translateY(40px);transition:opacity 0.8s cubic-bezier(.22,.68,0,1.2),transform 0.8s cubic-bezier(.22,.68,0,1.2)}
        .reveal.visible{opacity:1;transform:translateY(0)}

        @keyframes orbDrift{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,30px) scale(1.15)}}
        @keyframes iconPulse{0%,100%{box-shadow:0 0 20px #d4f24460}50%{box-shadow:0 0 40px #d4f244aa,0 0 80px #d4f24430}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes gradShift{from{background-position:0%}to{background-position:100%}}
        @keyframes hfadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hfadeIn{from{opacity:0}to{opacity:1}}
        @keyframes hfloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(3deg)}}
        @keyframes scrollWheel{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(8px);opacity:0.3}}
        @media(max-width:768px){.hnav{padding:0 1.5rem}.hnav-links{display:none}.hfeatures{grid-template-columns:1fr}.hstat-div{display:none}}
      `}</style>

      <div ref={cursorRef} className="home-cursor" />
      <div ref={trailRef} className="home-trail" />
      <canvas ref={canvasRef} className="home-canvas" />
      <div className="home-noise" />
      <div className="home-orb home-orb1" />
      <div className="home-orb home-orb2" />
      <div className="home-orb home-orb3" />
      <div className="home-grid" />

      <div className="home-page home-inner">
        {/* NAV */}
        <nav className="hnav">
          <Link to="/" className="hnav-brand">
            <div className="hnav-icon">⏱</div>
            <span className="hnav-word">TimeKeeper</span>
          </Link>
          <div className="hnav-links">
            <button
              className="hnav-link"
              onClick={() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Features
            </button>
            <button
              className="hnav-link"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              How it works
            </button>
            <button
              className="hnav-link"
              onClick={() => {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About
            </button>
          </div>{" "}
          <Link to="/register" className="hnav-cta">
            Get started free →
          </Link>
        </nav>

        {/* HERO */}
        <section className="hhero">
          <div
            className="hfloater"
            style={{ top: "15%", left: "5%", animationDelay: "0s" }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <rect
                x="5"
                y="5"
                width="50"
                height="50"
                rx="12"
                fill="none"
                stroke="#d4f24430"
                strokeWidth="1.5"
              />
              <rect
                x="15"
                y="15"
                width="30"
                height="30"
                rx="6"
                fill="none"
                stroke="#d4f24420"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div
            className="hfloater"
            style={{
              top: "20%",
              right: "7%",
              animationDelay: "2s",
              animationDuration: "10s",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#00f0d430"
                strokeWidth="1.5"
              />
              <circle cx="22" cy="22" r="8" fill="#00f0d415" />
            </svg>
          </div>
          <div
            className="hfloater"
            style={{
              bottom: "25%",
              left: "8%",
              animationDelay: "1s",
              animationDuration: "12s",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30">
              <polygon
                points="15,2 28,28 2,28"
                fill="none"
                stroke="#f5c84230"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="hhero-badge">
            <span className="hhero-dot" />
            Now in beta · Free for everyone
          </div>

          <h1 className="hhero-title">
            <span className="hhero-line1">Own your week.</span>
            <span className="hhero-line2">Ship every Sunday.</span>
          </h1>

          <p className="hhero-sub">
            The <strong>productivity OS</strong> for people overwhelmed by
            goals, taxes, and too much to do. Set one weekly goal. Break it
            down. Track your time. <strong>Achieve it.</strong>
          </p>

          <div className="hhero-actions">
            <Link to="/register" className="hbtn-primary">
              Start this week free <span>→</span>
            </Link>
            <Link to="/login" className="hbtn-secondary">
              Already have an account
            </Link>
          </div>

          <div className="hticker-row">
            {[
              "🎯 Weekly goals",
              "⏱ Time tracking",
              "🔥 Streak system",
              "📊 Progress dashboard",
              "💬 Motivation nudges",
              "🚀 Built on Supabase",
            ].map((t) => (
              <div key={t} className="hticker-pill">
                {t}
              </div>
            ))}
          </div>

          <div className="hstats">
            <div>
              <div className="hstat-num" id="userCount">
                0
              </div>
              <div className="hstat-label">Goals set this week</div>
            </div>
            <div className="hstat-div" />
            <div>
              <div className="hstat-num">7</div>
              <div className="hstat-label">Days to achieve it</div>
            </div>
            <div className="hstat-div" />
            <div>
              <div className="hstat-num">∞</div>
              <div className="hstat-label">Potential unlocked</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="hsection" id="features">
          <p className="hsec-label reveal">Why TimeKeeper</p>
          <h2 className="hsec-title reveal">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="hsec-sub reveal">
            Built for the overwhelmed. Designed for the ambitious. Engineered
            for results.
          </p>
          <div className="hfeatures reveal">
            {[
              {
                icon: "🎯",
                title: "Weekly Goal Engine",
                desc: "Set one powerful goal per week. Break it into bite-size tasks. Watch the progress bar fill up as you conquer each one.",
                tag: "Core feature",
                tagBg: "#d4f24415",
                tagColor: "#d4f244",
                iconBg: "#d4f24415",
              },
              {
                icon: "⏱",
                title: "Precision Time Tracker",
                desc: "Start a session with one tap. Pause, resume, stop. Every minute tracked against your task. Know exactly where your hours go.",
                tag: "Time-aware",
                tagBg: "#00f0d415",
                tagColor: "#00f0d4",
                iconBg: "#00f0d415",
              },
              {
                icon: "🔥",
                title: "Motivation System",
                desc: "Mid-week nudges keep you on track. Falling behind? The system fires an alert. Finished early? It celebrates with you.",
                tag: "AI-powered",
                tagBg: "#f5c84215",
                tagColor: "#f5c842",
                iconBg: "#f5c84215",
              },
              {
                icon: "📊",
                title: "Progress Dashboard",
                desc: "A mission-control view of your week. See completion %, time invested, tasks done — all in one glanceable space.",
                tag: "Visual",
                tagBg: "#ff4f7b15",
                tagColor: "#ff4f7b",
                iconBg: "#ff4f7b15",
              },
              {
                icon: "🔐",
                title: "Private & Secure",
                desc: "Row-level security on every table. Your data is yours. Nobody else can see your goals, tasks, or time logs. Ever.",
                tag: "Supabase RLS",
                tagBg: "#a78bfa15",
                tagColor: "#a78bfa",
                iconBg: "#a78bfa15",
              },
              {
                icon: "🏆",
                title: "Weekly Win Celebration",
                desc: "Complete your goal and the app celebrates you. Because every finished goal deserves a moment. You earned it.",
                tag: "Rewarding",
                tagBg: "#d4f24415",
                tagColor: "#d4f244",
                iconBg: "#d4f24415",
              },
            ].map((f) => (
              <div key={f.title} className="hfcard">
                <div className="hficon" style={{ background: f.iconBg }}>
                  {f.icon}
                </div>
                <div className="hfcard-title">{f.title}</div>
                <div className="hfcard-desc">{f.desc}</div>
                <span
                  className="hftag"
                  style={{ background: f.tagBg, color: f.tagColor }}
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* WEEK VISUAL */}
        <section className="hweek" id="how-it-works">
          <h2 className="hweek-title reveal">Your week, visualized.</h2>
          <p className="hweek-sub reveal">
            Monday to Sunday. One goal. Seven days.
            <br />
            Watch it come to life as you work through each day.
          </p>
          <div className="hdays reveal">
            {days.map((d, i) => {
              const isToday = i === todayIdx;
              const isDone = progresses[i] === 100;
              const date = new Date();
              date.setDate(date.getDate() - todayIdx + i);
              const barColor = isDone
                ? "#00f0d4"
                : isToday
                  ? "#d4f244"
                  : progresses[i] > 0
                    ? "#6060a0"
                    : "#0e0e20";
              return (
                <div
                  key={d}
                  className={`hday${isToday ? " today" : ""}${isDone ? " done" : ""}`}
                >
                  <div className="hday-name">{d}</div>
                  <div className="hday-num">{date.getDate()}</div>
                  <div className="hday-track">
                    <div
                      className="hday-fill"
                      data-width={`${progresses[i]}%`}
                      style={{ background: barColor }}
                    />
                  </div>
                  <div className="hday-lbl">
                    {isDone
                      ? "✓ Done"
                      : isToday
                        ? "● Today"
                        : progresses[i] > 0
                          ? `${progresses[i]}%`
                          : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="hcta" id="about">
          <div className="hcta-box reveal">
            <h2 className="hcta-title">
              This week,
              <br />
              <span>what will you build?</span>
            </h2>
            <p className="hcta-sub">
              Join people who stopped being confused and started shipping.
              <br />
              Set your first goal in under 60 seconds.
            </p>
            <div className="hcta-actions">
              <Link to="/register" className="hbtn-primary">
                Start free today <span>→</span>
              </Link>
              <Link to="/login" className="hbtn-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="hfooter">
          <div className="hfooter-brand">⏱ TimeKeeper</div>
          <div className="hfooter-copy">
            Built with React + Supabase · © 2026
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
