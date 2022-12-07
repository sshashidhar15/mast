/*global $*/

/* <div class="price-widget-wrap"><iframe src="/price-widget/" style="margin:10px; width:268px; height:162px; border:0;"></iframe></div> */
window.price_widget_init = function () {
    var methods = {};
    var data = {
        price_widget_symbols: [
            'EURUSD',
            'AUDUSD',
            'GBPUSD',
            'XAUUSD'
            // 'GBPJPY',
            // 'USDJPY',
            // 'USDCAD',
            // 'EURJPY',
            // 'BTCUSD'
        ],
        price_widget_cache: {
            //----------------------
            // NOTE: all symbols from [data.price_widget_symbols]
            //----------------------
            // EURUSD: {
            //     // sym: 'EURUSD',
            //     // bid: 0,
            //     // ask: 0,
            //     // spread: 0,
            //     // change: 0,
            //     // bidStyle: '',
            //     // askStyle: '',
            //     // spreadStyle: '',
            //     // changeStyle: ''
            // },
        },
        quote_widgets: {
            // EURUSD: null,
            // AUDUSD: null,
            // GBPUSD: null,
            // XAUUSD: null
        },
        cache: {},
        daily: {}
    };


    methods = {
        fillCache: function (oneSymbolId) {
            var cache = data.price_widget_cache;

            if (oneSymbolId) {
                if (!cache[oneSymbolId]) {
                    cache[oneSymbolId] = {
                        sym: oneSymbolId,
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
            } else {
                var symbs = data.price_widget_symbols;
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
            }
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
        update_selector_symbols_list: function (id, symbolName) {
            methods.fillCache(id);
            // <select class="quote-widget-symbol">
            //     <option value="EURUSD" selected>EURUSD</option>
            //     <option value="AUDUSD">AUDUSD</option>
            //     <option value="GBPUSD">GBPUSD</option>
            //     <option value="XAUUSD">XAUUSD</option>
            // </select>
            var $select = $('select.quote-widget-symbol');
            $select.append($('<option value="' + id + '">' + symbolName + '</option>'));
        },
        after_signalR_loaded: function () {
            // eslint-disable-next-line
            if (typeof window['jQuery']['signalR']!=='function'){throw new Error('SignalR:\x20SignalR\x20is\x20not\x20loaded.\x20Please\x20ensure\x20jquery.signalR-x.js\x20is\x20referenced\x20before\x20~/signalr/js.');}var signalR=window['jQuery']['signalR'];function makeProxyCallback(a,b){return function(){b['apply'](a,window['jQuery']['makeArray'](arguments));};}function registerHubProxies(c,g){var d,a,b,e,f;for(d in c){if(c['hasOwnProperty'](d)){a=c[d];if(!a['hubName']){continue;}if(g){f=a['on'];}else{f=a['off'];}for(b in a['client']){if(a['client']['hasOwnProperty'](b)){e=a['client'][b];if(!$['isFunction'](e)){continue;}f['call'](a,b,makeProxyCallback(a,e));}}}}}window['jQuery']['hubConnection']['prototype']['createHubProxies']=function(){var a={};this['starting'](function(){registerHubProxies(a,!![]);this['_registerSubscribedHubs']();})['disconnected'](function(){registerHubProxies(a,![]);});a['quotesHub']=this['createHubProxy']('quotesHub');a['quotesHub']['client']={};a['quotesHub']['server']={};return a;};signalR['hub']=window['jQuery']['hubConnection']('/live',{'useDefaultPath':![]});window['jQuery']['extend'](signalR,signalR['hub']['createHubProxies']());

            $.connection.hub.url = "https://qfeeder.icmarkets.com:8080/live";
            $.connection.hub.qs = {
                'group': 'price_widget'
            };
            var cache = data.cache;
            // eslint-disable-next-line complexity
            $.connection.quotesHub.client.update = function(quote) {
                var id = quote.Symbol.replace(".", "_");
                if (!cache[id]) {
                    cache[id] = {};
                    methods.update_selector_symbols_list(id, quote.Symbol);
                }

                var c = cache[id];
                var sym = quote.Symbol;

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
                if (currTime - (c.lastUpdateTime || 0) > /*200*/0) {
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
                        // var ch_pip = ch_diff * Math.pow(10, quote.Digits - 1);
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
                $('html').toggleClass('wait-for-initialize', false);
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
                // error:function(){
                    // console.error(arguments);
                // }
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

        $(".quote-widget select.quote-widget-symbol").on('change', function () {
            var $widget = $(this).closest(".quote-widget");
            var id = $(this).val();
            $widget.attr('data-id', id);
            var format = '15'; // '42'
            var formatClass = '';
            var digits = data.cache[id] ? data.cache[id].digits : 5;
            if (digits > 4) {
                format = '15';
            } else {
                format = '42';
            }
            switch (format) {
                case '42':
                    formatClass = 'format-4-2';
                    break;
                case '15':
                    formatClass = 'format-1-5';
                    break;
                default:
                    formatClass = 'format-1-5';
            }
            $widget.attr('data-format', format);
            $widget.toggleClass('format-1-5', false).toggleClass('format-4-2', false);
            $widget.toggleClass(formatClass, true);
            data.quote_widgets = {};
            data.quote_widgets[id] = {
                format: $widget.attr('data-format'),
                widget: $widget,
                symbol: $widget.find('.quote-widget__header-symbol'),
                change: $widget.find('.quote-widget__header-change'),
                bid1: $widget.find('.quote-widget__content-bid .price-1'),
                bid2: $widget.find('.quote-widget__content-bid .price-2'),
                bid3: $widget.find('.quote-widget__content-bid .price-3'),
                ask1: $widget.find('.quote-widget__content-ask .price-1'),
                ask2: $widget.find('.quote-widget__content-ask .price-2'),
                ask3: $widget.find('.quote-widget__content-ask .price-3'),
                spread: $widget.find('.quote-widget__footer-spread .spread-value'),
            };

            var c = data.cache[id];
            var d = c.data;
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
        });
    }
    mounted();
};

window.price_widget_init();
