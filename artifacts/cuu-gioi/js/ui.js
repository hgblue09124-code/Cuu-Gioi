/* =====================================================
   UI SYSTEM & RENDER LOGIC
   Cửu Giới — Core v0.4.3
===================================================== */

let toastTimer = null;


/* =====================================================
   LOG SYSTEM
===================================================== */

function log(message, type = "") {
    const line = document.createElement("div");

    line.className = "log-line " + type;
    line.textContent = message;

    const logElement = document.getElementById("log");

    if (logElement) {
        logElement.prepend(line);
    }
}


/* =====================================================
   TOAST
===================================================== */

function toast(message) {
    const element = document.getElementById("toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        element.classList.remove("show");
    }, 1800);
}


/* =====================================================
   SYSTEM POPUP
===================================================== */

function showPopup(title, message, options = {}) {

    const overlay = document.getElementById("systemOverlay");

    if (!overlay) return;

    const popupLabel = overlay.querySelector(".popup-label");
    if (popupLabel) {
        popupLabel.textContent = options.label || "Hệ thống";
    }

    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMessage").textContent = message;

    const inputArea =
        document.getElementById("popupInputArea");

    if (inputArea) {
        inputArea.innerHTML = "";

        if (options.input) {
            inputArea.appendChild(options.input);
        }
    }

    const confirmBtn =
        document.getElementById("popupConfirm");

    if (confirmBtn) {
        confirmBtn.style.display = "";

        confirmBtn.textContent =
            options.confirmText || "Xác nhận";

        confirmBtn.onclick =
            options.onConfirm || closePopup;
    }

    overlay.classList.add("show");
}


function closePopup() {

    const overlay =
        document.getElementById("systemOverlay");

    if (!overlay) return;

    overlay.classList.remove("show");

    const confirmBtn =
        document.getElementById("popupConfirm");
    if (confirmBtn) {
        confirmBtn.style.display = "";
    }

    const inputArea =
        document.getElementById("popupInputArea");
    if (inputArea) {
        inputArea.innerHTML = "";
    }

    const popupLabel = overlay.querySelector(".popup-label");
    if (popupLabel) {
        popupLabel.textContent = "Hệ thống";
    }
}


/* =====================================================
   PATCH NOTES
===================================================== */

const PATCH_METADATA = {
    version: "Core v0.4.5",
    updatedAt: "2025-05-15 10:00",
    changes: [
        "Sửa lỗi hiển thị UI sự kiện đặc biệt / cốt truyện trên thiết bị di động.",
        "Tối ưu giao diện popup hệ thống đồng nhất.",
        "Bổ sung nhật ký cập nhật (Patch Notes).",
        "Thêm mục Thông tin phiên bản trong Bộ nhớ hệ thống."
    ]
};


function showVersionInfo() {
    const content = document.createElement("div");
    content.className = "version-info-content";
    content.style.textAlign = "left";
    content.style.fontSize = "13px";
    content.style.lineHeight = "1.6";
    content.style.padding = "5px 0";

    content.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>Phiên bản hiện tại:</strong> ${PATCH_METADATA.version}</div>
        <div style="margin-bottom: 8px; color: var(--muted, #888);"><strong>Thời gian cập nhật:</strong> ${PATCH_METADATA.updatedAt}</div>
        <div style="margin-bottom: 8px;"><strong>Số bản ghi nhật ký:</strong> ${PATCH_METADATA.changes.length} nhật ký</div>
    `;

    showPopup(
        "Thông tin phiên bản",
        "",
        {
            label: "HỆ THỐNG",
            input: content,
            confirmText: "Đóng"
        }
    );
}


function showPatchNotes() {
    const patchContent = document.createElement("div");
    patchContent.className = "patch-notes-content";
    patchContent.style.textAlign = "left";
    patchContent.style.fontSize = "13px";
    patchContent.style.lineHeight = "1.5";

    const dateInfo = document.createElement("div");
    dateInfo.style.marginBottom = "10px";
    dateInfo.style.color = "var(--muted)";
    dateInfo.style.fontSize = "12px";
    dateInfo.textContent = `Cập nhật lần cuối: ${PATCH_METADATA.updatedAt}`;
    patchContent.appendChild(dateInfo);

    const list = document.createElement("ul");
    list.style.paddingLeft = "18px";
    list.style.margin = "0";

    PATCH_METADATA.changes.forEach(change => {
        const item = document.createElement("li");
        item.style.marginBottom = "6px";
        item.textContent = change;
        list.appendChild(item);
    });

    patchContent.appendChild(list);

    showPopup(
        `Nhật ký cập nhật · ${PATCH_METADATA.version}`,
        "",
        {
            label: "CẬP NHẬT HỆ THỐNG",
            input: patchContent,
            confirmText: "Đóng"
        }
    );
}


/* =====================================================
   SAVE STATUS
===================================================== */

function updateSaveStatus(text) {

    const element =
        document.getElementById("saveStatus");

    if (!element) return;

    element.textContent = text;
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   STORY MODAL
===================================================== */

/*
 * Hiển thị một node câu chuyện.
 *
 * storyNode dự kiến:
 *
 * {
 *     id: "bell_at_night",
 *     title: "Tiếng chuông sau núi",
 *     text: "Chiều xuống...",
 *     choices: [
 *         {
 *             text: "Quay lại tìm hiểu"
 *         },
 *         {
 *             text: "Tiếp tục lên đường"
 *         }
 *     ]
 * }
 */

function renderStoryModal(storyNode) {

    if (!storyNode) {
        console.warn(
            "renderStoryModal: storyNode không tồn tại."
        );
        return;
    }

    const overlay = document.getElementById("systemOverlay");

    if (!overlay) return;

    const popupLabel = overlay.querySelector(".popup-label");
    if (popupLabel) {
        popupLabel.textContent = "CỬU GIỚI · SỰ KIỆN";
    }

    document.getElementById("popupTitle").textContent =
        storyNode.title || "Sự kiện";

    document.getElementById("popupMessage").textContent =
        storyNode.text || "";

    const confirmBtn =
        document.getElementById("popupConfirm");

    if (confirmBtn) {
        confirmBtn.style.display = "none";
    }

    const inputArea =
        document.getElementById("popupInputArea");

    if (inputArea) {
        inputArea.innerHTML = "";

        const choices =
            Array.isArray(storyNode.choices)
                ? storyNode.choices
                : [];

        if (choices.length > 0) {
            const choicesContainer =
                document.createElement("div");

            choicesContainer.className = "story-choices";

            choices.forEach((choice, index) => {
                const button =
                    document.createElement("button");

                button.className = "btn-story-choice";
                button.textContent =
                    choice?.text || `Lựa chọn ${index + 1}`;

                button.dataset.choiceIndex = String(index);

                button.addEventListener(
                    "click",
                    () => {
                        if (
                            typeof StoryEngine !== "undefined" &&
                            typeof StoryEngine.selectChoice === "function"
                        ) {
                            StoryEngine.selectChoice(
                                storyNode.id,
                                index
                            );
                        } else {
                            console.warn(
                                "StoryEngine.selectChoice chưa sẵn sàng."
                            );
                        }
                    }
                );

                choicesContainer.appendChild(button);
            });

            inputArea.appendChild(choicesContainer);
        }
    }

    overlay.classList.add("show");
}


/* =====================================================
   CLOSE STORY MODAL
===================================================== */

function closeStoryModal() {
    closePopup();
}


/* =====================================================
   RENAME
===================================================== */

function openRenamePopup() {

    const input =
        document.createElement("input");

    input.id = "renameInput";
    input.className = "rename-input";

    input.type = "text";
    input.maxLength = 20;

    input.autocomplete = "off";
    input.autocapitalize = "words";
    input.spellcheck = false;

    input.value = player.name;
    input.placeholder = "Tên nhân vật";


    showPopup(
        "Đổi tên nhân vật",
        "Nhập tên mới cho nhân vật của ngươi.",
        {
            input: input,
            onConfirm: confirmRename
        }
    );


    setTimeout(() => {

        input.focus();
        input.select();

    }, 100);
}


function confirmRename() {

    const input =
        document.getElementById("renameInput");

    if (!input) return;


    const newName =
        input.value
            .trim()
            .replace(/\s+/g, " ");


    if (!newName) {

        toast(
            "Tên không được để trống."
        );

        return;
    }


    if (newName.length > 20) {

        toast(
            "Tên tối đa 20 ký tự."
        );

        return;
    }


    player.name = newName;

    closePopup();

    render();

    log(
        `Ngươi đã đổi tên thành ${newName}.`,
        "good"
    );

    autoSave();

    toast(
        `Tên mới: ${newName}`
    );
}


/* =====================================================
   MAIN RENDER
===================================================== */

function render() {

    const location =
        WORLD.locations[player.location];


    if (!location) {

        console.warn(
            "Không tìm thấy địa điểm:",
            player.location
        );

        return;
    }


    document.getElementById(
        "location"
    ).textContent =
        location.name;


    document.getElementById(
        "description"
    ).textContent =
        location.description;


    document.getElementById(
        "playerName"
    ).textContent =
        player.name;


    document.getElementById(
        "realm"
    ).textContent =
        currentRealm().name;


    document.getElementById(
        "hp"
    ).textContent =
        `${player.hp} / ${player.maxHp}`;


    document.getElementById(
        "mp"
    ).textContent =
        `${player.mp} / ${player.maxMp}`;


    document.getElementById(
        "cultivation"
    ).textContent =
        player.cultivation;

    renderCultivationProgress();


    document.getElementById(
        "gold"
    ).textContent =
        player.gold;


    /* ---------------------------------------------
       Các module UI hiện tại
    --------------------------------------------- */

    if (
        typeof renderTravel === "function"
    ) {
        renderTravel();
    }


    if (
        typeof renderCombat === "function"
    ) {
        renderCombat();
    }


    if (
        typeof renderQuest === "function"
    ) {
        renderQuest();
    }


    if (
        typeof renderInventory === "function"
    ) {
        renderInventory();
    }


    if (
        typeof renderAdmin === "function"
    ) {
        renderAdmin();
    }
}


function renderCultivationProgress() {

    const progressBar =
        document.getElementById("cultivationProgressBar");

    const progressLabel =
        document.getElementById("cultivationProgressLabel");

    const progressPercent =
        document.getElementById("cultivationProgressPercent");

    const progressHint =
        document.getElementById("cultivationProgressHint");

    const progressTrack =
        progressBar?.parentElement;

    if (
        !progressBar ||
        !progressLabel ||
        !progressPercent ||
        !progressHint ||
        !progressTrack
    ) {
        return;
    }

    const realmIndex =
        REALMS.findIndex(
            realm => realm.name === currentRealm().name
        );

    const nextRealm =
        REALMS[realmIndex + 1];

    if (!nextRealm) {
        progressLabel.textContent =
            "Tiến độ tu vi";
        progressPercent.textContent =
            "Tối đa";
        progressHint.textContent =
            "Đã đạt cảnh giới cao nhất.";
        progressBar.style.width = "100%";
        progressTrack.setAttribute("aria-valuenow", "100");
        return;
    }

    const currentRealmData =
        REALMS[realmIndex];

    const range =
        nextRealm.required - currentRealmData.required;

    const gainedInRealm =
        Math.max(
            0,
            player.cultivation - currentRealmData.required
        );

    const percent =
        Math.min(
            100,
            Math.max(
                0,
                Math.round(gainedInRealm / range * 100)
            )
        );

    progressLabel.textContent =
        `${currentRealmData.name} → ${nextRealm.name}`;
    progressPercent.textContent =
        `${percent}%`;
    progressHint.textContent =
        `${player.cultivation} / ${nextRealm.required} linh lực`;
    progressBar.style.width =
        `${percent}%`;
    progressTrack.setAttribute(
        "aria-valuenow",
        String(percent)
    );
}
