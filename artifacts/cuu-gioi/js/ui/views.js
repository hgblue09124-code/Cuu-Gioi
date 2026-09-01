/* =====================================================
   MAIN UI VIEWS & RENDER PIPELINE
   Cửu Giới — Core v0.4.5
===================================================== */

function updateSaveStatus(text) {
    const element = document.getElementById("saveStatus");
    if (!element) return;
    element.textContent = text;
}

function escapeHTML(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function render() {
    const location = WORLD.locations[player.location];
    if (!location) {
        console.warn("Không tìm thấy địa điểm:", player.location);
        return;
    }

    document.getElementById("location").textContent = location.name;
    document.getElementById("description").textContent = location.description;
    document.getElementById("playerName").textContent = player.name;
    document.getElementById("realm").textContent = currentRealm().name;
    document.getElementById("hp").textContent = `${player.hp} / ${player.maxHp}`;
    document.getElementById("mp").textContent = `${player.mp} / ${player.maxMp}`;
    document.getElementById("cultivation").textContent = player.cultivation;
    renderCultivationProgress();
    document.getElementById("gold").textContent = player.gold;

    if (typeof renderTravel === "function") renderTravel();
    if (typeof renderCombat === "function") renderCombat();
    if (typeof renderQuest === "function") renderQuest();
    if (typeof renderInventory === "function") renderInventory();
    if (typeof renderAdmin === "function") renderAdmin();
}

function renderCultivationProgress() {
    const progressBar = document.getElementById("cultivationProgressBar");
    const progressLabel = document.getElementById("cultivationProgressLabel");
    const progressPercent = document.getElementById("cultivationProgressPercent");
    const progressHint = document.getElementById("cultivationProgressHint");
    const progressTrack = progressBar?.parentElement;

    if (
        !progressBar ||
        !progressLabel ||
        !progressPercent ||
        !progressHint ||
        !progressTrack
    ) {
        return;
    }

    const realmIndex = REALMS.findIndex(
        realm => realm.name === currentRealm().name
    );

    const nextRealm = REALMS[realmIndex + 1];

    if (!nextRealm) {
        progressLabel.textContent = "Tiến độ tu vi";
        progressPercent.textContent = "Tối đa";
        progressHint.textContent = "Đã đạt cảnh giới cao nhất.";
        progressBar.style.width = "100%";
        progressTrack.setAttribute("aria-valuenow", "100");
        return;
    }

    const currentRealmData = REALMS[realmIndex];
    const range = nextRealm.required - currentRealmData.required;
    const gainedInRealm = Math.max(0, player.cultivation - currentRealmData.required);
    const percent = Math.min(100, Math.max(0, Math.round(gainedInRealm / range * 100)));

    progressLabel.textContent = `${currentRealmData.name} → ${nextRealm.name}`;
    progressPercent.textContent = `${percent}%`;
    progressHint.textContent = `${player.cultivation} / ${nextRealm.required} linh lực`;
    progressBar.style.width = `${percent}%`;
    progressTrack.setAttribute("aria-valuenow", String(percent));
}
