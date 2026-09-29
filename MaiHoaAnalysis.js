// MaiHoaAnalysis.js
// MODULE MỞ RỘNG: PHÂN TÍCH MAI HOA CHUYÊN SÂU (Chính - Hỗ - Biến)
// - Không thay đổi logic lập quẻ hiện có. Chỉ đọc kết quả qua window.__MAIHOA_STATE
//   (do index.html gán sau khi lập quẻ) và các dữ liệu toàn cục sẵn có:
//   guaNames, HEXAGRAMS, HEXAGRAM_DETAILS, TOT_CHO_MAP, GOOD_MAI_HOA_QUE,
//   GOOD_LAC_VIET_QUE, LAC_VIET_QUE, LUC_THU, CAN_TO_LUC_THU_START, window.__LAST_CHART (Kỳ Môn).
// - Hoạt động như một bộ luận giải: Thể/Dụng, Nguyệt lệnh, Nhật thần, Hào động, Hỗ, Biến,
//   Lục thân, cách cục đặc biệt, ứng kỳ, ứng sự theo chủ đề, đối chiếu chéo Lạc Việt/Kỳ Môn.
(function (root) {
  'use strict';

  // ============================================================
  // 1. HẰNG SỐ & DỮ LIỆU NỀN
  // ============================================================
  var SINH = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  var KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

  // Số quái theo đúng quy ước đang dùng trong ứng dụng (4 = Tốn, 5 = Chấn)
  var TRI_FALLBACK = { 1: 'Càn', 2: 'Đoài', 3: 'Ly', 4: 'Tốn', 5: 'Chấn', 6: 'Khảm', 7: 'Cấn', 8: 'Khôn' };

  // Loại tượng vạn vật của 8 quái (Hậu thiên)
  var TUONG = {
    'Càn':  { hanh: 'Kim',  huong: 'Tây Bắc',  nguoi: 'cha, người lớn tuổi, lãnh đạo, quý nhân', coThe: 'đầu, xương, phổi', tinh: 'cương kiện, chủ động, quyết đoán', mua: 'cuối Thu – đầu Đông', mau: 'trắng, vàng kim', vat: 'vàng bạc, đồ quý, máy móc, xe cộ' },
    'Đoài': { hanh: 'Kim',  huong: 'Tây',      nguoi: 'thiếu nữ, ca sĩ, người làm nghề nói', coThe: 'miệng, lưỡi, họng, răng, phổi', tinh: 'vui vẻ, hòa duyệt, dễ khẩu thiệt', mua: 'Thu', mau: 'trắng', vat: 'đồ kim loại nhỏ, đồ khuyết mẻ, tiệc tùng' },
    'Ly':   { hanh: 'Hỏa',  huong: 'Nam',      nguoi: 'trung nữ, người làm văn thư, người nóng tính', coThe: 'mắt, tim, huyết áp', tinh: 'sáng suốt, nhiệt, danh tiếng, văn thư', mua: 'Hạ', mau: 'đỏ, tím', vat: 'đèn, bếp lò, giấy tờ, văn bằng' },
    'Tốn':  { hanh: 'Mộc',  huong: 'Đông Nam', nguoi: 'trưởng nữ, người buôn bán, người đi lại', coThe: 'đùi, hông, cánh tay, hô hấp', tinh: 'thuận theo, thâm nhập, dao động', mua: 'cuối Xuân – đầu Hạ', mau: 'xanh lá', vat: 'cây cối, dây, quạt, tin tức, đường đi' },
    'Chấn': { hanh: 'Mộc',  huong: 'Đông',     nguoi: 'trưởng nam', coThe: 'chân, gan, thần kinh', tinh: 'động, khởi phát, bất ngờ', mua: 'Xuân', mau: 'xanh lục', vat: 'tre gỗ, âm thanh, nhạc cụ, xe cộ' },
    'Khảm': { hanh: 'Thủy', huong: 'Bắc',      nguoi: 'trung nam, người lao động, kẻ gian', coThe: 'tai, thận, bàng quang, máu', tinh: 'hiểm trở, chìm sâu, âm thầm', mua: 'Đông', mau: 'đen, xanh dương', vat: 'nước, chất lỏng, rượu, cá' },
    'Cấn':  { hanh: 'Thổ',  huong: 'Đông Bắc', nguoi: 'thiếu nam, người trẻ, người canh giữ', coThe: 'tay, ngón tay, mũi, lưng, dạ dày', tinh: 'dừng lại, ổn định, cản trở', mua: 'cuối Đông – đầu Xuân', mau: 'vàng, nâu', vat: 'núi đá, tường, cửa, nhà kho' },
    'Khôn': { hanh: 'Thổ',  huong: 'Tây Nam',  nguoi: 'mẹ, phụ nữ lớn tuổi, dân chúng', coThe: 'bụng, tỳ vị, da thịt', tinh: 'nhu thuận, dung chứa, chậm mà chắc', mua: 'cuối Hạ – các tháng Tứ quý', mau: 'vàng, nâu', vat: 'đất ruộng, vải vóc, đồ gốm, ngũ cốc' }
  };

  var HANH_THANG = { 'Mộc': [1, 2], 'Hỏa': [4, 5], 'Kim': [7, 8], 'Thủy': [10, 11], 'Thổ': [3, 6, 9, 12] };
  var HANH_CHI   = { 'Mộc': 'Dần, Mão', 'Hỏa': 'Tị, Ngọ', 'Kim': 'Thân, Dậu', 'Thủy': 'Hợi, Tí', 'Thổ': 'Thìn, Tuất, Sửu, Mùi' };
  var HANH_HUONG = { 'Mộc': 'Đông, Đông Nam', 'Hỏa': 'Nam', 'Kim': 'Tây, Tây Bắc', 'Thủy': 'Bắc', 'Thổ': 'Tây Nam, Đông Bắc, trung tâm' };
  var HANH_MAU   = { 'Mộc': 'xanh lá', 'Hỏa': 'đỏ, cam, tím', 'Kim': 'trắng, ánh kim', 'Thủy': 'đen, xanh dương', 'Thổ': 'vàng, nâu' };
  var CHI_HANH = { 'Tí': 'Thủy', 'Tý': 'Thủy', 'Sửu': 'Thổ', 'Dần': 'Mộc', 'Mão': 'Mộc', 'Thìn': 'Thổ', 'Tị': 'Hỏa', 'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa', 'Mùi': 'Thổ', 'Thân': 'Kim', 'Dậu': 'Kim', 'Tuất': 'Thổ', 'Hợi': 'Thủy' };

  var STATE_SCORE = { 'Vượng': 2, 'Tướng': 1, 'Hưu': 0, 'Tù': -1, 'Tử': -2 };
  var STATE_CLS   = { 'Vượng': 'good', 'Tướng': 'good', 'Hưu': 'neutral', 'Tù': 'warn', 'Tử': 'bad' };

  // Quan hệ của một quái so với Thể (đồng thời là Lục thân)
  var REL = {
    sinhThe: { k: 'sinhThe', ten: 'sinh Thể',  than: 'Ấn (Phụ mẫu)',       nghia: 'quý nhân, giấy tờ, sự hỗ trợ',                          score: 2,  cls: 'good' },
    tyHoa:   { k: 'tyHoa',   ten: 'tỷ hòa với Thể', than: 'Tỷ (Huynh đệ)',  nghia: 'bạn bè, đồng nghiệp, cũng là người chia phần / cạnh tranh', score: 1,  cls: 'good' },
    theKhac: { k: 'theKhac', ten: 'bị Thể khắc', than: 'Tài (Thê tài)',     nghia: 'tiền của, vật được, việc mình chế ngự được',             score: 1,  cls: 'good' },
    theSinh: { k: 'theSinh', ten: 'được Thể sinh', than: 'Tử tôn (Thực thương)', nghia: 'con cháu, phúc đức, giải trí; nhưng làm hao tiết sức Thể', score: -1, cls: 'warn' },
    khacThe: { k: 'khacThe', ten: 'khắc Thể', than: 'Quan (Quan quỷ)',       nghia: 'áp lực, cấp trên, kiện tụng, bệnh, tai họa',             score: -2, cls: 'bad' }
  };

  var LINE_MEANING = [
    'Sơ hào: khởi đầu, còn ẩn, chưa nên vội vàng hành động lớn',
    'Nhị hào: đắc trung ở hạ quái, việc cụ thể, gần gũi, vững vàng nếu giữ chính đạo',
    'Tam hào: đỉnh hạ quái, giai đoạn chuyển tiếp, nhiều rủi ro, dễ nóng vội',
    'Tứ hào: bước vào thượng quái, gần bậc chí tôn, cần thận trọng, khiêm nhường',
    'Ngũ hào: ngôi chí tôn, đắc trung ở thượng quái, thời cơ cao nhất',
    'Thượng hào: cực điểm, hết đà; thịnh cực tắc suy, sắp chuyển hóa'
  ];
  var LINE_NAMES = ['Sơ', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Thượng'];

  var LUC_THU_Y = {
    'Thanh Long': 'cát: hỷ sự, tài lộc, quý nhân',
    'Chu Tước': 'khẩu thiệt, văn thư, tin tức, thị phi',
    'Câu Trận': 'chậm trễ, ràng buộc, đất đai, kéo dài',
    'Đằng Xà': 'lo nghĩ, hư kinh, mập mờ, rắc rối',
    'Bạch Hổ': 'hung: tai nạn, bệnh tật, tranh chấp mạnh',
    'Huyền Vũ': 'mờ ám, thất thoát, người gian, việc ngầm'
  };

  var TOPICS = {
    tongquat: { ten: 'Tổng quát', re: /tình thế|tương lai|sự việc|thế vận|hy vọng|ước muốn/i },
    sunghiep: { ten: 'Sự nghiệp – Công danh', re: /sự nghiệp|nghề nghiệp|nhậm chức|việc làm|công danh|thăng/i },
    tailoc:   { ten: 'Tài lộc – Kinh doanh', re: /tiền tài|tài lộc|kinh doanh|vay vốn|chứng khoán|của cải|đầu tư|mất của/i },
    honnhan:  { ten: 'Hôn nhân – Tình cảm', re: /hôn nhân|tình duyên|tình yêu|sinh con|con cái|gia đạo/i },
    kientung: { ten: 'Kiện tụng – Tranh chấp', re: /kiện|tranh chấp|pháp lý|mâu thuẫn/i },
    suckhoe:  { ten: 'Sức khỏe – Bệnh tật', re: /bệnh|tuổi thọ|sức khỏe/i },
    thicu:    { ten: 'Học tập – Thi cử', re: /thi cử|học tập/i },
    dixa:     { ten: 'Đi xa – Xuất hành', re: /xuất hành|du lịch|đi xa/i },
    timnguoi: { ten: 'Tìm người – Tìm vật', re: /tìm người|chờ người|đợi người|vật bị mất|mất của|tìm/i },
    nhacua:   { ten: 'Nhà cửa – Đất đai', re: /nhà cửa|mồ mả|đất|nhà/i }
  };
  var TOPIC_ORDER = ['tongquat', 'sunghiep', 'tailoc', 'honnhan', 'kientung', 'suckhoe', 'thicu', 'dixa', 'timnguoi', 'nhacua'];

  var currentTopic = 'tongquat';

  // ============================================================
  // 2. TIỆN ÍCH
  // ============================================================
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function stripHtml(s) { return String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    s = String(s || '').trim();
    if (s.length <= n) return s;
    var cut = s.slice(0, n);
    var p = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    if (p > n * 0.5) return cut.slice(0, p + 1);
    return cut.replace(/\s+\S*$/, '') + '…';
  }
  function tag(text, cls) { return '<span class="mha-tag ' + (cls || 'neutral') + '">' + esc(text) + '</span>'; }
  function li(html, cls) { return '<li class="' + (cls || '') + '">' + html + '</li>'; }
  function sec(title, items, note) {
    return '<div class="mha-sec"><h3>' + title + '</h3>' + (note ? '<div class="mha-note">' + note + '</div>' : '') + '<ul>' + items.join('') + '</ul></div>';
  }
  function sgn(x) { return x > 0.5 ? 'good' : (x < -0.5 ? 'bad' : 'neutral'); }

  function triName(n) {
    try { if (typeof guaNames !== 'undefined' && guaNames[n]) return guaNames[n]; } catch (e) { /* bỏ qua */ }
    return TRI_FALLBACK[n] || ('Quái ' + n);
  }
  function triInfo(n) {
    var ten = triName(n), t = TUONG[ten] || {};
    var o = { so: n, ten: ten };
    for (var k in t) o[k] = t[k];
    return o;
  }

  function relation(the, x) {
    if (x === the) return REL.tyHoa;
    if (SINH[x] === the) return REL.sinhThe;
    if (SINH[the] === x) return REL.theSinh;
    if (KHAC[the] === x) return REL.theKhac;
    if (KHAC[x] === the) return REL.khacThe;
    return REL.tyHoa;
  }

  // Vượng / Tướng / Hưu / Tù / Tử theo tháng âm (khớp với bảng ngũ hành đã có trong index.html)
  function monthStates(m) {
    if (m === 1 || m === 2)   return { 'Mộc': 'Vượng', 'Hỏa': 'Tướng', 'Thủy': 'Hưu', 'Kim': 'Tù', 'Thổ': 'Tử' };
    if (m === 4 || m === 5)   return { 'Hỏa': 'Vượng', 'Thổ': 'Tướng', 'Mộc': 'Hưu', 'Thủy': 'Tù', 'Kim': 'Tử' };
    if (m === 7 || m === 8)   return { 'Kim': 'Vượng', 'Thủy': 'Tướng', 'Thổ': 'Hưu', 'Hỏa': 'Tù', 'Mộc': 'Tử' };
    if (m === 10 || m === 11) return { 'Thủy': 'Vượng', 'Mộc': 'Tướng', 'Kim': 'Hưu', 'Thổ': 'Tù', 'Hỏa': 'Tử' };
    return { 'Thổ': 'Vượng', 'Kim': 'Tướng', 'Hỏa': 'Hưu', 'Mộc': 'Tù', 'Thủy': 'Tử' };
  }
  function seasonName(m) {
    if (m === 1 || m === 2) return 'mùa Xuân';
    if (m === 4 || m === 5) return 'mùa Hạ';
    if (m === 7 || m === 8) return 'mùa Thu';
    if (m === 10 || m === 11) return 'mùa Đông';
    return 'tháng Tứ quý (Thổ vượng)';
  }
  function isStrong(s) { return s && (s.state === 'Vượng' || s.state === 'Tướng'); }
  function isWeak(s) { return s && (s.state === 'Tù' || s.state === 'Tử'); }

  // ============================================================
  // 3. TRÍCH XUẤT NỘI DUNG QUẺ TỪ DỮ LIỆU CÓ SẴN
  // ============================================================
  var hexCache = {};
  function parseHex(name) {
    if (hexCache[name] !== undefined) return hexCache[name];
    var res = null;
    try {
      var d = (typeof HEXAGRAM_DETAILS !== 'undefined') ? HEXAGRAM_DETAILS.find(function (h) { return h.name === name; }) : null;
      if (d && d.detail) {
        var html = d.detail;
        var m = html.match(/<h2>[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/);
        var intro = m ? stripHtml(m[1]) : '';
        var t = html.match(/Tháng tốt:<\/strong>\s*([^<]*)/);
        var months = t ? (t[1].match(/\d+/g) || []).map(Number).filter(function (x) { return x >= 1 && x <= 12; }) : [];
        var bad = [];
        var b = html.match(/Điểm xấu:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/);
        if (b) (b[1].match(/<li>([\s\S]*?)<\/li>/g) || []).forEach(function (x) { bad.push(stripHtml(x)); });
        var sections = [], idxs = [], re = /<strong>Đoán quẻ (\d+):<\/strong>/g, mm;
        while ((mm = re.exec(html))) idxs.push({ n: +mm[1], start: mm.index });
        idxs.forEach(function (it, i) {
          var end = i + 1 < idxs.length ? idxs[i + 1].start : html.length;
          var seg = html.slice(it.start, end), ulPos = seg.indexOf('<ul');
          var head = stripHtml(ulPos >= 0 ? seg.slice(0, ulPos) : seg).replace(/^Đoán quẻ \d+:\s*/, '');
          var items = [];
          if (ulPos >= 0) {
            (seg.slice(ulPos).match(/<li>([\s\S]*?)<\/li>/g) || []).forEach(function (l) {
              var tx = stripHtml(l), k = tx.match(/^([^:：]{2,45}?)\s*[:：]\s*([\s\S]+)$/);
              items.push(k ? { label: k[1].trim(), text: k[2].trim() } : { label: '', text: tx });
            });
          }
          sections.push({ n: it.n, text: head, items: items });
        });
        res = { intro: intro, months: months, bad: bad, sections: sections };
      }
    } catch (e) { res = null; }
    hexCache[name] = res;
    return res;
  }

  var NEG_RE = /không (thuận|tốt|thành|lợi|may|dễ|hợp)|bất lợi|khó (khăn|thành|đạt|khăn|tránh)|thất bại|trở ngại|trắc trở|hao tổn|tổn thất|tai (họa|nạn)|nguy (hiểm|cơ)|thua (lỗ|kiện)|xấu|hung|kém|bế tắc|dang dở|suy (giảm|thoái)|lâm vào|túng quẫn|dai dẳng|nặng thêm|gian nan/gi;
  var POS_RE = /tốt|thuận lợi|thành công|may mắn|dễ dàng|đắc|cát|vượng|như ý|thành đạt|phát triển|bình phục|đỗ|thăng|phú quý|hanh thông|hài hòa|hiển đạt|sáng sủa|tài lộc dồi dào|hòa hợp/gi;
  function sentimentOf(text) {
    var t = String(text || '');
    var neg = (t.match(NEG_RE) || []).length;
    var pos = (t.replace(NEG_RE, ' ').match(POS_RE) || []).length;
    var s = pos - neg;
    return { pos: pos, neg: neg, score: s, cls: s >= 2 ? 'good' : (s <= -2 ? 'bad' : 'neutral'), label: s >= 2 ? 'thiên cát' : (s <= -2 ? 'thiên hung' : 'trung tính') };
  }
  function topicItems(hexName, topicKey) {
    var p = parseHex(hexName), out = [];
    if (!p) return out;
    var re = (TOPICS[topicKey] || TOPICS.tongquat).re;
    p.sections.forEach(function (s) {
      s.items.forEach(function (it) { if (it.label && re.test(it.label)) out.push({ label: it.label, text: it.text, n: s.n }); });
    });
    return out;
  }

  // ============================================================
  // 4. DỰNG NGỮ CẢNH PHÂN TÍCH
  // ============================================================
  function lucThuOf(info, ml) {
    try {
      var can = String(info.dayCanChi || '').split(' ')[0];
      var start = (typeof CAN_TO_LUC_THU_START !== 'undefined' && CAN_TO_LUC_THU_START[can] != null) ? CAN_TO_LUC_THU_START[can] : 0;
      var arr = (typeof LUC_THU !== 'undefined') ? LUC_THU : null;
      if (!arr) return null;
      return arr[(start + ml - 1) % 6];
    } catch (e) { return null; }
  }

  function buildContext(state) {
    var mh = state.maiHoa, info = state.info || {};
    var ml = mh.movingLine;
    var upper = mh.mainGua.upper, lower = mh.mainGua.lower;
    var dungOnLower = ml <= 3;
    var lm = info.lunarMonth || 1;
    var st = monthStates(lm);

    function slot(key, label, n) {
      var t = triInfo(n);
      return { key: key, label: label, n: n, ten: t.ten, hanh: t.hanh, tuong: t, state: st[t.hanh] };
    }
    var the  = slot('the', 'Thể', dungOnLower ? upper : lower);
    var dung = slot('dung', 'Dụng', dungOnLower ? lower : upper);
    var bien = slot('bien', 'Biến', dungOnLower ? mh.changedGua.lower : mh.changedGua.upper);
    var hoT  = slot('hoTren', 'Hỗ thượng', mh.supportGua.upper);
    var hoD  = slot('hoDuoi', 'Hỗ hạ', mh.supportGua.lower);
    var slots = [dung, hoT, hoD, bien];
    slots.forEach(function (s) { s.rel = relation(the.hanh, s.hanh); });

    var dayChi = String(info.dayCanChi || '').split(' ')[1] || '';
    var hourChi = String(info.hourCanChi || '').split(' ')[1] || '';
    var nhat = { chi: dayChi, hanh: CHI_HANH[dayChi] || '', text: info.dayCanChi || '' };
    nhat.rel = nhat.hanh ? relation(the.hanh, nhat.hanh) : null;
    var gio = { chi: hourChi, hanh: CHI_HANH[hourChi] || '', text: info.hourCanChi || '' };
    gio.rel = gio.hanh ? relation(the.hanh, gio.hanh) : null;

    var bit = mh.mainStructure[ml - 1];               // 1 = dương, 0 = âm (bản hào)
    var partner = (ml + 2) % 6;                        // ứng: 1-4, 2-5, 3-6 (chỉ số 0..5)
    var partnerBit = mh.mainStructure[partner];

    return {
      mh: mh, info: info, lm: lm, states: st, ml: ml, dungOnLower: dungOnLower,
      the: the, dung: dung, bien: bien, hoT: hoT, hoD: hoD, slots: slots, nhat: nhat, gio: gio,
      line: { idx: ml, bit: bit, isDuong: bit === 1, dacVi: (bit === 1) === (ml % 2 === 1), trung: (ml === 2 || ml === 5), partnerIdx: partner + 1, partnerBit: partnerBit, ung: partnerBit !== bit },
      lucThu: lucThuOf(info, ml),
      names: { chinh: mh.mainGua.name, ho: mh.supportGua.name, bien: mh.changedGua.name },
      lacViet: state.lacVietQue || null
    };
  }

  // ============================================================
  // 5. CHẤM ĐIỂM & PHÁT HIỆN CÁCH CỤC
  // ============================================================
  function detectPatterns(ctx) {
    var out = [], the = ctx.the, dung = ctx.dung, slots = ctx.slots;
    var count = function (k) { return slots.filter(function (s) { return s.rel.k === k; }); };
    var nSinh = count('sinhThe'), nTy = count('tyHoa'), nKhac = count('khacThe'), nTaiL = count('theKhac'), nTiet = count('theSinh');

    if (ctx.mh.mainGua.upper === ctx.mh.mainGua.lower) {
      out.push({ cls: 'neutral', text: '<b>Quẻ thuần</b> (' + esc(ctx.names.chinh) + '): nội ngoại cùng quái, Thể – Dụng cùng hành, tâm ý chuyên nhất; sự việc ít xoay chuyển, phải xem Hỗ và Biến để định cát hung.' });
    }
    if (nKhac.length >= 2) {
      if (isWeak(the)) out.push({ cls: 'bad', text: '<b>Thể bị vây khắc</b> (' + nKhac.length + ' quái khắc Thể) lại gặp Thể ' + esc(the.state) + ' theo nguyệt lệnh: thế cô, dễ bị áp đảo, cần lùi để giữ.' });
      else if (isStrong(the)) out.push({ cls: 'warn', text: '<b>Nhiều quái khắc Thể</b> (' + nKhac.length + ') nhưng Thể ' + esc(the.state) + ': chịu được áp lực, lo nhiều hơn nguy.' });
      else out.push({ cls: 'warn', text: '<b>Nhiều quái khắc Thể</b> (' + nKhac.length + '): áp lực dồn dập từ nhiều phía, cần củng cố Thể (tìm Ấn) trước khi làm.' });
    }
    if (nSinh.length + nTy.length >= 3) {
      out.push({ cls: 'good', text: '<b>Thể được nhiều lực trợ giúp</b> (' + (nSinh.length + nTy.length) + ' quái sinh hoặc tỷ hòa): đông người ủng hộ, thuận thế mà tiến.' });
    }
    if (nSinh.length >= 2) {
      out.push({ cls: 'neutral', text: '<b>Nhiều Ấn</b>: quý nhân, giấy tờ, chỗ dựa dồi dào, nhưng dễ ỷ lại; cần tự mình hành động.' });
    }
    if (nTiet.length >= 2) {
      out.push({ cls: 'warn', text: '<b>Thể bị tiết nhiều</b> (' + nTiet.length + ' quái do Thể sinh): hao sức, hao của; không nên dốc thêm nguồn lực.' });
    }
    if (nTaiL.length >= 2) {
      out.push({ cls: 'good', text: '<b>Thể khắc nhiều quái</b> (' + nTaiL.length + '): nắm thế chủ động lớn, nhưng thắng phải tốn công; nếu Thể suy thì khắc mà lực yếu.' });
    }

    // Giải cứu / thông quan khi Dụng khắc Thể
    if (dung.rel.k === 'khacThe') {
      var cuu = slots.filter(function (s) { return s.key !== 'dung' && KHAC[s.hanh] === dung.hanh; });
      var mid = SINH[dung.hanh];
      var tq = slots.filter(function (s) { return s.key !== 'dung' && s.hanh === mid && SINH[s.hanh] === the.hanh; });
      if (cuu.length) out.push({ cls: 'good', text: '<b>Có quái cứu Thể</b>: ' + cuu.map(function (s) { return esc(s.label + ' ' + s.ten + ' (' + s.hanh + ')'); }).join('; ') + ' khắc chế Dụng (' + esc(dung.hanh) + '), làm giảm sức khắc Thể.' });
      if (tq.length) out.push({ cls: 'good', text: '<b>Có quái thông quan</b>: ' + tq.map(function (s) { return esc(s.label + ' ' + s.ten + ' (' + s.hanh + ')'); }).join('; ') + ' làm cầu nối Dụng → Thể (' + esc(dung.hanh) + ' → ' + esc(mid) + ' → ' + esc(the.hanh) + '), hóa khắc thành sinh.' });
      if (isWeak(dung)) out.push({ cls: 'good', text: '<b>Dụng khắc Thể nhưng Dụng ' + esc(dung.state) + '</b> theo nguyệt lệnh: khắc vô lực, mức nguy hại giảm đáng kể.' });
      if (isWeak(the)) out.push({ cls: 'bad', text: '<b>Dụng khắc Thể, Thể ' + esc(the.state) + '</b>: bất lợi rõ rệt, nên hoãn hoặc giảm quy mô.' });
    }
    if (dung.rel.k === 'sinhThe' && isWeak(dung)) {
      out.push({ cls: 'warn', text: '<b>Dụng sinh Thể nhưng Dụng ' + esc(dung.state) + '</b>: có thiện ý giúp mà thiếu lực, lợi ích không lớn như kỳ vọng.' });
    }
    if (dung.rel.k === 'sinhThe' && isWeak(the)) {
      out.push({ cls: 'good', text: '<b>Thể suy gặp sinh</b>: đúng lúc được cứu giúp, "hạn hán gặp mưa".' });
    }
    if (dung.rel.k === 'theKhac' && isStrong(the)) out.push({ cls: 'good', text: '<b>Thể vượng khắc Dụng</b>: đủ lực để thắng, đạt được mục tiêu.' });
    if (dung.rel.k === 'theKhac' && isWeak(the)) out.push({ cls: 'warn', text: '<b>Thể khắc Dụng nhưng Thể ' + esc(the.state) + '</b>: có ý chinh phục mà lực yếu, dễ nửa chừng.' });
    if (dung.rel.k === 'theSinh' && isWeak(the)) out.push({ cls: 'bad', text: '<b>Thể ' + esc(the.state) + ' lại phải sinh cho Dụng</b>: kiệt sức, hao tổn nặng.' });

    // Hỗ cùng hành Dụng hoặc Biến cùng Dụng
    if (ctx.hoT.hanh === ctx.hoD.hanh) out.push({ cls: 'neutral', text: '<b>Hỗ quái cùng hành</b> (' + esc(ctx.hoT.hanh) + '): diễn biến giữa chừng nhất quán, chi phối bởi một hành duy nhất.' });
    return out;
  }

  function trendOf(a, b, c) {
    var A = sgn(a), B = sgn(b), C = sgn(c);
    var txt;
    if (A === 'good' && B === 'good' && C === 'good') txt = 'Thuận lợi suốt quá trình từ đầu đến cuối.';
    else if (A === 'bad' && B === 'bad' && C === 'bad') txt = 'Bất lợi suốt quá trình, nên cân nhắc dừng hoặc thay đổi hướng đi.';
    else if (A === 'bad' && C === 'good') txt = 'Đầu khó cuối thuận (khổ tận cam lai): chịu đựng giai đoạn đầu sẽ có kết quả tốt.';
    else if (A === 'good' && C === 'bad') txt = 'Đầu thuận cuối hung (thịnh trước, suy sau): đừng chủ quan, phải phòng hậu quả về sau.';
    else if (B === 'bad' && A !== 'bad' && C !== 'bad') txt = 'Gặp trở ngại giữa chừng nhưng cuối cùng vượt qua được.';
    else if (B === 'good' && A !== 'good' && C !== 'good') txt = 'Có sự hỗ trợ giữa chừng nhưng không đủ đổi hẳn kết cục.';
    else if (C === 'good') txt = 'Xu hướng chung đi lên, kết quả thiên về thuận lợi.';
    else if (C === 'bad') txt = 'Xu hướng chung đi xuống, kết quả thiên về bất lợi.';
    else txt = 'Diễn biến phức tạp, nhiều thay đổi, kết quả chưa rõ rệt.';
    return { A: A, B: B, C: C, text: txt };
  }

  function score(ctx, kd) {
    var the = ctx.the, dung = ctx.dung, comp = [], total = 0;
    function add(name, v, why) { if (!v) return; comp.push({ name: name, v: v, why: why || '' }); total += v; }

    add('Chính (Thể–Dụng)', dung.rel.score * 3);
    var mod = 0;
    if (dung.rel.k === 'khacThe') { if (isWeak(dung)) mod += 1.5; if (isStrong(the)) mod += 1; if (isWeak(the)) mod -= 1; }
    if (dung.rel.k === 'sinhThe' && isWeak(dung)) mod -= 1;
    if (dung.rel.k === 'theKhac') { if (isStrong(the)) mod += 1; if (isWeak(the)) mod -= 1; }
    if (dung.rel.k === 'theSinh' && isWeak(the)) mod -= 1;
    add('Hiệu chỉnh vượng suy của Chính', mod);

    add('Hỗ quái', (ctx.hoT.rel.score + ctx.hoD.rel.score) * 0.75);
    add('Biến quái', ctx.bien.rel.score * 2);
    add('Nguyệt lệnh của Thể', STATE_SCORE[the.state] || 0);
    if (ctx.nhat.rel) add('Nhật thần', ctx.nhat.rel.score * 0.5);
    add('Hào động', (ctx.line.dacVi ? 0.5 : -0.5) + (ctx.line.ung ? 0.5 : 0));
    if (ctx.lucThu) {
      var ln = ctx.lucThu.name;
      add('Lục thú', ln === 'Thanh Long' ? 0.5 : (ln === 'Bạch Hổ' ? -0.5 : (ln === 'Huyền Vũ' || ln === 'Đằng Xà' ? -0.25 : 0)));
    }
    if (kd.chinh) add('Nghĩa quẻ Chính (kinh điển)', kd.chinh.score >= 2 ? 0.5 : (kd.chinh.score <= -2 ? -0.5 : 0));
    if (kd.bien) add('Nghĩa quẻ Biến (kinh điển)', kd.bien.score >= 2 ? 0.5 : (kd.bien.score <= -2 ? -0.5 : 0));

    var nSinhTy = ctx.slots.filter(function (s) { return s.rel.k === 'sinhThe' || s.rel.k === 'tyHoa'; }).length;
    var nKhac = ctx.slots.filter(function (s) { return s.rel.k === 'khacThe'; }).length;
    if (nSinhTy >= 3) add('Nhiều lực trợ Thể', 1);
    if (nKhac >= 2 && isWeak(the)) add('Thể bị vây khắc', -2);
    if (dung.rel.k === 'khacThe') {
      var cuu = ctx.slots.some(function (s) { return s.key !== 'dung' && KHAC[s.hanh] === dung.hanh; });
      var mid = SINH[dung.hanh];
      var tq = ctx.slots.some(function (s) { return s.key !== 'dung' && s.hanh === mid && SINH[s.hanh] === the.hanh; });
      if (cuu || tq) add('Có cứu / thông quan', 2);
    }
    return { total: Math.round(total * 10) / 10, comp: comp };
  }

  function verdictOf(s) {
    if (s >= 9) return { t: 'ĐẠI CÁT', c: 'good' };
    if (s >= 4) return { t: 'CÁT', c: 'good' };
    if (s >= 1.5) return { t: 'TIỂU CÁT', c: 'good' };
    if (s > -1.5) return { t: 'BÌNH', c: 'neutral' };
    if (s > -4) return { t: 'TIỂU HUNG', c: 'warn' };
    if (s > -9) return { t: 'HUNG', c: 'bad' };
    return { t: 'ĐẠI HUNG', c: 'bad' };
  }

  // ============================================================
  // 6. LỜI VĂN THEO QUAN HỆ
  // ============================================================
  var TXT_CHINH = {
    sinhThe: 'Dụng sinh Thể – <b>đại cát</b>: sự việc đến giúp mình, dễ thành, có lợi, có người hỗ trợ.',
    tyHoa:   'Thể Dụng tỷ hòa – <b>cát</b>: đồng lòng, thuận hợp, việc thành êm; vượng thì càng tốt.',
    theKhac: 'Thể khắc Dụng – <b>cát vừa</b>: đạt được nhưng chậm, phải chủ động và tốn sức; hợp việc cầu tài, chinh phục.',
    theSinh: 'Thể sinh Dụng – <b>hao tiết</b>: mình bỏ sức, tiền của cho việc; lợi ít hại nhiều, dễ mệt mỏi, cần tính kỹ.',
    khacThe: 'Dụng khắc Thể – <b>hung</b>: sự việc gây áp lực, cản trở, bất lợi cho mình; cần phòng ngừa, tránh làm mạnh.'
  };
  var TXT_HO = {
    sinhThe: 'giữa chừng có người / điều kiện hỗ trợ',
    tyHoa:   'giữa chừng ổn định, có đồng minh',
    theKhac: 'giữa chừng phải nỗ lực nhưng nắm được thế chủ động',
    theSinh: 'giữa chừng hao sức, hao của',
    khacThe: 'giữa chừng gặp trở ngại, áp lực'
  };
  var TXT_BIEN = {
    sinhThe: 'kết quả cuối có lợi, được giúp hoặc được ích',
    tyHoa:   'kết quả yên ổn, đạt gần như mong muốn',
    theKhac: 'kết quả đạt được nhưng muộn hoặc phải trả giá',
    theSinh: 'kết cục hao tổn, sức lực dồn hết mà lợi không tương xứng',
    khacThe: 'kết quả bất lợi, khó như ý'
  };
  var TXT_ADVICE = {
    sinhThe: 'Chủ động đón nhận sự hỗ trợ, nhờ cậy quý nhân; đây là thời điểm thuận để triển khai.',
    tyHoa:   'Hợp tác, đồng lòng; giữ hòa khí và phân chia lợi ích rõ ràng để tránh tranh phần.',
    theKhac: 'Đủ thế chủ động nhưng phải kiên trì bỏ sức; không nóng vội, tính kỹ chi phí.',
    theSinh: 'Đừng dồn quá nhiều sức lực hay tiền của; đặt giới hạn và tìm thêm nguồn hỗ trợ (Ấn) trước khi làm.',
    khacThe: 'Tránh đối đầu trực diện; hoãn hoặc giảm quy mô, tìm người / yếu tố hóa giải, củng cố Thể trước.'
  };

  function dungBienDyn(dung, bien) {
    if (dung.hanh === bien.hanh) return 'Biến cùng hành Dụng: sự việc giữ nguyên bản chất, thay đổi không nhiều.';
    if (SINH[dung.hanh] === bien.hanh) return 'Dụng sinh Biến: sự việc tiêu hao dần, lực yếu đi theo thời gian.';
    if (SINH[bien.hanh] === dung.hanh) return 'Biến sinh Dụng: sự việc được tăng cường, mạnh lên theo thời gian.';
    if (KHAC[dung.hanh] === bien.hanh) return 'Dụng khắc Biến: sự việc tự đè nén, cắt giảm chính nó, khó phát triển thêm.';
    if (KHAC[bien.hanh] === dung.hanh) return 'Biến khắc Dụng: sự việc bị phá vỡ, thay đổi đột ngột hoặc thoái lui.';
    return '';
  }

  function stateTag(s) { return s.state ? tag(s.state, STATE_CLS[s.state]) : ''; }
  function slotLine(s) {
    return '<b>' + esc(s.label) + '</b> – quái ' + esc(s.ten) + ' (' + esc(s.hanh) + ') ' + stateTag(s) + ' ' + tag(s.rel.than.split(' ')[0], s.rel.cls) + ' ' + esc(s.rel.ten);
  }

  // ============================================================
  // 7. ỨNG SỰ THEO CHỦ ĐỀ
  // ============================================================
  function topicBullets(key, ctx, kd) {
    var out = [], the = ctx.the, dung = ctx.dung, slots = ctx.slots;
    var has = function (k) { return slots.filter(function (s) { return s.rel.k === k; }); };
    var fmt = function (arr) { return arr.map(function (s) { return esc(s.label + ' ' + s.ten + ' (' + s.hanh + ', ' + s.state + ')'); }).join('; '); };
    var an = has('sinhThe'), ty = has('tyHoa'), tuTon = has('theSinh'), tai = has('theKhac'), quan = has('khacThe');
    var push = function (cls, html) { out.push({ cls: cls, text: html }); };
    var dungHuong = dung.tuong.huong, bienHuong = ctx.bien.tuong.huong;

    switch (key) {
      case 'sunghiep':
        push('neutral', '<b>Lấy Quan (hành khắc Thể) làm chức vị, cơ hội; Ấn (hành sinh Thể) làm quý nhân, văn bằng.</b>');
        if (!quan.length) push('warn', 'Không thấy Quan trong Dụng, Hỗ, Biến: cơ hội chức vị chưa hiện rõ, phải dựa vào thực lực và Ấn.');
        else if (quan.some(isStrong)) push(quan.length >= 2 ? 'warn' : 'good', 'Có Quan vượng (' + fmt(quan.filter(isStrong)) + '): có cơ hội thăng tiến / nhận vị trí, kèm áp lực' + (quan.length >= 2 ? ' và cạnh tranh lớn' : '') + '.');
        else push('warn', 'Quan hiện nhưng suy (' + fmt(quan) + '): cơ hội có mà thiếu lực, chưa đủ để thành.');
        if (an.length) push('good', 'Có Ấn (' + fmt(an) + '): được quý nhân, cấp trên hoặc giấy tờ hỗ trợ.'); else push('neutral', 'Không có Ấn rõ ràng: cần tự thân vận động, chuẩn bị hồ sơ, năng lực kỹ hơn.');
        if (quan.length && tuTon.length) push('warn', 'Tử tôn chế Quan: dễ va chạm với cấp trên hoặc làm giảm cơ hội chức vị nếu quá thẳng thắn.');
        push(isStrong(the) ? 'good' : (isWeak(the) ? 'warn' : 'neutral'), 'Thể ' + esc(the.state) + ': ' + (isStrong(the) ? 'đủ sức gánh vác trọng trách.' : (isWeak(the) ? 'sức còn yếu, nên chuẩn bị thêm trước khi nhận việc lớn.' : 'sức vừa phải, cần phối hợp thêm nguồn lực.')));
        break;

      case 'tailoc':
        push('neutral', '<b>Lấy Tài (hành Thể khắc) làm tiền của; Tử tôn (hành Thể sinh) là nguồn sinh Tài; Tỷ là người chia phần.</b>');
        if (!tai.length) push('warn', 'Không thấy Tài trong Dụng, Hỗ, Biến: khó có khoản lớn, cần chủ động tạo nguồn thu.');
        else if (tai.some(isStrong)) push('good', 'Tài vượng (' + fmt(tai.filter(isStrong)) + '): có nguồn thu, cơ hội tiền bạc rõ ràng.');
        else push('warn', 'Tài hiện nhưng suy (' + fmt(tai) + '): nguồn thu có mà nhỏ, thiếu bền.');
        if (tai.length && tuTon.length) push('good', 'Tử tôn sinh Tài: nguồn tiền có gốc, đầu tư hoặc làm đều tay sẽ có lãi bền.');
        if (ty.length) push('warn', 'Có Tỷ kiếp (' + fmt(ty) + '): dễ có người cạnh tranh, chia phần hoặc hùn hạp bị hao.');
        if (tai.length && quan.length) push('neutral', 'Tài sinh Quan: tiền kéo theo trách nhiệm, áp lực (thuế, pháp lý, cấp trên) đi kèm.');
        push(dung.rel.k === 'sinhThe' || dung.rel.k === 'theKhac' ? 'good' : (dung.rel.k === 'theSinh' ? 'warn' : 'neutral'), 'Quan hệ Chính: ' + (dung.rel.k === 'sinhThe' ? 'Dụng sinh Thể – có lợi, tiền đến dễ.' : dung.rel.k === 'theKhac' ? 'Thể khắc Dụng – cầu được tài nhưng chậm, phải bỏ công.' : dung.rel.k === 'theSinh' ? 'Thể sinh Dụng – chi nhiều hơn thu, dễ hao tài.' : dung.rel.k === 'khacThe' ? 'Dụng khắc Thể – áp lực chi phí, rủi ro mất tiền.' : 'tỷ hòa – tài ổn định, không đột phá.'));
        break;

      case 'honnhan':
        push('neutral', '<b>Nam xem Tài, nữ xem Quan</b> (Tài = hành Thể khắc; Quan = hành khắc Thể).');
        push(tai.length ? (tai.some(isStrong) ? 'good' : 'warn') : 'neutral', 'Tài (bạn đời với nam): ' + (tai.length ? fmt(tai) : 'không hiện trong quẻ.'));
        push(quan.length ? (quan.some(isStrong) ? 'good' : 'warn') : 'neutral', 'Quan (bạn đời với nữ): ' + (quan.length ? fmt(quan) : 'không hiện trong quẻ.'));
        push(dung.rel.cls, dung.rel.k === 'sinhThe' ? 'Dụng sinh Thể: duyên thuận, đối phương có thiện chí, hai bên hòa hợp.' : dung.rel.k === 'tyHoa' ? 'Tỷ hòa: hợp tính, đồng điệu, bình đẳng.' : dung.rel.k === 'theKhac' ? 'Thể khắc Dụng: mình chủ động, đối phương thụ động; thành nhưng chậm.' : dung.rel.k === 'theSinh' ? 'Thể sinh Dụng: mình đầu tư tình cảm nhiều hơn, dễ thiệt.' : 'Dụng khắc Thể: đối phương / hoàn cảnh gây áp lực, dễ trắc trở.');
        push(ctx.bien.rel.cls, 'Biến quái (' + esc(ctx.bien.rel.ten) + '): ' + TXT_BIEN[ctx.bien.rel.k] + '.');
        break;

      case 'kientung':
        push('neutral', '<b>Thể là mình, Dụng là đối phương / vụ việc; Quan là áp lực từ cơ quan xét xử; Ấn là giấy tờ, chứng cứ, quý nhân.</b>');
        if (dung.rel.k === 'theKhac' && isStrong(the)) push('good', 'Thể vượng khắc Dụng: <b>thế thắng</b>.');
        else if (dung.rel.k === 'khacThe' && !isStrong(the)) push('bad', 'Dụng khắc Thể, Thể không vượng: <b>thế yếu</b>, dễ thua nếu đối đầu.');
        else if (dung.rel.k === 'sinhThe' || dung.rel.k === 'tyHoa') push('good', 'Dụng sinh / hòa với Thể: <b>nên hòa giải</b>, kết quả thuận cho mình.');
        else push('neutral', 'Thế cân bằng, kết quả phụ thuộc chứng cứ và người trợ giúp.');
        if (an.length) push('good', 'Có Ấn (' + fmt(an) + '): giấy tờ, chứng cứ, quý nhân hỗ trợ.');
        if (quan.length) push('warn', 'Có Quan (' + fmt(quan) + '): áp lực từ bên xét xử / cơ quan chức năng.');
        if (quan.length && tuTon.length) push('good', 'Tử tôn chế Quan: có cách hóa giải, luật sư / người đại diện giỏi sẽ giảm áp lực.');
        break;

      case 'suckhoe':
        push('neutral', '<b>Dụng là nơi phát bệnh; Quan là bệnh khí; Ấn là sự chăm sóc, thuốc bổ; Tử tôn là thầy thuốc, thuốc chữa.</b>');
        push('neutral', 'Bộ phận liên quan theo tượng Dụng (' + esc(dung.ten) + '): ' + esc(dung.tuong.coThe) + '; theo Biến (' + esc(ctx.bien.ten) + '): ' + esc(ctx.bien.tuong.coThe) + '.');
        push(dung.rel.k === 'khacThe' ? (isWeak(dung) ? 'warn' : 'bad') : (dung.rel.k === 'theSinh' ? 'warn' : 'good'), dung.rel.k === 'khacThe' ? 'Dụng khắc Thể: bệnh khí mạnh' + (isWeak(dung) ? ', nhưng Dụng suy nên mức độ giảm bớt.' : ', cần điều trị sớm, không nên chủ quan.') : (dung.rel.k === 'theSinh' ? 'Thể sinh Dụng: sức bị bào mòn, hồi phục chậm.' : 'Quan hệ Thể Dụng thuận: bệnh có xu hướng nhẹ, hồi phục được.'));
        if (an.length) push('good', 'Có Ấn: được người chăm sóc, điều dưỡng tốt.');
        if (tuTon.length) push('good', 'Có Tử tôn: gặp thầy, gặp thuốc đúng.');
        push(isStrong(the) ? 'good' : (isWeak(the) ? 'warn' : 'neutral'), 'Thể ' + esc(the.state) + ': ' + (isStrong(the) ? 'sức đề kháng tốt, chuyển biến thuận.' : (isWeak(the) ? 'sức yếu, cần nghỉ ngơi, bồi bổ.' : 'sức vừa phải.')));
        push('neutral', '<i>Chỉ mang tính tham khảo theo Dịch học; khi có triệu chứng cần khám và điều trị theo chỉ định y tế.</i>');
        break;

      case 'thicu':
        push('neutral', '<b>Ấn (sinh Thể) là văn thư, kiến thức; Quan là danh vị, kết quả thi; Tài phá Ấn nên dễ sao nhãng.</b>');
        if (an.length && an.some(isStrong)) push('good', 'Ấn vượng (' + fmt(an.filter(isStrong)) + '): kiến thức chắc, có người dẫn dắt.');
        else if (an.length) push('warn', 'Ấn hiện nhưng suy: học có nhưng chưa sâu, cần ôn kỹ.');
        else push('warn', 'Không thấy Ấn: nền tảng chưa vững, phải bổ sung.');
        if (quan.length && quan.some(isStrong)) push('good', 'Quan vượng: có danh vị, dễ đạt kết quả tốt.');
        if (tai.length && an.length) push('warn', 'Tài khắc Ấn: dễ bị phân tâm bởi tiền bạc, giải trí, làm giảm hiệu quả ôn tập.');
        push(dung.rel.cls, 'Chính: ' + TXT_CHINH[dung.rel.k]);
        break;

      case 'dixa':
        push('neutral', '<b>Xem Dụng và Biến: sinh / hòa Thể là thuận đường; khắc Thể là trắc trở; Tài là có lợi.</b>');
        push(dung.rel.cls, 'Chính: ' + TXT_CHINH[dung.rel.k]);
        push(ctx.bien.rel.cls, 'Điểm đến / kết quả: ' + TXT_BIEN[ctx.bien.rel.k] + '.');
        if (quan.length) push('warn', 'Có Quan (' + fmt(quan) + '): cẩn trọng giấy tờ, an toàn đi lại, va chạm.');
        if (tai.length) push('good', 'Có Tài: chuyến đi có lợi, thu hoạch.');
        var goodH = (an[0] || ty[0]); if (goodH) push('good', 'Hướng thuận: ' + esc(goodH.tuong.huong) + ' (quái ' + esc(goodH.ten) + ').');
        if (quan[0]) push('warn', 'Hướng nên tránh: ' + esc(quan[0].tuong.huong) + ' (quái ' + esc(quan[0].ten) + ').');
        break;

      case 'timnguoi':
        push('neutral', '<b>Dụng là người / vật cần tìm; Biến là nơi đến; Hỗ là quá trình đi qua.</b>');
        push('neutral', 'Hướng của Dụng: <b>' + esc(dungHuong) + '</b> (quái ' + esc(dung.ten) + ': ' + esc(dung.tuong.vat) + '); hướng của Biến: <b>' + esc(bienHuong) + '</b>.');
        push(dung.rel.k === 'theKhac' ? 'good' : (dung.rel.k === 'khacThe' ? 'bad' : dung.rel.cls), dung.rel.k === 'theKhac' ? 'Thể khắc Dụng: tìm được nhưng chậm, cần bền bỉ.' : dung.rel.k === 'sinhThe' ? 'Dụng sinh Thể: dễ gặp, có thể tự tìm về.' : dung.rel.k === 'tyHoa' ? 'Tỷ hòa: tìm được, người / vật ở gần đồng hương, đồng nghiệp.' : dung.rel.k === 'theSinh' ? 'Thể sinh Dụng: tốn công, khó thu hồi.' : 'Dụng khắc Thể: khó tìm, đối phương lẩn tránh hoặc bị che giấu.');
        push('neutral', 'Đặc điểm người theo tượng Dụng: ' + esc(dung.tuong.nguoi) + '.');
        break;

      case 'nhacua':
        push('neutral', '<b>Dụng quái là nhà / đất; Thể là chủ nhà.</b>');
        push('neutral', 'Tượng nhà theo Dụng (' + esc(dung.ten) + '): hướng ' + esc(dungHuong) + ', ' + esc(dung.tuong.tinh) + '.');
        push(dung.rel.cls, TXT_CHINH[dung.rel.k]);
        push(ctx.bien.rel.cls, 'Tương lai: ' + TXT_BIEN[ctx.bien.rel.k] + '.');
        if (quan.length) push('warn', 'Có Quan: chú ý pháp lý, tranh chấp đất đai, giấy tờ.');
        break;

      default: // tổng quát
        push(dung.rel.cls, 'Hiện tại: ' + TXT_CHINH[dung.rel.k]);
        push(sgn((ctx.hoT.rel.score + ctx.hoD.rel.score) / 2), 'Giữa chừng: ' + TXT_HO[ctx.hoT.rel.k] + ' (Hỗ thượng), ' + TXT_HO[ctx.hoD.rel.k] + ' (Hỗ hạ).');
        push(ctx.bien.rel.cls, 'Kết quả: ' + TXT_BIEN[ctx.bien.rel.k] + '.');
        if (an.length) push('good', 'Có quý nhân / chỗ dựa (Ấn): ' + fmt(an) + '.');
        if (quan.length) push('warn', 'Điểm cần phòng (Quan): ' + fmt(quan) + '.');
        break;
    }
    return out;
  }

  // ============================================================
  // 8. ỨNG KỲ
  // ============================================================
  function timing(ctx) {
    var the = ctx.the, dung = ctx.dung, out = [];
    var inH = Object.keys(SINH).filter(function (x) { return SINH[x] === the.hanh; })[0];
    var khH = Object.keys(KHAC).filter(function (x) { return KHAC[x] === the.hanh; })[0];
    var speed = { sinhThe: 'ứng <b>nhanh</b>, thuận lợi', tyHoa: 'ứng <b>vừa phải</b>, ổn định', theKhac: 'ứng <b>chậm</b>, phải nỗ lực', theSinh: 'ứng <b>trì hoãn</b>, dễ hao', khacThe: 'trở ngại xuất hiện <b>sớm</b>, chỉ tan khi qua thời điểm hành khắc suy' }[dung.rel.k];
    out.push({ cls: dung.rel.cls, text: 'Nhịp ứng nghiệm theo quan hệ Thể – Dụng: ' + speed + '.' });
    out.push({ cls: 'good', text: '<b>Mốc thuận</b>: tháng âm ' + HANH_THANG[the.hanh].join(', ') + ' (hành Thể ' + esc(the.hanh) + ') và tháng ' + HANH_THANG[inH].join(', ') + ' (hành ' + esc(inH) + ' sinh Thể). Ngày / giờ có chi ' + esc(HANH_CHI[the.hanh]) + ' hoặc ' + esc(HANH_CHI[inH]) + '.' });
    out.push({ cls: 'warn', text: '<b>Mốc cần thận trọng</b>: tháng âm ' + HANH_THANG[khH].join(', ') + ' (hành ' + esc(khH) + ' khắc Thể); ngày / giờ có chi ' + esc(HANH_CHI[khH]) + '.' });
    out.push({ cls: 'neutral', text: '<b>Con số ứng</b> (theo số quái đã dùng để lập quẻ): Dụng ' + dung.n + ', Biến ' + ctx.bien.n + ', Thể ' + the.n + ', hào động ' + ctx.ml + '. Ứng trong khoảng ' + dung.n + ' hoặc ' + ctx.bien.n + ' (giờ / ngày / tuần / tháng tùy quy mô sự việc).' });
    if (ctx.nhat.rel) out.push({ cls: ctx.nhat.rel.cls, text: '<b>Nhật thần</b> ' + esc(ctx.nhat.text) + ' (' + esc(ctx.nhat.hanh) + ') ' + esc(ctx.nhat.rel.ten) + ': ' + (ctx.nhat.rel.k === 'sinhThe' || ctx.nhat.rel.k === 'tyHoa' ? 'ngày lập quẻ đang nâng đỡ Thể, thuận cho khởi sự.' : ctx.nhat.rel.k === 'khacThe' ? 'ngày lập quẻ đang áp chế Thể, nên tránh quyết định vội trong ngày.' : ctx.nhat.rel.k === 'theKhac' ? 'Thể chế được ngày, thế chủ động.' : 'Thể bị tiết vào ngày này, hao lực.') });
    if (ctx.gio.rel) out.push({ cls: ctx.gio.rel.cls, text: '<b>Giờ lập quẻ</b> ' + esc(ctx.gio.text) + ' (' + esc(ctx.gio.hanh) + ') ' + esc(ctx.gio.rel.ten) + '.' });
    return out;
  }

  // ============================================================
  // 9. ĐỐI CHIẾU CHÉO (Lạc Việt, Kỳ Môn, danh sách quẻ tốt)
  // ============================================================
  function crossChecks(ctx, verdict) {
    var out = [], support = 0, total = 0;
    var mhPol = verdict.c === 'good' ? 1 : (verdict.c === 'bad' || verdict.c === 'warn' ? -1 : 0);

    // Cặp Chính → Biến nằm trong danh sách "quẻ tốt"
    try {
      var key = ctx.names.chinh + '_' + ctx.names.bien;
      if (typeof GOOD_MAI_HOA_QUE !== 'undefined') {
        if (GOOD_MAI_HOA_QUE.has(key)) out.push({ cls: 'good', text: 'Cặp <b>' + esc(ctx.names.chinh) + ' → ' + esc(ctx.names.bien) + '</b> thuộc danh sách quẻ Mai Hoa tốt đã lưu trong hệ thống.' });
        else out.push({ cls: 'neutral', text: 'Cặp ' + esc(ctx.names.chinh) + ' → ' + esc(ctx.names.bien) + ' không nằm trong danh sách quẻ Mai Hoa tốt đã lưu (không có nghĩa là xấu).' });
      }
    } catch (e) { /* bỏ qua */ }

    // Tốt cho
    try {
      if (typeof TOT_CHO_MAP !== 'undefined') {
        var tc = TOT_CHO_MAP.find(function (t) { return t.mainGua === ctx.names.chinh && t.changedGua === ctx.names.bien; });
        if (tc) out.push({ cls: 'good', text: '<b>Tốt cho</b> (theo cặp quẻ): ' + esc(clip(tc.content, 320)) });
      }
    } catch (e2) { /* bỏ qua */ }

    // Lạc Việt
    try {
      if (ctx.lacViet && ctx.lacViet.name) {
        var good = (typeof GOOD_LAC_VIET_QUE !== 'undefined') && GOOD_LAC_VIET_QUE.has(ctx.lacViet.name);
        total++;
        var lvPol = good ? 1 : 0;
        if (mhPol >= 0 && good) support++;
        if (mhPol < 0 && !good) support++;
        var msg;
        if (good && mhPol > 0) msg = 'Lạc Việt và Mai Hoa <b>cùng thuận</b>: độ tin cậy cao hơn.';
        else if (good && mhPol < 0) msg = 'Lạc Việt thuận nhưng Mai Hoa bất lợi: <b>tín hiệu mâu thuẫn</b>, nên thận trọng, ưu tiên xem thêm hoàn cảnh thực tế.';
        else if (!good && mhPol > 0) msg = 'Mai Hoa thuận nhưng Lạc Việt chưa xác nhận: nên tiến từng bước.';
        else if (!good && mhPol < 0) msg = 'Hai hệ <b>cùng cảnh báo</b>: nên hoãn hoặc giảm rủi ro.';
        else msg = 'Mai Hoa ở mức bình; Lạc Việt ' + (good ? 'thuận' : 'chưa thuộc nhóm thuận') + '.';
        out.push({ cls: lvPol && mhPol >= 0 ? 'good' : (mhPol < 0 && !good ? 'bad' : 'neutral'), text: '<b>Đối chiếu Lạc Việt</b> (quẻ ' + esc(ctx.lacViet.name) + '' + (good ? ', thuộc nhóm quẻ tốt' : '') + '): ' + msg });
      }
    } catch (e3) { /* bỏ qua */ }

    // Kỳ Môn
    try {
      var c = root.__LAST_CHART;
      if (c && c.zhiShi && c.zhiShi.mon) {
        var mon = c.zhiShi.mon, cat = ['Khai', 'Hưu', 'Sinh'], hung = ['Thương', 'Kinh', 'Tử'];
        var monCls = cat.indexOf(mon) >= 0 ? 'good' : (hung.indexOf(mon) >= 0 ? 'bad' : 'neutral');
        var nCat = (c.specialPatterns && c.specialPatterns.auspicious ? c.specialPatterns.auspicious.length : 0);
        var nHung = (c.specialPatterns && c.specialPatterns.inauspicious ? c.specialPatterns.inauspicious.length : 0);
        total++;
        if ((monCls === 'good' && mhPol >= 0) || (monCls === 'bad' && mhPol < 0) || (monCls === 'neutral' && mhPol === 0)) support++;
        out.push({ cls: monCls, text: '<b>Đối chiếu Kỳ Môn</b> (cùng thời điểm): Trực Sử <b>' + esc(mon) + ' Môn</b> ' + (monCls === 'good' ? '(cát môn)' : monCls === 'bad' ? '(hung môn)' : '(bình)') + '; toàn bàn có ' + nCat + ' cách cục cát và ' + nHung + ' cách cục hung.' + (monCls === 'good' && mhPol > 0 ? ' Hai hệ đồng thuận.' : (monCls === 'bad' && mhPol < 0 ? ' Hai hệ cùng cảnh báo.' : (monCls !== 'neutral' && mhPol !== 0 ? ' Hai hệ chưa đồng thuận, cần cân nhắc.' : ''))) });
      }
    } catch (e4) { /* bỏ qua */ }

    if (total > 0) out.push({ cls: support === total ? 'good' : (support === 0 ? 'warn' : 'neutral'), text: '<b>Mức đồng thuận giữa các hệ</b>: ' + support + '/' + total + ' hệ đối chiếu cùng chiều với Mai Hoa.' });
    return { items: out, support: support, total: total };
  }

  // ============================================================
  // 10. LẮP RÁP KẾT QUẢ
  // ============================================================
  function analyze(state, topicKey) {
    topicKey = topicKey && TOPICS[topicKey] ? topicKey : 'tongquat';
    var ctx = buildContext(state);
    var the = ctx.the, dung = ctx.dung, bien = ctx.bien, hoT = ctx.hoT, hoD = ctx.hoD, info = ctx.info;

    var pChinh = parseHex(ctx.names.chinh), pHo = parseHex(ctx.names.ho), pBien = parseHex(ctx.names.bien);
    var kd = {
      chinh: pChinh ? sentimentOf(pChinh.intro) : null,
      ho: pHo ? sentimentOf(pHo.intro) : null,
      bien: pBien ? sentimentOf(pBien.intro) : null
    };

    var sc = score(ctx, kd);
    var vd = verdictOf(sc.total);
    var trend = trendOf(dung.rel.score, (hoT.rel.score + hoD.rel.score) / 2, bien.rel.score);
    var patterns = detectPatterns(ctx);
    var cross = crossChecks(ctx, vd);
    var html = '';

    // ---------- Tiêu đề + chọn chủ đề ----------
    var head = 'Quẻ lập lúc <b>giờ ' + esc(info.hourCanChi || '?') + '</b>, ngày <b>' + esc(info.dayCanChi || '?') + '</b>, tháng âm <b>' + esc(info.lunarMonth) + (info.lunarLeap ? ' (nhuận)' : '') + '</b>, năm <b>' + esc(info.yearCanChi || info.lunarYear || '?') + '</b> (âm lịch ' + esc(info.lunarDay) + '/' + esc(info.lunarMonth) + '/' + esc(info.lunarYear) + ').';
    var opts = TOPIC_ORDER.map(function (k) { return '<option value="' + k + '"' + (k === topicKey ? ' selected' : '') + '>' + esc(TOPICS[k].ten) + '</option>'; }).join('');
    html += '<div class="mha-head"><h2>PHÂN TÍCH MAI HOA CHUYÊN SÂU</h2><div class="mha-sub">' + head + '</div>' +
      '<div class="mha-topic"><label for="mhaTopic">Chủ đề xem:</label><select id="mhaTopic">' + opts + '</select></div></div>';

    // ---------- A. Kết luận nhanh ----------
    var quick = [];
    quick.push(li('<b>Kết luận:</b> ' + tag(vd.t, vd.c) + ' <span class="mha-muted">(điểm tham khảo ' + (sc.total > 0 ? '+' : '') + sc.total + ', thang khoảng −14 → +14)</span>', vd.c));
    quick.push(li('<b>Thể – Dụng:</b> Thể ' + esc(the.ten) + ' (' + esc(the.hanh) + ', ' + esc(the.state) + ') – Dụng ' + esc(dung.ten) + ' (' + esc(dung.hanh) + ', ' + esc(dung.state) + '). ' + TXT_CHINH[dung.rel.k], dung.rel.cls));
    quick.push(li('<b>Diễn tiến:</b> ' + tag('Khởi ' + (trend.A === 'good' ? '↑' : trend.A === 'bad' ? '↓' : '→'), trend.A) + ' ' + tag('Giữa ' + (trend.B === 'good' ? '↑' : trend.B === 'bad' ? '↓' : '→'), trend.B) + ' ' + tag('Kết ' + (trend.C === 'good' ? '↑' : trend.C === 'bad' ? '↓' : '→'), trend.C) + ' ' + esc(trend.text), sgn(bien.rel.score)));
    quick.push(li('<b>Kết quả (Biến ' + esc(ctx.names.bien) + '):</b> ' + esc(TXT_BIEN[bien.rel.k]) + '.', bien.rel.cls));
    var tm = timing(ctx);
    quick.push(li('<b>Ứng kỳ:</b> ' + tm[0].text, tm[0].cls));
    quick.push(li('<b>Khuyến nghị:</b> ' + esc(TXT_ADVICE[dung.rel.k]), dung.rel.cls));
    if (cross.total > 0) quick.push(li('<b>Đồng thuận liên hệ:</b> ' + cross.support + '/' + cross.total + ' hệ đối chiếu (Lạc Việt, Kỳ Môn nếu có bàn) cùng chiều với Mai Hoa.', cross.support === cross.total ? 'good' : 'neutral'));
    html += '<div class="mha-quick ' + vd.c + '"><h3>⚡ KẾT LUẬN NHANH</h3><ul>' + quick.join('') + '</ul></div>';

    // ---------- 1. Cấu trúc quẻ ----------
    var s1 = [];
    s1.push(li('<b>Quẻ Chính:</b> ' + esc(ctx.names.chinh) + ' – ngoại (thượng) quái ' + esc(triName(ctx.mh.mainGua.upper)) + ', nội (hạ) quái ' + esc(triName(ctx.mh.mainGua.lower)) + ' (độ số ' + esc(ctx.mh.mainGua.degree) + ').'));
    s1.push(li('<b>Quẻ Hỗ:</b> ' + esc(ctx.names.ho) + ' (thượng ' + esc(hoT.ten) + ' – hạ ' + esc(hoD.ten) + '), lấy từ hào 2-3-4 và 3-4-5 của quẻ Chính.'));
    s1.push(li('<b>Quẻ Biến:</b> ' + esc(ctx.names.bien) + ' (thượng ' + esc(triName(ctx.mh.changedGua.upper)) + ' – hạ ' + esc(triName(ctx.mh.changedGua.lower)) + '), đổi hào ' + LINE_NAMES[ctx.ml - 1] + '.'));
    s1.push(li('<b>Hào động:</b> hào ' + ctx.ml + ' (' + LINE_NAMES[ctx.ml - 1] + ') nằm ở ' + (ctx.dungOnLower ? 'hạ quái' : 'thượng quái') + ' nên quái ' + esc(dung.ten) + ' là <b>Dụng</b>, quái ' + esc(the.ten) + ' là <b>Thể</b> (bản thân người hỏi).'));
    s1.push(li('<b>Biến quái của Dụng:</b> ' + esc(dung.ten) + ' (' + esc(dung.hanh) + ') → ' + esc(bien.ten) + ' (' + esc(bien.hanh) + ').'));
    html += sec('1. LẬP QUẺ &amp; CẤU TRÚC', s1);

    // ---------- 2. Thể – Dụng – Ngũ hành – Nguyệt lệnh ----------
    var s2 = [];
    s2.push(li('<b>Thể:</b> quái ' + esc(the.ten) + ', hành ' + esc(the.hanh) + ' ' + stateTag(the) + ' – ' + esc(seasonName(ctx.lm)) + ' (tháng âm ' + ctx.lm + '). ' + (isStrong(the) ? 'Thể được nguyệt lệnh nâng đỡ: có lực.' : (isWeak(the) ? 'Thể bị nguyệt lệnh chế: lực yếu, dễ bị áp.' : 'Thể ở thế nghỉ: lực vừa.')), isStrong(the) ? 'good' : (isWeak(the) ? 'warn' : '')));
    s2.push(li('<b>Dụng:</b> quái ' + esc(dung.ten) + ', hành ' + esc(dung.hanh) + ' ' + stateTag(dung) + ' → ' + TXT_CHINH[dung.rel.k], dung.rel.cls));
    s2.push(li('<b>Nghĩa Lục thân:</b> Dụng là ' + esc(dung.rel.than) + ' – ' + esc(dung.rel.nghia) + '.'));
    s2.push(li(slotLine(hoT) + ' – ' + esc(TXT_HO[hoT.rel.k]) + '.', hoT.rel.cls));
    s2.push(li(slotLine(hoD) + ' – ' + esc(TXT_HO[hoD.rel.k]) + '.', hoD.rel.cls));
    s2.push(li(slotLine(bien) + ' – ' + esc(TXT_BIEN[bien.rel.k]) + '.', bien.rel.cls));
    if (ctx.nhat.rel) s2.push(li('<b>Nhật thần</b> ' + esc(ctx.nhat.text) + ' (' + esc(ctx.nhat.hanh) + '): ' + esc(ctx.nhat.rel.ten) + ' – ' + (ctx.nhat.rel.score > 0 ? 'hỗ trợ Thể.' : (ctx.nhat.rel.score < 0 ? 'bất lợi cho Thể.' : 'trung tính.')), ctx.nhat.rel.cls));
    html += sec('2. THỂ – DỤNG – NGŨ HÀNH – NGUYỆT LỆNH', s2, 'Vượng · Tướng · Hưu · Tù · Tử được tính theo tháng âm; Lục thân tính so với hành của Thể.');

    // ---------- 3. Hào động ----------
    var L = ctx.line, s3 = [];
    s3.push(li('<b>Vị trí:</b> ' + esc(LINE_MEANING[ctx.ml - 1]) + '.'));
    s3.push(li('<b>Bản hào:</b> ' + (L.isDuong ? 'Dương' : 'Âm') + ' ở vị ' + (ctx.ml % 2 === 1 ? 'lẻ (dương)' : 'chẵn (âm)') + ' → ' + (L.dacVi ? tag('Đắc vị', 'good') + ' chính đáng, thuận thế.' : tag('Thất vị', 'warn') + ' âm dương lệch vị, làm việc dễ gượng ép.'), L.dacVi ? 'good' : 'warn'));
    if (L.trung) s3.push(li(tag('Đắc trung', 'good') + ' hào ' + ctx.ml + ' ở giữa quái: giữ được điều độ, ít cực đoan.', 'good'));
    s3.push(li('<b>Ứng hào</b> (hào ' + L.partnerIdx + '): ' + (L.partnerBit === 1 ? 'Dương' : 'Âm') + ' – ' + (L.ung ? tag('Tương ứng', 'good') + ' trên dưới hợp nhau, việc có người đáp lại.' : tag('Không tương ứng', 'warn') + ' cùng tính, ít hỗ trợ lẫn nhau, việc dễ đơn độc.'), L.ung ? 'good' : 'warn'));
    s3.push(li('<b>Hướng biến:</b> ' + (L.isDuong ? 'Dương biến Âm – từ cương sang nhu, sức mạnh thu lại, thiên về thoái, nội liễm.' : 'Âm biến Dương – từ nhu sang cương, tích lũy chuyển thành hành động, thiên về tiến.')));
    if (ctx.lucThu) s3.push(li('<b>Lục thú tại hào động:</b> ' + tag(ctx.lucThu.name, ctx.lucThu.name === 'Thanh Long' ? 'good' : (ctx.lucThu.name === 'Bạch Hổ' ? 'bad' : 'neutral')) + ' – ' + esc(LUC_THU_Y[ctx.lucThu.name] || '') + '.', ctx.lucThu.name === 'Thanh Long' ? 'good' : (ctx.lucThu.name === 'Bạch Hổ' ? 'bad' : '')));
    html += sec('3. HÀO ĐỘNG', s3);

    // ---------- 4. Hỗ ----------
    var s4 = [];
    var hoScore = (hoT.rel.score + hoD.rel.score) / 2;
    s4.push(li('Quẻ Hỗ <b>' + esc(ctx.names.ho) + '</b> phản ánh <b>quá trình, diễn biến giữa chừng</b>. Tổng hợp: ' + tag(sgn(hoScore) === 'good' ? 'Thuận' : (sgn(hoScore) === 'bad' ? 'Bất lợi' : 'Trung tính'), sgn(hoScore)), sgn(hoScore)));
    s4.push(li('Hỗ thượng ' + esc(hoT.ten) + ': ' + esc(TXT_HO[hoT.rel.k]) + '.', hoT.rel.cls));
    s4.push(li('Hỗ hạ ' + esc(hoD.ten) + ': ' + esc(TXT_HO[hoD.rel.k]) + '.', hoD.rel.cls));
    if (kd.ho) s4.push(li('Nghĩa quẻ Hỗ: ' + tag(kd.ho.label, kd.ho.cls) + ' ' + esc(clip(pHo.intro, 230))));
    html += sec('4. QUẺ HỖ – DIỄN BIẾN GIỮA CHỪNG', s4);

    // ---------- 5. Biến ----------
    var s5 = [];
    s5.push(li('Quẻ Biến <b>' + esc(ctx.names.bien) + '</b> phản ánh <b>kết quả cuối cùng</b>: ' + esc(TXT_BIEN[bien.rel.k]) + '.', bien.rel.cls));
    s5.push(li('<b>Xu hướng Dụng → Biến:</b> ' + esc(dungBienDyn(dung, bien))));
    s5.push(li('<b>Tổng quan quá trình:</b> ' + esc(trend.text), sgn(bien.rel.score)));
    if (kd.bien) s5.push(li('Nghĩa quẻ Biến: ' + tag(kd.bien.label, kd.bien.cls) + ' ' + esc(clip(pBien.intro, 230))));
    html += sec('5. QUẺ BIẾN – KẾT QUẢ', s5);

    // ---------- 6. Cách cục đặc biệt ----------
    var s6 = patterns.length ? patterns.map(function (p) { return li(p.text, p.cls); }) : [li('Không phát hiện cách cục đặc biệt; xét theo quan hệ sinh khắc thông thường ở các mục trên.')];
    html += sec('6. CÁCH CỤC ĐẶC BIỆT', s6);

    // ---------- 7. Nội dung quẻ kinh điển ----------
    var s7 = [];
    function classical(label, name, p, sent) {
      if (!p) { s7.push(li('<b>' + label + ' ' + esc(name) + ':</b> chưa có dữ liệu chi tiết.')); return; }
      var mt = '';
      if (p.months && p.months.length) {
        var hit = p.months.indexOf(ctx.lm) >= 0;
        mt = ' Tháng tốt: ' + p.months.join(', ') + (hit ? ' ' + tag('tháng hiện tại trùng', 'good') : '') + '.';
      }
      s7.push(li('<b>' + label + ' ' + esc(name) + '</b> ' + tag(sent.label, sent.cls) + ': ' + esc(clip(p.intro, 260)) + mt, sent.cls === 'good' ? 'good' : (sent.cls === 'bad' ? 'bad' : '')));
    }
    classical('Chính', ctx.names.chinh, pChinh, kd.chinh || { label: '', cls: 'neutral' });
    classical('Hỗ', ctx.names.ho, pHo, kd.ho || { label: '', cls: 'neutral' });
    classical('Biến', ctx.names.bien, pBien, kd.bien || { label: '', cls: 'neutral' });
    if (pChinh && pChinh.bad && pChinh.bad.length) s7.push(li('<b>Điểm cần lưu ý của quẻ Chính:</b> ' + pChinh.bad.slice(0, 3).map(function (x) { return esc(clip(x, 120)); }).join(' · '), 'warn'));
    html += sec('7. NỘI DUNG QUẺ KINH ĐIỂN (LIÊN KẾT DỮ LIỆU CÓ SẴN)', s7, 'Trích từ dữ liệu quẻ đã có trong hệ thống; phần cát/hung ở đây chỉ là đánh giá sơ bộ theo từ ngữ của văn bản.');

    // ---------- 8. Ứng sự theo chủ đề ----------
    var tb = topicBullets(topicKey, ctx, kd);
    var s8 = tb.map(function (b) { return li(b.text, b.cls); });
    var citations = [];
    [{ n: ctx.names.chinh, tag: 'Chính' }, { n: ctx.names.bien, tag: 'Biến' }].forEach(function (q) {
      var items = topicItems(q.n, topicKey).slice(0, topicKey === 'tongquat' ? 4 : 3);
      items.forEach(function (it) { citations.push(li('<span class="mha-muted">Quẻ ' + q.tag + ' ' + esc(q.n) + ' – ' + esc(it.label) + ':</span> ' + esc(clip(it.text, 240)))); });
    });
    if (citations.length) s8.push(li('<b>Theo nội dung quẻ kinh điển (chủ đề ' + esc(TOPICS[topicKey].ten) + '):</b><ul class="mha-sub-ul">' + citations.join('') + '</ul>'));
    html += sec('8. ỨNG SỰ THEO CHỦ ĐỀ: ' + esc(TOPICS[topicKey].ten).toUpperCase(), s8);

    // ---------- 9. Loại tượng ----------
    var s9 = [the, dung, hoT, hoD, bien].map(function (s) {
      var t = s.tuong;
      return li('<b>' + esc(s.label) + ' – ' + esc(s.ten) + ' (' + esc(s.hanh) + '):</b> phương ' + esc(t.huong) + '; người: ' + esc(t.nguoi) + '; cơ thể: ' + esc(t.coThe) + '; tính: ' + esc(t.tinh) + '; màu: ' + esc(t.mau) + '; vật: ' + esc(t.vat) + '.');
    });
    html += sec('9. LOẠI TƯỢNG VẠN VẬT', s9);

    // ---------- 10. Ứng kỳ ----------
    html += sec('10. ỨNG KỲ (THỜI GIAN ỨNG NGHIỆM)', tm.map(function (x) { return li(x.text, x.cls); }));

    // ---------- 11. Đối chiếu chéo ----------
    if (cross.items.length) html += sec('11. ĐỐI CHIẾU CHÉO VỚI CÁC HỆ KHÁC', cross.items.map(function (x) { return li(x.text, x.cls); }));

    // ---------- 12. Hóa giải & lời khuyên ----------
    var s12 = [];
    s12.push(li('<b>Hành động:</b> ' + esc(TXT_ADVICE[dung.rel.k]), dung.rel.cls));
    var inH = Object.keys(SINH).filter(function (x) { return SINH[x] === the.hanh; })[0];
    var ctrl = Object.keys(KHAC).filter(function (x) { return KHAC[x] === dung.hanh; })[0];
    s12.push(li('<b>Tăng cường Thể:</b> dùng hành ' + esc(inH) + ' (sinh Thể) – phương ' + esc(HANH_HUONG[inH]) + ', màu ' + esc(HANH_MAU[inH]) + '; hoặc hành ' + esc(the.hanh) + ' – phương ' + esc(HANH_HUONG[the.hanh]) + ', màu ' + esc(HANH_MAU[the.hanh]) + '.', 'good'));
    if (dung.rel.k === 'khacThe' || dung.rel.k === 'theSinh') s12.push(li('<b>Chế Dụng / hóa giải:</b> hành ' + esc(ctrl) + ' khắc Dụng (' + esc(dung.hanh) + ') – phương ' + esc(HANH_HUONG[ctrl]) + ', màu ' + esc(HANH_MAU[ctrl]) + '; hoặc dùng hành ' + esc(SINH[dung.hanh]) + ' làm cầu nối thông quan.', 'warn'));
    if (vd.c === 'bad' || vd.c === 'warn') s12.push(li('<b>Thận trọng:</b> hoãn quyết định lớn, giảm rủi ro, chờ tháng ' + HANH_THANG[the.hanh].concat(HANH_THANG[inH]).sort(function (a, b) { return a - b; }).join(', ') + ' âm hoặc khi hành ' + esc(inH) + ' vượng.', 'warn'));
    else if (vd.c === 'good') s12.push(li('<b>Nắm thời cơ:</b> có thể triển khai; ưu tiên ngày / giờ hành ' + esc(the.hanh) + ' hoặc ' + esc(inH) + ' để thêm thuận.', 'good'));
    s12.push(li('<span class="mha-muted">Lưu ý: kết quả phân tích mang tính tham khảo theo phương pháp Mai Hoa Dịch Số; nên kết hợp hoàn cảnh thực tế và các phương pháp khác.</span>'));
    html += sec('12. LỜI KHUYÊN &amp; HÓA GIẢI', s12);

    // ---------- Bảng điểm ----------
    var det = sc.comp.map(function (c) { return '<li><span>' + esc(c.name) + '</span><b class="' + (c.v > 0 ? 'good' : 'bad') + '">' + (c.v > 0 ? '+' : '') + (Math.round(c.v * 100) / 100) + '</b></li>'; }).join('');
    html += '<details class="mha-score"><summary>Chi tiết cách chấm điểm (' + (sc.total > 0 ? '+' : '') + sc.total + ')</summary><ul>' + det + '</ul></details>';

    return { html: html, verdict: vd, score: sc.total, ctx: ctx };
  }

  // ============================================================
  // 11. GIAO DIỆN
  // ============================================================
  var CSS = '' +
    '#maiHoaAnalysis{display:none;padding:16px;background:#fff;border-top:1px dashed var(--border,#e5e7eb);line-height:1.6;font-size:14.5px;color:var(--text-main,#1f2937)}' +
    '#maiHoaAnalysis.show{display:block;animation:fadeIn .3s ease-in-out}' +
    '#maiHoaAnalysis h2{text-align:center;color:var(--accent,#8b1818);font-size:17px;margin:0 0 4px}' +
    '#maiHoaAnalysis h3{color:var(--accent,#8b1818);font-size:14.5px;margin:0 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border,#e5e7eb)}' +
    '#maiHoaAnalysis ul{margin:6px 0;padding-left:20px}' +
    '#maiHoaAnalysis li{margin:5px 0;text-align:left}' +
    '#maiHoaAnalysis li.good{color:#0f5132}#maiHoaAnalysis li.bad{color:#7f1d1d}#maiHoaAnalysis li.warn{color:#7c4a03}' +
    '.mha-sub{text-align:center;font-size:13px;color:#6b7280;margin-bottom:8px}' +
    '.mha-topic{text-align:center;margin:8px 0 12px}.mha-topic label{font-size:13px;color:#6b7280;margin-right:6px}' +
    '.mha-topic select{padding:5px 8px;border:1px solid var(--border,#e5e7eb);border-radius:6px;font-size:13.5px;background:#fff}' +
    '.mha-quick{border-radius:8px;padding:10px 14px;margin-bottom:14px;border:1px solid #e5e7eb;background:#f8fafc}' +
    '.mha-quick.good{background:#f0fdf4;border-color:#bbf7d0}.mha-quick.bad{background:#fef2f2;border-color:#fecaca}.mha-quick.warn{background:#fff7ed;border-color:#fed7aa}' +
    '.mha-sec{margin:12px 0}.mha-note{font-size:12.5px;color:#6b7280;margin-bottom:2px;font-style:italic}' +
    '.mha-muted{color:#6b7280;font-size:13px}' +
    '.mha-tag{display:inline-block;font-size:11.5px;line-height:1;padding:2px 6px;border-radius:4px;font-family:sans-serif;font-weight:600;white-space:nowrap;vertical-align:1px}' +
    '.mha-tag.good{background:#dcfce7;color:#14532d}.mha-tag.bad{background:#fee2e2;color:#991b1b}.mha-tag.warn{background:#ffedd5;color:#9a3412}.mha-tag.neutral{background:#f1f5f9;color:#475569}' +
    '.mha-sub-ul{margin:4px 0;padding-left:18px;font-size:13.5px}' +
    '.mha-score{margin-top:14px;font-size:13px;color:#475569}.mha-score summary{cursor:pointer}' +
    '.mha-score ul{list-style:none;padding-left:4px}.mha-score li{display:flex;justify-content:space-between;max-width:420px;border-bottom:1px dotted #e5e7eb;margin:2px 0}' +
    '.mha-score b.good{color:#166534}.mha-score b.bad{color:#b91c1c}';

  function injectCss() {
    if (typeof document === 'undefined' || document.getElementById('mha-style')) return;
    var st = document.createElement('style');
    st.id = 'mha-style';
    st.innerHTML = CSS;
    document.head.appendChild(st);
  }

  function panel() { return document.getElementById('maiHoaAnalysis'); }

  function render() {
    var p = panel();
    if (!p) return false;
    var state = root.__MAIHOA_STATE;
    if (!state || !state.maiHoa) return false;
    try {
      p.innerHTML = analyze(state, currentTopic).html;
    } catch (e) {
      console.error('[MaiHoaAnalysis]', e);
      p.innerHTML = '<div style="color:#b42318;padding:10px;">Lỗi phân tích Mai Hoa: ' + esc(e && e.message ? e.message : e) + '</div>';
    }
    return true;
  }

  function toggle() {
    var p = panel();
    if (!p) return;
    if (p.classList.contains('show')) { p.classList.remove('show'); return; }
    if (!root.__MAIHOA_STATE) { alert("Vui lòng nhấn 'Lấy quẻ' trước!"); return; }
    render();
    p.classList.add('show');
  }

  function reset() {
    var p = panel();
    if (p) { p.classList.remove('show'); p.innerHTML = ''; }
  }

  function init() {
    injectCss();
    var btn = document.getElementById('analysisMaiHoaButton');
    if (btn) btn.addEventListener('click', toggle);
    var p = panel();
    if (p) p.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'mhaTopic') { currentTopic = e.target.value; render(); }
    });
  }

  root.MaiHoaAnalysis = { analyze: analyze, render: render, toggle: toggle, reset: reset, _ctx: buildContext };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
