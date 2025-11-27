var pausedLoading = false;
var commentNotLoadingCount = 0;
var previousReplyLoadingCount = 0;
var allCommentsLoaded = false;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function triggerClick(el) {
    if (el) el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function changeToMostRecent() {
    var buttonForSort = document.querySelector(".comments-sort-order-toggle__dropdown button");
    triggerClick(buttonForSort);

    var timeoutIn1 = getRandomInt(500, 1000);
    setTimeout(function () {
        var lastItem = document.querySelector(".comments-sort-order-toggle__content li:last-child");
        triggerClick(lastItem);

        var timeoutIn2 = getRandomInt(2000, 3000);
        setTimeout(function () {
            var buttonText = buttonForSort.textContent || "";
            if (buttonText.includes("Most recent")) {
                var timeoutIn3 = getRandomInt(200, 400);
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

function UIChanges() {
    document.querySelectorAll(".scaffold-layout__sidebar, .scaffold-layout__aside, #msg-overlay, #global-nav")
        .forEach(el => el.remove());

    var inner = document.querySelector(".scaffold-layout__inner");
    if (inner) inner.style.width = "90%";

    var grid1 = document.querySelector(".scaffold-layout__content--sidebar-main-aside");
    if (grid1) {
        grid1.style.gridTemplateAreas = '"main"';
        grid1.style.gridTemplateColumns = "var(--scaffold-layout-main-width)";
    }

    document.querySelectorAll(".feed-shared-inline-show-more-text")
        .forEach(el => el.style.maxWidth = "100%");

    // Add buttons
    document.body.insertAdjacentHTML("afterbegin",
        "<a id='pauseBtn' style='cursor:pointer;padding:5px;bottom:0px;background:black;color:white;position:fixed;font-size:25px;z-index:9999999999999;text-align:center;'>Pause</a>"
    );
    document.body.insertAdjacentHTML("afterbegin",
        "<a id='playBtn' style='display:none;cursor:pointer;padding:5px;bottom:0px;background:black;color:white;position:fixed;font-size:25px;z-index:9999999999999;text-align:center;'>Start</a>"
    );
    document.body.insertAdjacentHTML("afterbegin",
        "<a id='printBtn' style='display:none;cursor:pointer;padding:5px;bottom:0px;left:75px;background:black;color:white;position:fixed;font-size:25px;z-index:9999999999999;text-align:center;'>Print</a>"
    );
    document.body.insertAdjacentHTML("afterbegin",
        "<a id='commentCounter' style='bottom:0px;right:0px;padding:5px;background:black;color:white;position:fixed;font-size:25px;z-index:9999999999999;text-align:center;'></a>"
    );
}

function loadAllComments() {
    document.querySelectorAll(".comments-comment-list__container img").forEach(el => el.remove());

    var counter = document.querySelector("#commentCounter");
    if (counter) {
        counter.textContent = document.querySelectorAll(".comments-comment-item__main-content").length;
    }

    // Expand all "See more"
    document.querySelectorAll(".feed-shared-inline-show-more-text__see-more-less-toggle")
        .forEach(el => triggerClick(el));

    var commentLoadMoreBtn = document.querySelector(".comments-comment-list__load-more-container");
    var commentLoadMoreBtnSelector = document.querySelector(".comments-comment-list__load-more-container button:first-child");

    triggerClick(commentLoadMoreBtnSelector);

    var timeoutIn1 = getRandomInt(500, 700);

    requestAnimationFrame(function () {
        if (!commentLoadMoreBtn) {
            commentNotLoadingCount++;
        } else {
            commentNotLoadingCount = 0;
        }

        if (!pausedLoading && commentNotLoadingCount <= 600) {
            loadAllComments();
        }

        if (commentNotLoadingCount > 600) {
            alert("All comments are loaded.");
            allCommentsLoaded = true;
        }
    }, timeoutIn1);
}

function resetElementInDom() {
    // Nothing (jQuery version commented out)
}

function loadPreviousReplies() {
    var previousReplySelector = document.querySelector(".comments-replies-list__replies-button[aria-label^='Load previous replies']");

    triggerClick(previousReplySelector);

    var timeoutIn2 = getRandomInt(1000, 2000);

    requestAnimationFrame(function () {
        if (allCommentsLoaded) {
            if (!previousReplySelector) {
                previousReplyLoadingCount++;
            } else {
                previousReplyLoadingCount = 0;
            }
        }

        if (!pausedLoading && previousReplyLoadingCount <= 600) {
            loadPreviousReplies();
        }

        if (previousReplyLoadingCount > 600) {
            resetElementInDom();
            alert("All previous replies are loaded.");

            document.querySelector("#pauseBtn").style.display = "none";
            document.querySelector("#playBtn").style.display = "none";
            document.querySelector("#printBtn").style.display = "block";
        }
    }, timeoutIn2);
}

/* Event Listeners */

document.addEventListener("click", function (e) {
    if (e.target.id === "pauseBtn") {
        pausedLoading = true;
        e.target.style.display = "none";
        document.querySelector("#playBtn").style.display = "block";
        document.querySelector("#printBtn").style.display = "block";
        resetElementInDom();
    }

    if (e.target.id === "playBtn") {
        pausedLoading = false;
        e.target.style.display = "none";
        document.querySelector("#pauseBtn").style.display = "block";
        document.querySelector("#printBtn").style.display = "none";
        loadAllComments();
        loadPreviousReplies();
    }

    if (e.target.id === "printBtn") {
        window.print();
    }
});

changeToMostRecent();