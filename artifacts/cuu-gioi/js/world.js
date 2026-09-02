/* =====================================================
   WORLD EXPANSION v1.0 — Bản đồ Cửu Giới
   Cửu Giới — Big Update
   ===================================================== */

const WORLD_LORE = {
    origin:
        "Từ thuở Hồng Hoang, Cửu Giới chia cắt bởi chín tầng trời. " +
        "Mỗi tầng là một thế giới, mỗi thế giới là một quy luật. " +
        "Ngươi — kẻ đứng giữa ranh giới Phàm Nhân và Tiên Nhân — " +
        "phải tự tìm lối đi cho riêng mình."
};

const REALMS_FULL = [
    {
        id: "pham_nhan",
        name: "Phàm Nhân",
        required: 0,
        maxHp: 100,
        maxMp: 50,
        attack: 10,
        description: "Hồng trần tục nghiệp, chưa nhập đạo."
    },
    {
        id: "luyen_khi",
        name: "Luyện Khí",
        required: 100,
        maxHp: 140,
        maxMp: 80,
        attack: 15,
        description: "Hấp thu linh khí, khai mở đan điền."
    },
    {
        id: "truc_co",
        name: "Trúc Cơ",
        required: 1000,
        maxHp: 200,
        maxMp: 150,
        attack: 24,
        description: "Lập nền móng tiên gia, công pháp thành hình."
    },
    {
        id: "kim_dan",
        name: "Kim Đan",
        required: 5000,
        maxHp: 320,
        maxMp: 250,
        attack: 38,
        description: "Ngưng tụ kim đan, pháp lực kinh người."
    },
    {
        id: "nguyen_anh",
        name: "Nguyên Anh",
        required: 20000,
        maxHp: 480,
        maxMp: 400,
        attack: 56,
        description: "Nguyên anh xuất khiếu, ngự phong hành vân."
    },
    {
        id: "hoa_than",
        name: "Hóa Thần",
        required: 60000,
        maxHp: 720,
        maxMp: 650,
        attack: 82,
        description: "Hóa thần phản hư, nghịch thiên cải mệnh."
    },
    {
        id: "lu_do",
        name: "Lục Đạo",
        required: 150000,
        maxHp: 1050,
        maxMp: 950,
        attack: 120,
        description: "Lục đạo luân hồi, ta là chủ tể."
    }
];

/*
 * Override REALMS to provide full data
 * Original state.js defines 5 realms; we extend to 7.
 */
const REALMS_LEGACY = REALMS;

const WORLD_REGIONS = {
    /* Thanh Vân — khởi đầu */
    thanh_van_tran: {
        name: "Thanh Vân Trấn",
        tier: 1,
        description:
            "Một tiểu trấn nằm dưới chân Thanh Vân Sơn. Linh khí mỏng manh nhưng thường có tu sĩ vãng lai.",
        npcs: ["anh_tuyet", "lao_nhac"],
        enemies: [],
        dangerLevel: 0,
        resources: ["linh_thao", "tinh_thach"]
    },
    thanh_van_son: {
        name: "Thanh Vân Sơn",
        tier: 1,
        description:
            "Núi cao mây phủ. Linh khí dồi dào hơn dưới trấn, có động phủ tiên gia thượng cổ.",
        npcs: ["thanh_van_chu"],
        enemies: ["son_tho", "lang_xam"],
        dangerLevel: 1,
        resources: ["linh_thao", "tinh_thach", "kiem_cot"]
    },
    thanh_van_rung: {
        name: "Thanh Vân Sơn — Ngoại vi",
        tier: 1,
        description:
            "Khu rừng nằm ở phía ngoài Thanh Vân Sơn. Tiếng thú rừng thỉnh thoảng vang lên giữa những thân cây.",
        npcs: [],
        enemies: ["son_tho", "lang_xam", "doc_trung"],
        dangerLevel: 2,
        resources: ["linh_qua", "tinh_thach", "yeu_dan"]
    },

    /* Cổ Tự — bí cảnh tầng 2 */
    co_tu: {
        name: "Cổ Tự Hoang Phế",
        tier: 2,
        description:
            "Ngôi chùa cổ thượng cổ, bị phong ấn bởi trận pháp cổ xưa. Bên trong có chứa cơ duyên.",
        npcs: ["hoang_tu_lao_nhan"],
        enemies: ["ac_linh"],
        dangerLevel: 3,
        requires: "story:temple_blessed OR realm:truc_co",
        resources: ["linh_tinh", "bi_can"]
    },

    /* Huyết Sơn — cảnh giới 2 */
    huyet_son: {
        name: "Huyết Sơn Lĩnh",
        tier: 2,
        description:
            "Dãy núi đỏ như máu, sản sinh vô số yêu thú huyết mạch. Là nơi luyện tâm rất tốt.",
        npcs: ["huyet_son_kiem_khach"],
        enemies: ["huyet_lang", "huyet_bao"],
        dangerLevel: 4,
        requires: "realm:luyen_khi",
        resources: ["huyet_tinh", "ma_dan"]
    },

    /* Vạn Lý — đại mạc */
    van_ly_sa_mac: {
        name: "Vạn Lý Sa Mạc",
        tier: 3,
        description:
            "Sa mạc mênh mông, cát vàng cuồn cuộn. Truyền thuyết nơi đây có Cửu Chuyển Kim Đan ẩn giấu.",
        npcs: ["sa_mac_lua_di"],
        enemies: ["sa_xa", "sa_yeu"],
        dangerLevel: 5,
        requires: "realm:truc_co",
        resources: ["hoa_kiem", "sa_tinh"]
    },

    /* Bắc Hải — cảnh giới cao */
    bac_hai: {
        name: "Bắc Hải Tận Cùng",
        tier: 4,
        description:
            "Vùng biển phương bắc, sương mù dày đặc quanh năm. Có truyền thuyết về Long Cung dưới đáy biển.",
        npcs: ["bac_hai_co_dan"],
        enemies: ["hai_yeu", "long_chi"],
        dangerLevel: 6,
        requires: "realm:kim_dan",
        resources: ["long_hoa", "hac_chan"]
    },

    /* Thượng Giới — tầng cuối */
    thuong_gioi: {
        name: "Thượng Giới Thánh Sơn",
        tier: 5,
        description:
            "Tầng trời thứ chín — nơi tiên nhân tụ hội. Cửu Giới Tông chưởng quản vùng đất này.",
        npcs: ["cuu_gioi_truong_lao"],
        enemies: ["thien_nhan"],
        dangerLevel: 7,
        requires: "realm:nguyen_anh",
        resources: ["tien_thach", "thien_luyen"]
    }
};

const TRAVEL_GRAPH = {
    thanh_van_tran: ["thanh_van_son"],
    thanh_van_son: ["thanh_van_tran", "thanh_van_rung", "co_tu"],
    thanh_van_rung: ["thanh_van_son", "huyet_son"],
    co_tu: ["thanh_van_son", "van_ly_sa_mac"],
    huyet_son: ["thanh_van_rung", "van_ly_sa_mac"],
    van_ly_sa_mac: ["huyet_son", "co_tu", "bac_hai"],
    bac_hai: ["van_ly_sa_mac", "thuong_gioi"],
    thuong_gioi: ["bac_hai"]
};

/*
 * Replace original TRAVEL graph with expanded one
 * Backward compatible: still references thanh_van_* keys.
 */
if (typeof TRAVEL !== "undefined") {
    Object.assign(TRAVEL, TRAVEL_GRAPH);
}

/*
 * regionHasAccess — checks if player satisfies a region requirement
 *   requires: "realm:kim_dan" | "story:temple_blessed" | "flag:abc"
 */
function regionHasAccess(region) {
    const meta = WORLD_REGIONS[region];
    if (!meta || !meta.requires) return true;

    const [type, value] = meta.requires.split(":");

    if (type === "realm") {
        const required = REALMS_FULL.find(r => r.id === value);
        if (!required) return true;
        const idx = REALMS_FULL.findIndex(r => r.name === currentRealm().name);
        const ridx = REALMS_FULL.findIndex(r => r.name === required.name);
        return idx >= ridx;
    }

    if (type === "story") {
        const completed = (player.storyState && player.storyState.completed) || [];
        const flags = (player.storyState && player.storyState.flags) || {};
        return completed.includes(value) || flags[value] === true;
    }

    if (type === "flag") {
        const flags = (player.storyState && player.storyState.flags) || {};
        return flags[value] === true;
    }

    return true;
}

/*
 * listReachableRegions — returns array of region ids reachable from current location
 */
function listReachableRegions() {
    const direct = TRAVEL[player.location] || [];
    return direct;
}

/*
 * listVisibleEnemies — enemies in current region matching realm tier
 */
function listVisibleEnemies() {
    const region = WORLD_REGIONS[player.location];
    if (!region || !region.enemies || !region.enemies.length) return [];
    return region.enemies.filter(eid => ENEMIES[eid]);
}

/*
 * listAvailableResources — resources the player can gather in current region
 */
function listAvailableResources() {
    const region = WORLD_REGIONS[player.location];
    if (!region || !region.resources) return [];
    return region.resources;
}

/*
 * renderWorldMap — renders an extended region panel into a container id
 */
function renderWorldMap() {
    const container = document.getElementById("worldMapArea");
    if (!container) return;

    const region = WORLD_REGIONS[player.location];
    if (!region) {
        container.innerHTML = "";
        return;
    }

    let html = `
        <div class="card">
            <div class="card-name">Khu vực hiện tại</div>
            <div class="card-desc">${escapeHTML(region.description)}</div>
            <div class="small">Cấp độ nguy hiểm: ${region.dangerLevel} · Tầng: ${region.tier}</div>
        </div>
    `;

    html += `<div class="section-title" style="margin-top:10px;font-size:12px;">Các khu vực lân cận</div>`;

    const reachable = listReachableRegions();
    if (!reachable.length) {
        html += `<div class="small">Không có đường đi từ đây.</div>`;
    } else {
        reachable.forEach(rid => {
            const r = WORLD_REGIONS[rid];
            if (!r) return;
            const accessible = regionHasAccess(rid);
            html += `
                <div class="card">
                    <div class="card-header">
                        <div class="card-name">${escapeHTML(r.name)}</div>
                        <div class="small">Tầng ${r.tier}</div>
                    </div>
                    <div class="card-desc">${escapeHTML(r.description)}</div>
                    ${accessible
                        ? `<button onclick="travel('${rid}')">Hành trình tới ${escapeHTML(r.name)}</button>`
                        : `<button disabled>${escapeHTML(r.requires || "")} — chưa thể đến</button>`
                    }
                </div>
            `;
        });
    }

    if (region.npcs && region.npcs.length) {
        html += `<div class="section-title" style="margin-top:10px;font-size:12px;">Nhân vật gặp được</div>`;
        region.npcs.forEach(npcId => {
            const npc = NPC_DATABASE[npcId];
            if (!npc) return;
            html += `
                <div class="card">
                    <div class="card-header">
                        <div class="card-name">${escapeHTML(npc.name)}</div>
                        <div class="small">${escapeHTML(npc.title || "")}</div>
                    </div>
                    <div class="card-desc">${escapeHTML(npc.location || "")}</div>
                    <button onclick="openNPCDialogue('${npcId}')">Tiếp cận</button>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}