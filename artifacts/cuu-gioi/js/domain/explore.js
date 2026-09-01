/* =====================================================
   EXPLORE & TRAVEL DOMAIN MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

const TRAVEL = {
    thanh_van_tran: ["thanh_van_son"],
    thanh_van_son: ["thanh_van_tran", "thanh_van_rung"],
    thanh_van_rung: ["thanh_van_son"]
};

function explore() {
    if (player.combat) {
        toast("Không thể khám phá khi đang chiến đấu.");
        return;
    }

    if (!player.storyState) {
        player.storyState = { flags: {}, completed: [], active: null };
    }
    if (!player.storyState.flags) player.storyState.flags = {};
    if (!Array.isArray(player.storyState.completed)) player.storyState.completed = [];

    if (
        player.storyState.active &&
        typeof StoryEngine !== "undefined" &&
        typeof StoryEngine.trigger === "function"
    ) {
        const continued = StoryEngine.trigger(player.storyState.active);
        if (continued) return;
        player.storyState.active = null;
    }

    const storyAvailable =
        typeof StoryEngine !== "undefined" &&
        typeof StoryEngine.trigger === "function";

    const bellCompleted = player.storyState.completed.includes("bell_at_night");

    if (storyAvailable && !bellCompleted && Math.random() < 0.25) {
        StoryEngine.trigger("bell_at_night");
        return;
    }

    const availableEvents = Array.isArray(EXPLORE_EVENTS)
        ? EXPLORE_EVENTS.filter(event => event && typeof event === "object")
        : [];

    if (!availableEvents.length) {
        log("Hiện chưa có sự kiện khám phá khả dụng.", "danger");
        toast("Chưa có sự kiện khám phá.");
        return;
    }

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    const goldReward = Number.isFinite(Number(event.gold)) ? Number(event.gold) : 0;
    const cultivationReward = Number.isFinite(Number(event.cultivation)) ? Number(event.cultivation) : 0;
    const eventText = typeof event.text === "string" && event.text.trim()
        ? event.text
        : "Ngươi khám phá khu vực xung quanh nhưng chưa phát hiện điều gì đặc biệt.";

    player.gold += goldReward;
    player.cultivation += cultivationReward;

    log(eventText);
    if (goldReward > 0) log(`Nhận ${goldReward} linh thạch.`, "good");
    if (goldReward < 0) log(`Mất ${Math.abs(goldReward)} linh thạch.`, "danger");
    if (cultivationReward > 0) log(`Linh lực +${cultivationReward}.`, "good");

    let itemName = null;
    if (event.item) {
        if (!player.inventory || typeof player.inventory !== "object") {
            player.inventory = {};
        }
        player.inventory[event.item] = (player.inventory[event.item] || 0) + 1;
        if (typeof ITEMS !== "undefined" && ITEMS[event.item]) {
            itemName = ITEMS[event.item].name;
            log(`Nhận được ${itemName}.`, "good");
        }
    }

    const summaryLines = [eventText, ""];
    if (goldReward > 0) summaryLines.push(`+${goldReward} linh thạch`);
    if (goldReward < 0) summaryLines.push(`-${Math.abs(goldReward)} linh thạch`);
    if (cultivationReward > 0) summaryLines.push(`+${cultivationReward} linh lực`);
    if (itemName) summaryLines.push(`Nhận: ${itemName}`);

    showPopup(event.title || "Khám phá", summaryLines.join("\n"));
    updateQuest("explore");
    autoSave();
    render();
}

function rest() {
    if (player.combat) {
        toast("Không thể nghỉ ngơi khi đang chiến đấu.");
        return;
    }
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    log("Ngươi nghỉ ngơi. Sinh lực và năng lượng đã hồi phục.", "good");
    toast("Trạng thái đã hồi phục.");
    autoSave();
    render();
}

function renderTravel() {
    const container = document.getElementById("travelButtons");
    if (!container) return;
    container.innerHTML = "";

    (TRAVEL[player.location] || []).forEach(destination => {
        const button = document.createElement("button");
        button.textContent = "Đi tới " + WORLD.locations[destination].name;
        button.onclick = () => travel(destination);
        container.appendChild(button);
    });
}

function travel(destination) {
    if (player.combat) {
        toast("Không thể di chuyển khi đang chiến đấu.");
        return;
    }
    if (!WORLD.locations[destination]) {
        toast("Địa điểm không tồn tại.");
        return;
    }
    player.location = destination;
    log(`Ngươi đi tới ${WORLD.locations[destination].name}.`);
    updateQuest("travel");
    autoSave();
    render();
}

function talkToAnhTuyet() {
    const relation = player.relationship.anh_tuyet;
    const dialogues = [
        "Ánh Tuyết: \"Ngươi lại tới rồi.\"",
        "Ánh Tuyết: \"Con đường tu hành vốn không dễ đi.\"",
        "Ánh Tuyết nhìn ngươi một lúc lâu nhưng không nói gì.",
        "Ánh Tuyết: \"Thanh Vân Sơn gần đây không được yên ổn.\""
    ];

    const dialogue = dialogues[Math.min(Math.floor(relation / 10), dialogues.length - 1)];
    document.getElementById("npcText").textContent = dialogue;
    player.relationship.anh_tuyet++;
    log(dialogue);
    autoSave();
    render();
}
