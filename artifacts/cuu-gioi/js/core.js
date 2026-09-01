/* =====================================================
   CORE ENGINE (COMPATIBILITY & BOOTSTRAP)
   Cửu Giới — Core v0.4.5
===================================================== */

if (typeof bindGameActionButtons === "function") {
    bindGameActionButtons();
}

if (typeof bootGame === "function") {
    bootGame();
}
