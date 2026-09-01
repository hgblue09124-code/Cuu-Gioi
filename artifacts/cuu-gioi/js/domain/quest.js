/* =====================================================
   QUEST DOMAIN MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

function updateQuest(action) {
    const quest = player.quest.first_step;
    if (!quest.accepted || quest.completed) {
        return;
    }

    if (["explore", "travel", "combat"].includes(action)) {
        quest.progress++;
    }

    if (quest.progress >= QUESTS.first_step.goal) {
        quest.completed = true;
        player.gold += QUESTS.first_step.rewardGold;
        player.cultivation += QUESTS.first_step.rewardCultivation;

        showPopup(
            "Nhiệm vụ hoàn thành",
            `Hoàn thành "${QUESTS.first_step.name}". Nhận ${QUESTS.first_step.rewardGold} linh thạch và ${QUESTS.first_step.rewardCultivation} linh lực.`
        );

        log(
            `Hoàn thành nhiệm vụ "${QUESTS.first_step.name}".`,
            "good"
        );
    }
}

function renderQuest() {
    const container = document.getElementById("questArea");
    if (!container) return;
    container.innerHTML = "";

    const quest = player.quest.first_step;

    if (!quest.accepted) {
        container.innerHTML = `
            <div class="card">
                <div class="card-name">${QUESTS.first_step.name}</div>
                <div class="card-desc">${QUESTS.first_step.description}</div>
                <button onclick="acceptFirstQuest()">Nhận nhiệm vụ</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <div class="card-name">${QUESTS.first_step.name}</div>
            <div class="card-desc">${QUESTS.first_step.description}</div>
            <div class="card-desc">
                Tiến độ: ${
                    quest.completed
                        ? "Đã hoàn thành"
                        : `${quest.progress} / ${QUESTS.first_step.goal}`
                }
            </div>
        </div>
    `;
}

function acceptFirstQuest() {
    player.quest.first_step.accepted = true;
    log(`Đã nhận nhiệm vụ "${QUESTS.first_step.name}".`, "good");
    showPopup("Nhiệm vụ mới", QUESTS.first_step.name);
    autoSave();
    render();
}
