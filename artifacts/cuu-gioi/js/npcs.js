/* =====================================================
   NPC SYSTEM v1.0 — Hội thoại, quan hệ, quest gắn NPC
   Cửu Giới — Big Update
   ===================================================== */

/*
 * NPC_DATABASE schema:
 *  id, name, title, location (lời dẫn)
 *  initial (lời chào đầu tiên)
 *  dialogues: [{ min: int, max: int, text: string }]
 *    min: relationship tối thiểu để hiện, max: tối đa
 *  quests: [questId] — quest NPC có thể giao
 *  shop: [itemId] — items NPC bán (nếu có)
 *  repeatable: { item, gold, friendshipGain, cooldown, flag? }
 */
const NPC_DATABASE = {
    anh_tuyet: {
        id: "anh_tuyet",
        name: "Ánh Tuyết",
        title: "Nữ Tu Tiên Bí Ẩn",
        location: "Nữ tử áo trắng đứng bên hồ Thanh Vân, ánh mắt bình tĩnh nhìn về phía ngươi.",
        initial: "Ánh Tuyết: \"Ngươi lại tới. Vừa hay, ta có điều muốn nói.\"",
        dialogues: [
            { min: 0, max: 9,
              text: "Ánh Tuyết: \"Con đường tu hành vốn không dễ đi. Cẩn trọng từng bước.\"" },
            { min: 10, max: 19,
              text: "Ánh Tuyết: \"Ta cảm nhận được duyên phận của ngươi với núi này. Có lẽ chúng ta sẽ gặp lại.\"" },
            { min: 20, max: 39,
              text: "Ánh Tuyết: \"Ngươi đã có chút công phu. Nhưng trước Cổ Tự Hoang Phế, đó chỉ là phàm phu.\"" },
            { min: 40, max: 9999,
              text: "Ánh Tuyết: \"Ta tin ngươi có thể bước vào Kim Đan. Hãy nhớ — đừng để tâm ma khống chế.\"" }
        ],
        quests: ["first_step", "temple_path"],
        shop: ["dan_hieu_luc", "linh_qua"]
    },

    lao_nhac: {
        id: "lao_nhac",
        name: "Lão Nhạc",
        title: "Quán Trọ Thanh Vân",
        location: "Lão nhân tóc bạc ngồi sau quầy trà, ánh mắt sáng quắc.",
        initial: "Lão Nhạc: \"Khách quan, muốn nghỉ chân hay uống chén trà?\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Lão Nhạc: \"Vùng này gần đây có nhiều yêu thú xuất hiện. Cẩn thận lúc đi đêm.\"" }
        ],
        quests: ["rumor_hunt"],
        shop: ["tra_thien"],
        repeatable: {
            gold: 50,
            friendshipGain: 1,
            cooldown: 3,
            text: "Lão Nhạc bán cho ngươi một túi trà thượng hạng."
        }
    },

    thanh_van_chu: {
        id: "thanh_van_chu",
        name: "Thanh Vân Chủ",
        title: "Người Gác Cổng Thanh Vân Sơn",
        location: "Một tu sĩ trung niên áo xanh đứng bên bậc thềm đá.",
        initial: "Thanh Vân Chủ: \"Ngươi muốn vào Thanh Vân Sơn? Hãy chứng minh bản thân.\"",
        dialogues: [
            { min: 0, max: 9,
              text: "Thanh Vân Chủ: \"Trên núi yêu khí nặng. Không đủ cảnh giới thì đừng nên.\"" },
            { min: 10, max: 9999,
              text: "Thanh Vân Chủ: \"Ngươi có duyên. Hãy cố gắng tu luyện, chờ ngày khai mở Cổ Tự.\"" }
        ],
        quests: ["clear_beasts"]
    },

    hoang_tu_lao_nhan: {
        id: "hoang_tu_lao_nhan",
        name: "Hoang Tự Lão Nhân",
        title: "Người Gác Cổ Tự",
        location: "Một lão nhân áo bạc ngồi xếp bằng trước tượng Phật cổ.",
        initial: "Hoang Tự Lão Nhân: \"Ngươi tới đây. Có muốn nghe một câu chuyện cổ?\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Hoang Tự Lão Nhân: \"Nơi này từng là tổ đình Cửu Giới Tông ngàn năm trước.\"" }
        ],
        quests: ["find_relic"]
    },

    huyet_son_kiem_khach: {
        id: "huyet_son_kiem_khach",
        name: "Huyết Sơn Kiếm Khách",
        title: "Kiếm Tu Lưu Lạc",
        location: "Một kiếm tu áo bào đỏ đứng giữa núi đỏ như máu.",
        initial: "Huyết Sơn Kiếm Khách: \"Ngươi dám bước vào Huyết Sơn? Đủ gan.\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Huyết Sơn Kiếm Khách: \"Ta đã lưu lạc nơi đây ba năm. Ngươi có muốn học Kiếm Pháp Nhập Môn?\"" }
        ],
        quests: ["huyet_son_trial"]
    },

    sa_mac_lua_di: {
        id: "sa_mac_lua_di",
        name: "Sa Mạc Lữ Khách",
        title: "Thương Nhân Bí Ẩn",
        location: "Một thương nhân che mặt đứng bên ốc đảo giữa sa mạc.",
        initial: "Sa Mạc Lữ Khách: \"Hàng hiếm từ phương xa. Có điều — không phải thứ ngươi cần.\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Sa Mạc Lữ Khách: \"Nghe đồn Vạn Lý Sa Mạc có Cửu Chuyển Kim Đan. Nhưng phải trả giá.\"" }
        ],
        shop: ["hoa_kiem", "sa_tinh", "cuu_chuyen_kim_dan"]
    },

    bac_hai_co_dan: {
        id: "bac_hai_co_dan",
        name: "Bắc Hải Cố Dân",
        title: "Lão Ngư Dân",
        location: "Một lão ngư dân tóc bạc ngồi trên thuyền nhỏ giữa biển sương.",
        initial: "Bắc Hải Cố Dân: \"Biển Bắc không chỉ có cá. Còn có thứ mà ngươi không muốn gặp.\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Bắc Hải Cố Dân: \"Long Cung chìm dưới đáy biển từ thượng cổ. Kẻ nào tìm được — thành tiên.\"" }
        ],
        quests: ["north_sea_trial"]
    },

    cuu_gioi_truong_lao: {
        id: "cuu_gioi_truong_lao",
        name: "Cửu Giới Trưởng Lão",
        title: "Người Đứng Đầu Cửu Giới Tông",
        location: "Một vị tiên nhân thân hình mờ ảo, ngồi trên đỉnh Thánh Sơn.",
        initial: "Cửu Giới Trưởng Lão: \"Ngươi đã đến đây. Có nghĩa là ngươi đã vượt qua Cửu Tầng Trời.\"",
        dialogues: [
            { min: 0, max: 9999,
              text: "Cửu Giới Trưởng Lão: \"Ta truyền cho ngươi một chiêu. Nhưng ngươi phải hứa — đừng dùng nó vào việc xấu.\"" }
        ],
        quests: ["final_trial"]
    }
};

/*
 * findDialogueForNPC — returns the dialogue text for current relationship
 */
function findDialogueForNPC(npcId) {
    const npc = NPC_DATABASE[npcId];
    if (!npc) return null;
    const rel = getRelationship(npcId);
    const list = npc.dialogues || [];
    for (const d of list) {
        if (rel >= d.min && rel <= d.max) {
            return d.text;
        }
    }
    return npc.initial || "...";
}

/*
 * getRelationship — safely read NPC relationship value
 */
function getRelationship(npcId) {
    if (!player.relationship || typeof player.relationship !== "object") return 0;
    return Number(player.relationship[npcId] || 0);
}

/*
 * addRelationship — increases NPC friendship with optional cap
 */
function addRelationship(npcId, amount) {
    if (!player.relationship) player.relationship = {};
    player.relationship[npcId] = (player.relationship[npcId] || 0) + amount;
}

/*
 * openNPCDialogue — render dialogue popup with action buttons
 *   - Talk (increase friendship)
 *   - Offer Gift (if shop items)
 *   - Quests (if any)
 *   - Shop (if any)
 */
function openNPCDialogue(npcId) {
    if (player.combat) {
        toast("Không thể hội thoại khi đang chiến đấu.");
        return;
    }

    const npc = NPC_DATABASE[npcId];
    if (!npc) {
        toast("Không tìm thấy NPC.");
        return;
    }

    const rel = getRelationship(npcId);
    const dialogue = findDialogueForNPC(npcId);
    const lines = [
        npc.location || "",
        "",
        dialogue || npc.initial || "",
        "",
        `Quan hệ: ${rel}`
    ];

    /* Build action buttons via input element */
    const actionArea = document.createElement("div");
    actionArea.style.cssText = "display:flex; flex-direction:column; gap:8px; margin-top:8px;";

    /* Talk */
    const talkBtn = document.createElement("button");
    talkBtn.textContent = "Nói chuyện (quan hệ +1)";
    talkBtn.onclick = () => {
        addRelationship(npcId, 1);
        log(`Đối thoại với ${npc.name}. Quan hệ +1.`, "good");
        autoSave();
        closePopup();
        openNPCDialogue(npcId);
    };
    actionArea.appendChild(talkBtn);

    /* Quests */
    if (npc.quests && npc.quests.length) {
        npc.quests.forEach(qid => {
            const q = QUESTS_FULL[qid];
            if (!q) return;

            const state = getQuestState(qid);
            if (state.completed) return;

            const btn = document.createElement("button");
            if (!state.accepted) {
                btn.textContent = `Nhận nhiệm vụ: ${q.name}`;
                btn.onclick = () => {
                    acceptQuest(qid);
                    closePopup();
                };
            } else {
                btn.textContent = `Báo cáo: ${q.name} (${state.progress}/${q.goal})`;
                btn.onclick = () => {
                    reportQuest(qid);
                };
            }
            actionArea.appendChild(btn);
        });
    }

    /* Shop */
    if (npc.shop && npc.shop.length) {
        const shopBtn = document.createElement("button");
        shopBtn.textContent = "Mua vật phẩm";
        shopBtn.onclick = () => {
            closePopup();
            openShop(npcId);
        };
        actionArea.appendChild(shopBtn);
    }

    /* Repeatable */
    if (npc.repeatable) {
        const rep = npc.repeatable;
        const last = (player.npcCooldowns && player.npcCooldowns[npcId]) || 0;
        const today = Math.floor(Date.now() / 86400000);
        const ready = (today - last) >= (rep.cooldown || 0);

        const repBtn = document.createElement("button");
        repBtn.textContent = ready ? rep.text : "Đã giao dịch — chờ ngày mai";
        repBtn.disabled = !ready;
        if (ready) {
            repBtn.onclick = () => {
                player.gold += rep.gold || 0;
                addRelationship(npcId, rep.friendshipGain || 0);
                if (!player.npcCooldowns) player.npcCooldowns = {};
                player.npcCooldowns[npcId] = today;
                log(`${npc.name}: +${rep.gold} linh thạch, quan hệ +${rep.friendshipGain || 0}.`, "good");
                autoSave();
                closePopup();
            };
        }
        actionArea.appendChild(repBtn);
    }

    /* Custom choice: Offer Gift — drop an item to give */
    if (player.inventory && Object.keys(player.inventory).length) {
        const giftBtn = document.createElement("button");
        giftBtn.textContent = "Tặng quà (tăng quan hệ)";
        giftBtn.onclick = () => {
            closePopup();
            openGiftDialogue(npcId);
        };
        actionArea.appendChild(giftBtn);
    }

    showPopup(
        `${npc.name} — ${npc.title || ""}`,
        lines.join("\n"),
        {
            input: actionArea,
            confirmText: "Đóng",
            onConfirm: closePopup
        }
    );
}

/*
 * openGiftDialogue — list all inventory items, let user pick one to give
 */
function openGiftDialogue(npcId) {
    const npc = NPC_DATABASE[npcId];
    if (!npc) return;

    const giftArea = document.createElement("div");
    giftArea.style.cssText = "display:flex; flex-direction:column; gap:6px;";

    let any = false;
    Object.keys(player.inventory).forEach(id => {
        const amount = player.inventory[id] || 0;
        if (amount <= 0) return;
        const item = ITEMS[id];
        if (!item) return;

        any = true;
        const btn = document.createElement("button");
        btn.textContent = `Tặng: ${item.name} (x${amount})`;
        btn.onclick = () => {
            const gain = giftValueForItem(id);
            player.inventory[id] -= 1;
            addRelationship(npcId, gain);
            log(`Đã tặng ${npc.name} một ${item.name}. Quan hệ +${gain}.`, "good");
            autoSave();
            closePopup();
            openNPCDialogue(npcId);
        };
        giftArea.appendChild(btn);
    });

    if (!any) {
        giftArea.innerHTML = `<div class="small">Túi đồ trống.</div>`;
    }

    showPopup(
        `Tặng quà cho ${npc.name}`,
        "Chọn vật phẩm muốn tặng. Mỗi món tăng quan hệ theo giá trị.",
        {
            input: giftArea,
            confirmText: "Hủy",
            onConfirm: () => {
                closePopup();
                openNPCDialogue(npcId);
            }
        }
    );
}

function giftValueForItem(itemId) {
    const map = {
        linh_qua: 3,
        dan_hieu_luc: 2,
        spirit_pill: 5,
        tra_thien: 2,
        hoa_kiem: 8,
        sa_tinh: 4,
        cuu_chuyen_kim_dan: 25,
        long_hoa: 12,
        hac_chan: 10,
        tien_thach: 30,
        thien_luyen: 20
    };
    return map[itemId] || 1;
}

/*
 * openShop — render NPC shop with buy buttons
 */
function openShop(npcId) {
    const npc = NPC_DATABASE[npcId];
    if (!npc || !npc.shop) return;

    const shopArea = document.createElement("div");
    shopArea.style.cssText = "display:flex; flex-direction:column; gap:6px;";

    npc.shop.forEach(itemId => {
        const item = ITEMS[itemId];
        if (!item) return;
        const price = shopPriceForItem(itemId);

        const btn = document.createElement("button");
        btn.textContent = `${item.name} — ${price} linh thạch`;
        btn.onclick = () => {
            if ((player.gold || 0) < price) {
                toast("Không đủ linh thạch.");
                return;
            }
            player.gold -= price;
            player.inventory[itemId] = (player.inventory[itemId] || 0) + 1;
            log(`Đã mua ${item.name} từ ${npc.name}.`, "good");
            autoSave();
            closePopup();
            openShop(npcId);
        };
        shopArea.appendChild(btn);
    });

    showPopup(
        `Cửa hàng của ${npc.name}`,
        `Linh thạch hiện có: ${player.gold}`,
        {
            input: shopArea,
            confirmText: "Đóng",
            onConfirm: () => {
                closePopup();
                openNPCDialogue(npcId);
            }
        }
    );
}

function shopPriceForItem(itemId) {
    const map = {
        dan_hieu_luc: 30,
        linh_qua: 25,
        spirit_pill: 80,
        tra_thien: 15,
        hoa_kiem: 200,
        sa_tinh: 150,
        cuu_chuyen_kim_dan: 2000,
        long_hoa: 500,
        hac_chan: 300,
        tien_thach: 5000,
        thien_luyen: 1500
    };
    return map[itemId] || 50;
}

/*
 * Legacy compat — keep original talkToAnhTuyet behavior but route through new system
 */
function talkToAnhTuyet() {
    if (player.combat) {
        toast("Không thể đối thoại khi đang chiến đấu.");
        return;
    }
    if (player.location !== "thanh_van_tran") {
        toast("Ánh Tuyết chỉ xuất hiện ở Thanh Vân Trấn.");
        return;
    }
    openNPCDialogue("anh_tuyet");
}
