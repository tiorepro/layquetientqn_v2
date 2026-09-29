const BAT_MON = [
    { name: "Khai", nguHanh: "Âm Thủy nhưng nghĩa của Khai thuộc Dương Thủy", degree: 1, color: "Xanh dương, Đen bóng", direction: "Bắc", meaning: "Dòng nước chảy, là sự khai thông, là trôi đi, là thoát khỏi sự bế tắc, là đi xa thuận lợi" },
    { name: "Kinh", nguHanh: "Dương Kim nhưng nghĩa của Kinh thuộc Âm Kim", degree: 4, color: "Trắng xám", direction: "Tây Nam", meaning: "Kinh sợ, đột ngột, sự bất ngờ, là giật gân, là người làm việc táo bạo, mạo hiểm" },
    { name: "Cảnh", nguHanh: "Dương Hỏa nhưng nghĩa của Cảnh thuộc Âm Hỏa", degree: 2, color: "Đỏ nâu", direction: "Đông Nam", meaning: "Đi chơi ở trong sự nhàn hạ, phong lưu. Là từ xa tới, là du lịch, là đi xa, là vẻ đẹp, là nhà đẹp, cao rộng có vườn cây hoặc nội thất rực rỡ. Cảnh vì là âm hỏa- chính vị Khôn thổ - nên còn ý nghĩa là âm thổ: miếng đất đẹp" },
    { name: "Tử", nguHanh: "Âm Kim nhưng nghĩa của Tử thuộc Dương Kim", degree: 9, color: "Trắng", direction: "Chính Tây", meaning: "Chết, sự chấm dứt, kết thúc, là cắt đứt, là sự sát phạt, là tiền bạc tài sản lưu động, là người làm nghề cơ khí, kim khí, là võ nghiệp, nếu là bác sĩ liên quan đến mổ xẻ, là nghe" },
    { name: "Thương", nguHanh: "Dương Mộc nhưng nghĩa của Thương thuộc Âm Mộc", degree: 8, color: "Xanh lá cây đậm", direction: "Đông Bắc", meaning: "Buồn, là thuộc trạng thái tình cảm, là cây lớn, là sự phát triển sung mãn sắp chuyển sang trạng thái suy vi" },
    { name: "Hưu", nguHanh: "Dương Thủy nhưng nghĩa của Hưu thuộc Âm Thủy", degree: 6, color: "Đen xỉn, Xanh đen", direction: "Tây Bắc", meaning: "Nghỉ, sự ngưng trệ, sự nghỉ ngơi do bất lực, kiệt sức, là sự bế tắc" },
    { name: "Sinh", nguHanh: "Âm Mộc nhưng nghĩa của Sinh thuộc Dương Mộc", degree: 3, color: "Xanh lá mạ, Xanh non", direction: "Chính Đông", meaning: "Sống, là sự bắt đầu (cho 1 việc, một cái gì đó), là ý tưởng ban đầu, là mầm cây, là cỏ, là cây nhỏ, là loại cây mềm yếu, là mùa xuân, là sự hứa hẹn, là hy vọng" },
    { name: "Đỗ", nguHanh: "Âm Hỏa nhưng nghĩa của Đỗ thuộc Dương Hỏa", degree: 7, color: "Đỏ", direction: "Chính Nam", meaning: "Đạt, là sự thành đạt, là kết quả tốt đẹp, là được việc, là quý nhân phù trợ" }
];

const LUC_NHAM = [
    { name: "Đại An", nghiaDen: "Bình yên lớn", nguHanh: "Dương Thổ", degree: 5, color: "Vàng thổ", direction: "Nơi trung tâm", tinhChat: "Chậm chạp nhưng chắc chắn", tinhNguoi: "Bậc quân tử chín chắn, nữ hiền hậu tính cách điềm đạm, là người đầy đặn, béo tốt", congViec: "Sự ổn định, là người làm tại nơi trung tâm, có quyền chức địa vị", benhTat: "Dạ dày hoặc tỳ" },
    { name: "Lưu Niên", nghiaDen: "Giữ lại thời gian", nguHanh: "Thủy", degree: "1,6", color: "Đen, Xanh dương", direction: "Phương Bắc hoặc Tây Bắc", tinhChat: "Hiểm độc, lừa dối, âm mưu, là mưu toan, là sự do dự, lo lắng", tinhNguoi: "", congViec: "Không chính danh, có tính phiêu lưu mạo hiểm, là phi pháp, phi đạo đức", benhTat: "Máu huyết hoặc thận" },
    { name: "Tốc Hỷ", nghiaDen: "Sự vui vẻ, may mắn, là nhanh chóng, là tốt đẹp sáng sủa", nguHanh: "Hỏa", degree: "2, 7", color: "Đỏ", direction: "Hướng Nam hoặc Đông Nam", tinhChat: "", tinhNguoi: "Quý nhân hay giúp đỡ người khác, là người thông minh, tài cao học rộng", congViec: "Chính danh, về học vấn là sự thành đạt, có học vị cao, là những dịch vụ phục vụ cho vẻ đẹp, cho nhu cầu tinh thần", benhTat: "Tim hoặc tinh thần" },
    { name: "Xích Khẩu", nghiaDen: "Sự tranh luận, cãi nhau, tiếng ồn ào, tiếng động", nguHanh: "Kim", degree: "4, 9", color: "Trắng, Xám trắng", direction: "Hướng Tây hoặc Tây Nam", tinhChat: "", tinhNguoi: "Người hay nói, lý luận khúc chiết, là người thấp, đầy đặn, nhiều lý trí", congViec: "Nghề liên quan đến kim khí, máy móc, liên quan đến miệng như: dạy học, luật sư, quảng cáo, thông tin...", benhTat: "Phổi, tai, xương cốt" },
    { name: "Tiểu Cát", nghiaDen: "Niềm vui nhỏ, là tin tức vui, là tình cảm, tình yêu, sự quí mến", nguHanh: "Mộc", degree: "3, 8", color: "Xanh lá cây", direction: "Hướng Đông hoặc Đông Bắc", tinhChat: "", tinhNguoi: "Người giàu tình cảm, là hôn nhân, tình duyên. Về hình thể là người yểu điệu, mình dây, duyên dáng, đàn ông cao gầy có tính hiền, ham học hỏi", congViec: "Người buôn bán nhỏ, có tiểu lợi, là người làm ăn liên quan đến gỗ cây, sách vở, tri thức...", benhTat: "Gan" },
    { name: "Vô Vong", nghiaDen: "Không được việc gì, hoặc không sao cả, là đất bỏ hoang", nguHanh: "Âm Thổ", degree: 10, color: "Vàng đất xỉn", direction: "Ở cạnh nơi trung tâm, ở phía dưới, là nền nhà", tinhChat: "", tinhNguoi: "Người vô tích sự, thất nghiệp", congViec: "", benhTat: "" }
];

const LUC_THU = [
    { name: "Thanh Long", color: "green" }, 
    { name: "Chu Tước", color: "red" }, 
    { name: "Câu Trận", color: "brown" }, 
    { name: "Đằng Xà", color: "brown" }, 
    { name: "Bạch Hổ", color: "gray" }, 
    { name: "Huyền Vũ", color: "black" }
];

const CAN_TO_LUC_THU_START = { "Giáp": 0, "Ất": 0, "Bính": 1, "Đinh": 1, "Mậu": 2, "Kỷ": 3, "Canh": 4, "Tân": 4, "Nhâm": 5, "Quý": 5 };