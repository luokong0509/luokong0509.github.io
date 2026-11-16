(function () {
  "use strict";

  /* ---------- 兼容旧版 hash 链接（/#/post/<slug>、/#/category/<id>） ---------- */
  (function () {
    var CAT_ID = {
      bus: "车载总线",
      diag: "诊断与测试",
      autosar: "AUTOSAR",
      safety: "功能安全",
      eth: "车载以太网",
      tools: "工具与脚本"
    };
    var h = window.location.hash;
    if (!h) return;
    var m = /^#\/post\/([^/?#]+)/.exec(h);
    if (m) { window.location.replace("/posts/" + m[1] + "/"); return; }
    m = /^#\/categor(?:y|ies)(?:\/([^/?#]+))?/.exec(h);
    if (m) {
      var id = m[1];
      window.location.replace(id && CAT_ID[id] ? "/categories/" + encodeURIComponent(CAT_ID[id]) + "/" : "/categories/");
    }
  })();

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 时钟 ---------- */
  var clockEl = document.getElementById("clock");
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function tick() {
    if (!clockEl) return;
    var d = new Date();
    clockEl.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick();
  if (clockEl) setInterval(tick, 1000);

  /* ---------- CAN 报表面板 ---------- */
  var FRAMES = [
    { id: "0x0C0", dlc: 8, data: "40 1F 2C FF 00 00 00 00", sig: "车速", val: "80.00 km/h", detail: "起始位 0 · 长度 16 · Intel · factor 0.01" },
    { id: "0x1A0", dlc: 8, data: "2D 00 00 1B 00 00 00 00", sig: "转速", val: "2860 rpm", detail: "起始位 32 · 长度 16 · Intel · factor 0.25" },
    { id: "0x2F1", dlc: 8, data: "8C 32 00 00 00 00 00 00", sig: "冷却液温度", val: "90.0 °C", detail: "起始位 0 · 长度 8 · offset -40" },
    { id: "0x7DF", dlc: 8, data: "02 10 03 00 00 00 00 00", sig: "诊断请求", val: "10 03", detail: "功能寻址 · 扩展会话" },
    { id: "0x7E8", dlc: 8, data: "06 50 03 00 32 01 F4 00", sig: "诊断响应", val: "50 03", detail: "P2 = 0x0032 · P2* = 0x01F4" },
    { id: "0x18FF50E5", dlc: 8, data: "00 7D 00 00 FF FF 00 00", sig: "报文计数器", val: "125", detail: "J1939 · 29 位标识 · 优先级 3" }
  ];

  var framesEl = document.getElementById("frames");
  var decodeEl = document.getElementById("decode");
  var current = 0;
  var timer = null;

  function renderFrames() {
    if (!framesEl) return;
    var html = "";
    for (var i = 0; i < FRAMES.length; i++) {
      var f = FRAMES[i];
      html += '<button type="button" class="frame' + (i === current ? " on" : "") + '" data-i="' + i + '" aria-pressed="' + (i === current) + '">' +
        '<span class="fid">' + f.id + "</span>" +
        '<span class="dlc">' + f.dlc + "</span>" +
        '<span class="fdata">' + f.data + "</span></button>";
    }
    framesEl.innerHTML = html;
  }

  function renderDecode() {
    if (!decodeEl) return;
    var f = FRAMES[current];
    decodeEl.innerHTML =
      '<div class="drow"><span>信号</span><span>' + f.sig + "</span></div>" +
      '<div class="drow"><span>物理值</span><span>' + f.val + "</span></div>" +
      '<div class="dnote">' + f.detail + "</div>";
  }

  function select(i) {
    current = i;
    renderFrames();
    renderDecode();
  }

  if (framesEl) {
    renderFrames();
    renderDecode();
    framesEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".frame");
      if (!btn) return;
      select(parseInt(btn.getAttribute("data-i"), 10));
      if (timer) { clearInterval(timer); timer = null; }
    });
    if (!reduced) {
      timer = setInterval(function () { select((current + 1) % FRAMES.length); }, 1400);
    }
  }

  /* ---------- 列表筛选 ---------- */
  var listEl = document.getElementById("post-list");
  var emptyEl = document.getElementById("empty");
  var chipsEl = document.querySelector(".chips");
  var inputEl = document.getElementById("q");
  var state = { cat: "all", q: "" };

  function applyFilter() {
    var rows = listEl ? listEl.querySelectorAll(".row") : [];
    var shown = 0;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var okCat = state.cat === "all" || row.getAttribute("data-cat") === state.cat;
      var text = (row.textContent || "").toLowerCase();
      var okQ = state.q === "" || text.indexOf(state.q) > -1;
      var show = okCat && okQ;
      if (show) row.removeAttribute("hidden"); else row.setAttribute("hidden", "hidden");
      if (show) shown++;
    }
    if (emptyEl) {
      if (shown === 0) emptyEl.removeAttribute("hidden"); else emptyEl.setAttribute("hidden", "hidden");
    }
  }

  if (chipsEl) {
    chipsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      var chips = chipsEl.querySelectorAll(".chip");
      for (var i = 0; i < chips.length; i++) chips[i].setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-pressed", "true");
      state.cat = btn.getAttribute("data-cat");
      applyFilter();
    });
  }

  if (inputEl) {
    inputEl.addEventListener("input", function () {
      state.q = inputEl.value.trim().toLowerCase();
      applyFilter();
    });
  }

  var resetEl = document.getElementById("resetFilter");
  if (resetEl) {
    resetEl.addEventListener("click", function () {
      state.cat = "all";
      state.q = "";
      if (inputEl) inputEl.value = "";
      if (chipsEl) {
        var chips = chipsEl.querySelectorAll(".chip");
        for (var i = 0; i < chips.length; i++) {
          chips[i].setAttribute("aria-pressed", chips[i].getAttribute("data-cat") === "all" ? "true" : "false");
        }
      }
      applyFilter();
    });
  }

  /* ---------- 阅读进度 ---------- */
  var barEl = document.getElementById("progress");
  var articleEl = document.getElementById("article");
  if (barEl && articleEl) {
    var raf = false;
    function updateBar() {
      raf = false;
      var rect = articleEl.getBoundingClientRect();
      var total = rect.height - window.innerHeight + 160;
      var done = total > 0 ? (Math.min(Math.max(-rect.top + 160, 0), total) / total) : 1;
      barEl.style.width = (total > 0 ? Math.round(done * 100) : 0) + "%";
    }
    window.addEventListener("scroll", function () {
      if (!raf) { raf = true; window.requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();
  }
})();
