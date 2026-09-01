/* =====================================================
   CULTIVATION DOMAIN MODULE
   Cửu Giới — Core v0.4.5
===================================================== */

function cultivate() {
    if (player.combat) {
        toast("Không thể tu luyện khi đang chiến đấu.");
        return;
    }

    const cultivateButton = document.getElementById("cultivateButton");

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
