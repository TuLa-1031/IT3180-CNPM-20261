/* App shell, hash router, state and all interactions. */
(function (BM) {
  "use strict";

  const u = BM.ui;
  const I = BM.icon;
  const esc = u.esc;

  const LS = { user: "bluemoon_user", data: "bluemoon_data", users: "bluemoon_users" };

  BM.state = {
    route: "dashboard",
    user: null,
    users: [],
    data: null,
    source: "demo",
    search: {},
    filters: {},
    sidebarOpen: false
  };

  const ROUTES = {
    dashboard: ["Tổng quan", "dashboard"],
    households: ["Hộ gia đình", "home"],
    residents: ["Nhân khẩu", "users"],
    changes: ["Biến đổi nhân khẩu", "swap"],
    fees: ["Khoản thu", "receipt"],
    payments: ["Thu phí", "wallet"],
    vehicles: ["Phí gửi xe", "car"],
    bills: ["Thu hộ điện, nước", "bolt"],
    statistics: ["Thống kê", "stats"],
    account: ["Tài khoản", "settings"]
  };

  function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }
  function lsRemove(key) { try { localStorage.removeItem(key); } catch (e) { /* noop */ } }

  function persist() {
    lsSet(LS.data, BM.state.data);
    lsSet(LS.users, BM.state.users);
  }

  function nextId(list) {
    return list.reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1;
  }
  function byId(list, id) {
    return list.find(function (x) { return String(x.id) === String(id); });
  }

  function currentView() {
    if (!BM.state.user) return BM.views.login();
    const fn = BM.views[BM.state.route] || BM.views.dashboard;
    return fn();
  }

  function contentEl() { return document.getElementById("app-content"); }

  function rerender() {
    const el = contentEl();
    if (!el) return;
    const active = document.activeElement;
    const searchKey = active && active.getAttribute ? active.getAttribute("data-search") : null;
    const filterKey = active && active.getAttribute ? active.getAttribute("data-filter") : null;
    const pos = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
    el.innerHTML = currentView();
    decorateTables();
    if (searchKey || filterKey) {
      const sel = searchKey ? '[data-search="' + searchKey + '"]' : '[data-filter="' + filterKey + '"]';
      const next = el.querySelector(sel);
      if (next) {
        next.focus();
        if (pos !== null && next.setSelectionRange) {
          try { next.setSelectionRange(pos, pos); } catch (e) { /* noop */ }
        }
      }
    }
  }

  function navItem(route, iconName, label, count) {
    return '<button class="nav-item' + (BM.state.route === route ? " active" : "") +
      '" data-action="go" data-route="' + route + '"' + (BM.state.route === route ? ' aria-current="page"' : "") + '>' + I(iconName, 18) + "<span>" + esc(label) + "</span>" +
      (count ? '<span class="nav-count">' + count + "</span>" : "") + "</button>";
  }

  function shell() {
    const d = BM.state.data;
    const pending = d.payments.filter(function (p) { return p.status !== "PAID"; }).length;
    const me = BM.state.user;
    const initials = me.fullName.split(" ").filter(Boolean).slice(-2).map(function (w) { return w[0]; }).join("").toUpperCase();
    const sourceLabel = BM.state.source === "api" ? "Kết nối máy chủ" : "Dữ liệu mẫu";
    const sourceTone = BM.state.source === "api" ? "green" : "gold";

    return '<div class="app">' +
      '<a class="skip-link" href="#app-content">Bỏ qua đến nội dung chính</a>' +
      '<aside class="sidebar' + (BM.state.sidebarOpen ? " open" : "") + '" id="sidebar">' +
        '<div class="brand"><div class="brand-mark">' + BM.moonMark() + "</div>" +
          '<div><div class="brand-name">BlueMoon</div><span class="brand-caption">QUẢN LÝ CHUNG CƯ</span></div></div>' +
        '<nav class="nav">' +
          '<div class="nav-group"><div class="nav-label">Tổng quan</div>' +
            navItem("dashboard", "dashboard", "Bảng điều khiển") +
            navItem("statistics", "stats", "Thống kê") + "</div>" +
          '<div class="nav-group"><div class="nav-label">Quản lý cư dân</div>' +
            navItem("households", "home", "Hộ gia đình") +
            navItem("residents", "users", "Nhân khẩu") +
            navItem("changes", "swap", "Biến đổi nhân khẩu") + "</div>" +
          '<div class="nav-group"><div class="nav-label">Thu phí</div>' +
            navItem("fees", "receipt", "Khoản thu") +
            navItem("payments", "wallet", "Thu phí", pending) +
            navItem("vehicles", "car", "Phí gửi xe") +
            navItem("bills", "bolt", "Thu hộ điện, nước") + "</div>" +
          '<div class="nav-group"><div class="nav-label">Hệ thống</div>' +
            navItem("account", "settings", "Tài khoản") + "</div>" +
        "</nav>" +
        '<div class="sidebar-foot">' +
          '<div style="display:flex;justify-content:flex-end;margin-bottom:8px">' + u.badge(sourceLabel, sourceTone) + "</div>" +
          '<div class="user-chip"><div class="avatar">' + esc(initials) + "</div>" +
            '<div style="flex:1;min-width:0"><div class="u-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(me.fullName) + "</div>" +
            '<div class="u-role">' + esc((u.STATUS[me.role] || [me.role])[0]) + "</div></div>" +
            '<button class="icon-btn" data-action="logout" aria-label="Đăng xuất" title="Đăng xuất">' + I("logout", 17) + "</button></div>" +
        "</div>" +
      "</aside>" +
      '<div class="main">' +
        '<header class="topbar">' +
          '<button class="icon-btn menu-toggle" data-action="toggle-sidebar" aria-label="Mở menu" aria-expanded="' + BM.state.sidebarOpen + '">' + I("menu", 20) + "</button>" +
          '<div class="crumb">BlueMoon <span style="margin:0 6px">/</span> <strong>' + esc((ROUTES[BM.state.route] || [""])[0]) + "</strong></div>" +
          '<div class="topbar-spacer"></div>' +
          '<label class="search">' + I("search", 16) +
            '<input id="global-search" placeholder="Tìm kiếm nhanh…" aria-label="Tìm kiếm nhanh"></label>' +
          '<div class="period-pill">' + I("calendar", 15) + "Tháng <strong>10/2026</strong></div>" +
          '<div class="avatar" style="width:32px;height:32px;flex:0 0 32px">' + esc(initials) + "</div>" +
        "</header>" +
        '<main class="content" id="app-content">' + currentView() + "</main>" +
      "</div></div>";
  }

  function decorateTables() {
    document.querySelectorAll("table.data thead th").forEach(function (th) {
      th.setAttribute("scope", "col");
    });
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    if (!BM.state.user) {
      root.innerHTML = '<a class="skip-link" href="#login-form">Bỏ qua đến biểu mẫu đăng nhập</a>' + BM.views.login();
      document.title = "Đăng nhập · BlueMoon";
    } else {
      root.innerHTML = shell();
      decorateTables();
      animateRing();
      document.title = (ROUTES[BM.state.route] || ["BlueMoon"])[0] + " · BlueMoon";
    }
  }

  function animateRing() {
    const el = document.querySelector(".ring-num[data-pct]");
    if (!el) return;
    const target = Number(el.getAttribute("data-pct")) || 0;
    // Show the real value first; animation is deferred until the tab is visible.
    el.innerHTML = target + "<small>%</small>";
    if (document.hidden || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      el.innerHTML = Math.round(target * eased) + "<small>%</small>";
      if (t < 1 && el.isConnected) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function go(route) {
    if (!ROUTES[route]) return;
    if (location.hash === "#/" + route) { BM.state.route = route; rerender(); }
    else location.hash = "#/" + route;
  }

  function syncRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    BM.state.route = ROUTES[raw] ? raw : "dashboard";
    BM.state.sidebarOpen = false;
    render();
  }

  /* ---------------- Form field helpers ---------------- */
  function field(label, name, value, type, extra) {
    const id = "f-" + name;
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" name="' + name + '" type="' +
      (type || "text") + '" value="' + esc(value === null || value === undefined ? "" : value) + '" ' + (extra || "") + "></div>";
  }
  function area(label, name, value) {
    const id = "f-" + name;
    return '<div class="field full"><label for="' + id + '">' + esc(label) + '</label><textarea id="' + id + '" name="' + name + '">' + esc(value || "") + "</textarea></div>";
  }
  function select(label, name, options, value, extra) {
    const id = "f-" + name;
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><select id="' + id + '" name="' + name + '" ' + (extra || "") + ">" +
      options.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (String(value) === String(o[0]) ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></div>";
  }
  function grid(fields) { return '<div class="form-grid">' + fields.join("") + "</div>"; }
  function householdOptions(d) {
    return d.households.map(function (h) { return [h.id, h.householdCode + ", " + h.apartmentNumber + ", " + h.ownerName]; });
  }
  function residentOptions(d) {
    return d.residents.map(function (r) { return [r.id, r.fullName + ", " + ((byId(d.households, r.householdId) || {}).apartmentNumber || "")]; });
  }
  function feeOptions(d) { return d.fees.map(function (x) { return [x.id, x.feeCode + ", " + x.name]; }); }
  function val(form, name) { return (form.elements[name] || {}).value; }

  /* ---------------- Detail modals ---------------- */
  function kv(pairs) {
    return '<dl class="kv">' + pairs.map(function (p) {
      return "<dt>" + esc(p[0]) + "</dt><dd>" + p[1] + "</dd>";
    }).join("") + "</dl>";
  }

  function householdView(id) {
    const d = BM.state.data;
    const h = byId(d.households, id);
    if (!h) return;
    const members = d.residents.filter(function (r) { return r.householdId === h.id; });
    u.modal({
      title: "Chi tiết hộ gia đình",
      confirmText: "Đóng",
      body: kv([
        ["Mã hộ", '<span class="code">' + esc(h.householdCode) + "</span>"],
        ["Căn hộ", esc(h.apartmentNumber) + ", Tầng " + esc(h.floor)],
        ["Diện tích", esc(h.area) + " m²"],
        ["Chủ hộ", esc(h.ownerName)],
        ["Điện thoại", esc(h.phone || "—")],
        ["Ngày vào ở", u.date(h.moveInDate)],
        ["Trạng thái", u.statusBadge(h.status)]
      ]) + '<h4 style="font-size:13px;margin:20px 0 6px">Nhân khẩu trong hộ (' + members.length + ")</h4>" +
        (members.length ? members.map(function (r) {
          return '<div class="list-row"><span class="dot" style="background:var(--moon)"></span>' +
            '<div><div class="lr-main">' + esc(r.fullName) + '</div><div class="lr-sub">' + esc(r.relationshipToOwner) + "</div></div>" +
            '<div class="lr-val" style="font-size:12px;font-weight:500">' + esc((u.STATUS[r.residenceStatus] || [r.residenceStatus])[0]) + "</div></div>";
        }).join("") : '<p class="muted" style="font-size:12px">Chưa có nhân khẩu.</p>')
    });
  }

  function residentView(id) {
    const d = BM.state.data, lk = u.lookups(d);
    const r = byId(d.residents, id);
    if (!r) return;
    const h = lk.household(r.householdId);
    u.modal({
      title: "Chi tiết nhân khẩu",
      confirmText: "Đóng",
      body: kv([
        ["Họ và tên", esc(r.fullName)],
        ["Căn hộ", esc(h ? h.householdCode + ", " + h.apartmentNumber : "—")],
        ["Quan hệ", esc(r.relationshipToOwner)],
        ["Ngày sinh", u.date(r.dateOfBirth)],
        ["Giới tính", r.gender === "MALE" ? "Nam" : r.gender === "FEMALE" ? "Nữ" : "Khác"],
        ["CCCD/CMND", esc(r.identityCard || "—")],
        ["Nghề nghiệp", esc(r.occupation || "—")],
        ["Quê quán", esc(r.hometown || "—")],
        ["Trạng thái", u.statusBadge(r.residenceStatus)],
        ["Ghi chú", esc(r.note || "—")]
      ])
    });
  }

  function paymentView(id) {
    const d = BM.state.data, lk = u.lookups(d);
    const p = byId(d.payments, id);
    if (!p) return;
    const h = lk.household(p.householdId), fee = lk.fee(p.feeId);
    u.modal({
      title: "Chi tiết phiếu thu",
      confirmText: "Đóng",
      body: kv([
        ["Hộ gia đình", esc(h ? h.ownerName + ", " + h.householdCode : "—")],
        ["Khoản thu", esc(fee ? fee.name : "—")],
        ["Phải thu", u.money(p.amountDue)],
        ["Đã nộp", u.money(p.amountPaid)],
        ["Ngày nộp", u.datetime(p.paymentDate)],
        ["Phương thức", p.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Tiền mặt"],
        ["Người thu", esc((lk.user(p.collectedBy) || {}).fullName || "—")],
        ["Trạng thái", u.statusBadge(p.status)],
        ["Ghi chú", esc(p.note || "—")]
      ])
    });
  }

  /* ---------------- Form modals ---------------- */
  function householdForm(id) {
    const d = BM.state.data;
    const h = id ? byId(d.households, id) : null;
    u.modal({
      title: h ? "Sửa thông tin hộ gia đình" : "Thêm hộ gia đình",
      body: grid([
        field("Mã hộ", "householdCode", h && h.householdCode, "text", 'placeholder="BM-2901" required'),
        field("Số căn hộ", "apartmentNumber", h && h.apartmentNumber, "text", "required"),
        field("Tầng", "floor", h && h.floor, "number", 'min="1" max="30" required'),
        field("Diện tích (m²)", "area", h && h.area, "number", 'step="0.01" min="1" required'),
        field("Chủ hộ", "ownerName", h && h.ownerName, "text", "required"),
        field("Điện thoại", "phone", h && h.phone),
        field("Ngày vào ở", "moveInDate", h && h.moveInDate, "date"),
        select("Trạng thái", "status", [["ACTIVE", "Đang hoạt động"], ["MOVED_OUT", "Đã chuyển đi"]], h && h.status)
      ]),
      onConfirm: function (form) {
        const code = val(form, "householdCode").trim();
        if (d.households.some(function (x) { return x.householdCode === code && (!h || x.id !== h.id); })) {
          u.toast("Mã hộ đã tồn tại", "err"); return false;
        }
        const obj = {
          householdCode: code,
          apartmentNumber: val(form, "apartmentNumber").trim(),
          floor: Number(val(form, "floor")),
          area: Number(val(form, "area")),
          ownerName: val(form, "ownerName").trim(),
          phone: val(form, "phone").trim(),
          moveInDate: val(form, "moveInDate"),
          status: val(form, "status")
        };
        if (h) Object.assign(h, obj);
        else d.households.push(Object.assign({ id: nextId(d.households) }, obj));
        persist(); rerender(); u.toast(h ? "Đã cập nhật hộ gia đình" : "Đã thêm hộ gia đình", "ok");
      }
    });
  }

  function residentForm(id) {
    const d = BM.state.data;
    const r = id ? byId(d.residents, id) : null;
    u.modal({
      title: r ? "Sửa thông tin nhân khẩu" : "Thêm nhân khẩu",
      wide: true,
      body: grid([
        select("Hộ gia đình", "householdId", householdOptions(d), r && r.householdId),
        field("Họ và tên", "fullName", r && r.fullName, "text", "required"),
        field("Quan hệ với chủ hộ", "relationshipToOwner", r && r.relationshipToOwner, "text", 'placeholder="Chủ hộ, Vợ, Con…" required'),
        field("Ngày sinh", "dateOfBirth", r && r.dateOfBirth, "date"),
        select("Giới tính", "gender", [["MALE", "Nam"], ["FEMALE", "Nữ"], ["OTHER", "Khác"]], r && r.gender),
        field("CCCD/CMND", "identityCard", r && r.identityCard),
        field("Nghề nghiệp", "occupation", r && r.occupation),
        field("Quê quán", "hometown", r && r.hometown),
        select("Trạng thái cư trú", "residenceStatus", [["PERMANENT", "Thường trú"], ["TEMPORARY_RESIDENCE", "Tạm trú"], ["TEMPORARY_ABSENCE", "Tạm vắng"], ["MOVED_OUT", "Đã chuyển đi"]], r && r.residenceStatus),
        area("Ghi chú", "note", r && r.note)
      ]),
      onConfirm: function (form) {
        const obj = {
          householdId: Number(val(form, "householdId")),
          fullName: val(form, "fullName").trim(),
          relationshipToOwner: val(form, "relationshipToOwner").trim(),
          dateOfBirth: val(form, "dateOfBirth"),
          gender: val(form, "gender"),
          identityCard: val(form, "identityCard").trim(),
          occupation: val(form, "occupation").trim(),
          hometown: val(form, "hometown").trim(),
          residenceStatus: val(form, "residenceStatus"),
          note: val(form, "note").trim()
        };
        if (r) Object.assign(r, obj);
        else d.residents.push(Object.assign({ id: nextId(d.residents) }, obj));
        persist(); rerender(); u.toast(r ? "Đã cập nhật nhân khẩu" : "Đã thêm nhân khẩu", "ok");
      }
    });
  }

  function changeForm() {
    const d = BM.state.data;
    u.modal({
      title: "Ghi nhận biến đổi nhân khẩu",
      wide: true,
      body: grid([
        select("Cư dân", "residentId", residentOptions(d), ""),
        select("Loại biến đổi", "changeType", [["TEMPORARY_RESIDENCE", "Tạm trú"], ["TEMPORARY_ABSENCE", "Tạm vắng"], ["MOVE_IN", "Chuyển đến"], ["MOVE_OUT", "Chuyển đi"]], ""),
        field("Từ ngày", "startDate", new Date().toISOString().slice(0, 10), "date", "required"),
        field("Đến ngày", "endDate", "", "date"),
        field("Địa chỉ liên quan", "destinationOrOrigin", ""),
        area("Lý do", "reason", ""),
        '<input type="hidden" name="createdBy" value="' + BM.state.user.id + '">'
      ]),
      onConfirm: function (form) {
        const residentId = Number(val(form, "residentId"));
        const resident = byId(d.residents, residentId);
        if (!resident) { u.toast("Chọn cư dân cần ghi nhận", "err"); return false; }
        d.residenceChanges.push({
          id: nextId(d.residenceChanges),
          residentId: residentId,
          householdId: resident.householdId,
          changeType: val(form, "changeType"),
          startDate: val(form, "startDate"),
          endDate: val(form, "endDate") || null,
          destinationOrOrigin: val(form, "destinationOrOrigin").trim(),
          reason: val(form, "reason").trim(),
          createdBy: BM.state.user.id
        });
        persist(); rerender(); u.toast("Đã ghi nhận biến đổi", "ok");
      }
    });
  }

  function feeForm(id) {
    const d = BM.state.data;
    const fee = id ? byId(d.fees, id) : null;
    const types = [["SERVICE", "Phí dịch vụ"], ["MANAGEMENT", "Phí quản lý"], ["CONTRIBUTION", "Đóng góp"], ["PARKING", "Gửi xe"], ["UTILITY", "Thu hộ"]];
    u.modal({
      title: fee ? "Sửa khoản thu" : "Tạo khoản thu mới",
      wide: true,
      body: grid([
        field("Mã khoản thu", "feeCode", fee && fee.feeCode, "text", 'placeholder="DV-2026-12" required'),
        field("Tên khoản thu", "name", fee && fee.name, "text", 'placeholder="Phí dịch vụ tháng 12/2026" required'),
        select("Loại phí", "feeType", types, fee && fee.feeType),
        select("Tính tiền theo", "calculationMethod", [["PER_AREA", "Theo diện tích (đ/m²)"], ["FIXED", "Số tiền cố định"], ["BY_VEHICLE", "Theo phương tiện"], ["BY_USAGE", "Theo tiêu thụ"], ["VOLUNTARY", "Tự nguyện"]], fee && fee.calculationMethod),
        field("Đơn giá (đ)", "unitPrice", fee && fee.unitPrice, "number", 'step="1000" min="0"'),
        '<div class="field full"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" name="isMandatory" style="width:auto"' + (!fee || fee.isMandatory ? " checked" : "") + "> Khoản thu bắt buộc</label></div>",
        field("Tháng", "billingMonth", fee && fee.billingMonth, "number", 'min="1" max="12"'),
        field("Năm", "billingYear", fee && fee.billingYear, "number", 'min="2020" max="2100"'),
        field("Ngày bắt đầu", "startDate", fee && fee.startDate, "date"),
        field("Hạn nộp", "dueDate", fee && fee.dueDate, "date"),
        select("Trạng thái", "status", [["OPEN", "Đang thu"], ["CLOSED", "Đã kết thúc"]], fee && fee.status),
        area("Mô tả", "description", fee && fee.description)
      ]),
      onConfirm: function (form) {
        const code = val(form, "feeCode").trim();
        if (d.fees.some(function (x) { return x.feeCode === code && (!fee || x.id !== fee.id); })) {
          u.toast("Mã khoản thu đã tồn tại", "err"); return false;
        }
        const obj = {
          feeCode: code,
          name: val(form, "name").trim(),
          feeType: val(form, "feeType"),
          calculationMethod: val(form, "calculationMethod"),
          unitPrice: Number(val(form, "unitPrice") || 0),
          isMandatory: form.elements.isMandatory.checked,
          billingMonth: val(form, "billingMonth") ? Number(val(form, "billingMonth")) : null,
          billingYear: val(form, "billingYear") ? Number(val(form, "billingYear")) : null,
          startDate: val(form, "startDate"),
          dueDate: val(form, "dueDate"),
          status: val(form, "status"),
          description: val(form, "description").trim(),
          createdBy: BM.state.user.id
        };
        if (fee) Object.assign(fee, obj);
        else d.fees.push(Object.assign({ id: nextId(d.fees) }, obj));
        persist(); rerender(); u.toast(fee ? "Đã cập nhật khoản thu" : "Đã tạo khoản thu", "ok");
      }
    });
  }

  function collectForm(id) {
    const d = BM.state.data, lk = u.lookups(d);
    const p = byId(d.payments, id);
    if (!p) return;
    const h = lk.household(p.householdId), fee = lk.fee(p.feeId);
    const remaining = Math.max(0, Number(p.amountDue || 0) - Number(p.amountPaid || 0));
    u.modal({
      title: "Ghi nhận thu tiền",
      body: kv([
        ["Hộ gia đình", esc(h ? h.ownerName + ", " + h.apartmentNumber : "—")],
        ["Khoản thu", esc(fee ? fee.name : "—")],
        ["Phải thu", u.money(p.amountDue)],
        ["Đã nộp", u.money(p.amountPaid)]
      ]) + '<div class="form-grid" style="margin-top:18px">' +
        field("Số tiền thu (đ)", "amount", remaining || "", "number", 'step="1000" min="0" required') +
        select("Phương thức", "paymentMethod", [["CASH", "Tiền mặt"], ["BANK_TRANSFER", "Chuyển khoản"]], p.paymentMethod) +
        area("Ghi chú", "note", p.note) +
        "</div>",
      confirmText: "Xác nhận thu",
      onConfirm: function (form) {
        const amount = Number(val(form, "amount") || 0);
        if (amount <= 0) { u.toast("Số tiền thu phải lớn hơn 0", "err"); return false; }
        const paid = Number(p.amountPaid || 0) + amount;
        const due = Number(p.amountDue || 0);
        p.amountPaid = paid;
        p.status = due === 0 || paid >= due ? "PAID" : "PARTIAL";
        p.paymentDate = new Date().toISOString();
        p.paymentMethod = val(form, "paymentMethod");
        p.collectedBy = BM.state.user.id;
        p.note = val(form, "note").trim();
        persist(); rerender(); u.toast("Đã ghi nhận " + u.money(amount), "ok");
      }
    });
  }

  function vehicleForm() {
    const d = BM.state.data;
    u.modal({
      title: "Thêm phương tiện gửi xe",
      body: grid([
        select("Hộ gia đình", "householdId", householdOptions(d), ""),
        select("Loại xe", "vehicleType", [["MOTORBIKE", "Xe máy"], ["CAR", "Ô tô"]], "MOTORBIKE"),
        field("Biển số", "licensePlate", "", "text", "required"),
        field("Hiệu xe", "brand", ""),
        field("Phí/tháng (đ)", "monthlyFee", 70000, "number", 'step="1000" min="0"'),
        field("Ngày đăng ký", "registeredDate", new Date().toISOString().slice(0, 10), "date"),
        select("Trạng thái", "status", [["ACTIVE", "Đang hoạt động"], ["INACTIVE", "Ngừng hoạt động"]], "ACTIVE"),
        area("Ghi chú", "note", "")
      ]),
      onConfirm: function (form) {
        const plate = val(form, "licensePlate").trim();
        if (d.vehicles.some(function (v) { return v.licensePlate === plate; })) { u.toast("Biển số đã tồn tại", "err"); return false; }
        d.vehicles.push({
          id: nextId(d.vehicles),
          householdId: Number(val(form, "householdId")),
          vehicleType: val(form, "vehicleType"),
          licensePlate: plate,
          brand: val(form, "brand").trim(),
          monthlyFee: Number(val(form, "monthlyFee") || 0),
          registeredDate: val(form, "registeredDate"),
          status: val(form, "status"),
          note: val(form, "note").trim()
        });
        persist(); rerender(); u.toast("Đã thêm phương tiện", "ok");
      }
    });
  }

  function billForm() {
    const d = BM.state.data;
    u.modal({
      title: "Thêm hóa đơn thu hộ",
      wide: true,
      body: grid([
        select("Hộ gia đình", "householdId", householdOptions(d), ""),
        select("Dịch vụ", "serviceType", [["ELECTRICITY", "Tiền điện"], ["WATER", "Tiền nước"], ["INTERNET", "Internet"]], "ELECTRICITY"),
        field("Tháng", "billingMonth", new Date().getMonth() + 1, "number", 'min="1" max="12" required'),
        field("Năm", "billingYear", new Date().getFullYear(), "number", 'min="2020" max="2100" required'),
        field("Chỉ số trước", "previousIndex", 0, "number", 'min="0"'),
        field("Chỉ số hiện tại", "currentIndex", 0, "number", 'min="0"'),
        field("Thành tiền (đ)", "totalAmount", 0, "number", 'step="1000" min="0"'),
        field("Nhà cung cấp", "providerName", ""),
        area("Ghi chú", "note", "")
      ]),
      onConfirm: function (form) {
        const prev = Number(val(form, "previousIndex") || 0), curr = Number(val(form, "currentIndex") || 0);
        d.utilityBills.push({
          id: nextId(d.utilityBills),
          householdId: Number(val(form, "householdId")),
          feeId: null,
          serviceType: val(form, "serviceType"),
          billingMonth: Number(val(form, "billingMonth")),
          billingYear: Number(val(form, "billingYear")),
          previousIndex: prev,
          currentIndex: curr,
          usageAmount: Math.max(0, curr - prev),
          totalAmount: Number(val(form, "totalAmount") || 0),
          providerName: val(form, "providerName").trim(),
          paymentStatus: "UNPAID",
          paidAt: null,
          note: val(form, "note").trim()
        });
        persist(); rerender(); u.toast("Đã thêm hóa đơn", "ok");
      }
    });
  }

  /* ---------------- Auth ---------------- */
  function login(form) {
    const username = val(form, "username").trim();
    const password = val(form, "password");
    const found = BM.state.users.find(function (x) { return x.username === username; });
    const msg = document.getElementById("login-msg");
    if (!found || found.password !== password || found.status !== "ACTIVE") {
      if (msg) msg.innerHTML = '<div class="login-error">Tên đăng nhập hoặc mật khẩu không đúng.</div>';
      return;
    }
    BM.state.user = { id: found.id, username: found.username, fullName: found.fullName, email: found.email, phone: found.phone, role: found.role, status: found.status };
    lsSet(LS.user, BM.state.user);
    location.hash = "#/dashboard";
    syncRoute();
    u.toast("Chào mừng " + BM.state.user.fullName, "ok");
  }

  function registerForm() {
    u.modal({
      title: "Đăng ký tài khoản",
      wide: true,
      confirmText: "Tạo tài khoản",
      body: grid([
        field("Tên đăng nhập", "username", "", "text", "required"),
        field("Họ và tên", "fullName", "", "text", "required"),
        field("Mật khẩu", "password", "", "password", 'minlength="6" required'),
        field("Xác nhận mật khẩu", "confirm", "", "password", 'minlength="6" required'),
        field("Email", "email", "", "email"),
        field("Điện thoại", "phone", "", "text")
      ]),
      onConfirm: function (form) {
        const username = val(form, "username").trim();
        const password = val(form, "password");
        if (BM.state.users.some(function (x) { return x.username === username; })) {
          u.toast("Tên đăng nhập đã tồn tại", "err"); return false;
        }
        if (password !== val(form, "confirm")) { u.toast("Mật khẩu xác nhận không khớp", "err"); return false; }
        const created = {
          id: nextId(BM.state.users),
          username: username,
          password: password,
          fullName: val(form, "fullName").trim(),
          email: val(form, "email").trim(),
          phone: val(form, "phone").trim(),
          role: "MANAGER",
          status: "ACTIVE"
        };
        BM.state.users.push(created);
        BM.state.user = { id: created.id, username: created.username, fullName: created.fullName, email: created.email, phone: created.phone, role: created.role, status: created.status };
        lsSet(LS.user, BM.state.user);
        persist();
        location.hash = "#/dashboard";
        syncRoute();
        u.toast("Tài khoản đã được tạo", "ok");
      }
    });
  }

  function logout() {
    BM.state.user = null;
    lsRemove(LS.user);
    location.hash = "#/login";
    render();
  }

  /* ---------------- Events ---------------- */
  function onClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.getAttribute("data-action");
    const id = el.getAttribute("data-id");
    switch (action) {
      case "go": go(el.getAttribute("data-route")); break;
      case "go-fee": BM.state.filters["payments-fee"] = String(id); go("payments"); break;
      case "toggle-sidebar": BM.state.sidebarOpen = !BM.state.sidebarOpen; render(); break;
      case "logout": logout(); break;
      case "register": registerForm(); break;
      case "household-add": householdForm(null); break;
      case "household-edit": e.stopPropagation(); householdForm(id); break;
      case "household-view": householdView(id); break;
      case "resident-add": residentForm(null); break;
      case "resident-edit": e.stopPropagation(); residentForm(id); break;
      case "resident-view": residentView(id); break;
      case "change-add": changeForm(); break;
      case "fee-add": feeForm(null); break;
      case "fee-edit": feeForm(id); break;
      case "payment-collect": collectForm(id); break;
      case "payment-view": paymentView(id); break;
      case "vehicle-add": vehicleForm(); break;
      case "bill-add": billForm(); break;
      case "bill-pay": {
        const bill = byId(BM.state.data.utilityBills, id);
        if (bill) { bill.paymentStatus = "PAID"; bill.paidAt = new Date().toISOString(); persist(); rerender(); u.toast("Đã ghi nhận thu hộ", "ok"); }
        break;
      }
      default: break;
    }
  }

  function onInput(e) {
    const key = e.target.getAttribute("data-search");
    if (!key) return;
    BM.state.search[key] = e.target.value;
    rerender();
  }

  function onChange(e) {
    const key = e.target.getAttribute("data-filter");
    if (!key) return;
    BM.state.filters[key] = e.target.value;
    rerender();
  }

  function onSubmit(e) {
    const form = e.target;
    if (form.id === "login-form") { e.preventDefault(); login(form); return; }
    if (form.id === "profile-form") {
      e.preventDefault();
      BM.state.user.fullName = val(form, "fullName").trim();
      BM.state.user.email = val(form, "email").trim();
      BM.state.user.phone = val(form, "phone").trim();
      const stored = byId(BM.state.users, BM.state.user.id);
      if (stored) Object.assign(stored, BM.state.user);
      lsSet(LS.user, BM.state.user); persist(); render(); u.toast("Đã lưu thông tin cá nhân", "ok");
      return;
    }
    if (form.id === "password-form") {
      e.preventDefault();
      const stored = byId(BM.state.users, BM.state.user.id);
      if (!stored || stored.password !== val(form, "old")) { u.toast("Mật khẩu hiện tại không đúng", "err"); return; }
      const next = val(form, "next");
      if (next !== val(form, "confirm")) { u.toast("Mật khẩu xác nhận không khớp", "err"); return; }
      stored.password = next;
      persist(); form.reset(); u.toast("Đã đổi mật khẩu", "ok");
      return;
    }
  }

  function onKeydown(e) {
    if (e.key === "Enter" && e.target.id === "global-search") {
      const term = e.target.value.trim();
      BM.state.search.households = term;
      BM.state.filters.households = "";
      go("households");
    }
  }

  function onHashChange() { syncRoute(); }

  async function init() {
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("change", onChange);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("hashchange", onHashChange);

    BM.state.users = lsGet(LS.users) || BM.data.users();
    BM.state.user = lsGet(LS.user);

    const result = await BM.data.load();
    BM.state.source = result.source;
    const stored = lsGet(LS.data);
    BM.state.data = result.source === "api" || !stored ? result.data : stored;

    if (!BM.state.user && location.hash !== "#/login") location.hash = "#/login";
    if (BM.state.user && (!location.hash || location.hash === "#/login")) location.hash = "#/dashboard";
    syncRoute();
  }

  BM.go = go;
  document.addEventListener("DOMContentLoaded", init);
})(window.BM = window.BM || {});
