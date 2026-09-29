// KyMonCachCuc.js - Động cơ xử lý Cách Cục (Tốt/Xấu) cho Kỳ Môn Độn Giáp
// Tách biệt khỏi Core Engine để dễ dàng thêm bớt quy tắc sau này.
// Tích hợp Đầy đủ Thập Can Khắc Ứng, Tam Kỳ Đắc Sử, Thiên Can Hợp từ Logic AI
// V2: Bổ sung Tinh Môn Tổ Hợp, Ngũ Độn mở rộng, Môn-Nhân tương tác, Đặc biệt

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.KyMonCachCuc = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Hàm tính Lục Nghi Kích Hình (được chuyển từ Engine sang)
  function tinhLucNghiKichHinh(diaBan, sys) {
    const result = [];
    for (let c = 1; c <= 9; c++) {
      if (c === 5 && !diaBan[5]) continue;
      const can = diaBan[c] || '', chiCung = sys.CHI_CHINH_CUNG[c] || '';
      for (const rule of sys.LUC_NGHI_KICH_HINH) {
        if (can === rule.can && rule.cungHD.includes(c)) {
          result.push({ cung: c, can, chiCung, loai: 'hung', desc: `Lục Nghi kích hình: ${rule.desc}` });
        }
      }
    }
    return result;
  }

  // ==================== TỪ ĐIỂN CÁCH CỤC ====================

  // Thập Can Khắc Ứng (giữ nguyên)
  const THAP_CAN_KHAC_UNG = {
    'Mậu+Bính': { loai: 'cat', ten: 'Thanh Long Phản Thủ' },
    'Bính+Mậu': { loai: 'cat', ten: 'Phi Điểu Điệt Huyệt' },
    'Canh+Canh': { loai: 'hung', ten: 'Thái Bạch Đồng Cung' },
    'Canh+Nhâm': { loai: 'hung', ten: 'Di Lạc Thoái Vị' },
    'Nhâm+Canh': { loai: 'hung', ten: 'Thái Bạch Cầm Xà' },
    'Đinh+Quý':  { loai: 'hung', ten: 'Chu Tước Đầu Giang' },
    'Quý+Đinh':  { loai: 'hung', ten: 'Đằng Xà Yểu Kiều' },
    'Canh+Bính': { loai: 'hung', ten: 'Thái Bạch Nhập Huỳnh' },
    'Bính+Canh': { loai: 'hung', ten: 'Huỳnh Hoặc Bột Thái Bạch' },
    'Tân+Ất':    { loai: 'hung', ten: 'Bạch Hổ Xương Cuồng' },
    'Ất+Tân':    { loai: 'hung', ten: 'Thanh Long Đào Tẩu' },
    'Nhâm+Nhâm': { loai: 'hung', ten: 'Thiên La Võng Trương' },
    'Quý+Quý':   { loai: 'hung', ten: 'Thiên Võng Tứ Trương' },
    'Mậu+Mậu':   { loai: 'hung', ten: 'Phục Ngâm Mậu Mậu' },
    'Giáp+Canh': { loai: 'hung', ten: 'Phi Bồng Sát' }
  };

  // Thiên Can Tương Hợp (giữ nguyên)
  const THIEN_CAN_HOP = {
    'Giáp':'Kỷ','Kỷ':'Giáp',
    'Ất':'Canh','Canh':'Ất',
    'Bính':'Tân','Tân':'Bính',
    'Đinh':'Nhâm','Nhâm':'Đinh',
    'Mậu':'Quý','Quý':'Mậu'
  };

  // ==================== BỔ SUNG: TINH MÔN TỔ HỢP ====================
  // Quy tắc: Sao + Môn kết hợp tạo Cách Cục đặc biệt
  const TINH_MON_TO_HOP = [
    // Cát cách
    { sao: 'Thiên Tâm',  mon: 'Khai',   ten: 'Tâm Khai Cách',       loai: 'cat'  },
    { sao: 'Thiên Nhậm', mon: 'Sinh',   ten: 'Nhậm Sinh Cách',      loai: 'cat'  },
    { sao: 'Thiên Phụ',  mon: 'Hưu',    ten: 'Phụ Hưu Cách',        loai: 'cat'  },
    { sao: 'Thiên Anh',  mon: 'Cảnh',   ten: 'Anh Cảnh Cách',       loai: 'cat'  },
    { sao: 'Thiên Phụ',  mon: 'Sinh',   ten: 'Phụ Sinh Phú Quý',    loai: 'cat'  },
    { sao: 'Thiên Tâm',  mon: 'Sinh',   ten: 'Tâm Sinh Nhân Hòa',   loai: 'cat'  },
    { sao: 'Thiên Nhậm', mon: 'Khai',   ten: 'Nhậm Khai Phú Quý',   loai: 'cat'  },
    { sao: 'Thiên Anh',  mon: 'Sinh',   ten: 'Anh Sinh Văn Quý',    loai: 'cat'  },
    // Hung cách
    { sao: 'Thiên Bồng', mon: 'Tử',    ten: 'Bồng Tử Cách',        loai: 'hung' },
    { sao: 'Thiên Trụ',  mon: 'Kinh',  ten: 'Trụ Kinh Cách',       loai: 'hung' },
    { sao: 'Thiên Nhuế', mon: 'Tử',    ten: 'Nhuế Tử Cách',        loai: 'hung' },
    { sao: 'Thiên Xung', mon: 'Thương',ten: 'Xung Thương Cách',     loai: 'hung' },
    { sao: 'Thiên Cầm',  mon: 'Đỗ',    ten: 'Cầm Đỗ Cách',         loai: 'hung' },
    { sao: 'Thiên Bồng', mon: 'Kinh',  ten: 'Bồng Kinh Đại Hung',  loai: 'hung' },
    { sao: 'Thiên Trụ',  mon: 'Tử',    ten: 'Trụ Tử Tuyệt Cách',   loai: 'hung' },
    { sao: 'Thiên Nhuế', mon: 'Kinh',  ten: 'Nhuế Kinh Bất Cát',   loai: 'hung' },
  ];

  // ==================== BỔ SUNG: NGŨ ĐỘN MỞ RỘNG ====================
  // Quy tắc: Bát Thần + Môn + Sao kết hợp
  const NGU_DON_MO_RONG = [
    // Đã có: Thiên, Địa, Nhân, Phong, Vân Độn
    // Bổ sung:
    {
      ten: 'Long Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Lục Hợp' && mon === 'Hưu' && dsSao.includes('Thiên Phụ'),
      loai: 'cat'
    },
    {
      ten: 'Hổ Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Bạch Hổ' && mon === 'Khai' && dsSao.includes('Thiên Tâm'),
      loai: 'hung'
    },
    {
      ten: 'Xà Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Đằng Xà' && mon === 'Hưu' && dsSao.includes('Thiên Nhậm'),
      loai: 'hung'
    },
    {
      ten: 'Hạc Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Thái Âm' && mon === 'Sinh' && dsSao.includes('Thiên Anh'),
      loai: 'cat'
    },
    {
      ten: 'Quỷ Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Câu Trận' && mon === 'Tử' && dsSao.includes('Thiên Bồng'),
      loai: 'hung'
    },
    {
      ten: 'Thần Độn',
      dieu_kien: (than, mon, dsSao) =>
        than === 'Trực Phù' && mon === 'Khai' && dsSao.includes('Thiên Tâm'),
      loai: 'cat'
    },
  ];

  // ==================== BỔ SUNG: MÔN-NHÂN TƯƠNG TÁC ====================
  // Môn tác động lên Can Ngày (Nhân = người hỏi)
  // Dùng trong context có thông tin Can Ngày
  function kiemTraMonNhan(mon, canNgayHanh, sys) {
    if (!mon || !canNgayHanh) return null;
    const hm = sys.NGU_HANH_MON[mon] || '';
    if (!hm) return null;

    // Ngũ hành map (tương sinh/khắc tĩnh)
    const SINH_MAP = { 'Mộc':'Hỏa','Hỏa':'Thổ','Thổ':'Kim','Kim':'Thủy','Thủy':'Mộc' };
    const KHAC_MAP = { 'Mộc':'Thổ','Thổ':'Thủy','Thủy':'Hỏa','Hỏa':'Kim','Kim':'Mộc' };

    if (KHAC_MAP[hm] === canNgayHanh) {
      return { ten: 'Môn Khắc Nhân', loai: 'hung' };
    }
    if (KHAC_MAP[canNgayHanh] === hm) {
      return { ten: 'Nhân Khắc Môn', loai: 'cat' };
    }
    if (SINH_MAP[hm] === canNgayHanh) {
      return { ten: 'Môn Sinh Nhân', loai: 'cat' };
    }
    if (SINH_MAP[canNgayHanh] === hm) {
      return { ten: 'Nhân Sinh Môn', loai: 'neutral' };
    }
    return null;
  }

  // ==================== BỔ SUNG: CÁCH CỤC ĐẶC BIỆT ====================
  const CACH_CUC_DAC_BIET = [
    // Thượng Hạ Bác Chiến: Thiên Bàn và Địa Bàn cùng ngũ hành nhưng khắc Cung
    {
      ten: 'Thượng Hạ Bác Chiến',
      loai: 'hung',
      mo_ta: 'Thiên Can và Địa Can cùng khắc Cung — nội bộ hỗn loạn',
      kiem_tra: (ct, cd, hc, sys) => {
        const KHAC = { 'Mộc':'Thổ','Thổ':'Thủy','Thủy':'Hỏa','Hỏa':'Kim','Kim':'Mộc' };
        const NH_CAN = { 'Giáp':'Mộc','Ất':'Mộc','Bính':'Hỏa','Đinh':'Hỏa','Mậu':'Thổ','Kỷ':'Thổ','Canh':'Kim','Tân':'Kim','Nhâm':'Thủy','Quý':'Thủy' };
        const ht = NH_CAN[ct] || '', hd = NH_CAN[cd] || '';
        return ht && hd && hc && KHAC[ht] === hc && KHAC[hd] === hc;
      }
    },
    // Lão Âm Lão Dương: Cả Thiên Bàn và Địa Bàn đều là Can âm hoặc đều dương
    {
      ten: 'Lão Dương Lão Âm',
      loai: 'neutral',
      mo_ta: 'Cùng cực Âm hoặc cùng cực Dương — trạng thái cực đoan cần chú ý',
      kiem_tra: (ct, cd) => {
        const DUONG = ['Giáp','Bính','Mậu','Canh','Nhâm'];
        const AM   = ['Ất','Đinh','Kỷ','Tân','Quý'];
        return (DUONG.includes(ct) && DUONG.includes(cd)) ||
               (AM.includes(ct)   && AM.includes(cd));
      }
    },
    // Nhật Kỳ Tại Môn: Ất (Nhật Kỳ) đứng ở Bát Môn cát
    {
      ten: 'Nhật Kỳ Tại Môn',
      loai: 'cat',
      mo_ta: 'Ất Kỳ đứng tại Cát Môn — quý nhân ẩn đắc lực',
      kiem_tra: (ct, mon) => ct === 'Ất' && ['Khai','Hưu','Sinh'].includes(mon)
    },
    // Nguyệt Kỳ Tại Môn: Bính (Nguyệt Kỳ) đứng ở Bát Môn cát
    {
      ten: 'Nguyệt Kỳ Tại Môn',
      loai: 'cat',
      mo_ta: 'Bính Kỳ đứng tại Cát Môn — quý nhân công khai sáng rõ',
      kiem_tra: (ct, mon) => ct === 'Bính' && ['Khai','Hưu','Sinh'].includes(mon)
    },
    // Tinh Kỳ Tại Môn: Đinh (Tinh Kỳ) đứng ở Bát Môn cát
    {
      ten: 'Tinh Kỳ Tại Môn',
      loai: 'cat',
      mo_ta: 'Đinh Kỳ đứng tại Cát Môn — quý nhân văn trí xuất hiện',
      kiem_tra: (ct, mon) => ct === 'Đinh' && ['Khai','Hưu','Sinh'].includes(mon)
    },
    // Thiên Cầm Nhập Tù: Thiên Cầm gặp Tử Môn
    {
      ten: 'Thiên Cầm Nhập Tù',
      loai: 'hung',
      mo_ta: 'Thiên Cầm gặp Tử Môn — bị giam cầm, mắc kẹt không lối thoát',
      kiem_tra: (ct, cd, hc, sys, sao, mon) =>
        sao === 'Thiên Cầm' && mon === 'Tử'
    },
    // Mậu Nghi Đắc Sử: Mậu (Thiên Bàn) gặp Cát Môn và Cát Thần
    {
      ten: 'Mậu Nghi Đắc Sử',
      loai: 'cat',
      mo_ta: 'Mậu đứng tại Cát Môn, Cát Thần — vốn liếng phát tài',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        ct === 'Mậu' &&
        ['Khai','Hưu','Sinh'].includes(mon) &&
        ['Trực Phù','Thái Âm','Lục Hợp','Cửu Thiên'].includes(than)
    },
    // Kỷ Nghi Bất Lợi: Kỷ (Thiên Bàn) gặp Hung Môn và Hung Thần
    {
      ten: 'Kỷ Nghi Bất Lợi',
      loai: 'hung',
      mo_ta: 'Kỷ đứng tại Hung Môn, Hung Thần — trở ngại từ nội tâm',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        ct === 'Kỷ' &&
        ['Tử','Kinh','Thương'].includes(mon) &&
        ['Đằng Xà','Bạch Hổ','Huyền Vũ','Câu Trận'].includes(than)
    },
    // Trực Phù Đắc Lệnh: Trực Phù đứng tại cung Càn hoặc Khảm (vị trí quyền lực)
    {
      ten: 'Trực Phù Đắc Lệnh',
      loai: 'cat',
      mo_ta: 'Trực Phù ở vị trí quyền lực — lãnh đạo thuận lợi, được ủng hộ',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than, cung) =>
        than === 'Trực Phù' && [6, 1].includes(cung)
    },
    // Huyền Vũ Bức Cung: Huyền Vũ gặp Sinh Môn — tiền tài bị rò rỉ
    {
      ten: 'Huyền Vũ Bức Sinh',
      loai: 'hung',
      mo_ta: 'Huyền Vũ tại Sinh Môn — tài lộc có nhưng bị thất thoát ngầm',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Huyền Vũ' && mon === 'Sinh'
    },
    // Bạch Hổ Nhập Mộ: Bạch Hổ gặp Tử Môn — tai họa nghiêm trọng
    {
      ten: 'Bạch Hổ Nhập Mộ',
      loai: 'hung',
      mo_ta: 'Bạch Hổ tại Tử Môn — tai nạn, thương vong, cực hung',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Bạch Hổ' && mon === 'Tử'
    },
    // Đằng Xà Nhiễu Loạn: Đằng Xà gặp Cảnh Môn — ngôn ngữ thị phi
    {
      ten: 'Đằng Xà Nhiễu Loạn',
      loai: 'hung',
      mo_ta: 'Đằng Xà tại Cảnh Môn — thị phi, khẩu thiệt, văn thư bất lợi',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Đằng Xà' && mon === 'Cảnh'
    },
    // Thái Âm Phù Tử: Thái Âm gặp Sinh Môn — âm phù, phụ nữ trợ giúp
    {
      ten: 'Thái Âm Phù Trợ',
      loai: 'cat',
      mo_ta: 'Thái Âm tại Sinh Môn — phụ nữ hỗ trợ, tài lộc đến từ âm thầm',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Thái Âm' && mon === 'Sinh'
    },
    // Lục Hợp Giao Cát: Lục Hợp gặp Khai Môn — hợp tác đại thành
    {
      ten: 'Lục Hợp Giao Cát',
      loai: 'cat',
      mo_ta: 'Lục Hợp tại Khai Môn — hợp tác đại thuận, giao dịch thành công',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Lục Hợp' && mon === 'Khai'
    },
    // Cửu Thiên Khai Cát: Cửu Thiên gặp Khai/Sinh Môn — danh vọng bùng phát
    {
      ten: 'Cửu Thiên Danh Vọng',
      loai: 'cat',
      mo_ta: 'Cửu Thiên tại Khai/Sinh Môn — danh tiếng lan xa, sự nghiệp thăng hoa',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Cửu Thiên' && ['Khai','Sinh'].includes(mon)
    },
    // Cửu Địa Phục Ẩn: Cửu Địa gặp Hưu/Sinh Môn — tích lũy bền vững
    {
      ten: 'Cửu Địa Phục Ẩn',
      loai: 'cat',
      mo_ta: 'Cửu Địa tại Hưu/Sinh Môn — ổn định, tích lũy bền vững dài hạn',
      kiem_tra: (ct, cd, hc, sys, sao, mon, than) =>
        than === 'Cửu Địa' && ['Hưu','Sinh'].includes(mon)
    },
  ];

  // ==================== HÀM KIỂM TRA CHÍNH ====================
  function kiemTra(tb, db, bm, bt, tcb, sys, utils) {
    const { tuongSinh, tuongKhac, biKhac, danhSachSaoTaiCung, NGU_HANH_SAO } = utils;

    const palacePatterns = {};
    for (let c = 1; c <= 9; c++) palacePatterns[c] = [];
    const auspicious = [], inauspicious = [], seen = {};

    const push = (cung, pattern) => {
      const key = cung + ':' + pattern.ten;
      if (seen[key]) return;
      seen[key] = true;
      palacePatterns[cung].push(pattern);
      if (pattern.loai === 'cat') auspicious.push(pattern);
      else inauspicious.push(pattern);
    };

    const tamKy = ['Ất', 'Bính', 'Đinh'], catMon = ['Khai', 'Hưu', 'Sinh'];

    for (let cung = 1; cung <= 9; cung++) {
      if (cung === 5 && !tb[5]) continue;

      const sao  = tb[cung]  || '';
      const mon  = bm[cung]  || '';
      const than = bt[cung]  || '';
      const ct   = tcb[cung] || '';
      const cd   = db[cung]  || '';
      const hc   = sys.CUNG_META[cung]?.hanh || '';
      const hs   = NGU_HANH_SAO[sao] || '';
      const hm   = sys.NGU_HANH_MON[mon] || '';
      const dsSao = danhSachSaoTaiCung(tb, cung);

      // ── NHÓM 1: Xét Ngâm (giữ nguyên) ──
      if (sao === sys.SAO_THEO_CUNG[cung] && mon === sys.MON_THEO_CUNG[cung] && cung !== 5)
        push(cung, { ten:'Phục Ngâm', cung, loai:'hung' });

      const cx = sys.CUNG_XUNG[cung];
      if (cx && sao === sys.SAO_THEO_CUNG[cx] && (bm[cx] || '') === sys.MON_THEO_CUNG[cung] && cung !== 5)
        push(cung, { ten:'Phản Ngâm', cung, loai:'hung' });

      // ── NHÓM 2: Ngũ Hành Tương Tác (giữ nguyên) ──
      if (tuongSinh(hs, hc)) push(cung, { ten:'Sao Sinh Cung', cung, loai:'cat' });
      if (tuongKhac(hs, hc)) push(cung, { ten:'Sao Khắc Cung', cung, loai:'hung' });
      if (tuongSinh(hm, hc) && hm) push(cung, { ten:'Môn Sinh Cung', cung, loai:'cat' });
      if (tuongKhac(hm, hc) && hm) push(cung, { ten:'Môn Bức Cung',  cung, loai:'hung' });
      if (biKhac(hm, hc)    && hm) push(cung, { ten:'Cung Chế Môn',  cung, loai:'hung' });

      // ── NHÓM 3: Tam Độn / Ngũ Giả (giữ nguyên) ──
      if (than === 'Cửu Thiên' && mon === 'Sinh'  && dsSao.includes('Thiên Tâm'))  push(cung, { ten:'Thiên Độn', cung, loai:'cat' });
      if (than === 'Cửu Địa'   && mon === 'Khai'  && dsSao.includes('Thiên Nhậm')) push(cung, { ten:'Địa Độn',   cung, loai:'cat' });
      if (than === 'Thái Âm'   && mon === 'Hưu'   && dsSao.includes('Thiên Bồng')) push(cung, { ten:'Nhân Độn',  cung, loai:'cat' });
      if (than === 'Lục Hợp'   && mon === 'Khai')  push(cung, { ten:'Phong Độn',   cung, loai:'cat' });
      if (than === 'Lục Hợp'   && mon === 'Sinh')  push(cung, { ten:'Vân Độn',     cung, loai:'cat' });

      if (dsSao.includes('Thiên Nhuế') && mon === 'Tử') push(cung, { ten:'Thiên Nhuế Tử Môn', cung, loai:'hung' });

      if (tamKy.includes(ct) && catMon.includes(mon)) push(cung, { ten:'Hưu Trá',    cung, loai:'cat' });
      if (tamKy.includes(ct) && than === 'Cửu Thiên') push(cung, { ten:'Thiên Giả',  cung, loai:'cat' });
      if (tamKy.includes(ct) && than === 'Cửu Địa')   push(cung, { ten:'Địa Giả',    cung, loai:'cat' });

      // ── NHÓM 4: Cấu Trúc Đặc Biệt Cũ (giữ nguyên) ──
      if (ct === 'Mậu'  && cd === 'Bính' && sys.THANH_LONG_CUNG.includes(cung)) push(cung, { ten:'Thanh Long Phản Thủ', cung, loai:'cat' });
      if (ct === 'Bính' && cd === 'Mậu'  && sys.THANH_LONG_CUNG.includes(cung)) push(cung, { ten:'Phi Điểu Điệt Huyệt', cung, loai:'cat' });
      if (dsSao.includes('Thiên Cầm') && ['Khai','Hưu','Sinh','Cảnh'].includes(mon)) push(cung, { ten:'Thiên Cầm Tứ Trương', cung, loai:'cat' });
      if (ct === 'Ất' && mon === 'Hưu') push(cung, { ten:'Ất Kỳ Đắc Sử', cung, loai:'cat' });

      // ── NHÓM 5: Thập Can Khắc Ứng (giữ nguyên từ bản cũ) ──
      if (ct && cd) {
        const canPair = ct + '+' + cd;
        if (THAP_CAN_KHAC_UNG[canPair]) {
          push(cung, {
            ten:  THAP_CAN_KHAC_UNG[canPair].ten,
            cung: cung,
            loai: THAP_CAN_KHAC_UNG[canPair].loai
          });
        }

        // ── NHÓM 6: Thiên Can Tương Hợp (giữ nguyên từ bản cũ) ──
        if (THIEN_CAN_HOP[ct] === cd) {
          push(cung, { ten:'Thiên Can Tương Hợp', cung, loai:'cat' });
        }
      }

      // ── NHÓM 7: Tam Kỳ Đắc Sử đầy đủ 3 kỳ (giữ nguyên từ bản cũ) ──
      if (tamKy.includes(ct) && catMon.includes(mon)) {
        push(cung, { ten:'Tam Kỳ Đắc Sử', cung, loai:'cat' });
      }

      // ──────── BỔ SUNG MỚI ────────

      // ── NHÓM 8: Tam Kỳ bổ sung từng loại riêng ──
      if (ct === 'Bính' && catMon.includes(mon)) push(cung, { ten:'Bính Kỳ Đắc Sử', cung, loai:'cat' });
      if (ct === 'Đinh' && catMon.includes(mon)) push(cung, { ten:'Đinh Kỳ Đắc Sử', cung, loai:'cat' });
      // (Ất Kỳ Đắc Sử đã có ở nhóm 4 — không trùng lặp)

      // ── NHÓM 9: Tinh Môn Tổ Hợp ──
      for (const tmth of TINH_MON_TO_HOP) {
        if (dsSao.includes(tmth.sao) && mon === tmth.mon) {
          push(cung, { ten: tmth.ten, cung, loai: tmth.loai });
        }
      }

      // ── NHÓM 10: Ngũ Độn Mở Rộng ──
      for (const doN of NGU_DON_MO_RONG) {
        if (doN.dieu_kien(than, mon, dsSao)) {
          push(cung, { ten: doN.ten, cung, loai: doN.loai });
        }
      }

      // ── NHÓM 11: Cách Cục Đặc Biệt ──
      for (const dac of CACH_CUC_DAC_BIET) {
        if (dac.kiem_tra(ct, cd, hc, sys, sao, mon, than, cung)) {
          push(cung, { ten: dac.ten, cung, loai: dac.loai, desc: dac.mo_ta });
        }
      }

      // ── NHÓM 12: Môn-Nhân Tương Tác ──
      // (Cần biết ngũ hành Can Ngày — lấy từ sys nếu có)
      if (sys.CAN_NGAY_HANH) {
        const monNhan = kiemTraMonNhan(mon, sys.CAN_NGAY_HANH, sys);
        if (monNhan) push(cung, { ten: monNhan.ten, cung, loai: monNhan.loai });
      }

      // ── NHÓM 13: Nhật Kỳ, Nguyệt Kỳ, Tinh Kỳ tại Hung Môn (cảnh báo ngược) ──
      if (ct === 'Ất'   && ['Tử','Kinh','Thương'].includes(mon)) push(cung, { ten:'Ất Kỳ Lạc Thổ',   cung, loai:'hung' });
      if (ct === 'Bính' && ['Tử','Kinh','Thương'].includes(mon)) push(cung, { ten:'Bính Kỳ Lạc Thổ', cung, loai:'hung' });
      if (ct === 'Đinh' && ['Tử','Kinh','Thương'].includes(mon)) push(cung, { ten:'Đinh Kỳ Lạc Thổ', cung, loai:'hung' });
    }

    // ── NHÓM 14: Lục Nghi Kích Hình (giữ nguyên) ──
    const lnkh = tinhLucNghiKichHinh(db, sys);
    for (const item of lnkh)
      push(item.cung, { ten:'Lục Nghi Kích Hình', cung:item.cung, loai:'hung', desc:item.desc });

    return { auspicious, inauspicious, palacePatterns };
  }

  return { kiemTra };
}));
