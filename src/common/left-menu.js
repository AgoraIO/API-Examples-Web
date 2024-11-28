const DEFAULT_ZH_DOC_URL = "https://doc.shengwang.cn/doc/rtc/javascript/get-started/enable-service";
const DEFAULT_EN_DOC_URL =
  "https://docs.agora.io/en/video-calling/get-started/authentication-workflow?platform=web";

function __isSmallScreen() {
  const SM_WIDTH = 576; // small screen width (phone)
  const windowWidth = $(window).width();
  return windowWidth <= SM_WIDTH;
}

function __transListToMenuDom(list) {
  return list
    .map((item) => {
      return `<div class="sidebar-menu" >
 <div class="sidebar-title">
   <span class="i18n" name="${item.name}"></span>
   <span class="triangle"></span>
 </div>
 <div class="sidebar-list">
   ${item.data
     .map((item, index) => {
       return `
     <div class="sidebar-item" data-index="${index}">
       <a href="${item.url}" class="i18n" name="${item.name}"> </a>
     </div>
     `;
     })
     .join("")}
 </div>
</div>`;
    })
    .join("");
}

function __initMenu() {
  let language = getLanguage();
  let href = "";
  let logoImgSrc = "";
  if (language == "en") {
    href = DEFAULT_EN_DOC_URL;
    logoImgSrc = `${ORIGIN_URL}/assets/agora-logo-en.png`;
  } else {
    href = DEFAULT_ZH_DOC_URL;
    logoImgSrc = `${ORIGIN_URL}/assets/agora-logo-zh.png`;
  }
  let logoHtml = `<img src=${logoImgSrc} alt="logo" style="width:56px; height: 30px;">`;
  let menuHtml = `
  <div class="sidebar">
  <div class="sidebar-top">
    <div class="border-bottom pb-3 mb-3 flex top-wrapper">
      <a href=${href} target="_blank" class="link-body-emphasis text-decoration-none">
        ${logoHtml}
      </a>
      <span id="language-switch-wrapper">
      </span>
    </div>
  </div> 
  ${__transListToMenuDom(MENU_LIST)}
  </div >
    `;

  if (__isSmallScreen()) {
    menuHtml = `<nav class="navbar width-100 overflow-hidden">
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-navbar">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas-navbar"
        aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-body">
          <div class="close-wrapper">
           <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div> 
          ${menuHtml}
        </div>
      </div>
    </nav>`;
  }

  const wrapper = document.querySelector(".container .left");
  wrapper.innerHTML = menuHtml;

  __hightlightMenu();
  __initListener();
}

function __hightlightMenu() {
  let href = window.location.href.split("?")[0];

  // init state
  $(".sidebar-item").removeClass("active").removeClass("hover");
  $(".sidebar-title").removeClass("active").removeClass("hover");
  $(".triangle").removeClass("open");

  let targetNode = $(`.sidebar-item:has(a[href = "${href}"])`);
  if (!targetNode.length) {
    targetNode = $(`.sidebar-item:has(a[href = "${href}index.html"])`);
  }
  targetNode.addClass("active");
  const sidebarMenu = targetNode.closest(".sidebar-menu");
  if (sidebarMenu && sidebarMenu.length) {
    sidebarMenu.find(".sidebar-title").addClass("active");
    sidebarMenu.find(".triangle").addClass("open");
    let offset = sidebarMenu.offset() || {};
    let top = offset.top || 0;
    let scrollElement = null;
    if (__isSmallScreen()) {
      scrollElement = $(".offcanvas-body");
    } else {
      scrollElement = $(".left");
    }
    scrollElement.animate(
      {
        scrollTop: top,
      },
      100,
    );
  }
}

function __initListener() {
  $(".sidebar-title").hover(
    function () {
      $(this).addClass("hover");
    },
    function () {
      $(this).removeClass("hover");
    },
  );

  $(".sidebar-title").click(function () {
    $(this).find(".triangle").toggleClass("open");
    const list = $(this).next();
    list.slideToggle("fast");
  });

  $(".sidebar-item").hover(
    function () {
      $(this).addClass("hover");
    },
    function () {
      $(this).removeClass("hover");
    },
  );

  $(".sidebar-item").click(function (e) {
    const href = $(this).find("a")[0].href;
    if (href == SETUP_LIST[0].url) {
      localStorage.removeItem("__setupJumpHref");
    }
  });
}

// ----------------- init -----------------
window.addEventListener("load", function (e) {
  __initMenu();
});

if (__isSmallScreen()) {
  window.addEventListener("load", function (e) {
    __hightlightMenu();
  });
}
