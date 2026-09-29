const VONG_HOANG_DAO = [
    { name: "Thanh Long", type: "Hoàng Đạo" }, { name: "Minh Đường", type: "Hoàng Đạo" },
    { name: "Thiên Hình", type: "Hắc Đạo" }, { name: "Chu Tước", type: "Hắc Đạo" },
    { name: "Kim Quỹ", type: "Hoàng Đạo" }, { name: "Bảo Quang", type: "Hoàng Đạo" },
    { name: "Bạch Hổ", type: "Hắc Đạo" }, { name: "Ngọc Đường", type: "Hoàng Đạo" },
    { name: "Thiên Lao", type: "Hắc Đạo" }, { name: "Nguyên Vũ", type: "Hắc Đạo" },
    { name: "Tư Mệnh", type: "Hoàng Đạo" }, { name: "Câu Trận", type: "Hắc Đạo" }
];

const HOANG_DAO_START_HOUR = {
    "Dần": "Tí", "Thân": "Tí", "Mão": "Dần", "Dậu": "Dần",
    "Thìn": "Thìn", "Tuất": "Thìn", "Tị": "Ngọ", "Hợi": "Ngọ",
    "Tý": "Thân", "Ngọ": "Thân", "Sửu": "Tuất", "Mùi": "Tuất"
};

const GOOD_LAC_VIET_QUE = new Set([
    "Sinh Đại An", "Sinh Tiểu Cát", "Đỗ Tiểu Cát", "Đỗ Đại An", "Đỗ Tốc Hỷ",
    "Khai Đại An", "Khai Tốc Hỷ", "Khai Tiểu Cát", "Cảnh Tiểu Cát", "Cảnh Đại An",
    "Cảnh Tốc Hỷ", "Kinh Đại An", "Kinh Tốc Hỷ", "Hưu Tiểu Cát", "Hưu Đại An",
    "Thương Tốc Hỷ", "Thương Tiểu Cát", "Thương Đại An"
]);

const GOOD_MAI_HOA_QUE = new Set([
    "Gia Nhân_Tiệm", "Tiệm_Gia Nhân", "Đại Hữu_Đỉnh", "Đỉnh_Đại Hữu", "Đại Hữu_Thuần Kiền",
    "Thuần Kiền_Đại Hữu", "Hàm_Tụy", "Thái_Lâm", "Lâm_Thái", "Bí_Gia Nhân", "Gia Nhân_Ích",
    "Thái_Nhu", "Thuần Kiền_Cấu", "Cấu_Thuần Kiền", "Sư_Thuần Khôn", "Thuần Khôn_Sư",
    "Trung Phu_Ích", "Trung Phu_Lý", "Lý_Trung Phu", "Thuần Kiền_Lý", "Lý_Thuần Kiền",
    "Sư_Giải", "Giải_Sư", "Thái_Thăng", "Hoán_Quan", "Quan_Hoán", "Cách_Phong", "Phong_Cách",
    "Cách_Hàm", "Hàm_Cách", "Độn_Đồng Nhân", "Đại Hữu_Khuê", "Đại Tráng_Hằng", "Phong_Thuần Chấn",
    "Bí_Di", "Tụy_Tỷ", "Dự_Tấn", "Tấn_Dự", "Tùy_Thuần Đoài", "Cấu_Đỉnh", "Đỉnh_Cấu"
]);
