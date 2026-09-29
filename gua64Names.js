const guaNames = { 1: "Càn", 2: "Đoài", 3: "Ly", 4: "Tốn", 5: "Chấn", 6: "Khảm", 7: "Cấn", 8: "Khôn" };
const guaStructures = { 1: [1, 1, 1], 2: [1, 1, 0], 3: [1, 0, 1], 4: [0, 1, 1], 5: [1, 0, 0], 6: [0, 1, 0], 7: [0, 0, 1], 8: [0, 0, 0] };
const guaSymbols = { 1: "☰", 2: "☱", 3: "☲", 4: "☴", 5: "☳", 6: "☵", 7: "☶", 8: "☷" };
const gua64Names = { "1_1": "Thuần Kiền", "1_2": "Lý", "1_3": "Đồng Nhân", "1_4": "Cấu", "1_5": "Vô Vọng", "1_6": "Tụng", "1_7": "Độn", "1_8": "Bỉ", "2_1": "Quải", "2_2": "Thuần Đoài", "2_3": "Cách", "2_4": "Đại Quá", "2_5": "Tùy", "2_6": "Khốn", "2_7": "Hàm", "2_8": "Tụy", "3_1": "Đại Hữu", "3_2": "Khuê", "3_3": "Thuần Ly", "3_4": "Đỉnh", "3_5": "Phệ Hạp", "3_6": "Vị Tế", "3_7": "Lữ", "3_8": "Tấn", "4_1": "Tiểu Súc", "4_2": "Trung Phu", "4_3": "Gia Nhân", "4_4": "Thuần Tốn", "4_5": "Ích", "4_6": "Hoán", "4_7": "Tiệm", "4_8": "Quan", "5_1": "Đại Tráng", "5_2": "Quy Muội", "5_3": "Phong", "5_4": "Hằng", "5_5": "Thuần Chấn", "5_6": "Giải", "5_7": "Tiểu Quá", "5_8": "Dự", "6_1": "Nhu", "6_2": "Tiết", "6_3": "Ký Tế", "6_4": "Tỉnh", "6_5": "Truân", "6_6": "Thuần Khảm", "6_7": "Kiển", "6_8": "Tỷ", "7_1": "Đại Súc", "7_2": "Tổn", "7_3": "Bí", "7_4": "Cổ", "7_5": "Di", "7_6": "Mông", "7_7": "Thuần Cấn", "7_8": "Bác", "8_1": "Thái", "8_2": "Lâm", "8_3": "Minh Di", "8_4": "Thăng", "8_5": "Phục", "8_6": "Sư", "8_7": "Khiêm", "8_8": "Thuần Khôn" };

const HEXAGRAMS = [
    { 
        name: "Thuần Kiền", 
        description: "<div><p>Kiện dã. Chính yếu. Cứng mạnh, khô, lớn, khỏe mạnh, đức không nghỉ. Nguyên Hanh Lợi Trinh chi tượng: Tượng vạn vật có khởi đầu, lớn lên, toại chí, hóa thành; chính mình, chính diện, trước mặt.</p><p style='color:red;'>KIỀN: Kiện dã là mạnh mẽ.<br>- Ta bị sức mạnh. Ta được lớn mạnh.<br>- Ta hùng mạnh cho kẻ khác. Ta cường bạo với kẻ khác.</p></div>" 
    },
    { 
        name: "Lý", 
        description: "<div><p>Lễ dã. Lộ hành. Nghi lễ, có chừng mực, khuôn phép, dẫm lên,không cho đi sai, có ý chận đường sái quá,hệ thống, pháp lý. Hổ lang đang đạo chi tượng: Tượng hổ lang đón đường. Lễ nghĩa, hợp lý, lý lẽ, lời nói, lên đường, xe cộ.</p><p style='color:red;'>LÝ: Lễ dã là lễ phép, hệ thống qui.<br>- Ta bị theo phép. Ta được lễ kính.<br>- Ta lễ kính kẻ khác. Ta bắt lỗi kẻ khác.</p></div>" 
    },
    { 
        name: "Đồng Nhân", 
        description: "<div><p>Thân dã. Thân thiện. Trên dưới cùng lòng, cùng người ưa thích, cùng một bọn người. Hiệp lực đồng tâm chi tượng: Tượng cùng người hiệp lực. Gần gũi, giống nhau, đồng tâm, một cặp, bạn, đội bạn, người kế bên.</p><p style='color:red;'>ĐỒNG NHÂN: Thân dã là gần gũi, cùng chung với người khác.<br>- Ta bị yêu chuộng. Ta được sự đồng ý.<br>- Ta biểu đồng tình với kẻ khác. Ta ngang hàng thất kính kẻ khác.</p></div>" 
    },
    { 
        name: "Vô Vọng", 
        description: "<div><p>Thiên tai dã. Xâm lấn. Tai vạ, lỗi bậy bạ, không lề lối, không qui củ, làm càn đại, chống đối, hứng chịu. Cương tự ngoại lai chi tượng: Tượng kẻ mạnh từ ngoài đến; Làm bậy, không hy vọng, thất vọng, hư.</p><p style='color:red;'>VÔ VỌNG: Thiên tai dã là tai nạn tự nhiên.<br>- Ta bị xâm lấn. Ta được xâm phạm.<br>- Ta chịu sự xâm nhập. Ta xâm phạm kẻ khác.</p></div>" 
    },
    { 
        name: "Cấu", 
        description: "<div><p>Ngộ dã. Tương ngộ. Gặp gỡ, cấu kết, liên kết, kết hợp, móc nối, mềm gặp cứng. Phong vân bất trắc chi tượng: Gặp gỡ thình lình, ít khi, bất trắc; bắt tay, thông đồng, dính nhau.</p><p style='color:red;'>CẤU: Ngộ dã là gặp gỡ.<br>- Ta bị bất cập. Ta được cấu kết.<br>- Ta mai mối cho kẻ khác. Ta bắt gặp kẻ khác.</p></div>" 
    },
    { 
        name: "Tụng", 
        description: "<div><p>Luận dã. Bất hoà. Bàn cãi, kiện tụng, bàn tính, cãi vã, tranh luận, bàn luận. Đại tiểu bất hòa chi tượng: Lớn nhỏ không hòa; Không vừa ý, trái ýnhau, không hợp, bất ổn.</p><p style='color:red;'>TỤNG: Luận dã là luận bàn, kiện cáo.<br>- Ta bị tranh tụng. Ta được sự biện minh.<br>- Ta biện luận cho kẻ khác. Ta gây gổ kiện tụng kẻ khác.</p></div>" 
    },
    { 
        name: "Độn", 
        description: "<div><p>Thoái dã. Ẩn trá. Lui, ẩn khuất, tránh đời, lừa dối, trá hình, có ýtrốn tránh, trốn cái mặt đưa thấy cái lưng. Báo ẩn Nam Sơn chi tượng: Tượng con Báo ẩn ở núi Nam; Đi mất, đồ giả.</p><p style='color:red;'>ĐỘN: Thoái dã là lui ẩn, trốn đi.<br>- Ta bị ẩn trốn. Ta được ẩn trốn.<br>- Ta che dấu cho kẻ khác. Ta ẩn trốn kẻ khác.</p></div>" 
    },
    { 
        name: "Bỉ", 
        description: "<div><p>Tắc dã. Gián cách. Bế tắc,không thông, không tương cảm nhau, xui xẻo, dèm pha, chê bai lẫn nhau, mạnh ai nấy theo ý riêng. Thượng hạ tiếm loạn chi tượng: Tượng trên dưới lôi thôi; chấm hết, không hiểu, không xong.</p><p style='color:red;'>BĨ: Tắc dã là bế tắc.<br>- Ta bị bế tắc. Ta được sự bế tắc.<br>- Ta bế tắc cho kẻ khác. Ta tắc nghẽn kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Đoài", 
        description: "<div><p>Duyệt dã. Hiện đẹp. Đẹp đẽ, ưa thích, vui hiện trên mặt, không buồn chán, cười nói, khuyết mẻ, hủy triết, lý thuyết. Hỉ dật mi tự chi tượng: Tượng vui hiện trên mặt, khẩu khí; chỉ nói năng, đổ bể, xuất khẩu, cửa, lời nói.</p><p style='color:red;'>ĐOÀI: Duyệt dã là vui lòng, hiện đẹp.<br>- Ta bị đùa cợt. Ta được vui đẹp.<br>- Ta vui đẹp cho kẻ khác. Ta cười chê, đùa cợt kẻ khác.</p></div>" 
    },
    { 
        name: "Quải", 
        description: "<div><p>Quyết dã. Dứt khoát. Dứt hết, biên cương, ranh giới, thành phần, thành khoảnh, quyết định, quyết nghị, cổ phần, thôi, khai lề lối. Ích chi cực tắc quyết chi tượng: Tượng lợi đã cùng ắt thôi; gãy, đứt.</p><p style='color:red;'>QUẢI: Quyết dã là quyết đoán, dứt khoát.<br>- Ta bị dứt quyết. Ta được sự quyết định.<br>- Ta dứt khoát, phán cho kẻ khác. Ta cương quyết cắt đứt kẻ khác.</p></div>" 
    },
    { 
        name: "Cách", 
        description: "<div><p>Cải dã. Cải biến. Bỏ lối cũ, cải cách, hoán cải, cách tuyệt, cánh chim thay lông. Thiên uyên huyền cách chi tượng: Tượng vực trời xa thẳm; thay đổi, trở mặt, cách xa.</p><p style='color:red;'>CÁCH: Cải dã là thay đổi.<br>- Ta bị cải biến. Ta được hoán cải.<br>- Ta hoàn thiện cho kẻ khác. Ta biến chế kẻ khác.</p></div>" 
    },
    { 
        name: "Tùy", 
        description: "<div><p>Thuận dã. Di động. Cùng theo, mặc lòng, không có chí hướng, chỉ chìu theo, đại thể chỉ việc di động thuyên chuyển như chiếc xe. Phản phúc bất định chi tượng: Tượng loại không ở; việc còn chạy, còn động, đi.</p><p style='color:red;'>TÙY: Thuận dã là theo.<br>- Ta bị lệ thuộc. Ta được tùy nghi.<br>- Ta chìu chuộng kẻ khác. Ta lệ thuộc hóa kẻ khác.</p></div>" 
    },
    { 
        name: "Đại Quá", 
        description: "<div><p>Họa dã. Cả quá. Cả quá ắt có tai họa, quá mực thường, quá nhiều, giàu cương nghị ở trong. Nộn thảo kinh sương chi tượng: Tượng cỏ non bị sương tuyết; quá đáng, quá cở.</p><p style='color:red;'>ĐẠI QUÁ: Quá dã là nhiều quá, thái quá.<br>- Ta bị quá đỗi. Ta được tích cực.<br>- Ta tích cực cho kẻ khác. Ta quá độ cho kẻ khác.</p></div>" 
    },
    { 
        name: "Khốn", 
        description: "<div><p>Nguy dã. Nguy lo. Cùng quẫn, bị người làm ách, lo lắng, cùng khổ, mệt mỏi, nguy cấp, lo hiểm nạn. Thủ kỷ đãi thời chi tượng: Tượng giữ mình đợi thời.</p><p style='color:red;'>KHỐN: Nguy dã là lo âu, nguy khốn.<br>- Ta bị nguy khốn. Ta được lo lắng.<br>- Ta lo lắng cho kẻ khác. Ta làm nguy khốn kẻ khác.</p></div>" 
    },
    { 
        name: "Hàm", 
        description: "<div><p>Cảm dã. Thụ cảm. Cảm xúc, cảm ứng, thọ nhận, nghe thấy, nghĩ đến, xúc động. Nam nữ giao cảm chi tượng: Tượng nam nữ có tình ý; nhạy cảm, nhận biết.</p><p style='color:red;'>HÀM: Cảm dã là cảm xúc.<br>- Ta bị cảm động. Ta được cảm tương.<br>- Ta tương cảm đến kẻ khác. Ta làm xúc động kẻ khác.</p></div>" 
    },
    { 
        name: "Tụy", 
        description: "<div><p>Tu dã. Trưng tập. Nhóm hợp, biểu tình, dồn đống, quần tụ nhau lại, kéo đến, kéo thành bầy. Long vân tế hội chi tượng: Tượng rồng mây giao hội; tụ hội, gom lại.</p><p style='color:red;'>TỤY: Tụ dã, tụ họp, tụ lại mà không đi.<br>- Ta bị trưng tập. Ta được tụ tập.<br>- Ta cổ động cho kẻ khác. Ta trưng tập kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Ly", 
        description: "<div><p>Lệ dã. Nóng sáng. Sáng sủa, trống trải, trống trơn, toảra, bám vào, phụ bám, phô trương ra ngoài. Môn hộ bất ninh chi tượng: Tượng nhà cửa không yên; có việc xui rủi.</p><p style='color:red;'>LY: Lệ dã là sáng sủa, bám vào, phụ vào.<br>- Ta bị tranh sáng. Ta được sáng sủa.<br>- Ta sáng tỏ cho kẻ khác. Ta tranh sáng với kẻ khác.</p></div>" 
    },
    { 
        name: "Đại Hữu", 
        description: "<div><p>Khoan dã. Cả có. Có nhiều, thong dong, dung dưỡng nhiều. Độ lượng rộng, có đức dày, chiếu sáng lớn. Kim ngọc mãn đường chi tượng: Tượng vàng bạc đầy nhà; bạn hữu, số nhiều.</p><p style='color:red;'>ĐẠI HỮU: Khoan dã là cả có.<br>- Ta bị trùng điệp. Ta có được nhiều.<br>- Ta phong phú cho kẻ khác. Ta đa sự với kẻ khác.</p></div>" 
    },
    { 
        name: "Khuê", 
        description: "<div><p>Quai dã. Hổ trợ. Trái lìa, lìa xa, 2 bên lợi dụng lẫn nhau, cơ biến quai xảo, như cung tên, súng đạn. Hồ giả hổ oai chi tượng: Tượng con hồ nhờ oai con hổ; nhờ, mượn sức, ra oai, giả tạo, lỡ việc, dở dang.</p><p style='color:red;'>KHUÊ: Quai dã là trái lìa, nhờ vả lẫn nhau.<br>- Ta bị hỗ trợ. Ta được hỗ trợ.<br>- Ta hỗ trợ cho kẻ khác. Ta được thế lực hùng hổ với kẻ khác.</p></div>" 
    },
    { 
        name: "Phệ Hạp", 
        description: "<div><p>Khiết dã. Cắn hợp. Cấu hợp, bấu vấu, vặn vẹo, nhai, bấu quào, dày xéo, đay nghiến, phỏng vấn, hỏi han(học hỏi). Uy mị bất chấn chi tượng: Tượng yếu đuối không chạy được; cào cấu, bắt tay, chà đạp.</p><p style='color:red;'>PHỆ HẠP: Khiết dã là cắn hợp, hỏi han.<br>- Ta bị đay nghiến. Ta được cắn hợp.<br>- Ta chịu sự dày xéo. Ta đay nghiến kẻ khác.</p></div>" 
    },
    { 
        name: "Đỉnh",
        description: "<div><p>Định dã. Nung đúc. Đứng được, cậm đứng, trồng, nung nấu, rèn luyện, vững chắc, ước hẹn. Luyện dược thành đan chi tượng: Tượng luyện thuốc thành linh đơn; hứa hẹn, học, đứng tại chỗ, an định.</p><p style='color:red;'>ĐỈNH: Định dã là nung nấu, ung đúc.<br>- Ta bị nung nấu. Ta được ung đúc.<br>- Ta ung đúc kẻ khác. Ta nung đốt kẻ khác.</p></div>"
    },
    { 
        name: "Vị Tế", 
        description: "<div><p>Thất dã. Thất cách. Thất bác, mất, thất bại, dở dang, chưa xong, nửa chừng. Ưu trung vọng hỷ chi tượng: Tượng trong cái lo có cái mừng; nửa đường, không hay, xui, việc nửa thành nửa bại….</p><p style='color:red;'>VỊ TẾ: Thất dã là thất bác, dở dang.<br>- Ta bị dở dang. Ta nhờ sự dở dang.<br>- Ta thất bác cho kẻ khác. Ta phá hỏng kẻ khác.</p></div>" 
    },
    { 
        name: "Lữ", 
        description: "<div><p>Khách dã. Thứ yếu. Đỗ nhờ, khách, ở đậu, tạm trú, kê vào, gá vào, ký ngụ bên ngoài, tính cách lang thang, ít người thân, không chính. Ỷ nhân tác giá chi tượng: Tượng nhờ người mai mối; tạm thời, ngoài lề, phụ trợ.</p><p style='color:red;'>LỮ: Khách dã là khách, ở trọ, lữ thứ.<br>- Ta bị lang thang. Ta được khách quý.<br>- Ta bằng lòng cho ở đỗ. Ta tá ngụ nhà người.</p></div>" 
    },
    { 
        name: "Tấn", 
        description: "<div><p>Tiến dã. Hiển hiện. Đi hoặc tới, tiến tới gần, theo mực thường, lửa đã hiện trên mặt đất, ra mặt, trưng bày. Long kiến từơng trình chi tượng: Tượng rồng hiện điềm lành; phát triển.</p><p style='color:red;'>TẤN: Tiến dã là đến hay đi, tiến tới.<br>- Ta bị đi. ta được đến.<br>- Ta hiện diện cho kẻ khác. Ta xuồng xã đến kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Chấn", 
        description: "<div><p>Động dã. Động dụng. Rung động, sợ hãi do chấn động, phấn phát, nổ vang, phấn khởi, chấn kinh, nẩy mầm. Trùng trùng chấn kinh chi tượng: Tượng khắp cùng dấy động; âm thanh, mở ra, xúc động.</p><p style='color:red;'>CHẤN: Động dã là chấn động, dấy khởi.<br>- Ta bị kinh động. Ta được dấy động.<br>- Ta hoạt động cho kẻ khác. Ta gây kinh động cho kẻ khác.</p></div>" 
    },
    { 
        name: "Đại Tráng", 
        description: "<div><p>Chí dã. Tự cường. Ý riêng, bụng nghĩ, hướng thượng, ý định, vượng sức, thịnh đại, trên cao, chót vót, lên trên, chí khí, có lập trường, đơn độc. Phượng tập đăng sơn chi tượng: Tượng phượng đậu trên núi; cõi trên, việc riêng, tự mình, động trên cao, bay trên cao, độc lập.</p><p style='color:red;'>TRÁNG: Chí dã là chí khí bền.<br>- Ta bị lập nên. Ta có được chí khí.<br>- Ta chí chính cho kẻ khác. Ta hùng tráng với kẻ khác.</p></div>" 
    },
    { 
        name: "Quy Muội", 
        description: "<div><p>Tai dã. Xôn xao. Tai nạn, rối ren, lôi thôi, chen lẫn, nữ chi chung, gái lấy chồng. Ác qủy vi sủng chi tượng: Tượng ma quái làm rối; ngu muội, mờ mịt.</p><p style='color:red;'>QUI MUỘI: Tai dã là tai nạn, rối ren.<br>- Ta bị đẹp động. Ta được đẹp động.<br>- Ta chịu sự rối ren cho kẻ khác. Ta khuấy rối kẻ khác.</p></div>" 
    },
    { 
        name: "Phong", 
        description: "<div><p>Thịnh đại dã. Hoà mỹ. Thịnh đại, được mùa, nhiều người góp sức. Chí đồng đạo hợp chi tượng: Tượng cùng đồng tâm hiệp lực; nở lớn.</p><p style='color:red;'>PHONG: Thịnh dã là thịnh đại, lớn.<br>- Ta bị đồng hóa. Ta được hòa đồng.<br>- Ta hòa đồng với kẻ khác. Ta đồng hóa với kẻ khác.</p></div>" 
    },
    { 
        name: "Hằng", 
        description: "<div><p>Cửu dã. Trường cửu. Lâu dài. Chậm chạp, đạo lâu bền như vợ chồng, kéo dài câu chuyện, thâm giao, nghĩa cố tri, xưa, cũ. Trường cửu chi nghĩa chi tượng: Tượng lâu bền như đạo nghĩa; thường ngày, vết hằng, lối cũ, thói quen, đường mòn, không thay đổi.</p><p style='color:red;'>HẰNG: Cửu dã là lâu, bền vững.<br>- Ta bị kéo dài. Ta được bền vững.<br>- Ta bền chặt với kẻ khác. Ta đeo theo kẻ khác.</p></div>" 
    },
    { 
        name: "Giải", 
        description: "<div><p>Tán dã. Nơi nơi. Làm cho tan đi như làm tan sự nguy hiểm, giải phóng, giải tán, loan truyền, phân phát, lưu thông, ban rải, ân xá. Lôi vũ tác giải chi tượng: Tượng sấm động mưa bay; bung ra, ly tán.</p><p style='color:red;'>GIẢI: Thuận dã là phân tán, cởi mở, giải đãi.<br>- Ta bị phân tán. Ta được phóng thích.<br>- Ta phóng thích cho kẻ khác.</p></div>" 
    },
    { 
        name: "Tiểu Quá", 
        description: "<div><p>Họa dã. Bất túc. Thiểu não, thiểu lý, hèn mọn, nhỏnhặt, bẩn thỉu, thiếu cường lực. Thượng hạ truân chuyên chi tượng: Tượng trên dưới gian nan, vất vả, buồn thảm; ép bức, không đầy đủ, vật nhỏ.</p><p style='color:red;'>TIỂU QUÁ: Quá dã là nhỏ quá, thiểu lý.<br>- Ta bị hèn hạ. Ta được phận mọn.<br>- Ta đoái hoài đến kẻ khác. Ta phiền nhiễu kẻ khác.</p></div>" 
    },
    { 
        name: "Dự", 
        description: "<div><p>Duyệt dã. Thuận động. Dự bị, dự phòng, canh chừng, sớm, vui vầy. Thượng hạ duyệt dịch chi tượng: Tượng trên dưới vui vẻ; chờ, do dự, động trên đất, hàng rào, động trong âm u, động trong manh nha; dè chừng.</p><p style='color:red;'>DỰ: Duyệt dã là phòng bị, vui vẻ.<br>- Ta bị múa rối. Ta được vui động.<br>- Ta động vui cho kẻ khác. Ta múa rối, rộn tan kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Tốn", 
        description: "<div><p>Thuận nhập dã. Thuận nhập. Thẩm thấu, theo lên theo xuống, theo tới theo lui, có sựgiấu diếm ở trong. Âm dương thăng giáng chi tượng: Tượng khí âm dương lên xuống giao hợp; thu nhập, nhập vào, nhập lại.</p><p style='color:red;'>TỐN: Nhập dã là thuận, vào ở trong.<br>- Ta bị sát nhập. Ta được gia nhập.<br>- Ta thuận nhập, vào ra với kẻ khác. Ta du nhập, đột nhập kẻ khác.</p></div>" 
    },
    { 
        name: "Tiểu Súc", 
        description: "<div><p>Tắc dã. Dị đồng. Lúc bế tắc, không đồng ý nhau, cô quả, cô độc, súc oán, chứa mối oán hận, có ý trái lại, không hòa hợp, nhỏ nhen. Cầm sắc bất điệu chi tượng: Tượng tiếng đờn không hoà điệu; khác lạ, đặc biệt, tiểu nhân, nhỏ, ít.</p><p style='color:red;'>TIỂU SÚC: Tắc dã là chứa góp ít.<br>- Ta bị cô đơn. Ta được riêng ý.<br>- Ta độc đáo vì kẻ khác. Ta cô lập hay là bất điệu với kẻ khác.</p></div>" 
    },
    { 
        name: "Trung Phu", 
        description: "<div><p>Tín dã. Trung thật. Tín thật, không ngờ vực, có uy tín cho người tin tưởng, tín ngưỡng, ở trong, ở giữa. Nhu tại nội nhi đắc trung chi tượng: Tượng âm ở bên trong mà được giữa; trung hư, tư tưởng tinh thần thôi, trung niên, nội bộ bên trong.</p><p style='color:red;'>TRUNG PHU: Tín dã là tin cẩn.<br>- Ta bị ủy nhiệm. Ta được tín nhiệm.<br>- Ta tin tưởng kẻ khác. Ta ủy nhiệm kẻ khác.</p></div>" 
    },
    { 
        name: "Gia Nhân", 
        description: "<div><p>Đồng dã. Nẩy nở. Là người nhà, gia đinh, cùng gia đình, đồng chủng, người đồng nghiệp, người cùng xóm, sinh sôi, thêm nữa, khai thác mở mang thêm. Khai hoa kết tử chi tượng: Tượng trổ bông sinh trái, nẩy mầm; việc trẻ con, phát sinh, việc phụ, việc nhỏ, làm thêm nữa, nhân sự.</p><p style='color:red;'>GIA NHÂN: Đồng dã là cùng nhau.<br>- Ta bị thêm người. Ta được sinh sôi nẩy nở.<br>- Ta sinh sôi cho kẻ khác. Ta đồng hóa kẻ khác làm gia đình.</p></div>" 
    },
    { 
        name: "Ích", 
        description: "<div><p>Ích dã. Tiến ích. Thêm được lợi, giúp dùm, tiếng dội xa, vượt lên, phóng mình tới. Hồng Hộc xung tiêu chi tượng: Tượng chim Hồng, chim Hộc bay qua mây mù; vọt đi, bay đi, thêm lợi, thêm lên, lấn tới.</p><p style='color:red;'>ÍCH: Ích dã là tăng thêm, ích lợi.<br>- Ta bị lợi dụng. Ta được lợi ích.<br>- Ta ban lộc cho người. Ta lợi dụng kẻ khác.</p></div>" 
    },
    { 
        name: "Hoán", 
        description: "<div><p>Tán dã. Ly tán. Lan ra, tràn lan, nổi trôi, tán thất, trốn đi xa, lánh xa, thất nhân tâm, hao hớt. Thủy ngộ phong tắc hoán tán chi tượng: Tượng nước gặp gió thì phải tan phải chạy; phân ly, đi xa.</p><p style='color:red;'>HOÁN: Tán dã là tan ra, lìa tan.<br>- Ta bị xa lánh. Ta được xa lánh.<br>- Ta phi tang cho kẻ khác. Ta tan biến kẻ khác.</p></div>" 
    },
    { 
        name: "Tiệm", 
        description: "<div><p>Tiến dã. Tuần tự. Từ từ, thong thả đến, lần lần, bậc thang, bò tới, chậm chạp, nhai nhỏ nuốt vào. Phúc lộc đồng lâm chi tượng: Tượng phúc lộc cùng đến; đi tới, tiến hành, tiến trình, trật tự, từng bước, (động từ).</p><p style='color:red;'>TIỆM: Tiến dã là tiến bộ lần lần.<br>- Ta bị tuần tự. Ta được tiệm tiến.<br>- Ta thứ tự cho kẻ khác. Ta chậm chạp và trật tự kẻ khác.</p></div>" 
    },
    { 
        name: "Quan", 
        description: "<div><p>Quan dã. Quan sát. Xem xét, trông coi, cảnh tượng xem thấy, thanh tra, duyệt binh, khán trận, lướt qua, sơ qua, quét nhà.Vân bình tụ tán chi tượng: Tượng bèo mây tan hợp; Thấy, nhìn thấy, khách.</p><p style='color:red;'>QUÁN: Quan dã là xem xét, quan sát.<br>- Ta bị quan sát. Ta được xem xét.<br>- Ta trông nom cho kẻ khác. Ta quan sát kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Khảm", 
        description: "<div><p>Hãm dã. Hãm hiểm. Hãm vào ở trong, xuyên sâu vào trong, đóng cửa lại, gập gềnh, trắc trở, bắt buộc, kiềm hãm, thắng. Khổ tận cam lai chi tượng: Tượng hết khổ mới đến sướng; cột gút, trụ cột, kẹt, kẹp, khóa, nước, lạnh, đen tối, hiểm sâu, nghe được, ý thích.</p><p style='color:red;'>KHẢM: Hãm dã là hiểm nguy, bắt buộc.<br>- Ta bị hãm hiểm. Ta được kềm hãm.<br>- Ta chịu sự kềm hãm cho kẻ khác. Ta đóng khung kẻ khác.</p></div>" 
    },
    { 
        name: "Nhu", 
        description: "<div><p>Thuận dã. Tương hội. Chờ đợi vì có hiểm đằng trước, thuận theo, quây quần, hội tụ, vui hội, cứu xét, nghiên cứu, chầu về. Quân tử hoan hội chi tượng: Tượng quân tử hội hợp vui vẻ, ăn uống chờ thời; song hội, bằng hữu gặp nhau.</p><p style='color:red;'>NHU: Thuận dã là chờ đợi nhu cầu.<br>- Ta bị nghiệm xét. Ta được cứu xét.<br>- Ta nghiên cứu cho kẻ khác. Ta nghiệm xét kẻ khác.</p></div>" 
    },
    { 
        name: "Tiết", 
        description: "<div><p>Chỉ dã. Giảm chế. Ngăn ngừa, tiết độ, chừng mực, kềm chế, giảm bớt, nhiều thì tràn. Trạch thượng hữu thủy chi tượng: Tượng trên đầm có nước; tiết ra, nước trên đầm tràn ra nhưng cũng còn giữ lại phần nào, nên gọi là giảm bớt thôi.</p><p style='color:red;'>TIẾT: Chỉ dã là chừng mực, hạn chế.<br>- Ta bị hạn chế. Ta được hạn chế.<br>- Ta tiết kiệm cho kẻ khác. Ta tiết chế kẻ khác.</p></div>" 
    },
    { 
        name: "Ký Tế", 
        description: "<div><p>Hợp dã. Hiện hợp. Gặp nhau, cùng nhau, đã xong, việc xong, hiện thực, ích lợi nhỏ. Hanh tiểu giả chi tượng: Tượng việc nhỏ thì thành; kết hợp, hợp tác, từng cặp, hoàn thành, kế bên.</p><p style='color:red;'>KÝ TẾ: Hợp dã là hợp pháp.<br>- Ta bị hợp cùng. Ta được hiệp nhau.<br>- Ta hợp lý cho kẻ khác. Ta cấu hợp kẻ khác.</p></div>" 
    },
    { 
        name: "Truân", 
        description: "<div><p>Nạn dã. Gian lao. Yếu đuối, chưa đủ sức, ngần ngại, do dự, vất vả, phải nhờ sự giúp đỡ. Tiền hung hậu kiết chi tượng: Tượng trước dữ sau lành; khó khăn, gian nan, vướng víu.</p><p style='color:red;'>TRUÂN: Nạn dã là khó khăn, trở ngại.<br>- Ta bị gian nan. Ta được cứu khó.<br>- Ta truân chuyên vì kẻ khác. Ta gây gian truân kẻ khác.</p></div>" 
    },
    { 
        name: "Tỉnh", 
        description: "<div><p>Tịnh dã. Trầm lặng. Ở chỗ nào cứ ở yên chỗ đó, xuống sâu, vực thẳm có nước, dưới sâu, cái giếng. Kiền Khôn sất phối chi tượng: Tượng Trời Đất phối hợp lại; im lặng, bất động, bình an, ổn định.</p><p style='color:red;'>TĨNH: Tịnh dã là trầm lặng, sâu.<br>- Ta bị dìm sâu. Ta được yên lặng.<br>- Ta đem sự bình an cho kẻ khác. Ta dìm sâu kẻ khác.</p></div>" 
    },
    { 
        name: "Kiển", 
        description: "<div><p>Nạn dã. Trở ngại. Cản ngăn, chận lại, chậm chạp, khập khiển, què quặt, khó khăn. Bất năng tiến giả chi tượng: Tượng không năng đi; ngưng lại.</p><p style='color:red;'>KIỂN: Nạn dã là hoạn nạn, khó khăn.<br>- Ta bị trở ngại. Ta được sự ngăn trở.<br>- Ta ngăn ngừa cho kẻ khác. Ta chướng ngại kẻ khác.</p></div>" 
    },
    { 
        name: "Tỷ", 
        description: "<div><p>Tư dã. Chọn lọc. Thân liền, gạn lọc, mật thiết, tư hữu riêng, trưởng đoàn, trưởng toán, chọn lựa, quy căn, quy về một mối. Khử xàm nhiệm hiền chi tượng: Tượng bỏ nịnh dụng trung; tuyển chọn, người thân, chiết xuất.</p><p style='color:red;'>TỶ: Thân dã, tư dã là hân hoan, thân liền.<br>- Ta bị tư thân. Ta được tư thân.<br>- Ta cầu thân với kẻ khác. Ta cởi bỏ mọi người.</p></div>" 
    },
    { 
        name: "Thuần Cấn", 
        description: "<div><p>Chỉ dã. Ngưng nghỉ. Ngăn giữ, ở, thôi, dừng lại, gói ghém, ngăn cấm, vừa đúng chỗ. Thủ cựu đãi thời chi tượng: Tượng giữ mức cũ đợi thời; chờ đợi.</p><p style='color:red;'>CẤN: Chỉ dã là ngăn giữ.<br>- Ta bị ngăn chặn. Ta được ngăn chặn.<br>- Ta ngăn ngừa cho kẻ khác. Ta ngăn giữ kẻ khác.</p></div>" 
    },
    { 
        name: "Đại Súc", 
        description: "<div><p>Tụ dã. Tích tụ. Chứa tụ, súc tích, lắng tụ một chỗ, dự trữ, đựng, để dành, .Đồng loại hoan hội chi tượng: Tượng đồng loại hội hợp vui vẻ, cục bộ; đại hội, gặp gỡ trong một phe.</p><p style='color:red;'>ĐẠI SÚC: Tụ dã là chứa lớn.<br>- Ta bị tích tụ. Ta được tích tụ.<br>- Ta nuôi chứa kẻ khác. Ta đồn tụ kẻ khác.</p></div>" 
    },
    { 
        name: "Tổn", 
        description: "<div><p>Thất dã. Tổn hại. Tổn thất, hao mất, thua thiệt, bớt kém, bớt phần dưới cho phần trên là tổn hại. Phòng nhân ám toán chi tượng: Tượng đề phòng sự ngầm hại, hao tổn.</p><p style='color:red;'>TỔN: Thất dã, hao tổn, thất bác.<br>- Ta bị hao tổn. Ta được ban bố.<br>- Ta ban bố cho kẻ khác. Ta tổn hại kẻ khác.</p></div>" 
    },
    { 
        name: "Bí", 
        description: "<div><p>Sức dã. Quang minh. Trang sức, phản chiếu, sửa sang, trang điểm, thấu suốt, nội soi, rõ ràng. Quang minh thông đạt chi tượng: Tượng quang minh, sáng sủa, thấu suốt; bày tỏ.</p><p style='color:red;'>BÍ: Sức dã là trang sức, thông suốt.<br>- Ta bị thấu suốt. Ta được sáng suốt.<br>- Ta sáng tỏ cho kẻ khác. Ta đả thông kẻ khác.</p></div>" 
    },
    { 
        name: "Di", 
        description: "<div><p>Dưỡng dã. Dung dưỡng. Chăm lo, tu bổ, càng thêm, ăn uống, bổ dưỡng, bồi dưỡng, ví như Trời nuôi muôn vật, Thánh nhân nuôi người. Phi Long nhập uyên chi tượng: Tượng Rồng vào vực nghỉ ngơi; Ý nuôi dưỡng, chờ đợi.</p><p style='color:red;'>DI: Dưỡng dã là chăm lo, nuôi nấng.<br>- Ta bị an nghỉ. Ta được bồi dưỡng.<br>- Ta bồi dưỡng cho kẻ khác. Ta an nghỉ kẻ khác.</p></div>" 
    },
    { 
        name: "Cổ", 
        description: "<div><p>Sự dã. Sự biến. Sự cố, có sự không yên trong lòng, làm ngờ vực, khua, đánh, mua chuốc cái hại, đánh trống, làm cho sợ sệt, sửa lại cái lỗi trước đã làm. Am hại tương liên chi tượng: Tượng điều hại cùng có liên hệ; sửa lại, hư hại.</p><p style='color:red;'>CỔ: Sự dã là cớ sự, việc.<br>- Ta bị cớ sự. Ta được cớ sự.<br>- Ta chịu cớ sự cho kẻ khác. Ta gây cớ sự với kẻ khác.</p></div>" 
    },
    { 
        name: "Mông", 
        description: "<div><p>Muội dã. Bất minh. Tối tăm, mờ mịt, mờ ám, không minh bạch, che lấp, bao trùm, phủ chụp, ngu dại, ngờ nghệch. Thiên võng tứ trương chi tượng: Tượng lưới trời giăng bốn mặt; âm mưu, gài bẫy, hư ảo, không biết.</p><p style='color:red;'>MÔNG: Muội dã là mờ mịt, tối tăm.<br>- Ta bị ám muội. Ta được sự ám muội.<br>- Ta che đậy mờ ám cho kẻ khác. Ta bất minh với kẻ khác.</p></div>" 
    },
    { 
        name: "Bác", 
        description: "<div><p>Lạc dã. Tiêu điều. Đẽo gọt, lột cướp đi, không lợi, rụng rớt, đến rồi lại đi, tản lạc, lạt lẽo nhau, xa lìa nhau, hoang vắng, buồn thảm. Lục thân băng thán chi tượng: Tượng bà con thân thích xa lìa nhau; gạt bỏ, mất đi.</p><p style='color:red;'>BÁC: Lạc dã là bớt, lột mất.<br>- Ta bị lột xác. Ta được xoá mờ.<br>- Ta xoá nhoà cho kẻ khác. Ta lột xác kẻ khác.</p></div>" 
    },
    { 
        name: "Thuần Khôn", 
        description: "<div><p>Thuận dã. Nhu thuận. Thuận tòng, mềm dẽo, theo đường mà được lợi, hòa theo lẽ, chịu lấy, chìu theo, toại chí, đạt thành. Nhu thuận lợi trinh chi tượng; biết chỗ có lợi mà nhờ, âm khí, âm u.</p><p style='color:red;'>KHÔN: Thuận dã là mềm mỏng.<br>- Ta bị nhu nhược. Ta được sự nhu thuận.<br>- Ta mềm mỏng với kẻ khác. Ta nhu nhược với kẻ khác.</p></div>" 
    },
    { 
        name: "Thái", 
        description: "<div><p>Thông dã. Điều hoà. Thông hiểu, thông suốt, hiểu biết, am tường, quen biết, quen thuộc. Thiên Địa hòa xướng chi tượng: Tượng Trời Đất giao hòa; bằng nhau, thông nhau, huề, biết người hiểu mình, thông tin.</p><p style='color:red;'>THÁI: Thông dã là hanh thông.<br>- Ta bị thông tri. Ta được thông hiểu.<br>- Ta khai thông cho kẻ khác. Ta thông thạo hơn người.</p></div>" 
    },
    { 
        name: "Lâm", 
        description: "<div><p>Đại dã. Bao quản. Lớn lên, việc lớn, cha nuôi, vú nuôi, giáo học, nhà sư, kẻ cả, dạy dân, nhà thầu, giáng lâm, giáng hạ. Quân tử dĩ giáo tư chi tượng: Tượng người quân tử dạy dân, che chở, bảo bọc dân vô bờ bến; thầy, chủ nhà, giám đốc, học.</p><p style='color:red;'>LÂM: Đại dã là lớn ở trên soi xuống.<br>- Ta bị giáo hoá. Ta được giáo dục.<br>- Ta giáo tư, dung chở cho kẻ khác. Ta tự đại với kẻ khác.</p></div>" 
    },
    { 
        name: "Minh Di", 
        description: "<div><p>Thương dã. Hại đau. Thương tích, bệnh hoạn, buồn lo, đau lòng, ánh sáng bị thương. Kinh cức mãn đường chi tượng: Tượng gai góc đầy đường; u uất, vắng bóng, tối tăm, bóng đêm, khuất dạng.</p><p style='color:red;'>MINH DI: Thương dã là bị thương.<br>- Ta bị thương. Ta được thương hại.<br>- Ta đau thương vì kẻ khác. Ta gây tang thương cho kẻ khác.</p></div>" 
    },
    { 
        name: "Phục", 
        description: "<div><p>Phản dã. Tái hồi. Tái diễn, lại có, trởvề, quây đầu, bên ngoài, phản phục, phục hưng, phục hồi. Sơn ngoại thanh sơn chi tượng: Tượng ngoài núi lại có núi nữa; phản bội, phản đòn, động trong manh nha, giật.</p><p style='color:red;'>PHỤC: Phản dã là trở lại, tái hồi.<br>- Ta bị phản bội. Ta được sự trở về.<br>- Ta phục hưng cho kẻ khác. Ta phản bội kẻ khác.</p></div>" 
    },
    { 
        name: "Thăng", 
        description: "<div><p>Tiến dã. Tiến thủ. Thăng tiến, trực chỉ, tiến mau, bay lên, vọt tới trước, bay lên không trung, thăng chức, thăng hà . Phù giao trực thượng chi tượng: Tượng chòi đạp để ngoi lên trên.</p><p style='color:red;'>THĂNG: Tiến dã là vọt lên, đi không trở lại.<br>- Ta bị hối hả. Ta được mau chóng.<br>- Ta sốt sắng cho kẻ khác. Ta hối thúc kẻ khác.</p></div>" 
    },
    { 
        name: "Sư", 
        description: "<div><p>Chúng dã. Chúng trợ. Đông chúng, vừa làm thầy vừa làm bạn, học hỏi lẫn nhau, níu nắm nhau qua truông, nâng đỡ. Sĩ chúng ủng tòng chi tượng: Tượng chúng ủng hộ nhau; chủ nhà, đứng đầu các ngành.</p><p style='color:red;'>SƯ: Chúng dã, ủng hộ nhau, nhiều người.<br>- Ta bị áp chúng. Ta được chúng ủng hộ.<br>- Ta ủng hộ kẻ khác. Ta được chúng ủng hộ.</p></div>" 
    },
    { 
        name: "Khiêm", 
        description: "<div><p>Thoái dã. Thoái ẩn. Khiêm tốn, nhún nhường, khiêm từ, cáo thoái, từ giã, lui vào trong, giữ gìn nhốt vào trong, bếcửa, nội ngoại lăng nhục. Thượng hạ mông lung chi tượng: Tượng trên dưới hoang mang; phía sau, thoái lui.</p><p style='color:red;'>KHIÊM: Thoái dã là lui lại, nhún nhường.<br>- Ta bị miệt thị. Ta được nhún nhường.<br>- Ta khiêm tốn với kẻ khác. Ta miệt thị kẻ khác.</p></div>" 
    }
];
