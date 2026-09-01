/* =====================================================
   CỬU GIỚI — RUNTIME v0.2
   Experimental Administrator Sandbox

   v0.2 — Sửa lỗi "Pre-Runtime vs Runtime data không được lưu":

   Trước đây, mọi patch được lưu qua console admin (Runtime.persistent)
   đều được nạp và CHẠY NGAY khi runtime.js được parse — tức là TRƯỚC
   khi bootGame() (trong core.js) kịp tải dữ liệu người chơi từ
   IndexedDB. Nếu patch đó đụng vào biến `player`, nó sẽ chạy trên một
   `player` tạm (mặc định), rồi ngay sau đó bootGame() gán lại biến
   `player` bằng dữ liệu tải từ database — patch coi như biến mất,
   dù vẫn nằm trong localStorage và "Đã lưu" theo giao diện.

   Cách khắc phục: tách thành 2 lớp dữ liệu rõ ràng, đúng như tên gọi
   "preruntime" và "runtime":

   - Runtime.preruntime : chạy NGAY khi module này được nạp (trước
     bootGame). Dùng để chỉnh dữ liệu tĩnh đã có sẵn tại thời điểm
     này: WORLD, REALMS, ENEMIES, QUESTS, ITEMS, STORY_DATABASE...

   - Runtime.persistent  : chỉ NẠP (load) tại đây, nhưng chỉ THỰC THI
     (executeAll) sau khi core.js xác nhận `player` đã sẵn sàng
     (bootGame / loadGame / importSave / deleteSave gọi lại). Dùng để
     chỉnh dữ liệu người chơi (player.*) — đảm bảo patch không bị
     ghi đè mất bởi player được tải từ database.
===================================================== */

const Runtime = {

    version: "0.2",

    modules: {},

    /* =================================================
       MODULE SYSTEM (không liên quan lưu trữ)
    ================================================= */

    register(name, module) {

        if (!name || !module) {
            console.warn("[Runtime] Module không hợp lệ.");
            return false;
        }

        this.modules[name] = module;

        console.log(`[Runtime] Registered: ${name}`);

        return true;
    },

    get(name) {

        return this.modules[name] || null;

    },

    remove(name) {

        if (!this.modules[name]) return false;

        delete this.modules[name];

        console.log(`[Runtime] Removed: ${name}`);

        return true;
    },

    list() {

        return Object.keys(this.modules);

    },

    run(name, method, ...args) {

        const module = this.get(name);

        if (!module) {

            console.warn(
                `[Runtime] Không tìm thấy module: ${name}`
            );

            return;

        }

        if (typeof module[method] !== "function") {

            console.warn(
                `[Runtime] Không tìm thấy method: ${name}.${method}`
            );

            return;

        }

        return module[method](...args);

    },

    status() {

        return {
            version: this.version,
            modules: this.list(),
            preruntimePatches: this.preruntime.list(),
            runtimePatches: this.persistent.list()
        };

    },


    /* =================================================
       ADMINISTRATOR CONSOLE (giao diện eval trực tiếp)
    ================================================= */

    openConsole() {

        const overlay =
            document.getElementById(
                "runtimeConsoleOverlay"
            );

        if (!overlay) return;

        overlay.classList.add("show");

        this.renderPatchList();

        setTimeout(() => {

            const input =
                document.getElementById(
                    "runtimeCode"
                );

            if (input) input.focus();

        }, 100);

    },


    closeConsole() {

        const overlay =
            document.getElementById(
                "runtimeConsoleOverlay"
            );

        if (!overlay) return;

        overlay.classList.remove("show");

    },


    clearConsole() {

        const input =
            document.getElementById(
                "runtimeCode"
            );

        const output =
            document.getElementById(
                "runtimeOutput"
            );

        if (input) {
            input.value = "";
        }

        if (output) {
            output.textContent =
                "Runtime ready.";
        }

    },


    executeFromUI() {

        const input =
            document.getElementById(
                "runtimeCode"
            );

        const output =
            document.getElementById(
                "runtimeOutput"
            );

        if (!input || !output) return;

        const code =
            input.value.trim();

        if (!code) {

            output.textContent =
                "⚠ Không có code để thực thi.";

            showPopup(
                "Administrator",
                "Không có code để thực thi."
            );

            return;

        }

        try {

            const result =
                eval(code);

            const message =
                result === undefined
                    ? "Code đã được thực thi thành công."
                    : String(result);

            output.textContent =
                "✓ " + message;

            showPopup(
                "Runtime",
                message
            );

        } catch (error) {

            const message =
                error && error.message
                    ? error.message
                    : String(error);

            output.textContent =
                "✕ " + message;

            showPopup(
                "Runtime Error",
                message
            );

        }

    },


    /* =================================================
       LƯU CODE HIỆN TẠI THÀNH PATCH
       type: "pre" (Pre-Runtime) hoặc "run" (Runtime)
    ================================================= */

    promptSaveCurrent(type) {

        const input =
            document.getElementById("runtimeCode");

        if (!input || !input.value.trim()) {
            toast("Không có code để lưu.");
            return;
        }

        const code = input.value;

        const nameInput =
            document.createElement("input");

        nameInput.className = "rename-input";
        nameInput.type = "text";
        nameInput.autocomplete = "off";
        nameInput.placeholder = "Tên patch (vd: buff_gold)";

        const isPre = type === "pre";

        showPopup(
            isPre
                ? "Lưu Pre-Runtime Patch"
                : "Lưu Runtime Patch",
            isPre
                ? "Patch này chạy NGAY khi game khởi động, trước khi dữ liệu người chơi được tải. Dùng để chỉnh dữ liệu tĩnh: WORLD, ENEMIES, QUESTS, ITEMS, STORY_DATABASE..."
                : "Patch này chạy SAU khi dữ liệu người chơi (player) đã được tải xong. Dùng để chỉnh trạng thái nhân vật — đảm bảo không bị ghi đè mất.",
            {
                input: nameInput,
                confirmText: "Lưu",
                onConfirm: () => {

                    const name =
                        nameInput.value.trim();

                    if (!name) {
                        toast("Cần nhập tên patch.");
                        return;
                    }

                    const bucket =
                        isPre
                            ? Runtime.preruntime
                            : Runtime.persistent;

                    bucket.add(name, code);

                    closePopup();

                    toast(`Đã lưu patch "${name}".`);

                    Runtime.renderPatchList();
                }
            }
        );

        setTimeout(() => {
            nameInput.focus();
        }, 100);

    },


    runPatch(type, name) {

        const bucket =
            type === "pre"
                ? this.preruntime
                : this.persistent;

        bucket.execute(name);

        toast(`Đã chạy patch "${name}".`);

    },


    deletePatch(type, name) {

        const bucket =
            type === "pre"
                ? this.preruntime
                : this.persistent;

        bucket.remove(name);

        toast(`Đã xóa patch "${name}".`);

        this.renderPatchList();

    },


    renderPatchList() {

        const container =
            document.getElementById("runtimePatchList");

        if (!container) return;

        const buildGroup = (label, type, bucket) => {

            const names = bucket.list();

            const group =
                document.createElement("div");

            group.className = "runtime-patch-group";

            const heading =
                document.createElement("div");

            heading.className = "runtime-patch-label";
            heading.textContent =
                `${label} (${names.length})`;

            group.appendChild(heading);

            if (!names.length) {

                const empty =
                    document.createElement("div");

                empty.className = "small";
                empty.textContent = "Chưa có patch nào.";

                group.appendChild(empty);

                return group;
            }

            names.forEach(name => {

                const item =
                    document.createElement("div");

                item.className = "runtime-patch-item";

                const nameEl =
                    document.createElement("span");

                nameEl.textContent = name;

                const actions =
                    document.createElement("div");

                actions.className =
                    "runtime-patch-actions";

                const runBtn =
                    document.createElement("button");

                runBtn.textContent = "▶";
                runBtn.title = "Chạy lại ngay";
                runBtn.onclick =
                    () => this.runPatch(type, name);

                const delBtn =
                    document.createElement("button");

                delBtn.textContent = "×";
                delBtn.className = "danger";
                delBtn.title = "Xóa patch";
                delBtn.onclick =
                    () => this.deletePatch(type, name);

                actions.appendChild(runBtn);
                actions.appendChild(delBtn);

                item.appendChild(nameEl);
                item.appendChild(actions);

                group.appendChild(item);
            });

            return group;
        };

        container.innerHTML = "";

        container.appendChild(
            buildGroup("Pre-Runtime", "pre", this.preruntime)
        );

        container.appendChild(
            buildGroup("Runtime", "run", this.persistent)
        );
    }

};


/* =====================================================
   RUNTIME ONLINE
===================================================== */

console.log(
    `[Cửu Giới Runtime] v${Runtime.version} ONLINE`
);


/* =====================================================
   PERSISTENCE LAYER — CHUNG CHO CẢ 2 LỚP
   (factory dùng chung cho preruntime & runtime)
===================================================== */

function createRuntimeBucket(storageKey) {

    return {

        storageKey,

        modules: {},


        load() {

            try {

                const saved =
                    localStorage.getItem(
                        this.storageKey
                    );

                if (!saved) return;

                const data =
                    JSON.parse(saved);

                if (
                    data &&
                    typeof data === "object"
                ) {
                    this.modules = data;
                }

            } catch (error) {

                console.error(
                    `[Runtime] Không thể tải ${this.storageKey}:`,
                    error
                );

            }

        },


        save() {

            try {

                localStorage.setItem(
                    this.storageKey,
                    JSON.stringify(this.modules)
                );

                return true;

            } catch (error) {

                console.error(
                    `[Runtime] Không thể lưu ${this.storageKey}:`,
                    error
                );

                return false;

            }

        },


        add(name, code) {

            if (!name || !code) {
                return false;
            }

            this.modules[name] = code;

            this.save();

            console.log(
                `[Runtime] Module added (${this.storageKey}): ${name}`
            );

            return true;

        },


        remove(name) {

            if (!this.modules[name]) {
                return false;
            }

            delete this.modules[name];

            this.save();

            console.log(
                `[Runtime] Module removed (${this.storageKey}): ${name}`
            );

            return true;

        },


        list() {

            return Object.keys(this.modules);

        },


        execute(name) {

            const code =
                this.modules[name];

            if (!code) {

                console.warn(
                    `[Runtime] Không tìm thấy module: ${name}`
                );

                return;

            }

            try {

                return eval(code);

            } catch (error) {

                console.error(
                    `[Runtime] Lỗi module ${name}:`,
                    error
                );

            }

        },


        executeAll() {

            this.list().forEach(name => {

                this.execute(name);

            });

        }

    };
}


/* =====================================================
   PRE-RUNTIME LAYER
   Chạy NGAY (dữ liệu tĩnh đã sẵn sàng: WORLD, ENEMIES,
   QUESTS, ITEMS, STORY_DATABASE — tất cả đã được định
   nghĩa ở các module load trước runtime.js).
===================================================== */

Runtime.preruntime =
    createRuntimeBucket("CuuGioi_PreRuntimeModules");

Runtime.preruntime.load();
Runtime.preruntime.executeAll();

console.log(
    "[Cửu Giới Runtime] Pre-Runtime Layer ONLINE"
);


/* =====================================================
   RUNTIME LAYER (trước gọi là "persistent")
   Chỉ NẠP dữ liệu tại đây. KHÔNG thực thi ngay, vì biến
   `player` lúc này vẫn là player tạm — chưa được
   bootGame() tải từ IndexedDB. Việc thực thi (executeAll)
   được core.js gọi lại sau khi `player` đã sẵn sàng.
===================================================== */

Runtime.persistent =
    createRuntimeBucket("CuuGioi_RuntimeModules");

Runtime.persistent.load();

console.log(
    "[Cửu Giới Runtime] Runtime Layer LOADED (chờ player sẵn sàng)."
);
