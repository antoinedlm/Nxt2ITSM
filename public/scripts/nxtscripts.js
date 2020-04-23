$(document).ready(function () {

    //When page is loading
    $("[name='menu__Properties']").addClass('selectedmenu');
    $('.content').hide();
    $("[name='content__Properties']").show();

    //On score click, show the associated doc and highlight the line
    $(".canSelect[name^='score__']").click(function (event) {

        if ($(this).hasClass('selectedScore')) {
            $('.line').removeClass('selectedScore');
            $('.leaf').removeClass('selectedScore');
            $('.payload').removeClass('selectedScore');
            $('.composite').removeClass('selectedScore');

            var content_name = $.trim($(this).parent().parent().attr('name'));
            var doc_name = content_name.replace('content__', 'doc__');
            console.log(content_name, doc_name);
            if ($(`[name='${doc_name}']`).length) {
                $(`[name='${content_name}']`).find('.docpane').show();
                height_score = $(`[name='${content_name}']`).find('.scorepane').height();
                $(`[name='${content_name}']`).find('.docpane').height(height_score);
                $(`[name='${content_name}']`).find('.docpane').find('.docsection').hide();
                $(`[name='${doc_name}']`).show();
            } else {
                $('.docpane').hide();
            };
        } else {
            $('.line').removeClass('selectedScore');
            $('.leaf').removeClass('selectedScore');
            $('.payload').removeClass('selectedScore');
            $('.composite').removeClass('selectedScore');
            $(this).addClass('selectedScore');
            $(this).find('.leaf').addClass('selectedScore');
            $(this).find('.payload').addClass('selectedScore');

            var doc_name = $.trim($(this).attr('name')).replace('score__', 'doc__');
            $('.docpane').hide();
            if ($(`[name='${doc_name}']`).length) {
                var docPane = $(`[name='${doc_name}']`).parent();
                docPane.show();
                docPane.find('.docsection').hide();
                height_score = $(this).parent().height();
                docPane.height(height_score);
                $(`[name='${doc_name}']`).show();
            };
        };
    });

    //On score in the menu click, show the associated page content and doc if it exist
    $('.scoreitem').click(function (event) {
        $('.line').removeClass('selectedScore');
        $('.leaf').removeClass('selectedScore');
        $('.payload').removeClass('selectedScore');
        $('.composite').removeClass('selectedScore');
        $('.scoreitem').removeClass('selectedmenu');
        $(this).addClass('selectedmenu');

        var menu_name = $.trim($(this).attr('name'));
        var content_name = menu_name.replace('menu__', 'content__');
        var doc_name = menu_name.replace('menu__', 'doc__');

        $('.content').hide();
        $('.docpane').hide();
        $(`[name='${content_name}']`).show();
        if ($(`[name='${doc_name}']`).length) {
            $(`[name='${content_name}']`).find('.docpane').show();
            height_score = $(`[name='${content_name}']`).find('.scorepane').height();
            $(`[name='${content_name}']`).find('.docpane').height(height_score);
            $(`[name='${content_name}']`).find('.docpane').find('.docsection').hide();
            $(`[name='${doc_name}']`).show();
        };
    });

    $('.actremote').click(function (event) {

        var device_uid = $(this).attr('device_uid');
        var remote_uid = $(this).attr('remote_uid');
        var payload = {
            RemoteActionUid: remote_uid,
            DeviceUids: [device_uid]
        };
        var xhttp1 = new XMLHttpRequest();
        xhttp1.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                alert(xhttp1.responseText);
            }
        };
        xhttp1.open("GET", "/act/" + device_uid + "/" + remote_uid, true);
        xhttp1.send();
    });
});
