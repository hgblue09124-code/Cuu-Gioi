/* =====================================================
   SECRETS & HIDDEN CONTENT v1.0
   Cửu Giới — Big Update
   ===================================================== */

/*
 * HIDDEN SECRETS — discovered via specific conditions
 *
 * These are easter eggs, hidden areas, and secret events
 * that trigger when specific conditions are met.
 */

/*
 * checkSecrets — call this after every action
 * Returns array of discovered secret IDs
 */
function checkSecrets() {
    if (!player.secrets) player.secrets = {};

    const discovered = [];

    /* Secret: Found the bell at night */
    if (!player.secrets.bell_secret && player.storyState && player.storyState.flags) {
        if (player.storyState.flags.heard_mountain_bell && player.storyState.flags.temple_blessed) {
            player.secrets.bell_secret = true;
            discovered.push("bell_secret");
        }
    }

    /* Secret: Rich cultivator — 10000 gold at once */
    if (!player.secrets.rich_cultivator && (player.gold || 0) >= 10000) {
        player.secrets.rich_cultivator = true;
        discovered.push("rich_cultivator");
    }

    /* Secret: Peak cultivator — reached Nguyên Anh */
    if (!player.secrets.peak_cultivator) {
        const realm = currentRealm().name;
        if (realm === "Nguyên Anh") {
            player.secrets.peak_cultivator = true;
            discovered.push("peak_cultivator");
        }
    }

    /* Secret: Explored all starting areas */
    if (!player.secrets.wanderer) {
        const areas = ["thanh_van_tran", "thanh_van_son", "thanh_van_rung"];
        const explored = areas.filter(a => player.exploredAreas && player.exploredAreas.includes(a));
        if (explored.length >= 3) {
            player.secrets.wanderer = true;
            discovered.push("wanderer");
        }
    }

    /* Secret: Defeated the boss of Huyết Sơn */
    if (!player.secrets.blood_master && player.combatWins && player.combatWins >= 10) {
        player.secrets.blood_master = true;
        discovered.push("blood_master");
    }

    /* Secret: Gave gift to all NPCs */
    if (!player.secrets.charmer) {
        const npcs = Object.keys(NPC_DATABASE);
        const gifted = (player.giftedNPCs && Object.keys(player.giftedNPCs)) || [];
        if (npcs.every(n => gifted.includes(n))) {
            player.secrets.charmer = true;
            discovered.push("charmer");
        }
    }

    /* Secret: Found all 9 fate messages */
    if (!player.secrets.fate_seeker && player.fateReadCount && player.fateReadCount >= 9) {
        player.secrets.fate_seeker = true;
        discovered.push("fate_seeker");
    }

    return discovered;
}

/*
 * trackCombatWin — increment win counter
 */
function trackCombatWin() {
    player.combatWins = (player.combatWins || 0) + 1;
}

/*
 * trackExploredArea — mark area as explored
 */
function trackExploredArea(location) {
    if (!player.exploredAreas) player.exploredAreas = [];
    if (!player.exploredAreas.includes(location)) {
        player.exploredAreas.push(location);
    }
}

/*
 * trackGiftGiven — record NPC gift
 */
function trackGiftGiven(npcId) {
    if (!player.giftedNPCs) player.giftedNPCs = {};
    player.giftedNPCs[npcId] = true;
}

/*
 * showSecretDiscovery — show discovery popup
 */
function showSecretDiscovery(secretId) {
    const messages = {
        bell_secret: {
            title: "Bí Ẩn — Tiếng Chuông",
            text: "Ngươi đã nghe tiếng chuông và bước vào Cổ Tự. Một bí mật cổ xưa đã được khám phá.\n\nMở khóa: Lối vào Cổ Tự."
        },
        rich_cultivator: {
            title: "Bí Ẩn — Đại Phú Giả",
            text: "Ngươi đã tích lũy hơn 10.000 linh thạch. Danh tiếng lan xa.\n\nMở khóa: Quầy Lão Nhạc mở thêm vật phẩm quý."
        },
        peak_cultivator: {
            title: "Bí Ẩn — Nguyên Anh",
            text: "Ngươi đã đạt cảnh giới Nguyên Anh. Đây là bước ngoặt lớn trên con đường tu tiên.\n\nMở khóa: Thượng Giới."
        },
        wanderer: {
            title: "Bí Ẩn — Kẻ Lang Thang",
            text: "Ngươi đã đặt chân khắp Thanh Vân. Những bí ẩn nơi đây không thể giấu ngươi.\n\nMở khóa: Cảm nhận linh khí tăng 10%."
        },
        blood_master: {
            title: "Bí Ẩn — Chúa Tể Huyết Sơn",
            text: "Mười trận thắng liên tiếp. Huyết Sơn ghi nhớ ngươi.\n\nMở khóa: Huyết Tinh rơi nhiều hơn."
        },
        charmer: {
            title: "Bí Ẩn — Tâm Ngã",
            text: "Ngươi đã tặng quà cho tất cả nhân vật. Trong lòng ai cũng có một góc ngươi.\n\nMở khóa: Quan hệ với tất cả NPC +5."
        },
        fate_seeker: {
            title: "Bí Ẩn — Kẻ Đọc Thiên Cơ",
            text: "Chín lần ngươi hỏi trời. Trời đã trả lời đủ.\n\nMở khóa: Mở khóa 3 tin nhắn thiên cơ mới."
        }
    };

    const msg = messages[secretId];
    if (!msg) return;

    showPopup(msg.title, msg.text);
    log(`[BÍ ẨN] ${msg.title}`, "good");

    /* Apply secret bonuses */
    if (secretId === "wanderer") {
        player.exploreBonus = (player.exploreBonus || 0) + 10;
    }
    if (secretId === "charmer") {
        Object.keys(NPC_DATABASE).forEach(nid => {
            player.relationship = player.relationship || {};
            player.relationship[nid] = (player.relationship[nid] || 0) + 5;
        });
    }
}

/*
 * listSecrets — render secrets panel
 */
function renderSecrets() {
    const container = document.getElementById("secretArea");
    if (!container) return;
    container.innerHTML = "";

    const all = [
        { id: "bell_secret", name: "Tiếng Chuông Bí Ẩn", hint: "Nghe chuông và bước vào Cổ Tự" },
        { id: "rich_cultivator", name: "Đại Phú Giả", hint: "Tích lũy 10.000 linh thạch" },
        { id: "peak_cultivator", name: "Nguyên Anh Giả", hint: "Đạt cảnh giới Nguyên Anh" },
        { id: "wanderer", name: "Kẻ Lang Thang", hint: "Khám phá tất cả khu vực Thanh Vân" },
        { id: "blood_master", name: "Chúa Tể Huyết Sơn", hint: "Thắng 10 trận chiến" },
        { id: "charmer", name: "Tâm Ngã", hint: "Tặng quà cho tất cả NPC" },
        { id: "fate_seeker", name: "Người Đọc Thiên Cơ", hint: "Hỏi thiên cơ 9 lần" }
    ];

    all.forEach(s => {
        const discovered = player.secrets && player.secrets[s.id];
        const card = document.createElement("div");
        card.className = "card";
        card.style.opacity = discovered ? "1" : "0.45";
        card.innerHTML = `
            <div class="card-header">
                <div class="card-name">${escapeHTML(s.name)}</div>
                <div class="small">${discovered ? "✓ Đã tìm thấy" : "?"}</div>
            </div>
            <div class="card-desc">${escapeHTML(s.hint)}</div>
        `;
        container.appendChild(card);
    });
}

/*
 * Enhanced fate system — track reads, add rare fate messages
 */
function consultFateEnhanced() {
    player.fateReadCount = (player.fateReadCount || 0) + 1;
    const count = player.fateReadCount;

    /* Rarer messages for frequent consulters */
    const rareMessages = {
        3: "Thiên cơ khẽ động. Một cơ duyên đang đến gần.",
        5: "Ngươi cảm nhận được linh khí trong thiên địa dao động.",
        7: "Con đường phía trước vẫn còn rất dài.",
        9: "Ngươi đã hỏi trời đủ nhiều. Trời bắt đầu lắng nghe.",
        11: "Một ý niệm thoáng qua — ngươi gần như nắm bắt được điều gì đó.",
        13: "Hôm nay chưa phải ngày để cưỡng cầu cơ duyên. Nhưng ngươi đã gần."
    };

    const messages = FATE_MESSAGES || [];
    let message;

    if (rareMessages[count]) {
        message = rareMessages[count];
    } else {
        message = messages[Math.floor(Math.random() * messages.length)] || "Thiên cơ mờ ảo, khó đoán.";
    }

    showPopup("Thiên Cơ", message);
    log("Ngươi quan sát thiên cơ.", "good");

    /* Check for secret discovery */
    const found = checkSecrets();
    found.forEach(sid => showSecretDiscovery(sid));
}

/*
 * Override legacy consultFate
 */
const _consultFateLegacy = typeof consultFate !== "undefined" ? consultFate : null;
function consultFate() {
    consultFateEnhanced();
}

/*
 * Enhanced explore — apply secret bonuses, track areas
 */
function exploreEnhanced() {
    /* Track area */
    trackExploredArea(player.location);

    /* Apply explore bonus */
    const bonus = player.exploreBonus || 0;
    if (bonus > 0) {
        log(`Kẻ Lang Thang — cảm nhận linh khí tăng ${bonus}%.`, "good");
    }

    /* Check secrets */
    const found = checkSecrets();
    found.forEach(sid => showSecretDiscovery(sid));
}

/*
 * secretCommand — easter egg command accessible via Runtime Console
 * Usage: secretCommand("reveal_all") or secretCommand("cheat_1000_gold")
 */
function secretCommand(cmd) {
    const cheats = {
        "reveal_all": () => {
            player.secrets = {
                bell_secret: true,
                rich_cultivator: true,
                peak_cultivator: true,
                wanderer: true,
                blood_master: true,
                charmer: true,
                fate_seeker: true
            };
            log("[CHEAT] Tất cả bí ẩn đã được mở khóa.", "good");
        },
        "cheat_1000_gold": () => {
            player.gold = (player.gold || 0) + 1000;
            log("[CHEAT] +1000 linh thạch.", "good");
        },
        "cheat_realm": () => {
            player.cultivation += 1000;
            log("[CHEAT] +1000 linh lực.", "good");
        },
        "max_all_skills": () => {
            Object.keys(SKILL_DATABASE).forEach(sid => {
                if (!player.learnedSkills) player.learnedSkills = [];
                if (!player.learnedSkills.includes(sid)) {
                    player.learnedSkills.push(sid);
                }
            });
            log("[CHEAT] Tất cả kỹ năng đã được học.", "good");
        }
    };

    if (cheats[cmd]) {
        cheats[cmd]();
        autoSave();
        render();
        return "OK";
    }
    return "Unknown command";
}