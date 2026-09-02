/* =====================================================
   CORE ENGINE & GAME LOOP
   Cửu Giới — Core v0.4.3
===================================================== */

const TRAVEL = {
    thanh_van_tran: ["thanh_van_son"],
    thanh_van_son: ["thanh_van_tran", "thanh_van_rung"],
    thanh_van_rung: ["thanh_van_son"]
};


/* =====================================================
   RUNTIME PATCH APPLICATION

   Gọi ngay sau bất kỳ thời điểm nào biến `player` được
   gán lại (boot, load, import, xóa save) để các "Runtime
   patch" lưu qua Admin Console (Runtime.persistent) được
   áp dụng lên đúng player thật, thay vì bị mất do player
   tạm ban đầu bị ghi đè.
===================================================== */

function applyRuntimePatches() {

    if (
        typeof Runtime !== "undefined" &&
        Runtime.persistent &&
        typeof Runtime.persistent.executeAll === "function"
    ) {

        Runtime.persistent.executeAll();
    }
}


/* =====================================================
   CULTIVATION
===================================================== */

function cultivate() {
    if (player.combat) {
        toast("Không thể tu luyện khi đang chiến đấu.");
        return;
    }

    const cultivateButton =
        document.getElementById("cultivateButton");

    if (cultivateButton?.disabled) {
        return;
    }

    if (cultivateButton) {
        cultivateButton.disabled = true;
        cultivateButton.classList.add("is-cultivating");
        cultivateButton.textContent = "Đang tu luyện…";
    }

    const oldRealm = currentRealm().name;
    const gain = Math.floor(Math.random() * 21) + 10;

    player.cultivation += gain;

    log(
        `Ngươi vận chuyển công pháp, nhận được ${gain} điểm linh lực.`,
        "good"
    );

    const newRealm = currentRealm().name;

    if (oldRealm !== newRealm) {
        showPopup(
            "Đột phá cảnh giới",
            `Ngươi chính thức bước vào ${newRealm}.`
        );

        log(
            `Đột phá cảnh giới, tiến vào ${newRealm}.`,
            "good"
        );
    }

    autoSave();
    render();

    toast(
        `Tu luyện thành công · +${gain} linh lực`
    );

    setTimeout(() => {
        if (!cultivateButton) return;

        cultivateButton.disabled = false;
        cultivateButton.classList.remove("is-cultivating");
        cultivateButton.textContent = "Tu luyện";
    }, 420);
}


/* =====================================================
   EXPLORE
   Story Interaction v0.4.3
===================================================== */

function explore() {

    if (player.combat) {
        toast("Không thể khám phá khi đang chiến đấu.");
        return;
    }


    /* ---------------------------------------------
       Đảm bảo storyState tồn tại
       Cho phép save cũ hoạt động an toàn.
    --------------------------------------------- */

    if (!player.storyState) {
        player.storyState = {
            flags: {},
            completed: [],
            active: null
        };
    }

    if (!player.storyState.flags) {
        player.storyState.flags = {};
    }

    if (!Array.isArray(player.storyState.completed)) {
        player.storyState.completed = [];
    }


    /* ---------------------------------------------
       1. Tiếp tục Story đang dang dở
    --------------------------------------------- */

    if (
        player.storyState.active &&
        typeof StoryEngine !== "undefined" &&
        typeof StoryEngine.trigger === "function"
    ) {

        const continued =
            StoryEngine.trigger(
                player.storyState.active
            );

        if (continued) {
            return;
        }

        // Save cũ hoặc Runtime patch có thể giữ lại một story ID
        // không còn tồn tại. Xóa trạng thái kẹt để khám phá tiếp tục được.
        player.storyState.active = null;
    }


    /* ---------------------------------------------
       2. Story Event ngẫu nhiên
       
       Tỷ lệ: 25%
       
       bell_at_night chỉ xuất hiện một lần
       cho tới khi StoryEngine đánh dấu completed.
    --------------------------------------------- */

    const storyAvailable =
        typeof StoryEngine !== "undefined" &&
        typeof StoryEngine.trigger === "function";


    const bellCompleted =
        player.storyState.completed.includes(
            "bell_at_night"
        );


    if (
        storyAvailable &&
        !bellCompleted &&
        Math.random() < 0.25
    ) {

        StoryEngine.trigger(
            "bell_at_night"
        );

        return;
    }


    /* ---------------------------------------------
       3. Logic khám phá thông thường

       v0.4.5 — mỗi sự kiện giờ hiện dưới dạng popup
       (giống Story Event), thay vì chỉ ghi log/toast.
       Dữ liệu sự kiện nằm ở EXPLORE_EVENTS (state.js),
       có thể mở rộng qua Admin Runtime Console.
    --------------------------------------------- */

    const availableEvents =
        Array.isArray(EXPLORE_EVENTS)
            ? EXPLORE_EVENTS.filter(
                event =>
                    event &&
                    typeof event === "object"
            )
            : [];

    if (!availableEvents.length) {
        log(
            "Hiện chưa có sự kiện khám phá khả dụng.",
            "danger"
        );
        toast("Chưa có sự kiện khám phá.");
        return;
    }

    const event =
        availableEvents[
            Math.floor(
                Math.random() * availableEvents.length
            )
        ];

    const goldReward =
        Number.isFinite(Number(event.gold))
            ? Number(event.gold)
            : 0;

    const cultivationReward =
        Number.isFinite(Number(event.cultivation))
            ? Number(event.cultivation)
            : 0;

    const eventText =
        typeof event.text === "string" &&
        event.text.trim()
            ? event.text
            : "Ngươi khám phá khu vực xung quanh nhưng chưa phát hiện điều gì đặc biệt.";


    player.gold += goldReward;
    player.cultivation += cultivationReward;

    /* Track explored area */
    if (typeof trackExploredArea === "function") {
        trackExploredArea(player.location);
    }


    log(eventText);


    if (goldReward > 0) {

        log(
            `Nhận ${goldReward} linh thạch.`,
            "good"
        );

    }


    if (goldReward < 0) {

        log(
            `Mất ${Math.abs(goldReward)} linh thạch.`,
            "danger"
        );

    }


    if (cultivationReward > 0) {

        log(
            `Linh lực +${cultivationReward}.`,
            "good"
        );

    }


    let itemName = null;

    if (event.item) {

        if (!player.inventory || typeof player.inventory !== "object") {
            player.inventory = {};
        }

        player.inventory[event.item] =
            (player.inventory[event.item] || 0) + 1;

        if (
            typeof ITEMS !== "undefined" &&
            ITEMS[event.item]
        ) {

            itemName = ITEMS[event.item].name;

            log(
                `Nhận được ${itemName}.`,
                "good"
            );
        }
    }


    /* ---------------------------------------------
       Popup tóm tắt sự kiện khám phá
    --------------------------------------------- */

    const summaryLines = [eventText, ""];

    if (goldReward > 0) summaryLines.push(`+${goldReward} linh thạch`);
    if (goldReward < 0) summaryLines.push(`-${Math.abs(goldReward)} linh thạch`);
    if (cultivationReward > 0) summaryLines.push(`+${cultivationReward} linh lực`);
    if (itemName) summaryLines.push(`Nhận: ${itemName}`);

    showPopup(
        event.title || "Khám phá",
        summaryLines.join("\n")
    );


    /* Big Update v1.0 — extended quest progress tracking */
    if (typeof updateQuestFull === "function") {
        updateQuestFull("explore");
    }
    updateQuest("explore");

    /* Check for secret discoveries */
    if (typeof checkSecrets === "function") {
        const found = checkSecrets();
        found.forEach(sid => {
            if (typeof showSecretDiscovery === "function") {
                showSecretDiscovery(sid);
            }
        });
    }

    autoSave();
    render();
}


/* =====================================================
   REST
===================================================== */

function rest() {

    if (player.combat) {
        toast("Không thể nghỉ ngơi khi đang chiến đấu.");
        return;
    }

    player.hp = player.maxHp;
    player.mp = player.maxMp;

    log(
        "Ngươi nghỉ ngơi. Sinh lực và năng lượng đã hồi phục.",
        "good"
    );

    toast("Trạng thái đã hồi phục.");

    autoSave();
    render();
}


/* =====================================================
   TRAVEL
===================================================== */

function renderTravel() {

    const container =
        document.getElementById("travelButtons");

    if (!container) return;

    container.innerHTML = "";

    (TRAVEL[player.location] || [])
        .forEach(destination => {

            if (!WORLD.locations[destination]) return;

            /* Check access requirement (Big Update v1.0) */
            let accessible = true;
            let reason = "";
            if (typeof regionHasAccess === "function") {
                accessible = regionHasAccess(destination);
                const region = WORLD_REGIONS && WORLD_REGIONS[destination];
                if (!accessible && region) {
                    reason = region.requires || "";
                }
            }

            const button =
                document.createElement("button");

            button.textContent =
                "Đi tới " +
                WORLD.locations[destination].name;

            if (!accessible) {
                button.disabled = true;
                button.textContent += ` (${reason})`;
            }

            button.onclick =
                () => travel(destination);

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

    /* Big Update v1.0 — check region access before moving */
    if (typeof regionHasAccess === "function" && !regionHasAccess(destination)) {
        const region = WORLD_REGIONS && WORLD_REGIONS[destination];
        toast(`Chưa thể đến ${WORLD.locations[destination].name}. ${region ? region.requires : ""}`);
        return;
    }

    player.location = destination;

    log(
        `Ngươi đi tới ${WORLD.locations[destination].name}.`
    );

    if (typeof trackExploredArea === "function") {
        trackExploredArea(destination);
    }

    if (typeof updateQuestFull === "function") {
        updateQuestFull("travel", destination);
    }
    updateQuest("travel");

    autoSave();
    render();
}


/* =====================================================
   COMBAT
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

    const container =
        document.getElementById("combatArea");

    if (!container) return;

    container.innerHTML = "";


    if (!player.combat) {

        const region = WORLD_REGIONS && WORLD_REGIONS[player.location];
        const hasEnemies = region && region.enemies && region.enemies.length;

        if (hasEnemies) {
            container.innerHTML =
                `<div class="small">
                    ${escapeHTML(region.description || "Khu vực nguy hiểm.")}
                </div>`;

            region.enemies.forEach(eid => {
                const enemy = ENEMIES[eid];
                if (!enemy) return;
                const btn = document.createElement("button");
                btn.textContent = `Giao chiến với ${enemy.name}`;
                btn.onclick = () => startCombat(eid);
                container.appendChild(btn);
            });
        } else {
            container.innerHTML =
                `<div class="small">
                    Hiện tại không có đối thủ ở khu vực này.
                </div>`;
        }

        return;
    }


    const combat = player.combat;

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <div class="card-name">
            ${combat.enemyName}
        </div>

        <div class="card-desc">
            Sinh lực:
            ${Math.max(0, combat.enemyHp)}
            /
            ${combat.enemyMaxHp}
        </div>
    `;

    container.appendChild(card);


    const attack =
        document.createElement("button");

    attack.className = "primary";
    attack.textContent = "Tấn công";
    attack.onclick = typeof playerAttackEnhanced !== "undefined" ? playerAttackEnhanced : playerAttack;

    container.appendChild(attack);


    const item =
        document.createElement("button");

    item.textContent =
        `Hồi Nguyên Đan × ${
            player.inventory.dan_hieu_luc || 0
        }`;

    item.onclick =
        () => useItem("dan_hieu_luc");

    container.appendChild(item);


    const flee =
        document.createElement("button");

    flee.className = "danger";
    flee.textContent = "Rút lui";
    flee.onclick = fleeCombat;

    container.appendChild(flee);
}


function playerAttack() {
    /* Use enhanced version if loaded from combat.js (Big Update v1.0) */
    if (typeof playerAttackEnhanced === "function") {
        return playerAttackEnhanced();
    }

    if (!player.combat) return;

    const damage =
        Math.floor(Math.random() * 11) + 10;

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

const _enemyAttackOriginal = typeof enemyAttack !== "undefined" ? enemyAttack : null;
const _enemyAttackEnhanced = typeof enemyAttackEnhanced !== "undefined" ? enemyAttackEnhanced : null;
function enemyAttack() {
    if (_enemyAttackEnhanced) {
        _enemyAttackEnhanced();
        return;
    }
    if (_enemyAttackOriginal) {
        _enemyAttackOriginal();
        return;
    }
}


function winCombat() {
    /* Use enhanced version if loaded from combat.js (Big Update v1.0) */
    if (typeof winCombatEnhanced === "function") {
        return winCombatEnhanced();
    }

    const enemy =
        ENEMIES[player.combat.enemyId];

    player.gold += (enemy.reward || 0);
    player.cultivation += (enemy.cultivation || 0);
    player.combat = null;

    /* Track win counter for secrets */
    if (typeof trackCombatWin === "function") {
        trackCombatWin();
    }

    /* Check for secret discoveries */
    if (typeof checkSecrets === "function") {
        const found = checkSecrets();
        found.forEach(sid => {
            if (typeof showSecretDiscovery === "function") showSecretDiscovery(sid);
        });
    }

    /* Show loot drop */
    let lootText = "";
    if (enemy.loot) {
        Object.entries(enemy.loot).forEach(([itemId, qty]) => {
            player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
            const item = ITEMS[itemId];
            lootText += `Nhận ${qty}x ${item ? item.name : itemId}. `;
        });
    }

    const popupText = [
        `Đánh bại ${enemy.name}.`,
        `+${enemy.reward || 0} linh thạch, +${enemy.cultivation || 0} linh lực.`,
        lootText
    ].filter(Boolean).join("\n");

    showPopup("Chiến thắng", popupText);

    log(`Đánh bại ${enemy.name}. +${enemy.reward || 0} LT, +${enemy.cultivation || 0} LL.`, "good");
    if (lootText) log(lootText, "good");

    /* Big Update v1.0 — extended quest progress */
    if (typeof updateQuestFull === "function") {
        updateQuestFull("combat", enemy.id);
    }
    updateQuest("combat");

    autoSave();
    render();
}


function fleeCombat() {

    player.combat = null;

    log(
        "Ngươi rút lui khỏi trận chiến."
    );

    autoSave();
    render();
}


/* =====================================================
   QUEST
===================================================== */

function updateQuest(action) {

    const quest =
        player.quest.first_step;

    if (
        !quest.accepted ||
        quest.completed
    ) {
        return;
    }


    if (
        ["explore", "travel", "combat"]
            .includes(action)
    ) {

        quest.progress++;
    }


    if (
        quest.progress >=
        QUESTS.first_step.goal
    ) {

        quest.completed = true;

        player.gold +=
            QUESTS.first_step.rewardGold;

        player.cultivation +=
            QUESTS.first_step.rewardCultivation;


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
    /* Delegated to renderQuestFull() from quests.js */
    if (typeof renderQuestFull === "function") {
        renderQuestFull();
    } else {
        /* Fallback — original simple quest render */
        const container = document.getElementById("questArea");
        if (!container) return;
        container.innerHTML = `<div class="small">Nạp hệ thống nhiệm vụ...</div>`;
    }
}


function acceptFirstQuest() {

    if (typeof acceptQuest === "function" && typeof QUESTS_FULL !== "undefined" && QUESTS_FULL.first_step) {
        return acceptQuest("first_step");
    }

    player.quest.first_step.accepted = true;

    log(
        `Đã nhận nhiệm vụ "${QUESTS.first_step.name}".`,
        "good"
    );

    showPopup(
        "Nhiệm vụ mới",
        QUESTS.first_step.name
    );

    autoSave();
    render();
}


/* =====================================================
   NPC — ÁNH TUYẾT
===================================================== */

function talkToAnhTuyet() {

    const relation =
        player.relationship.anh_tuyet;

    const dialogues = [

        "Ánh Tuyết: \"Ngươi lại tới rồi.\"",

        "Ánh Tuyết: \"Con đường tu hành vốn không dễ đi.\"",

        "Ánh Tuyết nhìn ngươi một lúc lâu nhưng không nói gì.",

        "Ánh Tuyết: \"Thanh Vân Sơn gần đây không được yên ổn.\""

    ];


    const dialogue =
        dialogues[
            Math.min(
                Math.floor(relation / 10),
                dialogues.length - 1
            )
        ];


    document.getElementById(
        "npcText"
    ).textContent = dialogue;


    player.relationship.anh_tuyet++;

    log(dialogue);

    autoSave();
    render();
}


/* =====================================================
   SAVE
===================================================== */

async function saveGame() {

    try {

        await saveToDatabase();

        log(
            "Đã lưu thế giới.",
            "good"
        );

        toast(
            "Đã lưu game."
        );

    } catch (error) {

        console.error(error);

        toast(
            "Lưu game thất bại."
        );
    }
}


/* =====================================================
   LOAD
===================================================== */

async function loadGame() {

    try {

        const saved =
            await loadFromDatabase();


        if (!saved) {

            toast(
                "Chưa có dữ liệu lưu."
            );

            return;
        }


        player =
            normalizePlayer(saved);


        applyRuntimePatches();

        render();

        log(
            "Đã khôi phục dữ liệu hành trình.",
            "good"
        );

        updateSaveStatus(
            "Đã tải dữ liệu lưu"
        );


    } catch (error) {

        console.error(error);

        toast(
            "Không thể tải dữ liệu."
        );
    }
}


/* =====================================================
   EXPORT SAVE
===================================================== */

function exportSave() {

    const data = {

        game: GAME.name,

        version: GAME.version,

        exportedAt:
            new Date().toISOString(),

        player: player
    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "cuu-gioi-save.json";


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    toast(
        "Đã xuất save."
    );
}


/* =====================================================
   IMPORT SAVE
===================================================== */

function importSave(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        async () => {

            try {

                const data =
                    JSON.parse(
                        reader.result
                    );


                if (!data.player) {
                    throw new Error(
                        "Save không hợp lệ."
                    );
                }


                player =
                    normalizePlayer(
                        data.player
                    );


                applyRuntimePatches();

                await saveToDatabase();

                render();


                showPopup(
                    "Khôi phục thành công",
                    "Dữ liệu nhân vật đã được nhập vào hệ thống."
                );


                log(
                    "Đã nhập dữ liệu lưu.",
                    "good"
                );


            } catch (error) {

                console.error(error);

                toast(
                    "Save không hợp lệ."
                );
            }
        };


    reader.readAsText(file);

    event.target.value = "";
}


/* =====================================================
   DELETE SAVE
===================================================== */

async function deleteSave() {

    if (
        !confirm(
            "Xóa toàn bộ dữ liệu lưu?"
        )
    ) {
        return;
    }


    try {

        await new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        GAME.store,
                        "readwrite"
                    );


                const request =
                    transaction
                        .objectStore(
                            GAME.store
                        )
                        .delete(
                            GAME.saveKey
                        );


                request.onsuccess =
                    resolve;

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );
            }
        );


        player =
            createNewPlayer();


        applyRuntimePatches();

        render();


        log(
            "Đã xóa dữ liệu lưu.",
            "good"
        );


        showPopup(
            "Hệ thống tái lập",
            "Dữ liệu nhân vật đã được xóa."
        );


        updateSaveStatus(
            "Chưa có dữ liệu lưu"
        );


    } catch (error) {

        console.error(error);

        toast(
            "Không thể xóa save."
        );
    }
}


/* =====================================================
   BOOT
===================================================== */

function bindGameActionButtons() {

    const exploreButton =
        document.getElementById("exploreButton");

    if (!exploreButton || exploreButton.dataset.bound === "true") {
        return;
    }

    exploreButton.addEventListener(
        "click",
        explore
    );

    exploreButton.dataset.bound = "true";
}


async function bootGame() {

    try {

        await openDatabase();


        const saved =
            await loadFromDatabase();


        if (saved) {

            player =
                normalizePlayer(
                    saved
                );


            applyRuntimePatches();

            render();


            log(
                "Đã khôi phục dữ liệu hành trình.",
                "good"
            );


            updateSaveStatus(
                "Đã khôi phục dữ liệu"
            );


            showPopup(
                "Hệ thống đã kết nối",
                `Chào mừng trở lại, ${player.name}. Hành trình được khôi phục.`
            );


        } else {

            player =
                createNewPlayer();


            applyRuntimePatches();

            render();


            log(
                "Hệ thống đã khởi tạo.",
                "good"
            );


            log(
                "Ngươi tỉnh lại tại Thanh Vân Trấn."
            );


            await saveToDatabase();


            showPopup(
                "Cửu Giới — Big Update v1.0",
                "Hệ thống tu hành đã được khởi tạo. Bảy cảnh giới, tám vùng đất, vô số bí ẩn đang chờ ngươi khám phá."
            );
        }


    } catch (error) {

        console.error(error);

        render();


        showPopup(
            "Lỗi hệ thống",
            "Không thể khởi tạo bộ nhớ lưu."
        );
    }
}


bindGameActionButtons();
bootGame();