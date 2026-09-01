/* =====================================================
   INVENTORY DOMAIN MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

const ITEMS = {
    dan_hieu_luc: {
        id: "dan_hieu_luc",
        name: "Hồi Nguyên Đan",
        description: "Khôi phục 25 điểm năng lượng.",
        usable: true,
        effect: (player) => {
            if (player.mp >= player.maxMp) {
                toast("Năng lượng đã đầy, không cần sử dụng.");
                return false;
            }
            const restore = 25;
            player.mp = Math.min(player.maxMp, player.mp + restore);
            log(`Sử dụng Hồi Nguyên Đan. Năng lượng +${restore}.`, "good");
            showPopup("Hệ thống", `Đã sử dụng Hồi Nguyên Đan\nNăng lượng +${restore}`);
            return true;
        }
    },
    linh_qua: {
        id: "linh_qua",
        name: "Linh quả",
        description: "Một loại quả chứa linh khí, giúp tăng 20 điểm linh lực.",
        usable: true,
        effect: (player) => {
            const gain = 20;
            player.cultivation += gain;
            log(`Sử dụng Linh quả. Linh lực +${gain}.`, "good");
            showPopup("Hệ thống", `Đã sử dụng Linh quả\nLinh lực +${gain}`);
            return true;
        }
    },
    spirit_pill: {
        id: "spirit_pill",
        name: "Linh Dược",
        description: "Một viên linh dược quý hiếm, khôi phục toàn bộ sinh lực. Phần thưởng từ Story Event.",
        usable: true,
        effect: (player) => {
            if (player.hp >= player.maxHp) {
                toast("Sinh lực đã đầy, không cần sử dụng.");
                return false;
            }
            player.hp = player.maxHp;
            log("Sử dụng Linh Dược. Sinh lực đã hồi phục hoàn toàn.", "good");
            showPopup("Hệ thống", "Đã sử dụng Linh Dược\nSinh lực đã hồi phục hoàn toàn");
            return true;
        }
    }
};

function useItem(id) {
    if (!player.inventory[id] || player.inventory[id] <= 0) {
        toast("Không có vật phẩm.");
        return;
    }

    const itemDef = ITEMS[id];
    if (!itemDef || !itemDef.usable) {
        toast("Vật phẩm không thể sử dụng.");
        return;
    }

    const success = itemDef.effect(player);
    if (success) {
        player.inventory[id]--;
        autoSave();
        render();
    }
}

function renderInventory() {
    const container = document.getElementById("inventory");
    if (!container) return;
    container.innerHTML = "";

    let hasItem = false;

    Object.keys(player.inventory).forEach(id => {
        const amount = player.inventory[id];
        const itemDef = ITEMS[id];

        if (amount <= 0 || !itemDef) return;

        hasItem = true;

        const card = document.createElement("div");
        card.className = "card";

        let buttonHTML = "";
        if (itemDef.usable) {
            buttonHTML = `<button onclick="useItem('${id}')">Sử dụng</button>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="card-name">${itemDef.name}</div>
                <div class="small">Số lượng: ${amount}</div>
            </div>
            <div class="card-desc">${itemDef.description}</div>
            ${buttonHTML}
        `;

        container.appendChild(card);
    });

    if (!hasItem) {
        container.innerHTML = `<div class="small">Túi đồ trống.</div>`;
    }
}
