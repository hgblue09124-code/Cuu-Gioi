/* =====================================================
   STATE MANAGEMENT & DATABASE
   Cửu Giới — Core v0.4.5
===================================================== */

const GAME = {
    name: "Cửu Giới",
    version: "1.0.0",
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
        },
        co_tu: {
            name: "Cổ Tự Hoang Phế",
            description:
                "Ngôi chùa cổ thượng cổ, bị phong ấn bởi trận pháp cổ xưa. Bên trong có chứa cơ duyên."
        },
        huyet_son: {
            name: "Huyết Sơn Lĩnh",
            description:
                "Dãy núi đỏ như máu, sản sinh vô số yêu thú huyết mạch. Là nơi luyện tâm rất tốt."
        },
        van_ly_sa_mac: {
            name: "Vạn Lý Sa Mạc",
            description:
                "Sa mạc mênh mông, cát vàng cuồn cuộn. Truyền thuyết nơi đây có Cửu Chuyển Kim Đan ẩn giấu."
        },
        bac_hai: {
            name: "Bắc Hải Tận Cùng",
            description:
                "Vùng biển phương bắc, sương mù dày đặc quanh năm. Có truyền thuyết về Long Cung dưới đáy biển."
        },
        thuong_gioi: {
            name: "Thượng Giới Thánh Sơn",
            description:
                "Tầng trời thứ chín — nơi tiên nhân tụ hội. Cửu Giới Tông chưởng quản vùng đất này."
        }
    }
};

const REALMS = [
    { name: "Phàm Nhân", required: 0 },
    { name: "Luyện Khí", required: 100 },
    { name: "Trúc Cơ", required: 1000 },
    { name: "Kim Đan", required: 5000 },
    { name: "Nguyên Anh", required: 20000 },
    { name: "Hóa Thần", required: 60000 },
    { name: "Lục Đạo", required: 150000 }
];

const ENEMIES = {
    son_tho: {
        name: "Sơn Thố",
        maxHp: 60,
        attack: 10,
        reward: 25,
        cultivation: 15,
        weakness: "fire",
        loot: { linh_thao: 1 }
    },
    lang_xam: {
        name: "Lang Xám",
        maxHp: 90,
        attack: 15,
        reward: 40,
        cultivation: 25,
        weakness: "fire",
        loot: { yeu_dan: 1 }
    },
    doc_trung: {
        name: "Độc Trùng",
        maxHp: 45,
        attack: 18,
        reward: 35,
        cultivation: 20,
        weakness: "thunder",
        loot: { linh_thao: 2 }
    },
    ac_linh: {
        name: "Ác Linh",
        maxHp: 150,
        attack: 22,
        reward: 80,
        cultivation: 50,
        weakness: "fire",
        loot: { linh_tinh: 1 }
    },
    huyet_lang: {
        name: "Huyết Lang",
        maxHp: 180,
        attack: 30,
        reward: 120,
        cultivation: 80,
        weakness: "thunder",
        loot: { huyet_tinh: 1 }
    },
    huyet_bao: {
        name: "Huyết Báo",
        maxHp: 250,
        attack: 38,
        reward: 180,
        cultivation: 120,
        weakness: "wind",
        loot: { ma_dan: 1 }
    },
    sa_xa: {
        name: "Sa Xà",
        maxHp: 200,
        attack: 28,
        reward: 150,
        cultivation: 90,
        weakness: "thunder",
        loot: { sa_tinh: 1 }
    },
    sa_yeu: {
        name: "Sa Yêu",
        maxHp: 320,
        attack: 40,
        reward: 250,
        cultivation: 150,
        weakness: "fire",
        loot: { hoa_kiem: 1 }
    },
    hai_yeu: {
        name: "Hải Yêu",
        maxHp: 400,
        attack: 50,
        reward: 350,
        cultivation: 200,
        weakness: "thunder",
        loot: { long_hoa: 1 }
    },
    long_chi: {
        name: "Long Chi",
        maxHp: 600,
        attack: 65,
        reward: 600,
        cultivation: 400,
        weakness: "thunder",
        loot: { long_hoa: 2, hac_chan: 1 }
    },
    thien_nhan: {
        name: "Thần Nhãn",
        maxHp: 900,
        attack: 85,
        reward: 1000,
        cultivation: 800,
        weakness: "void",
        loot: { tien_thach: 1, thien_luyen: 1 }
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


/* =====================================================
   EXPLORE EVENTS

   Dữ liệu tĩnh (Pre-Runtime) — có thể mở rộng trực tiếp
   qua Admin Runtime Console, ví dụ:

       EXPLORE_EVENTS.push({
           title: "Tên sự kiện",
           text: "Mô tả...",
           gold: 30,
           cultivation: 10
       });

   ...rồi lưu lại bằng nút "💾 Lưu Pre-Runtime" để patch
   tồn tại sau khi tải lại trang.
===================================================== */

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
    },
    {
        title: "Động phủ cổ xưa",
        text: "Ngươi phát hiện một động phủ cổ bị lãng quên giữa núi non.",
        gold: 50,
        cultivation: 30
    },
    {
        title: "Gặp tu sĩ đồng cốt",
        text: "Một tu sĩ tóc bạc ngồi thiền bên cạnh. Ngươi nhận được lời chỉ dẫn.",
        gold: 0,
        cultivation: 40
    },
    {
        title: "Thiên tài địa bảo",
        text: "Ngươi nhặt được một viên tinh thạch phát sáng.",
        gold: 0,
        cultivation: 15,
        item: "tinh_thach"
    },
    {
        title: "Đêm trăng non",
        text: "Trăng non treo trên đỉnh núi. Linh khí đêm nay đặc biệt dồi dào.",
        gold: 0,
        cultivation: 50
    },
    {
        title: "Yêu thú rừng sâu",
        text: "Ngươi đụng độ một con yêu thú rừng sâu. Phải bỏ chạy.",
        gold: -20,
        cultivation: 0
    },
    {
        title: "Cây linh thảo quý",
        text: "Bên vệ đường có một cây linh thảo quý hiếm.",
        gold: 0,
        cultivation: 20,
        item: "linh_thao"
    },
    {
        title: "Vết chân cổ xưa",
        text: "Ngươi phát hiện những dấu vết của một tu sĩ cổ xưa. Đâu đó có bảo tàng.",
        gold: 80,
        cultivation: 10
    },
    {
        title: "Khe suối linh khí",
        text: "Một dòng suối nhỏ chảy qua đá. Nước có vị ngọt lạ.",
        gold: 0,
        cultivation: 35
    },
    {
        title: "Linh thạch từ trên trời rơi",
        text: "Một viên đá phát sáng rơi xuống trước mặt ngươi. Linh lực bên trong rất mạnh.",
        gold: 0,
        cultivation: 60
    },
    {
        title: "Lạc đường trong sương",
        text: "Ngươi đi lạc trong sương mù. Mất thời gian tìm đường.",
        gold: 0,
        cultivation: 0
    },
    {
        title: "Huyết thảo núi cao",
        text: "Trên vách núi cao có một cây huyết thảo quý.",
        gold: 0,
        cultivation: 45,
        item: "yeu_dan"
    },
    {
        title: "Cổ vật trong đất",
        text: "Ngươi đào được một món cổ vật có linh khí.",
        gold: 100,
        cultivation: 0
    },
    {
        title: "Thiên tai bất ngờ",
        text: "Một trận động đất nhỏ. May mắn không ai bị thương.",
        gold: -30,
        cultivation: 0
    },
    {
        title: "Bí cảnh ẩn giấu",
        text: "Ngươi vô tình tìm thấy một bí cảnh ẩn giấu sau thác nước. Bên trong có linh khí đậm đặc.",
        gold: 0,
        cultivation: 80,
        item: "linh_tinh"
    },
    {
        title: "Đêm sao băng",
        text: "Sao băng lướt qua bầu trời. Ngươi nguyện ước và cảm nhận được linh lực trong thiên địa.",
        gold: 0,
        cultivation: 55
    }
];


/* =====================================================
   PLAYER
===================================================== */

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

        /* Big Update v1.0 — expanded quest system */
        quests: {},

        /* Big Update v1.0 — learned skills */
        learnedSkills: [],

        /* Big Update v1.0 — combat state */
        combat: null,
        weaponBuff: 0,
        weaponBuffTurns: 0,
        nextDamageBonus: 0,
        shieldTurns: 0,

        /* Big Update v1.0 — secret tracking */
        secrets: {},
        exploredAreas: [],
        giftedNPCs: {},
        fateReadCount: 0,
        combatWins: 0,
        exploreBonus: 0,
        npcCooldowns: {},

        /*
         * Story state
         * Được thêm từ v0.4.3.
         *
         * Save cũ của v0.4.2 sẽ được normalizePlayer()
         * tự động bổ sung phần này.
         */
        storyState: {
            flags: {},
            completed: [],
            active: null
        }
    };
}


/* =====================================================
   RUNTIME STATE
===================================================== */

let player = createNewPlayer();
let db = null;
let saveTimer = null;


/* =====================================================
   DATABASE
===================================================== */

function openDatabase() {
    return new Promise((resolve, reject) => {

        if (!window.indexedDB) {
            reject(new Error("IndexedDB không được hỗ trợ."));
            return;
        }

        const request = indexedDB.open(GAME.database, 1);

        request.onupgradeneeded = event => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(GAME.store)) {
                database.createObjectStore(GAME.store);
            }
        };

        request.onsuccess = event => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


/* =====================================================
   SAVE
===================================================== */

function saveToDatabase() {
    return new Promise((resolve, reject) => {

        if (!db) {
            reject(new Error("Database chưa sẵn sàng."));
            return;
        }

        const transaction = db.transaction(
            GAME.store,
            "readwrite"
        );

        transaction
            .objectStore(GAME.store)
            .put(
                structuredClone(player),
                GAME.saveKey
            );

        transaction.oncomplete = () => {

            updateSaveStatus(
                "Đã lưu • " +
                new Date().toLocaleTimeString()
            );

            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}


/* =====================================================
   LOAD
===================================================== */

function loadFromDatabase() {
    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            GAME.store,
            "readonly"
        );

        const request = transaction
            .objectStore(GAME.store)
            .get(GAME.saveKey);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


/* =====================================================
   AUTO SAVE
===================================================== */

function autoSave() {

    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {

        saveToDatabase()
            .catch(console.error);

    }, 250);
}


/* =====================================================
   NORMALIZE / MIGRATION
===================================================== */

function normalizePlayer(data) {

    const fresh = createNewPlayer();

    data = data || {};

    const normalized = {
        ...fresh,
        ...data,

        inventory: {
            ...fresh.inventory,
            ...(data.inventory || {})
        },

        relationship: {
            ...fresh.relationship,
            ...(data.relationship || {})
        },

        quest: {
            ...fresh.quest,
            ...(data.quest || {})
        },

        /*
         * Story state migration
         *
         * Nếu save v0.4.2 chưa có storyState,
         * fresh.storyState sẽ được sử dụng.
         *
         * Nếu đã có storyState thì giữ dữ liệu cũ.
         */
        storyState: {
            ...fresh.storyState,
            ...(data.storyState || {}),

            flags: {
                ...fresh.storyState.flags,
                ...(data.storyState?.flags || {})
            },

            completed: Array.isArray(
                data.storyState?.completed
            )
                ? data.storyState.completed
                : [],

            active:
                data.storyState?.active || null
        }
    };


    /* =================================================
       STATE INTEGRITY
    ================================================= */

    if (typeof normalized.name !== "string") {
        normalized.name = fresh.name;
    }

    if (typeof normalized.location !== "string") {
        normalized.location = fresh.location;
    }

    if (typeof normalized.hp !== "number") {
        normalized.hp = fresh.hp;
    }

    if (typeof normalized.maxHp !== "number") {
        normalized.maxHp = fresh.maxHp;
    }

    if (typeof normalized.mp !== "number") {
        normalized.mp = fresh.mp;
    }

    if (typeof normalized.maxMp !== "number") {
        normalized.maxMp = fresh.maxMp;
    }

    if (typeof normalized.gold !== "number") {
        normalized.gold = fresh.gold;
    }

    if (typeof normalized.cultivation !== "number") {
        normalized.cultivation =
            fresh.cultivation;
    }


    /* =================================================
       STORY STATE INTEGRITY
    ================================================= */

    if (
        !normalized.storyState ||
        typeof normalized.storyState !== "object"
    ) {
        normalized.storyState = {
            flags: {},
            completed: [],
            active: null
        };
    }

    if (
        !normalized.storyState.flags ||
        typeof normalized.storyState.flags !== "object"
    ) {
        normalized.storyState.flags = {};
    }

    if (
        !Array.isArray(
            normalized.storyState.completed
        )
    ) {
        normalized.storyState.completed = [];
    }

    if (
        normalized.storyState.active !== null &&
        typeof normalized.storyState.active !== "string"
    ) {
        normalized.storyState.active = null;
    }

    /* Big Update v1.0 — ensure new fields */
    if (!Array.isArray(normalized.learnedSkills)) normalized.learnedSkills = [];
    if (!Array.isArray(normalized.exploredAreas)) normalized.exploredAreas = [];
    if (typeof normalized.combatWins !== "number") normalized.combatWins = 0;
    if (typeof normalized.fateReadCount !== "number") normalized.fateReadCount = 0;
    if (typeof normalized.exploreBonus !== "number") normalized.exploreBonus = 0;
    if (typeof normalized.weaponBuff !== "number") normalized.weaponBuff = 0;
    if (typeof normalized.weaponBuffTurns !== "number") normalized.weaponBuffTurns = 0;
    if (typeof normalized.nextDamageBonus !== "number") normalized.nextDamageBonus = 0;
    if (typeof normalized.shieldTurns !== "number") normalized.shieldTurns = 0;
    if (!normalized.secrets) normalized.secrets = {};
    if (!normalized.giftedNPCs) normalized.giftedNPCs = {};
    if (!normalized.npcCooldowns) normalized.npcCooldowns = {};
    if (!normalized.quests) normalized.quests = {};


    return normalized;
}


/* =====================================================
   REALM
===================================================== */

function currentRealm() {

    let result = REALMS[0];

    for (const realm of REALMS) {

        if (
            player.cultivation >=
            realm.required
        ) {
            result = realm;
        }
    }

    return result;
}