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

    let modalEl =
        document.getElementById("story-modal");


    /* ---------------------------------------------
       Tự tạo modal nếu HTML chưa có
    --------------------------------------------- */

    if (!modalEl) {

        modalEl =
            document.createElement("div");

        modalEl.id = "story-modal";
        modalEl.className = "modal-overlay";

        document.body.appendChild(modalEl);
    }


    /* ---------------------------------------------
       Chuẩn hóa dữ liệu
    --------------------------------------------- */

    const title =
        escapeHTML(
            storyNode.title || "Sự kiện"
        );

    const text =
        escapeHTML(
            storyNode.text || ""
        ).replace(/\n/g, "<br>");

    const choices =
        Array.isArray(storyNode.choices)
            ? storyNode.choices
            : [];


    /* ---------------------------------------------
       Tạo lựa chọn
    --------------------------------------------- */

    const choicesHtml =
        choices.map((choice, index) => {

            const choiceText =
                escapeHTML(
                    choice?.text || `Lựa chọn ${index + 1}`
                );

            return `
                <button
                    class="btn btn-story-choice"
                    data-choice-index="${index}">
                    ${choiceText}
                </button>
            `;

        }).join("");


    /* ---------------------------------------------
       Render modal
    --------------------------------------------- */

    modalEl.innerHTML = `
        <div class="modal-content story-card">

            <div class="story-header">

                <span class="story-tag">
                    【 CỬU GIỚI · SỰ KIỆN 】
                </span>

                <h3 class="story-title">
                    ${title}
                </h3>

            </div>

            <div class="story-body">

                <p>
                    ${text}
                </p>

            </div>

            <div class="story-choices">
                ${choicesHtml}
            </div>

        </div>
    `;


    /* ---------------------------------------------
       Gắn sự kiện cho lựa chọn
       
       Không dùng onclick inline.
       Tránh phụ thuộc StoryEngine là global
       trong lúc HTML được parse.
    --------------------------------------------- */

    const choiceButtons =
        modalEl.querySelectorAll(
            ".btn-story-choice"
        );

    choiceButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.choiceIndex
                    );

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

    });


    /* ---------------------------------------------
       Hiển thị
    --------------------------------------------- */

    modalEl.style.display = "flex";

    requestAnimationFrame(() => {

        modalEl.classList.add("show");

    });
}


/* =====================================================
   CLOSE STORY MODAL
===================================================== */

function closeStoryModal() {

    const modalEl =
        document.getElementById("story-modal");

    if (!modalEl) return;

    modalEl.classList.remove("show");

    /*
     * Cho animation kết thúc trước khi xóa nội dung.
     */
    setTimeout(() => {

        modalEl.style.display = "none";
        modalEl.innerHTML = "";

    }, 180);
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