/* =====================================================
   FATE / THIÊN CƠ MODULE
===================================================== */

const FATE_MESSAGES = [
    "Thiên cơ khẽ động. Một cơ duyên đang đến gần.",
    "Ngươi cảm nhận được linh khí trong thiên địa dao động.",
    "Con đường phía trước vẫn còn rất dài.",
    "Một ý niệm thoáng qua, nhưng ngươi không thể nắm bắt.",
    "Hôm nay chưa phải ngày để cưỡng cầu cơ duyên."
];

function consultFate() {
    const message =
        FATE_MESSAGES[
            Math.floor(Math.random() * FATE_MESSAGES.length)
        ];

    showPopup("Thiên Cơ", message);

    log("Ngươi quan sát thiên cơ.");
}