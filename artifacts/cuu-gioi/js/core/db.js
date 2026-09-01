/* =====================================================
   DATABASE & PERSISTENCE LAYER
   Cửu Giới — Core v0.4.5
===================================================== */

let db = null;
let saveTimer = null;

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
            if (typeof updateSaveStatus === "function") {
                updateSaveStatus(
                    "Đã lưu • " +
                    new Date().toLocaleTimeString()
                );
            }
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

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

function autoSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveToDatabase()
            .catch(console.error);
    }, 250);
}

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
        storyState: {
            ...fresh.storyState,
            ...(data.storyState || {}),
            flags: {
                ...fresh.storyState.flags,
                ...(data.storyState?.flags || {})
            },
            completed: Array.isArray(data.storyState?.completed)
                ? data.storyState.completed
                : [],
            active: data.storyState?.active || null
        }
    };

    if (typeof normalized.name !== "string") normalized.name = fresh.name;
    if (typeof normalized.location !== "string") normalized.location = fresh.location;
    if (typeof normalized.hp !== "number") normalized.hp = fresh.hp;
    if (typeof normalized.maxHp !== "number") normalized.maxHp = fresh.maxHp;
    if (typeof normalized.mp !== "number") normalized.mp = fresh.mp;
    if (typeof normalized.maxMp !== "number") normalized.maxMp = fresh.maxMp;
    if (typeof normalized.gold !== "number") normalized.gold = fresh.gold;
    if (typeof normalized.cultivation !== "number") normalized.cultivation = fresh.cultivation;

    if (!normalized.storyState || typeof normalized.storyState !== "object") {
        normalized.storyState = { flags: {}, completed: [], active: null };
    }
    if (!normalized.storyState.flags || typeof normalized.storyState.flags !== "object") {
        normalized.storyState.flags = {};
    }
    if (!Array.isArray(normalized.storyState.completed)) {
        normalized.storyState.completed = [];
    }
    if (normalized.storyState.active !== null && typeof normalized.storyState.active !== "string") {
        normalized.storyState.active = null;
    }

    return normalized;
}
