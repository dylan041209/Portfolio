(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("has-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const gsap = window.gsap;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-menu");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  let lenis;

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // The shared script also runs on project pages, which have no menu.
  if (toggle && menu) {
    const menuLinks = [...menu.querySelectorAll("a")];
    function setMenu(open, restoreFocus = false) {
      toggle.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
      menu.inert = !open;
      if (main) main.inert = open;
      if (footer) footer.inert = open;
      root.classList.toggle("menu-open", open);
      if (open) {
        lenis?.stop();
        menuLinks[0]?.focus({ preventScroll: true });
      } else {
        lenis?.start();
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    }
    setMenu(false);
    toggle.addEventListener("click", () =>
      setMenu(!menu.classList.contains("open"), true),
    );
    menuLinks.forEach((link) =>
      link.addEventListener("click", () => setMenu(false, true)),
    );
    document.addEventListener("pointerdown", (event) => {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        setMenu(false, true);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (!menu.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false, true);
      }
      if (event.key === "Tab") {
        const first = toggle;
        const last = menuLinks.at(-1) || toggle;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener("pageshow", () => setMenu(false));
  }

  // Wheel smoothing is only enabled for mouse/trackpad users. Touch stays native.
  function updateScrolling() {
    lenis?.destroy();
    lenis = undefined;
    if (!reduceMotion.matches && finePointer.matches && window.Lenis) {
      lenis = new window.Lenis({
        autoRaf: true,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
      });
      if (root.classList.contains("menu-open") || document.hidden) lenis.stop();
    }
  }
  updateScrolling();
  finePointer.addEventListener("change", updateScrolling);
  reduceMotion.addEventListener("change", updateScrolling);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) lenis?.stop();
    else if (!root.classList.contains("menu-open")) lenis?.start();
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (
      !lenis ||
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search ||
      !url.hash
    )
      return;
    let target;
    try {
      target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    } catch {
      return;
    }
    if (!target) return;
    event.preventDefault();
    const offset =
      -(document.querySelector(".site-header")?.offsetHeight || 80) - 16;
    lenis.scrollTo(target, {
      offset,
      onComplete: () => {
        if (location.hash !== url.hash) history.pushState(null, "", url.hash);
        if (!target.hasAttribute("tabindex"))
          target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      },
    });
  });

  // Coalesce native scroll updates to one paint; only transform the thin progress line.
  const progress = document.querySelector(".reading-progress");
  let frame = 0;
  const progressTo =
    gsap && progress
      ? gsap.quickTo(progress, "scaleX", { duration: 0.15, ease: "power1.out" })
      : null;
  function paintProgress() {
    frame = 0;
    if (!progress) return;
    const range = root.scrollHeight - window.innerHeight;
    const value =
      range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    if (progressTo && !reduceMotion.matches) progressTo(value);
    else progress.style.transform = `scaleX(${value})`;
  }
  function scheduleProgress() {
    if (!frame) frame = requestAnimationFrame(paintProgress);
  }
  window.addEventListener("scroll", scheduleProgress, { passive: true });
  window.addEventListener("resize", scheduleProgress, { passive: true });
  window.addEventListener("pageshow", scheduleProgress);
  window.addEventListener("load", scheduleProgress);
  if (window.ResizeObserver)
    new ResizeObserver(scheduleProgress).observe(document.body);
  reduceMotion.addEventListener("change", () => {
    if (progressTo) progressTo.tween.pause();
    scheduleProgress();
  });
  paintProgress();

  // React Bits SpotlightCard concept adapted to this site's native DOM.
  // Source and licence: vendor/REACT-BITS-LICENSE.txt and THIRD_PARTY.md.
  document.querySelectorAll(".project-card").forEach((card) => {
    let pointerFrame = 0;
    let x = 0;
    let y = 0;
    card.classList.add("spotlight-card");
    card.addEventListener(
      "pointermove",
      (event) => {
        if (
          reduceMotion.matches ||
          !finePointer.matches ||
          event.pointerType !== "mouse"
        )
          return;
        x = event.clientX;
        y = event.clientY;
        if (pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
          const bounds = card.getBoundingClientRect();
          card.style.setProperty("--spotlight-x", `${x - bounds.left}px`);
          card.style.setProperty("--spotlight-y", `${y - bounds.top}px`);
          card.classList.add("spotlight-active");
          pointerFrame = 0;
        });
      },
      { passive: true },
    );
    function clearSpotlight() {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      card.classList.remove("spotlight-active");
    }
    card.addEventListener("pointerleave", clearSpotlight);
    card.addEventListener("pointercancel", clearSpotlight);
    reduceMotion.addEventListener("change", clearSpotlight);
  });

  if (gsap) {
    // matchMedia reverts active animations immediately when reduced motion changes.
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      const heroItems = [
        ...document.querySelectorAll(
          ".hero > :not(.hero-logo):not(.hero-footer), .project-hero > *",
        ),
      ];
      const entrance = gsap.from(heroItems, {
        y: 14,
        opacity: 0,
        duration: 0.45,
        stagger: 0.055,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
      // Stop entrance animation on navigation without replaying it on history restore.
      const stopEntrance = () => entrance.progress(1);
      window.addEventListener("pagehide", stopEntrance);
      return () => window.removeEventListener("pagehide", stopEntrance);
    });
  }

  let leaving = false;
  let navigationTimer;
  function restorePage() {
    leaving = false;
    clearTimeout(navigationTimer);
    if (gsap && main) {
      gsap.killTweensOf(main);
      gsap.set(main, { clearProps: "opacity,transform" });
    }
  }
  window.addEventListener("pageshow", restorePage);
  reduceMotion.addEventListener("change", restorePage);
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (
      !gsap ||
      !main ||
      reduceMotion.matches ||
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      !url.pathname.endsWith(".html") ||
      url.pathname === location.pathname
    )
      return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    // A bounded fade, with a navigation fallback if the animation is interrupted.
    let navigated = false;
    const navigate = () => {
      if (navigated) return;
      navigated = true;
      clearTimeout(navigationTimer);
      location.assign(url.href);
    };
    navigationTimer = setTimeout(navigate, 240);
    gsap.to(main, {
      opacity: 0.4,
      y: -6,
      duration: 0.14,
      ease: "power1.in",
      onComplete: navigate,
    });
  });
})();
