(function () {
  'use strict';

    var PALACE_META_HADO = {
    1:{direction:'Bắc',      trigram:'Khảm', element:'Thủy', color:'#2563eb', rgb:'37,99,235'},
    2:{direction:'Đông Nam', trigram:'Khôn', element:'Thổ',  color:'#a16207', rgb:'161,98,7'},
    3:{direction:'Đông',     trigram:'Chấn', element:'Mộc',  color:'#2f855a', rgb:'47,133,90'},
    4:{direction:'Tây Nam',  trigram:'Tốn',  element:'Kim',  color:'#7c8fa0', rgb:'124,143,160'},
    5:{direction:'Trung',    trigram:'',     element:'Thổ',  color:'#7c6f64', rgb:'124,111,100'},
    6:{direction:'Tây Bắc',  trigram:'Kiền', element:'Kim',  color:'#64748b', rgb:'100,116,139'},
    7:{direction:'Nam',      trigram:'Ly',   element:'Hỏa',  color:'#c2410c', rgb:'194,65,12'},
    8:{direction:'Đông Bắc', trigram:'Cấn',  element:'Mộc',  color:'#2f855a', rgb:'47,133,90'},
    9:{direction:'Tây',      trigram:'Đoài', element:'Kim',  color:'#6b7280', rgb:'107,114,128'}
  };

  var PALACE_META_LACTHU = {
    1:{direction:'Bắc',      trigram:'Khảm', element:'Thủy', color:'#2563eb', rgb:'37,99,235'},
    2:{direction:'Tây Nam',  trigram:'Khôn', element:'Thổ',  color:'#a16207', rgb:'161,98,7'},
    3:{direction:'Đông',     trigram:'Chấn', element:'Mộc',  color:'#2f855a', rgb:'47,133,90'},
    4:{direction:'Đông Nam', trigram:'Tốn',  element:'Mộc',  color:'#3f8f63', rgb:'63,143,99'},
    5:{direction:'Trung',    trigram:'',     element:'Thổ',  color:'#7c6f64', rgb:'124,111,100'},
    6:{direction:'Tây Bắc',  trigram:'Kiền', element:'Kim',  color:'#64748b', rgb:'100,116,139'},
    7:{direction:'Tây',      trigram:'Đoài', element:'Kim',  color:'#6b7280', rgb:'107,114,128'},
    8:{direction:'Đông Bắc', trigram:'Cấn',  element:'Thổ',  color:'#a1743b', rgb:'161,116,59'},
    9:{direction:'Nam',      trigram:'Ly',   element:'Hỏa',  color:'#c2410c', rgb:'194,65,12'}
  };

  var ORDER_HADO   = [2,7,4, 3,5,9, 8,1,6];
  var ORDER_LACTHU = [4,9,2, 3,5,7, 8,1,6];

  // Màu chữ theo cung số - 5 nhóm ngũ hành theo yêu cầu người dùng, áp dụng chung cho cả Hà Đồ và Lạc Thư
  // vì số cung không đổi giữa hai hệ (chỉ hướng/quái đổi chỗ):
  //   1,6 Tây Bắc Kiền/Bắc Khảm - Khai/Hưu      : xanh dương (Thủy)
  //   2,7 Đông Nam Khôn/Nam Ly  - Đỗ/Cảnh       : đỏ (Hỏa)
  //   3,8 Đông Bắc Cấn/Đông Chấn - Sinh/Thương  : xanh lá (Mộc)
  //   4,9 Tây Nam Tốn/Tây Đoài  - Tử/Kinh       : xám kim (Kim)
  //   5   Trung                                  : vàng nâu (Thổ)
  var POS_TEXT_COLOR = {
    1: '#2f5fa0', 6: '#2f5fa0',   // Thủy - xanh dương trầm
    2: '#c14621', 7: '#c14621',   // Hỏa - đỏ cam trầm
    3: '#1f7a4d', 8: '#1f7a4d',   // Mộc - xanh lá rừng
    4: '#8c8690', 9: '#8c8690',   // Kim - xám ánh kim
    5: '#ad8a52'                   // Thổ - vàng đồng
  };

  // Trạng thái vượng suy: gồm cả 12 giai đoạn Trường Sinh và 5 trạng thái theo nguyệt lệnh
  // (Vượng/Tướng/Hưu/Tù/Tử) mà engine đang trả về cho sao.
  var VUONG_STRONG = ['Đế Vượng','Trường Sinh','Lâm Quan','Mộc Dục','Quan Đới','Vượng','Tướng'];
  var VUONG_WEAK   = ['Tử','Mộ','Tuyệt','Bệnh','Suy','Hưu','Tù'];

  function pad2(n){ return String(n).padStart(2, '0'); }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function is3MetaReady() { return typeof ThreeMeta !== 'undefined'; }

  function formatDtLocal(v){
    if(!v) return '';
    var p = String(v).split('T');
    if(p.length < 2) return '';
    var d = p[0].split('-').map(Number);
    var t = p[1].split(':').map(Number);
    if(!d[0]) return '';
    return pad2(d[2]) + '/' + pad2(d[1]) + '/' + d[0] + ' - ' + pad2(t[0] || 0) + ':' + pad2(t[1] || 0);
  }

  function dtLocalToStr(v){
    if(!v) return null;
    var p = v.split('T');
    if(p.length < 2) return null;
    var d = p[0].split('-').map(Number);
    var t = p[1].split(':').map(Number);
    return d[0] + '-' + pad2(d[1]) + '-' + pad2(d[2]) + ' ' + pad2(t[0] || 0) + ':' + pad2(t[1] || 0) + ':00';
  }

  function metaCaption(m){
    var c = [];
    if(m.direction) c.push(m.direction);
    if(m.trigram) c.push(m.trigram);
    return c.join(' · ');
  }

  function getEffectiveDeity(palace, chart) {
    var raw = (palace && palace.batThan) || '';
    if (!raw) return '';
    var isDuong = !!(chart && chart.ju && chart.ju.isDuong);
    if (!isDuong) {
      if (raw === 'Câu Trận') return 'Bạch Hổ';
      if (raw === 'Chu Tước') return 'Huyền Vũ';
    }
    return raw;
  }

  function getDisplayStar(palace) {
    if (!palace) return '';
    var star = palace.thienBan || '';
    if (palace.thienBanDongCung) star += ' / ' + palace.thienBanDongCung;
    return star;
  }

  function renderInfo(chart){
    var el = document.getElementById('info');
    var dtVal = document.getElementById('dt').value || '';
    var solarStr = formatDtLocal(dtVal) || chart.timeInfo.input || '';

    var lunarStr = '--';
    if (typeof ThreeMeta !== 'undefined' && ThreeMeta.Solar && ThreeMeta.Lunar) {
      try {
        var dtValue = document.getElementById('dt').value;
        if (dtValue) {
          var dateObj = new Date(dtValue);
          if (!isNaN(dateObj.getTime())) {
            // Ngày âm lịch đổi ở đúng mốc giờ Tý theo giờ Mặt Trời thực (không phải 23h hành chính
            // cố định), dùng chung công thức với quẻ Lạc Việt/Mai Hoa (getEffectiveDateTimeForQue)
            // để hai bên luôn khớp nhau. Hiển thị "Giờ <Chi>" thay vì giờ:phút cụ thể.
            var CHI_NAMES_KM = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
            var chiIdx = 0, dObjForLunar = dateObj;
            if (window.SolarTimeCorrection && window.SolarTimeCorrection.getEffectiveDateTimeForQue) {
              var effQue = window.SolarTimeCorrection.getEffectiveDateTimeForQue(dateObj);
              dObjForLunar = new Date(effQue.year, effQue.month - 1, effQue.day, 12, 0, 0);
              chiIdx = effQue.chiIndex;
            } else {
              var hour = dateObj.getHours();
              if (hour >= 23) dateObj.setDate(dateObj.getDate() + 1);
              chiIdx = Math.floor((hour + 1) / 2) % 12;
            }
            var solar = ThreeMeta.Solar.fromDate(dObjForLunar);
            var lunar = ThreeMeta.Lunar.fromSolar(solar);
            var lunarDay = lunar.getDay();
            var lunarMonth = Math.abs(lunar.getMonth());
            var lunarYear = lunar.getYear();
            lunarStr = lunarDay + '/' + lunarMonth + '/' + lunarYear + ' - Giờ ' + CHI_NAMES_KM[chiIdx];
          }
        }
      } catch(e) { console.error('Lỗi âm lịch:', e); }
    }

    var tk = chart.season.tietKhi || '';
    var chinhNgoInfo = '';
    if (window.SolarTimeCorrection && dtVal) {
      try {
        var dObjForNoon = new Date(dtVal);
        if (!isNaN(dObjForNoon.getTime())) {
          var tsn = window.SolarTimeCorrection.getTrueSolarNoon(dObjForNoon);
          var placeName = (window.SolarTimeCorrection.getPlaceName && window.SolarTimeCorrection.getPlaceName()) || '';
          var locPart = placeName ? (' · ' + esc(placeName)) : '';
          chinhNgoInfo = ' <span style="color:var(--text-muted,#8a6d68); font-size:12.5px;">(Chính Ngọ ' + pad2(tsn.hh) + ':' + pad2(tsn.mm) + locPart + ')</span>';
        }
      } catch (e) { /* bỏ qua nếu chưa có dữ liệu vị trí */ }
    }
    var xunShou = chart.tuanThu.ten || '';
    var kv = '—';
    var tuan = xunShou;
    var voidMap = {
      'Giáp Tý': ['Tuất', 'Hợi'], 'Giáp Tuất': ['Thân', 'Dậu'], 'Giáp Thân': ['Ngọ', 'Mùi'],
      'Giáp Ngọ': ['Thìn', 'Tỵ'], 'Giáp Thìn': ['Dần', 'Mão'], 'Giáp Dần': ['Tý', 'Sửu']
    };
    if (voidMap[tuan]) kv = voidMap[tuan].join(', ');
    else if (chart.tuanThu.khongVong && chart.tuanThu.khongVong.length) kv = chart.tuanThu.khongVong.join(', ');
    
    var fp = chart.fourPillars || {};
    function getGanZhi(obj) {
      if (!obj) return '—';
      if (obj.can && obj.chi) return obj.can + ' ' + obj.chi;
      if (obj.can) return obj.can;
      if (obj.chi) return obj.chi;
      return '—';
    }
    var canChi = [getGanZhi(fp.year), getGanZhi(fp.month), getGanZhi(fp.day), getGanZhi(fp.hour)].filter(Boolean).join(' — ') || '—';
    var juType = chart.ju.type || '';
    var juNum = chart.ju.soCuc || '';
    var yuan = chart.ju.nguyenName || chart.tuanThu.tamNguyen || '';
    var zf = chart.zhiFu || {};
    var zs = chart.zhiShi || {};
    var zhifuLine = zf.sao ? (zf.sao + (zf.ten ? (' lạc cung ' + zf.ten + '(' + zf.cung + ')') : '')) : '—';
    if (zf.isPhucNgam) {
      zhifuLine += ' <br/><span style="color:var(--bad); font-weight:bold; font-size:12.5px;">[Phục Ngâm Trung Cung]</span>';
    }
    var zhishiLine = zs.mon ? (zs.mon + ' lạc cung ' + zs.ten + '(' + zs.cung + ')') : (zs.ten ? (zs.ten + '(' + zs.cung + ')') : '—');
    if (zs.isCuaDong) {
      zhishiLine = '<span style="color:var(--bad); font-weight:bold;">Cửa Đóng <br/><span style="font-size:12.5px;">(Không có Trực Sử)</span></span>';
    }
    var juLine = [tk, yuan, juType + ' cục ' + juNum].filter(Boolean).join(', ') || '—';
    var sysName = chart.heThong === 'lacthu' ? 'Lạc Thư Cửu Cung' : 'Hà Đồ Cửu Cung';

    var html = `
      <div class="kv"><div class="k">Hệ thống :</div><div class="v" style="font-weight:bold; color:var(--accent);">${sysName}</div></div>
      <div class="kv"><div class="k">Dương lịch :</div><div class="v">${esc(solarStr)}${chinhNgoInfo}</div></div>
      <div class="kv"><div class="k">Âm lịch :</div><div class="v">${esc(lunarStr)}</div></div>
      <div class="kv"><div class="k">Can chi :</div><div class="v">${esc(canChi)}</div></div>
      <div class="kv"><div class="k">Tiết khí :</div><div class="v">${esc(tk || '—')}</div></div>
      <div class="kv"><div class="k">Lập cục :</div><div class="v">${esc(juLine)}</div></div>
      <div class="kv"><div class="k">Tuần thủ :</div><div class="v">${esc(xunShou || '—')}</div></div>
      <div class="kv"><div class="k">Không vong :</div><div class="v">${esc(kv)}</div></div>
      <div class="kv"><div class="k">Trực Phù :</div><div class="v">${zhifuLine}</div></div>
      <div class="kv"><div class="k">Trực Sử :</div><div class="v">${zhishiLine}</div></div>
    `;
    el.innerHTML = html;

    if (!document.getElementById('css-5cols')) {
      var style = document.createElement('style');
      style.id = 'css-5cols';
      style.innerHTML = `@media (min-width: 768px) { .info { grid-template-columns: repeat(5, 1fr) !important; } .kv { padding: 10px 8px !important; } .v { font-size: 14px !important; } }`;
      document.head.appendChild(style);
    }

    // Style cho cách cục trung tính (loai = 'neutral')
    if (!document.getElementById('css-pat-neutral')) {
      var st2 = document.createElement('style');
      st2.id = 'css-pat-neutral';
      st2.innerHTML = '.pat.neutral { color: #64748b; }';
      document.head.appendChild(st2);
    }
  }

  function renderQimenGrid(chart){
    var grid = document.getElementById('gridQimen');
    grid.innerHTML = '';
    var P_META = chart.heThong === 'lacthu' ? PALACE_META_LACTHU : PALACE_META_HADO;
    var G_ORDER = chart.heThong === 'lacthu' ? ORDER_LACTHU : ORDER_HADO;

    G_ORDER.forEach(function(pos){
      var p = (chart.palaces || []).find(function(x){ return x.cung === pos; }) || {};
      var meta = P_META[pos] || {direction:'', trigram:'', color:'#666', rgb:'102,102,102'};
      var deity = getEffectiveDeity(p, chart) || '';
      var star  = getDisplayStar(p) || '';
      var gate  = p.batMon || '';
      var hs    = 'T: ' + (p.thienCanBan || '—');
      var es    = 'Đ: ' + (p.diaBan || '—');
      var mc    = metaCaption(meta);
      var posColor = POS_TEXT_COLOR[pos] || '';
      var metaHtml = mc ? '<span class="meta-chip" style="color:' + posColor + '">' + esc(mc) + '</span>' : '';

      // ===== Badge từ status =====
      var st = p.status || {};
      var badges = [];
      if (st.isKhongVong) badges.push('<span class="badge badge-void">⭕ K.Vong</span>');
      if (st.isDichMa)    badges.push('<span class="badge badge-horse">🐎 D.Mã</span>');
      if (st.isMoKho)     badges.push('<span class="badge badge-mo">🪦 Nhập Mộ</span>');
      if (st.isQuyNhan)   badges.push('<span class="badge badge-quy">⭐ Q.Nhân</span>');
      if (st.isThaiTue)   badges.push('<span class="badge badge-tt">🌟 T.Tuế</span>');
      if (st.isTuePha)    badges.push('<span class="badge badge-tp">💥 T.Phá</span>');
      // Vượng suy của Sao (💫) và của Cửa (🚪): cùng so với một nguyệt lệnh (tháng tiết khí) nhưng
      // khác ngũ hành, nên có thể ra kết quả khác nhau - hiện cả hai, cùng kiểu icon với bản Scriptable.
      function vsClass(vs) { return VUONG_STRONG.includes(vs) ? 'badge-vuong' : (VUONG_WEAK.includes(vs) ? 'badge-suy' : ''); }
      var vuongSuySao = st.vuongSuySao || '';
      var vuongSuyMon = st.vuongSuyMon || '';
      if (vuongSuySao) badges.push('<span class="badge ' + vsClass(vuongSuySao) + '" title="Vượng suy của Sao theo nguyệt lệnh">💫 ' + esc(vuongSuySao) + '</span>');
      if (vuongSuyMon) badges.push('<span class="badge ' + vsClass(vuongSuyMon) + '" title="Vượng suy của Cửa theo nguyệt lệnh">🚪 ' + esc(vuongSuyMon) + '</span>');
      var badgeHtml = badges.length ? '<div class="badge-row">' + badges.join('') + '</div>' : '';
      // ==========================================

      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.setProperty('--dir-color', meta.color);
      cell.style.setProperty('--dir-rgb', meta.rgb);
      cell.innerHTML =
        '<div class="cell-shell">' +
          '<div class="cell-topline"><div class="cell-meta">' + metaHtml + '</div><div class="pos" style="color:' + posColor + '">' + pos + '</div></div>' +
          '<div class="qm-main"><div class="qm-block"><span class="qm-value">' + esc(deity) + '</span></div><div class="qm-block"><span class="qm-value">' + esc(star) + '</span></div></div>' +
          '<div class="qm-gate" style="color:' + posColor + '">' + esc(gate) + '</div>' +
          '<div class="qm-stems"><div class="stem-line">' + esc(hs) + '</div><div class="stem-line">' + esc(es) + '</div></div>' +
          badgeHtml +
        '</div>';
      grid.appendChild(cell);
    });
  }

  // cat -> good, hung -> bad, còn lại (neutral...) -> neutral (không tô đỏ)
  function getPatternLines(palace){
    var pats = Array.isArray(palace.patterns) ? palace.patterns : [];
    return pats.map(function(p){
      var kind = p.loai === 'cat' ? 'good' : (p.loai === 'hung' ? 'bad' : 'neutral');
      return { kind: kind, name: p.ten || '' };
    }).filter(function(x){ return x.name; });
  }

  function renderPatternsGrid(chart){
    var grid = document.getElementById('gridPatterns');
    grid.innerHTML = '';
    var P_META = chart.heThong === 'lacthu' ? PALACE_META_LACTHU : PALACE_META_HADO;
    var G_ORDER = chart.heThong === 'lacthu' ? ORDER_LACTHU : ORDER_HADO;

    G_ORDER.forEach(function(pos){
      var palace = (chart.palaces || []).find(function(x){ return x.cung === pos; }) || {};
      var meta = P_META[pos] || {color:'#666', rgb:'102,102,102'};
      var lines = getPatternLines(palace);
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.setProperty('--dir-color', meta.color);
      cell.style.setProperty('--dir-rgb', meta.rgb);
      if (lines.length === 0) cell.classList.add('dim');
      var content = !lines.length
        ? '<div class="empty">Không có</div>'
        : '<div class="pat-wrap">' + lines.map(function(x){
            return '<div class="pat ' + x.kind + '">' + esc(x.name) + '</div>';
          }).join('') + '</div>';
      cell.innerHTML = '<div class="cell-shell pattern-shell">' + content + '</div>';
      grid.appendChild(cell);
    });
  }

  function calculate(){
    try{
      if(!window.KyMonEngine){ alert('Không tải được engine Kỳ Môn.'); return; }
      if(!is3MetaReady()){ alert('Không tải được 3meta.js.'); return; }
      var dtInput = document.getElementById('dt');
      var dtStr = dtLocalToStr(dtInput.value);
      if(!dtStr){ alert('Vui lòng chọn ngày và giờ.'); return; }
      // Hiệu chỉnh theo giờ Mặt Trời thực (Chính Ngọ): CHỈ ảnh hưởng Can Chi Giờ/Ngày và mốc
      // chuyển ngày (đây là khái niệm "giờ tại chỗ", phụ thuộc kinh độ người xem). Tháng-trụ,
      // Năm-trụ và Tiết khí/Cục vẫn dùng đúng giờ hành chính gốc (dtStr) vì đó là mốc thiên văn
      // tuyệt đối, không phụ thuộc kinh độ - truyền riêng qua options.effectiveDateStr để
      // KyMonEngine tự tách hai nguồn này, không gộp chung như trước.
      var effectiveDateStr = null;
      if (window.SolarTimeCorrection && window.SolarTimeCorrection.getEffectiveDateTimeString) {
        effectiveDateStr = window.SolarTimeCorrection.getEffectiveDateTimeString(dtInput.value);
      }
      var optDiCungEl  = document.getElementById('optDiCung');
      var optKyCungEl  = document.getElementById('optKyCung');
      var optHeThongEl = document.getElementById('optHeThong');
      var isPhi = optDiCungEl && optDiCungEl.value === 'phi';
      if (optKyCungEl) {
        if (isPhi) { optKyCungEl.disabled = true;  optKyCungEl.parentNode.style.opacity = '0.5'; }
        else       { optKyCungEl.disabled = false; optKyCungEl.parentNode.style.opacity = '1'; }
      }
      var options = {
        heThong: optHeThongEl ? optHeThongEl.value : 'hado',
        diCung:  isPhi ? 'phi' : 'chuyen', 
        anCuc:   document.getElementById('optAnCuc') ? document.getElementById('optAnCuc').value : 'trietbo',   
        kyCung:  optKyCungEl ? optKyCungEl.value : 'khon',
        effectiveDateStr: effectiveDateStr
      };
      var chart = window.KyMonEngine.byDatetime(dtStr, options);
      if (window.fixChartGanZhi) chart = window.fixChartGanZhi(chart);
      window.__LAST_CHART = chart;
      renderInfo(chart);
      renderQimenGrid(chart);
      renderPatternsGrid(chart);
      if (window.ChartEvents) window.ChartEvents.emit('chartCalculated', chart);
    } catch (e) {
      console.error(e);
      alert('Lỗi lập bàn: ' + (e.message || e));
    }
  }

  window.calculate = calculate;

  function setNow(){
    var d = new Date();
    document.getElementById('dt').value = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  document.getElementById('btnNow').addEventListener('click', function () { setNow(); calculate(); });
  document.getElementById('btnCalc').addEventListener('click', calculate);
  document.getElementById('optHeThong').addEventListener('change', calculate);
  document.getElementById('optDiCung').addEventListener('change', calculate);
  document.getElementById('optAnCuc').addEventListener('change', calculate);
  document.getElementById('optKyCung').addEventListener('change', calculate);
  window.addEventListener('load', function () { setNow(); calculate(); });
})();
