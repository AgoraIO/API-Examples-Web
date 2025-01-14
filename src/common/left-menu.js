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
      return `
        <div class="sidebar-menu">
          <div class="sidebar-title">
            <span class="i18n" name="${item.name}"></span>
            <span class="triangle"></span>
          </div>
          <div class="sidebar-list">
            ${item.data
              .map((item, index) => {
                return `
                  <div class="sidebar-item" data-index="${index}">
                    <a href="${item.url}" class="i18n" name="${item.name}"></a>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
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
  menuHtml = `${leftNav()}`;
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
  let targetNode = $(`a[href = "${href}"]`).find('.sidebar-item')
  if (!targetNode.length) {
    targetNode = $(`a[href = "${href}index.html"]`).find('.sidebar-item')
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

function leftNav() {
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
  return `
    <div class="relative flex w-full max-w-[20rem] flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-xl shadow-blue-gray-900/5">
      <div class="sidebar-top">
        <div class="border-bottom p-3 flex top-wrapper">
          <a href=${href} target="_blank" class="link-body-emphasis text-decoration-none">
            ${logoHtml}
          </a>
          <span id="language-switch-wrapper"></span>
        </div>
      </div>
      <nav class="min-h-screen flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
        ${__transListToMenuDomV2(MENU_LIST)}
      </nav>
    </div>
  `;
}


function __transListToMenuDomV2(list) {
  return list
    .map((item) => {
      return `
        <div class="sidebar-menu relative block w-full">
          <div name="${item.name}" role="button"
            class="sidebar-title i18n flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none bg-blue-gray-50/50 text-start text-blue-gray-700 hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
            <button type="button"
              class="finder flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-900 hover:text-blue-gray-900">
              <p class="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900"></p>
              <span class="ml-4"></span>
            </button>
          </div>
          <div class="overflow-hidden">
            <div class="block w-full py-1 font-sans text-sm antialiased font-light leading-normal text-gray-700">
              <nav class="flex min-w-[240px] flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
                ${item.data
                  .map((item, index) => {
                    return `
                  <a href="${item.url}" class="navitem flex items-center">
                    <div name="${item.name}" role="button"
                      class="sidebar-item i18n flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"
                      stroke="currentColor" aria-hidden="true" class="w-5 h-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
                    </svg>
                  </a>
                `;
                  })
                  .join("")}
              </nav>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}