/*global $, Cookies, ga*/
window.demo_init = function () {
    $('.waiting-mask').fadeOut();

    function mounted() {
        (function(i, s, o, g, r, a, m) {
            i["GoogleAnalyticsObject"] = r;
            (i[r] =
                i[r] ||
                function() {
                    (i[r].q = i[r].q || []).push([i, s, o, g, r, a, m]);
                }),
                (i[r].l = 1 * new Date());
            (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m);
        }(
            window,
            document,
            "script",
            "https://www.google-analytics.com/analytics.js",
            "ga"
        ));
        ga("create", "UA-39383294-6", "auto");
        ga("send", "pageview");
    }

    function isMobile () {
        try {
          document.createEvent("TouchEvent")
          return true;
        }
        catch (e) {
          return false
        }
    }

    if (isMobile()) {
        // show BLINGER
        $('html').toggleClass('desktop-pc', false);
        $('html').toggleClass('touch-device', true);
    } else {
        // show LIVECHAT
        $('html').toggleClass('desktop-pc', true);
        $('html').toggleClass('touch-device', false);
    }

    // var $personal_area_url_a = $('.personal-area-url');
    // if ($('input[name="locale"]:checked').val() === 'cn') {
    //     $personal_area_url_a.attr({'href': 'https://secure.icmarkets-zhv.com/', 'target': '_blank'});
    // } else {
    //     $personal_area_url_a.attr({'href': 'https://secure.icmarkets.com/', 'target': '_blank'});
    // }

    $("#nav-icon").off('click');
    $("#nav-icon").on('click', function () {
        $(this).toggleClass("open");
    });
    $(".navbar-brand__mobile").off('click');
    $(".navbar-brand__mobile").on('click', function () {
        if ($(".collapse.in")) {
            $('#nav-icon').removeClass('open')
            $(".collapse.in").animate({height: '1px'}, 500, function () {
                $(".collapse.in").removeClass("in");
            });
        }
    });
    $(".dropdown-list-container__list-item").off('click');
    $(".dropdown-list-container__list-item").on('click', function() {
        $("#nav-icon").removeClass("open");
    });

    $('.icm-navbar-list-button button').off('click');
    $('.icm-navbar-list-button button').on('click', function () {
        $('#nav-icon').removeClass('open')
        $(".collapse.in").removeClass("in");
    });

    $('.demo-menu-item').off('click');
    $('.demo-menu-item').on('click', function () {
        $('.demo-page-header-menu-container').toggleClass('expanded', false);
    });

    var camp = Cookies.get('camp');
    var $ref = $('#reffer_id');
    if (camp && $ref.length) {
        camp = camp.replace(/\D/g, ''); // strip non-digits
        $ref.val(camp);
        $ref.parent().toggleClass('has-label', true);
    }

    mounted()
};

window.demo_init();
