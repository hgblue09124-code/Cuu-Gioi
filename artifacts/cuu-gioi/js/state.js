/* =====================================================
   STATE MANAGEMENT & DATABASE
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

        combat: null,

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