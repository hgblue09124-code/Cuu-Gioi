/* =====================================================
   COMBAT DOMAIN MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

function startCombat(enemyId) {
    if (player.combat) return;

    const enemy = ENEMIES[enemyId];

    if (!enemy) {
        toast("Không tìm thấy đối thủ.");
        return;
    }

    player.combat = {
        enemyId: enemyId,
        enemyName: enemy.name,
        enemyHp: enemy.maxHp,
        enemyMaxHp: enemy.maxHp,
        enemyAttack: enemy.attack
    };

    showPopup(
        "Cảnh báo",
        `Phát hiện ${enemy.name}. Chiến đấu bắt đầu.`
    );

    log(
        `Một ${enemy.name} xuất hiện!`,
        "danger"
    );

    render();
}

function renderCombat() {
    const container = document.getElementById("combatArea");
    if (!container) return;

    container.innerHTML = "";

    if (!player.combat) {
        if (player.location === "thanh_van_rung") {
            container.innerHTML = `
                <div class="small">
                    Trong rừng có dấu vết của yêu thú.
                </div>
            `;

            const button = document.createElement("button");
            button.textContent = "Tiến vào khu vực nguy hiểm";
            button.onclick = () =>
                startCombat(
                    Math.random() < 0.6 ? "son_tho" : "lang_xam"
                );

            container.appendChild(button);
        } else {
            container.innerHTML = `
                <div class="small">
                    Hiện tại không có đối thủ.
                </div>
            `;
        }
        return;
    }

    const combat = player.combat;
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <div class="card-name">
            ${combat.enemyName}
        </div>
        <div class="card-desc">
            Sinh lực: ${Math.max(0, combat.enemyHp)} / ${combat.enemyMaxHp}
        </div>
    `;

    container.appendChild(card);

    const attack = document.createElement("button");
    attack.className = "primary";
    attack.textContent = "Tấn công";
    attack.onclick = playerAttack;
    container.appendChild(attack);

    const item = document.createElement("button");
    item.textContent = `Hồi Nguyên Đan × ${player.inventory.dan_hieu_luc || 0}`;
    item.onclick = () => useItem("dan_hieu_luc");
    container.appendChild(item);

    const flee = document.createElement("button");
    flee.className = "danger";
    flee.textContent = "Rút lui";
    flee.onclick = fleeCombat;
    container.appendChild(flee);
}

function playerAttack() {
    if (!player.combat) return;

    const damage = Math.floor(Math.random() * 11) + 10;
    player.combat.enemyHp -= damage;

    log(
        `Ngươi gây ${damage} sát thương lên ${player.combat.enemyName}.`,
        "good"
    );

    if (player.combat.enemyHp <= 0) {
        winCombat();
        return;
    }

    enemyAttack();
    autoSave();
    render();
}

function enemyAttack() {
    if (!player.combat) return;

    const damage = Math.max(
        1,
        Math.floor(Math.random() * 6) + player.combat.enemyAttack - 5
    );

    player.hp -= damage;

    log(
        `${player.combat.enemyName} gây ${damage} sát thương.`,
        "danger"
    );

    if (player.hp <= 0) {
        player.hp = 1;
        player.combat = null;

        showPopup(
            "Cảnh báo sinh mệnh",
            "Ngươi đã trọng thương và buộc phải rút lui."
        );

        log(
            "Ngươi trọng thương.",
            "danger"
        );
    }
}

function winCombat() {
    const enemy = ENEMIES[player.combat.enemyId];

    player.gold += enemy.reward;
    player.cultivation += enemy.cultivation;
    player.combat = null;

    showPopup(
        "Chiến thắng",
        `Đánh bại ${enemy.name}. Nhận ${enemy.reward} linh thạch và ${enemy.cultivation} linh lực.`
    );

    log(`Đánh bại ${enemy.name}.`, "good");
    log(`Nhận ${enemy.reward} linh thạch và ${enemy.cultivation} linh lực.`, "good");

    updateQuest("combat");
    autoSave();
    render();
}

function fleeCombat() {
    player.combat = null;
    log("Ngươi rút lui khỏi trận chiến.");
    autoSave();
    render();
}
