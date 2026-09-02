/* =====================================================
   COMBAT EXPANSION v1.0 — Kỹ năng, phần tử, shield
   Cửu Giới — Big Update
   ===================================================== */

/*
 * Enhanced combat — adds skill usage during combat
 * The core combat functions are in core.js.
 * This file extends renderCombat() and playerAttack() to support skills.
 */

/*
 * Enhanced playerAttack — checks weapon buff, analyzes bonus, skill usage
 */
function playerAttackEnhanced() {
    if (!player.combat) return;

    const enemy = ENEMIES[player.combat.enemyId] || {};

    /* Apply weapon buff */
    let totalDamage = Math.floor(Math.random() * 11) + 10;
    if (enemy.weakness) {
        totalDamage = Math.floor(totalDamage * 1.5);
        log("Điểm yếu! Sát thương tăng 50%.", "good");
    }

    /* Apply analyze buff */
    if (player.nextDamageBonus) {
        totalDamage += player.nextDamageBonus;
        log(`Thiên Nhãn Thông kích hoạt — +${player.nextDamageBonus} sát thương.`, "good");
        player.nextDamageBonus = 0;
    }

    /* Apply weapon buff */
    if (player.weaponBuffTurns > 0) {
        totalDamage += player.weaponBuff || 0;
        log(`Pháp bảo kích hoạt — +${player.weaponBuff} sát thương.`, "good");
        player.weaponBuffTurns--;
        if (player.weaponBuffTurns <= 0) {
            player.weaponBuff = 0;
            log("Pháp bảo hết hiệu lực.", "danger");
        }
    }

    player.combat.enemyHp -= totalDamage;
    log(`Ngươi gây ${totalDamage} sát thương lên ${player.combat.enemyName}.`, "good");

    if (player.combat.enemyHp <= 0) {
        winCombatEnhanced();
        return;
    }

    enemyAttackEnhanced();
    autoSave();
    render();
}

/*
 * Enhanced enemy attack — checks shield
 */
function enemyAttackEnhanced() {
    if (!player.combat) return;

    let damage = Math.max(
        1,
        Math.floor(Math.random() * 6)
        + (player.combat.enemyAttack || 0)
        - 5
    );

    /* Shield absorbs damage */
    if (player.shieldTurns > 0) {
        const absorbed = Math.min(damage, 30);
        damage = Math.max(0, damage - absorbed);
        player.shieldTurns--;
        log(`Khiên chân khí hấp thụ ${absorbed} sát thương.`, "good");
        if (player.shieldTurns <= 0) {
            log("Khiên chân khí tan rồi.", "danger");
        }
    }

    if (damage <= 0) {
        log(`${player.combat.enemyName} tấn công nhưng bị khiên chặn hoàn toàn!`, "good");
    } else {
        player.hp -= damage;
        log(`${player.combat.enemyName} gây ${damage} sát thương.`, "danger");
    }

    if (player.hp <= 0) {
        player.hp = 1;
        player.combat = null;
        player.shieldTurns = 0;
        showPopup(
            "Cảnh báo sinh mệnh",
            "Ngươi đã trọng thương và buộc phải rút lui."
        );
        log("Ngươi trọng thương.", "danger");
    }
}

/*
 * Enhanced win combat — grants skill from enemies
 */
function winCombatEnhanced() {
    const enemy = ENEMIES[player.combat.enemyId];
    if (!enemy) {
        player.combat = null;
        render();
        return;
    }

    player.gold += enemy.reward || 0;
    player.cultivation += enemy.cultivation || 0;
    player.combat = null;

    /* Drop loot */
    let lootText = "";
    if (enemy.loot) {
        Object.entries(enemy.loot).forEach(([itemId, qty]) => {
            player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
            const item = ITEMS[itemId];
            lootText += `Nhận ${qty}x ${item ? item.name : itemId}. `;
        });
    }

    showPopup(
        "Chiến thắng",
        [
            `Đánh bại ${enemy.name}.`,
            `+${enemy.reward || 0} linh thạch, +${enemy.cultivation || 0} linh lực.`,
            lootText
        ].filter(Boolean).join("\n")
    );

    log(`Đánh bại ${enemy.name}. +${enemy.reward || 0} LT, +${enemy.cultivation || 0} LL.`, "good");
    if (lootText) log(lootText, "good");

    updateQuestFull("combat", enemy.id);
    autoSave();
    render();
}

/*
 * useSkillInCombat — apply a skill during combat
 */
function useSkillInCombat(skillId) {
    if (!player.combat) {
        toast("Không có chiến đấu.");
        return;
    }

    const skill = SKILL_DATABASE[skillId];
    if (!skill) {
        toast("Kỹ năng không tồn tại.");
        return;
    }

    if (skill.isUtility) {
        toast("Kỹ năng hỗ trợ không dùng trong chiến đấu.");
        return;
    }

    const check = canUseSkill(skillId);
    if (!check.ok) {
        toast(check.reason);
        return;
    }

    player.mp -= skill.mpCost || 0;

    let damage = skill.damage ? skill.damage(player.combat) : Math.floor(Math.random() * 11) + 10;

    /* Element effectiveness */
    if (player.combat.enemyId && ENEMIES[player.combat.enemyId]) {
        const enemy = ENEMIES[player.combat.enemyId];
        if (enemy.weakness && skill.effect) {
            if (
                (enemy.weakness === "ice" && skill.effect === "ice") ||
                (enemy.weakness === "fire" && skill.effect === "fire") ||
                (enemy.weakness === "thunder" && skill.effect === "thunder") ||
                (enemy.weakness === "wind" && skill.effect === "wind")
            ) {
                damage = Math.floor(damage * 1.5);
                log(`Điểm yếu phần tử! ${skill.name} gây 150% sát thương.`, "good");
            }
        }
    }

    player.combat.enemyHp -= damage;
    log(`Dùng "${skill.name}" — gây ${damage} sát thương.`, "good");

    /* Utility effects */
    if (skill.effect === "analyze") {
        player.nextDamageBonus = (player.nextDamageBonus || 0) + 20;
        log("Khung nhìn mở rộng — đòn tiếp theo mạnh hơn.", "good");
    }
    if (skill.effect === "shield") {
        player.shieldTurns = (player.shieldTurns || 0) + 2;
        log("Khiên chân khí hình thành.", "good");
    }
    if (skill.effect === "heal") {
        const healAmount = Math.floor(player.maxHp * 0.4);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        log(`Cực Lạc Quyết — sinh lực +${healAmount}.`, "good");
    }

    autoSave();
    render();
}

/*
 * renderCombatEnhanced — render combat UI with skill buttons
 */
const _renderCombatOriginal = typeof renderCombat !== "undefined" ? renderCombat : null;
function renderCombat() {
    if (_renderCombatOriginal) {
        _renderCombatOriginal();
    }

    const container = document.getElementById("combatArea");
    if (!container) return;

    if (!player.combat) {
        /* Show available enemies */
        const region = WORLD_REGIONS[player.location];
        const hasEnemies = region && region.enemies && region.enemies.length;
        if (hasEnemies) {
            /* Already rendered by original */
        }
        return;
    }

    /* Append skill panel below attack buttons */
    const learned = Array.isArray(player.learnedSkills) ? player.learnedSkills : [];
    const combatSkills = learned
        .map(sid => SKILL_DATABASE[sid])
        .filter(s => s && !s.isUtility && (player.mp || 0) >= (s.mpCost || 0));

    if (!combatSkills.length) return;

    const skillDiv = document.createElement("div");
    skillDiv.style.cssText = "margin-top:10px;";

    const skillLabel = document.createElement("div");
    skillLabel.className = "small";
    skillLabel.textContent = "Kỹ năng chiến đấu:";
    skillLabel.style.cssText = "margin-bottom:5px; color:var(--accent);";
    skillDiv.appendChild(skillLabel);

    combatSkills.forEach(skill => {
        const btn = document.createElement("button");
        btn.className = "secondary";
        btn.textContent = `${skill.name} (${skill.mpCost || 0} MP)`;
        btn.style.cssText = "min-height:36px; font-size:12px; margin-top:4px;";
        btn.onclick = () => useSkillInCombat(skill.id);
        skillDiv.appendChild(btn);
    });

    container.appendChild(skillDiv);
}