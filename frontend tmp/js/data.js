/* Domain data: mirrors database/init_database.sql, with a few extra demo rows.
   The backend is read-only for now, so writes stay in localStorage. */
(function (BM) {
  "use strict";

  // Same-origin by default: works when Spring Boot serves these static files.
  // Use ?api=1 or window.BM_CONFIG.apiBase when the backend runs elsewhere.
  const API_BASE = (window.BM_CONFIG && window.BM_CONFIG.apiBase) || "/api";
  function apiEnabled() {
    const cfg = window.BM_CONFIG || {};
    if (cfg.apiBase) return true;
    if (/[?&]api=1\b/.test(location.search)) return true;
    return location.port === "8080";
  }
  const ENDPOINTS = {
    households: "/households",
    residents: "/residents",
    residenceChanges: "/residence-changes",
    fees: "/fees",
    payments: "/payments",
    vehicles: "/vehicles",
    utilityBills: "/utility-bills"
  };

  // Demo accounts — backend has no auth endpoint yet, so login is client-side.
  const USERS = [
    { id: 1, username: "admin", password: "123456", fullName: "Nguyễn Văn Quản Lý", email: "admin@bluemoon.vn", phone: "0901234567", role: "ADMIN", status: "ACTIVE" },
    { id: 2, username: "ketoan", password: "123456", fullName: "Trần Thị Thu Ngân", email: "ketoan@bluemoon.vn", phone: "0912345678", role: "ACCOUNTANT", status: "ACTIVE" }
  ];

  function seed() {
    return {
      households: [
        { id: 1, householdCode: "BM-0601", apartmentNumber: "601", floor: 6, area: 75.5, ownerName: "Phạm Văn Thái", phone: "0981112233", moveInDate: "2023-05-10", status: "ACTIVE" },
        { id: 2, householdCode: "BM-1002", apartmentNumber: "1002", floor: 10, area: 92, ownerName: "Hồ Tú Toàn", phone: "0982223344", moveInDate: "2023-06-15", status: "ACTIVE" },
        { id: 3, householdCode: "BM-1504", apartmentNumber: "1504", floor: 15, area: 110, ownerName: "Vũ Kim Thu", phone: "0983334455", moveInDate: "2024-01-20", status: "ACTIVE" },
        { id: 4, householdCode: "BM-K101", apartmentNumber: "Kiot 01", floor: 1, area: 60, ownerName: "Ngô Quang Minh", phone: "0984445566", moveInDate: "2023-04-01", status: "ACTIVE" },
        { id: 5, householdCode: "BM-2001", apartmentNumber: "2001", floor: 20, area: 85, ownerName: "Trần Đức Minh", phone: "0985556677", moveInDate: "2024-03-12", status: "ACTIVE" },
        { id: 6, householdCode: "BM-2203", apartmentNumber: "2203", floor: 22, area: 68, ownerName: "Đặng Thu Trang", phone: "0986667788", moveInDate: "2024-07-01", status: "ACTIVE" },
        { id: 7, householdCode: "BM-2505", apartmentNumber: "2505", floor: 25, area: 95.5, ownerName: "Bùi Văn Hùng", phone: "0987778899", moveInDate: "2025-01-15", status: "ACTIVE" },
        { id: 8, householdCode: "BM-2802", apartmentNumber: "2802", floor: 28, area: 120, ownerName: "Hoàng Ngọc Anh", phone: "0988889900", moveInDate: "2025-02-20", status: "ACTIVE" }
      ],
      residents: [
        { id: 1, householdId: 1, fullName: "Phạm Văn Thái", dateOfBirth: "1985-03-12", gender: "MALE", identityCard: "001085012345", relationshipToOwner: "Chủ hộ", occupation: "Kỹ sư xây dựng", hometown: "Hà Nội", residenceStatus: "PERMANENT", note: "" },
        { id: 2, householdId: 1, fullName: "Nguyễn Thị Lan", dateOfBirth: "1988-07-24", gender: "FEMALE", identityCard: "001188054321", relationshipToOwner: "Vợ", occupation: "Giáo viên", hometown: "Nam Định", residenceStatus: "PERMANENT", note: "" },
        { id: 3, householdId: 1, fullName: "Phạm Minh Khôi", dateOfBirth: "2016-09-05", gender: "MALE", identityCard: "", relationshipToOwner: "Con", occupation: "Học sinh", hometown: "Hà Nội", residenceStatus: "PERMANENT", note: "" },
        { id: 4, householdId: 2, fullName: "Hồ Tú Toàn", dateOfBirth: "1979-11-18", gender: "MALE", identityCard: "001079098765", relationshipToOwner: "Chủ hộ", occupation: "Kinh doanh", hometown: "Nghệ An", residenceStatus: "PERMANENT", note: "" },
        { id: 5, householdId: 2, fullName: "Lê Thu Hà", dateOfBirth: "1982-02-14", gender: "FEMALE", identityCard: "001182067890", relationshipToOwner: "Vợ", occupation: "Kế toán", hometown: "Hà Nội", residenceStatus: "TEMPORARY_ABSENCE", note: "" },
        { id: 6, householdId: 3, fullName: "Vũ Kim Thu", dateOfBirth: "1992-08-30", gender: "FEMALE", identityCard: "001192011223", relationshipToOwner: "Chủ hộ", occupation: "Nhân viên văn phòng", hometown: "Hải Phòng", residenceStatus: "PERMANENT", note: "" },
        { id: 7, householdId: 3, fullName: "Vũ Đức Anh", dateOfBirth: "2018-04-21", gender: "MALE", identityCard: "", relationshipToOwner: "Con", occupation: "Học sinh", hometown: "Hải Phòng", residenceStatus: "PERMANENT", note: "" },
        { id: 8, householdId: 4, fullName: "Ngô Quang Minh", dateOfBirth: "1990-05-02", gender: "MALE", identityCard: "001090033445", relationshipToOwner: "Chủ hộ", occupation: "Chủ cửa hàng", hometown: "Hà Nội", residenceStatus: "TEMPORARY_RESIDENCE", note: "" },
        { id: 9, householdId: 5, fullName: "Trần Đức Minh", dateOfBirth: "1987-01-09", gender: "MALE", identityCard: "001087011234", relationshipToOwner: "Chủ hộ", occupation: "Bác sĩ", hometown: "Thái Bình", residenceStatus: "PERMANENT", note: "" },
        { id: 10, householdId: 5, fullName: "Phạm Thị Hoa", dateOfBirth: "1990-06-17", gender: "FEMALE", identityCard: "001190065432", relationshipToOwner: "Vợ", occupation: "Dược sĩ", hometown: "Hà Nội", residenceStatus: "PERMANENT", note: "" },
        { id: 11, householdId: 6, fullName: "Đặng Thu Trang", dateOfBirth: "1994-12-03", gender: "FEMALE", identityCard: "001194099887", relationshipToOwner: "Chủ hộ", occupation: "Thiết kế nội thất", hometown: "Hà Nội", residenceStatus: "PERMANENT", note: "" },
        { id: 12, householdId: 7, fullName: "Bùi Văn Hùng", dateOfBirth: "1983-09-28", gender: "MALE", identityCard: "001083077665", relationshipToOwner: "Chủ hộ", occupation: "Kỹ sư IT", hometown: "Hà Nam", residenceStatus: "PERMANENT", note: "" },
        { id: 13, householdId: 8, fullName: "Hoàng Ngọc Anh", dateOfBirth: "1981-02-14", gender: "MALE", identityCard: "001081055443", relationshipToOwner: "Chủ hộ", occupation: "Doanh nhân", hometown: "Hà Nội", residenceStatus: "PERMANENT", note: "" }
      ],
      residenceChanges: [
        { id: 1, residentId: 5, householdId: 2, changeType: "TEMPORARY_ABSENCE", startDate: "2026-10-01", endDate: "2026-12-31", destinationOrOrigin: "TP. Hồ Chí Minh", reason: "Đi công tác dài hạn", createdBy: 1 },
        { id: 2, residentId: 8, householdId: 4, changeType: "TEMPORARY_RESIDENCE", startDate: "2026-09-15", endDate: "2027-09-15", destinationOrOrigin: "Thanh Xuân, Hà Nội", reason: "Thuê kiot kinh doanh và sinh sống", createdBy: 1 },
        { id: 3, residentId: 12, householdId: 7, changeType: "MOVE_IN", startDate: "2025-01-15", endDate: null, destinationOrOrigin: "Hà Nam", reason: "Chuyển đến sinh sống tại BlueMoon", createdBy: 1 }
      ],
      fees: [
        { id: 1, feeCode: "DV-2026-10", name: "Phí dịch vụ chung cư tháng 10/2026", feeType: "SERVICE", isMandatory: true, calculationMethod: "PER_AREA", unitPrice: 5000, billingMonth: 10, billingYear: 2026, startDate: "2026-10-01", dueDate: "2026-10-15", description: "Phí vệ sinh, bảo dưỡng cảnh quan và an ninh chung cư", status: "OPEN" },
        { id: 2, feeCode: "QL-2026-10", name: "Phí quản lý chung cư tháng 10/2026", feeType: "MANAGEMENT", isMandatory: true, calculationMethod: "PER_AREA", unitPrice: 7000, billingMonth: 10, billingYear: 2026, startDate: "2026-10-01", dueDate: "2026-10-15", description: "Phí quản lý vận hành chung cư BlueMoon", status: "OPEN" },
        { id: 3, feeCode: "QUY-NGHEO-2026", name: "Quỹ vì người nghèo năm 2026", feeType: "CONTRIBUTION", isMandatory: false, calculationMethod: "VOLUNTARY", unitPrice: 0, billingMonth: null, billingYear: 2026, startDate: "2026-10-01", dueDate: "2026-10-30", description: "Khoản đóng góp tự nguyện phối hợp cùng tổ dân phố", status: "OPEN" },
        { id: 4, feeCode: "QUY-BIENDAO-2026", name: "Quỹ vì biển đảo Việt Nam 2026", feeType: "CONTRIBUTION", isMandatory: false, calculationMethod: "VOLUNTARY", unitPrice: 0, billingMonth: null, billingYear: 2026, startDate: "2026-10-01", dueDate: "2026-10-30", description: "Khoản đóng góp tự nguyện ủng hộ biển đảo", status: "OPEN" },
        { id: 5, feeCode: "DV-2026-11", name: "Phí dịch vụ chung cư tháng 11/2026", feeType: "SERVICE", isMandatory: true, calculationMethod: "PER_AREA", unitPrice: 5000, billingMonth: 11, billingYear: 2026, startDate: "2026-11-01", dueDate: "2026-11-15", description: "Phí vệ sinh, bảo dưỡng cảnh quan và an ninh chung cư", status: "OPEN" },
        { id: 6, feeCode: "QL-2026-11", name: "Phí quản lý chung cư tháng 11/2026", feeType: "MANAGEMENT", isMandatory: true, calculationMethod: "PER_AREA", unitPrice: 7000, billingMonth: 11, billingYear: 2026, startDate: "2026-11-01", dueDate: "2026-11-15", description: "Phí quản lý vận hành chung cư BlueMoon", status: "OPEN" }
      ],
      payments: [
        { id: 1, householdId: 1, feeId: 1, amountDue: 377500, amountPaid: 377500, paymentDate: "2026-10-05T09:30:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "75,5m² × 5.000đ" },
        { id: 2, householdId: 1, feeId: 2, amountDue: 528500, amountPaid: 528500, paymentDate: "2026-10-05T09:30:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "75,5m² × 7.000đ" },
        { id: 3, householdId: 1, feeId: 3, amountDue: 0, amountPaid: 100000, paymentDate: "2026-10-06T14:15:00", paymentMethod: "CASH", status: "PAID", collectedBy: 2, note: "Hộ gia đình tự nguyện đóng góp" },
        { id: 4, householdId: 2, feeId: 1, amountDue: 460000, amountPaid: 0, paymentDate: null, paymentMethod: "CASH", status: "UNPAID", collectedBy: null, note: "Chưa thanh toán phí dịch vụ tháng 10/2026" },
        { id: 5, householdId: 2, feeId: 2, amountDue: 644000, amountPaid: 644000, paymentDate: "2026-10-08T10:00:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "92m² × 7.000đ" },
        { id: 6, householdId: 3, feeId: 1, amountDue: 550000, amountPaid: 550000, paymentDate: "2026-10-09T11:20:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "110m² × 5.000đ" },
        { id: 7, householdId: 3, feeId: 2, amountDue: 770000, amountPaid: 385000, paymentDate: "2026-10-09T11:25:00", paymentMethod: "CASH", status: "PARTIAL", collectedBy: 2, note: "Đóng một phần, sẽ thu nốt cuối tháng" },
        { id: 8, householdId: 4, feeId: 1, amountDue: 300000, amountPaid: 300000, paymentDate: "2026-10-04T08:45:00", paymentMethod: "CASH", status: "PAID", collectedBy: 2, note: "" },
        { id: 9, householdId: 5, feeId: 1, amountDue: 425000, amountPaid: 0, paymentDate: null, paymentMethod: "CASH", status: "UNPAID", collectedBy: null, note: "" },
        { id: 10, householdId: 5, feeId: 2, amountDue: 595000, amountPaid: 595000, paymentDate: "2026-10-11T15:00:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "" },
        { id: 11, householdId: 6, feeId: 1, amountDue: 340000, amountPaid: 340000, paymentDate: "2026-10-07T09:00:00", paymentMethod: "CASH", status: "PAID", collectedBy: 2, note: "" },
        { id: 12, householdId: 7, feeId: 1, amountDue: 477500, amountPaid: 0, paymentDate: null, paymentMethod: "CASH", status: "UNPAID", collectedBy: null, note: "" },
        { id: 13, householdId: 8, feeId: 1, amountDue: 600000, amountPaid: 600000, paymentDate: "2026-10-03T16:30:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "" },
        { id: 14, householdId: 8, feeId: 2, amountDue: 840000, amountPaid: 840000, paymentDate: "2026-10-03T16:30:00", paymentMethod: "BANK_TRANSFER", status: "PAID", collectedBy: 2, note: "" }
      ],
      vehicles: [
        { id: 1, householdId: 1, vehicleType: "MOTORBIKE", licensePlate: "29E1-123.45", brand: "Honda Vision", monthlyFee: 70000, registeredDate: "2024-01-10", status: "ACTIVE", note: "Gửi hầm B1" },
        { id: 2, householdId: 2, vehicleType: "CAR", licensePlate: "30A-678.90", brand: "Toyota Vios", monthlyFee: 1200000, registeredDate: "2024-03-01", status: "ACTIVE", note: "Gửi hầm B2" },
        { id: 3, householdId: 3, vehicleType: "MOTORBIKE", licensePlate: "29E2-456.78", brand: "Yamaha Grande", monthlyFee: 70000, registeredDate: "2024-06-20", status: "ACTIVE", note: "" },
        { id: 4, householdId: 5, vehicleType: "MOTORBIKE", licensePlate: "29A3-111.22", brand: "Honda Air Blade", monthlyFee: 70000, registeredDate: "2025-02-11", status: "ACTIVE", note: "" },
        { id: 5, householdId: 8, vehicleType: "CAR", licensePlate: "30A-999.88", brand: "Honda CR-V", monthlyFee: 1200000, registeredDate: "2025-03-05", status: "ACTIVE", note: "Chỗ đỗ riêng" }
      ],
      utilityBills: [
        { id: 1, householdId: 1, feeId: null, serviceType: "ELECTRICITY", billingMonth: 10, billingYear: 2026, previousIndex: 1250, currentIndex: 1430, usageAmount: 180, totalAmount: 450000, providerName: "EVN Hà Nội", paymentStatus: "PAID", paidAt: "2026-10-12T10:00:00", note: "Thu hộ tiền điện tháng 10/2026" },
        { id: 2, householdId: 1, feeId: null, serviceType: "WATER", billingMonth: 10, billingYear: 2026, previousIndex: 310, currentIndex: 325, usageAmount: 15, totalAmount: 135000, providerName: "Nước sạch Hà Đông", paymentStatus: "UNPAID", paidAt: null, note: "Thu hộ tiền nước tháng 10/2026" },
        { id: 3, householdId: 2, feeId: null, serviceType: "INTERNET", billingMonth: 10, billingYear: 2026, previousIndex: 0, currentIndex: 0, usageAmount: 1, totalAmount: 220000, providerName: "VNPT", paymentStatus: "UNPAID", paidAt: null, note: "Gói cước cố định hàng tháng" },
        { id: 4, householdId: 3, feeId: null, serviceType: "ELECTRICITY", billingMonth: 10, billingYear: 2026, previousIndex: 890, currentIndex: 1040, usageAmount: 150, totalAmount: 375000, providerName: "EVN Hà Nội", paymentStatus: "PAID", paidAt: "2026-10-14T09:15:00", note: "" },
        { id: 5, householdId: 5, feeId: null, serviceType: "WATER", billingMonth: 10, billingYear: 2026, previousIndex: 220, currentIndex: 239, usageAmount: 19, totalAmount: 171000, providerName: "Nước sạch Hà Đông", paymentStatus: "UNPAID", paidAt: null, note: "" }
      ]
    };
  }

  function users() {
    return USERS.map(function (u) { return Object.assign({}, u); });
  }

  // Try the live API; fall back to seeded data when the backend is offline.
  async function load() {
    const fallback = seed();
    if (!apiEnabled()) return { data: fallback, source: "demo" };
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 1500);
    try {
      const entries = Object.keys(ENDPOINTS);
      const results = await Promise.all(entries.map(function (key) {
        return fetch(API_BASE + ENDPOINTS[key], { signal: controller.signal })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); });
      }));
      clearTimeout(timer);
      const data = {};
      entries.forEach(function (key, i) {
        data[key] = Array.isArray(results[i]) ? results[i] : fallback[key];
      });
      if (!data.households.length) return { data: fallback, source: "demo" };
      return { data: data, source: "api" };
    } catch (err) {
      clearTimeout(timer);
      return { data: fallback, source: "demo" };
    }
  }

  BM.data = { seed: seed, users: users, load: load, API_BASE: API_BASE };
})(window.BM = window.BM || {});
