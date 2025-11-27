var pausedLoading = false;
var commentNotLoadingCount = 0;
var previousReplyLoadingCount = 0;
var allCommentsLoaded = false;
var defaultWidth = 80;

// Utility
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// changeToMostRecent
function changeToMostRecent() {
    const buttonForSort = document.querySelector(".comments-sort-order-toggle__dropdown button");
    if (document.querySelector(".cbOrderByMostRecent")?.classList.contains("checked")) {
        buttonForSort?.click();
    }
    const timeoutIn1 = getRandomInt(500, 1000);
    setTimeout(function () {
        if (document.querySelector(".cbOrderByMostRecent")?.classList.contains("checked")) {
            const lis = document.querySelectorAll(".comments-sort-order-toggle__content li");
            if (lis.length) lis[lis.length - 1].click();
        }
        const timeoutIn2 = getRandomInt(2000, 3000);
        setTimeout(function () {
            const buttonText = buttonForSort ? (buttonForSort.textContent || "") : "";
            if (buttonText.indexOf('Most recent') !== -1) {
                const timeoutIn3 = getRandomInt(200, 400);
                setTimeout(function () {
                    UIChanges();
                    loadAllComments();
                    loadPreviousReplies();
                }, timeoutIn3);
            } else {
                alert('Most Recent is not Selected');
            }
        }, timeoutIn2);
    }, timeoutIn1);
}

// openPopup
function openPopup() {
    if (document.querySelector(".comments-comment-list__container")) {
        var style = document.createElement("style");
        style.innerHTML = `
            .commentPopupLoaded {
                opacity: 0;
                overflow: hidden;
                height: 100vh;
            }
            .commentPopup {
                z-index: 999999999999999999;
                position: absolute;
                background: white;
                padding: 50px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .commentPopup td {
                padding: 5px;
                border-bottom: 2px solid;
            }
            .myCustomCheckbox {
                border: 1px solid;
                padding: 1px 0 0 5px;
                font-size: 12px;
                color: black !important;
                text-decoration: none !important;
                width: 20px;
                height: 20px;
                display: block;
                cursor: pointer;
            }
            .myCustomCheckbox.checked:before {
                content:"✓";
            }
            .startLoadingContainer{
                padding-top: 20px;
            }
            .buttonCSS {
                cursor: pointer;
                text-decoration: none !important;
                padding: 10px;
                background: linear-gradient(45deg, #0a66c2, #004182);
                color: white;
                border-radius: 10px;
            }
            .buttonCSS:hover{
                background: linear-gradient(45deg, #004182, #0a66c2)  !important;
                color: white !important;
            }
            .mainActionPanel {
                position: fixed;
                bottom: 0px;
                width: 100%;
                z-index: 9999999999;
            }
            .mainActionPanel .buttonCSS{
                float: left;
                margin-right: 10px;
            }
            .float-right{
                float:right !important;
            }
            * {
                word-break: normal !important;
                overflow-wrap: normal !important;
                word-wrap: normal !important;
                white-space: normal !important;
            }
            @media print{
                .mainActionPanel {
                    display:none !important;
                }
            }
        `;
        document.head.appendChild(style);

        document.querySelector(".application-outlet")?.classList.add("commentPopupLoaded");

        var commentPopupHtml = `
            <div class="commentPopup">
                <table>
                    <thead>
                        <tr>
                            <th colspan="2">Preferences</th>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox checked cbHideSidebars">&nbsp;</a></td>
                            <td>Hide Sidebars & Header</td>
                        </tr>
                        <tr>
                            <td class="widthInputContainer"></td>
                            <td>Page Width (<span class="widthInputValue">` + defaultWidth + `</span>%)</td>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox checked cbRemoveProfileImages">&nbsp;</a></td>
                            <td>Remove Profile Images</td>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox cbRemoveCommentImages">&nbsp;</a></td>
                            <td>Remove Images from Comments</td>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox checked cbLoadAdditionalComments">&nbsp;</a></td>
                            <td>Load Prior and Additional Comments</td>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox checked cbExpandMoreLinks">&nbsp;</a></td>
                            <td>Expand More Links</td>
                        </tr>
                        <tr>
                            <td><a class="myCustomCheckbox checked cbOrderByMostRecent">&nbsp;</a></td>
                            <td>Order by Most Recent</td>
                        </tr>
                        <tr>
                            <th colspan="2" class="startLoadingContainer"><a class="startLoading buttonCSS">Start</a></th>
                        </tr>
                    </thead>
                </table>
            </div>
        `;
        document.body.insertAdjacentHTML("afterbegin", commentPopupHtml);

        // Create width input element (range)
        var widthInput = document.createElement("input");
        widthInput.setAttribute("type", "range");
        widthInput.setAttribute("min", "10");
        widthInput.setAttribute("max", "100");
        widthInput.setAttribute("value", defaultWidth);
        widthInput.setAttribute("step", "10");
        widthInput.className = "widthInput";

        var widthInputContainer = document.querySelector(".widthInputContainer");
        if (widthInputContainer) {
            widthInputContainer.appendChild(widthInput);
        }
    } else {
        alert("This is not a posts page.");
    }
}

// UIChanges
function UIChanges() {
    if (document.querySelector(".cbHideSidebars")?.classList.contains("checked")) {
        var removeSelectors = document.querySelectorAll(".scaffold-layout__sidebar, .scaffold-layout__aside, #msg-overlay, #global-nav");
        removeSelectors.forEach(function (el) { el.remove(); });

        var content = document.querySelector(".scaffold-layout__content--sidebar-main-aside");
        if (content) {
            content.style.gridTemplateAreas = '"main"';
            content.style.gridTemplateColumns = "var(--scaffold-layout-main-width)";
        }
    }

    var inner = document.querySelector(".scaffold-layout__inner");
    var widthInput = document.querySelector(".widthInput");
    if (inner && widthInput) inner.style.width = widthInput.value + "%";

    document.querySelectorAll(".feed-shared-inline-show-more-text").forEach(function (el) { el.style.maxWidth = "100%"; });

    var panelHtml = `
        <div class="mainActionPanel">
            <a id="pauseBtn" class="buttonCSS">Pause</a>
            <a id="playBtn" style="display:none;" class="buttonCSS">Resume</a>
            <a id="printBtn" style="display:none;" class="buttonCSS">Print</a>
            <a id="boldBtn" style="display:none;" class="buttonCSS formattingBtns" data-type="bold">Bold</a>
            <a id="italicBtn" style="display:none;" class="buttonCSS formattingBtns"  data-type="italic">Italic</a>
            <a id="commentCounter" class="buttonCSS float-right"></a>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", panelHtml);
}

// loadAllComments
function loadAllComments() {
    var commentCount = document.querySelectorAll(".comments-comment-item__main-content").length;
    var counterEl = document.querySelector("#commentCounter");
    if (counterEl) counterEl.textContent = commentCount;

    document.querySelectorAll(".feed-shared-inline-show-more-text").forEach(function (el) {
        el.style.maxWidth = "100%";
    });

    if (document.querySelector(".cbRemoveProfileImages")?.classList.contains("checked")) {
        document.querySelectorAll(".comments-comment-list__container .comments-comment-meta__actor img").forEach(function (img) { img.remove(); });
    }
    if (document.querySelector(".cbRemoveCommentImages")?.classList.contains("checked")) {
        document.querySelectorAll(".comments-comment-list__container .comments-display-content__image").forEach(function (img) { img.remove(); });
    }
    if (document.querySelector(".cbExpandMoreLinks")?.classList.contains("checked")) {
        document.querySelectorAll(".feed-shared-inline-show-more-text__see-more-less-toggle").forEach(function (btn) { btn.click(); });
    }

    var commentLoadMoreBtn = document.querySelector(".comments-comment-list__load-more-container");
    var commentLoadMoreBtnSelector = commentLoadMoreBtn ? commentLoadMoreBtn.querySelector("button") : null;
    if (commentLoadMoreBtnSelector) {
        commentLoadMoreBtnSelector.click();
    }

    if (!commentLoadMoreBtn) {
        commentNotLoadingCount++;
    } else {
        commentNotLoadingCount = 0;
    }

    if (commentNotLoadingCount > 300) {
        alert("All comments are loaded.");
        allCommentsLoaded = true;
        if (!document.querySelector(".cbLoadAdditionalComments")?.classList.contains("checked")) {
            completeAllLoadings();
        }
        return; // stop further recursion
    }

    requestAnimationFrame(function () {
        if (!pausedLoading && commentNotLoadingCount <= 300) {
            loadAllComments();
        }
    });
}

// completeAllLoadings
function completeAllLoadings() {
    var pauseBtn = document.querySelector("#pauseBtn");
    var playBtn = document.querySelector("#playBtn");
    var printBtn = document.querySelector("#printBtn");
    if (pauseBtn) pauseBtn.style.display = "none";
    if (playBtn) playBtn.style.display = "none";
    if (printBtn) printBtn.style.display = "inline-block";
}

// loadPreviousReplies
function loadPreviousReplies() {
    if (document.querySelector(".cbLoadAdditionalComments")?.classList.contains("checked")) {
        var previousReplySelector = document.querySelector(".comments-replies-list__replies-button[aria-label^='Load previous replies']");
        if (previousReplySelector) previousReplySelector.click();

        if (allCommentsLoaded) {
            if (!previousReplySelector) {
                previousReplyLoadingCount++;
            } else {
                previousReplyLoadingCount = 0;
            }
            if (previousReplyLoadingCount > 300) {
                alert("All previous replies are loaded.");
                completeAllLoadings();
            }
        }

        requestAnimationFrame(function () {
            if (!pausedLoading && previousReplyLoadingCount <= 300) {
                loadPreviousReplies();
            }
        });
    }
}

// Unicode conversion functions
function toUnicodeBold(text) {
    return Array.from(text).map(function (ch) {
        const cp = ch.codePointAt(0);

        // A-Z -> U+1D400 .. U+1D419
        if (cp >= 0x41 && cp <= 0x5A) {
            return String.fromCodePoint(0x1D400 + (cp - 0x41));
        }

        // a-z -> U+1D41A .. U+1D433
        if (cp >= 0x61 && cp <= 0x7A) {
            return String.fromCodePoint(0x1D41A + (cp - 0x61));
        }

        // 0-9 -> U+1D7CE .. U+1D7D7
        if (cp >= 0x30 && cp <= 0x39) {
            return String.fromCodePoint(0x1D7CE + (cp - 0x30));
        }
        return ch;
    }).join('');
}

function toUnicodeItalic(text) {
    const map = {
        a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩",
        i: "𝘪", j: "𝘫", k: "𝘬", l: "𝘭", m: "𝘮", n: "𝘯", o: "𝘰", p: "𝘱",
        q: "𝘲", r: "𝘳", s: "𝘴", t: "𝘵", u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹",
        y: "𝘺", z: "𝘻",
        A: "𝘈", B: "𝘉", C: "𝘊", D: "𝘋", E: "𝘌", F: "𝘍", G: "𝘎", H: "𝘏",
        I: "𝘐", J: "𝘑", K: "𝘒", L: "𝘓", M: "𝘔", N: "𝘕", O: "𝘖", P: "𝘗",
        Q: "𝘘", R: "𝘙", S: "𝘚", T: "𝘛", U: "𝘜", V: "𝘝", W: "𝘞", X: "𝘟",
        Y: "𝘠", Z: "𝘡"
    };

    return text.split("").map(function (ch) {
        return map[ch] ?? ch;
    }).join("");
}

// replaceSelectionWithAction
function replaceSelectionWithAction(actionType) {
    let sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    let range = sel.getRangeAt(0);
    let selectedText = sel.toString();
    if (!selectedText) return;
    var replacement;
    if (actionType === 'bold') {
        replacement = toUnicodeBold(selectedText);
    } else if (actionType === 'italic') {
        replacement = toUnicodeItalic(selectedText);
    } else {
        return;
    }

    // Replace selection
    range.deleteContents();
    range.insertNode(document.createTextNode(replacement));

    // Clear selection
    sel.removeAllRanges();
    showHideFormatingButtons();
}

// showHideFormatingButtons
function showHideFormatingButtons() {
    var selectedElement = window.getSelection();
    let selected = selectedElement ? selectedElement.toString() : '';
    if (selected.length > 0) {
        var anchorNode = selectedElement.anchorNode;
        var el = null;
        if (anchorNode) {
            if (anchorNode.nodeType === Node.TEXT_NODE) {
                el = anchorNode.parentElement;
            } else if (anchorNode.nodeType === Node.ELEMENT_NODE) {
                el = anchorNode;
            } else {
                el = anchorNode.parentElement;
            }
        }
        if (el && el.closest && el.closest('.ql-editor')) {
            document.querySelectorAll(".formattingBtns").forEach(function (b) { b.style.display = ''; });
        } else {
            document.querySelectorAll(".formattingBtns").forEach(function (b) { b.style.display = 'none'; });
        }
    } else {
        document.querySelectorAll(".formattingBtns").forEach(function (b) { b.style.display = 'none'; });
    }
}

// Event delegation for clicks
document.addEventListener("click", function (e) {
    var target = e.target;

    // Pause button
    if (target && target.id === "pauseBtn") {
        pausedLoading = true;
        target.style.display = "none";
        var playBtn = document.querySelector("#playBtn");
        if (playBtn) playBtn.style.display = "";
        var printBtn = document.querySelector("#printBtn");
        if (printBtn) printBtn.style.display = "";
    }

    // Play button
    if (target && target.id === "playBtn") {
        pausedLoading = false;
        target.style.display = "none";
        var pauseBtn = document.querySelector("#pauseBtn");
        if (pauseBtn) pauseBtn.style.display = "";
        var printBtn = document.querySelector("#printBtn");
        if (printBtn) printBtn.style.display = "none";
        loadAllComments();
        loadPreviousReplies();
    }

    // Print button
    if (target && target.id === "printBtn") {
        window.print();
    }

    // Custom checkbox toggle
    if (target && target.classList && target.classList.contains("myCustomCheckbox")) {
        target.classList.toggle("checked");
    }

    // Start loading
    if (target && target.classList && target.classList.contains("startLoading")) {
        changeToMostRecent();
        document.querySelector(".application-outlet")?.classList.remove("commentPopupLoaded");
        var popup = document.querySelector(".commentPopup");
        if (popup) popup.style.display = "none";
    }

    // Formatting buttons clicked
    if (target && target.classList && target.classList.contains("formattingBtns")) {
        e.preventDefault && e.preventDefault();
        var action = target.getAttribute("data-type");
        replaceSelectionWithAction(action);
    }
});

// Prevent default on mousedown for formatting buttons (like your original)
document.addEventListener("mousedown", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("formattingBtns")) {
        e.preventDefault();
    }
});

// Width input change handler (delegated)
document.addEventListener("change", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("widthInput")) {
        var val = e.target.value;
        var el = document.querySelector(".widthInputValue");
        if (el) el.textContent = val;
    }
});

// Show/hide formatting buttons on mouseup and keyup
document.addEventListener("mouseup", showHideFormatingButtons);
document.addEventListener("keyup", showHideFormatingButtons);

// Initialize popup
openPopup();