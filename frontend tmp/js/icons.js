/* Minimal inline SVG icon set — no external icon dependency. */
(function (BM) {
  "use strict";

  const P = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    stats: '<path d="M4 20V10m5 10V4m5 16v-7m5 7V8"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.5c2.1.6 3.5 2.3 3.5 5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4 3.4-6 7.5-6s7.5 2 7.5 6"/>',
    swap: '<path d="M4 8h13m-3-3 3 3-3 3"/><path d="M20 16H7m3-3-3 3 3 3"/>',
    wallet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5.5A2.5 2.5 0 0 1 3 17.5z"/><path d="M16 12h4v4h-4a2 2 0 0 1 0-4z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    car: '<path d="M5 16v2m14-2v2"/><path d="M4 16h16v-4l-2-5H6l-2 5z"/><path d="M7 16v-3h10v3"/><circle cx="8" cy="16.5" r="1"/><circle cx="16" cy="16.5" r="1"/>',
    bolt: '<path d="M13 2 5 13h6l-1 9 8-11h-6z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.1 2.1-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21h-3v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2.1-2.1.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3v-3h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2.1-2.1.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3h3v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2.1 2.1-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21v3h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M15 8l4 4-4 4m4-4H9"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M18 16H6l1.5-3V9a4.5 4.5 0 0 1 9 0v4z"/><path d="M10 19h4"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.8 2.8L16 9.5"/>',
    alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v5m0 3h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    eye: '<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.7"/>',
    up: '<path d="m12 19V5m-5 5 5-5 5 5"/>',
    down: '<path d="m12 5v14m-5-5 5 5 5-5"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>',
    filter: '<path d="M3 5h18l-7 8v5l-4 2v-7z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    print: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v6H7z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.2"/>'
  };

  function icon(name, size) {
    const body = P[name] || P.info;
    const s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  function moonMark() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="#E3B165"/>' +
      '<circle cx="17.5" cy="5.5" r="1" fill="#E3B165" opacity=".7"/>' +
      '<circle cx="20.5" cy="9" r=".7" fill="#E3B165" opacity=".55"/>' +
      '</svg>';
  }

  BM.icon = icon;
  BM.moonMark = moonMark;
})(window.BM = window.BM || {});
