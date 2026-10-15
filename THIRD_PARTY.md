# Animation dependencies

This portfolio remains a static HTML/CSS/JavaScript site. No build step or React runtime is required.

- **GSAP 3.13.0**: `vendor/gsap.min.js`, downloaded from https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js. The upstream copyright/licence header is preserved. See `vendor/GSAP-README.md` and https://gsap.com/standard-license for the standard licence. Used for short entrance/exit transitions and the reading-progress indicator. No paid plugins are used.
- **Lenis 1.3.11**: `vendor/lenis.min.js` and `vendor/lenis.css`, downloaded from https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/. MIT licence: `vendor/LENIS-LICENSE.txt`. Used for wheel scrolling on devices with a fine pointer. Touch scrolling remains native.
- **React Bits SpotlightCard**: the spotlight interaction in `script.js` and `styles.css` adapts the pointer-position/radial-gradient concept from https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/SpotlightCard (reviewed 15 October 2026). Copyright (c) 2026 David Haz. Licence: `vendor/REACT-BITS-LICENSE.txt` (MIT + Commons Clause). This adaptation is included as part of this portfolio website; no React dependency or standalone component distribution is included.

The libraries are served locally with pinned versions. If they fail to load, navigation, project links, and content remain available. The site honours `prefers-reduced-motion`, including changes to that setting while a page is open.
