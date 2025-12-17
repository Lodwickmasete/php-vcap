(function() {
  let history = [];
  let panelVisible = false;

  // Panel container
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.bottom = "0";
  panel.style.left = "0";
  panel.style.width = "100%";
  panel.style.maxHeight = "40vh";
  panel.style.overflowY = "auto";
  panel.style.background = "#111";
  panel.style.color = "#0f0";
  panel.style.fontSize = "13px";
  panel.style.fontFamily = "monospace";
  panel.style.padding = "8px 8px 40px 8px";
  panel.style.zIndex = "9999";
  panel.style.whiteSpace = "pre-wrap";
  panel.style.borderTop = "2px solid #333";
  panel.style.boxShadow = "0 -2px 10px rgba(0,0,0,0.4)";
  panel.style.display = "none";
  document.body.appendChild(panel);

  // --- Button bar ---
  const btnBar = document.createElement("div");
  btnBar.style.position = "absolute";
  btnBar.style.bottom = "0";
  btnBar.style.left = "0";
  btnBar.style.width = "100%";
  btnBar.style.background = "#222";
  btnBar.style.borderTop = "1px solid #444";
  btnBar.style.padding = "6px 8px";
  btnBar.style.display = "flex";
  btnBar.style.justifyContent = "flex-end"; // ALL BUTTONS RIGHT
  btnBar.style.gap = "10px";
  panel.appendChild(btnBar);

  // --- Copy button ---
  const copyBtn = document.createElement("button");
  copyBtn.innerHTML = `<i class="fas fa-copy"></i>`;
  copyBtn.style.background = "#007bff";
  copyBtn.style.color = "#fff";
  copyBtn.style.border = "none";
  copyBtn.style.padding = "5px 10px";
  copyBtn.style.cursor = "pointer";
  btnBar.appendChild(copyBtn);

  copyBtn.onclick = () => {
    const text = history.join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Console copied!"))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert("Console copied!");
  }

  // --- Clear button ---
  const clearBtn = document.createElement("button");
  clearBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  clearBtn.style.background = "#dc3545";
  clearBtn.style.color = "#fff";
  clearBtn.style.border = "none";
  clearBtn.style.padding = "5px 10px";
  clearBtn.style.cursor = "pointer";
  btnBar.appendChild(clearBtn);

  clearBtn.onclick = () => {
    const bar = btnBar;
    panel.innerHTML = "";
    panel.appendChild(bar);
    history = [];
  };

  // --- Collapse button (now last, on RIGHT) ---
  const toggleBtn = document.createElement("button");
  toggleBtn.innerHTML = `<i class="fas fa-chevron-up"></i>`;
  toggleBtn.style.background = "#444";
  toggleBtn.style.color = "#fff";
  toggleBtn.style.border = "none";
  toggleBtn.style.padding = "5px 10px";
  toggleBtn.style.cursor = "pointer";
  btnBar.appendChild(toggleBtn);

  toggleBtn.onclick = () => {
    if (panel.style.maxHeight === "40vh") {
      panel.style.maxHeight = "22px";
      toggleBtn.innerHTML = `<i class="fas fa-chevron-down"></i>`;
    } else {
      panel.style.maxHeight = "40vh";
      toggleBtn.innerHTML = `<i class="fas fa-chevron-up"></i>`;
    }
  };

  // --- Print helper ---
  function print(msg, color = "#0f0") {
    if (!panelVisible) {
      panel.style.display = "block";
      panelVisible = true;
    }

    history.push(msg);

    const line = document.createElement("div");
    line.style.color = color;
    line.textContent = msg;

    panel.insertBefore(line, btnBar);
    panel.scrollTop = panel.scrollHeight;
  }

  // Capture console
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = function(...args) {
    const msg = "[LOG] " + args.map(a => JSON.stringify(a, null, 2)).join(" ");
    print(msg);
    originalLog.apply(console, args);
  };

  console.warn = function(...args) {
    const msg = "[WARN] " + args.join(" ");
    print(msg, "#ff0");
    originalWarn.apply(console, args);
  };

  console.error = function(...args) {
    const msg = "[ERROR] " + args.join(" ");
    print(msg, "#f33");
    originalError.apply(console, args);
  };

  window.addEventListener("error", e => {
    const msg = `[UNCAUGHT] ${e.message} @ ${e.filename}:${e.lineno}`;
    print(msg, "#f33");
  });
})();