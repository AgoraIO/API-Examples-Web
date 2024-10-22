let __cacheData = JSON.parse(sessionStorage.getItem("__cacheData")) || {}

function __insertIe8nText(data) {
    var insertEle = $(".i18n");
    insertEle.each(function () {
        let dataName = $(this).attr("name");
        let i18nTxt = data[dataName];
        $(this).text(i18nTxt);
    })
}

function __getLanguageData(language, success, fail) {
    let url = ""

    if (__cacheData[language]) {
        success(__cacheData[language])
        return
    }

    switch (language) {
        case "zh":
            url = `${ORIGIN_URL}/i18n/zh-CN/index.json`
            break
        case "zh-CN":
            url = `${ORIGIN_URL}/i18n/zh-CN/index.json`
            break
        case "en":
            url = `${ORIGIN_URL}/i18n/en/index.json`
            break
        default:
            url = `${ORIGIN_URL}/i18n/en/index.json`
    }

    $.ajax({
        url: url,
        async: true,
        cache: false,
        dataType: 'json',
        success: success,
        error: fail
    });

}

function __execI18n() {
    const language = getLanguage()

    const success = function (data, status) {
        __cacheData[language] = data
        sessionStorage.setItem("__cacheData", JSON.stringify(__cacheData))
        __insertIe8nText(data)
    }

    const fail = function (jqXHR, textStatus, errorThrown) {
        let msg = "get language data failed!"
        let href = window.location.href
        if (/^file/.test(href)) {
            msg += "can not get language data from local file, please use http server!"
        }
        console.error(msg, jqXHR, textStatus);
    }

    __getLanguageData(language, success, fail)
}

function __insertLanguageSwitch() {
    const languageSwitchHtml =
        `<div class="btn-group language-list">
            <div class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
               <span id="language-text"></span> 
            </div>
            <ul class="dropdown-menu gap-1 p-2 rounded-3 mx-0 border-0 shadow">
                <li class="dropdown-item rounded-2" id="language-english">English</li>
                <li class="dropdown-item rounded-2" id="language-zh">简体中文</li>
            </ul>
        </div>`

    $("#language-switch-wrapper").html(languageSwitchHtml)

    const language = getLanguage()

    if (language == "en") {
        $("#language-english").addClass("active")
        $("#language-text").text("English")
    } else {
        $("#language-zh").addClass("active")
        $("#language-text").text("简体中文")
    }

    function switchLanguage(v) {
        if (language == v) {
            return
        }
        let options = getOptionsFromLocal()
        if (v == "zh-CN" || v == "zh") {
            $("#language-zh").addClass("active")
            $("#language-english").removeClass("active")
            $("#language-text").text("简体中文")
            options.language = "zh-CN"
            setOptionsToLocal(options)
        } else {
            $("#language-english").addClass("active")
            $("#language-zh").removeClass("active")
            $("#language-text").text("English")
            options.language = "en"
            setOptionsToLocal(options)
        }
        window.location.reload()
    }

    $("#language-english").click(function (e) {
        switchLanguage("en")

    })

    $("#language-zh").click(function (e) {
        switchLanguage("zh-CN")
    })


}


window.addEventListener("pageshow", function (e) {
    __insertLanguageSwitch()
    __execI18n()
})
