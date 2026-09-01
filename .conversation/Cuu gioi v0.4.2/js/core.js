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

        StoryEngine.trigger(
            player.storyState.active
        );

        return;
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

    const event =
        EXPLORE_EVENTS[
            Math.floor(
                Math.random() * EXPLORE_EVENTS.length
            )
        ];


    player.gold += event.gold || 0;
    player.cultivation += event.cultivation || 0;


    log(event.text);


    if (event.gold > 0) {

        log(
            `Nhận ${event.gold} linh thạch.`,
            "good"
        );

    }


    if (event.gold < 0) {

        log(
            `Mất ${Math.abs(event.gold)} linh thạch.`,
            "danger"
        );

    }


    if (event.cultivation > 0) {

        log(
            `Linh lực +${event.cultivation}.`,
            "good"
        );

    }


    let itemName = null;

    if (event.item) {

        player.inventory[event.item] =
            (player.inventory[event.item] || 0) + 1;

        if (ITEMS && ITEMS[event.item]) {

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

    const summaryLines = [event.text, ""];

    if (event.gold > 0) summaryLines.push(`+${event.gold} linh thạch`);
    if (event.gold < 0) summaryLines.push(`-${Math.abs(event.gold)} linh thạch`);
    if (event.cultivation > 0) summaryLines.push(`+${event.cultivation} linh lực`);
    if (itemName) summaryLines.push(`Nhận: ${itemName}`);

    showPopup(
        event.title || "Khám phá",
        summaryLines.join("\n")
    );


    updateQuest("explore");

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

            const button =
                document.createElement("button");

            button.textContent =
                "Đi tới " +
                WORLD.locations[destination].name;

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

    player.location = destination;

    log(
        `Ngươi đi tới ${WORLD.locations[destination].name}.`
    );

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

        if (
            player.location ===
            "thanh_van_rung"
        ) {

            container.innerHTML =
                `<div class="small">
                    Trong rừng có dấu vết của yêu thú.
                </div>`;

            const button =
                document.createElement("button");

            button.textContent =
                "Tiến vào khu vực nguy hiểm";

            button.onclick =
                () =>
                    startCombat(
                        Math.random() < 0.6
                            ? "son_tho"
                            : "lang_xam"
                    );

            container.appendChild(button);

        } else {

            container.innerHTML =
                `<div class="small">
                    Hiện tại không có đối thủ.
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
    attack.onclick = playerAttack;

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


function enemyAttack() {

    if (!player.combat) return;

    const damage =
        Math.max(
            1,
            Math.floor(Math.random() * 6)
            + player.combat.enemyAttack
            - 5
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

    const enemy =
        ENEMIES[player.combat.enemyId];

    player.gold += enemy.reward;
    player.cultivation += enemy.cultivation;
    player.combat = null;


    showPopup(
        "Chiến thắng",
        `Đánh bại ${enemy.name}. Nhận ${enemy.reward} linh thạch và ${enemy.cultivation} linh lực.`
    );


    log(
        `Đánh bại ${enemy.name}.`,
        "good"
    );

    log(
        `Nhận ${enemy.reward} linh thạch và ${enemy.cultivation} linh lực.`,
        "good"
    );


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

    const container =
        document.getElementById("questArea");

    if (!container) return;

    container.innerHTML = "";

    const quest =
        player.quest.first_step;


    if (!quest.accepted) {

        container.innerHTML = `
            <div class="card">

                <div class="card-name">
                    ${QUESTS.first_step.name}
                </div>

                <div class="card-desc">
                    ${QUESTS.first_step.description}
                </div>

                <button
                    onclick="acceptFirstQuest()">
                    Nhận nhiệm vụ
                </button>

            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="card">

            <div class="card-name">
                ${QUESTS.first_step.name}
            </div>

            <div class="card-desc">
                ${QUESTS.first_step.description}
            </div>

            <div class="card-desc">
                Tiến độ:
                ${
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
                "Cửu Giới",
                "Hệ thống tu hành đã được khởi tạo. Một con đường vô tận đang chờ đợi ngươi."
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


bootGame();