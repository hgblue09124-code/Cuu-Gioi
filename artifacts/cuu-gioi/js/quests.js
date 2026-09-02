/* =====================================================
   EXPANDED QUEST SYSTEM v1.0
   Cửu Giới — Big Update
   ===================================================== */

/*
 * QUESTS_FULL — replaces/supercedes QUESTS from state.js
 *
 * Each quest has:
 *   id, name, description, goal, goalType
 *     goalType: "explore"|"combat"|"travel"|"custom"|"gather"|"deliver"|"boss"
 *   reward: { gold, cultivation, items: [{id, qty}], skills: [skillId] }
 *   requires: { realm?, story?, flag? }
 *   giver: npcId
 *   steps: [{ action, target, description }]
 *   hidden: bool — not shown until accepted
 *   chain: next quest id
 */
const QUESTS_FULL = {
    /* Quest 1: Tutorial */
    first_step: {
        name: "Bước Đầu Tu Hành",
        description: "Khám phá Thanh Vân Sơn, làm quen với tu luyện.",
        goal: 3,
        goalType: "explore",
        reward: { gold: 100, cultivation: 50 },
        giver: "anh_tuyet"
    },

    /* Quest 2: Temple path */
    temple_path: {
        name: "Con Đường Cổ Tự",
        description: "Tìm hiểu về Cổ Tự Hoang Phế. Thu thập 3 Linh Thạch và nói chuyện với Ánh Tuyết.",
        goal: 3,
        goalType: "gather",
        target: "tinh_thach",
        reward: {
            gold: 150,
            cultivation: 80,
            items: [{ id: "spirit_pill", qty: 1 }],
            skills: ["quyen_phap_co"]
        },
        giver: "anh_tuyet",
        requires: { story: "bell_at_night" },
        chain: "find_relic"
    },

    /* Quest 3: Rumor hunt */
    rumor_hunt: {
        name: "Tin Đồn Yêu Thú",
        description: "Lão Nhạc kể về yêu thú xuất hiện gần Thanh Vân Sơn. Hãy tiêu diệt chúng.",
        goal: 5,
        goalType: "combat",
        reward: { gold: 200, cultivation: 100, items: [{ id: "linh_qua", qty: 2 }] },
        giver: "lao_nhac"
    },

    /* Quest 4: Clear beasts */
    clear_beasts: {
        name: "Thanh Trừ Yêu Thú",
        description: "Thanh Vân Chủ cần người dọn dẹp yêu thú quấy phá trên núi.",
        goal: 3,
        goalType: "combat",
        reward: {
            gold: 300,
            cultivation: 150,
            items: [{ id: "dan_hieu_luc", qty: 3 }],
            skills: ["kiem_phap_nhap_mon"]
        },
        giver: "thanh_van_chu",
        requires: { realm: "luyen_khi" }
    },

    /* Quest 5: Find relic (from temple) */
    find_relic: {
        name: "Tìm Kiếm Cổ Vật",
        description: "Hoang Tự Lão Nhân bảo rằng có một bảo vật ẩn giấu trong Cổ Tự.",
        goal: 1,
        goalType: "custom",
        customAction: "open_temple_seal",
        reward: {
            gold: 500,
            cultivation: 300,
            items: [{ id: "hoa_kiem", qty: 1 }],
            skills: ["bang_lang_quyet"]
        },
        giver: "hoang_tu_lao_nhan",
        chain: "huyet_son_trial"
    },

    /* Quest 6: Huyết Sơn Trial */
    huyet_son_trial: {
        name: "Huyết Sơn Thí Luyện",
        description: "Huyết Sơn Kiếm Khách thách đấu. Đánh bại 3 con yêu thú huyết mạch.",
        goal: 3,
        goalType: "combat",
        target: "huyet",
        reward: {
            gold: 800,
            cultivation: 500,
            items: [{ id: "huyet_tinh", qty: 1 }],
            skills: ["hoa_son_quan"]
        },
        giver: "huyet_son_kiem_khach",
        requires: { realm: "truc_co" },
        chain: "north_sea_trial"
    },

    /* Quest 7: North Sea */
    north_sea_trial: {
        name: "Bắc Hải Thí Luyện",
        description: "Lão ngư dân Bắc Hải nói về một con yêu long ẩn trong biển sâu. Hãy đánh bại nó.",
        goal: 1,
        goalType: "boss",
        bossId: "long_chi",
        reward: {
            gold: 1500,
            cultivation: 1000,
            items: [{ id: "long_hoa", qty: 1 }],
            skills: ["thien_kiem_hoi"]
        },
        giver: "bac_hai_co_dan",
        requires: { realm: "kim_dan" },
        chain: "final_trial"
    },

    /* Quest 8: Final */
    final_trial: {
        name: "Cửu Tầng Thí Luyện",
        description: "Cửu Giới Trưởng Lão muốn thử sức ngươi. Đánh bại Thần Nhãn — kẻ canh cổng Thượng Giới.",
        goal: 1,
        goalType: "boss",
        bossId: "thien_nhan",
        reward: {
            gold: 5000,
            cultivation: 3000,
            items: [{ id: "cuu_chuyen_kim_dan", qty: 1 }],
            skills: ["pha_thien_quyet", "vo_cuc_hoi"]
        },
        giver: "cuu_gioi_truong_lao",
        requires: { realm: "nguyen_anh" }
    }
};

/*
 * getQuestState — get player's state for a quest
 */
function getQuestState(qid) {
    if (!player.quests) player.quests = {};
    if (!player.quests[qid]) {
        player.quests[qid] = { accepted: false, progress: 0, completed: false, step: 0 };
    }
    return player.quests[qid];
}

/*
 * acceptQuest — start a quest
 */
function acceptQuest(qid) {
    const q = QUESTS_FULL[qid];
    if (!q) {
        toast("Nhiệm vụ không tồn tại.");
        return;
    }

    /* Check requirements */
    if (q.requires) {
        if (q.requires.realm) {
            const ridx = REALMS_FULL.findIndex(r => r.id === q.requires.realm);
            const cidx = REALMS_FULL.findIndex(r => r.name === currentRealm().name);
            if (cidx < ridx) {
                toast(`Cần cảnh giới ${REALMS_FULL[ridx].name} trở lên.`);
                return;
            }
        }
        if (q.requires.story) {
            const completed = (player.storyState && player.storyState.completed) || [];
            if (!completed.includes(q.requires.story)) {
                toast("Chưa hoàn thành điều kiện cần thiết.");
                return;
            }
        }
    }

    const state = getQuestState(qid);
    if (state.accepted) {
        toast("Đã nhận nhiệm vụ này rồi.");
        return;
    }

    state.accepted = true;
    state.progress = 0;
    state.step = 0;
    state.completed = false;

    log(`Đã nhận nhiệm vụ: "${q.name}".`, "good");
    toast(`Nhận nhiệm vụ: ${q.name}`);

    /* Learn skill if quest gives one */
    if (q.reward && q.reward.skills) {
        q.reward.skills.forEach(sid => {
            learnSkill(sid);
        });
    }

    autoSave();
    render();
}

/*
 * updateQuest — called from core.js after actions
 *   Handles all quest progress types
 */
function updateQuestFull(action, target) {
    const allQuests = player.quests || {};
    Object.keys(allQuests).forEach(qid => {
        const state = allQuests[qid];
        if (!state.accepted || state.completed) return;

        const q = QUESTS_FULL[qid];
        if (!q) return;

        let progressed = false;

        if (q.goalType === "explore" && action === "explore") {
            state.progress++;
            progressed = true;
        }

        if (q.goalType === "combat" && action === "combat") {
            if (!q.target) {
                state.progress++;
                progressed = true;
            } else if (q.target === "huyet" && target && (target.includes("huyet"))) {
                state.progress++;
                progressed = true;
            }
        }

        if (q.goalType === "travel" && action === "travel") {
            state.progress++;
            progressed = true;
        }

        if (q.goalType === "gather" && action === "gather" && target === q.target) {
            state.progress++;
            progressed = true;
        }

        if (progressed) {
            log(`Tiến độ "${q.name}": ${state.progress}/${q.goal}`, "good");
            if (state.progress >= q.goal) {
                completeQuest(qid);
            }
            autoSave();
            render();
        }
    });
}

/*
 * completeQuest — award rewards
 */
function completeQuest(qid) {
    const q = QUESTS_FULL[qid];
    if (!q) return;

    const state = getQuestState(qid);
    state.completed = true;

    let rewardText = [];
    if (q.reward) {
        if (q.reward.gold) {
            player.gold += q.reward.gold;
            rewardText.push(`${q.reward.gold} linh thạch`);
        }
        if (q.reward.cultivation) {
            player.cultivation += q.reward.cultivation;
            rewardText.push(`${q.reward.cultivation} linh lực`);
        }
        if (q.reward.items) {
            q.reward.items.forEach(item => {
                if (!player.inventory) player.inventory = {};
                player.inventory[item.id] = (player.inventory[item.id] || 0) + item.qty;
                const itemDef = ITEMS[item.id];
                if (itemDef) rewardText.push(itemDef.name);
            });
        }
        if (q.reward.skills) {
            q.reward.skills.forEach(sid => learnSkill(sid));
        }
    }

    showPopup(
        "Nhiệm vụ hoàn thành",
        `"${q.name}"\nPhần thưởng: ${rewardText.join(", ")}`
    );

    log(`Hoàn thành nhiệm vụ "${q.name}". Phần thưởng: ${rewardText.join(", ")}.`, "good");

    /* Unlock chain quest */
    if (q.chain) {
        log(`Một nhiệm vụ mới đã được mở khóa.`, "good");
    }

    autoSave();
    render();
}

/*
 * reportQuest — player reports to NPC for quest completion check
 */
function reportQuest(qid) {
    const q = QUESTS_FULL[qid];
    const state = getQuestState(qid);
    if (!q || !state.accepted) return;

    if (state.completed) {
        toast("Nhiệm vụ này đã hoàn thành.");
        return;
    }

    if (state.progress >= q.goal) {
        completeQuest(qid);
    } else {
        toast(`Tiến độ: ${state.progress}/${q.goal}`);
    }
}

/*
 * renderQuestFull — render expanded quest list
 */
function renderQuestFull() {
    const container = document.getElementById("questArea");
    if (!container) return;
    container.innerHTML = "";

    const all = Object.keys(QUESTS_FULL);
    if (!all.length) {
        container.innerHTML = `<div class="small">Không có nhiệm vụ khả dụng.</div>`;
        return;
    }

    let anyActive = false;
    all.forEach(qid => {
        const q = QUESTS_FULL[qid];
        const state = getQuestState(qid);

        if (!state.accepted) {
            /* Show available quests with requirements check */
            let canAccept = true;
            let reqReason = "";
            if (q.requires) {
                if (q.requires.realm) {
                    const ridx = REALMS_FULL.findIndex(r => r.id === q.requires.realm);
                    const cidx = REALMS_FULL.findIndex(r => r.name === currentRealm().name);
                    if (cidx < ridx) {
                        canAccept = false;
                        reqReason = `(Cần ${REALMS_FULL[ridx].name})`;
                    }
                }
                if (q.requires.story) {
                    const completed = (player.storyState && player.storyState.completed) || [];
                    if (!completed.includes(q.requires.story)) {
                        canAccept = false;
                        reqReason = "(Chưa mở khóa)";
                    }
                }
            }

            /* Only show if in the right location or near NPC */
            const npc = q.giver ? NPC_DATABASE[q.giver] : null;
            if (npc && WORLD_REGIONS[player.location]) {
                const regionNpcs = WORLD_REGIONS[player.location].npcs || [];
                if (!regionNpcs.includes(q.giver)) {
                    return; /* Don't show quest from NPC not in this area */
                }
            }

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-name">${escapeHTML(q.name)}</div>
                    <div class="small">${escapeHTML(reqReason || q.goalType)}</div>
                </div>
                <div class="card-desc">${escapeHTML(q.description)}</div>
                <div class="small">Phần thưởng: ${rewardSummary(q.reward)}</div>
                ${canAccept
                    ? `<button onclick="acceptQuest('${qid}')">Nhận nhiệm vụ</button>`
                    : `<button disabled>${escapeHTML(reqReason)}</button>`
                }
            `;
            container.appendChild(card);
            return;
        }

        if (state.completed) {
            return; /* Don't show completed quests */
        }

        anyActive = true;
        const card = document.createElement("div");
        card.className = "card";
        const pct = Math.min(100, Math.round((state.progress / q.goal) * 100));
        card.innerHTML = `
            <div class="card-header">
                <div class="card-name">${escapeHTML(q.name)}</div>
                <div class="small">${state.progress}/${q.goal}</div>
            </div>
            <div class="card-desc">${escapeHTML(q.description)}</div>
            <div class="progress-track" style="margin-top:6px;">
                <div class="progress-fill" style="width:${pct}%"></div>
            </div>
        `;
        container.appendChild(card);
    });

    if (!anyActive && container.children.length === 0) {
        container.innerHTML = `<div class="small">Không có nhiệm vụ đang thực hiện. Hãy tìm NPC.</div>`;
    }
}

function rewardSummary(reward) {
    if (!reward) return "—";
    const parts = [];
    if (reward.gold) parts.push(`${reward.gold} LT`);
    if (reward.cultivation) parts.push(`${reward.cultivation} LL`);
    if (reward.items) reward.items.forEach(i => parts.push(i.qty + "x " + (ITEMS[i.id] ? ITEMS[i.id].name : i.id)));
    if (reward.skills) parts.push(...reward.skills.map(s => SKILL_DATABASE[s] ? SKILL_DATABASE[s].name : s));
    return parts.length ? parts.join(", ") : "—";
}

/*
 * Legacy compat — override updateQuest from core.js
 */
const _updateQuestOriginal = typeof updateQuest !== "undefined" ? updateQuest : null;
function updateQuest(action, extra) {
    if (_updateQuestOriginal) _updateQuestOriginal(action);
    updateQuestFull(action, extra || null);
}