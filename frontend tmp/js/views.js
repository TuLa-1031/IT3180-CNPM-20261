/* Screen renderers. Each returns an HTML string; actions are wired by app.js. */
(function (BM) {
  "use strict";

  const u = BM.ui;
  const I = BM.icon;
  const esc = u.esc;

  function q(key) { return (BM.state.search[key] || "").trim().toLowerCase(); }
  function f(key, fallback) { return BM.state.filters[key] || fallback || ""; }
  function match(text, term) { return String(text || "").toLowerCase().indexOf(term) !== -1; }

  function head(title, sub, actions) {
    return '<div class="page-head"><div><h1 class="page-title">' + esc(title) + "</h1>" +
      '<p class="page-sub">' + esc(sub) + "</p></div>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' + (actions || "") + "</div></div>";
  }

  function toolbar(searchKey, placeholder, filterHtml, addBtn) {
    return '<div class="table-toolbar">' +
      '<label class="toolbar-search">' + I("search", 15) +
        '<input type="search" data-search="' + searchKey + '" placeholder="' + esc(placeholder) + '" value="' + esc(BM.state.search[searchKey] || "") + '" aria-label="Tìm kiếm"></label>' +
      (filterHtml || "") +
      '<div style="flex:1"></div>' + (addBtn || "") + "</div>";
  }

  function selectFilter(key, options, current) {
    return '<select class="filter-select" data-filter="' + key + '" aria-label="Lọc">' +
      options.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (current === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select>";
  }

  function tableFoot(rows, total) {
    return '<div class="table-foot"><span>Hiển thị ' + rows + " / " + total + " bản ghi</span>" +
      '<span>Nhấn vào một dòng để xem chi tiết</span></div>';
  }

  function donut(segments, centerTop, centerBottom) {
    let acc = 0;
    const stops = segments.map(function (s) {
      const from = acc; acc += s.value;
      return s.color + " " + from + "deg " + acc + "deg";
    }).join(", ");
    if (!segments.length) return "";
    return '<div class="donut" style="background:conic-gradient(' + stops + ')">' +
      '<div class="donut-center"><div class="donut-num">' + esc(centerTop) + "</div>" +
      '<div class="donut-cap">' + esc(centerBottom) + "</div></div></div>";
  }

  /* ---------------- Login ---------------- */
  function login() {
    return '<div class="login-page">' +
      '<section class="login-art" data-enter="art">' +
        '<div class="brand"><div class="brand-mark">' + BM.moonMark() + "</div>" +
          '<div><div class="brand-name">BlueMoon</div><span class="brand-caption">QUẢN LÝ CHUNG CƯ</span></div></div>' +
        '<div class="login-pitch">' +
          '<h1>Phần mềm quản lý<br>chung cư BlueMoon</h1>' +
          '<p>Quản lý hộ khẩu, nhân khẩu và các khoản thu phí tại một nơi. Dùng được sau khi đăng nhập vào hệ thống.</p>' +
          '<div class="login-feats">' +
            '<span>' + I("check", 15) + "Quản lý hộ gia đình</span>" +
            '<span>' + I("check", 15) + "Theo dõi khoản thu</span>" +
            '<span>' + I("check", 15) + "Thống kê trực quan</span>" +
          "</div></div>" +
        '<div class="foot-note">BlueMoon Apartment, Ngã tư Văn Phú, Đưa vào sử dụng 2023</div>' +
      "</section>" +
      '<section class="login-panel"><div class="login-box">' +
        '<h2>Đăng nhập</h2>' +
        '<p class="lead">Dùng tài khoản do Ban quản trị cung cấp.</p>' +
        '<form id="login-form" novalidate>' +
          '<div class="field"><label for="lg-user">Tên đăng nhập</label>' +
            '<input id="lg-user" name="username" autocomplete="username" placeholder="Nhập tên đăng nhập" required></div>' +
          '<div class="field"><label for="lg-pass">Mật khẩu</label>' +
            '<input id="lg-pass" name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" required></div>' +
          '<button type="submit" class="btn btn-primary btn-block">' + I("logout", 16) + "Đăng nhập</button>" +
        "</form>" +
        '<div id="login-msg"></div>' +
        '<button type="button" class="btn btn-quiet btn-block" data-action="register" style="margin-top:10px">Chưa có tài khoản? Đăng ký</button>' +
        '<div class="login-hint"><strong>Tài khoản dùng thử:</strong> admin / 123456 hoặc ketoan / 123456.<br>' +
          "Dữ liệu được lấy từ máy chủ backend nếu có; ngược lại dùng dữ liệu mẫu." +
        "</div>" +
      "</div></section></div>";
  }

  /* ---------------- Dashboard ---------------- */
  function dashboard() {
    const d = BM.state.data;
    const households = d.households.length;
    const residents = d.residents.length;
    const monthFees = d.fees.filter(function (x) { return x.billingMonth === 10 && x.billingYear === 2026; });
    const monthIds = monthFees.map(function (x) { return x.id; });
    const monthPayments = d.payments.filter(function (x) { return monthIds.indexOf(x.feeId) !== -1; });
    const due = monthPayments.reduce(function (s, x) { return s + Number(x.amountDue || 0); }, 0);
    const paid = monthPayments.reduce(function (s, x) { return s + Number(x.amountPaid || 0); }, 0);
    const pct = due ? Math.round(paid / due * 100) : 0;
    const unpaid = due - paid;

    const recent = d.payments.filter(function (x) { return x.paymentDate; })
      .sort(function (a, b) { return String(b.paymentDate).localeCompare(String(a.paymentDate)); }).slice(0, 5);

    const lk = u.lookups(d);
    const byType = {};
    d.fees.forEach(function (fee) {
      const key = fee.feeType;
      const rows = d.payments.filter(function (p) { return p.feeId === fee.id; });
      byType[key] = (byType[key] || 0) + rows.reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
    });
    const typeColors = { SERVICE: "#5B86E5", MANAGEMENT: "#E3B165", CONTRIBUTION: "#2F9E78", PARKING: "#7C6FE8", UTILITY: "#4BA6A6" };
    const totalType = Object.values(byType).reduce(function (s, v) { return s + v; }, 0) || 1;
    const segments = Object.keys(byType).map(function (k) {
      return { color: typeColors[k] || "#94A3B8", value: Math.round(byType[k] / totalType * 360) };
    }).filter(function (s) { return s.value > 0; });

    return head("Tổng quan", "Tình hình thu phí và hộ gia đình tháng 10/2026", "") +
      '<div class="grid grid-hero" style="margin-bottom:18px">' +
        '<section class="hero" data-enter>' +
          '<div class="hero-copy">' +
            '<div class="hero-eyebrow">' + I("moon", 14) + " Báo cáo tháng 10/2026</div>" +
            '<h2 class="hero-title">Tình hình thu phí<br>tháng 10/2026</h2>' +
            '<p class="hero-text">' + monthPayments.filter(function (p) { return p.status === "PAID"; }).length + ' phiếu đã nộp. Đã thu ' +
              u.money(paid) + ' trong tổng số ' + u.money(due) + '.</p>' +
            '<div class="hero-actions">' +
              '<button class="btn btn-gold" data-action="go" data-route="payments">' + I("wallet", 16) + "Thu phí</button>" +
              '<button class="btn btn-ghost" data-action="go" data-route="fees">' + I("plus", 16) + "Tạo khoản thu</button>" +
            "</div></div>" +
          '<div class="ring-wrap"><div class="ring" style="--pct:' + pct + '">' +
            '<div class="ring-inner"><div class="ring-num" data-pct="' + pct + '">0<small>%</small></div>' +
            '<div class="ring-label">Tỷ lệ thu</div></div>' +
            '<div class="ring-caption">' + monthPayments.filter(function (p) { return p.status === "PAID"; }).length +
              "/" + monthPayments.length + " phiếu đã nộp</div></div></div>" +
        "</section>" +
        '<div class="grid" style="grid-template-columns:1fr;gap:14px">' +
          '<div class="stat"><div class="stat-icon blue">' + I("home", 19) + '</div><div><div class="stat-label">Hộ gia đình</div>' +
            '<div class="stat-value tabular">' + households + '</div><div class="stat-note up">Tất cả đang hoạt động</div></div></div>' +
          '<div class="stat"><div class="stat-icon gold">' + I("users", 19) + '</div><div><div class="stat-label">Nhân khẩu</div>' +
            '<div class="stat-value tabular">' + residents + '</div><div class="stat-note">Trên ' + households + " hộ gia đình</div></div></div>" +
          '<div class="stat"><div class="stat-icon green">' + I("checkCircle", 19) + '</div><div><div class="stat-label">Đã thu tháng này</div>' +
            '<div class="stat-value tabular" style="font-size:17px">' + u.money(paid) + '</div><div class="stat-note up">Tỷ lệ ' + pct + "%</div></div></div>" +
          '<div class="stat"><div class="stat-icon red">' + I("clock", 19) + '</div><div><div class="stat-label">Còn phải thu</div>' +
            '<div class="stat-value tabular" style="font-size:17px">' + u.money(unpaid) + '</div><div class="stat-note down">Cần nhắc nhở các hộ</div></div></div>' +
        "</div></div>" +
      '<div class="grid grid-2">' +
        '<section class="card"><div class="card-head"><div><h3>Tiến độ theo khoản thu</h3><p>Tháng 10/2026, tổng phải thu và đã thu</p></div>' +
          '<button class="mini-btn" data-action="go" data-route="fees">Xem tất cả</button></div>' +
          '<div class="card-body">' + feeProgress(monthFees) + "</div></section>" +
        '<section class="card"><div class="card-head"><div><h3>Cơ cấu nguồn thu</h3><p>Theo loại khoản thu</p></div></div>' +
          '<div class="card-body" style="display:flex;gap:24px;align-items:center;justify-content:center">' +
            donut(segments, u.num(Math.round(totalType / 1000000)) + "tr", "Tổng thu") +
            '<div class="donut-legend" style="flex:1">' +
              Object.keys(byType).map(function (k) {
                const label = (u.FEE_TYPE[k] || [k])[0];
                return '<div class="legend-item"><span class="legend-dot" style="background:' + (typeColors[k] || "#94A3B8") + '"></span>' +
                  esc(label) + '<span class="legend-val">' + u.num(Math.round(byType[k] / 1000)) + "k</span></div>";
              }).join("") +
            "</div></div></section>" +
      "</div>" +
      '<section class="card" style="margin-top:18px"><div class="card-head"><div><h3>Phiếu thu gần đây</h3>' +
        "<p>Các giao dịch mới nhất được ghi nhận</p></div>" +
        '<button class="mini-btn" data-action="go" data-route="payments">Xem danh sách</button></div>' +
        '<div class="card-body" style="padding-top:6px;padding-bottom:6px">' +
          recent.map(function (p) {
            const h = lk.household(p.householdId), fee = lk.fee(p.feeId);
            return '<div class="list-row"><span class="dot" style="background:' +
              (p.status === "PAID" ? "var(--success)" : p.status === "PARTIAL" ? "var(--gold)" : "var(--danger)") + '"></span>' +
              '<div><div class="lr-main">' + esc(h ? h.ownerName : "—") + '</div>' +
              '<div class="lr-sub">' + esc(fee ? fee.name : "—") + ", " + u.datetime(p.paymentDate) + "</div></div>" +
              '<div class="lr-val">' + u.money(p.amountPaid) + "</div></div>";
          }).join("") +
        "</div></section>";
  }

  function feeProgress(fees) {
    if (!fees.length) return u.empty("Chưa có khoản thu", "Tạo khoản thu để bắt đầu theo dõi.");
    return fees.map(function (fee) {
      const rows = BM.state.data.payments.filter(function (p) { return p.feeId === fee.id; });
      const due = rows.reduce(function (s, p) { return s + Number(p.amountDue || 0); }, 0);
      const paid = rows.reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
      const pct = due ? Math.round(paid / due * 100) : 0;
      return '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:6px">' +
        '<span style="font-size:12.5px;font-weight:600">' + esc(fee.name.replace(" tháng", ", Tháng")) + "</span>" +
        '<span class="tabular" style="font-size:12px;color:var(--text-muted)">' + pct + "%</span></div>" +
        '<div class="progress-line"><span style="width:' + pct + "%\"></span></div>" +
        '<div style="font-size:12px;color:var(--text-faint);margin-top:4px">' + u.money(paid) + " / " + u.money(due) + "</div></div>";
    }).join("");
  }

  /* ---------------- Households ---------------- */
  function households() {
    const d = BM.state.data;
    const term = q("households"), status = f("households", "");
    const rows = d.households.filter(function (h) {
      return (!status || h.status === status) &&
        (!term || match(h.ownerName, term) || match(h.householdCode, term) || match(h.apartmentNumber, term) || match(h.phone, term));
    });
    return head("Hộ gia đình", "Danh sách hộ khẩu và căn hộ đang quản lý",
      '<button class="btn btn-primary" data-action="household-add">' + I("plus", 16) + "Thêm hộ gia đình</button>") +
      '<section class="card">' +
      toolbar("households", "Tìm chủ hộ, mã hộ, căn hộ…",
        selectFilter("households", [["", "Tất cả trạng thái"], ["ACTIVE", "Đang hoạt động"], ["MOVED_OUT", "Đã chuyển đi"]], status)) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Hộ gia đình</th><th>Căn hộ</th><th>Tầng</th><th class=\"num\">Diện tích</th><th>Chủ hộ</th><th>Điện thoại</th>" +
        '<th class="num">Nhân khẩu</th><th>Trạng thái</th><th class="num">Thao tác</th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (h) {
          const count = d.residents.filter(function (r) { return r.householdId === h.id; }).length;
          return '<tr data-action="household-view" data-id="' + h.id + '">' +
            '<td><span class="code">' + esc(h.householdCode) + "</span></td>" +
            '<td class="cell-main">' + esc(h.apartmentNumber) + "</td>" +
            "<td>" + esc(h.floor) + "</td>" +
            '<td class="num">' + esc(h.area) + " m²</td>" +
            '<td class="cell-main">' + esc(h.ownerName) + '<div class="cell-sub">' + u.date(h.moveInDate) + ", vào ở</div></td>" +
            "<td>" + esc(h.phone) + "</td>" +
            '<td class="num">' + count + "</td>" +
            "<td>" + u.statusBadge(h.status) + "</td>" +
            '<td><div class="row-actions">' +
              '<button class="mini-btn" data-action="household-view" data-id="' + h.id + '">Xem</button>' +
              '<button class="mini-btn" data-action="household-edit" data-id="' + h.id + '">Sửa</button>' +
            "</div></td></tr>";
        }).join("") : '<tr><td colspan="9">' + u.empty("Không tìm thấy hộ gia đình", "Thử thay đổi từ khóa hoặc bộ lọc.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.households.length) + "</section>";
  }

  /* ---------------- Residents ---------------- */
  function residents() {
    const d = BM.state.data;
    const term = q("residents"), status = f("residents", "");
    const lk = u.lookups(d);
    const rows = d.residents.filter(function (r) {
      const h = lk.household(r.householdId);
      return (!status || r.residenceStatus === status) &&
        (!term || match(r.fullName, term) || match(r.identityCard, term) || match(h && h.ownerName, term) || match(h && h.apartmentNumber, term));
    });
    return head("Nhân khẩu", "Danh sách cư dân đang sinh sống tại BlueMoon",
      '<button class="btn btn-primary" data-action="resident-add">' + I("plus", 16) + "Thêm nhân khẩu</button>") +
      '<section class="card">' +
      toolbar("residents", "Tìm họ tên, CCCD, căn hộ…",
        selectFilter("residents", [["", "Tất cả trạng thái"], ["PERMANENT", "Thường trú"], ["TEMPORARY_RESIDENCE", "Tạm trú"], ["TEMPORARY_ABSENCE", "Tạm vắng"], ["MOVED_OUT", "Đã chuyển đi"]], status)) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Họ và tên</th><th>Căn hộ</th><th>Quan hệ với chủ hộ</th><th>Ngày sinh</th><th>CCCD/CMND</th>" +
        "<th>Trạng thái cư trú</th><th class=\"num\">Thao tác</th></tr></thead><tbody>" +
        (rows.length ? rows.map(function (r) {
          const h = lk.household(r.householdId);
          return '<tr data-action="resident-view" data-id="' + r.id + '">' +
            '<td class="cell-main">' + esc(r.fullName) + '<div class="cell-sub">' + esc(r.occupation || "—") + "</div></td>" +
            "<td>" + esc(h ? h.apartmentNumber : "—") + "</td>" +
            "<td>" + esc(r.relationshipToOwner) + "</td>" +
            "<td>" + u.date(r.dateOfBirth) + "</td>" +
            "<td>" + esc(r.identityCard || "—") + "</td>" +
            "<td>" + u.statusBadge(r.residenceStatus) + "</td>" +
            '<td><div class="row-actions">' +
              '<button class="mini-btn" data-action="resident-view" data-id="' + r.id + '">Xem</button>' +
              '<button class="mini-btn" data-action="resident-edit" data-id="' + r.id + '">Sửa</button>' +
            "</div></td></tr>";
        }).join("") : '<tr><td colspan="7">' + u.empty("Không tìm thấy nhân khẩu", "Thử thay đổi từ khóa hoặc bộ lọc.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.residents.length) + "</section>";
  }

  /* ---------------- Residence changes ---------------- */
  function changes() {
    const d = BM.state.data;
    const term = q("changes"), type = f("changes", "");
    const lk = u.lookups(d);
    const rows = d.residenceChanges.filter(function (c) {
      const r = lk.resident(c.residentId), h = lk.household(c.householdId);
      return (!type || c.changeType === type) &&
        (!term || match(r && r.fullName, term) || match(c.destinationOrOrigin, term) || match(h && h.apartmentNumber, term));
    }).sort(function (a, b) { return String(b.startDate).localeCompare(String(a.startDate)); });
    return head("Biến đổi nhân khẩu", "Theo dõi tạm trú, tạm vắng và biến động cư dân",
      '<button class="btn btn-primary" data-action="change-add">' + I("plus", 16) + "Ghi nhận biến đổi</button>") +
      '<section class="card">' +
      toolbar("changes", "Tìm cư dân, địa chỉ…",
        selectFilter("changes", [["", "Tất cả loại"], ["TEMPORARY_RESIDENCE", "Tạm trú"], ["TEMPORARY_ABSENCE", "Tạm vắng"], ["MOVE_IN", "Chuyển đến"], ["MOVE_OUT", "Chuyển đi"]], type)) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Cư dân</th><th>Căn hộ</th><th>Loại biến đổi</th><th>Từ ngày</th><th>Đến ngày</th><th>Địa chỉ liên quan</th><th>Lý do</th></tr></thead><tbody>" +
        (rows.length ? rows.map(function (c) {
          const r = lk.resident(c.residentId), h = lk.household(c.householdId);
          const meta = u.CHANGE_TYPE[c.changeType] || [c.changeType, "gray"];
          return '<tr>' +
            '<td class="cell-main">' + esc(r ? r.fullName : "—") + "</td>" +
            "<td>" + esc(h ? h.apartmentNumber : "—") + "</td>" +
            "<td>" + u.badge(meta[0], meta[1]) + "</td>" +
            "<td>" + u.date(c.startDate) + "</td><td>" + u.date(c.endDate) + "</td>" +
            "<td>" + esc(c.destinationOrOrigin || "—") + "</td>" +
            '<td class="muted">' + esc(c.reason || "—") + "</td></tr>";
        }).join("") : '<tr><td colspan="7">' + u.empty("Chưa có biến đổi nào", "Các ghi nhận tạm trú, tạm vắng sẽ xuất hiện tại đây.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.residenceChanges.length) + "</section>";
  }

  /* ---------------- Fees ---------------- */
  function fees() {
    const d = BM.state.data;
    const type = f("fees", "");
    const rows = d.fees.filter(function (x) { return !type || x.feeType === type; })
      .sort(function (a, b) { return b.id - a.id; });
    return head("Khoản thu", "Danh mục các khoản phí và đợt đóng góp",
      '<button class="btn btn-primary" data-action="fee-add">' + I("plus", 16) + "Tạo khoản thu</button>") +
      '<section class="card" style="box-shadow:none;background:transparent;border:0;padding:0">' +
      '<div class="table-toolbar" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-card);margin-bottom:18px">' +
        selectFilter("fees", [["", "Tất cả loại phí"], ["SERVICE", "Phí dịch vụ"], ["MANAGEMENT", "Phí quản lý"], ["CONTRIBUTION", "Đóng góp"], ["PARKING", "Gửi xe"], ["UTILITY", "Thu hộ"]], type) +
        '<div style="flex:1"></div><span class="muted" style="font-size:12px">' + rows.length + " khoản đang quản lý</span></div>" +
      '<div class="grid grid-3">' +
        (rows.length ? rows.map(function (fee) {
          const meta = u.FEE_TYPE[fee.feeType] || [fee.feeType, "gray"];
          const pay = d.payments.filter(function (p) { return p.feeId === fee.id; });
          const due = pay.reduce(function (s, p) { return s + Number(p.amountDue || 0); }, 0);
          const collected = pay.reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
          const pct = due ? Math.round(collected / due * 100) : 0;
          return '<article class="card" data-action="go-fee" data-id="' + fee.id + '" style="display:flex;flex-direction:column;min-height:212px">' +
            '<div style="padding:17px 18px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
              '<span class="code">' + esc(fee.feeCode) + "</span>" + u.badge(meta[0], meta[1]) + "</div>" +
            '<div style="padding:12px 18px 0"><h3 style="font-size:15px;font-weight:700;line-height:1.4">' + esc(fee.name) + "</h3>" +
              '<div style="font-size:12px;color:var(--text-faint);margin-top:5px">' +
                (fee.isMandatory ? "Bắt buộc" : "Tự nguyện") + ", " +
                (fee.billingMonth ? "Tháng " + fee.billingMonth + "/" + fee.billingYear : "Năm " + fee.billingYear) +
              "</div></div>" +
            '<div style="padding:14px 18px 0;display:flex;justify-content:space-between;font-size:12px">' +
              '<span class="muted">Đơn giá</span><strong class="tabular">' +
                (fee.unitPrice ? u.money(fee.unitPrice) : "Tùy đóng góp") + "</strong></div>" +
            '<div style="padding:10px 18px 0"><div class="progress-line"><span style="width:' + pct + '%"></span></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-faint);margin-top:5px">' +
                "<span>Đã thu " + pct + "%</span><span>Hạn " + u.date(fee.dueDate) + "</span></div></div>" +
            '<div style="margin-top:auto;padding:14px 18px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:8px">' +
              u.statusBadge(fee.status) +
              '<div class="row-actions">' +
                '<button class="mini-btn accent" data-action="go-fee" data-id="' + fee.id + '">Thu phí</button>' +
                '<button class="mini-btn" data-action="fee-edit" data-id="' + fee.id + '">Sửa</button>' +
              "</div></div></article>";
        }).join("") : '<div style="grid-column:1/-1">' + u.empty("Chưa có khoản thu", "Tạo khoản thu đầu tiên để bắt đầu thu phí.") + "</div>") +
      "</div></section>";
  }

  /* ---------------- Payments ---------------- */
  function payments() {
    const d = BM.state.data;
    const term = q("payments"), status = f("payments", ""), feeFilter = f("payments-fee", "");
    const lk = u.lookups(d);
    const rows = d.payments.filter(function (p) {
      const h = lk.household(p.householdId), fee = lk.fee(p.feeId);
      return (!status || p.status === status) && (!feeFilter || String(p.feeId) === feeFilter) &&
        (!term || match(h && h.ownerName, term) || match(h && h.householdCode, term) || match(fee && fee.name, term));
    });
    const feeOptions = [["", "Tất cả khoản thu"]].concat(d.fees.map(function (x) { return [String(x.id), x.name]; }));
    const totalDue = rows.reduce(function (s, p) { return s + Number(p.amountDue || 0); }, 0);
    const totalPaid = rows.reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
    return head("Thu phí", "Phiếu nộp tiền của các hộ gia đình", "") +
      '<div class="grid grid-3" style="margin-bottom:18px">' +
        '<div class="stat"><div class="stat-icon gold">' + I("wallet", 19) + '</div><div><div class="stat-label">Phải thu</div><div class="stat-value tabular" style="font-size:17px">' + u.money(totalDue) + "</div></div></div>" +
        '<div class="stat"><div class="stat-icon green">' + I("checkCircle", 19) + '</div><div><div class="stat-label">Đã nộp</div><div class="stat-value tabular" style="font-size:17px">' + u.money(totalPaid) + "</div></div></div>" +
        '<div class="stat"><div class="stat-icon red">' + I("clock", 19) + '</div><div><div class="stat-label">Còn thiếu</div><div class="stat-value tabular" style="font-size:17px">' + u.money(totalDue - totalPaid) + "</div></div></div>" +
      "</div>" +
      '<section class="card">' +
      toolbar("payments", "Tìm chủ hộ, mã hộ, khoản thu…",
        selectFilter("payments-fee", feeOptions, feeFilter) +
        selectFilter("payments", [["", "Tất cả trạng thái"], ["UNPAID", "Chưa nộp"], ["PARTIAL", "Nộp một phần"], ["PAID", "Đã nộp"]], status)) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Hộ gia đình</th><th>Khoản thu</th><th class=\"num\">Phải thu</th><th class=\"num\">Đã nộp</th>" +
        "<th>Ngày nộp</th><th>Phương thức</th><th>Trạng thái</th><th class=\"num\">Thao tác</th></tr></thead><tbody>" +
        (rows.length ? rows.map(function (p) {
          const h = lk.household(p.householdId), fee = lk.fee(p.feeId);
          const method = p.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Tiền mặt";
          return '<tr>' +
            '<td class="cell-main">' + esc(h ? h.ownerName : "—") + '<div class="cell-sub">' + esc(h ? h.householdCode : "—") + ", " + esc(h ? h.apartmentNumber : "") + "</div></td>" +
            '<td>' + esc(fee ? fee.name : "—") + "</td>" +
            '<td class="num">' + u.money(p.amountDue) + "</td>" +
            '<td class="num" style="font-weight:600">' + u.money(p.amountPaid) + "</td>" +
            "<td>" + u.date(p.paymentDate) + "</td>" +
            "<td>" + esc(method) + "</td>" +
            "<td>" + u.statusBadge(p.status) + "</td>" +
            '<td><div class="row-actions">' +
              (p.status !== "PAID" ? '<button class="mini-btn accent" data-action="payment-collect" data-id="' + p.id + '">Thu tiền</button>' : "") +
              '<button class="mini-btn" data-action="payment-view" data-id="' + p.id + '">Chi tiết</button>' +
            "</div></td></tr>";
        }).join("") : '<tr><td colspan="8">' + u.empty("Không tìm thấy phiếu thu", "Thử thay đổi từ khóa hoặc bộ lọc.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.payments.length) + "</section>";
  }

  /* ---------------- Vehicles ---------------- */
  function vehicles() {
    const d = BM.state.data;
    const term = q("vehicles");
    const lk = u.lookups(d);
    const rows = d.vehicles.filter(function (v) {
      const h = lk.household(v.householdId);
      return !term || match(v.licensePlate, term) || match(v.brand, term) || match(h && h.ownerName, term);
    });
    return head("Phí gửi xe", "Quản lý phương tiện đăng ký và phí gửi xe hằng tháng",
      '<button class="btn btn-primary" data-action="vehicle-add">' + I("plus", 16) + "Thêm phương tiện</button>") +
      '<div class="grid grid-3" style="margin-bottom:18px">' +
        '<div class="stat"><div class="stat-icon blue">' + I("car", 19) + '</div><div><div class="stat-label">Xe máy</div><div class="stat-value tabular">' +
          d.vehicles.filter(function (v) { return v.vehicleType === "MOTORBIKE"; }).length + '</div><div class="stat-note">70.000đ / xe / tháng</div></div></div>' +
        '<div class="stat"><div class="stat-icon gold">' + I("car", 19) + '</div><div><div class="stat-label">Ô tô</div><div class="stat-value tabular">' +
          d.vehicles.filter(function (v) { return v.vehicleType === "CAR"; }).length + '</div><div class="stat-note">1.200.000đ / xe / tháng</div></div></div>' +
        '<div class="stat"><div class="stat-icon green">' + I("wallet", 19) + '</div><div><div class="stat-label">Phí/tháng</div><div class="stat-value tabular" style="font-size:17px">' +
          u.money(d.vehicles.reduce(function (s, v) { return s + Number(v.monthlyFee || 0); }, 0)) + "</div></div></div>" +
      "</div>" +
      '<section class="card">' + toolbar("vehicles", "Tìm biển số, hiệu xe, chủ hộ…", "") +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Biển số</th><th>Loại xe</th><th>Chủ hộ</th><th>Hiệu xe</th><th class=\"num\">Phí/tháng</th><th>Ngày đăng ký</th><th>Trạng thái</th></tr></thead><tbody>" +
        (rows.length ? rows.map(function (v) {
          const h = lk.household(v.householdId);
          return '<tr><td class="cell-main">' + esc(v.licensePlate) + "</td>" +
            '<td>' + (v.vehicleType === "CAR" ? "Ô tô" : "Xe máy") + "</td>" +
            "<td>" + esc(h ? h.ownerName : "—") + "</td>" +
            "<td>" + esc(v.brand || "—") + "</td>" +
            '<td class="num">' + u.money(v.monthlyFee) + "</td>" +
            "<td>" + u.date(v.registeredDate) + "</td>" +
            "<td>" + u.statusBadge(v.status) + "</td></tr>";
        }).join("") : '<tr><td colspan="7">' + u.empty("Không tìm thấy phương tiện", "Thử thay đổi từ khóa tìm kiếm.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.vehicles.length) + "</section>";
  }

  /* ---------------- Utility bills ---------------- */
  function bills() {
    const d = BM.state.data;
    const term = q("bills"), status = f("bills", "");
    const lk = u.lookups(d);
    const rows = d.utilityBills.filter(function (b) {
      const h = lk.household(b.householdId);
      return (!status || b.paymentStatus === status) &&
        (!term || match(h && h.ownerName, term) || match(b.providerName, term) || match((u.SERVICE_TYPE[b.serviceType] || [])[0], term));
    });
    return head("Thu hộ điện, nước, internet", "Hóa đơn thu hộ theo thông báo của đơn vị cung cấp",
      '<button class="btn btn-primary" data-action="bill-add">' + I("plus", 16) + "Thêm hóa đơn</button>") +
      '<section class="card">' +
      toolbar("bills", "Tìm chủ hộ, nhà cung cấp…",
        selectFilter("bills", [["", "Tất cả trạng thái"], ["UNPAID", "Chưa nộp"], ["PAID", "Đã nộp"]], status)) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Hộ gia đình</th><th>Dịch vụ</th><th>Kỳ</th><th class=\"num\">Chỉ số</th><th class=\"num\">Tiêu thụ</th>" +
        '<th class="num">Thành tiền</th><th>Nhà cung cấp</th><th>Trạng thái</th><th class="num">Thao tác</th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (b) {
          const h = lk.household(b.householdId);
          const meta = u.SERVICE_TYPE[b.serviceType] || [b.serviceType, "gray"];
          return '<tr><td class="cell-main">' + esc(h ? h.ownerName : "—") + '<div class="cell-sub">' + esc(h ? h.apartmentNumber : "") + "</div></td>" +
            "<td>" + u.badge(meta[0], meta[1]) + "</td>" +
            "<td>" + b.billingMonth + "/" + b.billingYear + "</td>" +
            '<td class="num">' + b.previousIndex + " → " + b.currentIndex + "</td>" +
            '<td class="num">' + b.usageAmount + "</td>" +
            '<td class="num" style="font-weight:600">' + u.money(b.totalAmount) + "</td>" +
            "<td>" + esc(b.providerName || "—") + "</td>" +
            "<td>" + u.statusBadge(b.paymentStatus) + "</td>" +
            '<td><div class="row-actions">' +
              (b.paymentStatus !== "PAID" ? '<button class="mini-btn accent" data-action="bill-pay" data-id="' + b.id + '">Đã thu</button>' : "") +
              "</div></td></tr>";
        }).join("") : '<tr><td colspan="9">' + u.empty("Không tìm thấy hóa đơn", "Thử thay đổi từ khóa hoặc bộ lọc.") + "</td></tr>") +
      "</tbody></table></div>" + tableFoot(rows.length, d.utilityBills.length) + "</section>";
  }

  /* ---------------- Statistics ---------------- */
  function statistics() {
    const d = BM.state.data;
    const totalDue = d.payments.reduce(function (s, p) { return s + Number(p.amountDue || 0); }, 0);
    const totalPaid = d.payments.reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
    const rate = totalDue ? Math.round(totalPaid / totalDue * 100) : 0;
    const statuses = { PAID: 0, PARTIAL: 0, UNPAID: 0 };
    d.payments.forEach(function (p) { statuses[p.status] = (statuses[p.status] || 0) + 1; });
    const n = d.payments.length || 1;
    const segs = [
      { color: "#2F9E78", value: Math.round(statuses.PAID / n * 360) },
      { color: "#E3B165", value: Math.round(statuses.PARTIAL / n * 360) },
      { color: "#D96363", value: Math.round(statuses.UNPAID / n * 360) }
    ].filter(function (s) { return s.value > 0; });

    const byType = {};
    d.fees.forEach(function (fee) {
      byType[fee.feeType] = (byType[fee.feeType] || 0) +
        d.payments.filter(function (p) { return p.feeId === fee.id; }).reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0);
    });
    const max = Math.max.apply(null, Object.values(byType).concat([1]));
    const colors = { SERVICE: "#5B86E5", MANAGEMENT: "#E3B165", CONTRIBUTION: "#2F9E78", PARKING: "#7C6FE8", UTILITY: "#4BA6A6" };

    const top = d.households.map(function (h) {
      return { h: h, paid: d.payments.filter(function (p) { return p.householdId === h.id; }).reduce(function (s, p) { return s + Number(p.amountPaid || 0); }, 0) };
    }).sort(function (a, b) { return b.paid - a.paid; }).slice(0, 5);

    return head("Thống kê", "Tổng hợp thu phí theo loại và trạng thái", "") +
      '<div class="grid grid-4" style="margin-bottom:18px">' +
        '<div class="stat"><div class="stat-icon green">' + I("wallet", 19) + '</div><div><div class="stat-label">Tổng đã thu</div><div class="stat-value tabular" style="font-size:17px">' + u.money(totalPaid) + "</div></div></div>" +
        '<div class="stat"><div class="stat-icon blue">' + I("stats", 19) + '</div><div><div class="stat-label">Tỷ lệ thu</div><div class="stat-value tabular">' + rate + '%</div><div class="stat-note">Trên ' + d.payments.length + " phiếu</div></div></div>" +
        '<div class="stat"><div class="stat-icon red">' + I("clock", 19) + '</div><div><div class="stat-label">Còn phải thu</div><div class="stat-value tabular" style="font-size:17px">' + u.money(totalDue - totalPaid) + "</div></div></div>" +
        '<div class="stat"><div class="stat-icon gold">' + I("receipt", 19) + '</div><div><div class="stat-label">Khoản thu</div><div class="stat-value tabular">' + d.fees.length + '</div><div class="stat-note">' + d.fees.filter(function (x) { return x.status === "OPEN"; }).length + " đang mở</div></div></div>" +
      "</div>" +
      '<div class="grid grid-2">' +
        '<section class="card"><div class="card-head"><div><h3>Thu theo loại khoản</h3><p>Tổng số tiền đã nộp</p></div></div>' +
          '<div class="card-body"><div class="bar-chart">' +
            Object.keys(byType).map(function (k) {
              const label = (u.FEE_TYPE[k] || [k])[0];
              return '<div class="bar-col"><div class="bar-stack"><div class="bar" style="height:' +
                Math.max(4, Math.round(byType[k] / max * 150)) + "px;background:linear-gradient(180deg," + (colors[k] || "#94A3B8") + "," + (colors[k] || "#94A3B8") + '88)"></div></div>' +
                '<div class="bar-label">' + esc(label) + "</div></div>";
            }).join("") +
          "</div></div></section>" +
        '<section class="card"><div class="card-head"><div><h3>Trạng thái phiếu thu</h3><p>Phân bổ theo tình trạng nộp tiền</p></div></div>' +
          '<div class="card-body" style="display:flex;gap:26px;align-items:center;justify-content:center">' +
            donut(segs, statuses.PAID + "/" + d.payments.length, "Đã nộp") +
            '<div class="donut-legend" style="flex:1">' +
              '<div class="legend-item"><span class="legend-dot" style="background:#2F9E78"></span>Đã nộp<span class="legend-val">' + statuses.PAID + "</span></div>" +
              '<div class="legend-item"><span class="legend-dot" style="background:#E3B165"></span>Nộp một phần<span class="legend-val">' + statuses.PARTIAL + "</span></div>" +
              '<div class="legend-item"><span class="legend-dot" style="background:#D96363"></span>Chưa nộp<span class="legend-val">' + statuses.UNPAID + "</span></div>" +
            "</div></div></section>" +
      "</div>" +
      '<section class="card" style="margin-top:18px"><div class="card-head"><div><h3>Hộ đóng góp nhiều nhất</h3><p>Xếp theo tổng số tiền đã nộp</p></div></div>' +
        '<div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px">' +
          top.map(function (t, i) {
            return '<div class="list-row"><span class="dot" style="background:' + (i === 0 ? "var(--gold)" : "var(--moon)") + '"></span>' +
              '<div><div class="lr-main">' + esc(t.h.ownerName) + '</div><div class="lr-sub">Căn hộ ' + esc(t.h.apartmentNumber) + "</div></div>" +
              '<div class="lr-val">' + u.money(t.paid) + "</div></div>";
          }).join("") +
        "</div></section>";
  }

  /* ---------------- Account ---------------- */
  function account() {
    const me = BM.state.user;
    const roleMeta = u.STATUS[me.role] || [me.role, "blue"];
    return head("Tài khoản", "Thông tin cá nhân và đổi mật khẩu", "") +
      '<div class="grid grid-2">' +
        '<section class="card"><div class="card-head"><div><h3>Thông tin cá nhân</h3><p>Chỉnh sửa thông tin hiển thị của bạn</p></div>' + u.badge(roleMeta[0], roleMeta[1]) + "</div>" +
          '<form id="profile-form" class="card-body"><div class="form-grid">' +
            '<div class="field full"><label>Tên đăng nhập</label><input value="' + esc(me.username) + '" disabled></div>' +
            '<div class="field full"><label>Họ và tên</label><input name="fullName" value="' + esc(me.fullName) + '" required></div>' +
            '<div class="field"><label>Email</label><input name="email" type="email" value="' + esc(me.email) + '"></div>' +
            '<div class="field"><label>Điện thoại</label><input name="phone" value="' + esc(me.phone) + '"></div>' +
            '<div class="field full"><label>Chức vụ</label><input value="' + esc(roleMeta[0]) + '" disabled></div>' +
          '</div><div style="margin-top:20px;text-align:right"><button type="submit" class="btn btn-primary">Lưu thông tin</button></div></form></section>' +
        '<section class="card"><div class="card-head"><div><h3>Đổi mật khẩu</h3><p>Sử dụng mật khẩu mới để đăng nhập lần sau</p></div></div>' +
          '<form id="password-form" class="card-body"><div class="field"><label>Mật khẩu hiện tại</label><input name="old" type="password" required></div>' +
            '<div class="field" style="margin-top:14px"><label>Mật khẩu mới</label><input name="next" type="password" minlength="6" required></div>' +
            '<div class="field" style="margin-top:14px"><label>Xác nhận mật khẩu mới</label><input name="confirm" type="password" minlength="6" required></div>' +
            '<div style="margin-top:20px;text-align:right"><button type="submit" class="btn btn-ghost">' + I("check", 16) + "Cập nhật mật khẩu</button></div></form></section>" +
      "</div>";
  }

  BM.views = {
    login: login, dashboard: dashboard, households: households, residents: residents,
    changes: changes, fees: fees, payments: payments, vehicles: vehicles,
    bills: bills, statistics: statistics, account: account
  };
})(window.BM = window.BM || {});
