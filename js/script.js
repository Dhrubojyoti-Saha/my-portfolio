(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // Boot sequence
  const bootScreen = document.querySelector(".boot-screen");

  if (bootScreen && !reducedMotion) {
    window.setTimeout(() => {
      bootScreen.classList.add("is-complete");
    }, 1250);
  } else if (bootScreen) {
    bootScreen.classList.add("is-complete");
  }

  // Clock
  const clock = document.getElementById("clock");

  const updateClock = () => {
    const now = new Date();

    if (clock) {
      clock.textContent = now.toLocaleTimeString("en-GB", {
        hour12: false,
      });

      clock.dateTime = now.toISOString();
    }
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  // Decorative system readout; these are simulated values.
  const cpuBar = document.getElementById("cpu-bar");
  const netBar = document.getElementById("net-bar");
  const cpuValue = document.getElementById("cpu-value");
  const netValue = document.getElementById("net-value");

  const updateMonitor = () => {
    const cpu = 18 + Math.floor(Math.random() * 27);
    const net = 30 + Math.floor(Math.random() * 38);

    if (cpuBar) cpuBar.style.width = `${cpu}%`;
    if (netBar) netBar.style.width = `${net}%`;
    if (cpuValue) cpuValue.textContent = `${cpu}%`;
    if (netValue) netValue.textContent = `${net}%`;
  };

  window.setInterval(updateMonitor, 2200);

  // Custom pointer
  if (finePointer) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");

    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        document.body.classList.add("cursor-ready");

        if (dot) {
          dot.style.transform =
            `translate3d(${pointerX}px, ${pointerY}px, 0)`;
        }
      },
      { passive: true }
    );

    const renderCursor = () => {
      ringX += (pointerX - ringX) * 0.17;
      ringY += (pointerY - ringY) * 0.17;

      if (ring) {
        ring.style.transform =
          `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      window.requestAnimationFrame(renderCursor);
    };

    renderCursor();

    document.addEventListener("pointerover", (event) => {
      const target = event.target.closest(
        "a, button, input, [data-tilt]"
      );

      document.body.classList.toggle(
        "cursor-hover",
        Boolean(target)
      );
    });
  }

  // Decorative matrix background
  const canvas = document.getElementById("matrix");
  const context = canvas?.getContext("2d");

  let animationFrame = 0;
  let columns = [];
  let matrixWidth = 0;
  let matrixHeight = 0;

  const resizeMatrix = () => {
    if (!canvas || !context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

    matrixWidth = window.innerWidth;
    matrixHeight = window.innerHeight;

    canvas.width = matrixWidth * ratio;
    canvas.height = matrixHeight * ratio;

    canvas.style.width = `${matrixWidth}px`;
    canvas.style.height = `${matrixHeight}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    columns = Array.from(
      { length: Math.ceil(matrixWidth / 22) },
      () => Math.random() * -40
    );
  };

  const drawMatrix = () => {
    if (
      !context ||
      !canvas ||
      reducedMotion ||
      document.hidden
    ) {
      return;
    }

    context.fillStyle = "rgba(5, 8, 6, 0.11)";
    context.fillRect(0, 0, matrixWidth, matrixHeight);

    context.fillStyle = "rgba(156, 255, 87, 0.5)";
    context.font = "11px monospace";

    columns.forEach((drop, index) => {
      const character = Math.random() > 0.5 ? "0" : "1";

      context.fillText(character, index * 22, drop * 20);

      if (
        drop * 20 > matrixHeight &&
        Math.random() > 0.985
      ) {
        columns[index] = 0;
      }

      columns[index] += 0.34;
    });

    animationFrame = window.requestAnimationFrame(drawMatrix);
  };

  if (canvas && context && !reducedMotion) {
    resizeMatrix();
    drawMatrix();

    window.addEventListener("resize", resizeMatrix, {
      passive: true,
    });

    document.addEventListener("visibilitychange", () => {
      window.cancelAnimationFrame(animationFrame);

      if (!document.hidden) {
        drawMatrix();
      }
    });
  }

  // Scroll progress and active navigation
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(
    ".scroll-progress span"
  );

  const navLinks = [
    ...document.querySelectorAll(".main-nav a"),
  ];

  const sections = [
    ...document.querySelectorAll("main section[id]"),
  ];

  const updateScrollState = () => {
    const scrollRange =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const ratio =
      scrollRange > 0
        ? Math.min(window.scrollY / scrollRange, 1)
        : 0;

    if (progress) {
      progress.style.transform = `scaleX(${ratio})`;
    }

    header?.classList.toggle(
      "scrolled",
      window.scrollY > 20
    );

    const marker =
      window.scrollY + window.innerHeight * 0.36;

    let activeId = "home";

    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${activeId}`
      );
    });
  };

  updateScrollState();

  window.addEventListener("scroll", updateScrollState, {
    passive: true,
  });

  // Reveal elements as they enter the viewport
  const reveals = document.querySelectorAll(".reveal");

  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    reveals.forEach((item) => {
      item.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    reveals.forEach((item) => {
      revealObserver.observe(item);
    });
  }

  // Responsive menu
  const menuButton = document.querySelector(".menu-button");
  const mainNav = document.getElementById("main-nav");

  const setMenu = (open) => {
    header?.classList.toggle("menu-open", open);

    menuButton?.setAttribute(
      "aria-expanded",
      String(open)
    );
  };

  menuButton?.addEventListener("click", () => {
    setMenu(
      menuButton.getAttribute("aria-expanded") !== "true"
    );
  });

  mainNav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenu(false);
    }
  });

  // Subtle card tilt and button motion
  if (finePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) / rect.width - 0.5;

        const y =
          (event.clientY - rect.top) / rect.height - 0.5;

        item.style.transform =
          `perspective(1100px) ` +
          `rotateX(${y * -2.2}deg) ` +
          `rotateY(${x * 2.2}deg) ` +
          "translateY(-2px)";
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
      });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();

        const x =
          event.clientX - rect.left - rect.width / 2;

        const y =
          event.clientY - rect.top - rect.height / 2;

        button.style.transform =
          `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  // Simulated terminal: displays portfolio information only.
  const terminalForm = document.getElementById("terminal-form");
  const terminalInput = document.getElementById(
    "terminal-command"
  );
  const terminalHistory = document.getElementById(
    "terminal-history"
  );
  const terminalScreen = document.getElementById(
    "terminal-output"
  );

  const terminalCommands = {
    help:
      "Available: whoami, skills, projects, cases, " +
      "education, status, contact, date, clear",

    whoami:
      "Dhrubojyoti Saha — cybersecurity analyst candidate " +
      "focused on SOC, network security, ethical testing, " +
      "and applied research.",

    skills:
      "SIEM | log analysis | Wireshark | Nmap | Kali Linux | " +
      "Burp Suite | Metasploit | Python | Bash | SQL",

    projects:
      "01 Security Operations Lab\n" +
      "02 Web Tracker & Malware-URL Audit [planned]",

    cases:
      "CASE_001 Brute-force authentication\n" +
      "CASE_002 Suspicious PowerShell [draft]\n" +
      "CASE_003 Network reconnaissance [draft]",

    education:
      "M.Tech — Software Engineering\n" +
      "B.Tech — Information Technology\n" +
      "Current: cybersecurity internship and controlled lab practice",

    status:
      "Portfolio: ONLINE\n" +
      "Evidence links: PENDING\n" +
      "Target roles: SOC Analyst | Cybersecurity Analyst | " +
      "Junior Security Engineer",

    contact:
      "Email, LinkedIn, GitHub, and résumé links will be " +
      "connected in the final content pass.",

    date: () => new Date().toString(),

    sudo:
      "Permission noted. This portfolio shell intentionally " +
      "runs no privileged or real system commands.",
  };

  const addTerminalLine = (text, type) => {
    if (!terminalHistory) return;

    const line = document.createElement("div");

    line.className = `terminal-line ${type}`;
    line.textContent = text;

    terminalHistory.appendChild(line);

    if (terminalScreen) {
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }
  };

  terminalForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!terminalInput) return;

    const command = terminalInput.value.trim().toLowerCase();

    if (!command) return;

    addTerminalLine(command, "command");
    terminalInput.value = "";

    if (command === "clear") {
      terminalHistory?.replaceChildren();
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        terminalCommands,
        command
      )
    ) {
      const response = terminalCommands[command];

      addTerminalLine(
        typeof response === "function" ? response() : response,
        "output"
      );
    } else {
      addTerminalLine(
        `command not found: ${command}. Type 'help'.`,
        "error"
      );
    }
  });

  // Project details
  const projectDialog = document.getElementById(
    "project-dialog"
  );
  const dialogClose = document.getElementById("dialog-close");

  const dossiers = {
    "soc-lab": {
      code: "DOSSIER_01 // BLUE TEAM",
      label: "SECURITY OPERATIONS LAB",
      title: "From telemetry to a defensible response.",

      thesis:
        "A controlled home-lab workflow for turning endpoint " +
        "and network events into an investigation trail.",

      problem:
        "Raw logs create noise unless collection, normalization, " +
        "correlation, and triage are connected into one " +
        "repeatable process.",

      method:
        "Generate authorized test activity, collect Windows " +
        "and network telemetry, map high-value events to " +
        "detection logic, investigate the alert, and document " +
        "response steps.",

      status:
        "Architecture and portfolio narrative are ready. " +
        "Repository structure, screenshots, detection rules, " +
        "and sanitized reports will be linked after completion.",
    },

    "tracker-audit": {
      code: "DOSSIER_02 // PLANNED",
      label: "WEB PRIVACY & THREAT AUDIT",
      title: "Map the requests that happen behind the page.",

      thesis:
        "A defensive lab for explaining third-party tracking " +
        "and suspicious web destinations through transparent, " +
        "reproducible evidence.",

      problem:
        "Users often cannot see which third parties, cookies, " +
        "redirects, and tracking beacons activate during an " +
        "ordinary page load.",

      method:
        "Use authorized test pages and browser developer tools " +
        "to record requests, classify first- and third-party " +
        "domains, document cookies and redirect chains, compare " +
        "domains with public reputation sources, and propose " +
        "privacy controls.",

      status:
        "Blueprint reserved. The final version will use safe " +
        "test data and sanitized evidence; it will not collect " +
        "visitor data or run invasive tracking on this portfolio.",
    },
  };

  const setText = (id, value) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  };

  document.querySelectorAll("[data-open-project]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        const dossier = dossiers[button.dataset.openProject];

        if (!dossier || !projectDialog) return;

        setText("dialog-code", dossier.code);
        setText("dialog-label", dossier.label);
        setText("dialog-title", dossier.title);
        setText("dialog-thesis", dossier.thesis);
        setText("dialog-problem", dossier.problem);
        setText("dialog-method", dossier.method);
        setText("dialog-status", dossier.status);

        projectDialog.showModal();
        document.body.classList.add("modal-open");
      });
    }
  );

  const closeDialog = () => {
    projectDialog?.close();
    document.body.classList.remove("modal-open");
  };

  dialogClose?.addEventListener("click", closeDialog);

  projectDialog?.addEventListener("click", (event) => {
    if (event.target === projectDialog) {
      closeDialog();
    }
  });

  projectDialog?.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  // Notices for links awaiting final destinations
  const toast = document.querySelector(".toast");
  const toastMessage = document.getElementById("toast-message");

  let toastTimer;

  document.querySelectorAll(".draft-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const label = link.dataset.label || "This destination";

      if (toastMessage) {
        toastMessage.textContent =
          `${label} is reserved and will be connected ` +
          "when the verified URL is supplied.";
      }

      toast?.classList.add("show");
      window.clearTimeout(toastTimer);

      toastTimer = window.setTimeout(() => {
        toast?.classList.remove("show");
      }, 3000);
    });
  });
})();
