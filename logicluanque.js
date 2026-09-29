// LogicLuanQue.js
// BẢNG LUẬN QUẺ - LOGIC 26 CHỦ ĐỀ CHUYÊN SÂU (PHIÊN BẢN MASTER TÍCH HỢP AI CHUYÊN GIA)
// Giữ nguyên 100% hướng dẫn gốc + Tích hợp thuật toán luận giải chuyên gia Kỳ Môn (Nguyệt Lệnh, Nhật Lệnh, Đối Xung, MVC, Tinh Môn, Ẩn Can, Môn Cung, Cung Can, Địa Chi, Phân Kim, Tam Phú Cách, Deal-breaker, Action Plan)

(function () {
  'use strict';

  let activeEngine = null;
  if (typeof window.KyMonEngine !== 'undefined') {
    activeEngine = window.KyMonEngine;
  } else if (typeof window.HaDoBanKyMon !== 'undefined') {
    activeEngine = window.HaDoBanKyMon;
  }

  if (!activeEngine) {
    console.error('Không tìm thấy Engine Kỳ Môn. Bảng luận quẻ vô hiệu hóa.');
    return;
  }

  const _U = activeEngine.utils || {};
  let currentTopicId = null; // Biến toàn cục để tính Contextual Score

  const MAP_CAN = _U.NGU_HANH_CAN || {
    'Giáp':'Mộc','Ất':'Mộc','Bính':'Hỏa','Đinh':'Hỏa',
    'Mậu':'Thổ','Kỷ':'Thổ','Canh':'Kim','Tân':'Kim',
    'Nhâm':'Thủy','Quý':'Thủy'
  };
  
  const MAP_CHI = {
    'Dần':'Mộc','Mão':'Mộc','Tị':'Hỏa','Ngọ':'Hỏa',
    'Thân':'Kim','Dậu':'Kim','Hợi':'Thủy','Tý':'Thủy',
    'Thìn':'Thổ','Tuất':'Thổ','Sửu':'Thổ','Mùi':'Thổ'
  };

  const MAP_SAO = _U.NGU_HANH_SAO || {
    'Thiên Bồng':'Thủy','Thiên Nhuế':'Thổ','Thiên Xung':'Mộc',
    'Thiên Phụ':'Thổ','Thiên Cầm':'Thổ','Thiên Tâm':'Kim',
    'Thiên Trụ':'Kim','Thiên Nhậm':'Thủy','Thiên Anh':'Hỏa'
  };

  const MAP_MON = {
    'Khai':'Thủy','Hưu':'Thủy','Sinh':'Mộc','Thương':'Mộc', // MAP Môn mặc định fallback
    'Đỗ':'Hỏa','Cảnh':'Hỏa','Tử':'Kim','Kinh':'Kim'
  };

  const FALLBACK_META = {
    1:{ten:'Khảm',huong:'Bắc',hanh:'Thủy'},
    2:{ten:'Khôn',huong:'Đông Nam',hanh:'Thổ'},
    3:{ten:'Chấn',huong:'Đông',hanh:'Mộc'},
    4:{ten:'Tốn',huong:'Tây Nam',hanh:'Kim'},
    5:{ten:'Trung',huong:'Trung tâm',hanh:'Thổ'},
    6:{ten:'Kiền',huong:'Tây Bắc',hanh:'Kim'},
    7:{ten:'Ly',huong:'Nam',hanh:'Hỏa'},
    8:{ten:'Cấn',huong:'Đông Bắc',hanh:'Mộc'},
    9:{ten:'Đoài',huong:'Tây',hanh:'Kim'}
  };

  const OPPOSITE_PALACE = { 1:7, 2:6, 3:9, 4:8, 6:2, 7:1, 8:4, 9:3, 5:5 };

  // ============================ BẢNG ĐỊA CHI TƯƠNG TÁC ============================
  const DIA_CHI_XUNG = { 'Tý':'Ngọ','Ngọ':'Tý','Sửu':'Mùi','Mùi':'Sửu','Dần':'Thân','Thân':'Dần','Mão':'Dậu','Dậu':'Mão','Thìn':'Tuất','Tuất':'Thìn','Tỵ':'Hợi','Hợi':'Tỵ' };
  const DIA_CHI_HOP = { 'Tý':'Sửu','Sửu':'Tý','Dần':'Hợi','Hợi':'Dần','Mão':'Tuất','Tuất':'Mão','Thìn':'Dậu','Dậu':'Thìn','Tỵ':'Thân','Thân':'Tỵ','Ngọ':'Mùi','Mùi':'Ngọ' };
  const DIA_CHI_HINH = { 'Dần':'Tỵ','Tỵ':'Thân','Thân':'Dần', 'Sửu':'Tuất','Tuất':'Mùi','Mùi':'Sửu', 'Tý':'Mão','Mão':'Tý', 'Thìn':'Thìn','Ngọ':'Ngọ','Dậu':'Dậu','Hợi':'Hợi' };
  const DIA_CHI_HAI  = { 'Tý':'Mùi','Mùi':'Tý','Sửu':'Ngọ','Ngọ':'Sửu','Dần':'Tỵ','Tỵ':'Dần','Mão':'Thìn','Thìn':'Mão','Thân':'Hợi','Hợi':'Thân','Dậu':'Tuất','Tuất':'Dậu' };

  // ============================ UI RENDERER (MVC - VIEW LAYER) ============================
  const UI = {
    h: function(s) { return s; },
    line: function(label, value, type) {
      let cls = '';
      if (type === 'good') cls = 'style="color:var(--good, #16a34a);"';
      else if (type === 'bad') cls = 'style="color:var(--bad, #dc2626);"';
      else if (type === 'neutral') cls = 'style="color:var(--muted, #6b7280);"';
      else if (type === 'info') cls = 'style="color:#1e40af;"';
      return `<div style="margin-bottom:5px; font-size: 14px;"><strong>${label}:</strong> <span ${cls}>${value}</span></div>`;
    },
    section: function(title) {
      return `<div style="margin:14px 0 7px 0;font-weight:700;border-left:4px solid #8a1f1f;padding-left:10px; background:#f9f4f4; padding-top:5px; padding-bottom:5px; border-radius:2px; font-size:13.5px;">${title}</div>`;
    },
    note: function(text, type) {
      let bg = '#fefce8', border = '#ca8a04', color = '#713f12';
      if (type === 'good') { bg = '#f0fdf4'; border = '#16a34a'; color = '#14532d'; }
      else if (type === 'bad') { bg = '#fef2f2'; border = '#dc2626'; color = '#7f1d1d'; }
      else if (type === 'terrible') { bg = '#450a0a'; border = '#dc2626'; color = '#fecaca'; } // Dành cho Deal-Breaker
      else if (type === 'info') { bg = '#eff6ff'; border = '#2563eb'; color = '#1e3a8a'; }
      else if (type === 'neutral') { bg = '#f3f4f6'; border = '#9ca3af'; color = '#374151'; }
      return `<div style="margin:6px 0;padding:8px 10px;background:${bg};border-left:4px solid ${border};color:${color}; font-size:13px; line-height:1.6;">${text}</div>`;
    },
    verdict: function(text, type) {
      let bg = '#f3f4f6', color = '#1f2937';
      if (type === 'good') { bg = '#dcfce7'; color = '#14532d'; }
      else if (type === 'bad') { bg = '#fee2e2'; color = '#7f1d1d'; }
      else if (type === 'warn') { bg = '#fef9c3'; color = '#713f12'; }
      return `<div style="margin:6px 0 0 0; padding:6px 10px; background:${bg}; border-radius:4px; font-size:13px; font-weight:600; color:${color};">${text}</div>`;
    }
  };

  // ============================ HƯỚNG DẪN TỪNG CHỦ ĐỀ (BẢO TOÀN 100%) ============================
  const TOPIC_GUIDES = {
    1: {
      title: '1. Cơ thể',
      vars: [
        ['Giáp (thiên bàn)', 'Đầu, gan, túi mật'],
        ['Ất (thiên bàn)', 'Gan, túi mật, thực quản, cổ họng, hệ thần kinh'],
        ['Bính (thiên bàn)', 'Ruột non, môi, vai, trán'],
        ['Đinh (thiên bàn)', 'Răng, tim, mắt, trào ngược, bốc hỏa'],
        ['Mậu (thiên bàn)', 'Cơ bụng, bao tử, mũi'],
        ['Kỷ (thiên bàn)', 'Mắt, tỳ, tạng, miệng, bụng'],
        ['Canh (thiên bàn)', 'Xương, sườn, ruột già'],
        ['Tân (thiên bàn)', 'Bụng, phổi, phế quản, ngực, cổ'],
        ['Nhâm (thiên bàn)', 'Tim mạch, bàng quang, máu, hệ thực vật'],
        ['Quý (thiên bàn)', 'Thần kinh, chân, thận'],
      ],
      signals: [],
      how: 'Xem can nào đại diện bệnh/bị thương → quy chiếu sang bộ phận. Nếu bị khắc, không vong, nhập mộ → bộ phận đó yếu hoặc có vấn đề.'
    },
    2: {
      title: '2. Nghề nghiệp',
      vars: [
        ['Can năm', 'Quản lý'],
        ['Can tháng', 'Đồng nghiệp'],
        ['Can ngày', 'Người hỏi'],
        ['Can giờ', 'Nhân viên cấp dưới'],
        ['Trực Phù', 'Sếp lớn'],
        ['Thái Tuế', 'Sếp siêu lớn'],
        ['Khai Môn', 'Sự nghiệp'],
        ['Sinh Môn', 'Lợi nhuận, tiền'],
        ['Đỗ Môn', 'Công việc sắp tới'],
      ],
      signals: [
        ['Khai Môn phản ngâm', 'Công việc có sự thay đổi lớn'],
        ['Khai Môn không vong', 'Chấm dứt công việc'],
        ['Khai Môn nhập mộ', 'Sai phạm'],
        ['Can ngày khắc Thái Tuế', 'Không hợp sếp'],
        ['Thiên Phụ tinh', 'Môi trường làm việc dễ chịu'],
        ['Thi Nhậm tinh', 'Được hỗ trợ bởi cấp dưới và cấp trên'],
        ['Thiên Tâm tinh', 'Sếp giỏi'],
        ['Thiên Xung tinh', 'Áp lực công việc lớn'],
        ['Thiên Bồng tinh', 'Bị sếp chèn ép'],
      ],
      how: 'Lấy can ngày làm mình. Xem Khai Môn (nghề nghiệp), Sinh Môn (tiền). Xem quan hệ mình với Thái Tuế / Trực Phù / Can năm để biết hợp cấp trên hay không. Xem sao đi kèm để luận môi trường và áp lực.'
    },
    3: {
      title: '3. Thăng chức',
      vars: [
        ['Khai Môn', 'Quyết định thăng chức'],
        ['Can ngày', 'Người hỏi'],
        ['Đỗ Môn', 'Người đang đề bạt/push hồ sơ'],
        ['Trực Phù', 'Sếp lớn'],
        ['Thái Tuế', 'Sếp siêu lớn'],
        ['Can năm', 'Quản lý cấp cao'],
      ],
      signals: [],
      how: 'Trọng tâm là Khai Môn (có quyết định nâng chức không). Đỗ Môn cho biết người đang push hồ sơ. Trực Phù, Thái Tuế, Can năm cho biết hệ cấp trên có ủng hộ không.'
    },
    4: {
      title: '4. Tìm kiếm người dẫn đường',
      vars: [['Thiên Phụ tinh', 'Vị trí / phương hướng của người dẫn đường']],
      signals: [],
      how: 'Xác định Thiên Phụ tinh đang ở cung nào, phương nào, trạng thái thế nào để suy vị trí hoặc hướng của người dẫn đường.'
    },
    5: {
      title: '5. Chuyển việc',
      vars: [
        ['Khai Môn', 'Sự nghiệp sau khi xin nghỉ'],
        ['Can ngày', 'Người hỏi / công việc hiện tại'],
        ['Đỗ Môn', 'Công ty đang xin việc mới'],
      ],
      signals: [],
      how: 'So sánh can ngày với Đỗ Môn để biết có hợp công ty mới không. Xem Khai Môn để biết tương lai nghề nghiệp sau khi rời công việc hiện tại.'
    },
    6: {
      title: '6. Xin việc',
      vars: [
        ['Khai Môn', 'Quyết định (đậu/rớt)'],
        ['Can ngày', 'Người hỏi'],
        ['Đỗ Môn', 'Phỏng vấn / buổi thử việc'],
      ],
      signals: [],
      how: 'Đỗ Môn cho biết tình hình phỏng vấn. Khai Môn quyết định đậu hay không. Quan hệ giữa can ngày và Đỗ Môn / Khai Môn cho biết mức phù hợp.'
    },
    7: {
      title: '7. Mua hàng',
      vars: [
        ['Can ngày', 'Người mua'],
        ['Can giờ', 'Sản phẩm / dịch vụ'],
        ['Cảnh Môn', 'Thị trường'],
      ],
      signals: [
        ['Can giờ vượng + cách cục tốt', 'Sản phẩm tốt, phù hợp thị trường'],
        ['Can giờ suy + cách cục tốt', 'Sản phẩm chưa tốt nhất nhưng thị trường vẫn đón nhận ban đầu'],
        ['Can giờ sinh can ngày', 'Người mua muốn mua sản phẩm'],
        ['Can giờ khắc can ngày', 'Sản phẩm không phù hợp người mua'],
        ['Can giờ không vong', 'Sản phẩm không phù hợp người mua'],
        ['Can ngày sinh can giờ', 'Người mua yêu thích sản phẩm'],
        ['Can ngày khắc can giờ', 'Phải thay đổi sản phẩm, thị trường nhanh bão hòa'],
      ],
      how: 'Dùng can ngày làm bên mua, can giờ làm món hàng. Xem sinh-khắc để biết có nhu cầu thực không. Xem Cảnh Môn để biết thị trường có ủng hộ không.'
    },
    8: {
      title: '8. Bán hàng',
      vars: [
        ['Can ngày', 'Người bán'],
        ['Trực Sử', 'Người mua / khách hàng'],
        ['Can giờ', 'Sản phẩm / dịch vụ'],
        ['Mậu', 'Vốn'],
        ['Sinh Môn', 'Tiền lời / lợi nhuận'],
      ],
      signals: [
        ['Can giờ sinh Sinh Môn', 'Có lợi nhuận'],
        ['Can giờ khắc Sinh Môn / Mậu', 'Không có lợi nhuận'],
        ['Can ngày sinh Trực Sử', 'Phụ thuộc khách hàng'],
        ['Can ngày khắc Trực Sử', 'Gặp nhiều vấn đề với khách hàng'],
        ['Can giờ khắc can ngày', 'Người bán không nắm bắt xu thế sản phẩm'],
      ],
      how: 'Xem 4 yếu tố: người bán – khách – sản phẩm – lợi nhuận. Nếu can giờ tốt và sinh Sinh Môn → bán ra tiền. Nếu can giờ khắc Sinh Môn/Mậu → lợi nhuận kém.'
    },
    9: {
      title: '9. Mở kinh doanh',
      vars: [['Khai Môn', 'Dụng thần chính']],
      signals: [
        ['Trực Phù đi cùng Khai Môn', 'Nhận được nhiều hỗ trợ, thuận lợi'],
        ['Thái Âm đi cùng', 'Khách hàng yêu thích và quay lại'],
        ['Lục Hợp đi cùng', 'Sẽ có kêu gọi hợp tác'],
        ['Cửu Thiên đi cùng', 'Bán tốt, có danh tiếng'],
        ['Đằng Xà đi cùng', 'Dễ gặp vấn đề pháp lý'],
        ['Bạch Hổ / Câu Trận', 'Bế tắc, mệt mỏi'],
        ['Huyền Vũ / Chu Tước', 'Thất thoát, cãi vã'],
        ['Cửu Địa đi cùng', 'Phát triển chậm'],
        ['Không vong / nhập mộ', 'Không nên khởi sự'],
      ],
      how: 'Lấy Khai Môn làm trọng tâm. Xem môn này đi cùng thần/tinh nào để biết cát hung khi khởi sự.'
    },
    10: {
      title: '10. Hợp tác',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Can giờ', 'Người hợp tác'],
        ['Lục Hợp', 'Mối quan hệ hợp tác / người môi giới'],
        ['Sinh Môn', 'Lợi ích tài chính'],
      ],
      signals: [],
      how: 'So can ngày với can giờ để biết hợp hay khắc. Lục Hợp cho biết cầu nối, tính gắn kết. Sinh Môn cho biết lợi ích tài chính.'
    },
    11: {
      title: '11. Mua bán BĐS',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Sinh Môn', 'Nhà'],
        ['Tử Môn', 'Đất'],
        ['Cửu Địa', 'Dự án lớn'],
        ['Cửu Thiên', 'Chung cư'],
        ['Cảnh Môn', 'Giấy tờ / pháp lý'],
        ['Mậu', 'Vốn'],
        ['Thiên Tâm', 'Tình hình tài chính'],
        ['Lục Hợp', 'Môi giới / trung gian'],
      ],
      signals: [],
      how: 'Mua nhà → chú ý Sinh Môn. Mua đất → chú ý Tử Môn. Cảnh Môn quyết định giấy tờ. Mậu và Thiên Tâm cho thấy vốn và khả năng tài chính. Lục Hợp biểu thị môi giới.'
    },
    12: {
      title: '12. Đi vay, cho vay',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Trực Phù', 'Người cho vay'],
        ['Trực Sử', 'Người đi vay'],
      ],
      signals: [],
      how: 'Tùy người hỏi đang ở vai nào (bên vay hay bên cho vay), lấy can ngày đối chiếu với Trực Phù và Trực Sử để xem thế mạnh, khả năng được vay hoặc đòi vốn.'
    },
    13: {
      title: '13. Đòi nợ',
      vars: [
        ['Can ngày', 'Người hỏi (chủ nợ)'],
        ['Thương Môn', 'Việc đòi nợ'],
        ['Thái Ất', 'Người vay (con nợ)'],
        ['Sinh Môn', 'Khoản tiền'],
      ],
      signals: [],
      how: 'Xem Thương Môn để biết việc đòi nợ có tiến triển không. Thái Ất là bên đang nợ. Sinh Môn là khoản tiền – mạnh, sinh trợ thì dễ thu.'
    },
    14: {
      title: '14. Thi đấu',
      vars: [
        ['Can ngày', 'Đội muốn hỏi'],
        ['Can giờ (địa bàn)', 'Chủ nhà'],
        ['Can giờ (thiên bàn)', 'Đội khách'],
        ['Trực Phù', 'Trọng tài'],
      ],
      signals: [],
      how: 'So can ngày với can giờ để biết bên nào mạnh hơn. Dùng địa bàn/thiên bàn để tách chủ nhà – đội khách. Trực Phù cho biết yếu tố trọng tài, điều hành trận.'
    },
    15: {
      title: '15. Thi cử',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Can năm cá nhân', 'Người thi'],
        ['Cảnh Môn', 'Đề thi / điểm số'],
        ['Thiên Phụ', 'Giáo viên / phòng thi'],
        ['Trực Phù', 'Người giám sát'],
        ['Can năm', 'Trường thi'],
      ],
      signals: [],
      how: 'Cảnh Môn là trọng tâm nếu xem kết quả thi. Can năm cá nhân là thí sinh. So tương quan với Cảnh Môn để biết mức thuận lợi về điểm số.'
    },
    16: {
      title: '16. Chỗ đỗ xe',
      vars: [['Không vong', 'Vị trí còn chỗ trống']],
      signals: [],
      how: 'Tìm cung hoặc phương có Không vong để luận chỗ trống còn đỗ được. Đi theo phương đó sẽ tìm được chỗ.'
    },
    17: {
      title: '17. Du lịch',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Can giờ', 'Kết quả chuyến đi'],
        ['Cảnh Môn', 'Đường bộ'],
        ['Thương Môn', 'Phương tiện di chuyển'],
        ['Hưu Môn', 'Đường thủy'],
        ['Cửu Thiên / Khai Môn', 'Hàng không / máy bay'],
        ['Thiên Bồng', 'Trở ngại, trục trặc'],
      ],
      signals: [],
      how: 'Can giờ và phương hướng cho biết chuyến đi có thuận không. Xem môn để luận loại hình di chuyển. Thiên Bồng báo trở ngại, trục trặc.'
    },
    18: {
      title: '18. Hôn nhân',
      vars: [
        ['Ất', 'Vợ (nữ)'],
        ['Canh', 'Chồng (nam)'],
        ['Lục Hợp', 'Hôn nhân (trọng tâm)'],
        ['Đinh', 'Người thứ 3 là nữ'],
        ['Bính', 'Người thứ 3 là nam'],
        ['Huyền Vũ', 'Lừa dối'],
        ['Đằng Xà / Chu Tước', 'Thiếu tin tưởng'],
        ['Câu Trận / Bạch Hổ', 'Mất mát, tai nạn'],
        ['Cửu Thiên', 'Nhanh chóng, bất ngờ'],
      ],
      signals: [],
      how: 'Dùng Ất và Canh để định hai bên vợ chồng. Lục Hợp là trọng tâm hôn nhân. Nếu Bính/Đinh nổi bật → xét khả năng người thứ ba. Huyền Vũ, Đằng Xà, Chu Tước báo tín hiệu bất ổn niềm tin.'
    },
    19: {
      title: '19. Sinh nở (giới tính)',
      vars: [
        ['Cung Khôn', 'Mẹ'],
        ['Cửu tinh trong cung Khôn', 'Em bé'],
        ['Bát Môn dương', 'Giới tính nam'],
        ['Bát Môn âm', 'Giới tính nữ'],
      ],
      signals: [],
      how: 'Xác định cung Khôn (cung 2) là mẹ. Lấy cửu tinh trong cung Khôn làm em bé. Xem bát môn thuộc âm hay dương để luận giới tính.'
    },
    20: {
      title: '20. Sinh nở',
      vars: [
        ['Cung Khôn (cung 2)', 'Cung sinh / mẹ'],
        ['Thiên Nhuế', 'Mẹ'],
        ['Cửu tinh cung Khôn', 'Em bé'],
        ['Bạch Hổ cung Khôn', 'Sinh nhanh'],
        ['Phục ngâm', 'Sinh lâu, kéo dài'],
        ['Cung Khôn khắc bát môn', 'Nguy hiểm / cần phẫu thuật'],
      ],
      signals: [
        ['Thiên Nhuế khắc sao cung Khôn', 'Tốt, an toàn'],
        ['Sao cung Khôn sinh Thiên Nhuế', 'Sinh lâu'],
        ['Sao cung Khôn khắc Thiên Nhuế', 'Nguy hiểm'],
        ['Cung Thiên Nhuế khắc cung Khôn', 'Tốt'],
        ['Cung Khôn môn bách', 'Mẹ có nhiều bệnh, biến chứng'],
      ],
      how: 'Xem quan hệ giữa mẹ (Thiên Nhuế) và em bé (cửu tinh cung Khôn). Nếu khắc theo chiều tốt → sinh an toàn. Ngược lại → dễ nguy hiểm. Bạch Hổ cung Khôn: nhanh. Phục ngâm: kéo dài.'
    },
    21: {
      title: '21. Sức khỏe',
      vars: [
        ['Can ngày', 'Người hỏi / người bệnh'],
        ['Thiên Nhuế', 'Tình hình tiến triển của bệnh'],
        ['Thiên Xung', 'Cơ sở y tế'],
        ['Can giờ', 'Nguyên do bệnh'],
        ['Trực Phù', 'Loại bệnh'],
        ['Trực Sử', 'Thời gian phục hồi'],
        ['Ất', 'Thuốc đông y'],
        ['Thiên Tâm tinh', 'Tây y'],
        ['Đinh + Khai Môn', 'Đã trải qua phẫu thuật'],
        ['Mậu / Kỷ', 'Có vết sẹo, u bướu'],
        ['Bính', 'Viêm'],
        ['Nhâm / Quý', 'Máu huyết'],
      ],
      signals: [
        ['Người bệnh cùng cung Sinh Môn', 'Phục hồi nhanh'],
        ['Người bệnh cùng cung Tử Môn', 'Bệnh khó chữa, kéo dài'],
        ['Thiên Nhuế khắc người bệnh', 'Sức khỏe xấu, trở nặng'],
        ['Thiên Nhuế không vong (bệnh mới)', 'Tốt'],
        ['Người bệnh không vong', 'Bệnh khó chữa, kéo dài'],
      ],
      how: 'Xem Thiên Nhuế để biết bệnh đang tiến triển ra sao. Trực Sử cho biết tốc độ hồi phục. Sinh Môn/Tử Môn phân biệt bệnh dễ hồi hay kéo dài. Kết hợp bảng Cơ thể để xác định bộ phận liên quan.'
    },
    22: {
      title: '22. Kiện tụng',
      vars: [
        ['Can ngày', 'Người hỏi'],
        ['Trực Phù', 'Người thưa kiện'],
        ['Thiên Ất', 'Người bị kiện'],
        ['Khai Môn', 'Quan tòa'],
        ['Lục Hợp', 'Nhân chứng / bằng chứng'],
        ['Đỗ Môn', 'Viện kiểm sát'],
        ['Đinh', 'Giấy tờ, lệnh triệu tập'],
        ['Bính', 'Bằng chứng hình ảnh/video'],
        ['Kinh Môn', 'Luật sư'],
        ['Cảnh Môn', 'Đơn khởi kiện'],
      ],
      signals: [
        ['Khai Môn nhập mộ', 'Phiên tòa bị hoãn'],
        ['Khai Môn không vong', 'Còn kiện tiếp vì thiếu dữ liệu'],
        ['Khai Môn khắc Cảnh Môn', 'Tòa không thụ lý đơn'],
        ['Cảnh Môn không vong + Đằng Xà / Huyền Vũ', 'Việc không đúng sự thật'],
        ['Lục Hợp không vong', 'Chưa đủ bằng chứng'],
        ['Khai Môn phục ngâm', 'Vụ kiện kéo dài'],
        ['Khai Môn phản ngâm', 'Dời tòa / thay đổi phiên xét xử'],
      ],
      how: 'Khai Môn là then chốt (tượng tòa/quan xét xử). Cảnh Môn là đơn kiện – bị khắc thì khó thụ lý. Lục Hợp là chứng cứ – không vong thì hồ sơ yếu.'
    },
    23: {
      title: '23. Tố tụng hình sự',
      vars: [['Tân', 'Tội phạm (chủ điểm)']],
      signals: [
        ['Tân gặp Nhâm Quý', 'Đi tù'],
        ['Tân gặp kích hình', 'Tội nặng'],
        ['Tân gặp Bạch Hổ / Đỗ Môn', 'Bị giam cầm'],
        ['Tân gặp Đằng Xà', 'Lừa bịp'],
        ['Tân gặp Huyền Vũ', 'Trộm cắp'],
        ['Tân gặp Thương Môn + kích hình', 'Đánh nhau'],
        ['Tân gặp Mậu', 'Vì tiền mà mang họa'],
        ['Tân gặp Lục Hợp / can tháng', 'Dễ có đồng bọn'],
        ['Tân gặp Phục ngâm', 'Bắt giữ kéo dài'],
        ['Tân gặp Phản ngâm / Không vong', 'Dễ được phóng thích'],
      ],
      how: 'Chủ điểm là Tân. Xem Tân gặp gì để luận loại hành vi, mức độ nặng nhẹ và kết quả pháp lý.'
    },
    24: {
      title: '24. Đi lạc',
      vars: [
        ['Can ngày', 'Dụng thần (xác định qua quan hệ người thân)'],
        ['Lục Hợp', 'Hướng bắt đầu của người đi lạc'],
        ['Cung Trực Phù / Trực Sử', 'Điểm dừng chân'],
        ['Đỗ Môn', 'Hướng người đi lạc trốn'],
      ],
      signals: [
        ['Thời can và nhật can đồng cung', 'Dễ tìm được hoặc tự quay về'],
        ['Dụng thần có Cửu Địa / Thái Âm', 'Có người cất giấu'],
        ['Dụng thần có Huyền Vũ', 'Bị người khác lừa'],
        ['Dụng thần có Đằng Xà', 'Bị bắt giữ'],
        ['Dụng thần có Bạch Hổ', 'Đề phòng bị đánh'],
        ['Phục ngâm', 'Khó về'],
        ['Phản ngâm', 'Sẽ về'],
      ],
      how: 'Trước hết xác định đúng dụng thần theo quan hệ thân thuộc. Xem Lục Hợp để đoán hướng ban đầu, cung dụng thần để đoán hướng cuối. Phản ngâm = có cơ hội quay về; Phục ngâm = khó về.'
    },
    25: {
      title: '25. Mất đồ',
      vars: [
        ['Can ngày', 'Người chủ'],
        ['Can giờ', 'Tài sản bị mất'],
      ],
      signals: [
        ['Ngày giờ đồng cung', 'Không bị mất, sẽ tìm lại được'],
        ['Can giờ vượng sinh can ngày', 'Tìm lại được'],
        ['Phản ngâm', 'Tìm lại được'],
        ['Thời can không vong / mộ tuyệt', 'Khó tìm lại'],
        ['Can ngày + can giờ nội bàn', 'Mất trong nhà / nơi gần'],
        ['Can ngày + can giờ ngoại bàn', 'Mất ngoài nhà / nơi xa'],
        ['Can giờ có Huyền Vũ', 'Người khác lấy hoặc tự để quên'],
        ['Can giờ bị Huyền Vũ / Thiên Bồng khắc', 'Bị lấy trộm'],
        ['Huyền Vũ dương tính', 'Người lấy là đàn ông'],
        ['Huyền Vũ âm tính', 'Người lấy là phụ nữ'],
      ],
      how: 'Can giờ là món đồ. Xem nội bàn/ngoại bàn để định trong hay ngoài. Xem Huyền Vũ để đoán có người lấy, quên, hay nam/nữ liên quan.'
    },
    26: {
      title: '26. Thời tiết',
      vars: [
        ['Giáp / Ất', 'Gió'],
        ['Bính / Đinh', 'Lửa / nóng'],
        ['Mậu / Kỷ', 'Mây'],
        ['Canh / Tân', 'Băng tuyết'],
        ['Nhâm / Quý', 'Mưa'],
        ['Thiên Anh', 'Mặt trời'],
        ['Thiên Phụ', 'Gió'],
        ['Thiên Trụ / Thiên Bồng', 'Mưa'],
        ['Thiên Xung', 'Sấm'],
        ['Trực Phù / Cửu Thiên', 'Mặt trời'],
        ['Cửu Địa', 'Mây'],
        ['Lục Hợp / Bạch Hổ', 'Gió'],
        ['Huyền Vũ', 'Mưa'],
      ],
      signals: [
        ['Thiên Bồng + Nhâm/Quý + Khảm/Chấn/Đoài', 'Mưa (xác suất cao)'],
        ['Thiên Trụ + Nhâm/Quý + Khảm/Chấn/Đoài', 'Mưa (xác suất cao)'],
      ],
      how: 'Xem can chủ và sao chủ hiện ra gì để quy loại thời tiết. Nếu mưa xuất hiện đồng thời ở nhiều chỉ dấu (Nhâm Quý + Thiên Bồng/Thiên Trụ), xác suất mưa càng cao.'
    }
  };

  // ============================ HELPERS ============================
  function getCurrentChart() { return window.__LAST_CHART || null; }
  function getPalace(chart, pos) { return (chart?.palaces || []).find(p => p.cung === pos) || null; }
  function getAllPalaces(chart) { return chart?.palaces || []; }

  function getStemOf(chart, pillar) {
    let can = chart?.fourPillars?.[pillar]?.can || '';
    if (can.includes(' ')) can = can.split(' ')[0];
    return can;
  }

  function getBranchOf(chart, pillar) {
    let chi = chart?.fourPillars?.[pillar]?.chi || '';
    if (chi.includes(' ')) chi = chi.split(' ')[0];
    return chi;
  }

  function sheng(a, b) {
    if (_U.tuongSinh) return _U.tuongSinh(a, b);
    return { 'Mộc':'Hỏa','Hỏa':'Thổ','Thổ':'Kim','Kim':'Thủy','Thủy':'Mộc' }[a] === b;
  }

  function khac(a, b) {
    if (_U.tuongKhac) return _U.tuongKhac(a, b);
    return { 'Mộc':'Thổ','Thổ':'Thủy','Thủy':'Hỏa','Hỏa':'Kim','Kim':'Mộc' }[a] === b;
  }

  function normalizeGateName(gateName) { return String(gateName || '').replace(/ ?[Mm]ôn$/, '').trim(); }

  function getEffectiveDeityName(palace, chart) {
    const raw = (palace?.batThan || '').trim();
    if (!raw) return '';
    if (!(!!chart?.ju?.isDuong)) {
      if (raw === 'Câu Trận') return 'Bạch Hổ';
      if (raw === 'Chu Tước') return 'Huyền Vũ';
    }
    return raw;
  }

  function findPalaceByGate(chart, gateName) { return getAllPalaces(chart).find(p => normalizeGateName(p.batMon) === normalizeGateName(gateName)) || null; }
  function findPalaceByStarName(chart, starName) { return getAllPalaces(chart).find(p => (p.thienBan || '').includes(starName) || (p.thienBanDongCung || '').includes(starName)) || null; }
  function findPalaceByDeityName(chart, deityName) { return getAllPalaces(chart).find(p => getEffectiveDeityName(p, chart).includes(deityName)) || null; }
  function findPalaceByHeavenlyStem(chart, stemVI) { return getAllPalaces(chart).find(p => p.thienCanBan === stemVI) || null; }
  function findPalaceByEarthlyStem(chart, stemVI) { return getAllPalaces(chart).find(p => p.diaBan === stemVI) || null; }

  function getZhifuPalace(chart) { return chart?.zhiFu?.cung ? getPalace(chart, chart.zhiFu.cung) : null; }
  function getZhishiPalace(chart) { return chart?.zhiShi?.cung ? getPalace(chart, chart.zhiShi.cung) : null; }

  function isVoid(chart, palace) {
    if (!palace || !chart) return false;
    const p = chart.palaces.find(x => x.cung === palace.cung);
    if (!p) return false;
    if (p.khongVong && typeof p.khongVong.active === 'boolean') return p.khongVong.active;
    return !!(p.status && p.status.isKhongVong);
  }

  function isHorse(chart, palace) { return palace?.isDichMa === true; }
  function getHeavenlyStem(palace) { return palace?.thienCanBan || ''; }
  function getEarthlyStem(palace) { return palace?.diaBan || ''; }

  function hasPattern(palace, nameSubstr) { return palace?.patterns?.some(p => (p.ten || '').toLowerCase().includes(nameSubstr.toLowerCase())) || false; }
  function hasRuMu(palace) { return palace?.isMoKho === true || hasPattern(palace, 'nhập mộ'); }
  function hasGlobalPattern(chart, nameSubstr) { return getAllPalaces(chart).some(p => hasPattern(p, nameSubstr)); }
  function getAllVoidPalaces(chart) { return getAllPalaces(chart).filter(p => isVoid(chart, p)); }

  function getCungMeta(pos, chart) {
    if (chart?.sys?.CUNG_META?.[pos]) return chart.sys.CUNG_META[pos];
    return _U.CUNG_META?.[pos] || FALLBACK_META[pos] || { ten: '', huong: '', hanh: '' };
  }

  function palaceName(pos, chart) { return getCungMeta(pos, chart).ten; }
  function palaceDirection(pos, chart) { return getCungMeta(pos, chart).huong; }
  function palaceElement(pos, chart) { return getCungMeta(pos, chart).hanh; }

  function palaceSummary(p, chart) {
    if (!p) return '—';
    const t = palaceName(p.cung, chart), d = palaceDirection(p.cung, chart);
    let parts = [];
    if (t) parts.push(t);
    if (d) parts.push(`(${d})`);
    if (p.batMon) parts.push(p.batMon);
    if (p.thienBan) parts.push(p.thienBan);
    const deity = getEffectiveDeityName(p, chart);
    if (deity) parts.push(deity);
    const hs = getHeavenlyStem(p), es = getEarthlyStem(p);
    if (hs || es) parts.push(`${hs || '—'}/${es || '—'}`);
    let badges = [];
    if (isVoid(chart, p)) badges.push('⭕ K.Vong');
    if (isHorse(chart, p)) badges.push('🐎 D.Mã');
    if (hasRuMu(p)) badges.push('🪦 Nhập Mộ');
    return badges.length ? `${parts.join(' · ')} [${badges.join(' ')}]` : parts.join(' · ');
  }

  // TÍCH HỢP: Tự động trích xuất Địa Chi của một cung dựa trên hệ thống
  function getChiOfPalace(cung, chart) {
    if (!chart || !chart.sys || !chart.sys.CHI_CUNG) return [];
    const chis = [];
    for (const [chi, c] of Object.entries(chart.sys.CHI_CUNG)) {
      if (c === cung) chis.push(chi);
    }
    return chis;
  }

  // TÍCH HỢP: Hàm phân tích quan hệ Địa Chi
  function analyzeChiRelation(chiPalaces, chiTime) {
    if (!chiPalaces || !chiPalaces.length || !chiTime) return null;
    for (const chiA of chiPalaces) {
      if (DIA_CHI_XUNG[chiA] === chiTime) return { type: 'bad', rel: 'xung', label: `${chiA} ⚡ Xung ${chiTime}`, desc: 'Đối xung — phá vỡ ổn định, mâu thuẫn trực tiếp.', score: -2 };
      if (DIA_CHI_HOP[chiA] === chiTime) return { type: 'good', rel: 'hop', label: `${chiA} 🔗 Hợp ${chiTime}`, desc: 'Địa Chi Lục Hợp — gắn kết bền vững.', score: 2 };
      if (DIA_CHI_HINH[chiA] === chiTime) return { type: 'bad', rel: 'hinh', label: `${chiA} ⚠️ Hình ${chiTime}`, desc: 'Tương Hình — áp chế, dễ sinh bất hòa nội bộ.', score: -1 };
      if (DIA_CHI_HAI[chiA] === chiTime) return { type: 'bad', rel: 'hai', label: `${chiA} 🗡️ Hại ${chiTime}`, desc: 'Tương Hại — ám hại ngầm, tổn thương ngầm.', score: -1 };
    }
    return null;
  }

  // TÍCH HỢP: SO SÁNH QUA NGŨ HÀNH CỦA CUNG (Sửa lỗi cho chủ đề Hôn nhân)
  function getRelationBetweenPalaces(pA, pB, chart) {
    if (!pA || !pB || !chart) return { rel: 'khong', label: 'Không rõ', score: 0 };
    
    // CHỈ lấy Ngũ hành của Cung (Bỏ qua ngũ hành của Can để tránh lỗi Canh luôn khắc Ất)
    const palHA = getCungMeta(pA.cung, chart).hanh;
    const palHB = getCungMeta(pB.cung, chart).hanh;
    const tA = palaceName(pA.cung, chart);
    const tB = palaceName(pB.cung, chart);

    let actA = palHA;
    let actB = palHB;

    let rel = 'khong', label = 'Không rõ', score = 0;

    if (actA && actB) {
      if (sheng(actA, actB)) { rel = 'a_sinh_b'; label = `Cung ${tA} (${actA}) sinh Cung ${tB} (${actB})`; score = 2; }
      else if (sheng(actB, actA)) { rel = 'b_sinh_a'; label = `Cung ${tB} (${actB}) sinh Cung ${tA} (${actA})`; score = -1; }
      else if (khac(actA, actB)) { rel = 'a_khac_b'; label = `Cung ${tA} (${actA}) khắc Cung ${tB} (${actB})`; score = -2; }
      else if (khac(actB, actA)) { rel = 'b_khac_a'; label = `Cung ${tB} (${actB}) khắc Cung ${tA} (${actA})`; score = 2; }
      else if (actA === actB) { rel = 'dong_hanh'; label = `Tỷ hòa (${actA})`; score = 1; }
    }
    return { rel, label, score };
  }

  function getRelationBetweenStems(stemA, stemB) {
    const hA = MAP_CAN[stemA] || '', hB = MAP_CAN[stemB] || '';
    if (!hA || !hB) return { rel: 'khong', label: 'Không rõ' };
    if (sheng(hA, hB)) return { rel: 'a_sinh_b', label: `${stemA}(${hA}) sinh ${stemB}(${hB})` };
    if (sheng(hB, hA)) return { rel: 'b_sinh_a', label: `${stemB}(${hB}) sinh ${stemA}(${hA})` };
    if (khac(hA, hB)) return { rel: 'a_khac_b', label: `${stemA}(${hA}) khắc ${stemB}(${hB})` };
    if (khac(hB, hA)) return { rel: 'b_khac_a', label: `${stemB}(${hB}) khắc ${stemA}(${hA})` };
    if (hA === hB) return { rel: 'dong_hanh', label: `${stemA} & ${stemB} Tỷ hòa (${hA})` };
    return { rel: 'khong', label: 'Không rõ' };
  }

  function getGrowthStage(palace, stem, chart) {
    if (!palace || !stem || !chart) return '';
    const dayHS = getStemOf(chart, 'day'), hourHS = getStemOf(chart, 'hour');
    if (stem === dayHS) return palace.growthCycle?.dayStem || '';
    if (stem === hourHS) return palace.growthCycle?.hourStem || '';
    if (palace.thienCanBan === stem) return palace.growthCycle?.heavenlyStem || '';
    if (palace.diaBan === stem) return palace.growthCycle?.earthlyStem || '';
    return '';
  }

  function getWangShuaiLabel(growthStage) {
    const strong = ['Đế Vượng','Trường Sinh','Lâm Quan','Mộc Dục','Quan Đới'];
    const weak = ['Tử','Mộ','Tuyệt','Bệnh','Suy'];
    if (strong.includes(growthStage)) return { label: growthStage, type: 'good' };
    if (weak.includes(growthStage)) return { label: growthStage, type: 'bad' };
    return { label: growthStage || '—', type: 'neutral' };
  }

  function getPatternsOf(palace) {
    if (!palace || !Array.isArray(palace.patterns)) return { bad: [], good: [], all: [] };
    const bad = palace.patterns.filter(p => p.loai === 'hung').map(p => p.ten);
    const good = palace.patterns.filter(p => p.loai === 'cat').map(p => p.ten);
    return { bad, good, all: [...bad, ...good] };
  }

  function getDeityScore(deityName) {
    const scores = {
      'Trực Phù':3,'Thái Âm':2,'Lục Hợp':2,'Cửu Thiên':1,'Cửu Địa':1,
      'Đằng Xà':-2,'Bạch Hổ':-2,'Huyền Vũ':-2,'Câu Trận':-1,'Chu Tước':-1
    };
    for (const [k,v] of Object.entries(scores)) {
      if (deityName && deityName.includes(k)) return v;
    }
    return 0;
  }

  // ============================ EXPERT LOGIC: NGUYỆT LỆNH & NHẬT LỆNH ============================
  function getVangTuongState(targetHanh, monthHanh) {
    if (!targetHanh || !monthHanh) return { state: 'Bình', mult: 1.0, type: 'neutral' };
    if (targetHanh === monthHanh) return { state: 'Vượng', mult: 1.5, type: 'good' };
    if (sheng(monthHanh, targetHanh)) return { state: 'Tướng', mult: 1.2, type: 'good' };
    if (sheng(targetHanh, monthHanh)) return { state: 'Hưu', mult: 0.8, type: 'neutral' };
    if (khac(targetHanh, monthHanh)) return { state: 'Tù', mult: 0.5, type: 'bad' };
    if (khac(monthHanh, targetHanh)) return { state: 'Tử', mult: 0.2, type: 'bad' };
    return { state: 'Bình', mult: 1.0, type: 'neutral' };
  }

  // TÍCH HỢP B: NHẬT LỆNH
  function getRiLingEffect(palace, chart) {
    if (!palace || !chart) return { score: 0, html: '' };
    const dayBranch = getBranchOf(chart, 'day');
    const dayHanh   = MAP_CHI[dayBranch] || '';
    const stemHanh  = MAP_CAN[getHeavenlyStem(palace)] || '';
    if (!dayHanh || !stemHanh) return { score: 0, html: '' };

    const vtDay = getVangTuongState(stemHanh, dayHanh);
    if (vtDay.state === 'Vượng' || vtDay.state === 'Tướng') {
      return {
        html: UI.line(`  ↳ ☀️ Nhật Lệnh [${dayBranch}]`, `${vtDay.state} — Lực lượng tức thời rất mạnh`, 'good'),
        score: 1
      };
    }
    if (vtDay.state === 'Tử' || vtDay.state === 'Tù') {
      return {
        html: UI.line(`  ↳ 🌑 Nhật Lệnh [${dayBranch}]`, `${vtDay.state} — Sức mạnh bị triệt tiêu trong ngày`, 'bad'),
        score: -1
      };
    }
    return { score: 0, html: '' };
  }

  function getContextualGateScore(gateName, topicId) {
    const g = normalizeGateName(gateName);
    const t = Number(topicId);
    if (t === 11 && g === 'Tử') return 3; // Mua BĐS (Đất)
    if ([13, 14, 22, 23].includes(t) && g === 'Thương') return 2; // Đòi nợ, Thể thao, Tố tụng
    if ([2, 3, 6].includes(t) && g === 'Tử') return -4; // Nghề nghiệp kỵ Tử môn
    if (t === 21 && g === 'Tử') return -5; // Sức khỏe kỵ Tử môn
    if (t === 21 && g === 'Sinh') return 4;
    const scores = { 'Khai':3,'Sinh':3,'Hưu':2,'Thương':-1,'Đỗ':1,'Cảnh':0,'Tử':-3,'Kinh':-2 };
    return scores[g] !== undefined ? scores[g] : 0;
  }

  function getContextualStarScore(starName, topicId) {
    const t = Number(topicId);
    if (t === 21 && (starName || '').includes('Thiên Nhuế')) return 0; // Sức khỏe (Bệnh là trung tính để xét)
    const scores = { 'Thiên Phụ':3,'Thiên Tâm':2,'Thiên Nhậm':1,'Thiên Anh':1,'Thiên Xung':0, 'Thiên Cầm':0,'Thiên Nhuế':-1,'Thiên Bồng':-2,'Thiên Trụ':-2 };
    for (const [k,v] of Object.entries(scores)) {
      if (starName && starName.includes(k)) return v;
    }
    return 0;
  }

  // TÍCH HỢP 2: THỜI KHẮC DỤNG
  function checkThoiKhacDung(dungThanPalace, chart, dungThanName) {
    if (!dungThanPalace || !chart) return null;
    const hourHS  = getStemOf(chart, 'hour');
    const hourHanh = MAP_CAN[hourHS] || '';
    const dungHS   = getHeavenlyStem(dungThanPalace);
    const dungHanh = MAP_CAN[dungHS] || '';
    if (!hourHanh || !dungHanh) return null;

    if (khac(hourHanh, dungHanh)) {
      return {
        type: 'bad',
        msg: `⚠️ THỜI KHẮC DỤNG: Can Giờ [${hourHS}·${hourHanh}] đang khắc ${dungThanName} [${dungHS}·${dungHanh}] — Dụng thần mất sức ngay lúc lập quẻ. Kết quả thực tế kém hơn điểm số dự đoán.`,
        score: -3
      };
    }
    if (sheng(hourHanh, dungHanh)) {
      return {
        type: 'good',
        msg: `✅ THỜI SINH DỤNG: Can Giờ [${hourHS}·${hourHanh}] đang sinh ${dungThanName} [${dungHS}·${dungHanh}] — Dụng thần được tăng cường vào đúng thời điểm hỏi. Kết quả tốt hơn dự kiến.`,
        score: 2
      };
    }
    return null;
  }

  // ============================ EXPERT LOGIC: THẬP CAN & THIÊN CAN HỢP ============================
  function getThapCanKhacUng(t, d) {
    if (!t || !d) return null;
    const dict = {
      'Mậu+Bính': { type: 'good', name: 'Thanh Long Phản Thủ', desc: 'Đại cát, mưu sự thuận lợi, làm ăn phát tài, quý nhân phù trợ.' },
      'Bính+Mậu': { type: 'good', name: 'Phi Điểu Điệt Huyệt', desc: 'Đại cát, mưu sự thành công dễ dàng không tốn sức, tiền tài tự đến.' },
      'Canh+Canh': { type: 'bad', name: 'Thái Bạch Đồng Cung', desc: 'Đại hung, quan tai, kỵ đi lại, kỵ làm ăn, nội bộ mâu thuẫn lục đục.' },
      'Canh+Nhâm': { type: 'bad', name: 'Di Lạc Thoái Vị', desc: 'Đại hung, mất chức, hao tài, biến động xấu, nữ giới sinh đẻ khó.' },
      'Nhâm+Canh': { type: 'bad', name: 'Thái Bạch Cầm Xà', desc: 'Hung, dễ bị kiện cáo, thị phi, tà môn, người tốt khó nương tựa.' },
      'Đinh+Quý': { type: 'bad', name: 'Chu Tước Đầu Giang', desc: 'Hung, khẩu thiệt thị phi, âm tín cách tuyệt, giấy tờ có vấn đề.' },
      'Quý+Đinh': { type: 'bad', name: 'Đằng Xà Yểu Kiều', desc: 'Hung, nhiều lo âu sợ hãi, thị phi, hỏa hoạn, đàn bà sinh sự.' },
      'Canh+Bính': { type: 'bad', name: 'Thái Bạch Nhập Huỳnh', desc: 'Đại hung. Khách tiến Chủ lùi, đề phòng mất trộm, hao tài, bị đối thủ chèn ép.' },
      'Bính+Canh': { type: 'bad', name: 'Huỳnh Hoặc Bột Thái Bạch', desc: 'Hung, Hỏa khắc Kim, dễ phá sản, tật bệnh, kẻ gian lừa gạt.' },
      'Tân+Ất': { type: 'bad', name: 'Bạch Hổ Xương Cuồng', desc: 'Hung, tai nạn, thương tích, hao tài tốn của, hôn nhân hung hiểm.' },
      'Ất+Tân': { type: 'bad', name: 'Thanh Long Đào Tẩu', desc: 'Hung, mưu sự thất bại, nô bộc bỏ trốn, tài sản tiêu tán.' },
      'Nhâm+Nhâm': { type: 'bad', name: 'Thiên La Võng Trương', desc: 'Đại hung, bế tắc, vướng mắc pháp lý, làm ăn khó khăn không lối thoát.' },
      'Quý+Quý': { type: 'bad', name: 'Thiên Võng Tứ Trương', desc: 'Đại hung, cùng đường bí lối, bệnh tật liên miên, mưu sự hư hỏng.' },
      'Mậu+Mậu': { type: 'bad', name: 'Phục Ngâm Mậu Mậu', desc: 'Mọi việc bế tắc, đình trệ, kỵ khởi sự, chỉ nên giữ nguyên trạng.' },
      'Giáp+Canh': { type: 'bad', name: 'Phi Bồng Sát', desc: 'Trắc trở, mưu sự gặp phá hoại.' }
    };
    return dict[`${t}+${d}`] || null;
  }

  const THIEN_CAN_HOP_MAP = { 'Giáp':'Kỷ','Kỷ':'Giáp', 'Ất':'Canh','Canh':'Ất', 'Bính':'Tân','Tân':'Bính', 'Đinh':'Nhâm','Nhâm':'Đinh', 'Mậu':'Quý','Quý':'Mậu' };
  function getThienCanHop(stemA, stemB) { return THIEN_CAN_HOP_MAP[stemA] === stemB; }
  function getThienCanHopNote(stemA, stemB) {
    if (!getThienCanHop(stemA, stemB)) return '';
    const pairs = {
      'Giáp+Kỷ': 'Giáp-Kỷ Hợp hóa Thổ: Hai bên có duyên kéo nhau lại — quan hệ bền chặt, tự nhiên gắn kết.',
      'Kỷ+Giáp': 'Kỷ-Giáp Hợp hóa Thổ: Hai bên có duyên kéo nhau lại — quan hệ bền chặt, tự nhiên gắn kết.',
      'Ất+Canh': 'Ất-Canh Hợp hóa Kim: Cặp Thiên Can Hợp đặc biệt — nam nữ hút nhau mạnh mẽ, duyên số sâu dày.',
      'Canh+Ất': 'Canh-Ất Hợp hóa Kim: Cặp Thiên Can Hợp đặc biệt — nam nữ hút nhau mạnh mẽ, duyên số sâu dày.',
      'Bính+Tân': 'Bính-Tân Hợp hóa Thủy: Hai bên có sức hút lẫn nhau — hợp tác hoặc kết đôi đều có duyên.',
      'Tân+Bính': 'Tân-Bính Hợp hóa Thủy: Hai bên có sức hút lẫn nhau — hợp tác hoặc kết đôi đều có duyên.',
      'Đinh+Nhâm': 'Đinh-Nhâm Hợp hóa Mộc: Hai bên duyên hợp, dễ đồng thuận và gắn kết lâu dài.',
      'Nhâm+Đinh': 'Nhâm-Đinh Hợp hóa Mộc: Hai bên duyên hợp, dễ đồng thuận và gắn kết lâu dài.',
      'Mậu+Quý': 'Mậu-Quý Hợp hóa Hỏa: Hai bên có duyên hợp tự nhiên — quan hệ nồng nhiệt, dễ tiến triển.',
      'Quý+Mậu': 'Quý-Mậu Hợp hóa Hỏa: Hai bên có duyên hợp tự nhiên — quan hệ nồng nhiệt, dễ tiến triển.'
    };
    return pairs[`${stemA}+${stemB}`] || `${stemA}-${stemB} Thiên Can Hợp: Hai bên có duyên số gắn kết tự nhiên.`;
  }

  const TAM_KY = ['Ất', 'Bính', 'Đinh'];
  const TAM_KY_CANH_BAO_TOPICS = new Set([18]); 
  function hasTamKy(palace) { return palace && TAM_KY.includes(getHeavenlyStem(palace)); }
  function getTamKyLabel(palace) {
    const hs = getHeavenlyStem(palace);
    if (hs === 'Ất') return { can: 'Ất', name: 'Ất Kỳ (Nhật Kỳ)', desc: 'Quý nhân ẩn mình nhưng cực kỳ quyền lực, xuất hiện đúng lúc. Phù hợp mưu việc âm thầm, giải quyết vấn đề phía sau hậu trường.' };
    if (hs === 'Bính') return { can: 'Bính', name: 'Bính Kỳ (Nguyệt Kỳ)', desc: 'Quý nhân công khai, danh tiếng lớn, hào phóng và sáng suốt. Phù hợp mưu việc ra mắt công khai, mở rộng quan hệ, xây dựng thương hiệu.' };
    if (hs === 'Đinh') return { can: 'Đinh', name: 'Đinh Kỳ (Tinh Kỳ)', desc: 'Quý nhân thông minh, lanh lợi, giỏi về thông tin và văn bản. Phù hợp mưu việc liên quan đến trí tuệ, đàm phán, hợp đồng.' };
    return null;
  }
  function checkTamKyAtGate(chart, gateName, topicId) {
    const p = findPalaceByGate(chart, gateName);
    if (!p) return null;
    const tk = getTamKyLabel(p);
    if (!tk) return null;
    if (TAM_KY_CANH_BAO_TOPICS.has(Number(topicId)) && (tk.can === 'Bính' || tk.can === 'Đinh')) return null;
    return { palace: p, tamKy: tk };
  }

  function getCucInfo(chart) {
    const isDuong = !!chart?.ju?.isDuong;
    const cucName = isDuong ? 'Dương Độn' : 'Âm Độn';
    const cucNum = chart?.ju?.number || '';
    return { isDuong, cucName, cucNum };
  }
  function renderCucAdvice(chart) {
    const { isDuong, cucName, cucNum } = getCucInfo(chart);
    let advice = isDuong 
      ? 'Khách (người ngoài, đối phương) chủ động — bên hỏi ở thế bị động, nên phòng thủ và chờ thời. Lợi cho việc thủ, bất lợi cho việc công.'
      : 'Chủ (người hỏi) chủ động — đang ở thế có lợi để hành động. Lợi cho việc mưu toan, tiến công, ra quyết định.';
    return UI.note(`🌀 <strong>${cucName} ${cucNum ? 'Cục '+cucNum : ''}</strong>: ${advice}`, isDuong ? 'neutral' : 'good');
  }

  function getChuKhachAdvice(palace) {
    if (!palace) return '';
    const t = getHeavenlyStem(palace), d = getEarthlyStem(palace);
    const ht = MAP_CAN[t], hd = MAP_CAN[d];
    if (!ht || !hd) return '';
    let adviceKhach = '', adviceChu = '', type = 'info';
    if (khac(ht, hd)) { adviceKhach = 'Áp đảo, nên ĐÁNH NHANH, chủ động ra đòn.'; adviceChu = 'Bị áp chế, nên PHÒNG THỦ, tránh đối đầu.'; type = 'good'; }
    else if (khac(hd, ht)) { adviceKhach = 'Bị cản trở lớn, không nên mạo hiểm.'; adviceChu = 'Lợi thế sân nhà, nên ÁN BINH BẤT ĐỘNG chờ cơ hội.'; type = 'good'; }
    else if (sheng(ht, hd)) { adviceKhach = 'Hao tổn tài nguyên để bồi dưỡng đối tác.'; adviceChu = 'Được hưởng lợi từ bên ngoài mang đến, rất tốt.'; type = 'good'; }
    else if (sheng(hd, ht)) { adviceKhach = 'Được hỗ trợ, mưu sự dễ thành.'; adviceChu = 'Bị hao tổn sức lực/tiền bạc cho bên ngoài.'; type = 'bad'; }
    else { adviceKhach = adviceChu = 'Ngang sức, nên hợp tác cùng có lợi.'; }
    return UI.note(`💡 <strong>Chiến thuật Chủ - Khách (Tùy định vị bản thân):</strong><br>• <strong>Nếu bạn là người CHỦ ĐỘNG (Khách):</strong> ${adviceKhach}<br>• <strong>Nếu bạn là người BỊ ĐỘNG (Chủ):</strong> ${adviceChu}`, type);
  }

  function analyzeTenDiaRelation(palace, chart, roleName) {
    if (!palace) return '';
    const hs = getHeavenlyStem(palace), es = getEarthlyStem(palace);
    const hHS = MAP_CAN[hs] || '', hES = MAP_CAN[es] || '';
    if (!hHS || !hES) return '';
    if (khac(hHS, hES)) return UI.note(`🔍 Nội Tình [${roleName}]: <strong>${hs}(${hHS}) khắc ${es}(${hES})</strong> — Thiên khắc Địa. Bên ngoài (${hs}) đang áp đảo và kiểm soát bên trong (${es}). Dụng thần này bị kiểm soát bởi lực bên ngoài, ít tự chủ. Chiến thuật: nên chủ động ra đòn trước, tận dụng lúc đang ở thế mạnh.`, 'bad');
    if (khac(hES, hHS)) return UI.note(`🔍 Nội Tình [${roleName}]: <strong>${es}(${hES}) khắc ${hs}(${hHS})</strong> — Địa khắc Thiên. Bên trong (${es}) đang kiểm soát và chế ngự bên ngoài (${hs}). Dụng thần này có thực lực nội tại mạnh. Chiến thuật: nên phòng thủ, án binh bất động, chờ đối phương bộc lộ điểm yếu.`, 'good');
    if (sheng(hHS, hES)) return UI.note(`🔍 Nội Tình [${roleName}]: <strong>${hs}(${hHS}) sinh ${es}(${hES})</strong> — Thiên sinh Địa. Ngoại lực đang bồi dưỡng dụng thần này. Được bên ngoài hỗ trợ mạnh — trạng thái nhận lợi. Tuy nhiên phụ thuộc vào nguồn ngoài.`, 'good');
    if (sheng(hES, hHS)) return UI.note(`🔍 Nội Tình [${roleName}]: <strong>${es}(${hES}) sinh ${hs}(${hHS})</strong> — Địa sinh Thiên. Nội lực đang bị hao tổn để nuôi dưỡng bên ngoài. Dụng thần đang tiêu hao sức lực nội tại cho đối phương hoặc môi trường bên ngoài.`, 'bad');
    return UI.note(`🔍 Nội Tình [${roleName}]: <strong>${hs} & ${es} Tỷ hòa (${hHS})</strong> — Trong ngoài đồng nhất. Trạng thái ổn định, không bị tác động lớn từ bên ngoài. Tự lực cánh sinh.`, 'neutral');
  }

  // ============================ EXPERT V2 EXTENSIONS ============================
  const TINH_MON_HOP = {
    'Thiên Tâm+Khai':   { type: 'good', name: 'Tâm Khai Cách', desc: 'Đại cát: Mưu sự đại thành, quyết định sáng suốt, lãnh đạo xuất chúng. Đặc biệt lợi cho thăng chức, kinh doanh lớn.' },
    'Thiên Nhậm+Sinh':  { type: 'good', name: 'Nhậm Sinh Cách', desc: 'Cát: Được quý nhân phù trợ từ mọi phía, tài lộc dồi dào, mưu sự nhận được hỗ trợ.' },
    'Thiên Phụ+Hưu':    { type: 'good', name: 'Phụ Hưu Cách', desc: 'Cát: Môi trường làm việc lý tưởng, được bảo vệ toàn diện, thích hợp ẩn thân tích lũy.' },
    'Thiên Anh+Cảnh':   { type: 'good', name: 'Anh Cảnh Cách', desc: 'Cát: Danh tiếng tỏa sáng, truyền thông thuận lợi, thích hợp quảng bá và giao tiếp.' },
    'Thiên Bồng+Tử':    { type: 'bad', name: 'Bồng Tử Cách', desc: 'Đại hung: Tai họa liên tiếp, sức khỏe nguy hiểm, quan tai hình thương — tránh mọi hành động lớn.' },
    'Thiên Trụ+Kinh':   { type: 'bad', name: 'Trụ Kinh Cách', desc: 'Hung: Kinh sợ bất an, tin xấu liên tiếp, dễ bị phá hoại từ bên trong nội bộ.' },
    'Thiên Nhuế+Tử':    { type: 'bad', name: 'Nhuế Tử Cách', desc: 'Đại hung: Bệnh tật nguy hiểm, tổn thất nặng nề — trường hợp xấu nhất trong xem bệnh.' },
    'Thiên Xung+Thương':{ type: 'bad', name: 'Xung Thương Cách', desc: 'Hung: Tranh chấp dẫn đến xô xát, dễ bị thương tích hoặc kiện tụng leo thang.' },
    'Thiên Cầm+Đỗ':     { type: 'bad', name: 'Cầm Đỗ Cách', desc: 'Hung: Bị giam cầm, mắc kẹt không thoát ra được — liên quan đến cả nghĩa bóng lẫn nghĩa đen.' },
    'Thiên Phụ+Sinh':   { type: 'good', name: 'Phụ Sinh Phú Quý', desc: 'Cát: Tài lộc và quý nhân đồng thời xuất hiện — thời điểm mở rộng đầu tư, kinh doanh.' },
    'Thiên Tâm+Sinh':   { type: 'good', name: 'Tâm Sinh Nhân Hòa', desc: 'Cát: Được người tài hỗ trợ về tài chính, hợp tác thuận lợi.' }
  };

  function checkTinhMonHop(palace, chart) {
    if (!palace) return null;
    const star = palace.thienBan || '';
    const gate = normalizeGateName(palace.batMon || '');
    if (!star || !gate) return null;
    
    for (const [k, v] of Object.entries(TINH_MON_HOP)) {
      const parts = k.split('+');
      if (star.includes(parts[0]) && gate === parts[1]) return v;
    }
    return null;
  }

  // TÍCH HỢP 3: MÔN SAO TƯƠNG TRỢ
  function checkMonSaoTuongTroPhu(palace, chart) {
    if (!palace) return null;
    const gate = normalizeGateName(palace.batMon || '');
    const star = palace.thienBan || '';
    const gateHanh = chart?.sys?.NGU_HANH_MON?.[gate] || MAP_MON[gate] || '';
    let starHanh = null;
    for (const [k, v] of Object.entries(MAP_SAO)) {
      if (star.includes(k)) { starHanh = v; break; }
    }
    if (!gateHanh || !starHanh) return null;

    if (sheng(starHanh, gateHanh)) return {
      type: 'good',
      label: `Sao(${starHanh}) sinh Môn(${gateHanh})`,
      msg: `⭐ Sao-Môn Tương Sinh: ${star}(${starHanh}) sinh ${palace.batMon}(${gateHanh}) — Sao tiếp thêm sức mạnh cho Môn, cát cục nhân đôi hiệu lực.`,
      score: 1.5
    };
    if (khac(starHanh, gateHanh)) return {
      type: 'bad',
      label: `Sao(${starHanh}) khắc Môn(${gateHanh})`,
      msg: `💥 Sao-Môn Tương Khắc: ${star}(${starHanh}) khắc ${palace.batMon}(${gateHanh}) — Sao triệt tiêu sức mạnh Môn, cát cục bị phá, hung cục tăng nặng.`,
      score: -2
    };
    if (sheng(gateHanh, starHanh)) return {
      type: 'neutral',
      label: `Môn(${gateHanh}) sinh Sao(${starHanh})`,
      msg: `🔻 Môn Thoát Khí vào Sao: ${palace.batMon}(${gateHanh}) sinh ${star}(${starHanh}) — Sức mạnh Môn bị Sao hút cạn, hiệu lực giảm nhẹ.`,
      score: -0.5
    };
    return null;
  }

  function analyzeMonCungRelation(palace, chart) {
    if (!palace || !palace.batMon) return null;
    const gateNorm = normalizeGateName(palace.batMon);
    const gateHanh = chart?.sys?.NGU_HANH_MON?.[gateNorm] || MAP_MON[gateNorm];
    const cungHanh = palaceElement(palace.cung, chart);
    
    if (!gateHanh || !cungHanh) return null;
    const result = { type: null, label: '', score: 0, advice: '' };
    
    if (khac(gateHanh, cungHanh)) {
      result.type = 'mon_buc_cung'; result.label = `${palace.batMon}(${gateHanh}) bức Cung(${cungHanh})`; result.score = -1;
      result.advice = 'Môn Bức Cung: Môn đang xung đột với nền tảng cung — hành động bề ngoài mạnh nhưng gốc rễ không vững, dễ thất bại ở giai đoạn cuối.';
    } else if (khac(cungHanh, gateHanh)) {
      result.type = 'cung_buc_mon'; result.label = `Cung(${cungHanh}) bức ${palace.batMon}(${gateHanh})`; result.score = -2;
      result.advice = 'Cung Bức Môn: Nền tảng đang kìm hãm hành động — sức mạnh của Môn bị triệt tiêu bởi vị trí đứng, kết quả trái với mong đợi.';
    } else if (sheng(cungHanh, gateHanh)) {
      result.type = 'cung_sinh_mon'; result.label = `Cung(${cungHanh}) sinh ${palace.batMon}(${gateHanh})`; result.score = +2;
      result.advice = 'Cung Sinh Môn: Nền tảng nuôi dưỡng hành động — đây là vị trí lý tưởng của Môn, sức mạnh được nhân lên.';
    } else if (sheng(gateHanh, cungHanh)) {
      result.type = 'mon_thoat_khi'; result.label = `${palace.batMon}(${gateHanh}) thoát khí vào Cung(${cungHanh})`; result.score = -1;
      result.advice = 'Môn Thoát Khí: Sức mạnh của Môn đang chảy ra ngoài, hao tổn — cần nỗ lực nhiều hơn để duy trì kết quả.';
    }
    return result.type ? result : null;
  }

  const AN_CAN_CONTEXT = {
    'Giáp': { general: 'Quý nhân ẩn thân, có người đỡ đầu bí mật nhưng quyền lực lớn.', business: 'Có nguồn vốn hoặc đối tác tiềm ẩn chưa lộ diện.', health: 'Bệnh có liên quan đến gan hoặc thần kinh ẩn phục.' },
    'Ất': { general: 'Có phụ nữ ẩn mình đang ảnh hưởng đến tình huống.', business: 'Đối thủ cạnh tranh giấu mặt đang theo dõi.', relationship: 'Bên nữ đang che giấu cảm xúc thực.' },
    'Bính': { general: 'Có nam giới thứ ba liên quan đến tình huống.', relationship: 'Người thứ ba (nam) đang xuất hiện trong bóng tối.', legal: 'Có bằng chứng hình ảnh/video đang bị che giấu.' },
    'Đinh': { general: 'Có phụ nữ thứ ba liên quan.', relationship: 'Người thứ ba (nữ) đang ảnh hưởng đến quan hệ.', legal: 'Có thông tin mật hoặc tài liệu chưa được tiết lộ.' },
    'Mậu': { general: 'Có vốn liếng hoặc lợi ích tài chính ẩn.', business: 'Lợi nhuận thực sự cao hơn vẻ bề ngoài.', health: 'Có khối u hoặc tắc nghẽn ẩn trong cơ thể.' },
    'Kỷ': { general: 'Có trở ngại ẩn từ phụ nữ hoặc đất đai.', legal: 'Tài sản có tranh chấp ngầm chưa bộc lộ.', health: 'Có bệnh tiềm ẩn liên quan đến tiêu hóa.' }
  };

  function analyzeAnCan(palace, topicId, chart) {
    if (!palace || !palace.anCan) return { html: '', score: 0 };
    const anCan = palace.anCan;
    const ctx = AN_CAN_CONTEXT[anCan];
    if (!ctx) return { html: '', score: 0 };
    
    const t = Number(topicId);
    let desc = ctx.general;
    if ([18].includes(t) && ctx.relationship) desc = ctx.relationship;
    else if ([9, 10, 11, 12].includes(t) && ctx.business) desc = ctx.business;
    else if ([21, 1].includes(t) && ctx.health) desc = ctx.health;
    else if ([22, 23].includes(t) && ctx.legal) desc = ctx.legal;
    
    const voidNote = isVoid(chart, palace) ? ' (Không Vong — ảnh hưởng giảm nhẹ)' : '';
    return {
      html: UI.line(`  ↳ 🔮 Ẩn Can [${anCan}]`, `${desc}${voidNote}`, 'neutral'),
      score: 0
    };
  }

  function getPalaceStemRelation(palace, stemHanh, chart) {
    const palaceHanh = palaceElement(palace.cung, chart);
    if (!palaceHanh || !stemHanh) return null;
    
    if (sheng(palaceHanh, stemHanh)) return { rel: 'cung_sinh_can', score: 1.5, label: `Cung (${palaceHanh}) sinh Can (${stemHanh})`, advice: 'Được địa lợi, nền tảng vững chắc bồi dưỡng.' };
    if (khac(palaceHanh, stemHanh)) return { rel: 'cung_khac_can', score: -1.5, label: `Cung (${palaceHanh}) khắc Can (${stemHanh})`, advice: 'Bị đất đè, môi trường chèn ép, khó phát huy.' };
    if (khac(stemHanh, palaceHanh)) return { rel: 'can_khac_cung', score: -0.5, label: `Can (${stemHanh}) khắc Cung (${palaceHanh})`, advice: 'Có thực lực kiểm soát hoàn cảnh nhưng hao tổn.' };
    if (sheng(stemHanh, palaceHanh)) return { rel: 'can_sinh_cung', score: -0.5, label: `Can (${stemHanh}) sinh Cung (${palaceHanh})`, advice: 'Thoát khí, sinh lực bị môi trường rút cạn.' };
    
    return { rel: 'dong_hanh', score: 1, label: `Cung và Can Tỷ hòa (${stemHanh})`, advice: 'Môi trường đồng điệu, ổn định.' };
  }

  const HUONG_CHI_TIET = {
    'Bắc':      { mau: 'Đen/Tối', loai: 'Thấp, gần nước, tầng hầm, kho tối', hanh: 'Thủy' },
    'Nam':      { mau: 'Đỏ/Cam/Tím', loai: 'Cao, sáng, khu vực náo nhiệt, chỗ đông người', hanh: 'Hỏa' },
    'Đông':     { mau: 'Xanh lá', loai: 'Cây cối, công viên, khu vực ồn ào/đang thi công', hanh: 'Mộc' },
    'Tây':      { mau: 'Trắng/Xám', loai: 'Kim loại, bê tông, đường lớn, siêu thị', hanh: 'Kim' },
    'Đông Bắc': { mau: 'Xanh đậm, xanh đen', loai: 'Ngõ hẻm, góc khuất, gần tường/đất trống', hanh: 'Mộc' },
    'Tây Nam':  { mau: 'Trắng xám', loai: 'Khu mua sắm, thông gió tốt, cửa sổ lớn, vườn hoa', hanh: 'Kim' },
    'Đông Nam': { mau: 'Nâu đất, nâu đỏ, màu ấm tối', loai: 'Khu dân cư yên tĩnh, không gian phẳng, ruộng đất', hanh: 'Thổ' },
    'Tây Bắc':  { mau: 'Bạc/Trắng', loai: 'Nơi uy nghi, cơ quan, công trình lớn, phòng sếp', hanh: 'Kim' },
  };

  function renderDirectionAdvice(palace, chart, context = '') {
    if (!palace) return '';
    const dir = palaceDirection(palace.cung, chart);
    const info = HUONG_CHI_TIET[dir];
    if (!info) return '';
    return UI.note(`🧭 <strong>Gợi ý hướng ${dir}:</strong> Tìm tại những nơi ${info.loai}. Nhận diện: màu ${info.mau}, ngũ hành ${info.hanh}. ${context}`, 'info');
  }

  // TÍCH HỢP 6: MỞ RỘNG ACTION PLAN 26 CHỦ ĐỀ
  function renderActionPlan(finalScore, topicId) {
    const plans = {
      1: { good:'→ NÊN: Giữ tâm lý thoải mái, bệnh sẽ qua nhanh.', wait:'→ CHỜ: Theo dõi thêm, đổi thói quen sinh hoạt.', bad:'→ KHẨN: Khám chuyên khoa ngay lập tức.' },
      2: { good:'→ NÊN: Tự tin đảm nhận việc lớn, đề xuất thăng tiến.', wait:'→ CHỜ: Giữ nguyên trạng, tích lũy thêm kinh nghiệm.', bad:'→ PHÒNG THỦ: Tránh xung đột sếp, cẩn thận sai sót văn bản.' },
      3: { good:'→ NÊN: Nộp đơn xin thăng chức ngay.', wait:'→ CHỜ: Cần thêm 1 người uy tín tiến cử.', bad:'→ DỪNG: Sẽ bị bác bỏ, hãy ẩn mình.' },
      4: { good:'→ NÊN: Tiếp cận nhờ vả ngay, đây là quý nhân.', wait:'→ CHỜ: Thăm dò kỹ hơn trước khi đề cập chuyện chính.', bad:'→ TRÁNH: Đừng nhờ người này, dễ bị lừa/hỏng việc.' },
      5: { good:'→ NÊN: Chuyển việc ngay, chỗ mới rất tốt.', wait:'→ CHỜ: Nắm chắc offer chỗ mới rồi hẵng nộp đơn nghỉ.', bad:'→ DỪNG: Nơi cũ đang tốt hơn nơi mới.' },
      6: { good:'→ NÊN: Nhận việc ngay, rất hợp.', wait:'→ ĐÀM PHÁN: Có thể deal thêm lương trước khi ký.', bad:'→ TỪ CHỐI: Môi trường này sẽ vắt kiệt bạn.' },
      7: { good:'→ NÊN: Mua ngay, hàng chất lượng giá tốt.', wait:'→ CHỜ: So sánh thêm 1-2 nhà cung cấp khác.', bad:'→ KHÔNG MUA: Hàng lỗi, lừa đảo hoặc hớ giá.' },
      8: { good:'→ NÊN: Đẩy mạnh marketing, chốt sale ngay.', wait:'→ CHĂM SÓC: Khách chưa sẵn sàng, cần tư vấn thêm.', bad:'→ BỎ QUA: Khách này không có tiềm năng, tránh mất thời gian.' },
      9: { good:'→ NÊN: Khai trương, khởi nghiệp ngay.', wait:'→ CHỜ: Chuẩn bị thêm dòng tiền dự phòng.', bad:'→ DỪNG: Rủi ro phá sản cực cao.' },
      10: { good:'→ NÊN: Ký hợp đồng hợp tác ngay.', wait:'→ CHỜ: Rà soát lại điều khoản chia lợi nhuận.', bad:'→ HỦY: Đối tác có mưu đồ ẩn, không an toàn.' },
      11: { good:'→ NÊN: Xuống tiền chốt cọc ngay.', wait:'→ CHỜ: Kiểm tra lại quy hoạch/pháp lý.', bad:'→ HỦY: Đất/nhà có tì vết nặng.' },
      12: { good:'→ NÊN: Giao dịch an toàn, có thể giải ngân/vay.', wait:'→ CHỜ: Yêu cầu thêm tài sản thế chấp.', bad:'→ TỪ CHỐI: Mất trắng hoặc không đòi được.' },
      13: { good:'→ NÊN: Tới gặp trực tiếp đòi nợ, sẽ lấy được.', wait:'→ NHỜ VẢ: Nhờ người thứ 3 có uy tín can thiệp.', bad:'→ KIỆN: Khởi kiện ra tòa, không thể đòi mềm.' },
      14: { good:'→ NÊN: Tự tin thi đấu, đang ở thế thượng phong.', wait:'→ THẬN TRỌNG: Đá phòng ngự phản công.', bad:'→ PHÒNG THỦ: Đối thủ quá mạnh, hạn chế bàn thua.' },
      15: { good:'→ NÊN: Tự tin làm bài, đề trúng tủ.', wait:'→ ÔN KỸ: Tập trung ôn phần cốt lõi, không học dàn trải.', bad:'→ CẨN THẬN: Đề thi ra hiểm, dễ lạc đề.' },
      16: { good:'→ ĐI TỚI: Di chuyển đến các cung Không Vong đã chỉ.', wait:'→ TÌM QUANH: Đi chậm lại, sắp có xe ra.', bad:'→ ĐỔI BÃI: Bãi này đã kín chỗ.' },
      17: { good:'→ NÊN: Tiến hành chuyến đi, rất thuận lợi.', wait:'→ CHUẨN BỊ: Kiểm tra kỹ giấy tờ, hành lý.', bad:'→ DỜI NGÀY: Nguy cơ tai nạn, trễ chuyến, thời tiết xấu.' },
      18: { good:'→ NÊN: Đưa nhau về ra mắt, chốt cưới.', wait:'→ CHỜ: Cần thấu hiểu thêm, giải quyết hiểu lầm.', bad:'→ DỪNG LẠI: Có dấu hiệu lừa dối/người thứ 3.' },
      19: { good:'→ THAM KHẢO: Thông tin mang tính dự báo Âm Dương.', wait:'→ THAM KHẢO: Thông tin mang tính dự báo Âm Dương.', bad:'→ THAM KHẢO: Thông tin mang tính dự báo Âm Dương.' },
      20: { good:'→ AN TÂM: Mẹ tròn con vuông.', wait:'→ CHUẨN BỊ: Đăng ký bệnh viện tuyến trên.', bad:'→ CẤP CỨU: Theo dõi sát sao sinh non/biến chứng.' },
      21: { good:'→ NÊN: Tiếp tục phác đồ hiện tại.', wait:'→ CHỜ: Đổi chế độ ăn uống, sinh hoạt.', bad:'→ ĐỔI BÁC SĨ: Tìm bệnh viện/phương pháp khác ngay.' },
      22: { good:'→ NÊN: Tiến hành kiện, thu thập đủ bằng chứng.', wait:'→ HÒA GIẢI: Ưu tiên thương lượng ngoài tòa.', bad:'→ RÚT ĐƠN: Đang ở thế yếu, kiện sẽ thua và thiệt hại.' },
      23: { good:'→ HY VỌNG: Có thể được tại ngoại/giảm án.', wait:'→ CHỜ ĐỢI: Tìm luật sư giỏi bào chữa.', bad:'→ CHUẨN BỊ TÂM LÝ: Tội nặng, án cao.' },
      24: { good:'→ NÊN: Tìm ngay theo hướng chỉ định, sẽ thấy.', wait:'→ CHỜ: In tờ rơi, nhờ công an hỗ trợ.', bad:'→ KHẨN CẤP: Nguy hiểm tính mạng/bị bắt cóc.' },
      25: { good:'→ NÊN: Tìm kỹ quanh nhà, góc khuất.', wait:'→ CHỜ: Đồ vật sẽ tự xuất hiện lại.', bad:'→ BỎ QUÊN: Đồ đã mất hẳn/bị trộm, báo công an.' },
      26: { good:'→ CHUẨN BỊ: Lên kế hoạch theo thời tiết thuận lợi.', wait:'→ THEO DÕI: Thời tiết dễ đổi.', bad:'→ HỦY LỊCH: Thời tiết xấu, không ra ngoài.' }
    };
    
    const action = plans[topicId];
    if (!action) return ''; 
    let msg = '';
    if (finalScore >= 3) msg = action.good;
    else if (finalScore >= 0) msg = action.wait;
    else msg = action.bad;
    return UI.verdict(`🚀 KHUYẾN NGHỊ HÀNH ĐỘNG: ${msg}`, finalScore >= 3 ? 'good' : (finalScore >= 0 ? 'warn' : 'bad'));
  }

  // TÍCH HỢP: NORMALIZE SCORE
  function normalizeScore(raw, topicId) {
    const clamped = Math.max(-15, Math.min(15, raw));
    const THRESHOLD = {
      2: { great: 8, good: 4, bad: -4, terrible: -8 },
      9: { great: 10, good: 5, bad: -5, terrible: -10 },
      18: { great: 8, good: 3, bad: -3, terrible: -8 },
      21: { great: 6, good: 2, bad: -3, terrible: -7 },
      22: { great: 7, good: 3, bad: -3, terrible: -8 },
    };
    
    const th = THRESHOLD[topicId] || { great: 8, good: 3, bad: -3, terrible: -8 };
    
    let verdict = '⚪ TRUNG HÒA / CHƯA RÕ RÀNG';
    let pct = '50-55%';
    let type = 'neutral';
    
    if (clamped >= th.great) { verdict = '🟢 RẤT THUẬN LỢI (ĐẠI CÁT)'; pct = '88-95%'; type = 'great'; }
    else if (clamped >= th.good) { verdict = '🟢 KHÁ THUẬN LỢI (CÁT)'; pct = '70-85%'; type = 'good'; }
    else if (clamped <= th.terrible) { verdict = '🔴 BẤT LỢI NẶNG (ĐẠI HUNG)'; pct = '< 20%'; type = 'terrible'; }
    else if (clamped <= th.bad) { verdict = '🟠 KHÔNG THUẬN LỢI (HUNG)'; pct = '30-45%'; type = 'bad'; }

    return { clamped, verdict, pct, type };
  }

  // TÍCH HỢP D: BẢNG TÓM TẮT 3 YẾU TỐ CHÍNH (DASHBOARD GRID)
  function renderKeyDungThan(chart, topicId) {
    const KEY_BY_TOPIC = {
      1: [['Can Ngày','Bản thân'],['Thiên Nhuế','Bệnh'],['Thiên Tâm','Bác sĩ']],
      2: [['Khai Môn','Sự nghiệp'],['Sinh Môn','Tài lộc'],['Trực Phù','Sếp']],
      3: [['Khai Môn','Quyết định'],['Đỗ Môn','Người push'],['Trực Phù','Sếp']],
      4: [['Thiên Phụ','Người dẫn'],['Can Ngày','Bản thân'],['Trực Phù','Quyền lực']],
      5: [['Đỗ Môn','C.ty Mới'],['Khai Môn','Tương lai'],['Sinh Môn','Lương']],
      6: [['Đỗ Môn','Phỏng vấn'],['Khai Môn','Kết quả'],['Trực Phù','Sếp tương lai']],
      7: [['Can Ngày','Người mua'],['Can Giờ','Sản phẩm'],['Cảnh Môn','Thị trường']],
      8: [['Can Ngày','Người bán'],['Can Giờ','Sản phẩm'],['Trực Sử','Khách hàng']],
      9: [['Khai Môn','Khởi sự'],['Sinh Môn','Lợi nhuận'],['Mậu','Vốn']],
      10: [['Can Ngày','Bản thân'],['Can Giờ','Đối tác'],['Lục Hợp','Hợp đồng']],
      11: [['Sinh Môn','Nhà'],['Tử Môn','Đất'],['Cảnh Môn','Pháp lý']],
      12: [['Trực Phù','Cho Vay'],['Trực Sử','Đi Vay'],['Mậu','Tiền Vốn']],
      13: [['Can Ngày','Chủ Nợ'],['Can Giờ','Con Nợ'],['Thương Môn','Đòi Nợ']],
      14: [['Can Ngày','Bên Hỏi'],['Địa Bàn Giờ','Chủ Nhà'],['Thiên Bàn Giờ','Đội Khách']],
      15: [['Can Ngày','Thí sinh'],['Cảnh Môn','Đề thi'],['Thiên Phụ','Giám khảo']],
      16: [['Không Vong','Chỗ trống'],['Cảnh Môn','Đường vào'],['Dịch Mã','Di chuyển']],
      17: [['Can Ngày','Người đi'],['Can Giờ','Chuyến đi'],['Cảnh Môn','Đường bộ']],
      18: [['Lục Hợp','Hôn nhân'],['Ất','Bên Nữ'],['Canh','Bên Nam']],
      19: [['Cung Khôn','Người mẹ'],['Bát Môn','Môn Âm/Dương'],['Cửu Tinh','Sao Âm/Dương']],
      20: [['Thiên Nhuế','Người Mẹ'],['Cung Khôn','Em bé'],['Thiên Xung','Bệnh viện']],
      21: [['Thiên Nhuế','Bệnh'],['Sinh Môn','Hồi phục'],['Thiên Tâm','Điều trị']],
      22: [['Khai Môn','Tòa án'],['Cảnh Môn','Đơn kiện'],['Lục Hợp','Bằng chứng']],
      23: [['Tân','Nghi phạm'],['Lục Nghi','Kích Hình'],['Mậu','Vì Tiền']],
      24: [['Can Giờ','Người lạc'],['Lục Hợp','Hướng đi'],['Đỗ Môn','Nơi trốn']],
      25: [['Can Giờ','Vật mất'],['Huyền Vũ','Kẻ lấy'],['Thiên Bồng','Trộm cắp']],
      26: [['Thiên Bồng','Mưa'],['Thiên Anh','Nắng'],['Thiên Phụ','Gió']],
    };

    const keys = KEY_BY_TOPIC[Number(topicId)];
    if (!keys) return '';

    let html = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0;">`;
    for (const [gname, role] of keys) {
      let p = null;
      if (gname === 'Can Ngày') p = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'day'));
      else if (gname === 'Can Giờ') p = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'hour'));
      else if (gname === 'Địa Bàn Giờ') p = findPalaceByEarthlyStem(chart, getStemOf(chart, 'hour'));
      else if (gname === 'Thiên Bàn Giờ') p = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'hour'));
      else if (gname === 'Cung Khôn') p = getPalace(chart, 2);
      else if (['Mậu','Ất','Canh','Tân'].includes(gname)) p = findPalaceByHeavenlyStem(chart, gname);
      else p = findPalaceByGate(chart, gname) || findPalaceByStarName(chart, gname) || findPalaceByDeityName(chart, gname);
      
      const void_  = p ? isVoid(chart, p)  : false;
      const dead   = p ? hasRuMu(p)        : false;
      let gScore = 0;
      if (p) {
        gScore += getContextualGateScore(p.batMon || '', topicId);
        gScore += getContextualStarScore(p.thienBan || '', topicId);
      }
      
      let status = '';
      let bg = '';
      if (!p) { status = '❓ Ẩn'; bg = '#f9fafb'; }
      else if (void_) { status = '⭕ K.Vong'; bg = '#fee2e2'; }
      else if (dead) { status = '🪦 N.Mộ'; bg = '#fee2e2'; }
      else if (gScore >= 1) { status = '✅ Tốt'; bg = '#dcfce7'; }
      else if (gScore <= -1) { status = '❌ Xấu'; bg = '#fee2e2'; }
      else { status = '⚪ Bình'; bg = '#f9fafb'; }
      
      const dir = p ? palaceDirection(p.cung, chart) : '';
      html += `<div style="background:${bg};border:1px solid #e5e7eb;border-radius:6px;padding:8px 4px;text-align:center;">
        <div style="font-weight:700;font-size:12px;color:#1f2937;">${role}</div>
        <div style="color:#4b5563;font-size:11px;margin-top:2px;">[${gname}]</div>
        ${dir ? `<div style="color:#6b7280;font-size:10px;margin-top:2px;">${dir}</div>` : ''}
        <div style="font-weight:bold;margin-top:4px;font-size:12px;">${status}</div>
      </div>`;
    }
    html += '</div>';
    return html;
  }

  function renderExecutiveSummary(topicId, chart, finalScore, htmlContent) {
    const topic = TOPIC_GUIDES[topicId];
    if (!topic) return '';
    
    const { clamped, verdict, pct, type } = normalizeScore(finalScore, topicId);
    
    let bg = '#f3f4f6', color = '#374151', border = '#9ca3af';
    
    if (type === 'great') { bg = '#f0fdf4'; color = '#14532d'; border = '#16a34a'; }
    else if (type === 'good') { bg = '#ecfdf5'; color = '#166534'; border = '#22c55e'; }
    else if (type === 'terrible') { bg = '#fef2f2'; color = '#7f1d1d'; border = '#dc2626'; }
    else if (type === 'bad') { bg = '#fff1f2'; color = '#991b1b'; border = '#ef4444'; }
    
    const monthBranch = getBranchOf(chart, 'month');
    const monthHanh = MAP_CHI[monthBranch] || '';
    const cuc = getCucInfo(chart);
    
    let result = `
    <div style="margin-bottom:15px; border:2px solid ${border}; border-radius:6px; overflow:hidden;">
        <div style="background:${bg}; color:${color}; padding:10px; text-align:center; font-weight:bold; font-size:16px;">
            TỔNG QUAN: ${verdict}
        </div>
        <div style="padding:10px; background:#fff; font-size:13px; color:#4b5563; display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div style="width:100%; margin-bottom:5px;"><strong>Chủ đề:</strong> ${topic.title}</div>
            <div style="width:50%;"><strong>Điểm số:</strong> <span style="font-weight:bold; color:${finalScore >= 0 ? '#16a34a' : '#dc2626'}">${finalScore > 0 ? '+' : ''}${Math.round(finalScore * 10) / 10}</span></div>
            <div style="width:50%; text-align:right;"><strong>Phần trăm:</strong> <span style="font-weight:bold">${pct}</span></div>`;
            
    result += renderKeyDungThan(chart, topicId); // Nhúng Grid Dụng Thần Chính

    result += `<div style="width:100%; margin-top:8px; font-size:12px; border-top:1px dashed #e5e7eb; padding-top:8px;">
                <em>Bối cảnh: ${cuc.cucName} ${cuc.cucNum ? 'Cục '+cuc.cucNum : ''} | Tháng ${monthBranch} (${monthHanh})</em>
            </div>
        </div>
    </div>
    `;
    return result;
  }

  // TÍCH HỢP A: DEAL-BREAKER SYSTEM (ĐIỂM CHỐT QUYẾT ĐỊNH)
  function checkDealBreakers(chart, topicId) {
    const MAIN_DT = {
      2: 'Khai', 3: 'Khai', 5: 'Khai', 6: 'Khai', 9: 'Khai', 
      11: 'Sinh', 18: 'Lục Hợp', 21: 'Thiên Nhuế', 22: 'Khai', 23: 'Tân', 24: 'Can Giờ', 25: 'Can Giờ'
    };
    const dtName = MAIN_DT[Number(topicId)];
    if (!dtName) return null;
    
    let p = null;
    if (dtName === 'Can Giờ') p = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'hour'));
    else if (['Khai','Sinh','Hưu','Thương','Đỗ','Cảnh','Tử','Kinh'].includes(dtName)) p = findPalaceByGate(chart, dtName);
    else if (['Thiên Nhuế'].includes(dtName)) p = findPalaceByStarName(chart, dtName);
    else if (['Lục Hợp'].includes(dtName)) p = findPalaceByDeityName(chart, dtName);
    else if (dtName === 'Tân') p = findPalaceByHeavenlyStem(chart, 'Tân');

    if (!p) return null;

    const isVoid_ = isVoid(chart, p);
    const isMute = hasRuMu(p);
    const deityScore = getDeityScore(getEffectiveDeityName(p, chart));

    if (isVoid_ && isMute && deityScore < 0) {
       return { type: 'terrible', msg: `☠️ TỬ HUYỆT (DEAL-BREAKER): Dụng thần chính (${dtName}) rơi vào "Tam Sát" (Không Vong + Nhập Mộ + Hung Thần). Việc này đã hoàn toàn vô vọng, mọi nỗ lực đều là vô ích. TUYỆT ĐỐI DỪNG LẠI.`, score_penalty: -15 };
    }
    
    const hs = getHeavenlyStem(p), es = getEarthlyStem(p);
    const tc = getThapCanKhacUng(hs, es);
    // ✅ THAY dòng return null; cuối bằng đoạn sau:
    if (tc && tc.name === 'Thái Bạch Đồng Cung') {
       return { type: 'terrible', msg: `☠️ TỬ HUYỆT (DEAL-BREAKER): Canh + Canh tại dụng thần (${dtName}). Cục diện đẫm máu, chắc chắn xảy ra tai nạn, phá sản hoặc kiện cáo lớn. RÚT LUI NGAY.`, score_penalty: -15 };
    }

    // ✅ THÊM MỚI: Kiểm tra bản thân Không Vong + Nhập Mộ đồng thời
    const CRITICAL_TOPICS_DB = new Set([2, 3, 9, 11, 18, 21, 22]);
    if (CRITICAL_TOPICS_DB.has(Number(topicId))) {
      const pDayDB = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'day'));
      if (pDayDB && isVoid(chart, pDayDB) && hasRuMu(pDayDB)) {
        return {
          type: 'terrible',
          msg: `☠️ TỬ HUYỆT (DEAL-BREAKER): BẢN THÂN (Can Ngày) vừa KHÔNG VONG vừa NHẬP MỘ — Người hỏi hoàn toàn không có khả năng hành động trong giai đoạn này. Mọi kế hoạch đều vô vọng, hãy chờ đến thời điểm khác.`,
          score_penalty: -10
        };
      }
    }

    return null;
  }

  // ============================ CORE ANALYZER ============================
  function analyzePalaceFull(palace, roleName, chart) {
    if (!palace) return { html: UI.line(roleName, 'Ẩn phục / Không xác định được', 'neutral'), score: 0 };
    let html = '', score = 0;

    const monthChi = getBranchOf(chart, 'month');
    const monthHanh = MAP_CHI[monthChi];

    const hs = getHeavenlyStem(palace), es = getEarthlyStem(palace);
    const deity = getEffectiveDeityName(palace, chart);
    const star = palace.thienBan || '';
    const gate = palace.batMon || '';
    const pats = getPatternsOf(palace);

    let baseGateScore = getContextualGateScore(gate, currentTopicId);
    let deityScore = getDeityScore(deity);
    let baseStarScore = getContextualStarScore(star, currentTopicId);

    let finalGateScore = baseGateScore;
    let vtGateInfo = '';
    if (gate && monthHanh) {
      const gHanh = chart?.sys?.NGU_HANH_MON?.[normalizeGateName(gate)] || MAP_MON[normalizeGateName(gate)];
      const vtGate = getVangTuongState(gHanh, monthHanh);
      finalGateScore = Math.round(baseGateScore * vtGate.mult * 10) / 10;
      vtGateInfo = ` (Lệnh tháng: ${vtGate.state} - x${vtGate.mult})`;
    }

    let finalStarScore = baseStarScore;
    let vtStarInfo = '';
    if (star && monthHanh) {
      let sHanh = null;
      for (const [k,v] of Object.entries(MAP_SAO)) { if (star.includes(k)) { sHanh = v; break; } }
      if (sHanh) {
        const vtStar = getVangTuongState(sHanh, monthHanh);
        finalStarScore = Math.round(baseStarScore * vtStar.mult * 10) / 10;
        vtStarInfo = ` (Lệnh tháng: ${vtStar.state} - x${vtStar.mult})`;
      }
    }

    if (palace.monBucChe) {
      if (palace.monBucChe.type === 'bức' || palace.monBucChe.type === 'chế') {
        finalGateScore = finalGateScore > 0 ? Math.floor(finalGateScore / 2) : finalGateScore - 1;
        score -= 1;
      }
    }

    score += finalGateScore + deityScore + finalStarScore;
    html += UI.line(roleName, palaceSummary(palace, chart), finalGateScore >= 2 ? 'good' : (finalGateScore <= -2 ? 'bad' : 'info'));

    const anCanResult = analyzeAnCan(palace, currentTopicId, chart);
    if (anCanResult.html) { html += anCanResult.html; score += anCanResult.score; }

    // Nguyệt lệnh cho Thiên Can
    const stemHanhForVT = MAP_CAN[hs] || '';
    if (stemHanhForVT && monthHanh) {
      const vtStem = getVangTuongState(stemHanhForVT, monthHanh);
      html += UI.line(`  ↳ 📅 Lệnh tháng (Can ${hs})`, `${vtStem.state} (×${vtStem.mult})`, vtStem.mult >= 1.2 ? 'good' : (vtStem.mult <= 0.5 ? 'bad' : 'neutral'));
      score += (vtStem.mult >= 1.2 ? 1 : (vtStem.mult <= 0.5 ? -1 : 0));
    }

    // TÍCH HỢP B: NHẬT LỆNH CHO THIÊN CAN
    const rL = getRiLingEffect(palace, chart);
    if (rL.html) { html += rL.html; score += rL.score; }

    if (hs && es) {
      const relHsEs = getRelationBetweenStems(hs, es);
      let relType = 'neutral';
      if (relHsEs.rel === 'a_sinh_b' || relHsEs.rel === 'b_sinh_a') { relType = 'good'; score += 1; }
      else if (relHsEs.rel === 'a_khac_b' || relHsEs.rel === 'b_khac_a') { relType = 'bad'; score -= 1; }
      html += UI.line('  ↳ Thiên/Địa bàn', relHsEs.label, relType);

      const tc = getThapCanKhacUng(hs, es);
      if (tc) { html += UI.line(`  ↳ ☯️ Thập Can Khắc Ứng: ${tc.name}`, tc.desc, tc.type); score += (tc.type === 'good' ? 2 : -2); }
      html += analyzeTenDiaRelation(palace, chart, roleName);
    }

    // TÍCH HỢP 1: Tương tác Địa Chi Động (Tương thích cả Hà Đồ và Lạc Thư)
    const dayChiBan = getBranchOf(chart, 'day'); // Lấy chi Ngày
    const palaceChis = getChiOfPalace(palace.cung, chart); // Tự động lấy Chi của cung theo hệ thống
    if (palaceChis.length > 0 && dayChiBan) {
      const chiRel = analyzeChiRelation(palaceChis, dayChiBan);
      if (chiRel) {
        html += UI.line('  ↳ 🌐 Địa Chi tương tác', `${chiRel.label} (Ngày) — ${chiRel.desc}`, chiRel.type);
        score += chiRel.score;
      }
    }

    const stemHanh = MAP_CAN[hs] || '';
    if (stemHanh) {
      const pStemRel = getPalaceStemRelation(palace, stemHanh, chart);
      if (pStemRel) {
        html += UI.line(`  ↳ 🌍 Cung/Can tương tác`, pStemRel.label + ' — ' + pStemRel.advice, pStemRel.score >= 1 ? 'good' : (pStemRel.score < 0 ? 'bad' : 'neutral'));
        score += pStemRel.score;
      }
    }

    const gs = getGrowthStage(palace, hs, chart);
    if (gs) {
      const ws = getWangShuaiLabel(gs);
      html += UI.line('  ↳ Vượng/Suy', ws.label, ws.type);
      if (ws.type === 'good') score += 1; else if (ws.type === 'bad') score -= 1;
    }

    if (gate) {
      html += UI.line('  ↳ Bát Môn', `${gate}${vtGateInfo} (điểm: ${finalGateScore > 0 ? '+' : ''}${finalGateScore})`, finalGateScore >= 1.5 ? 'good' : (finalGateScore <= -1 ? 'bad' : 'neutral'));
      
      const monCungRel = analyzeMonCungRelation(palace, chart);
      if (monCungRel) {
        html += UI.line(`  ↳ ⛩️ Môn-Cung Tương Tác`, monCungRel.advice, monCungRel.score > 0 ? 'good' : (monCungRel.score < 0 ? 'bad' : 'neutral'));
        score += monCungRel.score;
      }

      if (palace.monBucChe && (palace.monBucChe.type === 'bức' || palace.monBucChe.type === 'chế')) {
        html += UI.line('  ↳ ⚠️ Môn Bức/Phá Cung', palace.monBucChe.desc + ' → Bị khắc chế, sức mạnh Bát Môn suy giảm nặng.', 'bad');
      }
    }
    if (deity) html += UI.line('  ↳ Bát Thần', `${deity} (điểm: ${deityScore >= 0 ? '+' : ''}${deityScore})`, deityScore >= 1 ? 'good' : (deityScore <= -1 ? 'bad' : 'neutral'));
    if (star) html += UI.line('  ↳ Cửu Tinh', `${star}${vtStarInfo} (điểm: ${finalStarScore > 0 ? '+' : ''}${finalStarScore})`, finalStarScore >= 1 ? 'good' : (finalStarScore <= -1 ? 'bad' : 'neutral'));

    const tmHop = checkTinhMonHop(palace, chart);
    if (tmHop && !isVoid(chart, palace) && !hasRuMu(palace)) {
      html += UI.line(`  ↳ 🔯 Tinh Môn Tổ Hợp: ${tmHop.name}`, tmHop.desc, tmHop.type);
      score += tmHop.type === 'good' ? 3 : -3;
    }

    // TÍCH HỢP 3: MÔN SAO TƯƠNG TRỢ
    const monSaoRel = checkMonSaoTuongTroPhu(palace, chart);
    if (monSaoRel && !isVoid(chart, palace) && !hasRuMu(palace)) {
      html += UI.line('  ↳ 🌀 Sao-Môn tương tác', monSaoRel.label + ' — ' + monSaoRel.msg, monSaoRel.type);
      score += monSaoRel.score;
    }

    const tk = getTamKyLabel(palace);
    if (tk && !isVoid(chart, palace) && !hasRuMu(palace)) {
      html += UI.line(`  ↳ ✨ Tam Kỳ: ${tk.name}`, tk.desc, 'good');
    }

    if (isVoid(chart, palace)) {
      html += UI.line('  ↳ ⭕ Không Vong', 'Ảo, trống rỗng, không thực chất', 'bad');
      score -= 2;
      const opCung = chart?.sys?.CUNG_XUNG?.[palace.cung] || OPPOSITE_PALACE[palace.cung];
      if (opCung) {
        const opPalace = getPalace(chart, opCung);
        if (opPalace) {
           const opG = opPalace.batMon || 'Không Môn';
           const opS = opPalace.thienBan || 'Không Sao';
           html += UI.note(`🔍 <strong>Chuyên gia (Đối Xung):</strong> Cung này bị Không Vong, bản chất sự việc thực sự đang nằm ở cung Đối Xung (${palaceName(opCung, chart)} - Hướng ${palaceDirection(opCung, chart)}). Tại đó có <strong>${opG}</strong> và <strong>${opS}</strong>.`, 'info');
        }
      }
    }

    if (hasRuMu(palace)) { html += UI.line('  ↳ 🪦 Nhập Mộ', 'Bị phong bế, chôn vùi, tắc nghẽn', 'bad'); score -= 2; }
    if (isHorse(chart, palace)) { html += UI.line('  ↳ 🐎 Dịch Mã', 'Di chuyển, thay đổi, bôn ba', 'info'); }

    if (pats.good.length) { html += UI.line('  ↳ Cát cách', pats.good.join(', '), 'good'); score += pats.good.length; }
    if (pats.bad.length) { html += UI.line('  ↳ Hung cách', pats.bad.join(', '), 'bad'); score -= pats.bad.length; }

    return { html, score };
  }

  // ============================ ỨNG KỲ ============================
  function tinhUngKy(palace, chart, prefix = 'Dự đoán ứng kỳ') {
    if (!palace) return '';
    let msgs = [];
    if (isVoid(chart, palace)) msgs.push('vào thời điểm XUNG KHÔNG (khi thời gian đối xung cung này) hoặc ĐIỀN THỰC (khi thời gian đến ngay tại cung này)');
    if (hasRuMu(palace)) msgs.push('vào thời điểm XUNG MỘ (phá vỡ vỏ bọc, sự việc bung ra)');
    if (isHorse(chart, palace)) msgs.push('ứng rất nhanh vào ngày/tháng Mã động');

    let htmlStr = '';
    if (msgs.length > 0) { htmlStr += UI.note(`⏰ ${prefix}: Sự việc dễ xảy ra ${msgs.join(' kết hợp ')}.`, 'info'); } 
    else {
      if (hasGlobalPattern(chart, 'phản ngâm')) htmlStr += UI.note(`⏰ ${prefix}: Ứng kỳ RẤT NHANH (tính bằng ngày hoặc tuần) do toàn cục Phản Ngâm.`, 'info');
      else if (hasGlobalPattern(chart, 'phục ngâm')) htmlStr += UI.note(`⏰ ${prefix}: Ứng kỳ RẤT CHẬM (tính bằng tháng hoặc năm) do toàn cục Phục Ngâm. Sự việc sẽ đình trệ lâu dài.`, 'info');
    }
    
    const hanh = getCungMeta(palace.cung, chart).hanh;
    const MAP_HANH_THANG = {
      'Mộc': { thang: 'tháng 1-2 (Dần, Mão)', note: 'Mộc vượng vào mùa Xuân.' },
      'Hỏa': { thang: 'tháng 4-5 (Tị, Ngọ)', note: 'Hỏa vượng vào mùa Hạ.' },
      'Thổ': { thang: 'tháng 3, 6, 9, 12 (cuối các quý)', note: 'Thổ vượng vào cuối mỗi mùa.' },
      'Kim': { thang: 'tháng 7-8 (Thân, Dậu)', note: 'Kim vượng vào mùa Thu.' },
      'Thủy': { thang: 'tháng 10-11 (Hợi, Tý)', note: 'Thủy vượng vào mùa Đông.' }
    };
    if (hanh && MAP_HANH_THANG[hanh]) {
      const info = MAP_HANH_THANG[hanh];
      const hs = getHeavenlyStem(palace);
      const gs = getGrowthStage(palace, hs, chart);
      const ws = gs ? getWangShuaiLabel(gs) : null;
      let timingNote = `📅 Ngũ Hành Cung [${hanh}]: Sự việc dễ ứng nghiệm vào ${info.thang} — ${info.note}`;
      if (ws) {
        if (ws.type === 'good') timingNote += ` Hiện tại dụng thần đang ở giai đoạn <strong>${ws.label}</strong> — sự việc có thể xảy ra sớm hơn dự kiến.`;
        else if (ws.type === 'bad') timingNote += ` Hiện tại dụng thần đang ở giai đoạn <strong>${ws.label}</strong> — sự việc có thể bị trì hoãn đến khi gặp tháng/mùa tương sinh.`;
      }
      if (isHorse(chart, palace)) timingNote += ` 🐎 Dịch Mã: Đặc biệt ứng nhanh vào các tháng <strong>Dần, Thân, Tị, Hợi</strong>.`;
      htmlStr += UI.note(timingNote, 'info');
    }

    return htmlStr ? UI.section('⏳ Thời Điểm Ứng Nghiệm (Ứng Kỳ)') + htmlStr : '';
  }

  // ============================ SCORING WEIGHT ============================
  const VOID_WEIGHT = { default: -2, dungThan: -4, benhNhe: +2, coHoi: -3, phapLy: -4 };
  function getVoidScore(palace, chart, context) {
    if (!isVoid(chart, palace)) return 0;
    return VOID_WEIGHT[context] || VOID_WEIGHT.default;
  }

  // ============================ CỜ ĐỎ TUYỆT ĐỐI HUNG ============================
  function checkRedFlags(chart, topicId) {
    const flags = [];
    const tid = Number(topicId);

    if ([2,3,5,6,7,8,9,10,11,12,13].includes(tid)) {
      const pKhai = findPalaceByGate(chart, 'Khai'), pSinh = findPalaceByGate(chart, 'Sinh');
      if (pKhai && pSinh && isVoid(chart, pKhai) && isVoid(chart, pSinh)) {
        flags.push({ msg: '🚨 CẢ KHAI MÔN VÀ SINH MÔN ĐỀU KHÔNG VONG: Sự nghiệp và tài lộc đều rỗng tuếch trong giai đoạn này. Không nên khởi sự hay đầu tư bất kỳ việc lớn nào.', type: 'bad' });
      }
    }

    if (getAllPalaces(chart).some(p => hasPattern(p, 'lục nghi kích hình') || hasPattern(p, 'kích hình'))) {
      if ([22, 23].includes(tid)) flags.push({ msg: '🚨 LỤC NGHI KÍCH HÌNH: Trong bối cảnh kiện tụng/hình sự — tội danh nặng hoặc phán quyết bất lợi nghiêm trọng.', type: 'bad' });
      else if (tid !== 16 && tid !== 26) flags.push({ msg: '🚨 LỤC NGHI KÍCH HÌNH xuất hiện: Môi trường đang có xung đột và áp lực tiềm ẩn. Tránh các hành động gây tranh chấp.', type: 'bad' });
    }

    if (tid !== 16 && tid !== 26) {
      for (const p of getAllPalaces(chart)) {
        const tc = getThapCanKhacUng(getHeavenlyStem(p), getEarthlyStem(p));
        if (tc && tc.name === 'Thái Bạch Đồng Cung') flags.push({ msg: `🚨 THÁI BẠCH ĐỒNG CUNG (Canh+Canh) tại Cung ${palaceName(p.cung, chart)}: Đại hung — nội bộ mâu thuẫn cực độ, quan tai, kỵ mọi hành động quan trọng.`, type: 'bad' });
        if (tc && tc.name === 'Thiên La Võng Trương') flags.push({ msg: `🚨 THIÊN LA VÕNG TRƯƠNG (Nhâm+Nhâm) tại Cung ${palaceName(p.cung, chart)}: Đại hung — bế tắc không lối thoát, nguy cơ vướng pháp lý nặng nề.`, type: 'bad' });
        if (tc && tc.name === 'Thiên Võng Tứ Trương') flags.push({ msg: `🚨 THIÊN VÕNG TỨ TRƯƠNG (Quý+Quý) tại Cung ${palaceName(p.cung, chart)}: Đại hung — cùng đường bí lối, bệnh tật hoặc mưu sự đều hư hỏng.`, type: 'bad' });
      }
    }

    if (![16, 19, 20, 26].includes(tid)) {
      const pDay = findPalaceByHeavenlyStem(chart, getStemOf(chart, 'day'));
      if (pDay && hasRuMu(pDay) && hasGlobalPattern(chart, 'phục ngâm')) flags.push({ msg: '🚨 BẢN THÂN NHẬP MỘ + TOÀN CỤC PHỤC NGÂM: Kép hung — người hỏi bị phong tỏa trong môi trường đình trệ. Mọi mưu sự đều cực kỳ khó khăn.', type: 'bad' });
      
      for (const gateName of ['Khai', 'Sinh', 'Hưu']) {
        const result = checkTamKyAtGate(chart, gateName, tid);
        if (result && !isVoid(chart, result.palace) && !hasRuMu(result.palace)) {
          flags.push({ msg: `✨ TAM KỲ ĐẮC SỬ: <strong>${result.tamKy.name}</strong> tại ${gateName} Môn — ${result.tamKy.desc} Đây là cát tượng đặc biệt hiếm gặp, mưu sự đại thuận lợi.`, type: 'good' });
        }
      }
    }
    return flags;
  }

  // ============================ PHÂN TÍCH 26 CHỦ ĐỀ ============================
  const TOPIC_ANALYZERS = {};
  // TÍCH HỢP: Hàm kiểm tra Tam Phú Cách cho Chủ đề 9
  function checkTamPhuCach(pKhai, pSinh, pMau, chart) {
    if (!pKhai || !pSinh || !pMau) return null;
    const hKhai = chart?.sys?.NGU_HANH_MON?.['Khai'] || MAP_MON['Khai'] || 'Kim'; // Khai môn = Kim
    const hSinh = chart?.sys?.NGU_HANH_MON?.['Sinh'] || MAP_MON['Sinh'] || 'Thổ'; // Sinh môn = Thổ
    const hMau = MAP_CAN['Mậu'] || 'Thổ';
    
    const palHanh = palaceElement(pKhai.cung, chart);
    const palSinhHanh = palaceElement(pSinh.cung, chart);
    
    // Kiểm tra Khai Môn sinh Sinh Môn (hoặc thông qua Cung)
    const kaiBirth = sheng(hKhai, hSinh) || sheng(palHanh, palSinhHanh);
    // Kiểm tra Sinh Môn sinh Mậu
    const sinhBirth = sheng(palSinhHanh, hMau) || sheng(hSinh, hMau);
    
    if (kaiBirth && sinhBirth) {
      return {
        type: 'good',
        name: 'Tam Phú Cách (Khai → Sinh → Mậu)',
        msg: '🏆 TAM PHÚ CÁCH: Khai Môn sinh Sinh Môn → Sinh Môn sinh Vốn — Chuỗi năng lượng KINH DOANH PHÁT TÀI hoàn hảo. Đây là quẻ ĐẠI CÁT cho khởi nghiệp.',
        score: 5
      };
    }
    return null;
  }
  // ===== CHỦ ĐỀ 1: CƠ THỂ / BỆNH LÝ =====
  TOPIC_ANALYZERS[1] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pNhue = findPalaceByStarName(chart, 'Thiên Nhuế');

    html += UI.section('🧑 Bản Thân (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score * 0.5;

    html += UI.section('🩺 Bộ Phận Cơ Thể Liên Quan');
    const MAP_BODY = {
      'Giáp':'Đầu, gan, túi mật','Ất':'Gan, túi mật, thực quản, cổ họng, hệ thần kinh',
      'Bính':'Ruột non, môi, vai, trán','Đinh':'Răng, tim, mắt, trào ngược, bốc hỏa',
      'Mậu':'Cơ bụng, bao tử, mũi','Kỷ':'Mắt, tỳ tạng, miệng, bụng',
      'Canh':'Xương, sườn, ruột già','Tân':'Phổi, phế quản, ngực, cổ, bụng',
      'Nhâm':'Tim mạch, bàng quang, máu, hệ thực vật','Quý':'Thần kinh, chân, thận'
    };
    const allStems = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
    let bodyFindings = [];
    for (const stem of allStems) {
      const p = findPalaceByHeavenlyStem(chart, stem);
      if (!p) continue;
      const isProblematic = isVoid(chart, p) || hasRuMu(p) ||
        (pNhue && pNhue.cung === p.cung) ||
        getRelationBetweenStems(dayHS, stem).rel === 'a_khac_b';
      if (isProblematic && MAP_BODY[stem]) bodyFindings.push({ stem, body: MAP_BODY[stem], palace: p });
    }
    if (bodyFindings.length) {
      for (const f of bodyFindings) {
        const reasons = [];
        if (isVoid(chart, f.palace)) reasons.push('Không Vong');
        if (hasRuMu(f.palace)) reasons.push('Nhập Mộ');
        if (pNhue && pNhue.cung === f.palace.cung) reasons.push('Thiên Nhuế đóng cùng');
        if (getRelationBetweenStems(dayHS, f.stem).rel === 'a_khac_b') reasons.push('Bị Can Ngày áp chế');
        html += UI.line(`⚠️ ${f.stem} → ${f.body}`, `[${reasons.join(', ')}]`, 'bad');
        score -= reasons.length;
      }
    } else {
      html += UI.note('Không phát hiện can nào có dấu hiệu bệnh lý rõ ràng. Cơ thể tương đối ổn định.', 'good');
      score += 1;
    }

    html += UI.section('🌡️ Thiên Nhuế (Sao Bệnh Tật)');
    if (pNhue) {
      const rNhue = analyzePalaceFull(pNhue, 'Thiên Nhuế', chart);
      html += rNhue.html;
      if (pDay) {
        html += UI.section('⚔️ Tương Quan Bệnh ↔ Bản Thân');
        const rel = getRelationBetweenPalaces(pNhue, pDay, chart);
        html += UI.line('Quan hệ ngũ hành', rel.label, rel.rel.includes('khac') ? 'bad' : 'good');
        if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Bệnh khắc Bản thân: Bệnh đang tấn công mạnh, sức đề kháng suy yếu. Tình trạng diễn biến xấu, cần can thiệp y tế gấp.', 'bad'); score -= 3; }
        else if (rel.rel === 'b_khac_a') { html += UI.note('🟢 Bản thân khắc Bệnh: Cơ thể đang kiểm soát được bệnh, đang trên đà hồi phục.', 'good'); score += 3; }
        else if (rel.rel === 'a_sinh_b' || rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bệnh và Bản thân tương sinh: Bệnh ăn sâu, mãn tính, dai dẳng, khó dứt điểm.', 'bad'); score -= 1; }
        else if (rel.rel === 'dong_hanh') { html += UI.note('🟡 Tỷ hòa: Bệnh kéo dài nhưng không quá trầm trọng, trạng thái giằng co.', 'neutral'); score -= 1; }
      }
      if (isVoid(chart, pNhue)) { html += UI.note('⭕ Thiên Nhuế Không Vong: Bệnh chưa thực sự nghiêm trọng, có thể chỉ là lo lắng ảo, hoặc bệnh mới chớm dễ chữa.', 'good'); score += VOID_WEIGHT.benhNhe; }
      if (hasRuMu(pNhue)) { html += UI.note('🪦 Thiên Nhuế Nhập Mộ: Bệnh âm ỉ kéo dài, khó phát hiện rõ nguồn gốc — cần xét nghiệm toàn diện.', 'bad'); score -= 1; }
    } else {
      html += UI.note('Thiên Nhuế ẩn phục: Bệnh chưa bùng phát rõ ràng hoặc đang trong giai đoạn tiền bệnh.', 'neutral');
    }

    html += UI.section('🔎 Bộ Phận Nghi Vấn Chính (Can Ngày & Giờ)');
    if (MAP_BODY[dayHS]) html += UI.line(`Can Ngày [${dayHS}]`, MAP_BODY[dayHS], 'info');
    if (MAP_BODY[hourHS]) html += UI.line(`Can Giờ [${hourHS}]`, MAP_BODY[hourHS], 'info');

    html += UI.section('🔬 Chỉ Dấu Bệnh Lý Đặc Thù');
    const pBinh = findPalaceByHeavenlyStem(chart, 'Bính');
    const pMauKy = findPalaceByHeavenlyStem(chart, 'Mậu') || findPalaceByHeavenlyStem(chart, 'Kỷ');
    const pDinh = findPalaceByHeavenlyStem(chart, 'Đinh');
    const pNhamQuy = findPalaceByHeavenlyStem(chart, 'Nhâm') || findPalaceByHeavenlyStem(chart, 'Quý');
    const pKhai = findPalaceByGate(chart, 'Khai');
    if (pBinh && pBinh.cung === pDay?.cung) { html += UI.note('Bính đồng cung Can Ngày: Có dấu hiệu viêm nhiễm, sốt cao.', 'bad'); score -= 1; }
    if (pMauKy && (hasRuMu(pMauKy) || isVoid(chart, pMauKy))) { html += UI.note('Mậu/Kỷ bất thường: Nghi ngờ u bướu, nang, hoặc vết sẹo tiềm ẩn.', 'bad'); score -= 1; }
    if (pDinh && pKhai && pDinh.cung === pDay?.cung) { html += UI.note('Đinh + Khai Môn đồng cung với Can Ngày: Dấu hiệu đã hoặc sắp phẫu thuật.', 'bad'); score -= 1; }
    if (pNhamQuy && getEffectiveDeityName(pNhamQuy, chart).includes('Bạch Hổ')) { html += UI.note('Nhâm/Quý gặp Bạch Hổ: Nghi ngờ vấn đề máu huyết, huyết áp, hoặc chấn thương.', 'bad'); score -= 1; }

    html += UI.section('💊 Phương Án Điều Trị');
    const pTam = findPalaceByStarName(chart, 'Thiên Tâm');
    const pAt = findPalaceByHeavenlyStem(chart, 'Ất');
    if (pTam) {
      const rTam = analyzePalaceFull(pTam, 'Thiên Tâm (Tây Y)', chart);
      html += rTam.html;
      if (pNhue && pTam) {
        const relTreat = getRelationBetweenPalaces(pTam, pNhue, chart);
        if (relTreat.rel === 'a_khac_b') { html += UI.note('🟢 Tây y khắc bệnh: Gặp đúng thầy đúng thuốc, điều trị sẽ hiệu quả.', 'good'); score += 2; }
        else { html += UI.note('🟡 Tây y chưa khắc được bệnh: Cân nhắc đổi phương pháp hoặc kết hợp Đông y.', 'neutral'); score -= 1; }
      }
    }
    if (pAt) {
      html += UI.line('Ất (Đông Y)', palaceSummary(pAt, chart), isVoid(chart, pAt) ? 'bad' : 'good');
      if (isVoid(chart, pAt)) { html += UI.note('Đông y Không Vong: Thuốc nam, châm cứu hiệu quả kém trong giai đoạn này.', 'bad'); }
    }
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pTu = findPalaceByGate(chart, 'Tử');
    if (pDay && pSinh && pDay.cung === pSinh.cung) { html += UI.note('🟢 Bản thân đồng cung Sinh Môn: Hồi phục nhanh, sinh lực mạnh.', 'good'); score += 2; }
    if (pDay && pTu && pDay.cung === pTu.cung) { html += UI.note('🔴 Bản thân đồng cung Tử Môn: Bệnh nặng, hồi phục chậm và khó khăn.', 'bad'); score -= 3; }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 2: NGHỀ NGHIỆP =====
  TOPIC_ANALYZERS[2] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day'), monthHS = getStemOf(chart, 'month'), yearHS = getStemOf(chart, 'year'), hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS), pYear = findPalaceByHeavenlyStem(chart, yearHS);
    const pMonth = findPalaceByHeavenlyStem(chart, monthHS), pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pKhai = findPalaceByGate(chart, 'Khai'), pSinh = findPalaceByGate(chart, 'Sinh'), pDo = findPalaceByGate(chart, 'Đỗ');
    const pZF = getZhifuPalace(chart);
    let pThaiTue = chart?.thaiTue?.cung ? getPalace(chart, chart.thaiTue.cung) : null;

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pKhai, chart, 'Khai Môn');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🧑 Bản Thân (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;

    html += UI.section('💼 Sự Nghiệp (Khai Môn)');
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn', chart);
    html += rKhai.html; score += rKhai.score;

    const tkKhai = checkTamKyAtGate(chart, 'Khai', 2);
    if (tkKhai && !isVoid(chart, tkKhai.palace)) {
      html += UI.note(`✨ TAM KỲ tại Khai Môn — ${tkKhai.tamKy.name}: ${tkKhai.tamKy.desc} Sự nghiệp có quý nhân đặc biệt phù trợ.`, 'good'); score += 2;
    }

    if (pKhai && pDay) {
      const rel = getRelationBetweenPalaces(pKhai, pDay, chart);
      html += UI.line('Khai Môn ↔ Bản thân', rel.label, rel.rel.includes('sinh') ? 'good' : rel.rel.includes('khac') ? 'bad' : 'neutral');
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Sự nghiệp sinh trợ bản thân: Công việc phù hợp năng lực, dễ thăng tiến.', 'good'); }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bản thân sinh cho công việc: Phải bỏ công sức nhiều nhưng có kết quả.', 'neutral'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Công việc áp chế bản thân: Stress cao, môi trường độc hại, khó phát triển.', 'bad'); }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Bản thân khắc công việc: Kiểm soát được công việc nhưng hao tổn sức lực.', 'neutral'); }
    }

    if (yearHS && getThienCanHop(dayHS, yearHS)) {
      html += UI.note(`💫 ${getThienCanHopNote(dayHS, yearHS)} → Người hỏi và cấp quản lý có duyên hợp — quan hệ công việc dễ dàng.`, 'good'); score += 1;
    }

    if (pKhai && isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Không Vong: Công việc đình trệ, nguy cơ mất việc hoặc cơ hội bị hủy bỏ.', 'bad'); score += getVoidScore(pKhai, chart, 'coHoi'); }
    if (pKhai && hasRuMu(pKhai)) { html += UI.note('🪦 Khai Môn Nhập Mộ: Sự nghiệp bị phong bế, dễ mắc sai phạm hoặc bị điều tra.', 'bad'); score -= 2; }
    if (pKhai && hasPattern(pKhai, 'phản ngâm')) { html += UI.note('🔄 Khai Môn Phản Ngâm: Sắp có biến động lớn về nghề nghiệp — thay đổi, chuyển hướng.', 'info'); score -= 1; }
    if (pKhai && hasPattern(pKhai, 'phục ngâm')) { html += UI.note('⏸️ Khai Môn Phục Ngâm: Sự nghiệp giậm chân tại chỗ, không tiến không lùi.', 'info'); score -= 1; }

    html += UI.section('💰 Tài Lộc & Lương Thưởng (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
    html += rSinh.html; score += rSinh.score * 0.5;

    const tkSinh = checkTamKyAtGate(chart, 'Sinh', 2);
    if (tkSinh && !isVoid(chart, tkSinh.palace)) {
      html += UI.note(`✨ TAM KỲ tại Sinh Môn — ${tkSinh.tamKy.name}: Tài lộc có quý nhân hỗ trợ, thu nhập đột biến khả quan.`, 'good'); score += 2;
    }

    if (pSinh && pDay) {
      const rel2 = getRelationBetweenPalaces(pSinh, pDay, chart);
      if (rel2.rel === 'a_sinh_b') { html += UI.note('🟢 Tài lộc sinh bản thân: Thu nhập tốt, lương thưởng xứng đáng.', 'good'); score += 2; }
      else if (rel2.rel === 'b_khac_a') { html += UI.note('🟡 Bản thân tốn tiền cho công việc: Chi phí cao, bỏ vốn nhiều hơn thu về.', 'neutral'); score -= 1; }
    }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Lương thưởng thực tế thấp hơn kỳ vọng, tiền bạc hư ảo.', 'bad'); score -= 2; }

    html += UI.section('👥 Nhân Viên Cấp Dưới (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Can Giờ [${hourHS}]`, chart);
    html += rHour.html;
    if (pHour && pDay) {
      const rel3 = getRelationBetweenStems(hourHS, dayHS);
      if (rel3.rel === 'a_sinh_b') { html += UI.note('🟢 Cấp dưới hỗ trợ sếp tốt: Nhóm làm việc hiệu quả, trợ lực mạnh.', 'good'); score += 1; }
      else if (rel3.rel === 'a_khac_b') { html += UI.note('🔴 Cấp dưới chống đối hoặc phá hoại: Cần cẩn thận với người phụ thuộc mình.', 'bad'); score -= 2; }
      if (getThienCanHop(dayHS, hourHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, hourHS)} → Sếp và cấp dưới có duyên hợp — team làm việc gắn kết, hiệu quả cao.`, 'good'); score += 1;
      }
    }

    html += UI.section('🤝 Đồng Nghiệp (Can Tháng)');
    const rMonth = analyzePalaceFull(pMonth, `Can Tháng [${monthHS}]`, chart);
    html += rMonth.html;
    if (monthHS && getThienCanHop(dayHS, monthHS)) {
      html += UI.note(`💫 ${getThienCanHopNote(dayHS, monthHS)} → Có đồng nghiệp đặc biệt hợp — người này sẽ là đồng minh quan trọng.`, 'good'); score += 1;
    }

    html += UI.section('👔 Cấp Trên (Trực Phù / Thái Tuế)');
    if (pZF) {
      const rZF = analyzePalaceFull(pZF, 'Trực Phù (Sếp Trực Tiếp)', chart);
      html += rZF.html;
      if (pDay) {
        const relBoss = getRelationBetweenPalaces(pZF, pDay, chart);
        if (relBoss.rel === 'a_sinh_b') { html += UI.note('🟢 Sếp sinh người: Được nâng đỡ, tạo điều kiện, cơ hội thăng tiến cao.', 'good'); score += 3; }
        else if (relBoss.rel === 'a_khac_b') { html += UI.note('🔴 Sếp khắc người: Bị chèn ép, gây khó dễ, quan hệ căng thẳng.', 'bad'); score -= 3; }
        else if (relBoss.rel === 'b_khac_a') { html += UI.note('🟡 Người khắc sếp: Dễ bất đồng ý kiến, thể hiện cá tính mạnh — cẩn thận xung đột.', 'neutral'); score -= 1; }
        else { html += UI.note('Quan hệ với sếp: Tương đối hòa hợp, không có xung đột lớn.', 'good'); score += 1; }
        const zfHS = getHeavenlyStem(pZF);
        if (zfHS && getThienCanHop(dayHS, zfHS)) {
          html += UI.note(`💫 ${getThienCanHopNote(dayHS, zfHS)} → Bạn và sếp có duyên hợp đặc biệt — mối quan hệ bền chặt tự nhiên.`, 'good'); score += 1;
        }
      }
    }
    if (pThaiTue) {
      const rTT = analyzePalaceFull(pThaiTue, 'Thái Tuế (Sếp Siêu Lớn)', chart);
      html += rTT.html;
      if (pDay) {
        const relTT = getRelationBetweenPalaces(pThaiTue, pDay, chart);
        if (relTT.rel === 'a_khac_b') { html += UI.note('🔴 Thái Tuế khắc bản thân: Không hợp ban lãnh đạo cấp cao, khó được đề bạt.', 'bad'); score -= 2; }
        else if (relTT.rel === 'a_sinh_b') { html += UI.note('🟢 Thái Tuế sinh bản thân: Được lãnh đạo cao tầng quan tâm, cơ hội lớn.', 'good'); score += 2; }
      }
    }

    html += UI.section('🌐 Môi Trường Làm Việc (Cửu Tinh)');
    const pPhu = findPalaceByStarName(chart, 'Thiên Phụ'), pBong = findPalaceByStarName(chart, 'Thiên Bồng');
    const pNham = findPalaceByStarName(chart, 'Thiên Nhậm'), pTam = findPalaceByStarName(chart, 'Thiên Tâm');
    const pXung = findPalaceByStarName(chart, 'Thiên Xung');
    if (pPhu) { html += UI.note(`🟢 Thiên Phụ ở Cung ${palaceName(pPhu.cung, chart)} (${palaceDirection(pPhu.cung, chart)}): Môi trường làm việc hỗ trợ, ổn định, có người đỡ đầu.`, 'good'); score += 1; }
    if (pNham) { html += UI.note('🟢 Thiên Nhậm: Được hỗ trợ từ cả cấp trên lẫn cấp dưới — vị trí trung gian thuận lợi.', 'good'); score += 1; }
    if (pTam) { html += UI.note('🟢 Thiên Tâm: Sếp có năng lực, quyết đoán — môi trường chuyên nghiệp.', 'good'); score += 1; }
    if (pXung && pDay && pXung.cung === pDay.cung) { html += UI.note('🔴 Thiên Xung đồng cung bản thân: Áp lực công việc rất lớn, liên tục bị thúc ép.', 'bad'); score -= 2; }
    if (pBong && pDay && pBong.cung === pDay.cung) { html += UI.note('🔴 Thiên Bồng đồng cung bản thân: Bị sếp hoặc đồng nghiệp chèn ép, môi trường độc hại.', 'bad'); score -= 2; }

    html += UI.section('🔮 Triển Vọng (Đỗ Môn)');
    const rDo = analyzePalaceFull(pDo, 'Đỗ Môn (Dự án/Công việc tới)', chart);
    html += rDo.html;
    if (pDo && isVoid(chart, pDo)) { html += UI.note('⭕ Đỗ Môn Không Vong: Dự án/kế hoạch sắp tới chưa chắc chắn, dễ bị hủy.', 'bad'); score -= 1; }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 3: THĂNG CHỨC =====
  TOPIC_ANALYZERS[3] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day'), yearHS = getStemOf(chart, 'year');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS), pYear = findPalaceByHeavenlyStem(chart, yearHS);
    const pKhai = findPalaceByGate(chart, 'Khai'), pDo = findPalaceByGate(chart, 'Đỗ');
    const pZF = getZhifuPalace(chart);
    let pThaiTue = chart?.thaiTue?.cung ? getPalace(chart, chart.thaiTue.cung) : null;

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pKhai, chart, 'Khai Môn');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🧑 Bản Thân & Thực Lực');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    if (pDay && isVoid(chart, pDay)) { html += UI.note('⭕ Bản thân Không Vong: Thực lực đang rỗng tuếch, chưa đủ điều kiện được cất nhắc.', 'bad'); score -= 2; }

    html += UI.section('📋 Quyết Định Thăng Chức (Khai Môn)');
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn', chart);
    html += rKhai.html; score += rKhai.score;

    const tkKhai3 = checkTamKyAtGate(chart, 'Khai', 3);
    if (tkKhai3 && !isVoid(chart, tkKhai3.palace)) {
      html += UI.note(`✨ TAM KỲ tại Khai Môn — ${tkKhai3.tamKy.name}: ${tkKhai3.tamKy.desc} Cực kỳ cát cho thăng chức — có quý nhân trong ban lãnh đạo phù hộ.`, 'good'); score += 3;
    }

    if (pKhai && pDay) {
      const rel = getRelationBetweenPalaces(pKhai, pDay, chart);
      html += UI.line('Khai Môn ↔ Bản thân', rel.label, rel.rel.includes('sinh') ? 'good' : rel.rel.includes('khac') ? 'bad' : 'neutral');
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Khai Môn sinh bản thân: Quyết định chính thức ủng hộ — khả năng thăng chức CỰC CAO.', 'good'); }
      else if (rel.rel === 'dong_hanh') { html += UI.note('🟢 Tỷ hòa: Quyết định thuận chiều bản thân — thăng chức khả thi cao.', 'good'); }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bản thân sinh cho quyết định: Cần phải tự chứng minh thêm, chưa có kết luận.', 'neutral'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Khai Môn khắc bản thân: Quyết định đi ngược lại mong muốn — thăng chức thất bại hoặc vị trí mới nhiều thử thách.', 'bad'); }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Bản thân khắc Khai Môn: Bản thân muốn nhưng tổ chức chưa sẵn sàng — cần vận động thêm.', 'neutral'); }
    }
    if (pKhai && isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Không Vong: Chưa có quyết định thực sự, hồ sơ đang bị treo hoặc bị bỏ qua.', 'bad'); score += getVoidScore(pKhai, chart, 'coHoi'); }
    if (pKhai && hasRuMu(pKhai)) { html += UI.note('🪦 Khai Môn Nhập Mộ: Hội đồng xét duyệt bị phong tỏa, phiên xem xét bị hoãn vô thời hạn.', 'bad'); score -= 2; }

    html += UI.section('🙋 Người Push Hồ Sơ (Đỗ Môn)');
    const rDo = analyzePalaceFull(pDo, 'Đỗ Môn', chart);
    html += rDo.html;
    if (pDo && pDay) {
      const relDo = getRelationBetweenPalaces(pDo, pDay, chart);
      if (relDo.rel === 'a_sinh_b') { html += UI.note('🟢 Người đề bạt đang tích cực vận động cho bạn.', 'good'); score += 2; }
      else if (relDo.rel === 'a_khac_b') { html += UI.note('🔴 Người đang push hồ sơ thực ra bất lợi cho bạn — cẩn thận bị đâm sau lưng.', 'bad'); score -= 2; }
    }
    if (pDo && isVoid(chart, pDo)) { html += UI.note('⭕ Đỗ Môn Không Vong: Người đề bạt đang yếu thế hoặc không có thực quyền.', 'bad'); score -= 1; }

    html += UI.section('🏛️ Thế Lực Quyết Định (Trực Phù + Thái Tuế)');
    let supportScore = 0;
    if (pZF) {
      const rZF = analyzePalaceFull(pZF, 'Trực Phù (Sếp Trực Tiếp)', chart);
      html += rZF.html;
      if (pDay) {
        const rZFDay = getRelationBetweenPalaces(pZF, pDay, chart);
        if (rZFDay.rel === 'a_sinh_b') { html += UI.note('🟢 Sếp trực tiếp ủng hộ: Yếu tố quyết định quan trọng nhất đang thuận lợi.', 'good'); supportScore += 2; }
        else if (rZFDay.rel === 'a_khac_b') { html += UI.note('🔴 Sếp trực tiếp cản trở: Người có quyền quyết định đang không ủng hộ.', 'bad'); supportScore -= 2; }
        const zfHS3 = getHeavenlyStem(pZF);
        if (zfHS3 && getThienCanHop(dayHS, zfHS3)) {
          html += UI.note(`💫 ${getThienCanHopNote(dayHS, zfHS3)} → Bạn và sếp có duyên hợp — việc thăng chức được ủng hộ tự nhiên từ phía sếp.`, 'good'); supportScore += 1;
        }
      }
    }
    if (pThaiTue) {
      const rTT = analyzePalaceFull(pThaiTue, 'Thái Tuế (Lãnh Đạo Cao Cấp)', chart);
      html += rTT.html;
      if (pDay) {
        const rTTDay = getRelationBetweenPalaces(pThaiTue, pDay, chart);
        if (rTTDay.rel === 'a_sinh_b') { html += UI.note('🟢 Lãnh đạo cao cấp bảo trợ: Cơ hội thăng chức gần như chắc chắn.', 'good'); supportScore += 3; }
        else if (rTTDay.rel === 'a_khac_b') { html += UI.note('🔴 Lãnh đạo cao cấp phủ quyết: Dù sếp trực tiếp ủng hộ cũng khó thành.', 'bad'); supportScore -= 3; }
      }
    }
    if (pYear) {
      const rYear = analyzePalaceFull(pYear, `Can Năm [${yearHS}] (Quản lý)`, chart);
      html += rYear.html;
    }
    score += supportScore;

    html += UI.section('⏰ Thời Điểm & Kết Luận');
    if (isHorse(chart, pKhai)) { html += UI.note('🐎 Khai Môn có Dịch Mã: Quyết định đến nhanh và bất ngờ — cơ hội có thể xuất hiện đột xuất.', 'info'); score += 1; }
    if (pKhai && hasPattern(pKhai, 'phản ngâm')) { html += UI.note('🔄 Phản Ngâm: Có thể thăng chức rồi lại bị điều chuyển, vị trí mới không ổn định.', 'info'); score -= 1; }
    html += tinhUngKy(pKhai, chart, 'Thời điểm thăng chức');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 4: TÌM KIẾM NGƯỜI DẪN ĐƯỜNG =====
  TOPIC_ANALYZERS[4] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const pPhu = findPalaceByStarName(chart, 'Thiên Phụ');

    html += UI.section('🧭 Xác Định Thiên Phụ Tinh (Người Dẫn Đường)');
    if (!pPhu) {
      html += UI.note('🔴 Thiên Phụ ẩn phục: Hiện tại chưa tìm được người dẫn đường phù hợp. Không nên vội vàng.', 'bad');
      return { html, score: -2 };
    }

    const rPhu = analyzePalaceFull(pPhu, 'Thiên Phụ', chart);
    html += rPhu.html; score += rPhu.score;

    html += renderDirectionAdvice(pPhu, chart, 'Khu vực người dẫn đường đang ở hoặc nên tìm kiếm.');

    html += UI.section('📊 Đánh Giá Năng Lực & Thái Độ Người Dẫn Đường');
    const deity = getEffectiveDeityName(pPhu, chart);
    const gate = pPhu.batMon || '';
    if (deity.includes('Trực Phù')) { html += UI.note('🟢 Trực Phù: Người dẫn đường có uy tín và thực lực cao, đáng tin cậy hoàn toàn.', 'good'); score += 2; }
    else if (deity.includes('Thái Âm')) { html += UI.note('🟢 Thái Âm: Người dẫn đường ẩn mình, khiêm tốn nhưng cực kỳ giỏi — cần kiên nhẫn tiếp cận.', 'good'); score += 1; }
    else if (deity.includes('Lục Hợp')) { html += UI.note('🟢 Lục Hợp: Người dẫn đường sẵn sàng hợp tác, dễ tiếp cận, có mạng lưới quan hệ rộng.', 'good'); score += 1; }
    else if (deity.includes('Cửu Thiên')) { html += UI.note('🟢 Cửu Thiên: Người dẫn đường có tầm nhìn xa, danh tiếng lớn, kết nối tốt.', 'good'); score += 1; }
    else if (deity.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ: Cẩn thận! Người tự xưng là dẫn đường có thể không trung thực, mục đích không trong sáng.', 'bad'); score -= 2; }
    else if (deity.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà: Người dẫn đường nói nhiều nhưng thực lực hạn chế, dễ dẫn dắt sai hướng.', 'bad'); score -= 2; }
    else if (deity.includes('Bạch Hổ')) { html += UI.note('⚠️ Bạch Hổ: Người dẫn đường cứng rắn, khắt khe — không dễ tiếp cận nhưng hiệu quả thực tế.', 'neutral'); score -= 1; }

    if (normalizeGateName(gate) === 'Sinh') { html += UI.note('🟢 Sinh Môn: Người dẫn đường đang trong giai đoạn phát triển mạnh, nhiều sinh khí.', 'good'); score += 1; }
    else if (normalizeGateName(gate) === 'Tử') { html += UI.note('🔴 Tử Môn: Người dẫn đường đang yếu thế, không phải thời điểm tốt để nhờ cậy.', 'bad'); score -= 2; }
    else if (normalizeGateName(gate) === 'Khai') { html += UI.note('🟢 Khai Môn: Người dẫn đường đang rất tích cực, cởi mở, cơ hội tiếp cận cao.', 'good'); score += 2; }

    if (hasTamKy(pPhu) && !isVoid(chart, pPhu)) {
      const tk = getTamKyLabel(pPhu);
      html += UI.note(`✨ TAM KỲ tại Thiên Phụ — ${tk.name}: ${tk.desc} Người dẫn đường này là quý nhân đặc biệt hiếm gặp — nên tiếp cận ngay.`, 'good'); score += 2;
    }

    const dayHS4 = getStemOf(chart, 'day');
    const phuHS = getHeavenlyStem(pPhu);
    if (phuHS && getThienCanHop(dayHS4, phuHS)) {
      html += UI.note(`💫 ${getThienCanHopNote(dayHS4, phuHS)} → Người dẫn đường này có duyên số đặc biệt với bạn — hãy tiếp cận ngay, không bỏ lỡ.`, 'good'); score += 2;
    }

    if (isVoid(chart, pPhu)) { html += UI.note('⭕ Thiên Phụ Không Vong: Người dẫn đường vắng mặt, chỉ dẫn sai, hoặc không thực sự có thực lực như vẻ ngoài.', 'bad'); score -= 3; }
    if (hasRuMu(pPhu)) { html += UI.note('🪦 Thiên Phụ Nhập Mộ: Người dẫn đường đang bị cô lập hoặc không tiếp xúc được vào lúc này.', 'bad'); score -= 2; }
    if (isHorse(chart, pPhu)) { html += UI.note('🐎 Dịch Mã: Người dẫn đường đang di chuyển nhiều, khó gặp mặt — nên liên hệ trước.', 'info'); }

    html += tinhUngKy(pPhu, chart, 'Thời điểm gặp được người dẫn đường');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 5: CHUYỂN VIỆC =====
  TOPIC_ANALYZERS[5] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pKhai = findPalaceByGate(chart, 'Khai');
    const pDo = findPalaceByGate(chart, 'Đỗ');
    const pSinh = findPalaceByGate(chart, 'Sinh');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pKhai, chart, 'Khai Môn');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🧑 Hiện Trạng Bản Thân (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score * 0.5;
    if (pDay && isVoid(chart, pDay)) { html += UI.note('⭕ Bản thân Không Vong: Đang trong giai đoạn "trống rỗng" — thực ra là thời điểm dễ dứt bỏ cũ để đón nhận mới.', 'info'); score += 1; }

    html += UI.section('🏢 Công Ty Dự Định Chuyển Đến (Đỗ Môn)');
    const rDo = analyzePalaceFull(pDo, 'Đỗ Môn', chart);
    html += rDo.html;

    if (pDo && pDay) {
      const rel = getRelationBetweenPalaces(pDo, pDay, chart);
      html += UI.line('Công ty mới ↔ Bản thân', rel.label, rel.rel.includes('sinh') ? 'good' : rel.rel.includes('khac') ? 'bad' : 'neutral');
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Công ty mới sinh trợ bản thân: Môi trường mới cực kỳ phù hợp, phát triển nhanh, đãi ngộ tốt.', 'good'); }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bản thân cống hiến nhiều cho công ty mới: Sẽ được trọng dụng nhưng phải bỏ ra nhiều.', 'neutral'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Công ty mới khắc bản thân: Văn hóa công ty và phong cách làm việc không tương thích — nguy cơ thất bại cao.', 'bad'); }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Bản thân khắc công ty: Vị trí mới nhiều áp lực, nhưng có thể phát huy quyền lực cao.', 'neutral'); }
      else if (rel.rel === 'dong_hanh') { html += UI.note('🟢 Tỷ hòa: Văn hóa công ty tương đồng — dễ hòa nhập, phát triển ổn định.', 'good'); }
    }
    if (pDo && isVoid(chart, pDo)) { html += UI.note('⭕ Đỗ Môn Không Vong: Công ty dự định chuyển đến chưa chắc chắn, có thể là tin đồn hoặc đề nghị ảo.', 'bad'); score -= 2; }
    if (pDo && hasRuMu(pDo)) { html += UI.note('🪦 Đỗ Môn Nhập Mộ: Công ty mới đang có vấn đề nội bộ — hãy điều tra kỹ trước khi nhận lời.', 'bad'); score -= 2; }

    html += UI.section('🔮 Tương Lai Sự Nghiệp Sau Khi Chuyển (Khai Môn)');
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn', chart);
    html += rKhai.html; score += rKhai.score;
    if (pKhai && pDay) {
      const rel2 = getRelationBetweenPalaces(pKhai, pDay, chart);
      if (rel2.rel === 'a_sinh_b') { html += UI.note('🟢 Sự nghiệp tương lai vô cùng sáng lạn sau khi chuyển việc — nên đi.', 'good'); score += 3; }
      else if (rel2.rel === 'a_khac_b') { html += UI.note('🔴 Tương lai sự nghiệp xấu sau khi chuyển — nguy cơ thất nghiệp hoặc xuống dốc.', 'bad'); score -= 3; }
    }
    if (pKhai && isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Không Vong: Sau khi nghỉ sẽ không tìm được việc tốt hơn ngay — hãy chắc chắn đã có nơi đến.', 'bad'); score -= 2; }
    if (pKhai && hasPattern(pKhai, 'phản ngâm')) { html += UI.note('🔄 Khai Môn Phản Ngâm: Nghề nghiệp sau khi chuyển sẽ thay đổi liên tục — không ổn định ban đầu.', 'info'); }
    if (pKhai && hasPattern(pKhai, 'phục ngâm')) { html += UI.note('⏸️ Khai Môn Phục Ngâm: Sau khi chuyển sự nghiệp vẫn giậm chân, chưa bứt phá được.', 'info'); score -= 1; }

    html += UI.section('💰 Tài Lộc Sau Khi Chuyển (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
    html += rSinh.html;
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Thu nhập thực tế ở nơi mới thấp hơn kỳ vọng.', 'bad'); score -= 1; }
    if (pSinh && pDo && pSinh.cung === pDo.cung) { html += UI.note('🟢 Sinh Môn đồng cung Đỗ Môn: Công ty mới chính là nơi kiếm được nhiều tiền!', 'good'); score += 2; }

    html += UI.section('⏰ Lời Khuyên Thời Điểm');
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Toàn cục Phản Ngâm: Đây là thời điểm cực kỳ thích hợp để thay đổi, dịch chuyển.', 'good'); score += 2; }
    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Toàn cục Phục Ngâm: Chưa nên chuyển lúc này — mọi thứ đang trì trệ, dời lại sẽ tốt hơn.', 'bad'); score -= 2; }
    html += tinhUngKy(pKhai, chart, 'Thời điểm chuyển việc thành công');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 6: XIN VIỆC =====
  TOPIC_ANALYZERS[6] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pKhai = findPalaceByGate(chart, 'Khai');
    const pDo = findPalaceByGate(chart, 'Đỗ');
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pZF = getZhifuPalace(chart);

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pKhai, chart, 'Khai Môn');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('👤 Ứng Viên (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;

    html += UI.section('🎙️ Buổi Phỏng Vấn (Đỗ Môn)');
    const rDo = analyzePalaceFull(pDo, 'Đỗ Môn', chart);
    html += rDo.html;
    if (pDo && pDay) {
      const rel = getRelationBetweenPalaces(pDo, pDay, chart);
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Buổi phỏng vấn sinh bản thân: Phỏng vấn diễn ra suôn sẻ, nhà tuyển dụng rất ấn tượng.', 'good'); score += 2; }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Buổi phỏng vấn gây áp lực lớn: Câu hỏi khó, tình huống không thuận lợi — cần chuẩn bị rất kỹ.', 'bad'); score -= 2; }
    }
    if (pDo && isVoid(chart, pDo)) { html += UI.note('⭕ Đỗ Môn Không Vong: Buổi phỏng vấn có thể bị dời lịch, hủy, hoặc diễn ra không thực chất.', 'bad'); score -= 1; }
    if (pDo && hasPattern(pDo, 'phục ngâm')) { html += UI.note('⏸️ Phục Ngâm: Phỏng vấn nhiều vòng, quá trình xét tuyển kéo dài.', 'info'); score -= 1; }

    html += UI.section('📣 Kết Quả Tuyển Dụng (Khai Môn)');
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn (Quyết định)', chart);
    html += rKhai.html;

    const tkKhai6 = checkTamKyAtGate(chart, 'Khai', 6);
    if (tkKhai6 && !isVoid(chart, tkKhai6.palace)) {
      html += UI.note(`✨ TAM KỲ tại Khai Môn — ${tkKhai6.tamKy.name}: Có người trong nội bộ công ty đang ủng hộ bạn — xác suất đậu tăng vọt.`, 'good'); score += 2;
    }

    if (pKhai && pDay) {
      const rel = getRelationBetweenPalaces(pKhai, pDay, chart);
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('✅ Khai Môn sinh bản thân: ĐẬU — Công ty chủ động và nhiệt tình mời nhận. Rất cát.', 'good'); }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bản thân sinh Khai Môn: Cơ hội có nhưng cần thêm nỗ lực thuyết phục — có thể đậu vòng sau.', 'neutral'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('❌ Khai Môn khắc bản thân: RỚT — Yêu cầu vị trí không phù hợp hoặc đã chọn ứng viên khác.', 'bad'); }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Bản thân khắc Khai Môn: Bạn đủ điều kiện nhưng vị trí tuyển dụng có giới hạn — phụ thuộc vào cạnh tranh.', 'neutral'); }
      else if (rel.rel === 'dong_hanh') { html += UI.note('🟢 Tỷ hòa: Tương đồng với yêu cầu vị trí — cơ hội 60-70%.', 'good'); }

      const khaiHS = getHeavenlyStem(pKhai);
      if (khaiHS && getThienCanHop(dayHS, khaiHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, khaiHS)} → Ứng viên có duyên đặc biệt với vị trí này — xác suất trúng tuyển tăng cao.`, 'good'); score += 2;
      }
    }
    if (pKhai && isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Không Vong: Chưa có kết quả thực sự, cần chờ thêm — vị trí tuyển dụng có thể bị hủy.', 'bad'); score += getVoidScore(pKhai, chart, 'coHoi'); }
    if (pKhai && hasRuMu(pKhai)) { html += UI.note('🪦 Khai Môn Nhập Mộ: Kết quả bị treo, thông báo trễ, hoặc quá trình bị kẹt ở khâu phê duyệt.', 'bad'); score -= 1; }

    html += UI.section('👔 Sếp Tương Lai (Trực Phù)');
    if (pZF) {
      const rZF = analyzePalaceFull(pZF, 'Trực Phù (Người quản lý)', chart);
      html += rZF.html;
      if (pDay) {
        const relZF = getRelationBetweenPalaces(pZF, pDay, chart);
        if (relZF.rel === 'a_sinh_b') { html += UI.note('🟢 Sếp tương lai sẽ nâng đỡ và tạo điều kiện tốt cho bạn.', 'good'); score += 2; }
        else if (relZF.rel === 'a_khac_b') { html += UI.note('🔴 Sếp tương lai có tính cách áp chế — khó làm việc chung lâu dài.', 'bad'); score -= 1; }
        const zfHS6 = getHeavenlyStem(pZF);
        if (zfHS6 && getThienCanHop(dayHS, zfHS6)) {
          html += UI.note(`💫 ${getThienCanHopNote(dayHS, zfHS6)} → Bạn và sếp tương lai có duyên hợp đặc biệt — môi trường làm việc sẽ rất hài hòa.`, 'good'); score += 1;
        }
      }
    }

    html += UI.section('💰 Kỳ Vọng Lương Thưởng (Sinh Môn)');
    if (pSinh) {
      const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
      html += rSinh.html;
      if (isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Mức lương thực tế thấp hơn con số được chào — đàm phán kỹ.', 'bad'); score -= 1; }
    }
    html += tinhUngKy(pKhai, chart, 'Thời điểm có kết quả chính thức');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 7: MUA HÀNG =====
  TOPIC_ANALYZERS[7] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pCanh = findPalaceByGate(chart, 'Cảnh');

    html += UI.section('🛒 Người Mua (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Người mua [${dayHS}]`, chart);
    html += rDay.html;

    html += UI.section('📦 Sản Phẩm / Dịch Vụ (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Sản phẩm [${hourHS}]`, chart);
    html += rHour.html; score += rHour.score;

    if (pHour && hasTamKy(pHour) && !isVoid(chart, pHour)) {
      const tk = getTamKyLabel(pHour);
      html += UI.note(`✨ TAM KỲ tại Sản Phẩm — ${tk.name}: ${tk.desc} Sản phẩm này có chất lượng đặc biệt xuất sắc — đáng mua.`, 'good'); score += 2;
    }

    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Sản phẩm Không Vong: Hàng hóa không thực chất, mua về không đáp ứng được nhu cầu thực sự.', 'bad'); score += getVoidScore(pHour, chart, 'dungThan'); }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Sản phẩm Nhập Mộ: Chất lượng ẩn khuất, cần kiểm tra kỹ trước khi quyết định.', 'bad'); score -= 2; }

    html += UI.section('⚖️ Mức Phù Hợp: Người Mua ↔ Sản Phẩm');
    if (pDay && pHour) {
      const relDayHour = getRelationBetweenStems(hourHS, dayHS);
      html += UI.line('Sản phẩm ↔ Người mua', relDayHour.label, relDayHour.rel.includes('sinh') ? 'good' : relDayHour.rel.includes('khac') ? 'bad' : 'neutral');
      if (relDayHour.rel === 'a_sinh_b') { html += UI.note('🟢 Sản phẩm sinh người mua: Hàng hóa cực kỳ phù hợp, đáp ứng đúng nhu cầu. NÊN MUA.', 'good'); score += 3; }
      else if (relDayHour.rel === 'b_sinh_a') { html += UI.note('🟡 Người mua thích sản phẩm (one-sided): Bạn muốn mua nhưng hàng chưa thực sự tốt cho bạn — cân nhắc thêm.', 'neutral'); score += 1; }
      else if (relDayHour.rel === 'a_khac_b') { html += UI.note('🔴 Sản phẩm khắc người mua: Hàng kém chất lượng hoặc không phù hợp — KHÔNG NÊN MUA.', 'bad'); score -= 3; }
      else if (relDayHour.rel === 'b_khac_a') { html += UI.note('🟡 Người mua khắc sản phẩm: Mua rồi sẽ nhàm chán nhanh, thị trường bão hòa sớm.', 'neutral'); score -= 1; }
      else if (relDayHour.rel === 'dong_hanh') { html += UI.note('🟡 Tỷ hòa: Sản phẩm và người mua cùng ngũ hành — phù hợp nhưng không có sự đột phá đặc biệt.', 'neutral'); score += 1; }
      if (pDay.cung === pHour.cung) { html += UI.note('🟢 Người mua và sản phẩm đồng cung: Sự kết hợp hoàn hảo — giao dịch diễn ra nhanh chóng, không do dự.', 'good'); score += 2; }
      if (getThienCanHop(dayHS, hourHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, hourHS)} → Người mua và sản phẩm có duyên đặc biệt — đây là mua đúng thứ mình cần.`, 'good'); score += 2;
      }
    }

    html += UI.section('🌐 Thị Trường (Cảnh Môn)');
    const rCanh = analyzePalaceFull(pCanh, 'Cảnh Môn (Thị trường)', chart);
    html += rCanh.html;
    if (pCanh && isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: Thị trường ảo, giá bị thổi phồng — nguy cơ mua hớ giá cao.', 'bad'); score -= 2; }
    if (pCanh && pHour && pCanh.cung === pHour.cung) { html += UI.note('🟡 Sản phẩm đồng cung Cảnh Môn: Đây là hàng thuộc phân khúc cao cấp/trưng bày — chú ý phân biệt thực chất và hình thức.', 'neutral'); score += 1; }

    html += UI.section('🔍 Chỉ Dấu Đặc Biệt');
    const deityHour = pHour ? getEffectiveDeityName(pHour, chart) : '';
    if (deityHour.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ nơi sản phẩm: Nguy cơ hàng giả, hàng nhái, hoặc lừa đảo thương mại.', 'bad'); score -= 3; }
    if (deityHour.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà: Quảng cáo sai sự thật, chất lượng thực tế thấp hơn mô tả nhiều.', 'bad'); score -= 2; }
    if (deityHour.includes('Lục Hợp')) { html += UI.note('🟢 Lục Hợp: Sản phẩm có nhiều đánh giá tốt, được cộng đồng ủng hộ rộng rãi.', 'good'); score += 1; }
    if (deityHour.includes('Thái Âm')) { html += UI.note('🟢 Thái Âm: Sản phẩm có chất lượng thực sự nhưng chưa được biết đến nhiều — hàng tốt chưa nổi.', 'good'); score += 1; }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 8: BÁN HÀNG =====
  TOPIC_ANALYZERS[8] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pTS = getZhishiPalace(chart);
    const pMau = findPalaceByHeavenlyStem(chart, 'Mậu');

    html += UI.section('🧑‍💼 Người Bán (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Người bán [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score * 0.5;

    html += UI.section('📦 Sản Phẩm / Dịch Vụ (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Sản phẩm [${hourHS}]`, chart);
    html += rHour.html; score += rHour.score;
    html += getChuKhachAdvice(pHour);

    const tkSinh8 = checkTamKyAtGate(chart, 'Sinh', 8);
    if (tkSinh8 && !isVoid(chart, tkSinh8.palace)) {
      html += UI.note(`✨ TAM KỲ tại Sinh Môn — ${tkSinh8.tamKy.name}: Lợi nhuận có quý nhân phù hộ — doanh thu sắp bùng nổ bất ngờ.`, 'good'); score += 2;
    }

    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Sản phẩm Không Vong: Hàng hóa không đủ sức hấp dẫn thực sự, khó chốt sale.', 'bad'); score -= 2; }
    if (pDay && pHour) {
      const relDP = getRelationBetweenStems(hourHS, dayHS);
      if (relDP.rel === 'a_khac_b') { html += UI.note('🔴 Sản phẩm "không đi với" người bán: Bạn không phải chuyên gia lĩnh vực này, khó tạo niềm tin với khách.', 'bad'); score -= 2; }
      else if (relDP.rel === 'a_sinh_b') { html += UI.note('🟢 Sản phẩm tốt cho người bán: Đây là lĩnh vực sở trường, bán dễ dàng và tự nhiên.', 'good'); score += 2; }
      if (getThienCanHop(dayHS, hourHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, hourHS)} → Người bán và sản phẩm có duyên đặc biệt — đây là lĩnh vực số mệnh, bán rất tự nhiên.`, 'good'); score += 2;
      }
    }

    html += UI.section('🤝 Khách Hàng (Trực Sử)');
    const rTS = analyzePalaceFull(pTS, 'Trực Sử (Khách hàng)', chart);
    html += rTS.html;

    if (pHour && pTS) {
      const relProdCust = getRelationBetweenPalaces(pHour, pTS, chart);
      html += UI.line('Sản phẩm ↔ Khách hàng', relProdCust.label, relProdCust.rel.includes('sinh') ? 'good' : relProdCust.rel.includes('khac') ? 'bad' : 'neutral');
      if (relProdCust.rel === 'a_sinh_b') { html += UI.note('🟢 Sản phẩm sinh khách: Khách hàng thực sự cần và yêu thích sản phẩm — dễ chốt sale.', 'good'); score += 3; }
      else if (relProdCust.rel === 'b_sinh_a') { html += UI.note('🟡 Khách hàng đang "nuôi" sản phẩm: Mua vì trung thành chứ chưa chắc vì nhu cầu thực.', 'neutral'); score += 1; }
      else if (relProdCust.rel === 'a_khac_b') { html += UI.note('🔴 Sản phẩm áp lực lên khách: Khách hàng cảm thấy bị ép buộc — tỷ lệ hoàn trả/khiếu nại cao.', 'bad'); score -= 2; }
      else if (relProdCust.rel === 'b_khac_a') { html += UI.note('🟡 Khách hàng "khắt khe" với sản phẩm: Hay đòi hỏi, so sánh, khó chốt nhưng nếu chốt được rất trung thành.', 'neutral'); score -= 1; }
      const hourCanHS = getHeavenlyStem(pHour), tsHS = getHeavenlyStem(pTS);
      if (hourCanHS && tsHS && getThienCanHop(hourCanHS, tsHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(hourCanHS, tsHS)} → Sản phẩm và khách hàng có duyên đặc biệt — khách hàng này là người mua lý tưởng.`, 'good'); score += 2;
      }
    }
    if (pDay && pTS) {
      const relSeller = getRelationBetweenPalaces(pDay, pTS, chart);
      if (relSeller.rel === 'a_sinh_b') { html += UI.note('🟡 Người bán sinh khách: Bạn phục vụ khách quá tốt nhưng phụ thuộc nhiều vào khách.', 'neutral'); score -= 1; }
      else if (relSeller.rel === 'a_khac_b') { html += UI.note('⚠️ Người bán khắc khách: Dễ xảy ra tranh chấp, khiếu nại, mâu thuẫn với khách hàng.', 'bad'); score -= 2; }
    }
    if (pTS && isVoid(chart, pTS)) { html += UI.note('⭕ Trực Sử Không Vong: Khách hàng tiềm năng không thực chất, dễ hủy đơn hoặc không chốt.', 'bad'); score -= 2; }

    html += UI.section('💵 Lợi Nhuận (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn (Lợi nhuận)', chart);
    html += rSinh.html; score += rSinh.score;
    if (pHour && pSinh) {
      const relProfit = getRelationBetweenPalaces(pHour, pSinh, chart);
      if (relProfit.rel === 'a_sinh_b') { html += UI.note('🟢 Sản phẩm sinh lợi nhuận: Biên lợi nhuận cao, kinh doanh rất có lãi.', 'good'); score += 3; }
      else if (relProfit.rel === 'a_khac_b') { html += UI.note('🔴 Sản phẩm bào mòn lợi nhuận: Chi phí quá cao, bán nhiều nhưng lãi ít.', 'bad'); score -= 3; }
    }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Lợi nhuận hư ảo — doanh thu cao nhưng thực thu về tay thấp.', 'bad'); score -= 2; }

    html += UI.section('🏦 Vốn Liếng (Mậu)');
    if (pMau) {
      const rMau = analyzePalaceFull(pMau, 'Mậu (Vốn)', chart);
      html += rMau.html;
      if (hasRuMu(pMau)) { html += UI.note('🪦 Vốn Nhập Mộ: Tiền bị chôn cứng, không xoay vòng được — nguy cơ thiếu thanh khoản.', 'bad'); score -= 2; }
      if (isVoid(chart, pMau)) { html += UI.note('⭕ Vốn Không Vong: Thiếu vốn thực chất, tài chính không vững chắc.', 'bad'); score -= 2; }
    }

    return { html, score };
  };

  // TÍCH HỢP 9 - KẾT HỢP TAM PHÚ CÁCH & THỜI KHẮC DỤNG
  TOPIC_ANALYZERS[9] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pKhai = findPalaceByGate(chart, 'Khai');
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pMau = findPalaceByHeavenlyStem(chart, 'Mậu');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac1 = checkThoiKhacDung(pKhai, chart, 'Khai Môn');
    if (thoiKhac1) { html += UI.note(thoiKhac1.msg, thoiKhac1.type); score += thoiKhac1.score; }
    const thoiKhac2 = checkThoiKhacDung(pSinh, chart, 'Sinh Môn');
    if (thoiKhac2) { html += UI.note(thoiKhac2.msg, thoiKhac2.type); score += thoiKhac2.score; }

    html += UI.section('🧑 Chủ Doanh Nghiệp (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    html += getChuKhachAdvice(pDay);

    html += UI.section('🚀 Cửa Khởi Sự (Khai Môn) — TRỌNG TÂM');
    if (!pKhai) {
      html += UI.note('🔴 Khai Môn ẩn phục hoàn toàn: Thời cơ chưa đến — chưa nên mở kinh doanh lúc này.', 'bad');
      return { html, score: -4 };
    }
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn', chart);
    html += rKhai.html; score += rKhai.score;

    const tkKhai9 = checkTamKyAtGate(chart, 'Khai', 9);
    if (tkKhai9 && !isVoid(chart, tkKhai9.palace) && !hasRuMu(tkKhai9.palace)) {
      html += UI.note(`✨ TAM KỲ ĐẮC SỬ tại Khai Môn — ${tkKhai9.tamKy.name}: ${tkKhai9.tamKy.desc} Đây là cát tượng đặc biệt cho kinh doanh — nên khởi sự ngay.`, 'good'); score += 3;
    }

    if (isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Tuần Không: Kế hoạch kinh doanh đổ vỡ, vốn hao tổn, không nên khởi sự thời điểm này.', 'bad'); score += getVoidScore(pKhai, chart, 'coHoi'); }
    if (hasRuMu(pKhai)) { html += UI.note('🪦 Khai Môn Nhập Mộ: Kinh doanh sẽ bế tắc ngay từ đầu, khách hàng không đến. KHÔNG NÊN MỞ.', 'bad'); score -= 3; }
    if (pKhai && hasPattern(pKhai, 'phục ngâm')) { html += UI.note('⏸️ Khai Môn Phục Ngâm: Kinh doanh đình đốn kéo dài, doanh thu lẹt đẹt — chọn thời điểm khác.', 'bad'); score -= 2; }

    if (pDay) {
      const rel = getRelationBetweenPalaces(pKhai, pDay, chart);
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Khai Môn sinh bản thân: Nghề nghiệp này cực kỳ phù hợp — sẽ phát tài.', 'good'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Khai Môn khắc bản thân: Ngành nghề này không phù hợp với bạn — dễ thất bại.', 'bad'); }
      
      const khaiHS9 = getHeavenlyStem(pKhai);
      if (khaiHS9 && getThienCanHop(dayHS, khaiHS9)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, khaiHS9)} → Chủ doanh nghiệp và ngành kinh doanh có duyên đặc biệt — đây là lĩnh vực thiên mệnh.`, 'good'); score += 2;
      }
    }

    html += UI.section('👥 Thần Khí Hỗ Trợ (Bát Thần tại Khai Môn)');
    const deity = getEffectiveDeityName(pKhai, chart);
    const deityImpact = {
      'Trực Phù': { msg: '🟢 Trực Phù: Có quý nhân đỡ đầu lớn, được hỗ trợ từ người có quyền lực.', type: 'good', sc: 3 },
      'Thái Âm': { msg: '🟢 Thái Âm: Khách hàng trung thành, quay lại nhiều lần, thích hợp kinh doanh dịch vụ B2C.', type: 'good', sc: 2 },
      'Lục Hợp': { msg: '🟢 Lục Hợp: Hợp tác nhiều, đối tác tốt, phù hợp kinh doanh liên kết/nhượng quyền.', type: 'good', sc: 2 },
      'Cửu Thiên': { msg: '🟢 Cửu Thiên: Danh tiếng lan xa, thương hiệu mạnh, bán hàng online/toàn quốc tốt.', type: 'good', sc: 2 },
      'Cửu Địa': { msg: '🟡 Cửu Địa: Phát triển chậm nhưng bền vững, phù hợp kinh doanh truyền thống.', type: 'neutral', sc: 0 },
      'Đằng Xà': { msg: '🔴 Đằng Xà: Dễ dính pháp lý, thuế vụ, tranh chấp hợp đồng — cẩn thận giấy tờ pháp lý.', type: 'bad', sc: -3 },
      'Bạch Hổ': { msg: '🔴 Bạch Hổ: Bế tắc liên tục, nhân viên tranh chấp, mệt mỏi không ngừng.', type: 'bad', sc: -2 },
      'Huyền Vũ': { msg: '🔴 Huyền Vũ: Thất thoát tài chính, nhân viên trộm cắp, đối tác không trung thực.', type: 'bad', sc: -3 },
      'Câu Trận': { msg: '🔴 Câu Trận: Ứ đọng, hàng tồn kho lớn, không thanh lý được.', type: 'bad', sc: -2 },
      'Chu Tước': { msg: '🔴 Chu Tước: Cãi vã với đối tác/khách hàng, tiếng xấu lan ra nhanh.', type: 'bad', sc: -2 }
    };
    let deityFound = false;
    for (const [k, v] of Object.entries(deityImpact)) {
      if (deity && deity.includes(k)) { html += UI.note(v.msg, v.type); score += v.sc; deityFound = true; break; }
    }
    if (!deityFound && deity) html += UI.line('Bát Thần tại Khai Môn', deity, 'neutral');

    html += UI.section('💰 Tiềm Năng Lợi Nhuận (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
    html += rSinh.html; score += rSinh.score * 0.5;
    if (pSinh && pKhai && pSinh.cung === pKhai.cung) { html += UI.note('🟢 Sinh Môn và Khai Môn đồng cung: Kinh doanh và lợi nhuận nhất quán — đây là quẻ rất cát để mở shop!', 'good'); score += 3; }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Kinh doanh có nhưng lợi nhuận thực thu về ít hơn mong đợi.', 'bad'); score -= 2; }

    html += UI.section('🏦 Vốn Khởi Sự (Mậu)');
    if (pMau) {
      const rMau = analyzePalaceFull(pMau, 'Mậu (Vốn đầu tư)', chart);
      html += rMau.html;
      if (hasRuMu(pMau)) { html += UI.note('🪦 Vốn Nhập Mộ: Vốn chôn cứng, không xoay vòng được — nguy cơ hết tiền mặt.', 'bad'); score -= 2; }
      if (isVoid(chart, pMau)) { html += UI.note('⭕ Vốn Không Vong: Vốn thực tế thấp hơn dự kiến — hãy đảm bảo nguồn vốn trước khi bắt đầu.', 'bad'); score -= 2; }
    }

    // TÍCH HỢP TAM PHÚ CÁCH
    const tamPhu = checkTamPhuCach(pKhai, pSinh, pMau, chart);
    if (tamPhu) {
      html += UI.note(tamPhu.msg, tamPhu.type);
      score += tamPhu.score;
    }

    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Toàn cục Phục Ngâm: Môi trường kinh doanh đang trì trệ — hãy đợi thời điểm khác.', 'bad'); score -= 2; }
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Toàn cục Phản Ngâm: Thị trường đang có sự dịch chuyển lớn — cơ hội cho người nhanh nắm bắt.', 'good'); score += 1; }
    html += tinhUngKy(pKhai, chart, 'Thời điểm đẹp để khai trương');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 10: HỢP TÁC =====
  TOPIC_ANALYZERS[10] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');
    const pSinh = findPalaceByGate(chart, 'Sinh');

    html += UI.section('🧑 Bản Thân (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score * 0.5;
    html += getChuKhachAdvice(pDay);

    html += UI.section('🤝 Đối Tác (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Đối tác [${hourHS}]`, chart);
    html += rHour.html; score += rHour.score * 0.5;
    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Đối tác Không Vong: Đối tác không thực chất, thiếu năng lực hoặc nguồn lực hư ảo.', 'bad'); score -= 2; }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Đối tác Nhập Mộ: Đối tác đang trong vòng phong tỏa, gặp khó khăn nghiêm trọng — cẩn thận.', 'bad'); score -= 2; }

    html += UI.section('⚖️ Tương Tác Hai Bên');
    if (pDay && pHour) {
      const relAB = getRelationBetweenStems(dayHS, hourHS);
      html += UI.line('Bản thân ↔ Đối tác', relAB.label, relAB.rel.includes('sinh') ? 'good' : relAB.rel.includes('khac') ? 'bad' : 'neutral');
      if (relAB.rel === 'dong_hanh') { html += UI.note('🟢 Tỷ hòa: Hai bên cùng ngũ hành — tư duy và phong cách tương đồng, hợp tác dễ dàng.', 'good'); score += 2; }
      else if (relAB.rel === 'a_sinh_b') { html += UI.note('🟢 Bản thân sinh đối tác: Bạn là người tạo động lực, đối tác nhận hỗ trợ từ bạn nhiều hơn.', 'good'); score += 2; }
      else if (relAB.rel === 'b_sinh_a') { html += UI.note('🟢 Đối tác sinh bản thân: Đối tác hỗ trợ bạn nhiều — quan hệ lợi thế cho bạn.', 'good'); score += 2; }
      else if (relAB.rel === 'a_khac_b') { html += UI.note('🔴 Bản thân khắc đối tác: Hai bên bất đồng lợi ích, dễ xảy ra tranh chấp nghiêm trọng.', 'bad'); score -= 3; }
      else if (relAB.rel === 'b_khac_a') { html += UI.note('🔴 Đối tác khắc bản thân: Đối tác dễ chiếm đoạt lợi nhuận hoặc gây thiệt hại cho bạn.', 'bad'); score -= 3; }

      if (getThienCanHop(dayHS, hourHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, hourHS)} → Hai bên có duyên số đặc biệt — hợp tác này mang tính thiên mệnh, gắn kết tự nhiên và bền vững.`, 'good'); score += 3;
      }

      if (pDay.cung === pHour.cung) { html += UI.note('🟢 Hai bên đồng cung: Cực kỳ gắn kết, hợp tác chặt chẽ, quyền lợi đan xen — như "cổ đông ruột".', 'good'); score += 3; }
    }

    html += UI.section('🔗 Sợi Dây Hợp Đồng (Lục Hợp)');
    const rLH = analyzePalaceFull(pLH, 'Lục Hợp', chart);
    html += rLH.html;
    if (pLH && isVoid(chart, pLH)) { html += UI.note('⭕ Lục Hợp Không Vong: Hợp đồng ảo, đối tác dễ bỏ ngang, cam kết không được giữ.', 'bad'); score -= 3; }
    if (pLH && hasRuMu(pLH)) { html += UI.note('🪦 Lục Hợp Nhập Mộ: Hợp đồng bị treo, thỏa thuận bị phong tỏa, ký kết bị trì hoãn.', 'bad'); score -= 2; }
    if (pLH) {
      const deity = getEffectiveDeityName(pLH, chart);
      if (deity.includes('Huyền Vũ')) { html += UI.note('🔴 Lục Hợp + Huyền Vũ: Hợp tác che giấu thực chất, có gian lận trong thỏa thuận.', 'bad'); score -= 3; }
      if (deity.includes('Đằng Xà')) { html += UI.note('🔴 Lục Hợp + Đằng Xà: Hợp đồng có điều khoản bẫy, đọc kỹ trước khi ký.', 'bad'); score -= 2; }
    }

    html += UI.section('💰 Lợi Ích Tài Chính (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
    html += rSinh.html; score += rSinh.score * 0.5;
    if (pSinh && pLH && pSinh.cung === pLH.cung) { html += UI.note('🟢 Lục Hợp và Sinh Môn đồng cung: Hợp tác trực tiếp tạo ra lợi nhuận — mối quan hệ win-win rõ ràng.', 'good'); score += 2; }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Lợi ích tài chính từ hợp tác thấp hơn kỳ vọng.', 'bad'); score -= 2; }

    const deityDay = pDay ? getEffectiveDeityName(pDay, chart) : '';
    const deityHour = pHour ? getEffectiveDeityName(pHour, chart) : '';
    if (deityDay.includes('Huyền Vũ') || deityHour.includes('Huyền Vũ')) { html += UI.note('🔴 Một trong hai bên có Huyền Vũ: Có bên đang không trung thực về nguồn lực hoặc ý định.', 'bad'); score -= 2; }
    if (deityDay.includes('Trực Phù') || deityHour.includes('Trực Phù')) { html += UI.note('🟢 Một bên có Trực Phù: Hợp tác có sự hỗ trợ từ người có quyền lực hoặc thương hiệu lớn.', 'good'); score += 2; }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 11: MUA BÁN BĐS =====
  TOPIC_ANALYZERS[11] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pTu = findPalaceByGate(chart, 'Tu') || findPalaceByGate(chart, 'Tử');
    const pCanh = findPalaceByGate(chart, 'Cảnh');
    const pMau = findPalaceByHeavenlyStem(chart, 'Mậu');
    const pTam = findPalaceByStarName(chart, 'Thiên Tâm');
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');
    const pCuuDia = findPalaceByDeityName(chart, 'Cửu Địa');
    const pCuuThien = findPalaceByDeityName(chart, 'Cửu Thiên');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac1 = checkThoiKhacDung(pSinh, chart, 'Sinh Môn (Nhà)');
    if (thoiKhac1) { html += UI.note(thoiKhac1.msg, thoiKhac1.type); score += thoiKhac1.score; }
    const thoiKhac2 = checkThoiKhacDung(pTu, chart, 'Tử Môn (Đất)');
    if (thoiKhac2) { html += UI.note(thoiKhac2.msg, thoiKhac2.type); score += thoiKhac2.score; }

    html += UI.section('🧑 Chủ Thể Giao Dịch (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    html += getChuKhachAdvice(pDay);

    html += UI.section('🏠 Nhà Ở (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn (Nhà)', chart);
    html += rSinh.html;
    if (pSinh && pDay) {
      const rel = getRelationBetweenPalaces(pSinh, pDay, chart);
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Nhà này sinh bản thân: Căn nhà mang lại năng lượng tốt, sức khỏe và tài lộc sau khi mua.', 'good'); score += 3; }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Nhà này khắc bản thân: Phong thủy không hợp người mua — có thể gây sức khỏe hoặc tài lộc sa sút.', 'bad'); score -= 3; }
      const sinhHS = getHeavenlyStem(pSinh);
      if (sinhHS && getThienCanHop(dayHS, sinhHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, sinhHS)} → Người mua và căn nhà có duyên đặc biệt — đây là căn nhà của số mệnh, nên mua.`, 'good'); score += 2;
      }
    }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Nhà không có thực hoặc giao dịch mua nhà bị hủy.', 'bad'); score -= 2; }

    html += UI.section('🌍 Đất Đai (Tử Môn)');
    const rTu = analyzePalaceFull(pTu, 'Tử Môn (Đất)', chart);
    html += rTu.html;
    if (pTu && pDay) {
      const rel = getRelationBetweenPalaces(pTu, pDay, chart);
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Đất sinh bản thân: Lô đất này sẽ mang lại lợi nhuận và phù hợp phong thủy.', 'good'); score += 2; }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Đất khắc bản thân: Đất này không hợp với người mua — có thể gặp tranh chấp hoặc thất lợi.', 'bad'); score -= 2; }
    }
    if (pTu && isVoid(chart, pTu)) { html += UI.note('⭕ Tử Môn Không Vong: Đất không có sổ đỏ/pháp lý rõ ràng, hoặc đang trong vùng quy hoạch.', 'bad'); score -= 2; }

    if (pCuuThien) {
      html += UI.section('🏢 Chung Cư / Căn Hộ (Cửu Thiên)');
      const rCT = analyzePalaceFull(pCuuThien, 'Cửu Thiên', chart);
      html += rCT.html;
      if (pCuuThien && pDay) {
        const rel = getRelationBetweenPalaces(pCuuThien, pDay, chart);
        if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Chung cư sinh bản thân: Căn hộ phù hợp, giá trị tăng trưởng tốt.', 'good'); score += 2; }
        else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Chung cư khắc bản thân: Không nên chọn tòa nhà này.', 'bad'); score -= 2; }
      }
    }
    if (pCuuDia) {
      html += UI.section('🏗️ Dự Án Lớn / Khu Đô Thị (Cửu Địa)');
      const rCD = analyzePalaceFull(pCuuDia, 'Cửu Địa', chart);
      html += rCD.html;
      if (isVoid(chart, pCuuDia)) { html += UI.note('⭕ Cửu Địa Không Vong: Dự án tiến độ chậm, pháp lý chưa rõ, tiềm ẩn rủi ro.', 'bad'); score -= 2; }
    }

    html += UI.section('📄 Pháp Lý & Sổ Đỏ (Cảnh Môn)');
    const rCanhPl = analyzePalaceFull(pCanh, 'Cảnh Môn (Pháp lý)', chart);
    html += rCanhPl.html;
    if (pCanh && isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: NGUY HIỂM — Giấy tờ pháp lý không đầy đủ hoặc giả mạo. Tuyệt đối không ký kết!', 'bad'); score += getVoidScore(pCanh, chart, 'phapLy'); }
    if (pCanh && hasRuMu(pCanh)) { html += UI.note('🪦 Cảnh Môn Nhập Mộ: Sổ đỏ đang bị thế chấp hoặc tranh chấp chưa giải quyết.', 'bad'); score -= 3; }
    if (pCanh) {
      const dCanh = getEffectiveDeityName(pCanh, chart);
      if (dCanh.includes('Huyền Vũ') || dCanh.includes('Đằng Xà')) { html += UI.note('🔴 Pháp lý + Huyền Vũ/Đằng Xà: Có dấu hiệu lừa đảo bất động sản — tra cứu tư pháp kỹ lưỡng!', 'bad'); score -= 3; }
      if (dCanh.includes('Chu Tước')) { html += UI.note('🔴 Pháp lý + Chu Tước: Cẩn thận các điều khoản hợp đồng gây bất lợi, dễ sinh cãi vã kiện tụng.', 'bad'); score -= 2; }
    }

    html += UI.section('🏦 Năng Lực Tài Chính (Mậu + Thiên Tâm)');
    if (pMau) {
      const rMau = analyzePalaceFull(pMau, 'Mậu (Vốn)', chart);
      html += rMau.html;
      if (hasRuMu(pMau)) { html += UI.note('🪦 Vốn Nhập Mộ: Tài chính bị phong tỏa, vay vốn khó khăn.', 'bad'); score -= 2; }
      if (isVoid(chart, pMau)) { html += UI.note('⭕ Vốn Không Vong: Nguồn vốn không ổn định, cần đảm bảo tài chính trước.', 'bad'); score -= 2; }
    }
    if (pTam) { const rTam = analyzePalaceFull(pTam, 'Thiên Tâm (Tình hình tài chính)', chart); html += rTam.html; }

    html += UI.section('🤝 Môi Giới (Lục Hợp)');
    if (pLH) {
      const rLH = analyzePalaceFull(pLH, 'Lục Hợp (Môi giới)', chart);
      html += rLH.html;
      const dLH = getEffectiveDeityName(pLH, chart);
      if (isVoid(chart, pLH)) { html += UI.note('⭕ Lục Hợp Không Vong: Môi giới không đáng tin cậy, thông tin từ họ không chính xác.', 'bad'); score -= 1; }
      if (dLH.includes('Huyền Vũ')) { html += UI.note('🔴 Môi giới + Huyền Vũ: Cẩn thận bị dụ dỗ bởi môi giới không chính trực.', 'bad'); score -= 2; }
    }
    html += tinhUngKy(pSinh, chart, 'Thời điểm chốt giao dịch mua/bán');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 12: ĐI VAY / CHO VAY =====
  TOPIC_ANALYZERS[12] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pZF = getZhifuPalace(chart);
    const pTS = getZhishiPalace(chart);
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pMau = findPalaceByHeavenlyStem(chart, 'Mậu');

    html += UI.section('🧑 Bản Thân (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;

    html += UI.section('🏦 Người Cho Vay (Trực Phù)');
    const rZF = analyzePalaceFull(pZF, 'Trực Phù (Người cho vay)', chart);
    html += rZF.html;
    if (pZF && isVoid(chart, pZF)) { html += UI.note('⭕ Người cho vay Không Vong: Nguồn vốn không thực chất, có thể hủy khoản vay bất ngờ.', 'bad'); score -= 2; }

    html += UI.section('🙋 Người Đi Vay (Trực Sử)');
    const rTS = analyzePalaceFull(pTS, 'Trực Sử (Người đi vay)', chart);
    html += rTS.html;
    if (pTS && isVoid(chart, pTS)) { html += UI.note('⭕ Người vay Không Vong: Người vay không có thực lực trả nợ — rủi ro cao.', 'bad'); score += getVoidScore(pTS, chart, 'dungThan'); }
    if (pTS && hasRuMu(pTS)) { html += UI.note('🪦 Trực Sử Nhập Mộ: Người vay đang trong tình trạng khó khăn nghiêm trọng — khó đòi lại vốn.', 'bad'); score -= 2; }
    if (pTS && isHorse(chart, pTS)) { html += UI.note('🐎 Người vay có Dịch Mã: Người vay đang biến động, có thể trốn tránh trách nhiệm trả nợ.', 'bad'); score -= 2; }

    html += UI.section('⚖️ Tương Quan Vay – Cho');
    if (pZF && pTS) {
      const relVT = getRelationBetweenPalaces(pTS, pZF, chart);
      html += UI.line('Người vay ↔ Người cho vay', relVT.label, relVT.rel.includes('sinh') ? 'good' : relVT.rel.includes('khac') ? 'bad' : 'neutral');
      if (relVT.rel === 'a_sinh_b') { html += UI.note('🟢 Người vay sinh cho vay: Trả lãi đúng hạn, sòng phẳng, giao dịch an toàn.', 'good'); score += 3; }
      else if (relVT.rel === 'b_sinh_a') { html += UI.note('🟡 Cho vay sinh người vay: Người cho vay tạo điều kiện nhiều — người vay chủ động hơn.', 'neutral'); score += 1; }
      else if (relVT.rel === 'a_khac_b') { html += UI.note('🔴 Người vay khắc người cho vay: NGUY HIỂM — Dễ xù nợ, giật nợ, gây thiệt hại cho người cho vay.', 'bad'); score -= 4; }
      else if (relVT.rel === 'b_khac_a') { html += UI.note('🟡 Người cho vay ép người vay: Điều kiện vay nghiêm ngặt — người vay phải cân nhắc kỹ.', 'neutral'); score += 1; }
      
      const zfHS12 = getHeavenlyStem(pZF), tsHS12 = getHeavenlyStem(pTS);
      if (zfHS12 && tsHS12 && getThienCanHop(tsHS12, zfHS12)) {
        html += UI.note(`💫 ${getThienCanHopNote(tsHS12, zfHS12)} → Người vay và người cho vay có duyên hợp — giao dịch sẽ suôn sẻ và tin tưởng lẫn nhau.`, 'good'); score += 2;
      }
    }

    html += UI.section('🔍 Phân Tích Theo Vai Trò Người Hỏi');
    if (pDay && pZF) {
      if (pDay.cung === pZF.cung) {
        html += UI.note('Người hỏi là NGƯỜI CHO VAY (đồng cung Trực Phù). Đánh giá khả năng thu hồi vốn:', 'info');
        if (pTS && !isVoid(chart, pTS) && !hasRuMu(pTS)) { html += UI.note('🟢 Con nợ ổn định: Khả năng thu hồi vốn tốt.', 'good'); score += 2; }
        else { html += UI.note('🔴 Con nợ yếu thế: Cân nhắc có nên cho vay không.', 'bad'); score -= 2; }
      } else if (pDay && pTS && pDay.cung === pTS.cung) {
        html += UI.note('Người hỏi là NGƯỜI ĐI VAY (đồng cung Trực Sử). Đánh giá khả năng vay được:', 'info');
        if (pZF && !isVoid(chart, pZF)) { html += UI.note('🟢 Người cho vay có thực lực: Có thể vay được số tiền mong muốn.', 'good'); score += 2; }
        else { html += UI.note('🔴 Nguồn vay không ổn định: Khoản vay có nguy cơ bị từ chối.', 'bad'); score -= 2; }
      }
    }

    html += UI.section('💵 Khoản Tiền (Sinh Môn + Mậu)');
    if (pSinh) { const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart); html += rSinh.html; }
    if (pMau) {
      const rMau = analyzePalaceFull(pMau, 'Mậu (Vốn)', chart); html += rMau.html;
      if (hasRuMu(pMau)) { html += UI.note('🪦 Mậu Nhập Mộ: Khoản tiền bị chôn — khó giải ngân hoặc khó thu hồi.', 'bad'); score -= 2; }
    }
    html += tinhUngKy(pMau || pSinh, chart, 'Thời điểm giải ngân / trả nợ');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 13: ĐÒI NỢ =====
  TOPIC_ANALYZERS[13] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pThuong = findPalaceByGate(chart, 'Thương');
    const pSinh = findPalaceByGate(chart, 'Sinh');

    html += UI.section('🧑 Chủ Nợ (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    html += getChuKhachAdvice(pDay);

    html += UI.section('😰 Con Nợ (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Can Giờ [${hourHS}] (Con nợ)`, chart);
    html += rHour.html;

    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Con nợ Không Vong: Người nợ thực sự không có tiền trả, hoặc đang cố tình "bốc hơi".', 'bad'); score += getVoidScore(pHour, chart, 'dungThan'); }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Con nợ Nhập Mộ: Người nợ đang bị phong tỏa tài sản, hoặc ẩn nấp không liên lạc được.', 'bad'); score -= 2; }
    if (pHour && isHorse(chart, pHour)) { html += UI.note('🐎 Dịch Mã: Con nợ đang trong trạng thái di chuyển liên tục — có nguy cơ bỏ trốn.', 'bad'); score -= 3; }

    if (pDay && pHour) {
      const rel = getRelationBetweenStems(dayHS, hourHS);
      if (rel.rel === 'a_khac_b') { html += UI.note('🟢 Chủ nợ khắc con nợ: Thế mạnh về phía chủ nợ — đòi nợ có khả năng thành công.', 'good'); score += 2; }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🔴 Con nợ khắc chủ nợ: Con nợ đang chiếm thế — đòi nợ gặp nhiều cản trở, ngoan cố không chịu trả.', 'bad'); score -= 3; }
      else if (rel.rel === 'a_sinh_b') { html += UI.note('🟡 Chủ nợ sinh con nợ: Vô tình tạo điều kiện cho con nợ tiếp tục né tránh.', 'neutral'); score -= 1; }
      if (pDay.cung === pHour.cung) { html += UI.note('🟢 Đồng cung: Chủ nợ và con nợ sẽ gặp mặt — cơ hội đàm phán trực tiếp rất cao.', 'good'); score += 3; }
    }

    html += UI.section('⚔️ Hiệu Quả Đòi Nợ (Thương Môn)');
    const rThuong = analyzePalaceFull(pThuong, 'Thương Môn', chart);
    html += rThuong.html;
    if (pThuong && isVoid(chart, pThuong)) { html += UI.note('⭕ Thương Môn Không Vong: Mọi nỗ lực đòi nợ đều vô ích — hao công mà không thu được gì.', 'bad'); score -= 3; }
    if (pThuong && hasRuMu(pThuong)) { html += UI.note('🪦 Thương Môn Nhập Mộ: Kế hoạch đòi nợ bị phong tỏa — cần tìm phương án khác (nhờ luật pháp).', 'bad'); score -= 2; }
    if (pThuong && hasPattern(pThuong, 'phản ngâm')) { html += UI.note('🔄 Thương Môn Phản Ngâm: Đòi nợ tạo ra xung đột lớn, khả năng leo thang thành kiện tụng.', 'info'); score -= 1; }

    html += UI.section('💵 Khoản Tiền Đòi Được (Sinh Môn)');
    const rSinh = analyzePalaceFull(pSinh, 'Sinh Môn', chart);
    html += rSinh.html;
    if (pSinh && hasRuMu(pSinh)) { html += UI.note('🪦 Sinh Môn Nhập Mộ: Tiền bị chôn vùi — không thể thu hồi trong thời gian gần, phải kiện ra tòa.', 'bad'); score -= 2; }
    if (pSinh && isVoid(chart, pSinh)) { html += UI.note('⭕ Sinh Môn Không Vong: Khoản tiền không còn — có thể con nợ đã tiêu hết hoặc chuyển tài sản.', 'bad'); score -= 2; }
    if (pSinh && pDay && pSinh.cung === pDay.cung) { html += UI.note('🟢 Sinh Môn đồng cung bản thân: Tiền đang trên đường về tay — đòi nợ sắp thành công!', 'good'); score += 3; }

    const pCanhD = findPalaceByGate(chart, 'Cảnh');
    const pKhaiD = findPalaceByGate(chart, 'Khai');
    html += UI.section('⚖️ Nên Kiện Ra Tòa Không?');
    if (pCanhD && !isVoid(chart, pCanhD)) { html += UI.note('🟢 Cảnh Môn tốt: Nên lập đơn kiện — pháp lý sẽ hỗ trợ bạn.', 'good'); score += 1; }
    if (pKhaiD && !isVoid(chart, pKhaiD) && !hasRuMu(pKhaiD)) { html += UI.note('🟢 Khai Môn tốt: Tòa sẽ thụ lý và xét xử có lợi cho chủ nợ.', 'good'); score += 1; }
    if (pCanhD && isVoid(chart, pCanhD)) { html += UI.note('⭕ Cảnh Môn Không Vong: Chứng từ chưa đủ để kiện — cần thu thập thêm bằng chứng.', 'bad'); score -= 1; }
    html += tinhUngKy(pSinh, chart, 'Thời điểm thu hồi được khoản nợ');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 14: THI ĐẤU =====
  TOPIC_ANALYZERS[14] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHourEarth = findPalaceByEarthlyStem(chart, hourHS);
    const pHourHeaven = findPalaceByHeavenlyStem(chart, hourHS);
    const pZF = getZhifuPalace(chart);

    html += UI.section(`🏆 Bên Được Hỏi (Can Ngày: ${dayHS})`);
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    if (pDay && isVoid(chart, pDay)) { html += UI.note('⭕ Bên này Không Vong: Phong độ đang rất kém, không ở trạng thái tốt nhất.', 'bad'); score -= 3; }

    html += UI.section('⚔️ So Sánh Lực Lượng Hai Đội');
    const rEarth = analyzePalaceFull(pHourEarth, 'Địa Bàn Giờ (Chủ Nhà)', chart);
    html += rEarth.html;
    const rHeaven = analyzePalaceFull(pHourHeaven, 'Thiên Bàn Giờ (Đội Khách)', chart);
    html += rHeaven.html;

    if (pHourEarth && pHourHeaven) {
      const relTeams = getRelationBetweenPalaces(pHourHeaven, pHourEarth, chart);
      html += UI.line('Đội Khách ↔ Chủ Nhà', relTeams.label, relTeams.rel.includes('khac') ? 'bad' : relTeams.rel.includes('sinh') ? 'good' : 'neutral');
      if (relTeams.rel === 'a_khac_b') { html += UI.note('🔴 Khách khắc Chủ: Đội khách áp đảo hoàn toàn — khách thắng.', 'bad'); score -= 2; }
      else if (relTeams.rel === 'b_khac_a') { html += UI.note('🟢 Chủ khắc Khách: Sân nhà phát huy uy lực mạnh — chủ nhà thắng.', 'good'); score += 2; }
      else if (relTeams.rel === 'a_sinh_b') { html += UI.note('🟡 Khách sinh Chủ: Chủ nhà nhận năng lượng — cuộc chơi nghiêng về chủ nhà.', 'good'); score += 1; }
      else if (relTeams.rel === 'b_sinh_a') { html += UI.note('🟡 Chủ sinh Khách: Cuộc chơi lợi thế cho đội khách.', 'neutral'); score -= 1; }
      else { html += UI.note('⚖️ Hai đội ngang tài ngang sức — kết quả khó đoán, phụ thuộc vào yếu tố ngẫu nhiên.', 'info'); }

      const earthHS = getHeavenlyStem(pHourEarth), heavenHS = getHeavenlyStem(pHourHeaven);
      if (earthHS && heavenHS && getThienCanHop(earthHS, heavenHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(earthHS, heavenHS)} → Chủ nhà và đội khách có duyên kỳ phùng — trận đấu hấp dẫn, thắng thua khó đoán nhưng cống hiến cao.`, 'info');
      }
    }

    html += UI.section('📊 Phân Tích Sức Mạnh Chi Tiết');
    let homeScore = 0, awayScore = 0;
    if (pHourEarth) {
      homeScore += getContextualGateScore(pHourEarth.batMon || '', 14);
      homeScore += getDeityScore(getEffectiveDeityName(pHourEarth, chart));
      homeScore += getContextualStarScore(pHourEarth.thienBan || '', 14);
      if (isVoid(chart, pHourEarth)) homeScore -= 3;
      if (hasRuMu(pHourEarth)) homeScore -= 2;
    }
    if (pHourHeaven) {
      awayScore += getContextualGateScore(pHourHeaven.batMon || '', 14);
      awayScore += getDeityScore(getEffectiveDeityName(pHourHeaven, chart));
      awayScore += getContextualStarScore(pHourHeaven.thienBan || '', 14);
      if (isVoid(chart, pHourHeaven)) awayScore -= 3;
      if (hasRuMu(pHourHeaven)) awayScore -= 2;
    }
    html += UI.line('Điểm Chủ Nhà', `${homeScore >= 0 ? '+' : ''}${homeScore}`, homeScore > awayScore ? 'good' : 'bad');
    html += UI.line('Điểm Đội Khách', `${awayScore >= 0 ? '+' : ''}${awayScore}`, awayScore > homeScore ? 'good' : 'bad');
    if (homeScore > awayScore) { html += UI.verdict(`🟢 Chủ nhà mạnh hơn (chênh lệch ${homeScore - awayScore} điểm). Dự đoán: CHỦ NHÀ THẮNG.`, 'good'); score += 1; }
    else if (awayScore > homeScore) { html += UI.verdict(`🔴 Đội khách mạnh hơn (chênh lệch ${awayScore - homeScore} điểm). Dự đoán: ĐỘI KHÁCH THẮNG.`, 'bad'); score -= 1; }
    else { html += UI.verdict('⚖️ Hai đội cân bằng. Kết quả hoà hoặc phụ thuộc penalty/hiệp phụ.', 'warn'); }

    html += UI.section('🎯 Kết Luận Cho Bên Được Hỏi');
    if (pDay) {
      const dayGateScore = getContextualGateScore(pDay.batMon || '', 14) + getDeityScore(getEffectiveDeityName(pDay, chart)) + getContextualStarScore(pDay.thienBan || '', 14);
      html += UI.line('Điểm bên hỏi', `${dayGateScore >= 0 ? '+' : ''}${dayGateScore}`, dayGateScore > 0 ? 'good' : 'bad');
      if (dayGateScore > homeScore && dayGateScore > awayScore) { html += UI.verdict('✅ Bên được hỏi ở thế mạnh nhất trong trận — XÁC SUẤT THẮNG CAO.', 'good'); score += 2; }
      else { html += UI.verdict('⚠️ Bên được hỏi không phải thế mạnh nhất trận — XÁC SUẤT THẮNG THẤP.', 'bad'); score -= 1; }
    }

    html += UI.section('👨‍⚖️ Trọng Tài (Trực Phù)');
    if (pZF) {
      const rZF = analyzePalaceFull(pZF, 'Trực Phù (Trọng tài)', chart);
      html += rZF.html;
      const dZF = getEffectiveDeityName(pZF, chart);
      if (dZF.includes('Huyền Vũ') || dZF.includes('Đằng Xà')) { html += UI.note('🔴 Trọng tài + Huyền Vũ/Đằng Xà: Nguy cơ trọng tài thiên vị hoặc gian lận.', 'bad'); score -= 1; }
    }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 15: THI CỬ =====
  TOPIC_ANALYZERS[15] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const yearHS = getStemOf(chart, 'year');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pYear = findPalaceByHeavenlyStem(chart, yearHS);
    const pCanh = findPalaceByGate(chart, 'Cảnh');
    const pPhu = findPalaceByStarName(chart, 'Thiên Phụ');
    const pZF = getZhifuPalace(chart);

    html += UI.section('👤 Thí Sinh (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    if (pDay && isVoid(chart, pDay)) { html += UI.note('⭕ Thí sinh Không Vong: Tâm trạng trống rỗng, mất phương hướng trong phòng thi — điểm số sẽ kém.', 'bad'); score -= 3; }
    if (pDay && hasRuMu(pDay)) { html += UI.note('🪦 Thí sinh Nhập Mộ: Không thể bộc lộ hết kiến thức đã học — dưới mức thực lực.', 'bad'); score -= 2; }

    html += UI.section('📝 Đề Thi & Điểm Số (Cảnh Môn)');
    const rCanh = analyzePalaceFull(pCanh, 'Cảnh Môn (Đề thi)', chart);
    html += rCanh.html; score += rCanh.score;

    const tkCanh15 = checkTamKyAtGate(chart, 'Cảnh', 15);
    if (tkCanh15 && !isVoid(chart, tkCanh15.palace)) {
      html += UI.note(`✨ TAM KỲ tại Cảnh Môn — ${tkCanh15.tamKy.name}: ${tkCanh15.tamKy.desc} Đề thi ra đúng sở trường — cát tượng đặc biệt.`, 'good'); score += 3;
    }

    if (pCanh && pDay) {
      const rel = getRelationBetweenPalaces(pCanh, pDay, chart);
      html += UI.line('Đề thi ↔ Thí sinh', rel.label, rel.rel.includes('sinh') ? 'good' : rel.rel.includes('khac') ? 'bad' : 'neutral');
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Đề thi sinh thí sinh: TRÚNG TỦ — Bài thi ra đúng phần sở trường, làm bài rất tốt.', 'good'); score += 4; }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Thí sinh dành hết sức cho bài thi: Làm bài nghiêm túc nhưng có thể gặp câu hỏi ngoài sở trường.', 'neutral'); score += 1; }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Đề thi khắc thí sinh: BÀI KHÓ — Ra đúng phần điểm yếu, cần rất nhiều nỗ lực mới vượt qua.', 'bad'); score -= 3; }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Thí sinh khắc đề: Làm bài vất vả, cần tư duy nhiều nhưng vẫn vượt qua được.', 'neutral'); score += 1; }
      else { html += UI.note('🟡 Tỷ hòa: Bài thi ở mức độ phù hợp năng lực — kết quả phụ thuộc vào mức độ chuẩn bị.', 'neutral'); score += 1; }
      
      const canhHS = getHeavenlyStem(pCanh);
      if (canhHS && getThienCanHop(dayHS, canhHS)) {
        html += UI.note(`💫 ${getThienCanHopNote(dayHS, canhHS)} → Thí sinh và đề thi có duyên đặc biệt — đây là bài thi của số mệnh, làm bài xuất sắc.`, 'good'); score += 2;
      }
    }
    if (pCanh && isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: Làm bài lạc đề, điểm thấp, hoặc bài thi bị hủy/dời.', 'bad'); score -= 3; }
    if (pCanh && hasRuMu(pCanh)) { html += UI.note('🪦 Cảnh Môn Nhập Mộ: Điểm bị nhốt lại, có khả năng phúc tra hoặc kết quả bị treo.', 'bad'); score -= 1; }

    html += UI.section('👩‍🏫 Giám Khảo / Phòng Thi (Thiên Phụ)');
    if (pPhu) {
      const rPhu = analyzePalaceFull(pPhu, 'Thiên Phụ', chart);
      html += rPhu.html;
      if (pDay) {
        const relGK = getRelationBetweenPalaces(pPhu, pDay, chart);
        if (relGK.rel === 'a_sinh_b') { html += UI.note('🟢 Giám khảo sinh thí sinh: Người chấm bài sẽ đánh giá cao và cho điểm công bằng.', 'good'); score += 2; }
        else if (relGK.rel === 'a_khac_b') { html += UI.note('🔴 Giám khảo khắc thí sinh: Người chấm bài khắt khe, có thể bị trừ điểm nhiều hơn bình thường.', 'bad'); score -= 2; }
        const phuHS = getHeavenlyStem(pPhu);
        if (phuHS && getThienCanHop(dayHS, phuHS)) {
          html += UI.note(`💫 ${getThienCanHopNote(dayHS, phuHS)} → Thí sinh và giám khảo có duyên đặc biệt — được đánh giá công tâm và ưu ái.`, 'good'); score += 1;
        }
      }
      if (isVoid(chart, pPhu)) { html += UI.note('⭕ Thiên Phụ Không Vong: Giám thị không để ý, phòng thi có sự cố, hoặc thiếu người hướng dẫn.', 'info'); }
    }

    html += UI.section('🏫 Môi Trường Thi Cử');
    if (pZF) {
      const rZF = analyzePalaceFull(pZF, 'Trực Phù (Giám sát)', chart);
      html += rZF.html;
      const dZF = getEffectiveDeityName(pZF, chart);
      if (dZF.includes('Huyền Vũ')) { html += UI.note('🔴 Giám sát + Huyền Vũ: Coi chừng vi phạm quy chế thi, gian lận bị phát hiện.', 'bad'); score -= 2; }
    }
    if (pYear) {
      const rYear = analyzePalaceFull(pYear, `Can Năm [${yearHS}] (Trường thi)`, chart);
      html += rYear.html;
      if (pDay) {
        const relSchool = getRelationBetweenPalaces(pYear, pDay, chart);
        if (relSchool.rel === 'a_sinh_b') {
          html += UI.note('🟢 Trường thi sinh thí sinh: Trường phù hợp năng lực — có thể đậu với điểm cao.', 'good'); score += 2;
        } else if (relSchool.rel === 'a_khac_b') {
          html += UI.note('🔴 Trường thi khắc thí sinh: Ngưỡng điểm này vượt tầm — nên cân nhắc trường khác.', 'bad'); score -= 2;
        }
      }
    }

    const dCanh15 = pCanh ? getEffectiveDeityName(pCanh, chart) : '';
    if (dCanh15.includes('Trực Phù')) { html += UI.note('🟢 Trực Phù tại Cảnh Môn: Bài thi đúng theo hướng bạn đã chuẩn bị, rất cát.', 'good'); score += 1; }
    if (dCanh15.includes('Cửu Thiên')) { html += UI.note('🟢 Cửu Thiên tại Cảnh Môn: Bài thi nằm trong tầm với, làm bài xuất sắc.', 'good'); score += 1; }
    if (dCanh15.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ tại Cảnh Môn: Đề thi bí ẩn, ra ngoài chương trình — dễ làm sai.', 'bad'); score -= 1; }
    html += tinhUngKy(pCanh, chart, 'Thời điểm có kết quả thi');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 16: CHỖ ĐỖ XE =====
  TOPIC_ANALYZERS[16] = function(chart) {
    let score = 0, html = '';
    const voids = getAllVoidPalaces(chart);

    html += UI.section('🅿️ Tìm Vị Trí Đỗ Xe (Cung Không Vong)');
    if (!voids.length) {
      html += UI.note('🔴 Không tìm thấy cung Không Vong: Bãi xe hiện tại có thể đã đầy hoàn toàn. Hãy thử tìm bãi khác.', 'bad');
      score -= 2;
    } else {
      html += UI.note(`🟢 Tìm thấy ${voids.length} khu vực có chỗ trống. Ưu tiên theo thứ tự dưới đây:`, 'good');
      voids.forEach((p, idx) => {
        const name = palaceName(p.cung, chart);
        const dir = palaceDirection(p.cung, chart);
        const hanh = palaceElement(p.cung, chart);
        const gate = p.batMon || '';
        const star = p.thienBan || '';
        const prio = idx === 0 ? '⭐ Ưu tiên 1' : `${idx + 1}.`;
        html += UI.line(`${prio}: Cung ${name} (${dir})`, `${hanh} — ${gate} · ${star}`, idx === 0 ? 'good' : 'neutral');
        score += 1;
      });
      const best = voids[0];
      html += renderDirectionAdvice(best, chart, 'Khu vực bãi đỗ xe.');
    }

    html += UI.section('🚗 Tham Khảo Đường Vào Bãi Xe (Cảnh Môn)');
    const pCanh = findPalaceByGate(chart, 'Cảnh');
    if (pCanh) {
      html += UI.line('Đường vào bãi xe', `Hướng ${palaceDirection(pCanh.cung, chart)} — ${palaceName(pCanh.cung, chart)}`, isVoid(chart, pCanh) ? 'bad' : 'good');
      if (isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: Đường vào bãi bị chặn hoặc đóng cửa, tìm lối vào khác.', 'bad'); score -= 1; }
    }
    const horsePalaces = getAllPalaces(chart).filter(p => isHorse(chart, p));
    if (horsePalaces.length) {
      const dirs = horsePalaces.map(p => palaceDirection(p.cung, chart)).join(', ');
      html += UI.note(`🐎 Dịch Mã xuất hiện ở hướng ${dirs}: Xe cộ đang ra vào liên tục ở khu vực này — có thể xuất hiện chỗ trống bất ngờ.`, 'info');
    }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 17: DU LỊCH =====
  TOPIC_ANALYZERS[17] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pCanh = findPalaceByGate(chart, 'Cảnh');
    const pThuong = findPalaceByGate(chart, 'Thương');
    const pHuu = findPalaceByGate(chart, 'Hưu');
    const pKhai = findPalaceByGate(chart, 'Khai');
    const pBong = findPalaceByStarName(chart, 'Thiên Bồng');
    const pCuuThien = findPalaceByDeityName(chart, 'Cửu Thiên');

    html += UI.section('✈️ Người Du Lịch (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;

    html += UI.section('🗺️ Chuyến Đi (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Hành trình [${hourHS}]`, chart);
    html += rHour.html;
    html += renderDirectionAdvice(pHour, chart, 'Đặc điểm khu vực điểm đến.');

    if (pHour && pDay) {
      const rel = getRelationBetweenPalaces(pHour, pDay, chart);
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Chuyến đi sinh bản thân: Du lịch này sẽ bồi dưỡng sức khỏe, tinh thần sảng khoái, mở ra cơ hội mới.', 'good'); score += 3; }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Chuyến đi khắc bản thân: Dễ gặp sự cố, mệt mỏi, hoặc tốn kém nhiều hơn dự kiến.', 'bad'); score -= 2; }
    }
    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Chuyến đi Không Vong: Chuyến đi sẽ bị hủy, hoãn, hoặc không đáng như kỳ vọng.', 'bad'); score -= 3; }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Hành trình Nhập Mộ: Bị kẹt ở điểm đến, khó về hoặc gặp trở ngại nghiêm trọng.', 'bad'); score -= 2; }
    if (pHour && isHorse(chart, pHour)) { html += UI.note('🐎 Dịch Mã: Chuyến đi có nhiều điểm dừng chân, hành trình năng động.', 'good'); score += 1; }

    html += UI.section('🚘 Phương Tiện Di Chuyển');
    if (pCanh) {
      html += UI.line('Đường bộ (Cảnh Môn)', palaceSummary(pCanh, chart), isVoid(chart, pCanh) ? 'bad' : 'good');
      if (isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: Đường bộ có vấn đề — tắc đường, sự cố, hoặc cung đường bị chặn.', 'bad'); score -= 1; }
    }
    if (pHuu) { html += UI.line('Đường thủy (Hưu Môn)', palaceSummary(pHuu, chart), isVoid(chart, pHuu) ? 'bad' : 'good'); }
    if (pKhai || pCuuThien) {
      const pAir = pKhai || pCuuThien;
      html += UI.line('Hàng không (Khai/Cửu Thiên)', palaceSummary(pAir, chart), isVoid(chart, pAir) ? 'bad' : 'good');
      if (pAir && isVoid(chart, pAir)) { html += UI.note('⭕ Hàng không Không Vong: Chuyến bay có rủi ro hủy, hoãn, hoặc sự cố hành lý.', 'bad'); score -= 1; }
    }
    if (pThuong) { html += UI.line('Xe / Tàu (Thương Môn)', palaceSummary(pThuong, chart), isVoid(chart, pThuong) ? 'bad' : 'good'); }

    html += UI.section('⚠️ Rủi Ro Hành Trình');
    if (pBong) {
      if (pBong.cung === pHour?.cung || pBong.cung === pDay?.cung) {
        html += UI.note('🔴 Thiên Bồng xuất hiện trên hành trình: NGUY HIỂM — Đề phòng trộm cắp, thời tiết xấu, tai nạn giao thông, hoặc xung đột với người địa phương.', 'bad'); score -= 3;
      } else {
        html += UI.note(`Thiên Bồng ở Cung ${palaceName(pBong.cung, chart)} (${palaceDirection(pBong.cung, chart)}): Cẩn thận khu vực hướng này khi di chuyển.`, 'info'); score -= 1;
      }
    }
    const deityHour17 = pHour ? getEffectiveDeityName(pHour, chart) : '';
    if (deityHour17.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ trên hành trình: Nguy cơ mất trộm, lừa đảo tại điểm du lịch.', 'bad'); score -= 2; }
    if (deityHour17.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà: Thông tin du lịch sai lệch, đặt phòng/tour bị gian lận.', 'bad'); score -= 2; }
    if (deityHour17.includes('Thái Âm')) { html += UI.note('🟢 Thái Âm: Chuyến đi yên tĩnh, ẩn khuất — phù hợp du lịch nghỉ dưỡng, tĩnh tâm.', 'good'); score += 1; }
    if (deityHour17.includes('Lục Hợp')) { html += UI.note('🟢 Lục Hợp: Dễ kết bạn mới, gặp người có ích trong chuyến đi.', 'good'); score += 1; }
    if (deityHour17.includes('Cửu Thiên')) { html += UI.note('🟢 Cửu Thiên: Chuyến đi tầm xa, phong phú, nhiều trải nghiệm thú vị.', 'good'); score += 1; }
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Phản Ngâm: Có thể phải quay về sớm hoặc thay đổi lịch trình đột xuất.', 'info'); score -= 1; }
    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Phục Ngâm: Chuyến đi đứng yên, kẹt tại một chỗ lâu hơn dự kiến.', 'info'); score -= 1; }
    html += tinhUngKy(pHour, chart, 'Thời điểm chuyến đi diễn ra thuận lợi nhất');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 18: HÔN NHÂN =====
  TOPIC_ANALYZERS[18] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);

    const pAt = findPalaceByHeavenlyStem(chart, 'Ất');
    const pCanh = findPalaceByHeavenlyStem(chart, 'Canh');
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');
    const pBinh = findPalaceByHeavenlyStem(chart, 'Bính');
    const pDinh = findPalaceByHeavenlyStem(chart, 'Đinh');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pLH, chart, 'Lục Hợp (Hôn nhân)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('👫 Bên Nữ / Vợ (Ất trên Thiên Bàn)');
    if (pAt) {
      const rAt = analyzePalaceFull(pAt, 'Ất (Bên Nữ)', chart);
      html += rAt.html; score += rAt.score * 0.3;
      if (isVoid(chart, pAt)) { html += UI.note('⭕ Ất Không Vong: Bên nữ thiếu quyết tâm hoặc chưa thực sự sẵn sàng tiến tới.', 'bad'); score -= 2; }
      if (hasRuMu(pAt)) { html += UI.note('🪦 Ất Nhập Mộ: Bên nữ đang bị ràng buộc — có thể đang trong mối quan hệ cũ chưa kết thúc.', 'bad'); score -= 2; }
    } else {
      html += UI.note('⚠️ Không tìm thấy Ất trên thiên bàn — Bên nữ ẩn phục, khó đoán tâm ý.', 'neutral');
    }

    html += UI.section('👨 Bên Nam / Chồng (Canh trên Thiên Bàn)');
    if (pCanh) {
      const rCanh = analyzePalaceFull(pCanh, 'Canh (Bên Nam)', chart);
      html += rCanh.html; score += rCanh.score * 0.3;
      if (isVoid(chart, pCanh)) { html += UI.note('⭕ Canh Không Vong: Bên nam chưa thực tâm hoặc không đủ điều kiện xây dựng gia đình lúc này.', 'bad'); score -= 2; }
      if (hasRuMu(pCanh)) { html += UI.note('🪦 Canh Nhập Mộ: Bên nam bị phong tỏa — sự nghiệp, tài chính hoặc tình cảm đang bế tắc.', 'bad'); score -= 2; }
    } else {
      html += UI.note('⚠️ Không tìm thấy Canh trên thiên bàn — Bên nam ẩn phục, khó đoán.', 'neutral');
    }

    html += UI.section('💑 Tương Quan Hai Bên (So Sánh Qua Cung)');
    if (pAt && pCanh) {
      html += UI.note(`💫 ${getThienCanHopNote('Ất', 'Canh')} Đây là cặp đôi có thiên mệnh gắn kết.`, 'good'); score += 2;

      const relCung = getRelationBetweenPalaces(pAt, pCanh, chart);
      const hAt = getCungMeta(pAt.cung, chart).hanh;
      const hCanh = getCungMeta(pCanh.cung, chart).hanh;
      html += UI.line(
        `Cung Ất [${palaceName(pAt.cung, chart)}·${hAt}] ↔ Cung Canh [${palaceName(pCanh.cung, chart)}·${hCanh}]`,
        relCung.label,
        relCung.rel.includes('sinh') ? 'good' : relCung.rel.includes('khac') ? 'bad' : 'neutral'
      );
      score += relCung.score;

      if (pAt.cung === pCanh.cung) {
        html += UI.note('🟢✨ Ất và Canh đồng cung: Vợ chồng như hình với bóng — tình cảm keo sơn, không muốn xa rời nhau. Quẻ CỰC CÁT cho hôn nhân.', 'good'); score += 4;
      }

      // TÍCH HỢP HUNG THẦN HAI BÊN
      const atDeity = getEffectiveDeityName(pAt, chart);
      const canhDeity = getEffectiveDeityName(pCanh, chart);
      const HUNG_THAN = ['Huyền Vũ', 'Bạch Hổ', 'Đằng Xà'];
      if (atDeity && canhDeity && HUNG_THAN.some(h => atDeity.includes(h)) && HUNG_THAN.some(h => canhDeity.includes(h))) {
        html += UI.note(`🔴 Cả hai bên đều gặp Hung Thần (${atDeity} / ${canhDeity}): Quan hệ đang trong giai đoạn cực kỳ căng thẳng, có mâu thuẫn lớn hoặc thiếu niềm tin trầm trọng.`, 'bad');
        score -= 4;
      }

      const sys = chart.sys;
      if (sys && sys.NOI_BAN) {
        const atInner = sys.NOI_BAN.includes(pAt.cung);
        const canhInner = sys.NOI_BAN.includes(pCanh.cung);
        if (atInner && !canhInner) {
          html += UI.note('🟡 Ất ở Nội bàn, Canh ở Ngoại bàn: Khoảng cách địa lý hoặc tâm lý — hai bên chưa thực sự gần nhau.', 'neutral'); score -= 1;
        } else if (!atInner && canhInner) {
          html += UI.note('🟡 Canh ở Nội bàn, Ất ở Ngoại bàn: Tương tự — hai bên chưa đồng điệu hoàn toàn.', 'neutral'); score -= 1;
        }
      }
    }

    html += UI.section('💍 Sợi Dây Hôn Nhân (Lục Hợp)');
    if (pLH) {
      const rLH = analyzePalaceFull(pLH, 'Lục Hợp', chart);
      html += rLH.html;

      if (pAt && pLH.cung === pAt.cung) { html += UI.note('🟢 Lục Hợp đồng cung Ất: Bên nữ đang chủ động trong mối quan hệ — nữ muốn tiến tới hôn nhân.', 'good'); score += 2; }
      if (pCanh && pLH.cung === pCanh.cung) { html += UI.note('🟢 Lục Hợp đồng cung Canh: Bên nam đang chủ động — nam muốn tiến tới hôn nhân.', 'good'); score += 2; }
      if (isVoid(chart, pLH)) { html += UI.note('⭕ Lục Hợp Không Vong: Sợi dây hôn nhân lỏng lẻo, hôn lễ chưa thành hoặc quan hệ dễ đứt gãy.', 'bad'); score -= 3; }
      if (hasRuMu(pLH)) { html += UI.note('🪦 Lục Hợp Nhập Mộ: Hôn nhân bị phong tỏa — hôn lễ bị hoãn dài hạn hoặc quan hệ đã "chết lạnh".', 'bad'); score -= 2; }
      if (hasPattern(pLH, 'phục ngâm')) { html += UI.note('⏸️ Lục Hợp Phục Ngâm: Quan hệ trì trệ, không tiến không lùi — cần ai đó đưa ra quyết định dứt khoát.', 'info'); score -= 1; }
      if (hasPattern(pLH, 'phản ngâm')) { html += UI.note('🔄 Lục Hợp Phản Ngâm: Sắp có biến động lớn trong quan hệ — có thể chia tay đột ngột hoặc tái hợp bất ngờ.', 'info'); score -= 1; }
      if (isHorse(chart, pLH)) { html += UI.note('🐎 Lục Hợp có Dịch Mã: Hôn lễ sẽ đến nhanh chóng và bất ngờ.', 'good'); score += 1; }

      const dLH = getEffectiveDeityName(pLH, chart);
      const deityMeanings = {
        'Huyền Vũ':  { msg: '🔴 Huyền Vũ tại Lục Hợp: Có sự lừa dối trong hôn nhân — bí mật được che giấu, thiếu trung thực.', type: 'bad', sc: -3 },
        'Đằng Xà':   { msg: '🔴 Đằng Xà tại Lục Hợp: Nghi ngờ quá mức, sợ hãi không có căn cứ — thiếu niềm tin lẫn nhau.', type: 'bad', sc: -2 },
        'Bạch Hổ':   { msg: '🔴 Bạch Hổ tại Lục Hợp: Dễ xảy ra tranh cãi bạo lực, hoặc một bên gặp tai nạn.', type: 'bad', sc: -2 },
        'Câu Trận':  { msg: '🔴 Câu Trận tại Lục Hợp: Quan hệ bị ràng buộc, ứ đọng — không tiến không lui.', type: 'bad', sc: -1 },
        'Chu Tước':  { msg: '🔴 Chu Tước tại Lục Hợp: Hay cãi vã, lời nói gây tổn thương — khẩu chiến liên miên.', type: 'bad', sc: -1 },
        'Trực Phù':  { msg: '🟢 Trực Phù tại Lục Hợp: Hôn nhân được gia đình và xã hội công nhận mạnh mẽ.', type: 'good', sc: 2 },
        'Thái Âm':   { msg: '🟢 Thái Âm tại Lục Hợp: Hôn nhân êm ấm, kín đáo — bên nữ có vai trò nền tảng vững chắc.', type: 'good', sc: 1 },
        'Cửu Thiên': { msg: '🟢 Cửu Thiên tại Lục Hợp: Hôn nhân diễn ra nhanh chóng, bất ngờ.', type: 'good', sc: 1 },
        'Cửu Địa':   { msg: '🟢 Cửu Địa tại Lục Hợp: Hôn nhân chậm mà chắc, cần thời gian nhưng bền vững lâu dài.', type: 'good', sc: 1 }
      };
      for (const [k, v] of Object.entries(deityMeanings)) {
        if (dLH && dLH.includes(k)) { html += UI.note(v.msg, v.type); score += v.sc; break; }
      }
    } else {
      html += UI.note('⚠️ Lục Hợp ẩn phục: Sợi dây hôn nhân không rõ ràng — quan hệ mơ hồ, chưa có cam kết thực sự.', 'neutral'); score -= 1;
    }

    html += UI.section('⚠️ Kiểm Tra Người Thứ Ba');
    let thirdCount = 0;

    if (pBinh) {
      const dBinh = getEffectiveDeityName(pBinh, chart);
      const nearFemale = pAt && (pBinh.cung === pAt.cung);
      const suspectDeity = dBinh.includes('Huyền Vũ') || dBinh.includes('Thái Âm') || dBinh.includes('Lục Hợp');
      const notVoid = !isVoid(chart, pBinh);
      if (notVoid && !hasRuMu(pBinh) && (nearFemale || suspectDeity)) {
        html += UI.note(
          `🔴 Bính (người đàn ông thứ ba) xuất hiện${nearFemale ? ' đồng cung với Ất' : ' với dấu hiệu ẩn khuất'}:
          Nghi ngờ có quan hệ ngoài hôn nhân từ phía nam giới. Thần đi cùng: ${dBinh || '—'}.`,
          'bad'
        );
        score -= 3; thirdCount++;
      }
    }

    if (pDinh) {
      const dDinh = getEffectiveDeityName(pDinh, chart);
      const nearMale = pCanh && (pDinh.cung === pCanh.cung);
      const suspectDeity = dDinh.includes('Huyền Vũ') || dDinh.includes('Thái Âm') || dDinh.includes('Lục Hợp');
      const notVoid = !isVoid(chart, pDinh);
      if (notVoid && !hasRuMu(pDinh) && (nearMale || suspectDeity)) {
        html += UI.note(
          `🔴 Đinh (người phụ nữ thứ ba) xuất hiện${nearMale ? ' đồng cung với Canh' : ' với dấu hiệu ẩn khuất'}:
          Nghi ngờ có quan hệ ngoài hôn nhân từ phía nữ giới. Thần đi cùng: ${dDinh || '—'}.`,
          'bad'
        );
        score -= 3; thirdCount++;
      }
    }

    if (pAt && (pAt.anCan === 'Bính' || pAt.anCan === 'Đinh')) {
      html += UI.note(`🔴 Bên Nữ có Ẩn can [${pAt.anCan}]: Dấu hiệu ngoại tình tư tưởng hoặc có người thứ 3 giấu mặt rất kỹ.`, 'bad');
      score -= 2; thirdCount++;
    }
    if (pCanh && (pCanh.anCan === 'Bính' || pCanh.anCan === 'Đinh')) {
      html += UI.note(`🔴 Bên Nam có Ẩn can [${pCanh.anCan}]: Dấu hiệu ngoại tình tư tưởng hoặc có người thứ 3 giấu mặt rất kỹ.`, 'bad');
      score -= 2; thirdCount++;
    }

    if (thirdCount === 0) {
      html += UI.note('🟢 Không phát hiện dấu hiệu người thứ ba rõ ràng. Quan hệ tương đối trong sạch.', 'good'); score += 1;
    }

    html += UI.section('🔮 Tín Hiệu Đặc Biệt Bát Thần');
    if (pAt) {
      const dAt = getEffectiveDeityName(pAt, chart);
      if (dAt.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ tại cung Ất: Bên nữ đang che giấu điều gì đó — thiếu minh bạch.', 'bad'); score -= 2; }
      if (dAt.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà tại cung Ất: Bên nữ hay lo lắng, nghi ngờ, dễ tưởng tượng tiêu cực.', 'bad'); score -= 1; }
      if (dAt.includes('Trực Phù')) { html += UI.note('🟢 Trực Phù tại cung Ất: Bên nữ đang ở thế mạnh, tự tin — chủ động định hướng mối quan hệ.', 'good'); score += 1; }
      if (dAt.includes('Thái Âm')) { html += UI.note('🟢 Thái Âm tại cung Ất: Bên nữ kín đáo, sâu sắc — tình cảm chân thật nhưng ít bộc lộ.', 'good'); score += 1; }
    }
    if (pCanh) {
      const dCanh18 = getEffectiveDeityName(pCanh, chart);
      if (dCanh18.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ tại cung Canh: Bên nam đang che giấu điều gì đó — thiếu trung thực.', 'bad'); score -= 2; }
      if (dCanh18.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà tại cung Canh: Bên nam hay lo lắng hoặc có mưu toan ẩn.', 'bad'); score -= 1; }
      if (dCanh18.includes('Cửu Thiên')) { html += UI.note('🟢 Cửu Thiên tại cung Canh: Bên nam có chí tiến thủ, tự tin — hôn nhân mang lại địa vị xã hội tốt.', 'good'); score += 1; }
      if (dCanh18.includes('Bạch Hổ')) { html += UI.note('🔴 Bạch Hổ tại cung Canh: Bên nam dễ nóng giận, cứng nhắc — dễ xảy ra xung đột trong gia đình.', 'bad'); score -= 1; }
    }

    html += UI.section('📅 Thời Điểm Hôn Lễ');
    if (pLH && isHorse(chart, pLH)) { html += UI.note('🐎 Lục Hợp có Dịch Mã: Hôn lễ đến rất gần, nhanh chóng và bất ngờ.', 'good'); score += 1; }
    if (pAt && isHorse(chart, pAt)) { html += UI.note('🐎 Ất có Dịch Mã: Bên nữ đang muốn nhanh chóng tiến tới hôn nhân.', 'info'); score += 1; }
    if (pCanh && isHorse(chart, pCanh)) { html += UI.note('🐎 Canh có Dịch Mã: Bên nam đang biến chuyển lớn — hoặc chuẩn bị cầu hôn, hoặc có kế hoạch đi xa.', 'info'); }
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Toàn cục Phản Ngâm: Quan hệ sắp có bước ngoặt quyết định — chia tay hoặc kết hôn.', 'info'); score -= 1; }
    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Toàn cục Phục Ngâm: Hôn nhân trì trệ, khó tiến lên — cần thay đổi cách tiếp cận.', 'info'); score -= 1; }
    html += tinhUngKy(pLH, chart, 'Thời điểm cưới hỏi / chốt quan hệ');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 19: SINH NỞ (GIỚI TÍNH) =====
  TOPIC_ANALYZERS[19] = function(chart) {
    let score = 0, html = '';
    const pKhon = getPalace(chart, 2);

    html += UI.section('👶 Xác Định Giới Tính Em Bé (Cung Khôn)');
    const rKhon = analyzePalaceFull(pKhon, 'Cung Khôn (Người Mẹ)', chart);
    html += rKhon.html;
    if (!pKhon) {
      html += UI.note('🔴 Không tìm thấy Cung Khôn — không thể luận giới tính.', 'bad');
      return { html, score: 0 };
    }

    const gate = pKhon.batMon || '';
    const star = pKhon.thienBan || '';
    const hs = getHeavenlyStem(pKhon);
    const deity = getEffectiveDeityName(pKhon, chart);

    const yangGates = ['Khai','Sinh','Thương','Đỗ'];
    const yinGates = ['Hưu','Cảnh','Tử','Kinh'];
    const yangStars = ['Thiên Xung','Thiên Phụ','Thiên Anh','Thiên Tâm','Thiên Cầm'];
const yinStars  = ['Thiên Bồng','Thiên Nhuế','Thiên Trụ','Thiên Nhậm'];  // ← THÊM DÒNG NÀY
const yangStems = ['Giáp','Bính','Mậu','Canh','Nhâm'];
const yinStems  = ['Ất','Đinh','Kỷ','Tân','Quý'];
const yangDeities = ['Trực Phù','Cửu Thiên','Lục Hợp'];
const yinDeities  = ['Thái Âm','Cửu Địa','Huyền Vũ'];

    let yangCount = 0, yinCount = 0, evidences = [];
    if (yangGates.includes(normalizeGateName(gate))) { yangCount++; evidences.push(`Bát Môn Dương [${gate}]`); }
    else if (yinGates.includes(normalizeGateName(gate))) { yinCount++; evidences.push(`Bát Môn Âm [${gate}]`); }
    if (yangStars.some(s => star.includes(s))) { yangCount++; evidences.push(`Sao Dương [${star}]`); }
    else if (yinStars.some(s => star.includes(s))) { yinCount++; evidences.push(`Sao Âm [${star}]`); }
    if (yangStems.includes(hs)) { yangCount++; evidences.push(`Thiên Can Dương [${hs}]`); }
    else if (yinStems.includes(hs)) { yinCount++; evidences.push(`Thiên Can Âm [${hs}]`); }
    if (yangDeities.some(d => deity.includes(d))) { yangCount++; evidences.push(`Bát Thần Dương [${deity}]`); }
    else if (yinDeities.some(d => deity.includes(d))) { yinCount++; evidences.push(`Bát Thần Âm [${deity}]`); }

    html += UI.section('🔬 Phân Tích Âm Dương');
    html += UI.line('Yếu tố Dương (Trai)', `${yangCount} chỉ dấu`, yangCount > yinCount ? 'good' : 'neutral');
    html += UI.line('Yếu tố Âm (Gái)', `${yinCount} chỉ dấu`, yinCount > yangCount ? 'good' : 'neutral');
    if (evidences.length) {
      html += UI.line('Chi tiết', evidences.join(' | '), 'info');
    }

    const confidence = Math.abs(yangCount - yinCount);
    const confidenceLabel = confidence === 0 ? 'Rất khó đoán (50/50)' : confidence === 1 ? 'Có xu hướng nhẹ' : confidence === 2 ? 'Tương đối chắc' : 'Khá chắc chắn';
    if (yangCount > yinCount) {
      html += UI.verdict(`👦 Dự đoán: BÉ TRAI (Dương mạnh hơn ${yangCount} vs ${yinCount}). ${confidenceLabel}.`, yangCount >= 3 ? 'good' : 'neutral'); score += 1;
    } else if (yinCount > yangCount) {
      html += UI.verdict(`👧 Dự đoán: BÉ GÁI (Âm mạnh hơn ${yinCount} vs ${yangCount}). ${confidenceLabel}.`, yinCount >= 3 ? 'good' : 'neutral'); score += 1;
    } else {
      html += UI.verdict('🤔 Không thể kết luận — Âm Dương ngang nhau (50/50). Cần kết hợp thêm phương pháp khác.', 'neutral');
    }

    html += UI.section('🏥 Tình Trạng Thai Nhi');
    if (isVoid(chart, pKhon)) {
      html += UI.note('⭕ Cung Khôn Không Vong: Thai nhi có dấu hiệu không ổn định — nên khám thai kỹ lưỡng.', 'bad'); score -= 2;
    } else {
      html += UI.note('🟢 Cung Khôn ổn định: Thai kỳ nhìn chung bình thường.', 'good'); score += 1;
    }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 20: SINH NỞ (AN TOÀN) =====
  TOPIC_ANALYZERS[20] = function(chart) {
    let score = 0, html = '';
    const pKhon = getPalace(chart, 2);
    const pNhue = findPalaceByStarName(chart, 'Thiên Nhuế');

    html += UI.section('👩‍🍼 Người Mẹ & Em Bé (Cung Khôn)');
    const rKhon = analyzePalaceFull(pKhon, 'Cung Khôn', chart);
    html += rKhon.html;
    if (pKhon) {
      const gate = pKhon.batMon || '';
      const deity = getEffectiveDeityName(pKhon, chart);
      if (deity.includes('Bạch Hổ')) { html += UI.note('⚡ Bạch Hổ tại Cung Khôn: Sinh nhanh nhưng có nguy cơ băng huyết hoặc biến chứng cấp tính — cần chuẩn bị kỹ.', 'bad'); score -= 1; }
      if (normalizeGateName(gate) === 'Tử') { html += UI.note('🔴 Tử Môn tại Cung Khôn: Sinh đẻ nguy hiểm — cần mổ lấy thai hoặc can thiệp y tế khẩn cấp.', 'bad'); score -= 3; }
      if (normalizeGateName(gate) === 'Sinh') { html += UI.note('🟢 Sinh Môn tại Cung Khôn: Sinh đẻ thuận lợi, mẹ tròn con vuông.', 'good'); score += 3; }
      if (normalizeGateName(gate) === 'Khai') { html += UI.note('🟢 Khai Môn tại Cung Khôn: Ca sinh kết quả tốt đẹp, thông thoáng.', 'good'); score += 2; }
      if (hasPattern(pKhon, 'phục ngâm')) { html += UI.note('⏸️ Cung Khôn Phục Ngâm: Sinh lâu, trở dạ kéo dài, khó sinh — cần bác sĩ theo dõi sát.', 'bad'); score -= 2; }
      if (hasPattern(pKhon, 'phản ngâm')) { html += UI.note('🔄 Phản Ngâm tại Cung Khôn: Có thể phải mổ lấy thai đột xuất.', 'bad'); score -= 1; }
      if (isVoid(chart, pKhon)) { html += UI.note('⭕ Cung Khôn Không Vong: Thai kỳ có biến động, đặc biệt chú ý giai đoạn cuối thai kỳ.', 'bad'); score -= 2; }
    }

    html += UI.section('🌡️ Thiên Nhuế (Đánh Giá Sức Khỏe Mẹ)');
    if (pNhue) {
      const rNhue = analyzePalaceFull(pNhue, 'Thiên Nhuế', chart);
      html += rNhue.html;
      if (pKhon) {
        html += UI.section('⚖️ Tương Quan Mẹ ↔ Bé');
        const rel = getRelationBetweenPalaces(pNhue, pKhon, chart);
        html += UI.line('Thiên Nhuế (Mẹ) ↔ Cung Khôn (Bé)', rel.label, rel.rel.includes('khac') ? 'good' : 'neutral');
        if (rel.rel === 'a_khac_b') { html += UI.note('🟢 Mẹ khắc Bé: CA SINH AN TOÀN — Mẹ đủ sức kiểm soát, con ra đời thuận lợi.', 'good'); score += 3; }
        else if (rel.rel === 'b_khac_a') { html += UI.note('🔴 Bé khắc Mẹ: NGUY HIỂM CHO MẸ — Sinh đẻ vất vả, nguy cơ biến chứng ảnh hưởng tính mạng mẹ. Cần sinh ở cơ sở y tế có chuyên khoa.', 'bad'); score -= 4; }
        else if (rel.rel === 'a_sinh_b') { html += UI.note('🟡 Mẹ sinh Bé: Ca sinh kéo dài, mẹ mất sức nhiều — vẫn an toàn nhưng cần hỗ trợ.', 'neutral'); score -= 1; }
        else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Bé sinh Mẹ: Bé mạnh khỏe, nhưng mẹ cần phục hồi lâu hơn sau sinh.', 'neutral'); score += 1; }
      }
      if (isVoid(chart, pNhue)) { html += UI.note('⭕ Thiên Nhuế Không Vong: Sức khỏe mẹ đang ổn, ít nguy hiểm.', 'good'); score += VOID_WEIGHT.benhNhe; }
    }

    html += UI.section('🏥 Cơ Sở Y Tế (Thiên Xung)');
    const pXung20 = findPalaceByStarName(chart, 'Thiên Xung');
    if (pXung20) {
      const rXung = analyzePalaceFull(pXung20, 'Thiên Xung (Bệnh viện)', chart);
      html += rXung.html;
      if (pKhon) {
        const relHosp = getRelationBetweenPalaces(pXung20, pKhon, chart);
        if (relHosp.rel === 'a_sinh_b') { html += UI.note('🟢 Bệnh viện sinh trợ ca sinh: Đội ngũ y tế phù hợp, can thiệp kịp thời.', 'good'); score += 2; }
        else if (relHosp.rel === 'a_khac_b') { html += UI.note('🔴 Bệnh viện khắc cung sinh: Cơ sở y tế này không phù hợp — cân nhắc chọn bệnh viện khác.', 'bad'); score -= 2; }
      }
      if (isVoid(chart, pXung20)) { html += UI.note('⭕ Bệnh viện Không Vong: Đội ngũ y tế không đủ sẵn sàng trong thời điểm này.', 'bad'); score -= 1; }
    }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 21: SỨC KHỎE =====
  TOPIC_ANALYZERS[21] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pNhue = findPalaceByStarName(chart, 'Thiên Nhuế');
    const pTam = findPalaceByStarName(chart, 'Thiên Tâm');
    const pXung = findPalaceByStarName(chart, 'Thiên Xung');
    const pZS = getZhishiPalace(chart);
    const pSinh = findPalaceByGate(chart, 'Sinh');
    const pTu = findPalaceByGate(chart, 'Tu') || findPalaceByGate(chart, 'Tử');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pNhue, chart, 'Thiên Nhuế (Bệnh)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    const MAP_BODY = {
      'Giáp':'Đầu, gan, túi mật','Ất':'Gan, túi mật, thực quản, cổ họng, thần kinh',
      'Bính':'Ruột non, môi, vai, trán (viêm)','Đinh':'Răng, tim, mắt',
      'Mậu':'Cơ bụng, bao tử, mũi','Kỷ':'Mắt, tỳ tạng, miệng, bụng',
      'Canh':'Xương, sườn, ruột già','Tân':'Phổi, phế quản, ngực, cổ',
      'Nhâm':'Tim mạch, bàng quang, máu','Quý':'Thần kinh, chân, thận'
    };

    html += UI.section('🧑 Người Bệnh (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Người bệnh [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    if (pDay && isVoid(chart, pDay)) { html += UI.note('⭕ Người bệnh Không Vong: Sức lực cạn kiệt, bệnh khó chữa hoặc bệnh nhân bỏ điều trị.', 'bad'); score -= 2; }
    if (MAP_BODY[dayHS]) html += UI.line(`Bộ phận liên quan (Can Ngày ${dayHS})`, MAP_BODY[dayHS], 'info');

    html += UI.section('🔬 Nguyên Nhân Bệnh (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Can Giờ [${hourHS}] (Nguyên nhân)`, chart);
    html += rHour.html;
    if (MAP_BODY[hourHS]) html += UI.line(`Bộ phận nguyên nhân [${hourHS}]`, MAP_BODY[hourHS], 'info');

    html += UI.section('🌡️ Bệnh Tình (Thiên Nhuế)');
    const rNhue = analyzePalaceFull(pNhue, 'Thiên Nhuế (Bệnh)', chart);
    html += rNhue.html;

    if (pNhue && pDay) {
      const rel = getRelationBetweenPalaces(pNhue, pDay, chart);
      html += UI.line('Bệnh ↔ Người bệnh', rel.label, rel.rel === 'a_khac_b' ? 'bad' : rel.rel === 'b_khac_a' ? 'good' : 'neutral');
      if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Bệnh khắc Người: Bệnh đang tấn công mạnh, diễn biến xấu nhanh — KHẨN CẤP CẦU CỨU Y TẾ.', 'bad'); score -= 4; }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟢 Người khắc Bệnh: Cơ thể đang kháng cự tốt, trên đà phục hồi.', 'good'); score += 3; }
      else if (rel.rel === 'a_sinh_b') { html += UI.note('🔴 Bệnh sinh Người (nuôi dưỡng ngược): Bệnh ăn sâu, trở thành mãn tính.', 'bad'); score -= 2; }
      else if (rel.rel === 'b_sinh_a') { html += UI.note('🟡 Người tương sinh bệnh: Bệnh dai dẳng, ổn định nhưng khó dứt điểm.', 'neutral'); score -= 1; }
    }
    if (pNhue && isVoid(chart, pNhue)) { html += UI.note('⭕ Thiên Nhuế Không Vong: Bệnh giả hoặc mới chớm — dễ chữa, không đáng lo ngại.', 'good'); score += VOID_WEIGHT.benhNhe; }
    if (pNhue && hasRuMu(pNhue)) { html += UI.note('🪦 Thiên Nhuế Nhập Mộ: Bệnh ẩn sâu, khó chẩn đoán — cần xét nghiệm chuyên sâu.', 'bad'); score -= 1; }

    html += UI.section('💊 Phương Án Điều Trị');
    if (pTam) {
      const rTam = analyzePalaceFull(pTam, 'Thiên Tâm (Tây Y / Bác Sĩ)', chart);
      html += rTam.html;
      if (pNhue && pTam) {
        const relTreat = getRelationBetweenPalaces(pTam, pNhue, chart);
        if (relTreat.rel === 'a_khac_b') { html += UI.note('🟢 Thuốc/bác sĩ khắc bệnh: Gặp đúng thầy đúng thuốc — điều trị dứt điểm.', 'good'); score += 2; }
        else { html += UI.note('🟡 Thuốc chưa khắc được bệnh: Cân nhắc đổi phác đồ hoặc kết hợp Đông y.', 'neutral'); score -= 1; }
      }
      if (isVoid(chart, pTam)) { html += UI.note('⭕ Thiên Tâm Không Vong: Bác sĩ/phương pháp tây y hiện tại chưa hiệu quả.', 'bad'); score -= 1; }
    }
    if (pXung) {
      html += UI.line('Cơ Sở Y Tế (Thiên Xung)', palaceSummary(pXung, chart), isVoid(chart, pXung) ? 'bad' : 'good');
      if (isVoid(chart, pXung)) { html += UI.note('⭕ Thiên Xung Không Vong: Bệnh viện/phòng khám này không phù hợp — nên chuyển viện.', 'bad'); score -= 1; }
    }
    const pAt21 = findPalaceByHeavenlyStem(chart, 'Ất');
    if (pAt21) {
      html += UI.line('Đông Y (Ất)', palaceSummary(pAt21, chart), isVoid(chart, pAt21) ? 'bad' : 'good');
      if (isVoid(chart, pAt21)) { html += UI.note('⭕ Ất Không Vong: Đông y, thuốc nam, châm cứu ít hiệu quả lúc này.', 'bad'); }
      else { html += UI.note('🟢 Ất tốt: Đông y hoặc liệu pháp tự nhiên có thể hỗ trợ phục hồi tốt.', 'good'); score += 1; }
    }

    html += UI.section('📈 Tiên Lượng Hồi Phục');
    if (pZS) {
      html += UI.line('Trực Sử (Tốc độ phục hồi)', palaceSummary(pZS, chart), 'info');
      if (isVoid(chart, pZS)) { html += UI.note('⭕ Trực Sử Không Vong: Thời gian hồi phục không xác định, kéo dài.', 'bad'); score -= 1; }
      if (hasRuMu(pZS)) { html += UI.note('🪦 Trực Sử Nhập Mộ: Hồi phục cực kỳ chậm, có thể trở thành bệnh mãn tính.', 'bad'); score -= 2; }
    }
    if (pDay && pSinh && pDay.cung === pSinh.cung) { html += UI.note('🟢 Bản thân đồng cung Sinh Môn: Sinh lực mạnh, phục hồi nhanh chóng.', 'good'); score += 3; }
    if (pDay && pTu && pDay.cung === pTu.cung) { html += UI.note('🔴 Bản thân đồng cung Tử Môn: Bệnh nặng, hồi phục rất chậm và khó khăn.', 'bad'); score -= 3; }

    html += UI.section('🔬 Chỉ Dấu Đặc Biệt');
    const pDinh21 = findPalaceByHeavenlyStem(chart, 'Đinh');
    const pKhai21 = findPalaceByGate(chart, 'Khai');
    const pMau21 = findPalaceByHeavenlyStem(chart, 'Mậu');
    const pBinh21 = findPalaceByHeavenlyStem(chart, 'Bính');
    const pNhamQuy21 = findPalaceByHeavenlyStem(chart, 'Nhâm') || findPalaceByHeavenlyStem(chart, 'Quý');
    if (pDinh21 && pKhai21 && pDinh21.cung === pDay?.cung) { html += UI.note('⚕️ Đinh + Khai Môn đồng cung người bệnh: Dấu hiệu đã hoặc sắp phẫu thuật.', 'bad'); score -= 1; }
    if (pMau21 && (hasRuMu(pMau21) || isVoid(chart, pMau21))) { html += UI.note('⚠️ Mậu/Kỷ bất thường: Nghi ngờ u bướu, nang, sẹo tiềm ẩn — cần siêu âm kiểm tra.', 'bad'); score -= 1; }
    if (pBinh21 && pBinh21.cung === pDay?.cung) { html += UI.note('🌡️ Bính đồng cung người bệnh: Có dấu hiệu viêm nhiễm, sốt.', 'bad'); score -= 1; }
    if (pNhamQuy21 && getEffectiveDeityName(pNhamQuy21, chart).includes('Bạch Hổ')) { html += UI.note('🩸 Nhâm/Quý + Bạch Hổ: Vấn đề về máu huyết, huyết áp hoặc chấn thương.', 'bad'); score -= 1; }
    html += tinhUngKy(pNhue, chart, 'Thời điểm bệnh có chuyển biến lớn');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 22: KIỆN TỤNG =====
  TOPIC_ANALYZERS[22] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const dayHS = getStemOf(chart, 'day');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pKhai = findPalaceByGate(chart, 'Khai');
    const pCanh = findPalaceByGate(chart, 'Cảnh');
    const pDo = findPalaceByGate(chart, 'Đỗ');
    const pKinh = findPalaceByGate(chart, 'Kinh');
    const pZF = getZhifuPalace(chart);
    const pTS = getZhishiPalace(chart);
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');
    const pDinh = findPalaceByHeavenlyStem(chart, 'Đinh');
    const pBinh22 = findPalaceByHeavenlyStem(chart, 'Bính');
    let pThaiTue = chart?.thaiTue?.cung ? getPalace(chart, chart.thaiTue.cung) : null;

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pKhai, chart, 'Khai Môn (Quan tòa)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🧑 Người Hỏi (Can Ngày)');
    const rDay = analyzePalaceFull(pDay, `Can Ngày [${dayHS}]`, chart);
    html += rDay.html; score += rDay.score;
    html += getChuKhachAdvice(pDay);

    html += UI.section('⚖️ Quan Tòa / Phán Quyết Sơ Thẩm (Khai Môn)');
    const rKhai = analyzePalaceFull(pKhai, 'Khai Môn (Quan Tòa)', chart);
    html += rKhai.html;
    if (pKhai && pDay) {
      const rel = getRelationBetweenPalaces(pKhai, pDay, chart);
      score += rel.score;
      if (rel.rel === 'a_sinh_b') { html += UI.note('🟢 Tòa ủng hộ bên này: Phán quyết có lợi — XÁC SUẤT THẮNG KIỆN CAO.', 'good'); }
      else if (rel.rel === 'a_khac_b') { html += UI.note('🔴 Tòa bất lợi cho bên này: Phán quyết nghiêng về phía đối phương.', 'bad'); }
      else if (rel.rel === 'b_khac_a') { html += UI.note('🟡 Bên này đang tác động lên tòa: Có thể vận động được nhưng cần thêm bằng chứng.', 'info'); }
    }
    if (pKhai && isVoid(chart, pKhai)) { html += UI.note('⭕ Khai Môn Không Vong: Thiếu chứng cứ, tòa chưa thể phân xử — vụ kiện bị treo.', 'bad'); score += getVoidScore(pKhai, chart, 'coHoi'); }
    if (pKhai && hasRuMu(pKhai)) { html += UI.note('🪦 Khai Môn Nhập Mộ: Phiên tòa bị hoãn vô thời hạn.', 'bad'); score -= 2; }
    if (pKhai && hasPattern(pKhai, 'phục ngâm')) { html += UI.note('⏸️ Khai Môn Phục Ngâm: Vụ kiện kéo dài nhiều năm không có hồi kết.', 'bad'); score -= 2; }
    if (pKhai && hasPattern(pKhai, 'phản ngâm')) { html += UI.note('🔄 Khai Môn Phản Ngâm: Phiên tòa bị dời ngày, thay đổi thẩm phán hoặc địa điểm.', 'info'); score -= 1; }

    if (pThaiTue) {
      html += UI.section('🏛️ Tòa Phúc Thẩm / Tối Cao (Thái Tuế)');
      const rTT = analyzePalaceFull(pThaiTue, 'Thái Tuế', chart);
      html += rTT.html;
      if (pDay) {
        const relTT = getRelationBetweenPalaces(pThaiTue, pDay, chart);
        if (relTT.rel === 'a_khac_b') { html += UI.note('🔴 Thái Tuế khắc bản thân: NGUY HIỂM! Nếu thắng sơ thẩm mà đối phương kháng cáo lên phúc thẩm, bạn sẽ thua.', 'bad'); score -= 3; }
        else if (relTT.rel === 'a_sinh_b') { html += UI.note('🟢 Thái Tuế sinh bản thân: Bản án cuối cùng sẽ bảo vệ bạn tuyệt đối dù có kháng cáo.', 'good'); score += 3; }
      }
    }

    html += UI.section('📋 Đơn Khởi Kiện (Cảnh Môn)');
    const rCanhKT = analyzePalaceFull(pCanh, 'Cảnh Môn (Đơn kiện)', chart);
    html += rCanhKT.html;
    if (pKhai && pCanh) {
      const relKC = getRelationBetweenPalaces(pKhai, pCanh, chart);
      if (relKC.rel === 'a_khac_b') { html += UI.note('🔴 Tòa khắc Đơn kiện: ĐƠN BỊ BÁC — Tòa không thụ lý hoặc trả đơn.', 'bad'); score -= 3; }
      else if (relKC.rel === 'a_sinh_b') { html += UI.note('🟢 Tòa chấp nhận đơn: Vụ kiện được thụ lý chính thức.', 'good'); score += 2; }
    }
    if (pCanh && isVoid(chart, pCanh)) { html += UI.note('⭕ Cảnh Môn Không Vong: Đơn kiện thiếu căn cứ pháp lý hoặc có nội dung không trung thực.', 'bad'); score += getVoidScore(pCanh, chart, 'phapLy'); }
    const dCanh22 = pCanh ? getEffectiveDeityName(pCanh, chart) : '';
    if (dCanh22.includes('Huyền Vũ') || dCanh22.includes('Đằng Xà')) { html += UI.note('🔴 Cảnh Môn + Huyền Vũ/Đằng Xà: Nội dung đơn kiện có thể sai sự thật hoặc bị làm giả.', 'bad'); score -= 2; }

    html += UI.section('🔍 Bằng Chứng & Nhân Chứng (Lục Hợp)');
    const rLH22 = analyzePalaceFull(pLH, 'Lục Hợp (Bằng chứng)', chart);
    html += rLH22.html;
    if (pLH && isVoid(chart, pLH)) { html += UI.note('⭕ Lục Hợp Không Vong: Bằng chứng không đủ, nhân chứng không đáng tin — hồ sơ yếu.', 'bad'); score -= 2; }
    if (pLH && hasRuMu(pLH)) { html += UI.note('🪦 Lục Hợp Nhập Mộ: Bằng chứng bị phong tỏa, nhân chứng từ chối hợp tác.', 'bad'); score -= 2; }
    if (pLH && !isVoid(chart, pLH) && !hasRuMu(pLH)) { html += UI.note('🟢 Lục Hợp tốt: Có bằng chứng rõ ràng và nhân chứng hợp tác.', 'good'); score += 2; }

    html += UI.section('👨‍⚖️ Luật Sư (Kinh Môn)');
    if (pKinh) {
      const rKinh = analyzePalaceFull(pKinh, 'Kinh Môn (Luật sư)', chart);
      html += rKinh.html;
      if (isVoid(chart, pKinh)) { html += UI.note('⭕ Kinh Môn Không Vong: Luật sư thiếu năng lực hoặc không nhiệt tình với vụ kiện.', 'bad'); score -= 1; }
      else { html += UI.note('🟢 Luật sư có thực lực, hỗ trợ tốt cho vụ kiện.', 'good'); score += 1; }
    }

    html += UI.section('🏛️ Viện Kiểm Sát (Đỗ Môn)');
    if (pDo) { const rDo22 = analyzePalaceFull(pDo, 'Đỗ Môn (Viện kiểm sát)', chart); html += rDo22.html; }

    html += UI.section('📁 Giấy Tờ & Bằng Chứng Số');
    if (pDinh) {
      html += UI.line('Đinh (Giấy tờ / lệnh triệu tập)', palaceSummary(pDinh, chart), isVoid(chart, pDinh) ? 'bad' : 'good');
      if (isVoid(chart, pDinh)) { html += UI.note('⭕ Đinh Không Vong: Giấy tờ pháp lý thiếu sót, lệnh triệu tập không hợp lệ.', 'bad'); score -= 1; }
    }
    if (pBinh22) {
      html += UI.line('Bính (Bằng chứng hình ảnh/video)', palaceSummary(pBinh22, chart), isVoid(chart, pBinh22) ? 'bad' : 'good');
      if (isVoid(chart, pBinh22)) { html += UI.note('⭕ Bính Không Vong: Bằng chứng hình ảnh không rõ ràng hoặc đã bị xóa.', 'bad'); score -= 1; }
      else { html += UI.note('🟢 Có bằng chứng hình ảnh/video rõ ràng — lợi thế lớn trong phiên tòa.', 'good'); score += 1; }
    }

    html += UI.section('⚔️ Thế Lực Hai Phía');
    if (pZF) {
      const rZF22 = analyzePalaceFull(pZF, 'Trực Phù (Nguyên cáo)', chart);
      html += rZF22.html;
      if (pDay && pZF && pDay.cung === pZF.cung) { html += UI.note('🟢 Bạn là Nguyên cáo — đang ở thế chủ động trong vụ kiện.', 'good'); score += 1; }
    }
    if (pTS) {
      const rTS22 = analyzePalaceFull(pTS, 'Trực Sử (Bị cáo)', chart);
      html += rTS22.html;
      if (isVoid(chart, pTS)) { html += UI.note('⭕ Bị cáo Không Vong: Đối phương thiếu thực lực bào chữa — lợi thế cho bên khởi kiện.', 'good'); score += 1; }
    }
    html += tinhUngKy(pKhai, chart, 'Thời điểm tòa án mở phiên xét xử / ra phán quyết');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 23: TỐ TỤNG HÌNH SỰ =====
  TOPIC_ANALYZERS[23] = function(chart) {
    let score = 0, html = '';
    html += renderCucAdvice(chart);
    const pTan = findPalaceByHeavenlyStem(chart, 'Tân');
    const pMau = findPalaceByHeavenlyStem(chart, 'Mậu');
    const monthHS = getStemOf(chart, 'month');
    const pMonth = findPalaceByHeavenlyStem(chart, monthHS);
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pTan, chart, 'Tân (Tội phạm)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🚔 Tội Phạm / Nghi Phạm (Tân)');
    if (!pTan) {
      html += UI.note('Không xác định được vị trí Tân — nghi phạm đang ẩn mình hoặc chưa lộ diện.', 'neutral');
      return { html, score: 0 };
    }
    const rTan = analyzePalaceFull(pTan, 'Tân (Tội phạm)', chart);
    html += rTan.html;

    html += UI.section('📋 Loại Tội Danh & Hành Vi');
    const deityTan = getEffectiveDeityName(pTan, chart);
    const gateTan = pTan.batMon || '';
    if (deityTan.includes('Huyền Vũ')) { html += UI.note('💰 Huyền Vũ: Tội danh liên quan đến TRỘM CẮP, THAM Ô, CHIẾM ĐOẠT tài sản.', 'bad'); score -= 2; }
    if (deityTan.includes('Đằng Xà')) { html += UI.note('🎭 Đằng Xà: Tội danh LỪA ĐẢO, GIẢ MẠO, GIAN LẬN tài chính.', 'bad'); score -= 2; }
    if (deityTan.includes('Bạch Hổ')) { html += UI.note('⚔️ Bạch Hổ: Tội danh BẠO LỰC, CỐ Ý GÂY THƯƠNG TÍCH, đe dọa tính mạng.', 'bad'); score -= 2; }
    if (deityTan.includes('Câu Trận')) { html += UI.note('⛓️ Câu Trận: Bị bắt giữ, giam cầm — đang trong vòng kiểm soát của pháp luật.', 'bad'); score -= 1; }
    if (normalizeGateName(gateTan) === 'Thương') { html += UI.note('🤜 Thương Môn: Có liên quan đến ĐÁNH NHAU, gây thương tích.', 'bad'); score -= 1; }
    if (normalizeGateName(gateTan) === 'Đỗ') { html += UI.note('🔒 Đỗ Môn: Đang bị giam cầm, không thể thoát khỏi vòng vây pháp lý.', 'bad'); score -= 2; }
    if (normalizeGateName(gateTan) === 'Tử') { html += UI.note('💀 Tử Môn: Tội danh rất nặng, nguy cơ án tù dài hạn.', 'bad'); score -= 3; }

    html += UI.section('⚖️ Mức Độ Tội & Kết Quả Pháp Lý');
    if (hasPattern(pTan, 'Lục Nghi Kích Hình')) { html += UI.note('🔴 Tân Kích Hình: TỘI DANH CỰC NẶNG — Hình phạt nghiêm khắc, khó thoát khỏi vòng tố tụng.', 'bad'); score -= 4; }
    const pNhamQuy23 = findPalaceByHeavenlyStem(chart, 'Nhâm') || findPalaceByHeavenlyStem(chart, 'Quý');
    if (pNhamQuy23 && pNhamQuy23.cung === pTan.cung) { html += UI.note('🏛️ Tân gặp Nhâm/Quý đồng cung: XÁC SUẤT ĐI TÙ rất cao.', 'bad'); score -= 3; }
    if (pMau && pMau.cung === pTan.cung) { html += UI.note('💵 Tân + Mậu đồng cung: Phạm tội VÌ TIỀN — tham lam tài chính là động cơ chính.', 'bad'); score -= 2; }
    if (isVoid(chart, pTan)) { html += UI.note('⭕ Tân Không Vong: Bằng chứng chống lại nghi phạm yếu — CÓ KHẢ NĂNG ĐƯỢC TẠI NGOẠI hoặc giảm án.', 'good'); score += 3; }
    if (hasRuMu(pTan)) { html += UI.note('🪦 Tân Nhập Mộ: Đang bị giam giữ chặt chẽ, không có khả năng tại ngoại.', 'bad'); score -= 2; }
    if (hasPattern(pTan, 'phản ngâm')) { html += UI.note('🔄 Phản Ngâm: CÓ KHẢ NĂNG ĐƯỢC PHÓNG THÍCH sớm hoặc đảo ngược tình thế bất ngờ.', 'good'); score += 2; }
    if (hasPattern(pTan, 'phục ngâm')) { html += UI.note('⏸️ Phục Ngâm: Vụ án kéo dài, BẮT GIỮ KÉO DÀI không có tiến triển.', 'bad'); score -= 1; }
    if (isHorse(chart, pTan)) { html += UI.note('🐎 Tân có Dịch Mã: NGHI PHẠM CÓ THỂ BỎ TRỐN — cần theo dõi và kiểm soát chặt.', 'bad'); score -= 2; }

    html += UI.section('👥 Khả Năng Đồng Bọn');
    if (pLH && pLH.cung === pTan.cung) { html += UI.note('🔴 Lục Hợp đồng cung Tân: CÓ ĐỒNG BỌN — vụ án có tổ chức, không phạm tội đơn lẻ.', 'bad'); score -= 2; }
    if (pMonth && pMonth.cung === pTan.cung) { html += UI.note('🔴 Can Tháng đồng cung Tân: Có người quen hoặc đồng nghiệp liên đới.', 'bad'); score -= 1; }
    if (!pLH || pLH.cung !== pTan.cung) { html += UI.note('🟡 Không có dấu hiệu đồng bọn rõ ràng — có thể phạm tội đơn độc.', 'neutral'); }

    html += UI.section('📊 Kết Luận Hình Sự');
    const totalHungSignals = (hasPattern(pTan, 'Lục Nghi Kích Hình') ? 1 : 0) +
      (hasRuMu(pTan) ? 1 : 0) +
      (deityTan.includes('Huyền Vũ') || deityTan.includes('Đằng Xà') || deityTan.includes('Bạch Hổ') ? 1 : 0);
    if (totalHungSignals >= 2) { html += UI.verdict('❌ Tội danh rõ ràng và nặng — án phạt cao, ít khả năng giảm nhẹ.', 'bad'); }
    else if (isVoid(chart, pTan)) { html += UI.verdict('✅ Bằng chứng yếu — có thể được tại ngoại hoặc giảm án đáng kể.', 'good'); }
    else { html += UI.verdict('⚠️ Tội danh ở mức trung bình — kết quả phụ thuộc vào luật sư và bằng chứng.', 'warn'); }

    return { html, score };
  };

  // ===== CHỦ ĐỀ 24: ĐI LẠC =====
  TOPIC_ANALYZERS[24] = function(chart) {
    let score = 0, html = '';
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pLH = findPalaceByDeityName(chart, 'Lục Hợp');
    const pDo = findPalaceByGate(chart, 'Đỗ');
    const pZF = getZhifuPalace(chart);
    const pTS = getZhishiPalace(chart);

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pHour, chart, 'Can Giờ (Người lạc)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('🧭 Người Đi Lạc (Can Giờ — Dụng Thần)');
    const rHour = analyzePalaceFull(pHour, `Can Giờ [${hourHS}] (Người lạc)`, chart);
    html += rHour.html;

    html += UI.section('🔍 Khả Năng Tìm Thấy');
    if (pDay && pHour && pDay.cung === pHour.cung) { html += UI.note('🟢 Ngày Giờ Đồng Cung: SẼ TÌM THẤY HOẶC TỰ QUAY VỀ — xác suất rất cao.', 'good'); score += 4; }
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Cục Phản Ngâm: CHẮC CHẮN SẼ QUAY LẠI — chỉ cần kiên nhẫn chờ đợi.', 'good'); score += 3; }
    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Cục Phục Ngâm: KHÓ TÌM THẤY — người lạc đang bị mắc kẹt hoặc không muốn quay về.', 'bad'); score -= 3; }
    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Can Giờ Không Vong: Người lạc đang ở nơi trống vắng, vắng người — khó tìm thấy.', 'bad'); score += getVoidScore(pHour, chart, 'dungThan'); }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Can Giờ Nhập Mộ: Người lạc đang bị "phong tỏa" — bị giam giữ hoặc ẩn nấp kỹ.', 'bad'); score -= 2; }
    if (pHour && isHorse(chart, pHour)) { html += UI.note('🐎 Can Giờ có Dịch Mã: Người lạc đang di chuyển liên tục — khó xác định vị trí cố định.', 'bad'); score -= 1; }

    html += UI.section('⚠️ Tình Trạng Người Đi Lạc');
    const deityHour24 = pHour ? getEffectiveDeityName(pHour, chart) : '';
    if (deityHour24.includes('Huyền Vũ')) { html += UI.note('🔴 Huyền Vũ: Người lạc BỊ NGƯỜI KHÁC LỪA DẪN đi — không tự ý rời đi.', 'bad'); score -= 2; }
    if (deityHour24.includes('Đằng Xà')) { html += UI.note('🔴 Đằng Xà: Người lạc BỊ BẮT GIỮ hoặc đang trong trạng thái hoảng loạn, sợ hãi.', 'bad'); score -= 2; }
    if (deityHour24.includes('Bạch Hổ')) { html += UI.note('🔴 Bạch Hổ: NGUY HIỂM — Người lạc có thể đang bị đe dọa hoặc đã bị thương.', 'bad'); score -= 3; }
    if (deityHour24.includes('Cửu Địa')) { html += UI.note('🔴 Cửu Địa: Có người cất giấu hoặc che chở. Nếu tự lạc, hãy tìm ở những nơi thấp, hang sâu, tầng hầm, ngõ hẻm.', 'bad'); score -= 1; }
    if (deityHour24.includes('Thái Âm')) { html += UI.note('🔴 Thái Âm: Người lạc đang ẩn nấp kín đáo, có thể tự lẩn trốn trong bóng tối.', 'bad'); score -= 1; }
    if (deityHour24.includes('Lục Hợp')) { html += UI.note('🟢 Lục Hợp: Người lạc đang gặp được người tốt, có thể đang được giúp đỡ để tìm đường về.', 'good'); score += 1; }
    if (deityHour24.includes('Trực Phù')) { html += UI.note('🟢 Trực Phù: Người lạc đang được bảo vệ, an toàn — sẽ sớm được tìm thấy.', 'good'); score += 2; }

    html += UI.section('🗺️ Hướng Tìm Kiếm');
    if (pLH) { html += renderDirectionAdvice(pLH, chart, 'Đây là hướng người lạc BAN ĐẦU đi theo — bắt đầu tìm kiếm từ đây.'); }
    if (pDo) { html += renderDirectionAdvice(pDo, chart, 'Hướng người lạc có thể đang ẨN NÁU hoặc di chuyển đến.'); }
    if (pHour) { html += renderDirectionAdvice(pHour, chart, 'Vị trí hiện tại nghi vấn — ưu tiên tìm kiếm khu vực này.'); }

    html += UI.section('🏠 Điểm Dừng Chân (Trực Phù / Trực Sử)');
    if (pZF) { html += UI.line('Trực Phù', `Cung ${palaceName(pZF.cung, chart)} — Hướng ${palaceDirection(pZF.cung, chart)}`, 'info'); }
    if (pTS) { html += UI.line('Trực Sử', `Cung ${palaceName(pTS.cung, chart)} — Hướng ${palaceDirection(pTS.cung, chart)}`, 'info'); }
    html += tinhUngKy(pHour, chart, 'Thời điểm tìm thấy người lạc');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 25: MẤT ĐỒ =====
  TOPIC_ANALYZERS[25] = function(chart) {
    let score = 0, html = '';
    const dayHS = getStemOf(chart, 'day');
    const hourHS = getStemOf(chart, 'hour');
    const pDay = findPalaceByHeavenlyStem(chart, dayHS);
    const pHour = findPalaceByHeavenlyStem(chart, hourHS);
    const pHuyenVu = findPalaceByDeityName(chart, 'Huyền Vũ');
    const pThienBong = findPalaceByStarName(chart, 'Thiên Bồng');

    // TÍCH HỢP 2: THỜI KHẮC DỤNG
    const thoiKhac = checkThoiKhacDung(pHour, chart, 'Can Giờ (Vật mất)');
    if (thoiKhac) { html += UI.note(thoiKhac.msg, thoiKhac.type); score += thoiKhac.score; }

    html += UI.section('📦 Vật Bị Mất (Can Giờ)');
    const rHour = analyzePalaceFull(pHour, `Can Giờ [${hourHS}] (Vật mất)`, chart);
    html += rHour.html;

    html += UI.section('🔍 Khả Năng Tìm Lại');
    if (pDay && pHour && pDay.cung === pHour.cung) { html += UI.note('🟢 Ngày Giờ Đồng Cung: ĐỒ VẬT CHƯA MẤT THẬT SỰ — loanh quanh đâu đó, nhìn kỹ sẽ thấy ngay.', 'good'); score += 4; }
    if (hasGlobalPattern(chart, 'phản ngâm')) { html += UI.note('🔄 Cục Phản Ngâm: ĐỒ ĐI RỒI LẠI VỀ — sẽ tìm lại được hoặc người khác trả lại.', 'good'); score += 3; }
    if (hasGlobalPattern(chart, 'phục ngâm')) { html += UI.note('⏸️ Cục Phục Ngâm: Khó tìm lại — đồ đang nằm im một chỗ nhưng khó phát hiện.', 'info'); score -= 1; }
    if (pHour && isVoid(chart, pHour)) { html += UI.note('⭕ Vật Mất Không Vong: MẤT THẬT RỒI — khả năng tìm lại gần như bằng 0. Hãy chấp nhận và báo cáo.', 'bad'); score += getVoidScore(pHour, chart, 'dungThan'); }
    if (pHour && hasRuMu(pHour)) { html += UI.note('🪦 Vật Mất Nhập Mộ: Đồ bị chôn giấu hoặc cất kỹ — rất khó tìm, cần thêm manh mối.', 'bad'); score -= 2; }

    const gsHour = pHour ? getGrowthStage(pHour, hourHS, chart) : '';
    if (['Đế Vượng','Trường Sinh','Lâm Quan'].includes(gsHour)) {
      html += UI.note(`🟢 Can Giờ đang ${gsHour}: Vật mất còn nguyên vẹn, chưa bị phá hủy.`, 'good'); score += 1;
    } else if (['Tử','Mộ','Tuyệt'].includes(gsHour)) {
      html += UI.note(`🔴 Can Giờ đang ${gsHour}: Vật mất có thể đã bị hư hỏng hoặc tiêu tán.`, 'bad'); score -= 1;
    }

    html += UI.section('📍 Vị Trí Mất Đồ (Nội/Ngoại Bàn)');
    const sys = chart.sys;
    if (pDay && pHour && sys && sys.NOI_BAN) {
      const dayInner = sys.NOI_BAN.includes(pDay.cung);
      const hourInner = sys.NOI_BAN.includes(pHour.cung);
      if (dayInner && hourInner) {
        html += UI.note('🏠 Cả hai cung đều thuộc NỘI BÀN: Đồ mất trong nhà, trong phòng gần bạn.', 'good'); score += 1;
      } else if (!dayInner && !hourInner) {
        html += UI.note('🌍 Cả hai cung thuộc NGOẠI BÀN: Đồ mất ở bên ngoài, xa nơi ở.', 'info'); score -= 1;
      } else {
        html += UI.note('🔀 Nội ngoại hỗn hợp: Đồ mất ở vùng ranh giới — cửa ra vào, sân, xe, hoặc nơi công cộng gần nhà.', 'info');
      }
    }

    html += UI.section('🕵️ Ai Đã Lấy?');
    if (pHuyenVu) {
      if (pHuyenVu.cung === pHour?.cung) {
        html += UI.note('🔴 Huyền Vũ đồng cung vật mất: CÓ NGƯỜI LẤY TRỘM — không phải để quên.', 'bad'); score -= 2;
        const hsBong = getHeavenlyStem(pHuyenVu);
        const isYangHV = ['Giáp','Bính','Mậu','Canh','Nhâm'].includes(hsBong);
        if (isYangHV) { html += UI.note('👨 Thiên Can Dương tại Huyền Vũ: Người lấy có thể là ĐÀN ÔNG.', 'info'); }
        else { html += UI.note('👩 Thiên Can Âm tại Huyền Vũ: Người lấy có thể là PHỤ NỮ.', 'info'); }
      } else {
        html += UI.note(`⚠️ Huyền Vũ ở Cung ${palaceName(pHuyenVu.cung, chart)} (${palaceDirection(pHuyenVu.cung, chart)}): Kẻ trộm có liên quan đến khu vực hướng này.`, 'bad');
        html += analyzeTenDiaRelation(pHuyenVu, chart, 'Kẻ Trộm (Huyền Vũ)');
        score -= 1;
      }
    }
    if (pThienBong && pHour && pThienBong.cung === pHour.cung) {
      html += UI.note('🔴 Thiên Bồng đồng cung vật mất: Đồ bị lấy trộm trong hoàn cảnh hỗn loạn, đông người.', 'bad'); score -= 2;
    }
    if (!pHuyenVu || pHuyenVu.cung !== pHour?.cung) {
      if (!pThienBong || pThienBong.cung !== pHour?.cung) {
        html += UI.note('🟡 Không có dấu hiệu rõ ràng của kẻ trộm — có thể BẠN TỰ ĐỂ QUÊN ở đâu đó.', 'neutral'); score += 1;
      }
    }

    html += UI.section('🗺️ Hướng Tìm Kiếm');
    if (pHour) {
      let dCtx = 'Tìm kiếm theo hướng này trước.';
      const dH = getEffectiveDeityName(pHour, chart);
      if (dH.includes('Thái Âm')) dCtx += ' 💡 Vật bị che khuất. Tìm trong tủ đóng kín, dưới nệm, chăn, rèm cửa.';
      if (dH.includes('Cửu Địa')) dCtx += ' 💡 Vật rớt ở vị trí thấp. Tìm sát mặt đất, gầm bàn/giường, tầng hầm.';
      if (dH.includes('Cửu Thiên')) dCtx += ' 💡 Vật ở vị trí cao. Tìm trên kệ, nóc tủ, chỗ cao.';
      html += renderDirectionAdvice(pHour, chart, dCtx);
    }
    if (pHuyenVu && pHuyenVu.cung !== pHour?.cung) {
      html += renderDirectionAdvice(pHuyenVu, chart, 'Kẻ tình nghi có thể đến từ hoặc trốn ở khu vực này.');
    }
    html += tinhUngKy(pHour, chart, 'Thời điểm tìm thấy đồ vật');

    return { html, score };
  };

  // ===== CHỦ ĐỀ 26: THỜI TIẾT =====
  TOPIC_ANALYZERS[26] = function(chart) {
    let score = 0, html = '';

    const WSTEM = {
      'Giáp':'Gió','Ất':'Gió','Bính':'Nóng','Đinh':'Nóng',
      'Mậu':'Mây','Kỷ':'Mây','Canh':'Lạnh','Tân':'Lạnh',
      'Nhâm':'Mưa','Quý':'Mưa'
    };
    const WSTAR = {
      'Thiên Anh':'Nắng','Thiên Phụ':'Gió','Thiên Trụ':'Mưa',
      'Thiên Bồng':'Mưa','Thiên Xung':'Sấm','Thiên Nhuế':'Mây',
      'Thiên Nhậm':'Mưa','Thiên Tâm':'Nắng','Thiên Cầm':'Mây'
    };
    const WDEITY = {
      'Trực Phù':'Nắng','Cửu Thiên':'Nắng','Thái Âm':'Mây',
      'Cửu Địa':'Mây','Huyền Vũ':'Mưa','Lục Hợp':'Gió',
      'Bạch Hổ':'Gió','Đằng Xà':'Nóng'
    };

    const wc = {};
    const addW = (type, source) => {
      if (!type) return;
      if (!wc[type]) wc[type] = { count: 0, sources: [] };
      wc[type].count++;
      wc[type].sources.push(source);
    };

    html += UI.section('☁️ Quét Tín Hiệu Khí Tượng');
    for (const p of getAllPalaces(chart)) {
      const hs = p.thienCanBan || '';
      const star = p.thienBan || '';
      const deity = getEffectiveDeityName(p, chart);
      const cungName = palaceName(p.cung, chart);

      if (WSTEM[hs]) addW(WSTEM[hs], `Can ${hs} (Cung ${cungName})`);
      for (const [sn, wt] of Object.entries(WSTAR)) {
        if (star && star.includes(sn)) { addW(wt, `Sao ${sn} (${cungName})`); break; }
      }
      for (const [dn, wt] of Object.entries(WDEITY)) {
        if (deity && deity.includes(dn)) { addW(wt, `Thần ${deity} (${cungName})`); break; }
      }
    }

    const sorted = Object.entries(wc).sort((a, b) => b[1].count - a[1].count);
    if (!sorted.length) {
      html += UI.note('Không đủ dữ liệu để dự báo thời tiết.', 'neutral');
      return { html, score: 0 };
    }

    for (const [w, data] of sorted) {
      const emoji = { 'Mưa':'🌧️','Nắng':'☀️','Gió':'💨','Nóng':'🌡️','Lạnh':'❄️','Mây':'☁️','Sấm':'⛈️' }[w] || '🌤️';
      html += UI.line(
        `${emoji} ${w}`,
        `${data.count} chỉ dấu — ${data.sources.slice(0, 3).join(', ')}${data.sources.length > 3 ? '...' : ''}`,
        'neutral'
      );
    }

    html += UI.section('📊 Dự Báo Thời Tiết Chính');
    const main = sorted[0];
    const second = sorted[1];
    const emojiMap = { 'Mưa':'🌧️','Nắng':'☀️','Gió':'💨','Nóng':'🌡️','Lạnh':'❄️','Mây':'☁️','Sấm':'⛈️' };
    html += UI.note(
      `${emojiMap[main[0]] || '🌤️'} YẾU TỐ THỐNG TRỊ: ${main[0].toUpperCase()} (${main[1].count} lần xuất hiện). Đây là điều kiện thời tiết chủ đạo.`,
      main[0] === 'Mưa' || main[0] === 'Sấm' ? 'bad' : 'good'
    );
    if (second && second[1].count >= Math.ceil(main[1].count * 0.6)) {
      html += UI.note(`${emojiMap[second[0]] || '🌤️'} YẾU TỐ PHỤ: ${second[0]} cũng khá mạnh — thời tiết hỗn hợp, có thể thay đổi trong ngày.`, 'info');
    }

    html += UI.section('⚡ Phân Tích Tín Hiệu Đặc Biệt');
    const pBong26 = findPalaceByStarName(chart, 'Thiên Bồng');
    const pTru26 = findPalaceByStarName(chart, 'Thiên Trụ');
    const pNhamQuy26 = findPalaceByHeavenlyStem(chart, 'Nhâm') || findPalaceByHeavenlyStem(chart, 'Quý');
    let rainSignals = 0;
    if (wc['Mưa'] && wc['Mưa'].count >= 3) { html += UI.note('🌧️ Mưa xuất hiện nhiều lần — XÁC SUẤT MƯA RẤT CAO.', 'bad'); rainSignals++; }
    if (pBong26 && pNhamQuy26 && pBong26.cung === pNhamQuy26.cung) { html += UI.note('🌧️ Thiên Bồng + Nhâm/Quý đồng cung: DẤU HIỆU MƯA MẠNH.', 'bad'); rainSignals++; }
    if (pTru26 && pNhamQuy26 && pTru26.cung === pNhamQuy26.cung) { html += UI.note('🌧️ Thiên Trụ + Nhâm/Quý đồng cung: DẤU HIỆU MƯA KÉO DÀI.', 'bad'); rainSignals++; }
    if (wc['Sấm'] && wc['Sấm'].count >= 1) { html += UI.note('⛈️ Thiên Xung xuất hiện: Có thể có sấm chớp, giông bão.', 'bad'); rainSignals++; }
    if (rainSignals === 0 && (!wc['Mưa'] || wc['Mưa'].count < 2)) {
      if (wc['Nắng'] && wc['Nắng'].count >= 2) { html += UI.note('☀️ Tín hiệu Nắng áp đảo: Thời tiết khô ráo, quang đãng.', 'good'); }
    }

    html += UI.section('📅 Bối Cảnh Theo Mùa');
    const mua = chart.season?.mua || '';
    const muaCtx = {
      'Xuân': 'Mùa Xuân: Thường có mưa phùn, độ ẩm cao.',
      'Hạ': 'Mùa Hạ: Nắng nóng chủ đạo, dễ có giông chiều.',
      'Thu': 'Mùa Thu: Khí hậu mát mẻ, gió se.',
      'Đông': 'Mùa Đông: Lạnh, có thể có sương mù hoặc mưa.'
    };
    if (muaCtx[mua]) html += UI.note(`🗓️ ${muaCtx[mua]}`, 'info');

    return { html, score: 0 };
  };

  // ============================ RUN ANALYSIS ENGINE ============================
  function runAnalysis(chartArg) {
    const select = document.getElementById('topicSelect');
    const topicId = select ? select.value : '';
    const resultDiv = document.getElementById('analysisResult');

    if (!topicId) {
      if (resultDiv) resultDiv.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;font-family:sans-serif;">Vui lòng chọn chủ đề để luận giải.</div>';
      return;
    }

    const chart = chartArg || getCurrentChart();
    if (!chart) {
      if (resultDiv) resultDiv.innerHTML = '<div style="color:red;padding:20px;">Chưa có dữ liệu. Hãy bấm "Lập Bàn" trước.</div>';
      return;
    }

    currentTopicId = Number(topicId);

    try {
      const fn = TOPIC_ANALYZERS[currentTopicId];
      if (!fn) {
        if (resultDiv) resultDiv.innerHTML = '<div style="color:red;">Lỗi: Không tìm thấy bộ phân tích chủ đề này. Vui lòng thêm các hàm TOPIC_ANALYZERS.</div>';
        return;
      }

      const analysisObj = fn(chart);

      // TÍCH HỢP A: DEAL-BREAKER SYSTEM
      const dealBreaker = checkDealBreakers(chart, topicId);
      if (dealBreaker) {
        analysisObj.score += dealBreaker.score_penalty;
        // Clamp score về -15 nếu deal-breaker đẩy xuống quá thấp
        analysisObj.score = Math.max(-15, analysisObj.score);
      }

      const flags = checkRedFlags(chart, topicId);
      let flagHtml = '';
      if (dealBreaker || flags.length > 0) {
        flagHtml += `<div style="margin:16px 0 8px 0;font-weight:700;border-left:4px solid #dc2626;padding-left:10px;background:#fef2f2;padding-top:5px;padding-bottom:5px;border-radius:2px;font-size:13.5px;">🚨 CẢNH BÁO ĐẶC BIỆT (Toàn Cục)</div>`;
        
        if (dealBreaker) {
           flagHtml += UI.note(dealBreaker.msg, dealBreaker.type);
        }

        for (const flag of flags) {
          flagHtml += UI.note(flag.msg, flag.type);
          if (flag.type === 'bad') analysisObj.score -= 2;
          if (flag.type === 'good') analysisObj.score += 2;
        }
      }

      // TÍCH HỢP: ACTION PLAN
      const actionPlanHtml = renderActionPlan(analysisObj.score, topicId);

      // TÍCH HỢP: Executive Summary
      const execSummaryHtml = renderExecutiveSummary(topicId, chart, analysisObj.score, analysisObj.html);

      const finalHtml = execSummaryHtml + flagHtml + analysisObj.html + actionPlanHtml + UI.verdict(
        `<div style="display:flex;flex-direction:column;width:100%;">
          <div style="font-size:12px;color:#6b7280;margin-top:5px;font-weight:normal;font-style:italic;text-align:center;">
            * Hệ thống Master V3: Tích hợp Nguyệt Lệnh, Nhật Lệnh, Đối Xung, Tinh Môn, Tam Phú Cách, Deal-breaker & Action Plan. Tự động tương thích Hà Đồ/Lạc Thư.
          </div>
         </div>`,
        analysisObj.score >= 0 ? 'good' : 'bad'
      );

      if (resultDiv) resultDiv.innerHTML = finalHtml;

    } catch (e) {
      console.error('[LogicLuanQue Error]', e);
      if (resultDiv) resultDiv.innerHTML = `<div style="color:red;font-weight:bold;padding:20px;">Lỗi xử lý: ${e.message}. Xem Console để biết thêm.</div>`;
    }
  }

  // ============================ BIND EVENTS ============================
  function bindUIEvents() {
    const select = document.getElementById('topicSelect');
    if (select) {
      select.addEventListener('change', function () {
        const topicId = this.value;
        const guideDiv = document.getElementById('topicGuide');
        if (guideDiv) {
          if (TOPIC_GUIDES[topicId]) {
            const t = TOPIC_GUIDES[topicId];
            let guideHtml = `<div style="font-weight:700;color:#7f1d1d;margin-bottom:6px;font-size:12px;">${t.title}</div>`;
            
            if (t.vars && t.vars.length) {
              guideHtml += `<div style="font-weight:700;color:#374151;margin-bottom:2px;">📌 Biến số:</div>`;
              guideHtml += `<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">`;
              for (const [k, v] of t.vars) {
                guideHtml += `<tr><td style="padding:1px 4px 1px 0;vertical-align:top;width:40%;color:#1d4ed8;font-weight:700;font-size:12px;">${UI.h(k)}</td><td style="padding:1px 0;vertical-align:top;font-size:12px;color:#374151;">${UI.h(v)}</td></tr>`;
              }
              guideHtml += `</table>`;
            }

            if (t.signals && t.signals.length) {
              guideHtml += `<div style="font-weight:700;color:#374151;margin-bottom:2px;">⚡ Tín hiệu đặc biệt:</div>`;
              guideHtml += `<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">`;
              for (const [k, v] of t.signals) {
                guideHtml += `<tr><td style="padding:1px 4px 1px 0;vertical-align:top;width:50%;color:#b45309;font-size:11px;">${UI.h(k)}</td><td style="padding:1px 0;vertical-align:top;font-size:11px;color:#374151;">→ ${UI.h(v)}</td></tr>`;
              }
              guideHtml += `</table>`;
            }
            
            if (t.how) {
              guideHtml += `<div style="font-weight:700;color:#374151;margin-bottom:2px;">📖 Cách xem nhanh:</div>`;
              guideHtml += `<div style="font-size:11px;color:#374151;line-height:1.6;border-left:3px solid #8a1f1f;padding-left:7px;background:#fdf8f8;padding-top:3px;padding-bottom:3px;">${UI.h(t.how)}</div>`;
            }
            
            guideDiv.innerHTML = guideHtml;
          } else {
            guideDiv.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:40px 0;font-family:sans-serif;">Chọn chủ đề để xem hướng dẫn</div>';
          }
        }
        runAnalysis();
      });
    }
    const reBtn = document.getElementById('btnReAnalyze');
    if (reBtn) reBtn.addEventListener('click', () => runAnalysis());
    const clearBtn = document.getElementById('btnClearNote');
    const noteArea = document.getElementById('analysisNote');
    if (clearBtn && noteArea) clearBtn.addEventListener('click', () => { noteArea.value = ''; });
  }

  function bindChartEvents() {
    if (window.ChartEvents) window.ChartEvents.on('chartCalculated', (chart) => runAnalysis(chart));
  }

  function initLogicLuanQue() {
    bindUIEvents();
    bindChartEvents();
    if (window.__LAST_CHART) {
      runAnalysis(window.__LAST_CHART);
      const select = document.getElementById('topicSelect');
      if (select && select.value) {
        const guideDiv = document.getElementById('topicGuide');
        if (guideDiv && TOPIC_GUIDES[select.value]) {
          const event = new Event('change');
          select.dispatchEvent(event);
        }
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLogicLuanQue);
  else initLogicLuanQue();

})();
