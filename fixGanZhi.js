// fixGanZhi.js
// Chuyển đổi can chi từ Hán sang tiếng Việt (chỉ chuyển ký tự, giữ nguyên cấu trúc)
(function() {
  const STEM_MAP = {
    '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh',
    '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân',
    '壬': 'Nhâm', '癸': 'Quý'
  };
  const BRANCH_MAP = {
    '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão',
    '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi',
    '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi'
  };

  function convertChar(ch) {
    if (STEM_MAP[ch]) return STEM_MAP[ch];
    if (BRANCH_MAP[ch]) return BRANCH_MAP[ch];
    return ch;
  }

  function convertGanZhi(str) {
    if (!str || typeof str !== 'string') return str;
    // Nếu đã có chữ cái thì không chuyển
    if (/[A-Za-zÀ-ỹ]/.test(str)) return str;
    // Xử lý chuỗi 2 ký tự liền (ví dụ "甲子")
    if (str.length === 2) {
      let a = convertChar(str[0]);
      let b = convertChar(str[1]);
      return a + ' ' + b;
    }
    // Xử lý có dấu cách
    let parts = str.split(/\s+/);
    if (parts.length === 2) {
      return convertChar(parts[0]) + ' ' + convertChar(parts[1]);
    }
    return str;
  }

  function convertObject(obj) {
    if (!obj) return;
    if (obj.can) obj.can = convertGanZhi(obj.can);
    if (obj.chi) obj.chi = convertGanZhi(obj.chi);
    // Xóa trường raw nếu có (tránh ảnh hưởng)
    delete obj.raw;
  }

  window.fixChartGanZhi = function(chart) {
    if (!chart) return chart;
    // Bốn trụ
    if (chart.fourPillars) {
      ['year', 'month', 'day', 'hour'].forEach(p => {
        if (chart.fourPillars[p]) convertObject(chart.fourPillars[p]);
      });
    }
    // Tuần thủ
    if (chart.tuanThu && chart.tuanThu.ten) {
      chart.tuanThu.ten = convertGanZhi(chart.tuanThu.ten);
      // Xác định tam nguyên
      const tuan = chart.tuanThu.ten;
      if (tuan === 'Giáp Tý' || tuan === 'Giáp Ngọ') chart.tuanThu.tamNguyen = 'Thượng nguyên';
      else if (tuan === 'Giáp Thân' || tuan === 'Giáp Dần') chart.tuanThu.tamNguyen = 'Trung nguyên';
      else if (tuan === 'Giáp Tuất' || tuan === 'Giáp Thìn') chart.tuanThu.tamNguyen = 'Hạ nguyên';
      else chart.tuanThu.tamNguyen = chart.tuanThu.tamNguyen || 'Không xác định';
      // Không vong
      if (Array.isArray(chart.tuanThu.khongVong)) {
        chart.tuanThu.khongVong = chart.tuanThu.khongVong.map(c => convertGanZhi(c));
      }
    }
    // Các cung
    if (Array.isArray(chart.palaces)) {
      chart.palaces.forEach(p => {
        if (p.thienCanBan) p.thienCanBan = convertGanZhi(p.thienCanBan);
        if (p.diaBan) p.diaBan = convertGanZhi(p.diaBan);
        if (p.anCan) p.anCan = convertGanZhi(p.anCan);
        if (p.khongVong && p.khongVong.chiKhongVong) {
          p.khongVong.chiKhongVong = p.khongVong.chiKhongVong.map(c => convertGanZhi(c));
        }
      });
    }
    return chart;
  };
})();
