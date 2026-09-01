/* =====================================================
   ADMINISTRATOR / DEBUG TOOLS MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

let adminMode = false;

function toggleAdminPanel() {
    adminMode = !adminMode;
    const panel = document.getElementById("adminPanel");
    if (!panel) return;

    panel.style.display = adminMode ? "block" : "none";

    if (adminMode) {
        renderAdmin();
        toast("Đã bật chế độ Administrator");
    } else {
        toast("Đã tắt chế độ Administrator");
    }
}

function renderAdmin() {
    if (!adminMode) return;
    const container = document.getElementById("adminContent");
    if (!container) return;

    container.innerHTML = `
        <div class="admin-grid">
            <button class="admin-btn" onclick="adminFullHeal()">
                Hồi đầy trạng thái
            </button>
            <button class="admin-btn" onclick="adminAddItems('dan_hieu_luc', 5)">
                +5 Hồi Nguyên Đan
            </button>
            <button class="admin-btn" onclick="adminAddItems('linh_qua', 5)">
                +5 Linh quả
            </button>
            <button class="admin-btn" onclick="adminTriggerStoryTest()">
                ⚡ Kích hoạt Story Test
            </button>
            <button class="admin-btn" onclick="adminAddSampleExploreEvent()">
                ➕ Thêm sự kiện khám phá
            </button>
            <button class="admin-btn" onclick="Runtime.openConsole()">
                🔧 Runtime Console
            </button>
            <button class="admin-btn danger" onclick="toggleAdminPanel()">
                Tắt Administrator
            </button>
        </div>

        <div class="small" style="margin-top: 10px;">
            ${
                (typeof Runtime !== "undefined" && Runtime.preruntime && Runtime.persistent)
                    ? `Pre-Runtime patches: ${Runtime.preruntime.list().length} · Runtime patches: ${Runtime.persistent.list().length}`
                    : "Runtime chưa sẵn sàng."
            }
        </div>

        <div style="margin-top: 10px;">
            <div class="small">Chỉnh sửa thông số trực tiếp:</div>
            <div class="admin-input-group">
                <input id="adminGold" type="number" placeholder="Linh thạch (${player.gold})">
                <button onclick="adminSetStat('gold', 'adminGold')">Lưu Thạch</button>
            </div>
            <div class="admin-input-group">
                <input id="adminCultivation" type="number" placeholder="Linh lực (${player.cultivation})">
                <button onclick="adminSetStat('cultivation', 'adminCultivation')">Lưu Linh lực</button>
            </div>
            <div class="admin-input-group">
                <input id="adminHp" type="number" placeholder="Sinh lực (${player.hp}/${player.maxHp})">
                <button onclick="adminSetStat('hp', 'adminHp')">Lưu HP</button>
            </div>
            <div class="admin-input-group">
                <input id="adminMp" type="number" placeholder="Năng lượng (${player.mp}/${player.maxMp})">
                <button onclick="adminSetStat('mp', 'adminMp')">Lưu MP</button>
            </div>
        </div>
    `;
}

function adminAddSampleExploreEvent() {
    const nameInput = document.createElement("input");
    nameInput.className = "rename-input";
    nameInput.type = "text";
    nameInput.autocomplete = "off";
    nameInput.placeholder = "Tiêu đề sự kiện";

    showPopup(
        "Thêm sự kiện khám phá",
        "Nhập tiêu đề cho sự kiện khám phá mới. Sự kiện sẽ được thêm ngay và lưu thành Pre-Runtime patch (xem trong Runtime Console).",
        {
            input: nameInput,
            confirmText: "Thêm",
            onConfirm: () => {
                const title = nameInput.value.trim() || "Cơ Duyên Bí Ẩn";
                const newEvent = {
                    title: title,
                    text: `Ngươi gặp một cơ duyên bất ngờ: "${title}".`,
                    gold: 30,
                    cultivation: 20
                };

                EXPLORE_EVENTS.push(newEvent);

                if (typeof Runtime !== "undefined" && Runtime.preruntime) {
                    Runtime.preruntime.add(
                        "explore_event_" + Date.now(),
                        `EXPLORE_EVENTS.push(${JSON.stringify(newEvent)});`
                    );
                }

                closePopup();
                toast(`Đã thêm sự kiện "${title}" (đã lưu Pre-Runtime patch).`);
                renderAdmin();
            }
        }
    );

    setTimeout(() => { nameInput.focus(); }, 100);
}

function adminTriggerStoryTest() {
    if (typeof StoryEngine === "undefined" || typeof StoryEngine.trigger !== "function") {
        toast("StoryEngine chưa được tải.");
        console.warn("Administrator: StoryEngine chưa sẵn sàng.");
        return;
    }

    if (!player.storyState) {
        player.storyState = { flags: {}, completed: [], active: null };
    }

    StoryEngine.trigger("bell_at_night");
    toast("Administrator: Đã kích hoạt Story Test.");
}

function adminFullHeal() {
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    toast("Admin: Đã hồi đầy sinh lực và năng lượng.");
    autoSave();
    render();
}

function adminAddItems(id, amount) {
    player.inventory[id] = (player.inventory[id] || 0) + amount;
    toast(`Admin: Thêm ${amount} ${ITEMS[id] ? ITEMS[id].name : id}`);
    autoSave();
    render();
}

function adminSetStat(statKey, inputId) {
    const input = document.getElementById(inputId);
    if (!input || input.value === "") return;

    const val = parseInt(input.value, 10);
    if (isNaN(val)) return;

    player[statKey] = val;
    toast(`Admin: Đã chỉnh ${statKey} = ${val}`);
    autoSave();
    render();
}
