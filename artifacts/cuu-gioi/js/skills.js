/* =====================================================
   SKILLS SYSTEM v1.0 — Kỹ Năng & Pháp Thuật
   Cửu Giới — Big Update
   ===================================================== */

const SKILL_CATEGORIES = {
    cong_phap: { name: "Công Pháp", description: "Chiêu thức tấn công cơ bản và nâng cao" },
    phap_thuat: { name: "Pháp Thuật", description: "Phép thuật nguyên tố và hiệu ứng" },
    than_thong: { name: "Thân Thông", description: "Kỹ năng hỗ trợ, phòng thủ và né tránh" }
};

/*
 * SKILL DATABASE
 * id, name, category, realmRequired, mpCost, damage (hàm nhận combat object),
 * description, effect (optional function)
 */
const SKILL_DATABASE = {
    /* === CÔNG PHÁP === */
    quyen_phap_co: {
        id: "quyen_phap_co",
        name: "Quyền Pháp Cơ",
        category: "cong_phap",
        realmRequired: "Phàm Nhân",
        mpCost: 0,
        damage: (combat) => 10 + Math.floor(Math.random() * 6),
        description: "Quyền pháp cơ bản nhất. Tiêu hao ít nội lực."
    },
    kiem_phap_nhap_mon: {
        id: "kiem_phap_nhap_mon",
        name: "Kiếm Pháp Nhập Môn",
        category: "cong_phap",
        realmRequired: "Luyện Khí",
        mpCost: 5,
        damage: (combat) => 15 + Math.floor(Math.random() * 10),
        description: "Kiếm chiêu cơ bản trong Luyện Khí kỳ."
    },
    chan_khi_thien: {
        id: "chan_khi_thien",
        name: "Chân Khí Thiên",
        category: "cong_phap",
        realmRequired: "Trúc Cơ",
        mpCost: 12,
        damage: (combat) => 25 + Math.floor(Math.random() * 15),
        description: "Hội tụ chân khí, phóng ra một luồng khí cương mạnh."
    },
    thien_kiem_hoi: {
        id: "thien_kiem_hoi",
        name: "Thiên Kiếm Hội",
        category: "cong_phap",
        realmRequired: "Kim Đan",
        mpCost: 25,
        damage: (combat) => 45 + Math.floor(Math.random() * 20),
        description: "Hóa kiếm khí thành vô số tia sáng, đâm xuyên mục tiêu."
    },
    pha_thien_quyet: {
        id: "pha_thien_quyet",
        name: "Phá Thiên Quyết",
        category: "cong_phap",
        realmRequired: "Nguyên Anh",
        mpCost: 50,
        damage: (combat) => 80 + Math.floor(Math.random() * 30),
        description: "Tuyệt kỹ tối thượng — chém ngang trời đất."
    },

    /* === PHÁP THUẬT === */
    bang_lang_quyet: {
        id: "bang_lang_quyet",
        name: "Băng Lang Quyết",
        category: "phap_thuat",
        realmRequired: "Luyện Khí",
        mpCost: 8,
        damage: (combat) => 12 + Math.floor(Math.random() * 8),
        description: "Hội tụ hàn khí thành băng đao.",
        effect: "ice"
    },
    hoa_son_quan: {
        id: "hoa_son_quan",
        name: "Hỏa Sơn Quán",
        category: "phap_thuat",
        realmRequired: "Trúc Cơ",
        mpCost: 15,
        damage: (combat) => 22 + Math.floor(Math.random() * 12),
        description: "Phun ra dòng dung nham, thiêu cháy mục tiêu.",
        effect: "fire"
    },
    loi_tinh_thien: {
        id: "loi_tinh_thien",
        name: "Lôi Tinh Thiên",
        category: "phap_thuat",
        realmRequired: "Trúc Cơ",
        mpCost: 18,
        damage: (combat) => 28 + Math.floor(Math.random() * 14),
        description: "Triệu hồi lôi đình, giáng xuống kẻ thù.",
        effect: "thunder"
    },
    than_phong_kiem: {
        id: "than_phong_kiem",
        name: "Thần Phong Kiếm",
        category: "phap_thuat",
        realmRequired: "Kim Đan",
        mpCost: 30,
        damage: (combat) => 50 + Math.floor(Math.random() * 18),
        description: "Hóa gió thành kiếm, xuyên phá mọi phòng thủ.",
        effect: "wind"
    },
    vo_cuc_hoi: {
        id: "vo_cuc_hoi",
        name: "Vô Cực Hồi",
        category: "phap_thuat",
        realmRequired: "Nguyên Anh",
        mpCost: 60,
        damage: (combat) => 95 + Math.floor(Math.random() * 25),
        description: "Vô cực sinh thái cực, nuốt chửng càn khôn.",
        effect: "void"
    },

    /* === THÂN THÔNG === */
    nhan_khong_thuc: {
        id: "nhan_khong_thuc",
        name: "Nhẫn Không Thức",
        category: "than_thong",
        realmRequired: "Luyện Khí",
        mpCost: 5,
        description: "Né tránh một đòn của đối phương.",
        isUtility: true
    },
    cuu_khi_kiem: {
        id: "cuu_khi_kiem",
        name: "Cửu Khí Kiếm",
        category: "than_thong",
        realmRequired: "Trúc Cơ",
        mpCost: 12,
        description: "Hội tụ chín luồng chân khí làm khiên phòng thủ.",
        isUtility: true,
        effect: "shield"
    },
    thien_nhan_thong: {
        id: "thien_nhan_thong",
        name: "Thiên Nhãn Thông",
        category: "than_thong",
        realmRequired: "Kim Đan",
        mpCost: 8,
        description: "Quan sát yếu điểm đối phương, tăng sát thương đòn tiếp theo.",
        isUtility: true,
        effect: "analyze"
    },
    cuc_lac_quyet: {
        id: "cuc_lac_quyet",
        name: "Cực Lạc Quyết",
        category: "than_thong",
        realmRequired: "Nguyên Anh",
        mpCost: 20,
        description: "Hồi phục một lượng sinh lực lớn ngay trong chiến đấu.",
        isUtility: true,
        effect: "heal"
    }
};

function listSkillsForRealm(realmName) {
    const realmIndex = REALMS.findIndex(r => r.name === realmName);
    const realmNames = REALMS.slice(0, realmIndex + 1).map(r => r.name);

    return Object.values(SKILL_DATABASE)
        .filter(s => realmNames.includes(s.realmRequired))
        .map(s => s.id);
}

function canUseSkill(skillId) {
    const skill = SKILL_DATABASE[skillId];
    if (!skill) return { ok: false, reason: "Kỹ năng không tồn tại." };

    const currentRealm = player.realm || currentRealm().name;
    if (!isRealmAtLeast(currentRealm, skill.realmRequired)) {
        return { ok: false, reason: `Cần đạt cảnh giới ${skill.realmRequired}.` };
    }

    if ((player.mp || 0) < skill.mpCost) {
        return { ok: false, reason: `Không đủ nội lực (cần ${skill.mpCost}).` };
    }

    if (!player.learnedSkills || !player.learnedSkills.includes(skillId)) {
        return { ok: false, reason: "Chưa học kỹ năng này." };
    }

    return { ok: true };
}

function isRealmAtLeast(current, required) {
    const ci = REALMS.findIndex(r => r.name === current);
    const ri = REALMS.findIndex(r => r.name === required);
    return ci >= 0 && ri >= 0 && ci >= ri;
}

function learnSkill(skillId) {
    const skill = SKILL_DATABASE[skillId];
    if (!skill) return false;

    if (!player.learnedSkills) player.learnedSkills = [];

    if (player.learnedSkills.includes(skillId)) {
        return false;
    }

    player.learnedSkills.push(skillId);
    log(`Đã học kỹ năng "${skill.name}".`, "good");
    return true;
}

function renderSkills() {
    const container = document.getElementById("skillArea");
    if (!container) return;

    container.innerHTML = "";

    const learned = Array.isArray(player.learnedSkills) ? player.learnedSkills : [];
    const currentRealmName = currentRealm().name;

    const grouped = {
        cong_phap: [],
        phap_thuat: [],
        than_thong: []
    };

    learned.forEach(skillId => {
        const skill = SKILL_DATABASE[skillId];
        if (skill && grouped[skill.category]) {
            grouped[skill.category].push(skill);
        }
    });

    let hasAny = false;

    Object.entries(SKILL_CATEGORIES).forEach(([catKey, cat]) => {
        const list = grouped[catKey];
        if (!list || !list.length) return;

        hasAny = true;

        const header = document.createElement("div");
        header.className = "skill-category-header";
        header.textContent = cat.name;
        container.appendChild(header);

        list.forEach(skill => {
            const card = document.createElement("div");
            card.className = "card skill-card";

            const usable = isRealmAtLeast(currentRealmName, skill.realmRequired);
            const mpOk = (player.mp || 0) >= (skill.mpCost || 0);

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-name">${escapeHTML(skill.name)}</div>
                    <div class="small">${usable ? "✓ Khả dụng" : `Cần: ${escapeHTML(skill.realmRequired)}`}</div>
                </div>
                <div class="card-desc">${escapeHTML(skill.description)}</div>
                <div class="small">Nội lực tiêu hao: ${skill.mpCost || 0}</div>
            `;

            if (skill.isUtility) {
                if (usable && mpOk) {
                    const btn = document.createElement("button");
                    btn.textContent = "Sử dụng";
                    btn.onclick = () => useUtilitySkill(skill.id);
                    card.appendChild(btn);
                } else {
                    const btn = document.createElement("button");
                    btn.disabled = true;
                    btn.textContent = !usable ? `Cần ${skill.realmRequired}` : "Không đủ MP";
                    card.appendChild(btn);
                }
            }

            container.appendChild(card);
        });
    });

    if (!hasAny) {
        container.innerHTML = `<div class="small">Chưa học kỹ năng nào. Hãy tham gia cốt truyện hoặc tu luyện để nhận kỹ năng.</div>`;
    }
}

function useUtilitySkill(skillId) {
    if (player.combat) {
        toast("Kỹ năng hỗ trợ không thể dùng giữa chiến đấu.");
        return;
    }

    const skill = SKILL_DATABASE[skillId];
    if (!skill) return;

    const check = canUseSkill(skillId);
    if (!check.ok) {
        toast(check.reason);
        return;
    }

    player.mp -= skill.mpCost;

    if (skill.effect === "heal") {
        const healAmount = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        log(`Cực Lạc Quyết vận chuyển, sinh lực +${healAmount}.`, "good");
        toast(`Hồi phục ${healAmount} sinh lực.`);
    } else if (skill.effect === "analyze") {
        log("Thiên Nhãn Thông khai mở — ngươi cảm nhận được chân khí lưu trong vạn vật.", "good");
        toast("+Tăng sát thương đòn tiếp theo.");
        player.nextDamageBonus = (player.nextDamageBonus || 0) + 20;
    } else if (skill.effect === "shield") {
        log("Cửu Khí Kiếm hộ thân — khiên chân khí bao phủ ngươi.", "good");
        toast("Khiên phòng thủ kích hoạt.");
        player.shieldTurns = (player.shieldTurns || 0) + 2;
    }

    autoSave();
    render();
}