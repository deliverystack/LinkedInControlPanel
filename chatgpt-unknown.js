javascript:(function(){

/* ============================================================
   GLOBAL STOP FLAG
   ============================================================ */
let STOP=false;

/* ============================================================
   BUTTON BAR (STOP + PRINT)
   ============================================================ */
function createControlButtons(){
  const bar=document.createElement("div");
  bar.style.cssText=`
    position:fixed;
    top:10px;
    right:10px;
    z-index:999999999;
    display:flex;
    gap:8px;
  `;

  const stopBtn=document.createElement("button");
  stopBtn.textContent="STOP";
  stopBtn.style.cssText=`
    background:red;
    color:white;
    font-weight:bold;
    border:none;
    padding:10px 16px;
    border-radius:6px;
    cursor:pointer;
    font-size:16px;
    box-shadow:0 0 6px rgba(0,0,0,.3);
  `;
  stopBtn.onclick=function(){
    STOP=true;
    if(observer) observer.disconnect();
    clearInterval(loopInterval);
    stopBtn.style.background="#555";
    stopBtn.textContent="Stopped";
  };

  const printBtn=document.createElement("button");
  printBtn.textContent="PRINT NOW";
  printBtn.style.cssText=`
    background:#0066ff;
    color:white;
    font-weight:bold;
    border:none;
    padding:10px 16px;
    border-radius:6px;
    cursor:pointer;
    font-size:16px;
    box-shadow:0 0 6px rgba(0,0,0,.3);
  `;
  printBtn.onclick=function(){
    STOP=true;
    if(observer) observer.disconnect();
    clearInterval(loopInterval);
    window.print();
  };

  bar.appendChild(stopBtn);
  bar.appendChild(printBtn);
  document.body.appendChild(bar);
}

/* ============================================================
   UTILITIES
   ============================================================ */
function simulatePointerClick(el){
  if(!el) return;
  el.focus();
  ["pointerover","pointerenter","pointerdown","pointerup","click"].forEach(evt=>{
    el.dispatchEvent(new PointerEvent(evt,{bubbles:true,cancelable:true,pointerType:"mouse"}));
  });
}

function clickIfVisible(selector, textMatch){
  [...document.querySelectorAll(selector)].forEach(el=>{
    if(STOP) return;
    if(el.offsetParent===null) return;
    const t=el.textContent.trim().toLowerCase();
    if(!textMatch || textMatch(t)){
      el.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(()=>simulatePointerClick(el),150);
    }
  });
}

/* ============================================================
   1. MOST RECENT
   ============================================================ */
function setMostRecent(){
  const btn=document.querySelector("button[aria-controls*='sort']") ||
             document.querySelector("button.comments-sort-order-toggle");
  if(btn){ simulatePointerClick(btn); }

  setTimeout(()=>{
    clickIfVisible("div[role='menuitem'],li[role='menuitem']",t=>t.includes("recent"));
  },500);
}

/* ============================================================
   2. AUTO-SCROLL + LOAD MORE COMMENTS
   ============================================================ */
function autoScrollAndLoad(){
  if(STOP) return;
  window.scrollTo(0,document.body.scrollHeight);
  clickIfVisible("button",t=>t.includes("load more"));
}

/* ============================================================
   3. EXPAND REPLIES
   ============================================================ */
function expandReplies(){
  if(STOP) return;
  clickIfVisible("button",t=>(
     t.includes("previous replies") ||
     t.includes("more replies")     ||
     t.includes("see more replies")
  ));
}

/* ============================================================
   4. EXPAND “…MORE” INSIDE COMMENTS
   ============================================================ */
function expandMore(){
  if(STOP) return;
  const buttons=[...document.querySelectorAll("button.feed-shared-inline-show-more-text__see-more-less-toggle")];
  buttons.forEach(btn=>{
    if(btn.offsetParent===null) return;
    const span=btn.querySelector("span");
    if(span){
      const t=span.textContent.trim().toLowerCase();
      if(t.includes("more") && !t.includes("less")){
        btn.scrollIntoView({behavior:"smooth",block:"center"});
        setTimeout(()=>simulatePointerClick(btn),150);
      }
    }
  });
}

/* ============================================================
   5. CLEAN PRINT MODE — Remove Everything Except Thread
   ============================================================ */
function simplifyLayout(){
  const css=`
    body, html { overflow-x:hidden !important; background:white !important; }

    /* Remove all junk */
    header, nav, footer,
    .global-nav,
    .scaffold-layout__sidebar,
    .scaffold-layout__aside,
    .scaffold-layout__nav,
    .msg-overlay-container,
    #global-alert-container,
    .application-outlet aside,
    .right-rail, .left-rail,
    .share-box-feed-entry__wrapper,
    [data-test-global-nav-link],
    .artdeco-toasts,
    .artdeco-modal,
    .modal,
    .ember-view[role='dialog'] {
      display:none !important;
      visibility:hidden !important;
    }

    /* Main column to full width */
    .scaffold-layout__main,
    main {
      width:100% !important;
      max-width:100% !important;
      flex:1 !important;
      padding:0 20px !important;
    }
  `;
  const style=document.createElement("style");
  style.textContent=css;
  document.head.appendChild(style);
}

/* ============================================================
   MUTATION OBSERVER
   ============================================================ */
const observer=new MutationObserver(()=>{
  if(STOP) return;
  expandMore();
  expandReplies();
  autoScrollAndLoad();
});

/* ============================================================
   ACTIVATE EVERYTHING
   ============================================================ */
createControlButtons();
simplifyLayout();
setMostRecent();

observer.observe(document.body,{childList:true,subtree:true});

const loopInterval=setInterval(()=>{
  if(STOP) return;
  expandMore();
  expandReplies();
  autoScrollAndLoad();
},1200);

/* Safety off-switch after 5 minutes */
setTimeout(()=>{
  STOP=true;
  observer.disconnect();
  clearInterval(loopInterval);
},300000);

})();