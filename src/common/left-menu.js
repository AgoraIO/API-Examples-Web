function __isSmallScreen() {
  const SM_WIDTH = 576 // small screen width (phone)
  const windowWidth = $(window).width();
  return windowWidth <= SM_WIDTH
}

function __listToDom(list) {
  return list.map((item, index) => {
    return `
    <div class="sidebar-item" data-index="${index}">
      <a href="${item.url}" class="i18n" name="${item.title}"> </a>
    </div>
    `
  }).join("")
}

function __transListToMenuDom(list, name, defaultName = "") {
  return `<div class="sidebar-menu" >
  <div class="sidebar-title">
    <span class="i18n" name="${name}">${defaultName}</span>
    <span class="triangle"></span>
  </div>
  <div class="sidebar-list">
    ${__listToDom(list)}
  </div>
</div>`
}

function __initMenu() {
  let language = getLanguage()
  let href = ""
  let logoHtml = ""
  const target = DOCUMENT_LIST.find(item => item.name == "default") || {}
  if (language == "en") {
    href = target.enUrl
    logoHtml = `<img src="${ORIGIN_URL}/assets/agora-logo-en.jpg" alt="logo" class="logo-img">`
  } else {
    href = target.zhUrl
    logoHtml = `<img src="${ORIGIN_URL}/assets/agora-logo-zh.jpg" alt="logo" class="logo-img">`
  }

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
  ${__transListToMenuDom(SETUP_LIST, "settingMenu")}
  ${__transListToMenuDom(BASIC_LIST, "quickMenu")}
  ${__transListToMenuDom(ADVANCED_LIST, "advancedMenu")}
  ${__transListToMenuDom(PLUGIN_LIST, "pluginMenu")}
  ${__transListToMenuDom(OTHER_LIST, "othersMenu")}
  ${__transListToMenuDom(FRAMEWORK_LIST, "frameworkMenu")}
  </div >
    `

  if (__isSmallScreen()) {
    menuHtml = `<nav class="navbar sm-navbar">
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
    </nav>`
  }

  const wrapper = document.querySelector(".container .left")
  wrapper.innerHTML = menuHtml

  // all menu is show by default
  $(".sidebar-list").show()

  __hightlightMenu()
  __initListener()
}

function __hightlightMenu() {
  let href = window.location.href.split("?")[0]

  // init state
  $(".sidebar-item").removeClass("active").removeClass("hover")
  $(".sidebar-title").removeClass("active").removeClass("hover")
  $(".triangle").removeClass("open")

  let targetNode = $(`.sidebar-item:has(a[href = "${href}"])`)
  if (!targetNode.length) {
    targetNode = $(`.sidebar-item:has(a[href = "${href}index.html"])`)
  }
  targetNode.addClass("active")
  const sidebarMenu = targetNode.closest(".sidebar-menu")
  if (sidebarMenu && sidebarMenu.length) {
    sidebarMenu.find(".sidebar-title").addClass("active")
    sidebarMenu.find(".triangle").addClass("open")
    let offset = sidebarMenu.offset() || {}
    let top = offset.top || 0
    let scrollElement = null
    if (__isSmallScreen()) {
      scrollElement = $('.offcanvas-body')
    } else {
      scrollElement = $('.left')
    }
    scrollElement.animate({
      scrollTop: top
    }, 100);
  }
}

function __initListener() {
  $(".sidebar-title").hover(
    function () {
      $(this).addClass("hover")
    },
    function () {
      $(this).removeClass("hover")
    }
  );

  $('.sidebar-title').click(function () {
    $(this).find(".triangle").toggleClass("open")
    const list = $(this).next()
    list.slideToggle("fast")
  });

  $(".sidebar-item").hover(
    function () {
      $(this).addClass("hover")
    },
    function () {
      $(this).removeClass("hover")
    }
  );

  $(".sidebar-item").click(function (e) {
    const href = $(this).find("a")[0].href
    if (href == SETUP_LIST[0].url) {
      localStorage.removeItem("__setupJumpHref")
    }
  })

}

window.addEventListener("pageshow", function (e) {
  __initMenu()
})

if (__isSmallScreen()) {
  window.addEventListener("pageshow", function (e) {
    __hightlightMenu()
  })
}



