/* =====================================================
   UI MODALS, NOTIFICATIONS & POPUPS
   Cửu Giới — Core v0.4.5
===================================================== */

let toastTimer = null;

function log(message, type = "") {
    const line = document.createElement("div");
    line.className = "log-line " + type;
    line.textContent = message;

    const logElement = document.getElementById("log");
    if (logElement) {
        logElement.prepend(line);
    }
}

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

function showPopup(title, message, options = {}) {
    const overlay = document.getElementById("systemOverlay");
    if (!overlay) return;

    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMessage").textContent = message;

    const inputArea = document.getElementById("popupInputArea");
    if (inputArea) {
        inputArea.innerHTML = "";
        if (options.input) {
            inputArea.appendChild(options.input);
        }
    }

    const confirmBtn = document.getElementById("popupConfirm");
    if (confirmBtn) {
        confirmBtn.style.display = "";
        confirmBtn.textContent = options.confirmText || "Xác nhận";
        confirmBtn.onclick = options.onConfirm || closePopup;
    }

    overlay.classList.add("show");
}

function closePopup() {
    const overlay = document.getElementById("systemOverlay");
    if (!overlay) return;

    overlay.classList.remove("show");

    const confirmBtn = document.getElementById("popupConfirm");
    if (confirmBtn) {
        confirmBtn.style.display = "";
    }

    const inputArea = document.getElementById("popupInputArea");
    if (inputArea) {
        inputArea.innerHTML = "";
    }

    const popupLabel = overlay.querySelector(".popup-label");
    if (popupLabel) {
        popupLabel.textContent = "Hệ thống";
    }
}

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

function renderStoryModal(storyNode) {
    if (!storyNode) {
        console.warn("renderStoryModal: storyNode không tồn tại.");
        return;
    }

    const overlay = document.getElementById("systemOverlay");
    if (!overlay) return;

    const popupLabel = overlay.querySelector(".popup-label");
    if (popupLabel) {
        popupLabel.textContent = "CỬU GIỚI · SỰ KIỆN";
    }

    document.getElementById("popupTitle").textContent = storyNode.title || "Sự kiện";
    document.getElementById("popupMessage").textContent = storyNode.text || "";

    const confirmBtn = document.getElementById("popupConfirm");
    if (confirmBtn) {
        confirmBtn.style.display = "none";
    }

    const inputArea = document.getElementById("popupInputArea");
    if (inputArea) {
        inputArea.innerHTML = "";

        const choices = Array.isArray(storyNode.choices) ? storyNode.choices : [];
        if (choices.length > 0) {
            const choicesContainer = document.createElement("div");
            choicesContainer.className = "story-choices";

            choices.forEach((choice, index) => {
                const button = document.createElement("button");
                button.className = "btn-story-choice";
                button.textContent = choice?.text || `Lựa chọn ${index + 1}`;
                button.dataset.choiceIndex = String(index);

                button.addEventListener("click", () => {
                    if (
                        typeof StoryEngine !== "undefined" &&
                        typeof StoryEngine.selectChoice === "function"
                    ) {
                        StoryEngine.selectChoice(storyNode.id, index);
                    } else {
                        console.warn("StoryEngine.selectChoice chưa sẵn sàng.");
                    }
                });

                choicesContainer.appendChild(button);
            });

            inputArea.appendChild(choicesContainer);
        }
    }

    overlay.classList.add("show");
}

function closeStoryModal() {
    closePopup();
}

function openRenamePopup() {
    const input = document.createElement("input");
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
    const input = document.getElementById("renameInput");
    if (!input) return;

    const newName = input.value.trim().replace(/\s+/g, " ");

    if (!newName) {
        toast("Tên không được để trống.");
        return;
    }

    if (newName.length > 20) {
        toast("Tên tối đa 20 ký tự.");
        return;
    }

    player.name = newName;
    closePopup();
    render();
    log(`Ngươi đã đổi tên thành ${newName}.`, "good");
    autoSave();
    toast(`Tên mới: ${newName}`);
}
