/* =====================================================
   GAME CONFIGURATION & INITIAL STATE DEFINITIONS
   Cửu Giới — Core v0.4.5
===================================================== */

const GAME = {
    name: "Cửu Giới",
    version: "0.4.5",
    database: "CuuGioiDatabase",
    store: "gameState",
    saveKey: "player"
};

const WORLD = {
    locations: {
        thanh_van_tran: {
            name: "Thanh Vân Trấn",
            description:
                "Một tiểu trấn nằm dưới chân Thanh Vân Sơn. Linh khí nơi đây mỏng manh, nhưng thường có tu sĩ vãng lai."
        },

        thanh_van_son: {
            name: "Thanh Vân Sơn",
            description:
                "Núi cao mây phủ. Linh khí dồi dào hơn dưới trấn, nhưng trong rừng sâu cũng ẩn chứa những thứ không nên chạm tới."
        },

        thanh_van_rung: {
            name: "Thanh Vân Sơn — Ngoại vi",
            description:
                "Khu rừng nằm ở phía ngoài Thanh Vân Sơn. Tiếng thú rừng thỉnh thoảng vang lên giữa những thân cây."
        }
    }
};

const REALMS = [
    { name: "Phàm Nhân", required: 0 },
    { name: "Luyện Khí", required: 100 },
    { name: "Trúc Cơ", required: 1000 },
    { name: "Kim Đan", required: 5000 },
    { name: "Nguyên Anh", required: 20000 }
];

const ENEMIES = {
    son_tho: {
        name: "Sơn Thố",
        maxHp: 60,
        attack: 10,
        reward: 25,
        cultivation: 15
    },

    lang_xam: {
        name: "Lang Xám",
        maxHp: 90,
        attack: 15,
        reward: 40,
        cultivation: 25
    }
};

const QUESTS = {
    first_step: {
        name: "Bước đầu tu hành",
        description: "Khám phá thế giới và tích lũy kinh nghiệm.",
        goal: 3,
        rewardGold: 100,
        rewardCultivation: 50
    }
};

const EXPLORE_EVENTS = [
    {
        title: "Hành trình bình yên",
        text: "Ngươi đi dọc con đường đá. Không có gì đặc biệt xảy ra.",
        gold: 0,
        cultivation: 5
    },
    {
        title: "Phát hiện Linh Thạch",
        text: "Ngươi phát hiện một viên linh thạch bên vệ đường.",
        gold: 20,
        cultivation: 0
    },
    {
        title: "Linh khí bất thường",
        text: "Một luồng linh khí bất thường xuất hiện trong rừng.",
        gold: 0,
        cultivation: 25
    },
    {
        title: "Thương nhân lang thang",
        text: "Ngươi gặp một thương nhân lang thang.",
        gold: -10,
        cultivation: 10
    },
    {
        title: "Linh quả trong bụi cỏ",
        text: "Trong bụi cỏ có một quả linh quả.",
        gold: 0,
        cultivation: 5,
        item: "linh_qua"
    }
];

function createNewPlayer() {
    return {
        name: "Vô Danh",
        location: "thanh_van_tran",
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        cultivation: 0,
        gold: 100,
        inventory: {
            dan_hieu_luc: 2,
            linh_qua: 0,
            spirit_pill: 0
        },
        relationship: {
            anh_tuyet: 0
        },
        quest: {
            first_step: {
                accepted: false,
                progress: 0,
                completed: false
            }
        },
        combat: null,
        storyState: {
            flags: {},
            completed: [],
            active: null
        }
    };
}

let player = createNewPlayer();
