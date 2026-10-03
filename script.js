/* =========================
   1. INITIALIZATION & SPLASH
========================= */
const statusDot = document.getElementById("jsStatusDot");
if (statusDot) statusDot.style.background = "#22c55e";

window.addEventListener("load", function () {
    setTimeout(function () {
        const splash = document.getElementById("splashScreen");
        if (splash) splash.classList.add("fade-out");
    }, 550);
});

/* =========================
   2. UNICODE EMOJI BANK & SMS SANITIZER
========================= */
const EMOJI = {
    rupee: "\u20B9",
    bolt: "\u26A1",
    laugh: "\uD83D\uDE02",
    siren: "\uD83D\uDEA8",
    skull: "\uD83D\uDC80",
    heart: "\u2764\uFE0F",
    smile: "\uD83D\uDE0A",
    hands: "\uD83D\uDE4C",
    bell: "\uD83D\uDD14",
    bellOff: "\uD83D\uDD15",
    fire: "\uD83D\uDD25",
    devil: "\uD83D\uDE08",
    Sparkles: "\u2728",
    phone: "\uD83D\uDCF1",
    check: "\u2705",
    party: "\uD83C\uDF89",
    moneyWing: "\uD83D\uDCB8",
    globe: "\uD83C\uDF0D",
    india: "\uD83C\uDDEE\uD83C\uDDF3",
    palette: "\uD83C\uDFA8",
    clipboard: "\uD83D\uDCCB",
    sleep: "\uD83D\uDCA4",
    trash: "\uD83D\uDDD1\uFE0F",
    backArrow: "\u21A9\uFE0F",
    clock: "\u23F0",
    briefcase: "\uD83D\uDCBC",
    slightSmile: "\uD83D\uDE42",
    folder: "\uD83D\uDCC1",
    gem: "\uD83D\uDC8E",
    turtle: "\uD83D\uDC22",
    ghost: "\uD83D\uDC7B",
    trophy: "\uD83C\uDFC6",
    dice: "\uD83C\uDFB2",
    clapper: "\uD83C\uDFAC",
    robot: "\uD83E\uDD16",
    pizza: "\uD83C\uDF55"
};

function makeSmsSafeText(str) {
    return String(str)
        .replace(/\u20B9/g, "Rs. ")
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
        .replace(/[\u2600-\u27BF]/g, "")
        .replace(/\uFE0F/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/* =========================
   3. CONFETTI CELEBRATION ENGINE
========================= */
function fireConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#8b5cf6", "#facc15", "#4ade80", "#f472b6", "#38bdf8", "#ef4444"];

    for (let i = 0; i < 60; i++) {
        pieces.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 140,
            y: canvas.height * 0.55,
            vx: (Math.random() - 0.5) * 14,
            vy: -(Math.random() * 14 + 6),
            size: Math.random() * 7 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 12
        });
    }

    let frame = 0;
    function animate() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.42;
            p.rot += p.vRot;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        if (frame < 70) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    requestAnimationFrame(animate);
}

/* =========================
   4. STATE MANAGEMENT
========================= */
let debts = [];
try {
    debts = JSON.parse(localStorage.getItem("pingzyDebts")) || [];
} catch (e) {
    debts = [];
}

let appLang = localStorage.getItem("pingzyLang") || "hinglish";
let appTheme = localStorage.getItem("pingzyTheme") || "purple";
let userUpiId = localStorage.getItem("pingzyUpiId") || "";
let alertsEnabled = localStorage.getItem("pingzyAlerts") === "on";

let selectedVibe = "soft";
let entryDirection = "collect"; // "collect" or "iowe"
let calcSelectedVibe = "funny";
let currentReminder = null;
let currentStickerStyle = "classic";
let stickerVariantIndex = 0;
let customStickerText = "";
let activeTab = "pending"; // "pending", "iowe", "paid"
let sortByAmount = false;
let searchQuery = "";

let pendingDeleteDebt = null;
let lastDeletedDebt = null;
let activePartialDebt = null;
let activeAddMoreDebt = null;
let lastCalculatedSplits = [];
let lastGroupSummaryText = "";
let toastTimeout = null;

/* =========================
   5. DOM REFERENCES
========================= */
const addMoneyBtn = document.getElementById("addMoneyBtn");
const firstReminderBtn = document.getElementById("firstReminderBtn");
const loadDemoBtn = document.getElementById("loadDemoBtn");
const addModal = document.getElementById("addModal");
const reminderModal = document.getElementById("reminderModal");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const partialPayModal = document.getElementById("partialPayModal");
const addMoreModal = document.getElementById("addMoreModal");
const splitCalcModal = document.getElementById("splitCalcModal");

const personInput = document.getElementById("personName");
const phoneInput = document.getElementById("personPhone");
const pickContactBtn = document.getElementById("pickContactBtn");
const amountInput = document.getElementById("amount");
const dueDateInput = document.getElementById("dueDate");
const personError = document.getElementById("personError");
const amountError = document.getElementById("amountError");
const dateError = document.getElementById("dateError");
const customStickerInput = document.getElementById("customStickerInput");
const langToggleBtn = document.getElementById("langToggleBtn");
const quickLangBtn = document.getElementById("quickLangBtn");
const notifBtn = document.getElementById("notifBtn");
const searchInput = document.getElementById("searchInput");
const sortToggleBtn = document.getElementById("sortToggleBtn");
const userUpiInput = document.getElementById("userUpiInput");
const saveUpiBtn = document.getElementById("saveUpiBtn");

/* =========================
   6. 4-THEME OLED STUDIO ENGINE
========================= */
const THEMES = {
    purple: {
        oled: "#040406", s1: "#0c0c12", s2: "#14141f",
        primary: "#8b5cf6", dark: "#6d28d9", light: "#ddd6fe",
        surface: "rgba(139, 92, 246, 0.16)", glow: "rgba(139, 92, 246, 0.42)", pill: "#6d28d9"
    },
    emerald: {
        oled: "#020604", s1: "#09130e", s2: "#102018",
        primary: "#10b981", dark: "#047857", light: "#a7f3d0",
        surface: "rgba(16, 185, 129, 0.16)", glow: "rgba(16, 185, 129, 0.42)", pill: "#047857"
    },
    red: {
        oled: "#070304", s1: "#14090c", s2: "#201014",
        primary: "#ef4444", dark: "#b91c1c", light: "#fecaca",
        surface: "rgba(239, 68, 68, 0.16)", glow: "rgba(239, 68, 68, 0.42)", pill: "#b91c1c"
    },
    ocean: {
        oled: "#020508", s1: "#08121a", s2: "#0f1e2b",
        primary: "#06b6d4", dark: "#0369a1", light: "#bae6fd",
        surface: "rgba(6, 182, 212, 0.16)", glow: "rgba(6, 182, 212, 0.42)", pill: "#0369a1"
    }
};

function applyTheme(themeKey) {
    const t = THEMES[themeKey] || THEMES.purple;
    appTheme = themeKey in THEMES ? themeKey : "purple";
    const root = document.documentElement;

    root.style.setProperty("--bg-oled", t.oled);
    root.style.setProperty("--surface-1", t.s1);
    root.style.setProperty("--surface-2", t.s2);
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-dark", t.dark);
    root.style.setProperty("--primary-light", t.light);
    root.style.setProperty("--primary-surface", t.surface);
    root.style.setProperty("--primary-glow", t.glow);

    document.querySelectorAll(".theme-card").forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.theme === appTheme);
    });

    renderDebts();
    if (currentReminder && reminderModal.classList.contains("show")) {
        updateStickerPreview(currentReminder.debt);
    }
}

document.querySelectorAll(".theme-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const chosen = btn.dataset.theme;
        localStorage.setItem("pingzyTheme", chosen);
        applyTheme(chosen);
        showToast("Theme Updated! " + EMOJI.palette);
    });
});

/* =========================
   7. BOTTOM DOCK & SUB-TABS NAVIGATION
========================= */
const navPendingBtn = document.getElementById("navPendingBtn");
const navPaidBtn = document.getElementById("navPaidBtn");
const navStudioBtn = document.getElementById("navStudioBtn");
const ledgerView = document.getElementById("ledgerView");
const studioView = document.getElementById("studioView");
const currentViewTitle = document.getElementById("currentViewTitle");
const ledgerSubTabs = document.getElementById("ledgerSubTabs");

function switchNavigation(target) {
    [navPendingBtn, navPaidBtn, navStudioBtn].forEach(function (b) {
        if (b) b.classList.remove("active");
    });

    if (target === "studio") {
        ledgerView.classList.remove("active");
        studioView.classList.add("active");
        navStudioBtn.classList.add("active");
    } else if (target === "paid") {
        studioView.classList.remove("active");
        ledgerView.classList.add("active");
        navPaidBtn.classList.add("active");
        activeTab = "paid";
        if (ledgerSubTabs) ledgerSubTabs.style.display = "none";
        currentViewTitle.textContent = appLang === "en" ? "Settled History" : "Settled Record";
        renderDebts();
    } else {
        studioView.classList.remove("active");
        ledgerView.classList.add("active");
        navPendingBtn.classList.add("active");
        activeTab = target; // "pending" or "iowe"
        if (ledgerSubTabs) ledgerSubTabs.style.display = "flex";
        document.querySelectorAll(".sub-tab").forEach(function (st) {
            st.classList.toggle("active", st.dataset.subtab === activeTab);
        });
        currentViewTitle.textContent =
            activeTab === "iowe"
                ? (appLang === "en" ? "I Owe (To Pay Back)" : "Mujhe Dena Hai (I Owe)")
                : (appLang === "en" ? "To Collect (Pending)" : "To Collect (Lena Hai)");
        renderDebts();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

navPendingBtn.addEventListener("click", function () { switchNavigation("pending"); });
navPaidBtn.addEventListener("click", function () { switchNavigation("paid"); });
navStudioBtn.addEventListener("click", function () { switchNavigation("studio"); });

document.querySelectorAll(".sub-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
        switchNavigation(btn.dataset.subtab);
    });
});

/* =========================
   8. UPI ID SETUP, DEEP LINK & LIVE QR
========================= */
function updateUpiUI() {
    if (userUpiInput) userUpiInput.value = userUpiId;
}

if (saveUpiBtn) {
    saveUpiBtn.addEventListener("click", function () {
        userUpiId = userUpiInput.value.trim();
        localStorage.setItem("pingzyUpiId", userUpiId);
        updateUpiUI();
        showToast(userUpiId ? "UPI ID saved for QR & Pings! " + EMOJI.check : "UPI ID cleared");
    });
}

function getUpiPaymentFooter(amount) {
    if (!userUpiId) return "";
    const upiUri = "upi://pay?pa=" + encodeURIComponent(userUpiId) + "&am=" + encodeURIComponent(amount) + "&cu=INR";
    return "\n\n" + EMOJI.bolt + " Instant UPI Pay (" + userUpiId + "):\n" + upiUri;
}

document.getElementById("showQrBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const qrBox = document.getElementById("qrCodeContainer");
    if (!userUpiId) {
        showToast(appLang === "en" ? "Add your UPI ID in ⚙️ Studio tab first!" : "Pehle ⚙️ Studio tab me apna UPI ID save karo!");
        return;
    }
    if (qrBox.style.display === "block") {
        qrBox.style.display = "none";
        return;
    }
    const amt = currentReminder.debt.amount;
    const upiUri = "upi://pay?pa=" + encodeURIComponent(userUpiId) + "&am=" + encodeURIComponent(amt) + "&cu=INR";
    document.getElementById("upiQrImg").src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(upiUri);
    document.getElementById("qrUpiText").textContent = userUpiId + " • ₹" + amt;
    qrBox.style.display = "block";
});

/* =========================
   9. 1-CLICK DEMO LOADER & QUICK ENTRY CHIPS
========================= */
if (loadDemoBtn) {
    loadDemoBtn.addEventListener("click", function () {
        debts.push(
            {
                id: Date.now() + 1,
                person: "Rohan",
                phone: "",
                amount: 450,
                originalAmount: 600,
                partialPaid: 150,
                reason: "Pizza & Cold Coffee",
                items: [
                    { title: "Pizza Night Split", amt: 400, date: "12 Oct" },
                    { title: "Cold Coffee", amt: 200, date: "14 Oct" }
                ],
                direction: "collect",
                vibe: "funny",
                paid: false,
                remindCount: 3,
                lastRemindedAt: "Yesterday"
            },
            {
                id: Date.now() + 2,
                person: "Priya",
                phone: "",
                amount: 200,
                originalAmount: 200,
                partialPaid: 0,
                reason: "Movie Popcorn",
                items: [{ title: "Movie Popcorn", amt: 200, date: "Today" }],
                direction: "collect",
                vibe: "soft",
                paid: false,
                remindCount: 0,
                lastRemindedAt: null
            }
        );
        saveData();
        renderDebts();
        fireConfetti();
        showToast("Sample Demo Loaded! Tap ⚡ Ping on Rohan to test! " + EMOJI.Sparkles);
    });
}

// Quick +₹50 / +₹100 / +₹200 / +₹500 chips
document.querySelectorAll(".amt-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
        const addVal = Number(chip.dataset.addamt);
        const cur = Number(amountInput.value) || 0;
        amountInput.value = cur + addVal;
        amountError.classList.remove("show");
    });
});

function renderRecentFriendsBar() {
    const bar = document.getElementById("recentFriendsBar");
    if (!bar) return;
    bar.innerHTML = "";
    const uniqueNames = [];
    debts.forEach(function (d) {
        if (d.person && !uniqueNames.includes(d.person) && uniqueNames.length < 5) {
            uniqueNames.push(d.person);
        }
    });
    uniqueNames.forEach(function (name) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "friend-chip";
        btn.textContent = "👤 " + name;
        btn.addEventListener("click", function () {
            personInput.value = name;
            personError.classList.remove("show");
        });
        bar.appendChild(btn);
    });
}

/* =========================
   10. ADD SPLIT WITH AUTO CROSS-CUT ENGINE
========================= */
const typeCollectBtn = document.getElementById("typeCollectBtn");
const typeIOweBtn = document.getElementById("typeIOweBtn");

typeCollectBtn.addEventListener("click", function () {
    entryDirection = "collect";
    typeCollectBtn.classList.add("active");
    typeIOweBtn.classList.remove("active");
});

typeIOweBtn.addEventListener("click", function () {
    entryDirection = "iowe";
    typeIOweBtn.classList.add("active");
    typeCollectBtn.classList.remove("active");
});

addMoneyBtn.addEventListener("click", function () {
    renderRecentFriendsBar();
    addModal.classList.add("show");
});
firstReminderBtn.addEventListener("click", function () {
    renderRecentFriendsBar();
    addModal.classList.add("show");
});
document.getElementById("closeAddBtn").addEventListener("click", function () {
    addModal.classList.remove("show");
});

document.querySelectorAll("#mainVibeGrid .vibe").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll("#mainVibeGrid .vibe").forEach(function (b) { b.classList.remove("active"); });
        button.classList.add("active");
        selectedVibe = button.dataset.vibe;
    });
});

document.getElementById("createReminderBtn").addEventListener("click", function () {
    personError.classList.remove("show");
    amountError.classList.remove("show");

    const person = personInput.value.trim();
    const phone = phoneInput ? phoneInput.value.replace(/\D/g, "").slice(-10) : "";
    const amount = Number(amountInput.value);
    const reason = document.getElementById("reason").value.trim() || "Shared Split";
    const dueDate = dueDateInput.value;
    const dueTime = document.getElementById("dueTime").value;

    if (!person) return personError.classList.add("show");
    if (!amount || amount <= 0) return amountError.classList.add("show");

    const todayShort = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

    // CHECK FOR EXISTING ACTIVE RECORD FOR SAME PERSON (AUTO CROSS-CUT / MERGE)
    const existing = debts.find(function (d) {
        return !d.paid && d.person.toLowerCase() === person.toLowerCase();
    });

    if (existing) {
        if (!existing.items) {
            existing.items = [{ title: existing.reason || "Previous Split", amt: existing.amount, date: todayShort }];
        }
        const exDir = existing.direction || "collect";

        if (exDir === entryDirection) {
            // Same direction -> Merge into Mini-Passbook
            existing.amount = Math.round((Number(existing.amount) + amount) * 100) / 100;
            existing.originalAmount = Math.round((Number(existing.originalAmount || existing.amount) + amount) * 100) / 100;
            existing.items.push({ title: reason, amt: amount, date: todayShort });
            existing.reason = reason + " (+" + (existing.items.length - 1) + " more)";
            saveData();
            addModal.classList.remove("show");
            switchNavigation(entryDirection === "iowe" ? "iowe" : "pending");
            showToast("Added ₹" + amount + " to " + existing.person + "'s Passbook! 🧾");
        } else {
            // Opposite direction -> AUTO CROSS-CUT!
            const oldAmt = Number(existing.amount);
            if (amount === oldAmt) {
                existing.paid = true;
                existing.items.push({ title: "Cross-Cut Settle (" + reason + ")", amt: -amount, date: todayShort });
                saveData();
                addModal.classList.remove("show");
                fireConfetti();
                renderDebts();
                showToast("⚡ Auto Cross-Cut! " + existing.person + "'s balance is now ₹0 Settled!");
            } else if (amount < oldAmt) {
                existing.amount = Math.round((oldAmt - amount) * 100) / 100;
                existing.items.push({ title: "Cross-Cut (-₹" + amount + " " + reason + ")", amt: -amount, date: todayShort });
                saveData();
                addModal.classList.remove("show");
                switchNavigation(exDir === "iowe" ? "iowe" : "pending");
                showToast("⚡ Auto Cross-Cut! Net remaining with " + existing.person + ": ₹" + existing.amount);
            } else {
                // Flipped direction!
                const newNet = Math.round((amount - oldAmt) * 100) / 100;
                existing.direction = entryDirection;
                existing.amount = newNet;
                existing.originalAmount = newNet;
                existing.items.push({ title: "Flipped Balance (" + reason + ")", amt: newNet, date: todayShort });
                saveData();
                addModal.classList.remove("show");
                switchNavigation(entryDirection === "iowe" ? "iowe" : "pending");
                showToast("⚡ Balance Flipped! Net: ₹" + newNet);
            }
        }
        personInput.value = "";
        amountInput.value = "";
        document.getElementById("reason").value = "";
        return;
    }

    const debt = {
        id: Date.now(),
        person: person,
        phone: phone,
        amount: amount,
        originalAmount: amount,
        partialPaid: 0,
        reason: reason,
        items: [{ title: reason, amt: amount, date: todayShort }],
        dueDate: dueDate,
        dueTime: dueTime || "",
        direction: entryDirection,
        vibe: selectedVibe,
        paid: false,
        remindCount: 0,
        lastRemindedAt: null
    };

    debts.push(debt);
    saveData();

    personInput.value = "";
    phoneInput.value = "";
    amountInput.value = "";
    document.getElementById("reason").value = "";
    dueDateInput.value = "";
    document.getElementById("dueTime").value = "";
    addModal.classList.remove("show");

    if (entryDirection === "iowe") {
        switchNavigation("iowe");
        showToast("Saved to 'I Owe' list! 📤");
    } else {
        switchNavigation("pending");
        customStickerInput.value = "";
        customStickerText = "";
        document.getElementById("qrCodeContainer").style.display = "none";
        generateMessage(debt);
        reminderModal.classList.add("show");
    }
});

/* =========================
   11. MINI-PASSBOOK (+₹ ADD MORE MODAL)
========================= */
const addMoreAmtInput = document.getElementById("addMoreAmtInput");
const addMoreNoteInput = document.getElementById("addMoreNoteInput");

function openAddMoreModal(debt) {
    activeAddMoreDebt = debt;
    document.getElementById("addMoreTitle").textContent = "➕ Add to " + debt.person + "'s Khata";
    document.getElementById("addMoreSub").textContent = "Current Balance: ₹" + debt.amount;
    addMoreAmtInput.value = "";
    addMoreNoteInput.value = "";
    addMoreModal.classList.add("show");
}

document.getElementById("cancelAddMoreBtn").addEventListener("click", function () {
    activeAddMoreDebt = null;
    addMoreModal.classList.remove("show");
});

document.getElementById("confirmAddMoreBtn").addEventListener("click", function () {
    if (!activeAddMoreDebt) return;
    const extraAmt = Number(addMoreAmtInput.value);
    const extraNote = addMoreNoteInput.value.trim() || "Extra Split";
    if (!extraAmt || extraAmt <= 0) return showToast("Enter valid amount!");

    const todayShort = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    if (!activeAddMoreDebt.items) {
        activeAddMoreDebt.items = [{ title: activeAddMoreDebt.reason || "Split", amt: activeAddMoreDebt.amount, date: todayShort }];
    }
    activeAddMoreDebt.items.push({ title: extraNote, amt: extraAmt, date: todayShort });
    activeAddMoreDebt.amount = Math.round((Number(activeAddMoreDebt.amount) + extraAmt) * 100) / 100;
    activeAddMoreDebt.originalAmount = Math.round((Number(activeAddMoreDebt.originalAmount || activeAddMoreDebt.amount) + extraAmt) * 100) / 100;
    activeAddMoreDebt.reason = extraNote + " (+" + (activeAddMoreDebt.items.length - 1) + " items)";

    saveData();
    renderDebts();
    addMoreModal.classList.remove("show");
    showToast("Added ₹" + extraAmt + " to " + activeAddMoreDebt.person + "'s passbook! 🧾");
    activeAddMoreDebt = null;
});

/* =========================
   12. SPECIAL VIRAL MODES: AI BOT, BARTER TREAT, FILMY, DOSTI TAX
========================= */
document.getElementById("botModeBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const d = currentReminder.debt;
    const amt = EMOJI.rupee + Number(d.amount).toLocaleString("en-IN");
    const msg = appLang === "en"
        ? "🤖 [AUTOMATED PINGZY BOT]: Hello " + d.person + "! Your friend was too polite to remind you manually, so Pingzy AI Bot flagged a pending split of " + amt + ". Kindly settle to pause automated bot pings! ⚡"
        : "🤖 [PINGZY AUTOMATED AI BOT]: Hello " + d.person + "! Aapka dost sharmila hai isliye khud nahi bol raha, par humare AI Bot ne " + amt + " ka pending split detect kiya hai. Bot alerts band karne ke liye aaj hi settle karein! ⚡";
    currentReminder.message = msg;
    document.getElementById("messageBoxLabel").textContent = "🤖 Blame-the-AI Bot Mode Active";
    document.getElementById("generatedMessage").textContent = msg;
    showToast("AI Bot Excuse Loaded! 🤖");
});

document.getElementById("barterModeBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const d = currentReminder.debt;
    const num = Number(d.amount);
    let treat = "2 Plate Momos + Cold Drink 🥟🥤";
    if (num <= 80) treat = "3 Tapri Chai + Bun Maska ☕🍞";
    else if (num <= 250) treat = "2 Plate Kurkure Momos + Cold Coffee 🥟🧋";
    else if (num <= 600) treat = "1 Medium Farmhouse Pizza + Coke 🍕🥤";
    else treat = "Full Biryani Treat / Cafe Hangout 🍛🎉";

    const msg = appLang === "en"
        ? "🍕 BARTER OFFER: Bro, skip the ₹" + num + " UPI transfer! Just sponsor " + treat + " today and your split is 100% settled! Deal? 🤝"
        : "🍕 BARTER DEAL: Bhai ₹" + num + " UPI rehne de! Aaj shaam ko bas " + treat + " khila de aur apna hisaab 100% barabar! Deal? 🤝";
    currentReminder.message = msg;
    document.getElementById("messageBoxLabel").textContent = "🍕 Snack Barter Mode (" + treat + ")";
    document.getElementById("generatedMessage").textContent = msg;
    showToast("Converted ₹" + num + " to " + treat + "! 🍕");
});

document.getElementById("filmyModeBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const d = currentReminder.debt;
    const amt = EMOJI.rupee + Number(d.amount).toLocaleString("en-IN");
    const lines = [
        "🎬 '25 din me paisa double nahi chahiye babu bhaiya, mera " + amt + " hi wapas bhej de!' 😂⚡",
        "🦈 Shark Tank Update: 'Is " + amt + " ke udhaar se meri mahine ki equity hil gayi hai, jaldi UPI karo varna I'm Out!' 😭",
        "🎬 'Chacha vidhayak honge tumhare, par " + amt + " ka split hamara hai!' Settle kar de bhai 🔥",
        "🎬 'Ek chutki sindoor ki keemat tum kya jaano, par mere " + amt + " ki keemat mera khaali wallet jaanta hai!' 💀"
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    currentReminder.message = picked;
    document.getElementById("messageBoxLabel").textContent = "🎬 Filmy Meme Dialogue";
    document.getElementById("generatedMessage").textContent = picked;
    showToast("Filmy Dialogue Loaded! 🎬");
});

document.getElementById("dostiTaxBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const d = currentReminder.debt;
    const amt = EMOJI.rupee + Number(d.amount).toLocaleString("en-IN");
    const msg = "📈 DOSTI INFLATION ALERT: Your pending split is " + amt + " + 1 Crispy Samosa Late Fee! Settle before evening or inflation goes up to 1 Cold Coffee! ☕😂";
    currentReminder.message = msg;
    document.getElementById("messageBoxLabel").textContent = "📈 Meme Inflation (+1 Samosa Penalty)";
    document.getElementById("generatedMessage").textContent = msg;
    showToast("+1 Samosa Tax Added to Message! 📈");
});

/* =========================
   13. 9:16 INSTAGRAM STORY WRAPPED POSTER GENERATOR
========================= */
document.getElementById("storyWrappedBtn").addEventListener("click", function () {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");

    const t = THEMES[appTheme] || THEMES.purple;
    const grad = ctx.createLinearGradient(0, 0, 720, 1280);
    grad.addColorStop(0, "#050508");
    grad.addColorStop(0.5, t.s2);
    grad.addColorStop(1, "#030305");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    ctx.fillStyle = t.primary;
    ctx.font = "900 28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ PINGZY STUDIO WRAPPED", 360, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 54px Arial Black, sans-serif";
    ctx.fillText("GROUP SPLIT REPORT", 360, 190);

    let totalPend = 0;
    let totalSet = 0;
    let vipFriend = "None Yet";
    let ghostFriend = "None Yet";
    let maxPings = 0;

    debts.forEach(function (d) {
        if (d.paid) {
            totalSet += Number(d.originalAmount || d.amount);
            if (vipFriend === "None Yet") vipFriend = d.person;
        } else if (d.direction !== "iowe") {
            totalPend += Number(d.amount);
            if ((d.remindCount || 0) >= maxPings) {
                maxPings = d.remindCount || 0;
                ghostFriend = d.person;
            }
        }
    });

    function drawStatCard(y, label, val, color) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(70, y, 580, 175);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(70, y, 580, 175);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "800 22px Arial, sans-serif";
        ctx.fillText(label, 360, y + 58);

        ctx.fillStyle = color;
        ctx.font = "900 48px Arial Black, sans-serif";
        ctx.fillText(val, 360, y + 128);
    }

    drawStatCard(270, "💸 TOTAL PENDING TO COLLECT", "₹" + totalPend.toLocaleString("en-IN"), "#facc15");
    drawStatCard(485, "🎉 TOTAL SETTLED BY FRIENDS", "₹" + totalSet.toLocaleString("en-IN"), "#4ade80");
    drawStatCard(700, "💎 CERTIFIED VIP LEGEND", vipFriend.toUpperCase(), "#38bdf8");
    drawStatCard(915, "👻 MOST PINGED (MALLYA LITE)", ghostFriend.toUpperCase() + (maxPings ? " (" + maxPings + "x)" : ""), "#f87171");

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "800 24px Arial, sans-serif";
    ctx.fillText("Track splits & send meme pings on Pingzy ⚡", 360, 1190);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "pingzy-story-wrapped.png";
    link.click();
    fireConfetti();
    showToast("9:16 Story Poster Downloaded! Share on Insta/WhatsApp 📊🔥");
});

/* =========================
   14. GROUP CALCULATOR & BILL ROULETTE
========================= */
document.getElementById("openSplitCalcBtn").addEventListener("click", function () {
    document.getElementById("rouletteResultBox").style.display = "none";
    splitCalcModal.classList.add("show");
});
document.getElementById("closeSplitCalcBtn").addEventListener("click", function () {
    splitCalcModal.classList.remove("show");
});

document.querySelectorAll(".vibe[data-calcvibe]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".vibe[data-calcvibe]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        calcSelectedVibe = btn.dataset.calcvibe;
    });
});

document.getElementById("spinRouletteBtn").addEventListener("click", function () {
    const namesRaw = document.getElementById("calcNames").value.trim();
    if (!namesRaw) return showToast("Enter friends names first!");
    const namesList = namesRaw.split(",").map(function (n) { return n.trim(); }).filter(Boolean);
    if (namesList.length < 2) return showToast("Add at least 2 names for Roulette!");

    const box = document.getElementById("rouletteResultBox");
    const winEl = document.getElementById("rouletteWinnerName");
    const subEl = document.getElementById("rouletteSubText");
    box.style.display = "block";

    let spins = 0;
    const interval = setInterval(function () {
        winEl.textContent = EMOJI.dice + " " + namesList[spins % namesList.length].toUpperCase();
        spins++;
        if (spins >= 16) {
            clearInterval(interval);
            const chosen = namesList[Math.floor(Math.random() * namesList.length)].toUpperCase();
            winEl.textContent = EMOJI.trophy + " " + chosen + " " + EMOJI.trophy;
            const amt = document.getElementById("calcTotalAmt").value;
            subEl.textContent = amt ? "is sponsoring the ₹" + amt + " bill today! 🎉" : "is sponsoring today's treat! 🎉";
            fireConfetti();
        }
    }, 85);
});

function buildCalcMemeMessage(name, share, eventName, vibe) {
    const R = EMOJI.rupee;
    const ev = eventName ? " (" + eventName + ")" : "";
    if (vibe === "funny") return "Bro " + name + ", " + R + share + ev + " ka kya scene hai? " + EMOJI.laugh + " Jaldi ping back kar dena!";
    if (vibe === "savage") return name + " bhai, " + R + share + ev + " ka split time khatam! Aaj settle kar do " + EMOJI.bolt;
    return "Hey " + name + "! " + R + share + ev + " ka group share bana hai " + EMOJI.heart + " Free hoke settle kar dena!";
}

document.getElementById("calculateSplitBtn").addEventListener("click", function () {
    const totalAmt = Number(document.getElementById("calcTotalAmt").value);
    const eventReason = document.getElementById("calcReason").value.trim() || "Group Split";
    const namesRaw = document.getElementById("calcNames").value.trim();

    if (!totalAmt || totalAmt <= 0) return showToast("Enter total bill amount!");
    if (!namesRaw) return showToast("Enter friends names!");

    const namesList = namesRaw.split(",").map(function (n) { return n.trim(); }).filter(Boolean);
    if (namesList.length === 0) return;

    const share = Math.round((totalAmt / namesList.length) * 100) / 100;
    lastCalculatedSplits = [];

    document.getElementById("splitSummaryBanner").textContent =
        EMOJI.bolt + " " + eventReason + ": " + EMOJI.rupee + totalAmt + " ÷ " + namesList.length + " = " + EMOJI.rupee + share + " each";

    let summaryLines = [EMOJI.bolt + " *Pingzy Group Split — " + eventReason + "*", "Total Bill: " + EMOJI.rupee + totalAmt + " (" + namesList.length + " people)", "Per Person: *" + EMOJI.rupee + share + "*\n"];
    const listEl = document.getElementById("splitResultsList");
    listEl.innerHTML = "";

    namesList.forEach(function (name) {
        const isSelf = /^(me|main|mai|myself|i)$/i.test(name);
        const memeText = buildCalcMemeMessage(name, share, eventReason, calcSelectedVibe);
        summaryLines.push("• " + name + ": " + EMOJI.rupee + share + (isSelf ? " (Paid)" : " (Pending)"));

        if (!isSelf) {
            lastCalculatedSplits.push({ name: name, amount: share, reason: eventReason, vibe: calcSelectedVibe });
        }

        const itemCard = document.createElement("div");
        itemCard.className = "split-item-card";
        itemCard.innerHTML =
            "<div class='split-item-head'><strong>" + name + (isSelf ? " (You)" : "") + "</strong><span style='color:#facc15;font-weight:800;'>" + EMOJI.rupee + share + "</span></div>" +
            "<p class='split-item-msg'>" + (isSelf ? "✅ Excluded from pending ledger" : memeText) + "</p>";

        if (!isSelf) {
            const actRow = document.createElement("div");
            actRow.className = "split-item-actions";
            const waBtn = document.createElement("button");
            waBtn.type = "button";
            waBtn.className = "small-button";
            waBtn.style.flex = "1";
            waBtn.style.padding = "7px";
            waBtn.style.fontSize = "11px";
            waBtn.style.background = "#22c55e";
            waBtn.style.color = "#052e16";
            waBtn.textContent = "💬 WhatsApp Ping";
            waBtn.addEventListener("click", function () {
                const waText = EMOJI.bolt + " *Pingzy Group Split*\n\n" + memeText + getUpiPaymentFooter(share);
                window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(waText), "_blank");
            });
            actRow.appendChild(waBtn);
            itemCard.appendChild(actRow);
        }
        listEl.appendChild(itemCard);
    });

    lastGroupSummaryText = summaryLines.join("\n") + getUpiPaymentFooter(share);
    document.getElementById("splitResultsContainer").style.display = "block";
});

document.getElementById("copyGroupSummaryBtn").addEventListener("click", async function () {
    if (!lastGroupSummaryText) return;
    try {
        await navigator.clipboard.writeText(lastGroupSummaryText);
        showToast("Group Table Copied! Paste in WhatsApp " + EMOJI.clipboard);
    } catch (e) {}
});

document.getElementById("addAllSplitsBtn").addEventListener("click", function () {
    if (lastCalculatedSplits.length === 0) return;
    const todayShort = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    lastCalculatedSplits.forEach(function (s) {
        debts.push({
            id: Date.now() + Math.floor(Math.random() * 10000),
            person: s.name,
            phone: "",
            amount: s.amount,
            originalAmount: s.amount,
            partialPaid: 0,
            reason: s.reason,
            items: [{ title: s.reason, amt: s.amount, date: todayShort }],
            direction: "collect",
            dueDate: "",
            dueTime: "",
            vibe: s.vibe,
            paid: false,
            remindCount: 0,
            lastRemindedAt: null
        });
    });
    saveData();
    splitCalcModal.classList.remove("show");
    document.getElementById("splitResultsContainer").style.display = "none";
    switchNavigation("pending");
    showToast("Saved all shares to ledger! " + EMOJI.party);
});

/* =========================
   15. PARTIAL PAYMENTS & EXCUSE BUSTER
========================= */
const partialAmountInput = document.getElementById("partialAmountInput");

function openPartialPayModal(debt) {
    activePartialDebt = debt;
    document.getElementById("partialPayTitle").textContent = "Partial Pay — " + debt.person;
    document.getElementById("partialPaySub").textContent = "Pending: " + EMOJI.rupee + Number(debt.amount).toLocaleString("en-IN");
    partialAmountInput.value = "";
    partialPayModal.classList.add("show");
}

document.getElementById("cancelPartialBtn").addEventListener("click", function () {
    activePartialDebt = null;
    partialPayModal.classList.remove("show");
});

document.getElementById("confirmPartialBtn").addEventListener("click", function () {
    if (!activePartialDebt) return;
    const paidNow = Number(partialAmountInput.value);
    const currentPending = Number(activePartialDebt.amount);
    if (!paidNow || paidNow <= 0) return showToast("Enter valid amount!");

    if (!activePartialDebt.originalAmount) activePartialDebt.originalAmount = currentPending;

    if (paidNow >= currentPending) {
        activePartialDebt.partialPaid = (activePartialDebt.partialPaid || 0) + currentPending;
        activePartialDebt.paid = true;
        saveData();
        renderDebts();
        partialPayModal.classList.remove("show");
        fireConfetti();
        showToast("Full split settled! " + EMOJI.party);
        activePartialDebt = null;
        return;
    }

    activePartialDebt.partialPaid = (activePartialDebt.partialPaid || 0) + paidNow;
    activePartialDebt.amount = Math.round((currentPending - paidNow) * 100) / 100;
    saveData();
    renderDebts();
    partialPayModal.classList.remove("show");
    showToast(EMOJI.rupee + paidNow + " received! Remaining: " + EMOJI.rupee + activePartialDebt.amount);
    activePartialDebt = null;
});

document.querySelectorAll(".excuse-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
        if (!currentReminder) return;
        const type = chip.dataset.excuse;
        const amt = EMOJI.rupee + Number(currentReminder.debt.amount).toLocaleString("en-IN");
        let reply = "";
        if (type === "server") reply = "UPI server down hai? Koi na bhai, dusre bank se bhej de ya mera Pingzy QR scan kar le abhi! 😂⚡";
        if (type === "salary") reply = "Bhai " + amt + " ke chote split ke liye konsi RBI se salary aani hai? Chai budget se abhi निपटा de! 💀";
        if (type === "tomorrow") reply = "Tera 'Kal Pakka' pichle hafte se chal raha hai! Aaj hi " + amt + " settle kar de bhai ⏰";
        if (type === "forgot") reply = "Bhool gaya tha? Chalo ab yaad aa gaya na, toh agle 10 second me " + amt + " ping back kar de! 😂";

        currentReminder.message = reply;
        document.getElementById("messageBoxLabel").textContent = "🛡️ Excuse Buster Counter-Reply Ready!";
        document.getElementById("generatedMessage").textContent = reply;
        showToast("Counter-Roast Loaded! 🔥");
    });
});

/* =========================
   16. REMINDER & ITEMIZED STATEMENT GENERATOR
========================= */
function getItemizedPassbookText(debt) {
    if (!debt.items || debt.items.length <= 1) return "";
    let lines = ["\n\n🧾 *Itemized Split Passbook:*"];
    debt.items.forEach(function (it) {
        const sign = it.amt < 0 ? "-₹" + Math.abs(it.amt) : "₹" + it.amt;
        lines.push("• " + (it.date ? it.date + ": " : "") + it.title + " (" + sign + ")");
    });
    return lines.join("\n");
}

function updateReminderHistoryUI(debt) {
    const pill = document.getElementById("reminderHistoryInfo");
    const escBox = document.getElementById("escalationBox");
    const count = debt.remindCount || 0;
    pill.textContent = count === 0 ? EMOJI.Sparkles + " Ready to send first ping" : EMOJI.bell + " Pinged " + count + "x • Last: " + (debt.lastRemindedAt || "");
    escBox.style.display = count >= 3 && debt.vibe !== "savage" ? "flex" : "none";
}

document.getElementById("escalateSavageBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    currentReminder.debt.vibe = "savage";
    saveData();
    renderDebts();
    generateMessage(currentReminder.debt);
    showToast("Switched to Strict Tone! " + EMOJI.bolt);
});

function logReminderSent(debt) {
    debt.remindCount = (debt.remindCount || 0) + 1;
    debt.lastRemindedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    saveData();
    renderDebts();
    updateReminderHistoryUI(debt);
}

function generateMessage(debt) {
    const amount = Number(debt.amount).toLocaleString("en-IN");
    const R = EMOJI.rupee;
    let messages = [];

    document.getElementById("messageBoxLabel").textContent = "Generated Ping Message";

    if (debt.vibe === "filmy") {
        messages = [
            "🎬 '25 din me paisa double nahi chahiye bhai, mera " + R + amount + " hi wapas bhej de!' 😂⚡",
            "🦈 Shark Tank Alert: 'Is " + R + amount + " ke split se meri equity hil gayi hai, jaldi UPI karo!' 😭"
        ];
    } else if (debt.vibe === "funny") {
        messages = [
            "Bro, " + R + amount + " wale split ka kya scene hai? " + EMOJI.laugh + " Free hoke ping back kar dena.",
            R + amount + " ne tumhare wallet me permanent residency le li kya? " + EMOJI.skull
        ];
    } else if (debt.vibe === "soft") {
        messages = [
            "Hey! Bas " + R + amount + " ka chota sa reminder " + EMOJI.heart + " Jab convenient ho, settle kar dena.",
            "Hi! " + R + amount + " wala split pending tha " + EMOJI.hands + " Free hoke clear kar dena."
        ];
    } else if (debt.vibe === "savage") {
        messages = [
            R + amount + " ka split time khatam ho chuka hai. Aaj settle kar dena bhai " + EMOJI.bolt,
            "Bhai " + R + amount + " ka hisaab kaafi din se pending hai, jaldi clear kar do."
        ];
    } else {
        messages = ["Split reminder: " + R + amount + " remains pending. Kindly settle at your convenience."];
    }

    currentReminder = { debt: debt, message: messages[Math.floor(Math.random() * messages.length)] };
    document.getElementById("reminderRecipient").textContent = debt.person;
    document.getElementById("reminderPhoneDisplay").textContent = debt.phone ? EMOJI.phone + " +91 " + debt.phone : "";
    document.getElementById("reminderAmount").textContent = R + amount;
    document.getElementById("generatedMessage").textContent = currentReminder.message;

    updateReminderHistoryUI(debt);
    stickerVariantIndex++;
    updateStickerPreview(debt);
}

document.getElementById("newReplyBtn").addEventListener("click", function () {
    if (currentReminder) generateMessage(currentReminder.debt);
});

document.getElementById("smsBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const debt = currentReminder.debt;
    logReminderSent(debt);
    const upiNote = userUpiId ? "\nUPI ID: " + userUpiId : "";
    const text = "[PINGZY SPLIT]\nHi " + makeSmsSafeText(debt.person) + ", Rs. " + debt.amount + " is pending.\n\n" + makeSmsSafeText(currentReminder.message) + upiNote;
    const cleanPhone = debt.phone ? "+91" + debt.phone : "";
    const sep = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
    window.location.href = "sms:" + cleanPhone + sep + "body=" + encodeURIComponent(text);
});

document.getElementById("whatsappBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    const debt = currentReminder.debt;
    logReminderSent(debt);
    const text =
        EMOJI.bolt + " *Pingzy Split Notice*\n\n" +
        "Hi " + debt.person + ", your net balance of *" + EMOJI.rupee + Number(debt.amount).toLocaleString("en-IN") + "* is pending.\n\n" +
        currentReminder.message +
        getItemizedPassbookText(debt) +
        getUpiPaymentFooter(debt.amount);

    const cleanPhone = debt.phone ? "91" + debt.phone : "";
    const url = cleanPhone
        ? "https://api.whatsapp.com/send?phone=" + cleanPhone + "&text=" + encodeURIComponent(text)
        : "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
});

document.getElementById("copyBtn").addEventListener("click", async function () {
    if (!currentReminder) return;
    const debt = currentReminder.debt;
    logReminderSent(debt);
    const text = EMOJI.bolt + " Pingzy: " + debt.person + ", " + EMOJI.rupee + debt.amount + " is pending.\n\n" + currentReminder.message + getItemizedPassbookText(debt) + getUpiPaymentFooter(debt.amount);
    try {
        await navigator.clipboard.writeText(text);
        showToast("Copied with Passbook! " + EMOJI.clipboard);
    } catch (e) {}
});

/* =========================
   17. VISUAL CARD CANVAS ENGINE
========================= */
document.querySelectorAll(".style-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
        document.querySelectorAll(".style-chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        currentStickerStyle = chip.dataset.style;
        if (currentReminder) updateStickerPreview(currentReminder.debt);
    });
});

document.getElementById("stickerPreviewImg").addEventListener("click", function () {
    if (!currentReminder) return;
    stickerVariantIndex++;
    updateStickerPreview(currentReminder.debt);
    showToast("Card remixed! " + EMOJI.palette);
});

customStickerInput.addEventListener("input", function () {
    customStickerText = customStickerInput.value.trim();
    if (currentReminder) updateStickerPreview(currentReminder.debt);
});

function drawPillShape(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function renderStickerCanvas(debt) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const amount = EMOJI.rupee + Number(debt.amount).toLocaleString("en-IN");
    let name = String(debt.person || "Friend").toUpperCase().slice(0, 15);
    const activeThemeObj = THEMES[appTheme] || THEMES.purple;

    const packs = {
        funny: [{ main: "SPLIT PING", emoji: EMOJI.laugh, sub: "SETTLE UP BRO!", color: "#facc15", pill: activeThemeObj.pill }],
        filmy: [{ main: "25 DIN ME", emoji: EMOJI.clapper, sub: "PAISA WAPAS DE!", color: "#fde047", pill: "#dc2626" }],
        soft: [{ main: "GENTLE PING", emoji: EMOJI.heart, sub: "WHENEVER FREE!", color: "#f472b6", pill: activeThemeObj.pill }],
        savage: [{ main: "SPLIT TIME", emoji: EMOJI.clock, sub: "EXPIRED!", color: "#f87171", pill: "#b91c1c" }],
        professional: [{ main: "SHARED SPLIT", emoji: EMOJI.briefcase, sub: "PENDING", color: "#60a5fa", pill: activeThemeObj.pill }]
    };

    const activeItem = (packs[debt.vibe] || packs.soft)[0];

    function drawStickerText(text, x, y, fontSize, fillColor, angleDeg) {
        ctx.save();
        ctx.translate(x, y);
        if (angleDeg) ctx.rotate((angleDeg * Math.PI) / 180);
        ctx.font = "900 " + fontSize + "px Arial Black, Impact, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 18;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(text, 0, 0);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#09090b";
        ctx.strokeText(text, 0, 0);
        ctx.fillStyle = fillColor;
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    const tilt = currentStickerStyle === "tilted" ? -5 : 0;
    drawStickerText(name, 256, 74, 42, "#ffffff", 0);
    const topLine = customStickerText ? customStickerText.toUpperCase() : activeItem.main;
    drawStickerText(topLine, 256, 155, topLine.length > 14 ? 32 : 44, activeItem.color, tilt);

    ctx.font = "76px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(activeItem.emoji, 256, 242);

    drawStickerText(activeItem.sub, 256, 325, 38, "#ffffff", -tilt);

    drawPillShape(ctx, 106, 376, 300, 70, 35);
    ctx.fillStyle = activeItem.pill;
    ctx.fill();

    ctx.font = "900 34px Arial Black, sans-serif";
    ctx.fillStyle = "#fde047";
    ctx.fillText(amount, 256, 413);
    drawStickerText("PINGZY STUDIO " + EMOJI.bolt, 256, 478, 18, "#e4e4e7", 0);

    return canvas;
}

function updateStickerPreview(debt) {
    const img = document.getElementById("stickerPreviewImg");
    if (img) img.src = renderStickerCanvas(debt).toDataURL("image/png");
}

document.getElementById("stickerBtn").addEventListener("click", function () {
    if (!currentReminder) return;
    logReminderSent(currentReminder.debt);
    const link = document.createElement("a");
    link.href = renderStickerCanvas(currentReminder.debt).toDataURL("image/png");
    link.download = "pingzy-" + currentReminder.debt.person + ".png";
    link.click();
    showToast("Card PNG Downloaded! " + EMOJI.bolt);
});

document.getElementById("closeReminderBtn").addEventListener("click", function () {
    reminderModal.classList.remove("show");
});

/* =========================
   18. RENDER LEDGER WITH MINI-PASSBOOK & TRUST BADGES
========================= */
function saveData() {
    localStorage.setItem("pingzyDebts", JSON.stringify(debts));
}

function getVibeBadgeText(vibe) {
    if (vibe === "filmy") return EMOJI.clapper + " Filmy";
    if (vibe === "funny") return EMOJI.laugh + " Funny";
    if (vibe === "soft") return EMOJI.slightSmile + " Polite";
    if (vibe === "savage") return EMOJI.devil + " Strict";
    return EMOJI.briefcase + " Formal";
}

function getTrustBadgeInfo(debt) {
    const count = debt.remindCount || 0;
    if (count <= 1) return { text: EMOJI.gem + " VIP Dost", className: "badge badge-trust-vip" };
    if (count === 2) return { text: EMOJI.turtle + " Slow Payer", className: "badge badge-trust-slow" };
    return { text: EMOJI.ghost + " Mallya Lite", className: "badge badge-trust-ghost" };
}

function sendNoDuesCertificate(debt) {
    const amt = EMOJI.rupee + Number(debt.originalAmount || debt.amount).toLocaleString("en-IN");
    const certText =
        EMOJI.trophy + " *OFFICIAL PINGZY NO-DUES CERTIFICATE* " + EMOJI.trophy + "\n\n" +
        "This is to certify that *" + debt.person + "* has officially settled *" + amt + "* and their Friend Credit Score is restored to *100% VIP Legend!* " + EMOJI.gem + EMOJI.party + "\n\n_⚡ Verified by Pingzy Studio_";
    const cleanPhone = debt.phone ? "91" + debt.phone : "";
    const url = cleanPhone
        ? "https://api.whatsapp.com/send?phone=" + cleanPhone + "&text=" + encodeURIComponent(certText)
        : "https://api.whatsapp.com/send?text=" + encodeURIComponent(certText);
    window.open(url, "_blank");
}

function renderDebts() {
    const list = document.getElementById("debtsList");
    const empty = document.getElementById("emptyState");

    const collectList = debts.filter(function (i) { return !i.paid && (i.direction || "collect") === "collect"; });
    const iOweList = debts.filter(function (i) { return !i.paid && i.direction === "iowe"; });
    const paidList = debts.filter(function (i) { return i.paid; });

    let totalCollect = 0;
    collectList.forEach(function (i) { totalCollect += Number(i.amount); });

    let totalIOwe = 0;
    iOweList.forEach(function (i) { totalIOwe += Number(i.amount); });

    let totalRec = 0;
    debts.forEach(function (i) {
        if (i.paid) totalRec += Number(i.originalAmount || i.amount);
        else if (i.partialPaid) totalRec += Number(i.partialPaid);
    });

    document.getElementById("totalOwed").textContent = EMOJI.rupee + totalCollect.toLocaleString("en-IN");
    document.getElementById("totalIOwe").textContent = EMOJI.rupee + totalIOwe.toLocaleString("en-IN");
    document.getElementById("totalPeople").textContent = collectList.length + iOweList.length;
    document.getElementById("totalRecovered").textContent = EMOJI.rupee + totalRec.toLocaleString("en-IN");

    document.getElementById("pendingCount").textContent = collectList.length;
    document.getElementById("iOweCount").textContent = iOweList.length;
    document.getElementById("paidCount").textContent = paidList.length + " Settled";

    list.querySelectorAll(".debt-card").forEach(function (c) { c.remove(); });

    let sourceList = collectList;
    if (activeTab === "iowe") sourceList = iOweList;
    if (activeTab === "paid") sourceList = paidList;

    let currentItems = sourceList.slice();

    if (searchQuery) {
        currentItems = currentItems.filter(function (d) {
            return d.person.toLowerCase().includes(searchQuery) || (d.reason && d.reason.toLowerCase().includes(searchQuery));
        });
    }

    if (sortByAmount) {
        currentItems.sort(function (a, b) { return Number(b.amount) - Number(a.amount); });
    } else {
        currentItems.sort(function (a, b) { return b.id - a.id; });
    }

    if (currentItems.length === 0) {
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    currentItems.forEach(function (debt) {
        const isIOwe = debt.direction === "iowe";
        const card = document.createElement("div");
        card.className = debt.paid ? "debt-card paid-card" : (isIOwe ? "debt-card iowe-card" : "debt-card");

        const initial = (debt.person || "P").trim().charAt(0).toUpperCase();
        const top = document.createElement("div");
        top.className = "debt-top";
        top.innerHTML =
            "<div class='person-wrap'>" +
                "<div class='avatar-circle'>" + initial + "</div>" +
                "<div>" +
                    "<div class='person'>" + debt.person + (debt.phone ? " " + EMOJI.phone : "") + "</div>" +
                    "<div class='debt-info'>" + (debt.reason || "Shared split") + "</div>" +
                "</div>" +
            "</div>" +
            "<div class='debt-amount " + (isIOwe ? "iowe-amount" : "") + "'>" + EMOJI.rupee + Number(debt.amount).toLocaleString("en-IN") + "</div>";

        card.appendChild(top);

        // Mini-Passbook Itemized Breakdown (if 2+ items)
        if (debt.items && debt.items.length > 1) {
            const pBox = document.createElement("div");
            pBox.className = "passbook-box";
            debt.items.slice(-3).forEach(function (it) {
                const row = document.createElement("div");
                row.className = "passbook-row";
                const sign = it.amt < 0 ? "-₹" + Math.abs(it.amt) : "₹" + it.amt;
                row.innerHTML = "<span>• " + it.title + "</span><strong>" + sign + "</strong>";
                pBox.appendChild(row);
            });
            card.appendChild(pBox);
        }

        if (debt.partialPaid && debt.originalAmount && !debt.paid) {
            const pct = Math.min(95, Math.round((debt.partialPaid / debt.originalAmount) * 100));
            const prog = document.createElement("div");
            prog.className = "progress-track";
            prog.innerHTML = "<div class='progress-fill' style='width:" + pct + "%'></div>";
            card.appendChild(prog);
        }

        const badgeRow = document.createElement("div");
        badgeRow.className = "badge-row";

        const vibeBadge = document.createElement("span");
        vibeBadge.className = "badge badge-vibe";
        vibeBadge.textContent = isIOwe ? "📤 I Owe" : getVibeBadgeText(debt.vibe);
        badgeRow.appendChild(vibeBadge);

        if (!isIOwe) {
            const trustInfo = getTrustBadgeInfo(debt);
            const trustBadge = document.createElement("span");
            trustBadge.className = trustInfo.className;
            trustBadge.textContent = debt.paid ? EMOJI.trophy + " Certified Legend" : trustInfo.text;
            badgeRow.appendChild(trustBadge);
        }

        if (debt.partialPaid && !debt.paid) {
            const partB = document.createElement("span");
            partB.className = "badge badge-paid";
            partB.textContent = EMOJI.moneyWing + " " + EMOJI.rupee + debt.partialPaid + " Paid";
            badgeRow.appendChild(partB);
        }

        if (debt.remindCount > 0) {
            const histB = document.createElement("span");
            histB.className = "badge badge-history";
            histB.textContent = EMOJI.bell + " Pinged " + debt.remindCount + "x";
            badgeRow.appendChild(histB);
        }

        card.appendChild(badgeRow);

        const actions = document.createElement("div");
        actions.className = "debt-actions";

        if (!debt.paid) {
            if (!isIOwe) {
                const remind = document.createElement("button");
                remind.className = "remind-button";
                remind.textContent = EMOJI.bolt + " Ping";
                remind.addEventListener("click", function () {
                    customStickerInput.value = "";
                    customStickerText = "";
                    document.getElementById("qrCodeContainer").style.display = "none";
                    generateMessage(debt);
                    reminderModal.classList.add("show");
                });
                actions.appendChild(remind);
            }

            const addMoreBtn = document.createElement("button");
            addMoreBtn.className = "add-more-btn";
            addMoreBtn.textContent = "➕ +₹";
            addMoreBtn.title = "Add another expense to this friend's passbook";
            addMoreBtn.addEventListener("click", function () { openAddMoreModal(debt); });

            const partBtn = document.createElement("button");
            partBtn.className = "part-pay-btn";
            partBtn.textContent = EMOJI.moneyWing + " Part";
            partBtn.addEventListener("click", function () { openPartialPayModal(debt); });

            const paid = document.createElement("button");
            paid.textContent = EMOJI.check + " Paid";
            paid.addEventListener("click", function () {
                debt.paid = true;
                saveData();
                renderDebts();
                fireConfetti();
                showToast("Settled! " + EMOJI.trophy);
            });

            const del = document.createElement("button");
            del.className = "delete-icon-btn";
            del.textContent = EMOJI.trash;
            del.addEventListener("click", function () { openDeleteConfirmModal(debt); });

            actions.append(addMoreBtn, partBtn, paid, del);
        } else {
            const certBtn = document.createElement("button");
            certBtn.className = "cert-button";
            certBtn.textContent = EMOJI.trophy + " Send Certificate";
            certBtn.addEventListener("click", function () { sendNoDuesCertificate(debt); });

            const undoPaid = document.createElement("button");
            undoPaid.textContent = EMOJI.backArrow + " Reopen";
            undoPaid.addEventListener("click", function () {
                debt.paid = false;
                saveData();
                renderDebts();
            });

            const del = document.createElement("button");
            del.className = "delete-icon-btn";
            del.textContent = EMOJI.trash;
            del.addEventListener("click", function () { openDeleteConfirmModal(debt); });

            actions.append(certBtn, undoPaid, del);
        }

        card.appendChild(actions);
        list.appendChild(card);
    });
}

/* =========================
   19. SEARCH, SORT, BACKUP, DELETE & INIT
========================= */
if (searchInput) {
    searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        renderDebts();
    });
}

if (sortToggleBtn) {
    sortToggleBtn.addEventListener("click", function () {
        sortByAmount = !sortByAmount;
        sortToggleBtn.textContent = sortByAmount ? EMOJI.moneyWing + " Highest ₹" : EMOJI.fire + " Recent";
        renderDebts();
    });
}

document.getElementById("exportDataBtn").addEventListener("click", function () {
    if (!debts || debts.length === 0) return showToast("No records to backup!");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(debts, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "pingzy-backup-" + new Date().toISOString().split("T")[0] + ".json");
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Backup downloaded! " + EMOJI.folder);
});

document.getElementById("importFileBox").addEventListener("change", function (event) {
    if (!event.target.files || !event.target.files[0]) return;
    const reader = new FileReader();
    reader.readAsText(event.target.files[0], "UTF-8");
    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                debts = imported;
                saveData();
                renderDebts();
                showToast("Ledger restored! " + EMOJI.check);
            }
        } catch (err) {
            showToast("Invalid backup file!");
        }
        event.target.value = "";
    };
});

function toggleLang() {
    appLang = appLang === "hinglish" ? "en" : "hinglish";
    localStorage.setItem("pingzyLang", appLang);
    langToggleBtn.textContent = appLang === "en" ? EMOJI.globe + " English" : EMOJI.india + " Hinglish";
    if (quickLangBtn) quickLangBtn.textContent = appLang === "en" ? EMOJI.globe + " EN" : EMOJI.india + " HI";
    renderDebts();
    showToast(appLang === "en" ? "English Mode" : "Hinglish Mode");
}

langToggleBtn.addEventListener("click", toggleLang);
if (quickLangBtn) quickLangBtn.addEventListener("click", toggleLang);

function openDeleteConfirmModal(debt) {
    pendingDeleteDebt = debt;
    document.getElementById("deleteConfirmText").innerHTML = "Remove <b>" + debt.person + " (" + EMOJI.rupee + debt.amount + ")</b>?";
    deleteConfirmModal.classList.add("show");
}

document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
    pendingDeleteDebt = null;
    deleteConfirmModal.classList.remove("show");
});

document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
    if (!pendingDeleteDebt) return;
    lastDeletedDebt = pendingDeleteDebt;
    debts = debts.filter(function (i) { return i.id !== pendingDeleteDebt.id; });
    pendingDeleteDebt = null;
    deleteConfirmModal.classList.remove("show");
    saveData();
    renderDebts();
    showToast("Deleted " + EMOJI.trash, true);
});

document.getElementById("toastUndoBtn").addEventListener("click", function () {
    if (!lastDeletedDebt) return;
    debts.push(lastDeletedDebt);
    lastDeletedDebt = null;
    saveData();
    renderDebts();
    showToast("Restored! " + EMOJI.check);
});

function showToast(message, showUndo) {
    const toast = document.getElementById("toast");
    document.getElementById("toastText").textContent = message;
    document.getElementById("toastUndoBtn").style.display = showUndo ? "inline-block" : "none";
    toast.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () { toast.classList.remove("show"); }, showUndo ? 7000 : 2400);
}

[addModal, reminderModal, deleteConfirmModal, partialPayModal, addMoreModal, splitCalcModal].forEach(function (m) {
    if (!m) return;
    m.addEventListener("click", function (e) {
        if (e.target === m) m.classList.remove("show");
    });
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
}

/* START */
updateUpiUI();
applyTheme(appTheme);
renderDebts();
/* =========================
   20. FINAL QA POLISH PATCH (ALERTS + DUE BADGE + OFFLINE QR)
========================= */
// 1. Activate Studio Notification Toggle Button
function syncNotifUI() {
    if (!notifBtn) return;
    if (alertsEnabled && "Notification" in window && Notification.permission === "granted") {
        notifBtn.textContent = EMOJI.bell + " ON";
    } else {
        notifBtn.textContent = EMOJI.bellOff + " OFF";
    }
}

if (notifBtn) {
    syncNotifUI();
    notifBtn.addEventListener("click", function () {
        if (!("Notification" in window)) {
            return showToast("Browser notifications not supported");
        }
        if (alertsEnabled) {
            alertsEnabled = false;
            localStorage.setItem("pingzyAlerts", "off");
            syncNotifUI();
            return showToast("Daily Alerts Turned OFF " + EMOJI.bellOff);
        }
        Notification.requestPermission().then(function (perm) {
            if (perm === "granted") {
                alertsEnabled = true;
                localStorage.setItem("pingzyAlerts", "on");
                syncNotifUI();
                showToast("Daily Alerts Enabled! " + EMOJI.bell);
            } else {
                showToast("Notification permission denied");
            }
        });
    });
}

// 2. Offline Fallback for UPI QR Image
const qrImageEl = document.getElementById("upiQrImg");
if (qrImageEl) {
    qrImageEl.addEventListener("error", function () {
        document.getElementById("qrCodeContainer").style.display = "none";
        showToast("Connect to internet once to load QR, or use WhatsApp UPI Link! ⚡");
    });
}

// 3. Inject Due Date Badges onto Cards Automatically
const baseRenderDebts = renderDebts;
renderDebts = function () {
    baseRenderDebts();
    const activeList = debts.filter(function (i) {
        if (activeTab === "paid") return i.paid;
        if (activeTab === "iowe") return !i.paid && i.direction === "iowe";
        return !i.paid && (i.direction || "collect") === "collect";
    });
    const cards = document.querySelectorAll("#debtsList .debt-card");
    cards.forEach(function (card, idx) {
        const d = activeList[idx];
        if (!d || !d.dueDate || d.paid) return;
        const badgeRow = card.querySelector(".badge-row");
        if (badgeRow) {
            const dueSpan = document.createElement("span");
            dueSpan.className = "badge";
            dueSpan.textContent = "📅 Due: " + d.dueDate + (d.dueTime ? " " + d.dueTime : "");
            badgeRow.appendChild(dueSpan);
        }
    });
};
renderDebts();
/* =========================
   21. HERO VAULT DYNAMIC SYNC FIX (TO COLLECT <-> I OWE)
========================= */
const prevRenderForVault = renderDebts;
renderDebts = function () {
    prevRenderForVault();

    const collectList = debts.filter(function (i) { return !i.paid && (i.direction || "collect") === "collect"; });
    const iOweList = debts.filter(function (i) { return !i.paid && i.direction === "iowe"; });

    let sumCollect = 0;
    collectList.forEach(function (i) { sumCollect += Number(i.amount); });

    let sumIOwe = 0;
    iOweList.forEach(function (i) { sumIOwe += Number(i.amount); });

    const vaultMainLabel = document.getElementById("vaultMainLabel");
    const totalOwedEl = document.getElementById("totalOwed");
    const totalIOweEl = document.getElementById("totalIOwe");
    const firstStatLabel = totalIOweEl ? totalIOweEl.parentElement.querySelector("span") : null;
    const currentViewTitle = document.getElementById("currentViewTitle");

    if (activeTab === "iowe") {
        // When on "I Owe" tab -> Hero shows I Owe, small stat shows To Collect
        if (vaultMainLabel) {
            vaultMainLabel.textContent = appLang === "en" ? "TOTAL I OWE (TO PAY) 📤" : "MUJHE DENA HAI (I OWE) 📤";
            vaultMainLabel.style.color = "#fca5a5";
        }
        if (totalOwedEl) {
            totalOwedEl.textContent = EMOJI.rupee + sumIOwe.toLocaleString("en-IN");
            totalOwedEl.style.color = "#f87171";
        }
        if (firstStatLabel) firstStatLabel.textContent = "To Collect 📥";
        if (totalIOweEl) {
            totalIOweEl.textContent = EMOJI.rupee + sumCollect.toLocaleString("en-IN");
            totalIOweEl.style.color = "#facc15";
        }
        if (currentViewTitle) {
            currentViewTitle.textContent = appLang === "en" ? "I Owe (To Pay Back)" : "Mujhe Dena Hai (I Owe)";
        }
    } else {
        // When on "To Collect" or "Settled" tab -> Hero shows To Collect, small stat shows I Owe
        if (vaultMainLabel) {
            vaultMainLabel.textContent = appLang === "en" ? "TOTAL TO COLLECT 📥" : "TOTAL LENA HAI (TO COLLECT) 📥";
            vaultMainLabel.style.color = "#94a3b8";
        }
        if (totalOwedEl) {
            totalOwedEl.textContent = EMOJI.rupee + sumCollect.toLocaleString("en-IN");
            totalOwedEl.style.color = "#ffffff";
        }
        if (firstStatLabel) firstStatLabel.textContent = "I Owe 📤";
        if (totalIOweEl) {
            totalIOweEl.textContent = EMOJI.rupee + sumIOwe.toLocaleString("en-IN");
            totalIOweEl.style.color = "#f87171";
        }
        if (currentViewTitle && activeTab === "pending") {
            currentViewTitle.textContent = appLang === "en" ? "To Collect (Pending)" : "To Collect (Lena Hai)";
        }
    }
};

// Trigger immediately so UI syncs right now
renderDebts();
/* =========================
   22. 100% A-TO-Z MASTER TRANSLATION ENGINE (EVERY SCREEN & MODAL)
========================= */
function applyMasterTranslation() {
    const isEn = appLang === "en";

    // 1. Header & Tagline
    if (langToggleBtn) langToggleBtn.textContent = isEn ? EMOJI.globe + " English" : EMOJI.india + " Hinglish";
    if (quickLangBtn) quickLangBtn.textContent = isEn ? EMOJI.globe + " EN" : EMOJI.india + " HI";

    const tagline = document.getElementById("appTagline");
    if (tagline) {
        tagline.textContent = isEn
            ? "100% Private Vault • Zero Bank Access 🔒"
            : "Hisaab clear rakho, bina awkwardness ke ⚡";
    }

    // 2. Hero Vault Card Small Stats & Story Button
    const storyBtn = document.getElementById("storyWrappedBtn");
    if (storyBtn) storyBtn.textContent = isEn ? "📊 Story Wrapped" : "📊 Hisaab Story";

    const vaultStats = document.querySelectorAll(".vault-stat span");
    if (vaultStats.length >= 3) {
        vaultStats[0].textContent = activeTab === "iowe"
            ? (isEn ? "To Collect 📥" : "Lena Hai 📥")
            : (isEn ? "I Owe 📤" : "Dena Hai 📤");
        vaultStats[1].textContent = isEn ? "Total Settled 🎉" : "Vasool Hua 🎉";
        vaultStats[2].textContent = isEn ? "Active People" : "Kul Dost";
    }

    // 3. Sub-Tabs (To Collect vs I Owe)
    const collectTabBtn = document.querySelector('.sub-tab[data-subtab="pending"]');
    const ioweTabBtn = document.querySelector('.sub-tab[data-subtab="iowe"]');
    const pCount = document.getElementById("pendingCount") ? document.getElementById("pendingCount").textContent : "0";
    const iCount = document.getElementById("iOweCount") ? document.getElementById("iOweCount").textContent : "0";

    if (collectTabBtn) {
        collectTabBtn.innerHTML = (isEn ? "📥 To Collect " : "📥 Lena Hai (Vasooli) ") + '<span id="pendingCount" class="mini-count">' + pCount + "</span>";
    }
    if (ioweTabBtn) {
        ioweTabBtn.innerHTML = (isEn ? "📤 I Owe " : "📤 Mujhe Dena Hai ") + '<span id="iOweCount" class="mini-count">' + iCount + "</span>";
    }

    // 4. Search, Sort & Empty State
    if (searchInput) {
        searchInput.placeholder = isEn ? "Search friend or item..." : "Dost ya kharche ka naam khojo...";
    }
    if (sortToggleBtn) {
        sortToggleBtn.textContent = sortByAmount
            ? (isEn ? "💸 Highest ₹" : "💸 Sabse Zyada ₹")
            : (isEn ? "🔥 Recent" : "🔥 Naye Pehle");
    }

    const emptyTitle = document.getElementById("emptyTitle");
    const emptyDesc = document.getElementById("emptyDesc");
    if (emptyTitle) emptyTitle.textContent = isEn ? "Your ledger is clean" : "Abhi koi hisaab baaki nahi hai!";
    if (emptyDesc) {
        emptyDesc.innerHTML = isEn
            ? "Tap <b>＋</b> below to add a split, or load a sample<br>card to test Meme Pings, Barter & Excuse Buster!"
            : "Niche <b>＋</b> daba kar naya hisaab jodo, ya <b>Demo</b><br>daba kar Meme Pings, Barter aur Bahana Buster dekho!";
    }
    if (firstReminderBtn) firstReminderBtn.textContent = isEn ? "＋ Add First Split" : "＋ Pehla Hisaab Jodo";
    if (loadDemoBtn) loadDemoBtn.textContent = isEn ? "✨ Load 1-Click Demo" : "✨ 1-Click Demo Dekho";

    // 5. Bottom Navigation Dock
    const navPendingLbl = document.querySelector("#navPendingBtn .nav-label");
    const navCalcLbl = document.querySelector("#openSplitCalcBtn .nav-label");
    const navPaidLbl = document.querySelector("#navPaidBtn .nav-label");
    const navStudioLbl = document.querySelector("#navStudioBtn .nav-label");
    if (navPendingLbl) navPendingLbl.textContent = isEn ? "Splits" : "Hisaab";
    if (navCalcLbl) navCalcLbl.textContent = isEn ? "Group Calc" : "Group Split";
    if (navPaidLbl) navPaidLbl.textContent = isEn ? "Settled" : "Chukta";
    if (navStudioLbl) navStudioLbl.textContent = isEn ? "Studio" : "Settings";

    // 6. Add Split Modal Labels & Buttons
    const addModalTitle = document.querySelector("#addModal h2");
    const addModalSub = document.querySelector("#addModal .modal-header p");
    if (addModalTitle) addModalTitle.textContent = isEn ? "New Split Entry" : "Naya Hisaab Jodo";
    if (addModalSub) addModalSub.textContent = isEn ? "Auto cross-cuts if the friend already exists ⚡" : "Dost pehle se hai toh hisaab apne aap plus/minus ho jayega ⚡";

    if (typeCollectBtn) typeCollectBtn.textContent = isEn ? "📥 To Collect (They Owe)" : "📥 Lena Hai (Vasooli)";
    if (typeIOweBtn) typeIOweBtn.textContent = isEn ? "📤 I Owe (I Have to Pay)" : "📤 Mujhe Dena Hai";
    if (personInput) personInput.placeholder = isEn ? "e.g. Rohan" : "Dost ka naam (jaise Rohan)";
    if (phoneInput) phoneInput.placeholder = isEn ? "10-digit mobile number" : "10-digit WhatsApp/Mobile number";
    const reasonEl = document.getElementById("reason");
    if (reasonEl) reasonEl.placeholder = isEn ? "Momos, Dinner split, Goa trip..." : "Kis cheez ke paise? (Momos, Chai, Trip...)";
    const createBtn = document.getElementById("createReminderBtn");
    if (createBtn) createBtn.textContent = isEn ? "Save & Prepare Ping ⚡" : "Save Karo & Meme Ping Banao ⚡";

    // 7. Group Split Calculator & Roulette Modal
    const calcTitle = document.querySelector("#splitCalcModal h2");
    const calcSub = document.querySelector("#splitCalcModal .modal-header p");
    if (calcTitle) calcTitle.textContent = isEn ? "⚡ Group Split & Bill Roulette" : "⚡ Group Hisaab & Bill Roulette";
    if (calcSub) calcSub.textContent = isEn ? "Divide bills equally or spin to see who pays today!" : "Sabme barabar baanto ya wheel ghuma ke dekho aaj kaun party dega!";
    const calcBtn = document.getElementById("calculateSplitBtn");
    const spinBtn = document.getElementById("spinRouletteBtn");
    if (calcBtn) calcBtn.textContent = isEn ? "⚡ Split Equally" : "⚡ Barabar Baanto";
    if (spinBtn) spinBtn.textContent = isEn ? "🎲 Spin Roulette" : "🎲 Wheel Ghumao";

    // 8. Reminder Sheet Viral Buttons & Excuse Buster
    const botBtn = document.getElementById("botModeBtn");
    const barterBtn = document.getElementById("barterModeBtn");
    const filmyBtn = document.getElementById("filmyModeBtn");
    const taxBtn = document.getElementById("dostiTaxBtn");
    if (botBtn) botBtn.textContent = isEn ? "🤖 Blame AI Bot" : "🤖 AI Bot Ka Bahana";
    if (barterBtn) barterBtn.textContent = isEn ? "🍕 Convert to Treat" : "🍕 Momo/Chai Deal";
    if (filmyBtn) filmyBtn.textContent = isEn ? "🎬 Filmy Meme" : "🎬 Filmy Dialogue";
    if (taxBtn) taxBtn.textContent = isEn ? "📈 +Samosa Tax" : "📈 +Samosa Penalty";

    const excuseTitle = document.querySelector(".excuse-title");
    if (excuseTitle) {
        excuseTitle.textContent = isEn
            ? "🛡️ Excuse Buster (Tap what excuse they gave!):"
            : "🛡️ Bahana Buster (Dost ne kya bahana maara? Tap karo!):";
    }

    // 9. Studio View Headings
    const studioHeads = document.querySelectorAll("#studioView .studio-heading");
    if (studioHeads.length >= 4) {
        studioHeads[0].textContent = isEn ? "🎨 OLED Studio Themes" : "🎨 App Ka Rang (OLED Themes)";
        studioHeads[1].textContent = isEn ? "⚡ 1-Tap UPI Link & Live QR" : "⚡ Apna UPI ID & QR Set Karo";
        studioHeads[2].textContent = isEn ? "💾 Data Safety & Backup" : "💾 Hisaab Backup & Restore";
        studioHeads[3].textContent = isEn ? "⚙️ App Preferences" : "⚙️️ Bhasha & Alerts Settings";
    }

    // 10. Re-render Cards & Translate Card Buttons
    renderDebts();
    document.querySelectorAll("#debtsList .debt-card").forEach(function (card) {
        const remindB = card.querySelector(".remind-button");
        const partB = card.querySelector(".part-pay-btn");
        if (remindB) remindB.textContent = isEn ? "⚡ Ping" : "⚡ Vasooli Ping";
        if (partB) partB.textContent = isEn ? "💸 Part" : "💸 Adha Aaya";
    });

    // 11. Translate Active Ping Message if Sheet is Open
    if (currentReminder && reminderModal && reminderModal.classList.contains("show")) {
        generateBilingualMessage(currentReminder.debt);
    }
}

// Upgrade generateMessage so English & Hinglish generate completely distinct messages
function generateBilingualMessage(debt) {
    const amount = Number(debt.amount).toLocaleString("en-IN");
    const R = EMOJI.rupee;
    let messages = [];

    document.getElementById("messageBoxLabel").textContent =
        appLang === "en" ? "Generated Ping Message (English)" : "Taiyar Meme Message (Hinglish)";

    if (appLang === "en") {
        if (debt.vibe === "filmy") {
            messages = [
                "🎬 'I don't need my money doubled in 25 days bro, just send my " + R + amount + " back!' 😂⚡",
                "🦈 Shark Tank Update: 'This pending " + R + amount + " split is hurting my monthly equity, please settle up before I'm Out!' 😭"
            ];
        } else if (debt.vibe === "funny") {
            messages = [
                "Quick Pingzy check-in: What's the status on my " + R + amount + " split? " + EMOJI.laugh + " Send it back when free!",
                "Did my " + R + amount + " apply for permanent residency in your wallet? " + EMOJI.skull
            ];
        } else if (debt.vibe === "soft") {
            messages = [
                "Hey! Just a gentle Pingzy reminder about our " + R + amount + " split " + EMOJI.heart + " Send it whenever convenient!",
                "Hi! Quick follow-up on the " + R + amount + " share " + EMOJI.hands + " No rush, clear it whenever free."
            ];
        } else if (debt.vibe === "savage") {
            messages = [
                "Your interest-free split window for " + R + amount + " has expired. Kindly settle your share today " + EMOJI.bolt,
                "Reminder Alert: " + R + amount + " is still pending from your side. Please clear the split ASAP."
            ];
        } else {
            messages = ["Split reminder: " + R + amount + " remains pending. Kindly settle at your convenience."];
        }
    } else {
        if (debt.vibe === "filmy") {
            messages = [
                "🎬 '25 din me paisa double nahi chahiye babu bhaiya, mera " + R + amount + " hi wapas bhej de!' 😂⚡",
                "🦈 Shark Tank Alert: 'Is " + R + amount + " ke udhaar se meri equity hil gayi hai, jaldi UPI karo!' 😭"
            ];
        } else if (debt.vibe === "funny") {
            messages = [
                "Bro, " + R + amount + " wale split ka kya scene hai? " + EMOJI.laugh + " Free hoke ping back kar dena.",
                R + amount + " ne tumhare wallet me permanent residency le li kya? " + EMOJI.skull
            ];
        } else if (debt.vibe === "soft") {
            messages = [
                "Hey! Bas " + R + amount + " ka chota sa reminder " + EMOJI.heart + " Jab convenient ho, settle kar dena.",
                "Hi! " + R + amount + " wala split pending tha " + EMOJI.hands + " Free hoke clear kar dena."
            ];
        } else if (debt.vibe === "savage") {
            messages = [
                R + amount + " ka split time khatam ho chuka hai. Aaj settle kar dena bhai " + EMOJI.bolt,
                "Bhai " + R + amount + " ka hisaab kaafi din se pending hai, jaldi clear kar do."
            ];
        } else {
            messages = ["Hisaab reminder: " + R + amount + " abhi pending hai. Kripya samay par settle karein."];
        }
    }

    currentReminder = { debt: debt, message: messages[Math.floor(Math.random() * messages.length)] };
    document.getElementById("reminderRecipient").textContent = debt.person;
    document.getElementById("reminderPhoneDisplay").textContent = debt.phone ? EMOJI.phone + " +91 " + debt.phone : "";
    document.getElementById("reminderAmount").textContent = R + amount;
    document.getElementById("generatedMessage").textContent = currentReminder.message;

    updateReminderHistoryUI(debt);
    stickerVariantIndex++;
    updateStickerPreview(debt);
}

// Hook into language buttons & card renders
generateMessage = generateBilingualMessage;

if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function () {
        setTimeout(applyMasterTranslation, 10);
    });
}
if (quickLangBtn) {
    quickLangBtn.addEventListener("click", function () {
        setTimeout(applyMasterTranslation, 10);
    });
}

applyMasterTranslation();
/* =========================
   23. PINGZY STUDIO ANTI-COPY & COPYRIGHT SHIELD
========================= */
// 1. Disable Right-Click Context Menu
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// 2. Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (View Source)
document.addEventListener("keydown", function (e) {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
    ) {
        e.preventDefault();
        showToast("🔒 Protected by Pingzy Studio Copyright");
        return false;
    }
});