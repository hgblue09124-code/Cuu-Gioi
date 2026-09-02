/* ==========================================================================
   CỬU GIỚI - STORY ENGINE v1.0 (Big Update)

   Ghi chú sửa lỗi v0.4.4:
   Bản trước tham chiếu tới gameState / SaveSystem / UI.* / Inventory.*
   — những object này không tồn tại trong engine (engine dùng biến
   toàn cục `player`, hàm `autoSave()`, `render()`, `log()`,...).
   v1.0: Mở rộng thêm 7 story node mới.
   ========================================================================== */

const STORY_DATABASE = {
    "bell_at_night": {
        id: "bell_at_night",
        title: "Tiếng Chuông Sau Núi",
        text: "Chiều xuống. Ngươi vừa rời khỏi Thanh Vân Trấn thì nghe thấy tiếng chuông đồng vọng lại từ phía sau núi. Âm thanh rất nhỏ, nhưng linh lực trong cơ thể ngươi lại khẽ dao động.\n\nNgươi sẽ làm gì?",
        choices: [
            {
                text: "Quay lại tìm hiểu",
                effect: { cultivation: 15, log: "Ngươi men theo tiếng chuông quay lại phía sau núi." },
                flagSet: { heard_mountain_bell: true },
                next: "old_temple"
            },
            {
                text: "Tiếp tục lên đường",
                effect: { log: "Ngươi lờ đi tiếng chuông kỳ lạ và tiếp tục hành trình." },
                next: null
            },
            {
                text: "Đứng yên quan sát",
                effect: { gold: 5, log: "Ngươi cẩn trọng quan sát xung quanh và nhặt được vài viên Linh Thạch vụn." },
                next: null
            }
        ]
    },
    "old_temple": {
        id: "old_temple",
        title: "Cổ Tự Hoang Phế",
        text: "Men theo con đường nhỏ chìm trong sương mù, ngươi vãn cảnh tới một ngôi chùa cổ hoang tàn. Trước chánh điện, một pho tượng đá cổ xưa đang tỏa ra linh quang nhạt nhòa.\n\nDưới chân tượng đá có một bao thư niêm phong bằng bùa chú.",
        choices: [
            {
                text: "Thành tâm bái lạy tượng đá",
                effect: { cultivation: 30, gold: 20, log: "Ngươi bái lạy pho tượng, cảm nhận linh khí dồi dào rót vào đan điền." },
                flagSet: { temple_blessed: true },
                next: null
            },
            {
                text: "Mở bao thư niêm phong",
                effect: { itemGain: { id: "spirit_pill", qty: 1 }, log: "Ngươi hóa giải bùa chú và nhận được một viên Linh Dược." },
                flagSet: { opened_temple_letter: true },
                next: null
            },
            {
                text: "Rời khỏi cổ tự",
                effect: { log: "Cảm thấy có điềm bất an, ngươi lập tức thối lui khỏi cổ tự." },
                next: null
            }
        ]
    },

    /* Big Update v1.0 — expanded story nodes */
    "mountain_trial": {
        id: "mountain_trial",
        title: "Thí Luyện Thanh Vân",
        text: "Thanh Vân Chủ đứng trước ngươi. Ánh mắt ông sắc như kiếm.\n\n\"Ta muốn xem sức mạnh của ngươi. Đánh bại Sơn Thố trong rừng, rồi quay lại gặp ta.\"",
        choices: [
            {
                text: "Chấp nhận thí luyện",
                effect: { log: "Ngươi gật đầu. Thanh Vân Chủ mỉm cười." },
                flagSet: { mountain_trial_accepted: true },
                next: null
            },
            {
                text: "Từ chối",
                effect: { log: "Ngươi lắc đầu. Thanh Vân Chủ nhìn ngươi với vẻ thất vọng." },
                next: null
            }
        ]
    },
    "huyet_son_omen": {
        id: "huyet_son_omen",
        title: "Điềm Báo Huyết Sơn",
        text: "Trên đường tới Huyết Sơn, ngươi nhìn thấy một đàn quạ đen bay ngang trời. Tiếng kêu khàn đặc vọng về phía núi đỏ.\n\nPhía trước là đường đất đỏ dẫn vào núi. Mùi tanh xộc vào mũi.",
        choices: [
            {
                text: "Tiến vào núi đỏ",
                effect: { cultivation: 20, log: "Ngươi hít một hơi sâu. Linh khí nơi đây nồng nặc tà khí." },
                flagSet: { entered_huyet_son: true },
                next: null
            },
            {
                text: "Quay lại chuẩn bị",
                effect: { log: "Ngươi quyết định quay lại tu luyện trước." },
                next: null
            }
        ]
    },
    "sa_mac_legend": {
        id: "sa_mac_legend",
        title: "Truyền Thuyết Cửu Chuyển",
        text: "Trong quán trọ ốc đảo, một lão già kể rằng:\n\n\"Cửu Chuyển Kim Đan — đan dược của thượng cổ tiên nhân. Người uống vào có thể đột phá cảnh giới vượt bậc. Nhưng ở đâu? Chỉ có sa mạc mới biết.\"",
        choices: [
            {
                text: "Hỏi thêm về địa điểm",
                effect: { cultivation: 10, log: "\"Hãy đi về phía nam, nơi cát vàng biến thành đỏ.\"" },
                flagSet: { learned_cuu_chuyen_location: true },
                next: null
            },
            {
                text: "Đi ngay vào sa mạc",
                effect: { log: "Ngươi rời quán, tiến vào Vạn Lý Sa Mạc." },
                flagSet: { entered_sa_mac: true },
                next: null
            },
            {
                text: "Quay lại tu luyện",
                effect: { log: "Ngươi quyết định chưa vội vàng." },
                next: null
            }
        ]
    },
    "bac_hai_whispers": {
        id: "bac_hai_whispers",
        title: "Lời Thì Thầm Từ Biển Sâu",
        text: "Đêm đêm, ngươi nghe thấy tiếng thì thầm từ biển Bắc. Một giọng nói cổ xưa vọng về:\n\n\"Long Cung chìm dưới đáy. Hãy tìm Long Chi — kẻ canh giữ.\"",
        choices: [
            {
                text: "Lặn xuống biển",
                effect: { cultivation: 100, log: "Ngươi hóa thân thành một luồng sáng, lặn xuống biển sâu." },
                flagSet: { found_long_palace: true },
                next: null
            },
            {
                text: "Tìm kiếm Long Chi",
                effect: { gold: 200, log: "\"Ngươi không muốn gặp nó đâu.\"" },
                next: null
            },
            {
                text: "Quay về bờ",
                effect: { log: "Ngươi cảm thấy chưa đủ sức để đối mặt với điều đó." },
                next: null
            }
        ]
    },
    "thuong_gioi_ascend": {
        id: "thuong_gioi_ascend",
        title: "Thiên Lộ Mở Ra",
        text: "Khi ngươi đạt Nguyên Anh, một luồng sáng từ trời chiếu xuống. Cánh cửa Thượng Giới mở ra, tỏa ra linh quang chói lòa.\n\nCửu Giới Trưởng Lão đứng đó, từ dưới mây, nhìn xuống ngươi.\n\n\"Ngươi đã đủ điều kiện. Hãy bước lên.\"",
        choices: [
            {
                text: "Bước lên Thượng Giới",
                effect: { cultivation: 500, log: "Ngươi bước lên từng bậc thang ánh sáng. Thượng Giới mở ra trước mắt." },
                flagSet: { ascended_thuong_gioi: true },
                next: null
            },
            {
                text: "Chưa sẵn sàng",
                effect: { log: "\"Hãy chờ ta thêm một chút.\" Trưởng Lão gật đầu." },
                next: null
            }
        ]
    },
    "temple_secret_room": {
        id: "temple_secret_room",
        title: "Căn Phòng Bí Mật Của Cổ Tự",
        text: "Sau khi hoàn thành nhiệm vụ ở Cổ Tự, ngươi nhận thấy một bức tường có vết nứt bất thường. Có vẻ như có một căn phòng ẩn giấu.",
        choices: [
            {
                text: "Phá tường tìm phòng",
                effect: { cultivation: 200, gold: 300, log: "Ngươi phá tường. Bên trong là một căn phòng đầy bụi, trên bàn có một quyển sách cổ." },
                flagSet: { found_temple_secret_room: true },
                next: null
            },
            {
                text: "Gọi Hoang Tự Lão Nhân",
                effect: { cultivation: 50, log: "\"Ngươi có duyên. Đây là căn phòng của Sư Tổ.\"" },
                flagSet: { talked_lao_nhan_about_secret: true },
                next: null
            }
        ]
    }
};

const StoryEngine = {

    /* Trả về state mặc định nếu save cũ chưa có storyState */
    getInitialState() {
        return {
            flags: {},
            completed: [],
            active: null
        };
    },

    /* Kích hoạt story theo ID */
    trigger(storyId) {
        const storyNode = STORY_DATABASE[storyId];
        if (!storyNode) return false;

        if (!player.storyState) {
            player.storyState = this.getInitialState();
        }

        player.storyState.active = storyId;

        autoSave();
        renderStoryModal(storyNode);

        return true;
    },

    /* Xử lý lựa chọn của người chơi */
    selectChoice(storyId, choiceIndex) {
        const storyNode = STORY_DATABASE[storyId];
        if (!storyNode || !storyNode.choices[choiceIndex]) return;

        const choice = storyNode.choices[choiceIndex];

        /* 1. Áp dụng Effect */
        if (choice.effect) {

            if (choice.effect.cultivation) {
                player.cultivation += choice.effect.cultivation;
            }

            if (choice.effect.gold) {
                player.gold += choice.effect.gold;
            }

            if (choice.effect.itemGain) {
                const { id, qty } = choice.effect.itemGain;
                player.inventory[id] = (player.inventory[id] || 0) + qty;
            }

            if (choice.effect.log) {
                log(choice.effect.log, "good");
            }
        }

        /* 2. Ghi nhận Flag Memory */
        if (choice.flagSet) {
            Object.assign(player.storyState.flags, choice.flagSet);
        }

        /* 3. Đánh dấu completed nếu không còn chuỗi, hoặc chuyển tiếp */
        if (!choice.next) {

            if (!player.storyState.completed.includes(storyId)) {
                player.storyState.completed.push(storyId);
            }

            player.storyState.active = null;
            closeStoryModal();

        } else {

            player.storyState.active = choice.next;
            this.trigger(choice.next);
        }

        render();
        autoSave();
    }
};
