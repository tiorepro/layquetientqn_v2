const TOT_CHO_MAP = [
    {
        mainGua: "Gia Nhân",
        changedGua: "Tiệm",
        content: "- Lễ động thổ cất nhà để ở hoặc sửa nhà; - Lễ nhập trạch; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; - Giao tiếp giới thiệu khách hàng, hợp tác, bàn thảo; - Tặng quà tạo tình cảm thân thiện; - Họp nhâ viên truyền lửa và tình cảm thân mật; - Ký hợp đồng; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp"
    },
    {
        mainGua: "Tiệm",
        changedGua: "Gia Nhân",
        content: "- Lễ động thổ cất nhà để ở hoặc sửa nhà; - Lễ nhập trạch; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; - Giao tiếp giới thiệu khách hàng, hợp tác, bàn thảo; - Tặng quà tạo tình cảm thân thiện; - Họp nhâ viên truyền lửa và tình cảm thân mật; - Ký hợp đồng; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp"
    },
    {
        mainGua: "Đại Hữu",
        changedGua: "Đỉnh",
        content: "- Lễ động thổ cất nhà ở hoặc sửa nhà; - Lễ nhập trạch; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng Cửu Huyền Thất Tổ; - Giao tiếp, giới thiệu khách hàng, hợp tác, bàn thảo; - Lễ hỏi, cưới; - Họp nhân viên truyền cảm hứng và tình cảm thân mật; - Ký hợp đồng; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp"
    },
    {
        mainGua: "Đỉnh",
        changedGua: "Đại Hữu",
        content: "- Lễ động thổ cất nhà ở hoặc sửa nhà; - Lễ nhập trạch; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng Cửu Huyền Thất Tổ; - Giao tiếp, giới thiệu khách hàng, hợp tác, bàn thảo; - Lễ hỏi, cưới; - Họp nhân viên truyền cảm hứng và tình cảm thân mật; - Ký hợp đồng; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp"
    },
    {
        mainGua: "Đại Hữu",
        changedGua: "Thuần Kiền",
        content: "- Lễ động thổ cất nhà ở hoặc sửa nhà; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; - Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng Cửu Huyền Thất Tổ; - Họp nhân viên truyền lửa và tình cảm thân mật; - Ký hợp đồng ( hợp đồng lớn); - Khai bút, viết kế hoạch, vẽ tranh, thư pháp; - Treo bảng hoặc cúng bán nhà đất; - Khai trương động thổ cho người giàu có, gốc khá vững, ký hợp đồng, lễ cúng; dễ phát sinh chi phí, phù hợp gia chủ làm công chức"
    },
    {
        mainGua: "Thuần Kiền",
        changedGua: "Đại Hữu",
        content: "- Lễ động thổ cất nhà ở hoặc sửa nhà; - Lễ khai trương; - Lễ cúng Ông Địa Thần Tài; - Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng Cửu Huyền Thất Tổ; - Họp nhân viên truyền lửa và tình cảm thân mật; - Ký hợp đồng ( hợp đồng lớn); - Khai bút, viết kế hoạch, vẽ tranh, thư pháp; - Treo bảng hoặc cúng bán nhà đất; - Khai trương động thổ cho người giàu có, gốc khá vững, ký hợp đồng, lễ cúng; dễ phát sinh chi phí, phù hợp gia chủ làm công chức"
    },
    {
        mainGua: "Hàm",
        changedGua: "Tụy",
        content: "- Lễ động thổ cất nhà để bán; - Lễ nhập trạch; Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng Cửu Huyền Thất Tổ; - Giao tiếp giới thiệu khách hàng, hợp tác, bàn thảo; - Lễ hỏi. cưới; - Tặng quà tạo tình cảm thân thiện; - Ký hợp đồng; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp."
    },
    {
        mainGua: "Thái",
        changedGua: "Lâm",
        content: "- Ký hợp đồng, thương lượng, khai bút, lễ cúng, cầu chủ và ông bà thông thái, học cao"
    },
    {
        mainGua: "Lâm",
        changedGua: "Thái",
        content: "- Ký hợp đồng, thương lượng, khai bút, lễ cúng, cầu chủ và ông bà thông thái, học cao"
    },
    {
        mainGua: "Bí",
        changedGua: "Gia Nhân",
        content: "- Khai trương kinh doanh, nhập trạch, động thổ, khai lộc; - Cúng cầu con hoặc cho con cái thông minh, tốt cho người nhỏ tuổi"
    },
    {
        mainGua: "Gia Nhân",
        changedGua: "Ích",
        content: "- Khai trương kinh doanh, nhập trạch, động thổ, khai lộc, lễ cưới hỏi"
    },
    {
        mainGua: "Thái",
        changedGua: "Nhu",
        content: "- Lễ cúng vọng linh trong nhà phố trợ kinh doanh, cúng Cửu Huyền Thất Tổ;- giao tiếp giới thiệu khách hàng, hợp tác, bàn thảo; - Tặng quà tạo tình cảm thân thiện; - Thuyết phục; - Họp nhân viên truyền lửa và tình cảm thân mật; - Giải bày tâm sự, giải tỏa mâu thuẩn; - Khai bút viết kế hoạch, vẽ tranh, viết thư pháp"
    },
    {
        mainGua: "Thuần Kiền",
        changedGua: "Cấu",
        content: "- Ký hợp đồng"
    },
    {
        mainGua: "Cấu",
        changedGua: "Thuần Kiền",
        content: "- Ký hợp đồng"
    },
    {
        mainGua: "Sư",
        changedGua: "Thuần Khôn",
        content: "- Thương lượng; - Lễ cúng để được sự che chở, hỗ trợ của người trên"
    },
    {
        // Gộp thêm nội dung của mục "Khôn → Sư" cũ (khóa "Khôn" không khớp tên quẻ "Thuần Khôn")
        mainGua: "Thuần Khôn",
        changedGua: "Sư",
        content: "- Thương lượng; - Cúng để nhân viên hoặc người nhỏ lo cho người lớn, có lợi lộc về đất đai"
    },
    {
        mainGua: "Trung Phu",
        changedGua: "Ích",
        content: "- Lễ cưới hỏi"
    },
    {
        mainGua: "Trung Phu",
        changedGua: "Lý",
        content: "- Lễ cưới hỏi; - lễ cúng"
    },
    {
        mainGua: "Lý",
        changedGua: "Trung Phu",
        content: "- Lễ cúng"
    },
    {
        mainGua: "Thuần Kiền",
        changedGua: "Lý",
        content: "- Khai bút"
    },
    {
        mainGua: "Lý",
        changedGua: "Thuần Kiền",
        content: "- Khai bút"
    },
    {
        mainGua: "Sư",
        changedGua: "Giải",
        content: "- Giải bày tâm sự, giải tỏa mâu thuẩn; - Thấy vận hạn xui xẻo, cúng giải hạn, đồng thời dọn dẹp nhà cửa cho thanh sạch, tẩy uế."
    },
    {
        mainGua: "Giải",
        changedGua: "Sư",
        content: "- Giải bày tâm sự, giải tỏa mâu thuẩn; - Thấy vận hạn xui xẻo, cúng giải hạn, đồng thời dọn dẹp nhà cửa cho thanh sạch, tẩy uế."
    },
        {
        mainGua: "Thái",
        changedGua: "Thăng",
        content: "r - Lễ cúng"
    },
    {
        mainGua: "Hoán",
        changedGua: "Quan",
        content: "- Thấy vận hạn xui xẻo cúng giải hạn, đồng thời dọn dẹp nhà cửa cho thanh sạch, tẩy uế; - Treo bảng hoặc cúng Bán đất, bán nhà; - Trước khi cúng quét dọn nhà cửa gọn gàng, bắt đèn cho sáng sủa, lau nhà theo phép ngũ hành: nấu nước nóng, bỏ 1 cây đinh, 1 trái ớt, 3 lát gừng pha với nước lạnh lau nhà"
    },
    {
        mainGua: "Quan",
        changedGua: "Hoán",
        content: "- Thấy vận hạn xui xẻo cúng giải hạn, đồng thời dọn dẹp nhà cửa cho thanh sạch, tẩy uế; - Treo bảng hoặc cúng Bán đất, bán nhà; - Trước khi cúng quét dọn nhà cửa gọn gàng, bắt đèn cho sáng sủa, lau nhà theo phép ngũ hành: nấu nước nóng, bỏ 1 cây đinh, 1 trái ớt, 3 lát gừng pha với nước lạnh lau nhà"
    },
    {
        mainGua: "Cách",
        changedGua: "Phong",
        content: "- Lễ động thổ cất nhà để bán; - Nhà làm ăn trục trặc hoài thì quét dọn, thanh toán đồ hư bể...sắp xếp nội thất mới mẻ hơn, cắt kiểu tóc mới, mua 5 bộ y phục mới; - Treo bảng hoặc cúng bán nhà đất; - trái cây: 4 trái, 3 táo đỏ; hoa: bó hoa lớn đẹp; nhang: 4:3"
    },
    {
        mainGua: "Phong",
        changedGua: "Cách",
        content: "- Lễ động thổ cất nhà để bán; - Nhà làm ăn trục trặc hoài thì quét dọn, thanh toán đồ hư bể...sắp xếp nội thất mới mẻ hơn, cắt kiểu tóc mới, mua 5 bộ y phục mới; - Treo bảng hoặc cúng bán nhà đất; - trái cây: 4 trái, 3 táo đỏ; hoa: bó hoa lớn đẹp; nhang: 4:3"
    },
    {
        mainGua: "Cách",
        changedGua: "Hàm",
        content: "- Lễ động thổ cất nhà để bán; - Nhà làm ăn trục trặc hoài thì quét dọn, thanh toán đồ hư, bể ...sắp xếp nội thất mới mẻ hơn, cắt kiểu tóc mới, mua 5 bộ y phục mới; - Bán đất, bán nhà;-  trái cây: 1 trái dừa mở nắp, nhãn - hoa: trắng, vàng - nhang: 2 cây cắm trên, 7 cây cắm dưới."
    },
    {
        mainGua: "Hàm",
        changedGua: "Cách",
        content: "- Lễ động thổ cất nhà để bán; - Nhà làm ăn trục trặc hoài thì quét dọn, thanh toán đồ hư, bể ...sắp xếp nội thất mới mẻ hơn, cắt kiểu tóc mới, mua 5 bộ y phục mới; - Bán đất, bán nhà;-  trái cây: 1 trái dừa mở nắp, nhãn - hoa: trắng, vàng - nhang: 2 cây cắm trên, 7 cây cắm dưới."
    },
    {
        mainGua: "Độn",
        changedGua: "Đồng Nhân",
        content: "- Bán nhà nhờ người giới thiệu hoặc đăng trên báo, mạng; - trái cây: 1 trái dưa hấu dài, 3 trái táo đỏ - hoa: cúc trắng, hoa màu đỏ - nhang: 1 cây cắm trên, 3 cây cắm dưới."
    },
    {
        mainGua: "Đại Hữu",
        changedGua: "Khuê",
        content: "- Chỉnh sửa, động thổ, cần người hợp tác giúp đỡ"
    },
    {
        mainGua: "Đại Tráng",
        changedGua: "Hằng",
        content: "- Càng ngày càng lớn mạnh, tốt mọi mặt, sức khỏe, tuổi thọ"
    },
    {
        mainGua: "Phong",
        changedGua: "Thuần Chấn",
        content: "- Chỉnh sửa, động thổ, dùng cho nhà kinh doanh có nhiều khách hàng, nhiều người giúp đỡ, hòa mỹ thịnh đại, treo chuông gió"
    },
    {
        mainGua: "Bí",
        changedGua: "Di",
        content: "- Giải bế tắc, mọi việc thông suốt trôi chảy"
    },
    {
        mainGua: "Tụy",
        changedGua: "Tỷ",
        content: "- Cúng để mọi người trong nhà, tổ chức chung sức đồng lòng"
    },
    {
        mainGua: "Dự",
        changedGua: "Tấn",
        content: "- Lễ nhập trạch"
    },
    {
        mainGua: "Tấn",
        changedGua: "Dự",
        content: "- Lễ nhập trạch"
    },
    {
        mainGua: "Tùy",
        changedGua: "Thuần Đoài",
        content: "- Giao tiếp giới thiệu khách hàng, hợp tác, bàn thảo; - Thuyết Phục"
    },
    {
        mainGua: "Cấu",
        changedGua: "Đỉnh",
        content: "- Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng cửu huyền thất tổ"
    },
    {
        mainGua: "Đỉnh",
        changedGua: "Cấu",
        content: "- Lễ cúng vong linh trong nhà phò trợ kinh doanh, cúng cửu huyền thất tổ"
    }
];
