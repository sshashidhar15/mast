/*global $*/
window.funding_init = function () {
    var currency_badge = $('.currency_map .currency_badge a');
    var cards_wrapper = $('.funding-cards-grid');
    var deposit_cards = $('.deposit-card-container');
    var selected_currency = '';
    var currency_list = $('.deposit-card-container .deposit-content .currency-list');
    currency_badge.on('click', function (event) {
        event.preventDefault();
        if ($(this).parent().hasClass('active')) {
            $(this).parent().removeClass('active');
            deposit_cards.removeClass('hidden');
        } else {
            currency_badge.parent().removeClass('active');
            deposit_cards.removeClass('hidden');
            $(this).parent().addClass('active');
            selected_currency = event.currentTarget.id.toUpperCase();
            currency_list.each(function() {
                if (!$(this).text().match(selected_currency)) {
                    $(this).parent().parent().addClass('hidden');
                }
            });
            $('html, body').animate({
                scrollTop: cards_wrapper.offset().top - 225
            }, 1000);
        }
    });
}

window.funding_init();
