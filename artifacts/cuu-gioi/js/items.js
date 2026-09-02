/* =====================================================
   ITEMS EXPANSION v1.0
   Cửu Giới — Big Update
   ===================================================== */

/*
 * Extended items registry.
 * Original ITEMS (in inventory.js) is preserved; this file adds new ones.
 * Items defined here are merged via Object.assign in core.js load order.
 */
const ITEMS_EXTENDED = {
    /* Consumables - healing / cultivation */
    linh_thao: {
        id: "linh_thao",
        name: "Linh Thảo",
        description: "Cỏ dại mọc nơi có linh khí. Tăng 8 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 8;
            player.cultivation += gain;
            log(`Sử dụng Linh Thảo. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    tinh_thach: {
        id: "tinh_thach",
        name: "Tinh Thạch",
        description: "Đá tinh trong núi. Có thể bán hoặc dùng tu luyện.",
        usable: true,
        effect: (player) => {
            const gain = 5;
            player.cultivation += gain;
            log(`Hấp thụ Tinh Thạch. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    kiem_cot: {
        id: "kiem_cot",
        name: "Kiếm Cốt",
        description: "Xương cốt yêu thú. Vật liệu rèn pháp bảo.",
        usable: false
    },
    yeu_dan: {
        id: "yeu_dan",
        name: "Yêu Đan",
        description: "Tinh hoa kết tụ trong yêu thú. Tăng 50 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 50;
            player.cultivation += gain;
            log(`Hấp thụ Yêu Đan. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    linh_tinh: {
        id: "linh_tinh",
        name: "Linh Tinh",
        description: "Linh thạch cổ xưa phát quang. Tăng 100 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 100;
            player.cultivation += gain;
            log(`Hấp thụ Linh Tinh. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    bi_can: {
        id: "bi_can",
        name: "Bí Cảnh Mật Chỉ",
        description: "Một tờ giấy cổ. Có thể mở ra cơ duyên ở Cổ Tự.",
        usable: false
    },
    huyet_tinh: {
        id: "huyet_tinh",
        name: "Huyết Tinh",
        description: "Tinh thể máu rỉ ra từ Huyết Sơn. Có thể tẩm pháp bảo.",
        usable: true,
        effect: (player) => {
            const gain = 200;
            player.cultivation += gain;
            log(`Hấp thụ Huyết Tinh. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    ma_dan: {
        id: "ma_dan",
        name: "Ma Đan",
        description: "Đan dược tà khí. Tăng 150 linh lực nhưng có chút phản ứng phụ.",
        usable: true,
        effect: (player) => {
            const gain = 150;
            const dmg = 5;
            player.cultivation += gain;
            player.hp = Math.max(1, player.hp - dmg);
            log(`Hấp thụ Ma Đan. Linh lực +${gain}, sinh lực -${dmg}.`, "good");
            return true;
        }
    },
    hoa_kiem: {
        id: "hoa_kiem",
        name: "Hỏa Kiếm",
        description: "Pháp bảo hạ phẩm. Tăng 15 sát thương trong 5 hiệp.",
        usable: true,
        effect: (player) => {
            player.weaponBuff = (player.weaponBuff || 0) + 15;
            player.weaponBuffTurns = (player.weaponBuffTurns || 0) + 5;
            log("Hỏa Kiếm hóa — sát thương +15 trong 5 hiệp.", "good");
            return true;
        }
    },
    sa_tinh: {
        id: "sa_tinh",
        name: "Sa Tinh",
        description: "Hạt cát tinh túy. Có thể bán hoặc dùng tu luyện.",
        usable: true,
        effect: (player) => {
            const gain = 40;
            player.cultivation += gain;
            log(`Hấp thụ Sa Tinh. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    cuu_chuyen_kim_dan: {
        id: "cuu_chuyen_kim_dan",
        name: "Cửu Chuyển Kim Đan",
        description: "Đan dược cổ xưa trong truyền thuyết. Tăng 1000 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 1000;
            player.cultivation += gain;
            log(`Hấp thụ Cửu Chuyển Kim Đan. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    long_hoa: {
        id: "long_hoa",
        name: "Long Hoa",
        description: "Huyết long chi hoa. Đan dược cực phẩm. Tăng 800 linh lực và hồi đầy sinh lực.",
        usable: true,
        effect: (player) => {
            const gain = 800;
            player.cultivation += gain;
            player.hp = player.maxHp;
            log(`Hấp thụ Long Hoa. Linh lực +${gain}, sinh lực hồi phục hoàn toàn.`, "good");
            return true;
        }
    },
    hac_chan: {
        id: "hac_chan",
        name: "Hạc Chân Thảo",
        description: "Thảo dược chỉ có ở Bắc Hải. Tăng 300 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 300;
            player.cultivation += gain;
            log(`Hấp thụ Hạc Chân Thảo. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    tien_thach: {
        id: "tien_thach",
        name: "Tiên Thạch",
        description: "Đá tiên từ Thượng Giới. Tăng 2000 linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 2000;
            player.cultivation += gain;
            log(`Hấp thụ Tiên Thạch. Linh lực +${gain}.`, "good");
            return true;
        }
    },
    thien_luyen: {
        id: "thien_luyen",
        name: "Thiên Luyện Đan",
        description: "Đan dược thượng phẩm. Tăng 1500 linh lực và +50 maxHp.",
        usable: true,
        effect: (player) => {
            const gain = 1500;
            player.cultivation += gain;
            player.maxHp += 50;
            player.hp += 50;
            log(`Hấp thụ Thiên Luyện Đan. Linh lực +${gain}, maxHp +50.`, "good");
            return true;
        }
    },
    tra_thien: {
        id: "tra_thien",
        name: "Trà Tiên",
        description: "Trà thượng hạng từ Lão Nhạc. Hồi 20 MP.",
        usable: true,
        effect: (player) => {
            const restore = 20;
            player.mp = Math.min(player.maxMp, player.mp + restore);
            log(`Uống Trà Tiên. Nội lực +${restore}.`, "good");
            return true;
        }
    },
    hoan_dan: {
        id: "hoan_dan",
        name: "Hoàn Hồn Đan",
        description: "Cứu mạng khi trọng thương. Hồi 60 HP.",
        usable: true,
        effect: (player) => {
            const restore = 60;
            player.hp = Math.min(player.maxHp, player.hp + restore);
            log(`Sử dụng Hoàn Hồn Đan. Sinh lực +${restore}.`, "good");
            return true;
        }
    }
};

/*
 * Merge into ITEMS (defined in inventory.js)
 */
if (typeof ITEMS !== "undefined") {
    Object.assign(ITEMS, ITEMS_EXTENDED);
}