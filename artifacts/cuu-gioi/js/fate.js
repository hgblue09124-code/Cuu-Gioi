/* =====================================================
   FATE / THIÊN CƠ MODULE v1.0 — Big Update
   ===================================================== */

const FATE_MESSAGES = [
    "Thiên cơ khẽ động. Một cơ duyên đang đến gần.",
    "Ngươi cảm nhận được linh khí trong thiên địa dao động.",
    "Con đường phía trước vốn dĩ không bằng phẳng.",
    "Một ý niệm thoáng qua, nhưng ngươi không thể nắm bắt.",
    "Hôm nay chưa phải ngày để cưỡng cầu cơ duyên.",
    "Trời đất nói với ngươi qua tiếng gió.",
    "Mây đen tụ lại phía tây — có điềm báo.",
    "Ngươi nhìn lên bầu trời. Sao băng lướt qua.",
    "Linh khí nơi đây đặc biệt trong lành.",
    "Một tiếng chuông vọng từ xa. Ngươi không biết nó từ đâu.",
    "Ngọn núi phía đông có ánh sáng kỳ lạ.",
    "Sương mù bao phủ. Thiên cơ khó đoán.",
    "Ngươi cảm thấy mình đang ở đúng nơi, đúng lúc.",
    "Một con đường nhỏ hiện ra trong sương.",
    "Tiếng suối chảy mang theo lời nhắn của trời.",
    "Cánh đồng hoang trải dài. Có điều gì đó đang chờ.",
    "Ngươi nghe thấy tiếng gọi từ phương bắc.",
    "Sóng biển vỗ vào bờ. Biển có linh hồn riêng.",
    "Lửa trại bập bùng trong đêm. Một khuôn mặt thoáng qua.",
    "Ngươi đứng trước ngã tư. Mỗi hướng đi đều có duyên.",
    "Mây mưa chuyển động. Trời đất đang thì thầm."
];

function consultFate() {
    const message =
        FATE_MESSAGES[
            Math.floor(Math.random() * FATE_MESSAGES.length)
        ];

    showPopup("Thiên Cơ", message);

    log("Ngươi quan sát thiên cơ.");

    /* Track fate reads */
    player.fateReadCount = (player.fateReadCount || 0) + 1;

    /* Check for secret discovery */
    if (typeof checkSecrets === "function") {
        const found = checkSecrets();
        found.forEach(sid => {
            if (typeof showSecretDiscovery === "function") {
                showSecretDiscovery(sid);
            }
        });
    }
}
