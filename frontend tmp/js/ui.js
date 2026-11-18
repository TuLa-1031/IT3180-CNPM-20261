/* Shared rendering helpers, formatting and overlays. */
(function (BM) {
  "use strict";

  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function num(value) {
    const n = Number(value || 0);
    return n.toLocaleString("vi-VN");
  }

  function money(value) {
    return num(value) + " ₫";
  }

  function date(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  function datetime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return date(d) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function badge(text, tone) {
    return '<span class="badge ' + (tone || "gray") + '">' + esc(text) + "</span>";
  }

  const STATUS = {
    ACTIVE: ["Đang hoạt động", "green"],
    INACTIVE: ["Ngừng hoạt động", "gray"],
    MOVED_OUT: ["Đã chuyển đi", "gray"],
    UNPAID: ["Chưa nộp", "red"],
    PARTIAL: ["Nộp một phần", "gold"],
    PAID: ["Đã nộp", "green"],
    OPEN: ["Đang thu", "blue"],
    CLOSED: ["Đã kết thúc", "gray"],
    PERMANENT: ["Thường trú", "green"],
    TEMPORARY_RESIDENCE: ["Tạm trú", "blue"],
    TEMPORARY_ABSENCE: ["Tạm vắng", "gold"],
    TEMPORARY_RESIDENCE_CHANGE: ["Tạm trú", "blue"],
    MOVE_IN: ["Chuyển đến", "green"],
    MOVE_OUT: ["Chuyển đi", "gray"],
    ADMIN: ["Quản trị viên", "blue"],
    MANAGER: ["Ban quản trị", "blue"],
    ACCOUNTANT: ["Kế toán", "gold"]
  };

  function statusBadge(value) {
    const s = STATUS[value] || [value || "—", "gray"];
    return badge(s[0], s[1]);
  }

  const FEE_TYPE = {
    SERVICE: ["Phí dịch vụ", "blue"],
    MANAGEMENT: ["Phí quản lý", "gold"],
    CONTRIBUTION: ["Đóng góp", "green"],
    PARKING: ["Gửi xe", "blue"],
    UTILITY: ["Thu hộ", "gold"]
  };
  const CHANGE_TYPE = {
    TEMPORARY_RESIDENCE: ["Tạm trú", "blue"],
    TEMPORARY_ABSENCE: ["Tạm vắng", "gold"],
    MOVE_IN: ["Chuyển đến", "green"],
    MOVE_OUT: ["Chuyển đi", "gray"]
  };
  const SERVICE_TYPE = {
    ELECTRICITY: ["Tiền điện", "gold"],
    WATER: ["Tiền nước", "blue"],
    INTERNET: ["Internet", "green"]
  };

  function lookups(d) {
    return {
      household: function (id) { return d.households.find(function (x) { return x.id === id; }); },
      fee: function (id) { return d.fees.find(function (x) { return x.id === id; }); },
      resident: function (id) { return d.residents.find(function (x) { return x.id === id; }); },
      user: function (id) { return (BM.data.users()).find(function (x) { return x.id === id; }); }
    };
  }

  let modalCleanup = null;

  function closeModal() {
    if (modalCleanup) modalCleanup();
  }

  /* onConfirm(form) -> return false to keep the modal open. */
  function modal(options) {
    closeModal();
    const root = document.getElementById("modal-root");
    if (!root) return;
    const confirmText = options.confirmText || "Lưu thay đổi";
    const wide = options.wide ? " max-width:720px" : "";
    root.innerHTML =
      '<div class="overlay" data-modal-overlay>' +
        '<div class="modal" role="dialog" aria-modal="true" style="width:min(560px,100%);' + wide + '">' +
          '<div class="modal-head"><h3>' + esc(options.title) + '</h3>' +
            '<button class="icon-btn" data-modal-close aria-label="Đóng">' + BM.icon("close", 18) + "</button></div>" +
          '<form id="modal-form"><div class="modal-body">' + options.body + "</div>" +
            '<div class="modal-foot">' +
              '<button type="button" class="btn btn-ghost" data-modal-close>Hủy</button>' +
              '<button type="submit" class="btn btn-primary">' + esc(confirmText) + "</button>" +
            "</div></form>" +
        "</div>" +
      "</div>";

    const form = document.getElementById("modal-form");
    const overlay = root.querySelector("[data-modal-overlay]");

    function cleanup() {
      document.removeEventListener("keydown", onKey);
      root.innerHTML = "";
      modalCleanup = null;
    }
    function onKey(e) { if (e.key === "Escape") cleanup(); }

    modalCleanup = cleanup;
    root.querySelectorAll("[data-modal-close]").forEach(function (b) { b.addEventListener("click", cleanup); });
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) cleanup(); });
    document.addEventListener("keydown", onKey);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof options.onConfirm === "function" && options.onConfirm(form) === false) return;
      cleanup();
    });
    const first = form.querySelector("input, select, textarea");
    if (first) first.focus();
  }

  function confirm(title, message, onConfirm, danger) {
    modal({
      title: title,
      body: '<p style="font-size:13px;color:var(--text-muted);line-height:1.7">' + esc(message) + "</p>",
      confirmText: danger ? "Xác nhận" : "Đồng ý",
      onConfirm: onConfirm
    });
  }

  function toast(message, tone) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const icons = { ok: "checkCircle", warn: "alert", err: "alert", info: "info" };
    const el = document.createElement("div");
    el.className = "toast " + (tone || "ok");
    el.innerHTML = BM.icon(icons[tone || "ok"], 18) + "<span>" + esc(message) + "</span>";
    root.appendChild(el);
    setTimeout(function () { el.remove(); }, 3600);
  }

  function empty(title, hint) {
    return '<div class="empty">' + BM.icon("moon", 40) + "<p>" + esc(title) + "</p>" +
      (hint ? '<div class="hint">' + esc(hint) + "</div>" : "") + "</div>";
  }

  BM.ui = {
    esc: esc, num: num, money: money, date: date, datetime: datetime,
    badge: badge, statusBadge: statusBadge, lookups: lookups,
    FEE_TYPE: FEE_TYPE, CHANGE_TYPE: CHANGE_TYPE, SERVICE_TYPE: SERVICE_TYPE, STATUS: STATUS,
    modal: modal, closeModal: closeModal, confirm: confirm, toast: toast, empty: empty
  };
})(window.BM = window.BM || {});
