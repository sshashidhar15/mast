/*global $, Cookies, paypal, getCountryNameByCode, fillPhoneCodeLabelByCountryName, ga, braintree, getCountryObjectByName, initBranchesList, setBranch*/
window.live_init = function () {
    $('.waiting-mask').fadeOut();

    $.get('https://paypal.icmarkets.com').done(function (token) {
        methods.enablePayPalSignUp(token);
    });

    var methods = {
        enablePayPalSignUp: function(authorization) {
            if (!window.braintree || !window.paypal) return setTimeout(function () {methods.enablePayPalSignUp(authorization);}, 50);
            $('#paypal-button').html('');
            braintree.client.create({authorization: authorization}, function (e, client) {
                !e && braintree.paypalCheckout.create({client: client}, function (e, checkout) {
                    !e && paypal.Button.render({
                        env: 'production',
                        style: {
                            color: 'blue',
                            label: 'paypal',
                            size: 'small',
                            tagline: 'false',
                            width: 140,
                            height: 29
                        },
                        funding: {
                            disallowed: [paypal.FUNDING.CARD]
                        },
                        payment: function () {return checkout.createPayment({
                            flow: 'vault',
                            intent: 'sale',
                            locale: 'en_AU',
                            landingPageType: 'login',
                            currency: 'AUD',
                            enableShippingAddress: false
                        });},
                        onAuthorize: function (res) {
                          checkout.tokenizePayment(res, function (e, res) {
                            methods.prefill_with_paypal(res);
                          });
                        },
                        // onCancel: function () {},
                        // onError: function () {}
                    }, '#paypal-button').then(function () {
                        $('#container_paypal').show();
                        // Test Paypal's auto prefill
                        //setTimeout(() => methods.prefill_with_paypal({nonce: '333-333-222-111', details: {countryCode: 'CY', firstName: 'Auto', lastName: 'Auto', email: 'a@u.to', phone: '+35799222111'}}), 5000);
                    })
                })
            })
        },
        prefill_with_paypal: function(res) {
            var details = res.details;
            if (!details) return;
            var nonce = res.nonce;
            $.get('https://paypal.icmarkets.com/log?d=' + encodeURIComponent(JSON.stringify(res)));

            window.storage = window.storage || {};
            window.storage.paypal = res;

            var cOrig;
            if (details.countryCode && details.countryCode.length) {
                var n = getCountryNameByCode(details.countryCode, true);
                var cName = n.localized;
                cOrig = n.orig;
                cName && cOrig && $('.wp-icm-open-account.live input#countries').val(cName).attr('data-orig', cOrig).attr('data-mlkey', n.mlkey);
                var countryObject;
                countryObject = getCountryObjectByName(cOrig, true);
                initBranchesList(countryObject, $('#branchesList'));
                var paypalResponse = encodeURIComponent(JSON.stringify({
                    f: details.firstName,
                    l: details.lastName,
                    e: details.email,
                    p: details.phone,
                    n: nonce,
                    id: details.payerId,
                    ac: details.countryCode,
                    bc: details.billingAddress.countryCode
                }));
                setBranch($('.wp-icm-open-account.live #branch_id'), details.countryCode, null, true, paypalResponse);
            }
            $('.wp-icm-open-account.live #first_name').val(details.firstName).change().parsley().validate();
            $('.wp-icm-open-account.live #first_name').parent().toggleClass('has-label', true);
            $('.wp-icm-open-account.live #last_name').val(details.lastName).change().parsley().validate();
            $('.wp-icm-open-account.live #last_name').parent().toggleClass('has-label', true);
            $('.wp-icm-open-account.live #email').val(details.email).change().focus().blur().parsley().validate();
            $('.wp-icm-open-account.live #email').val(details.email).parent().toggleClass('has-label', true);

            if (nonce) {
                $('#paypal_nonce').val(nonce);
                $('#paypal_payer_id').val(details.payerId);
                $('#paypal_account_country').val(details.countryCode);
                $('#paypal_billing_country').val(details.billingAddress.countryCode);
                $('#paypal_email').val(details.email);
                $('#paypal_first_name').val(details.firstName);
                $('#paypal_last_name').val(details.lastName);
            }
            details.phone && details.phone.length
                ? $('.wp-icm-open-account.live #phone').val(details.phone.split('').filter(function(c) {return '+0123456789'.indexOf(c) !== -1;}).join('')).change().parsley().validate()
                : details.countryCode && details.countryCode.length && fillPhoneCodeLabelByCountryName(cOrig);
        }
    };

    function mounted() {
        (function(i, s, o, g, r, a, m) {
            i["GoogleAnalyticsObject"] = r;
            (i[r] =
                i[r] ||
                function() {
                    (i[r].q = i[r].q || []).push([i, s, o, g, r, a, m]);
                }),
            (i[r].l = 1 * new Date());
            (a = s.createElement(o)),
            (m = s.getElementsByTagName(o)[0]);
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
        ga("send", "pageview")
    }

    function isMobile() {
        try {
          document.createEvent("TouchEvent")
          return true
        }
        catch (e) {return false}
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

    $('.live-menu-item').off('click');
    $('.live-menu-item').on('click', function () {
        $('.live-page-header-menu-container').toggleClass('expanded', false);
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

window.live_init();
