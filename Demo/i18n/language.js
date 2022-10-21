var getNavLanguage = function () {
    if (navigator.appName == "Netscape") {
        var navLanguage = navigator.language;
        return navLanguage;
    }
    return false;
}

var i18nLanguage = "en";

var webLanguage = ['zh-CN', 'en'];

var execI18n = function () {
    var optionEle = $("#i18n_pagename");
    if (optionEle.length < 1) {
        console.log("未找到页面名称元素，请在页面写入\n <meta id=\"i18n_pagename\" content=\"页面名(对应语言包的语言文件名)\">");
        return false;
    };
    var sourceName = optionEle.attr('content');
    sourceName = sourceName.split('-');


    var navLanguage = getNavLanguage();

    console.log("navLanguage", navLanguage);

    if (navLanguage) {
        var charSize = $.inArray(navLanguage, webLanguage);
        if (charSize > -1) {
            i18nLanguage = navLanguage;
            $.cookie('userLanguage', navLanguage, { expires: 30 })
        };
    } else {
        console.log("not navigator");
        return false;
    }
    if ($.i18n == undefined) {
        console.log("请引入i18n js 文件")
        return false;
    };

    jQuery.i18n.properties({
        name: sourceName,
        path: 'i18n/' + i18nLanguage + '/',
        mode: 'map',
        language: i18nLanguage,
        callback: function () {
            var insertEle = $(".i18n");
            insertEle.each(function () {
                $(this).html($.i18n.prop($(this).attr('name')));
            });

            var insertInputEle = $(".i18n-input");
            insertInputEle.each(function () {
                var selectAttr = $(this).attr('selectattr');
                if (!selectAttr) {
                    selectAttr = "value";
                };
                $(this).attr(selectAttr, $.i18n.prop($(this).attr('selectname')));
            });
        }
    });

}





/*页面执行加载执行*/
$(function () {

    /*执行I18n翻译*/
    execI18n();

    /*将语言选择默认选中缓存中的值*/
    $("#language option[value=" + i18nLanguage + "]").attr("selected", true);

    /* 选择语言 */
    $("#language").bind('change', function () {
        var language = $(this).children('option:selected').val()
        console.log(language);

        $.cookie('userLanguage', language, { expires: 30 });

        location.reload();
    });
});
