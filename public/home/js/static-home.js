/*global $*/
window.home_init = function () {
    var methods = {};
    var ref_slider = $('.car-component .frame .car');
    $('.waiting-mask').fadeOut();

    var data = {
        order: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        slider: {
            start: -176 * 15,
            pos: -176 * 15,
            max: 0 ,
            min: -176 * 15 * 2,
            auto: null,
        },
        price_widget_symbols: [
            'EURUSD',
            'AUDUSD',
            'GBPUSD',
            'XAUUSD'
        ],
        price_widget_cache: {
        },
        preGetResult: 'no-result',
        currencyPairs: ['EURUSD', 'USDJPY', 'AUDUSD', 'GBPUSD'],
        quote_widgets: {
            EURUSD: null,
            AUDUSD: null,
            GBPUSD: null,
            XAUUSD: null
        },
        daily: {}
    };

    methods = {
        slideAuto: function () {
            if (data.slider.auto) clearInterval(data.slider.auto);
            data.slider.auto = setInterval(function () {
                if (ref_slider.length) {
                    methods.slideLeft(0.4);
                }
            }, 6000);
        },
        slideLeft: function (t) {
            var s = data.slider;
            var style = ref_slider[0].style;

            clearInterval(s.auto);

            if (s.pos === s.max) {
                s.pos = s.start;
                style.transitionDuration = '0s';
                style.transform = 'translate3d(' + s.pos + 'px, 0, 0)';
                setTimeout(function () {
                    methods.slideLeft(t); // hack for prevent overwrite transitionDuration
                }, 10);
            } else {
                s.pos += 176;
                style.transitionDuration = t + 's';
                style.transform = 'translate3d(' + s.pos + 'px, 0, 0)';
                methods.slideAuto();
            }
        },
        slideRight: function (t) {
            var s = data.slider;
            var style = ref_slider[0].style;

            clearInterval(s.auto);

            if (s.pos === s.min) {
                s.pos = s.start;
                style.transitionDuration = '0s';
                style.transform = 'translate3d(' + s.pos + 'px, 0, 0)';
                setTimeout(function () {
                    methods.slideAuto();
                    methods.slideRight(t); // hack for prevent overwrite transitionDuration
                }, 10);
            } else {
                s.pos -= 176;
                style.transitionDuration = t + 's';
                style.transform = 'translate3d(' + s.pos + 'px, 0, 0)';
                methods.slideAuto();
            }
        },
        fillCache: function () {
            var symbs = data.price_widget_symbols;
            var cache = data.price_widget_cache;

            for (var i = 0, s, len = symbs.length;i < len;i++) {
                s = symbs[i];
                if (!cache[s]) {
                    cache[s] = {
                        sym: s,
                        bid: '',
                        ask: '',
                        spread: '',
                        change: '',
                        bidStyle: '',
                        askStyle: '',
                        spreadStyle: '',
                        changeStyle: ''
                    };
                }
            }
        },
        handleScroll: function () {
            var header = $('#pink-header');
            var anchor = $('#scroll-spy-for-pink-header');

            var position = window.scrollY;
            var limit = 4000
            var ready = true;
            var show = false;

            function onscroll() {
                if (position > limit) {
                    $('.global-markets-today').removeClass('not-scrolled')
                }

                if ($('html').is('.touch-device')) {
                    var current = position > anchor.offset().top;
                    if (current === show) return;
                    show = current;
                    if (show) {
                        header.slideDown();
                    } else {
                        header.slideUp();
                    }
                }
            }

            onscroll();

            window.addEventListener('scroll', function () {
                position = window.scrollY;

                if (ready) {
                    window.requestAnimationFrame(function() {
                        onscroll();
                        ready = true;
                    });
                }

                ready = false;
            });
        },
        renderFormattedData: function(quote_widget) {
            if (!quote_widget) return;
            var format = quote_widget.format;
            var bid = quote_widget.bid;
            var ask = quote_widget.ask;
            switch (format) {
                case '15':
                    quote_widget.bid1.text(bid.substring(0, 4));
                    quote_widget.bid2.text(bid.substring(4, 6));
                    quote_widget.bid3.text(bid.substring(6, 7));
                    quote_widget.ask1.text(ask.substring(0, 4));
                    quote_widget.ask2.text(ask.substring(4, 6));
                    quote_widget.ask3.text(ask.substring(6, 7));
                    break;
                case '42':
                    quote_widget.bid1.text(bid.substring(0, 5));
                    quote_widget.bid2.text(bid.substring(5, 7));
                    quote_widget.bid3.text('');
                    quote_widget.ask1.text(ask.substring(0, 5));
                    quote_widget.ask2.text(ask.substring(5, 7));
                    quote_widget.ask3.text('');
                    break;

                default:
            }
        },
        after_signalR_loaded: function () {

            /*http://qfeeder.icm:8080/live/hubs*/
            // eslint-disable-next-line
            if (typeof window['jQuery']['signalR']!=='function'){throw new Error('SignalR:\x20SignalR\x20is\x20not\x20loaded.\x20Please\x20ensure\x20jquery.signalR-x.js\x20is\x20referenced\x20before\x20~/signalr/js.');}var signalR=window['jQuery']['signalR'];function makeProxyCallback(a,b){return function(){b['apply'](a,window['jQuery']['makeArray'](arguments));};}function registerHubProxies(c,g){var d,a,b,e,f;for(d in c){if(c['hasOwnProperty'](d)){a=c[d];if(!a['hubName']){continue;}if(g){f=a['on'];}else{f=a['off'];}for(b in a['client']){if(a['client']['hasOwnProperty'](b)){e=a['client'][b];if(!$['isFunction'](e)){continue;}f['call'](a,b,makeProxyCallback(a,e));}}}}}window['jQuery']['hubConnection']['prototype']['createHubProxies']=function(){var a={};this['starting'](function(){registerHubProxies(a,!![]);this['_registerSubscribedHubs']();})['disconnected'](function(){registerHubProxies(a,![]);});a['quotesHub']=this['createHubProxy']('quotesHub');a['quotesHub']['client']={};a['quotesHub']['server']={};return a;};signalR['hub']=window['jQuery']['hubConnection']('/live',{'useDefaultPath':![]});window['jQuery']['extend'](signalR,signalR['hub']['createHubProxies']());

            $.connection.hub.url = "https://qfeeder.icmarkets.com:8080/live";
            $.connection.hub.qs = {
                'group': 'price_widget'
            };
            var cache = {};
            // eslint-disable-next-line complexity
            $.connection.quotesHub.client.update = function(quote) {
                var id = quote.Symbol.replace(".", "_");
                if (!cache[id]) cache[id] = {};

                var c = cache[id];
                var sym = quote.Symbol;

                if (data.price_widget_symbols.indexOf(sym) === -1) return;

                if (!data.price_widget_cache[c.sym]) {
                    methods.fillCache();
                }

                var date = new Date(quote.Time * 1000 - 1 * 60 * 60 * 1000);
                var direction = quote.Direction === 1 ? '↘' : '↗';
                var digits = quote.Digits;
                var bid = quote.Bid;
                var ask = quote.Ask;
                var spread = Math.round((ask - bid) * Math.pow(10, digits)) / 10;

                var prev_bid = c.bid || 0;
                var prev_ask = c.ask || 0;
                var prev_spread = c.spread || 0;
                var prev_change = c.change || 0;

                var curr_day_open = (data.daily && data.daily[sym] ? data.daily[sym].Open : 0);

                var currTime = new Date();
                if (currTime - (c.lastUpdateTime || 0) > 200) {
                    c.sym = sym;
                    c.date = date;
                    c.direction = direction;
                    c.digits = quote.Digits;
                    c.bid = bid;
                    c.ask = ask;
                    c.spread = spread;
                    c.change = 0;
                    if (curr_day_open) {
                        var ch_diff = c.bid - curr_day_open;
                        var ch_per = ch_diff * 100 / curr_day_open;
                        c.change = ch_per;
                    }

                    var change_bid = c.bid - prev_bid;
                    var change_ask = c.ask - prev_ask;
                    var change_spread = c.spread - prev_spread;
                    var change_change = c.change - prev_change;

                    var bid_style = '';
                    if (change_bid >= 0) {
                        bid_style = 'change-up';
                    } else if (change_bid < 0) {
                        bid_style = 'change-down';
                    }
                    var ask_style = '';
                    if (change_ask > 0)
                      ask_style = 'change-up';
                    else if (change_ask < 0)
                      ask_style = 'change-down';
                    var spread_style = '';
                    if (change_spread > 0)
                      spread_style = 'change-up';
                    else if (change_spread < 0)
                      spread_style = 'change-down';
                    var change_style = '';
                    if (change_change > 0)
                      change_style = 'change-up';
                    else if (change_change < 0)
                      change_style = 'change-down';

                    var d = {
                        bid: c.bid.toFixed(c.digits),
                        ask: c.ask.toFixed(c.digits),
                        spread: c.spread.toFixed(1),
                        change: (c.change > 0 ? '+' : '-') + c.change.toFixed(2) + '%',

                        bidStyle: bid_style,
                        askStyle: ask_style,
                        spreadStyle: spread_style,
                        changeStyle: change_style
                    };

                    c.data = d;

                    if (data.price_widget_cache[c.sym]) {
                        if (data.quote_widgets[c.sym]) {
                            data.quote_widgets[c.sym].symbol.text(c.sym);
                            data.quote_widgets[c.sym].change.text(d.change);
                            data.quote_widgets[c.sym].spread.text(d.spread);
                            data.quote_widgets[c.sym].widget.toggleClass('price-up', false).toggleClass('price-down', false);
                            if (d.bidStyle == 'change-up') {
                                data.quote_widgets[c.sym].widget.toggleClass('price-up', true);
                            } else if (d.bidStyle == 'change-down') {
                                data.quote_widgets[c.sym].widget.toggleClass('price-down', true);
                            }
                            data.quote_widgets[c.sym].bid = d.bid;
                            data.quote_widgets[c.sym].ask = d.ask;
                            methods.renderFormattedData(data.quote_widgets[c.sym]);
                        }
                    }
                }
                c.lastUpdateTime = currTime;
            };

            $.connection.hub.start().done(function() {
                $('.b-class').html('Connected Successful!');
            });
        }
    };

     function mounted() {

        $.connection && $.connection.hub && $.connection.hub.stop && $.connection.hub.stop();
        methods.after_signalR_loaded();
        methods.fillCache();

        for (var i = 0, len = data.price_widget_symbols.length;i < len;i++) {
            let s = data.price_widget_symbols[i];
            $.ajax({
                url: 'https://qfeeder.icmarkets.com:8080/bars/last/' + s + '?timeframe=PERIOD_D1&count=2',
                type: "GET",
                dataType: 'json',
                success: function (json) {
                    if (json && json.Bars && json.Request) {
                        var s = json.Request.Symbol;
                        var d = json.Bars[0];
                        if (s && d) {
                            data.daily[s] = d;
                        }
                    }
                },
                error: function() {
                    console.error('QFEEDER ERROR: cannot get ' + s + ' last bars'/*, arguments*/);
                }
            });
        }

        var quote_symbols = ['EURUSD','AUDUSD','GBPUSD','XAUUSD'];

        $(".quote-widget").each(function () {
            var id = $(this).attr('data-id');
            if (id && quote_symbols.indexOf(id) != -1) {
                data.quote_widgets[id] = {
                    format: $(this).attr('data-format'),
                    widget: $(this),
                    symbol: $(this).find('.quote-widget__header-symbol'),
                    change: $(this).find('.quote-widget__header-change'),
                    bid1: $(this).find('.quote-widget__content-bid .price-1'),
                    bid2: $(this).find('.quote-widget__content-bid .price-2'),
                    bid3: $(this).find('.quote-widget__content-bid .price-3'),
                    ask1: $(this).find('.quote-widget__content-ask .price-1'),
                    ask2: $(this).find('.quote-widget__content-ask .price-2'),
                    ask3: $(this).find('.quote-widget__content-ask .price-3'),
                    spread: $(this).find('.quote-widget__footer-spread .spread-value'),
                };
            }
        });
        methods.handleScroll();
        methods.slideAuto();
    }

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

    var $slider = $('.car-component .frame .car');
    $slider.html('');
    data.order.forEach(function (item, index) {
        $('<div class="im im-' + item + '" key="' + index + '"></div>').appendTo($slider);
    });

    $('.car-component .slide-left').off('click');
    $('.car-component .slide-left').on('click', function () {
        methods.slideLeft(0.1);
    });

    $('.car-component .slide-right').off('click');
    $('.car-component .slide-right').on('click', function () {
        methods.slideRight(0.1);
    });

    mounted();
}

window.home_init();
