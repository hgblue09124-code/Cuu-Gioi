/* =====================================================
   CORE ENGINE & GAME LIFECYCLE
   Cửu Giới — Core v0.4.5
===================================================== */

async function saveGame() {
    try {
        await saveToDatabase();
        log("Đã lưu thế giới.", "good");
        toast("Đã lưu game.");
    } catch (error) {
        console.error(error);
        toast("Lưu game thất bại.");
    }
}

async function loadGame() {
    try {
        const saved = await loadFromDatabase();
        if (!saved) {
            toast("Chưa có dữ liệu lưu.");
            return;
        }

        player = normalizePlayer(saved);
        applyRuntimePatches();
        render();
        log("Đã khôi phục dữ liệu hành trình.", "good");
        updateSaveStatus("Đã tải dữ liệu lưu");
    } catch (error) {
        console.error(error);
        toast("Không thể tải dữ liệu.");
    }
}

function exportSave() {
    const data = {
        game: GAME.name,
        version: GAME.version,
        exportedAt: new Date().toISOString(),
        player: player
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cuu-gioi-save.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast("Đã xuất save.");
}

function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const data = JSON.parse(reader.result);
            if (!data.player) {
                throw new Error("Save không hợp lệ.");
            }

            player = normalizePlayer(data.player);
            applyRuntimePatches();
            await saveToDatabase();
            render();

            showPopup(
                "Khôi phục thành công",
                "Dữ liệu nhân vật đã được nhập vào hệ thống."
            );
            log("Đã nhập dữ liệu lưu.", "good");
        } catch (error) {
            console.error(error);
            toast("Save không hợp lệ.");
        }
    };

    reader.readAsText(file);
    event.target.value = "";
}

async function deleteSave() {
    if (!confirm("Xóa toàn bộ dữ liệu lưu?")) {
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            const transaction = db.transaction(
                GAME.store,
                "readwrite"
            );
            const request = transaction
                .objectStore(GAME.store)
                .delete(GAME.saveKey);

            request.onsuccess = resolve;
            request.onerror = () => reject(request.error);
        });

        player = createNewPlayer();
        applyRuntimePatches();
        render();
        log("Đã xóa dữ liệu lưu.", "good");
        showPopup(
            "Hệ thống tái lập",
            "Dữ liệu nhân vật đã được xóa."
        );
        updateSaveStatus("Chưa có dữ liệu lưu");
    } catch (error) {
        console.error(error);
        toast("Không thể xóa save.");
    }
}

function bindGameActionButtons() {
    const exploreButton = document.getElementById("exploreButton");
    if (!exploreButton || exploreButton.dataset.bound === "true") {
        return;
    }
    exploreButton.addEventListener("click", explore);
    exploreButton.dataset.bound = "true";
}

async function bootGame() {
    try {
        await openDatabase();
        const saved = await loadFromDatabase();

        if (saved) {
            player = normalizePlayer(saved);
            applyRuntimePatches();
            render();
            log("Đã khôi phục dữ liệu hành trình.", "good");
            updateSaveStatus("Đã khôi phục dữ liệu");
            showPopup(
                "Hệ thống đã kết nối",
                `Chào mừng trở lại, ${player.name}. Hành trình được khôi phục.`
            );
        } else {
            player = createNewPlayer();
            applyRuntimePatches();
            render();
            log("Hệ thống đã khởi tạo.", "good");
            log("Ngươi tỉnh lại tại Thanh Vân Trấn.");
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
