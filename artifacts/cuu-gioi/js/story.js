/* ==========================================================================
   CỬU GIỚI - STORY ENGINE (v0.4.4)

   Ghi chú sửa lỗi v0.4.4:
   Bản trước tham chiếu tới gameState / SaveSystem / UI.* / Inventory.*
   — những object này không tồn tại trong engine (engine dùng biến
   toàn cục `player`, hàm `autoSave()`, `render()`, `log()`,...).
   Vì vậy StoryEngine từng bị crash ngay khi trigger (kể cả khi bấm
   "Kích hoạt Story Test" trong Admin Panel). Đã nối lại cho đúng API
   thực tế của engine.
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
