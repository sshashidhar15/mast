/*global $, ICMLocale, ICMTranslations, isEditing, LOCALES, InlineEditor, Cookies*/
const TRANSLATIONS = 'translations-' + ICMLocale;
const EDIT_TRANSLATIONS = 'edit_translations';
const REGULATOR = location.pathname.split('/')[1];
const cache = localStorage.getItem(TRANSLATIONS);
let storage;

storage = cache ? JSON.parse(cache) : {};

function initiateCache(storage) {
    Object.keys(storage).forEach(function (key) {
        var value = storage[key];
        if (isEditing) {
            var $temp = $('<div>' + value + '</div>');
            var $all = $temp.find('>*');
            if ($all.length === 1) {
                value = '<p>' + value + '</p>';
            }
            $('[data-t-key="' + key + '"]').attr('modified', 1).html(value);
        } else {
            $('[data-t-key="' + key + '"]').html(value);
        }
    });
}

function getBaseValue(key) {
    let keys = key.split('.');
    let current = ICMTranslations;
    let part;
    while (part = keys.shift()) {
        current = current[part];
    }
    return current;
}

$(document).ready(function () {
    $('.translator-editor').attr('modified', 0);
    initiateCache(storage, false);

    if (isEditing) {
        // create one controls on the page
        var $controls = $(`
            <div class="translator-editor-controls" contenteditable="false">
                <button class="translator-editor-controls-button translator-editor-controls-button_apply">OK</button>
                <button class="translator-editor-controls-button translator-editor-controls-button_apply_all" title="Apply changes to all supported languages">ALL</button>
                <button class="translator-editor-controls-button translator-editor-controls-button_reset" title="Revert current changes to the original">REVERT</button>
            </div>
        `);
        $controls.hide();
        $('body').append($controls);
        // $controls.fadeIn();

        var $controls_ok = $controls.find('.translator-editor-controls-button_apply');
        var $controls_all = $controls.find('.translator-editor-controls-button_apply_all');
        var $controls_revert = $controls.find('.translator-editor-controls-button_reset');

        // eslint-disable-next-line func-style
        var updateControlsPosition = function () {
            setTimeout(function () {
                var $el = $controls[0].$_editable_el;
                var position = $el.offset();
                $controls.css({left: position.left, top: position.top + $el.height() + 5 });
            }, 500);
        };

        // eslint-disable-next-line func-style
        var updateControlButtons = function (settings) {
            let ss = settings;
            if (settings === false) {
                $controls_ok.hide();
                $controls_all.hide();
                $controls_revert.hide();
                return;
            }
            setTimeout(function () {
                var isAll = (ss && typeof ss.isAll !== 'undefined') ? ss.isAll : null;
                var isRevert = (ss && typeof ss.isRevert !== 'undefined') ? ss.isRevert : null;
                if (settings === true) {
                    isAll = true;
                    isRevert = true;
                }
                $controls_ok.hide();
                if (isAll !== null) {
                    if (isAll) {
                        $controls_all.show();
                    } else {
                        $controls_all.hide();
                    }
                }
                if (isRevert !== null) {
                    if (isRevert) {
                        $controls_revert.show();
                    } else {
                        $controls_revert.hide();
                    }
                }
            }, 500);
        };

        // eslint-disable-next-line func-style
        var getCurrentValue = function() {
            var $editor = $controls[0].$_editable_el;
            if ($editor.length && $editor[0].ckeditorInstance) {
                var $temp = $('<div>' + $editor[0].ckeditorInstance.getData() + '</div>');
                var $all = $temp.find('>*');
                if ($all.length === 1) {
                    return $all.html();
                }
                return $temp.html();
            }
            return $editor.find('>p').first().html();
        };

        $controls.on('click', '.translator-editor-controls-button_apply', function (e) {
            e.preventDefault();
            if ($controls[0] && !$controls[0].$_editable_el) return;

            var $editor = $controls[0].$_editable_el;
            var key = $editor.data('t-key');
            var value = getCurrentValue();

            // check is value changed, and do nothing if equal
            var current = getBaseValue(key);
            if (current === value) {
                let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 0);}, 300);
                return;
            }
            let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 1);}, 300);
            storage[key] = value;
            localStorage.setItem(TRANSLATIONS, JSON.stringify(storage));
        });

        $controls.on('click', '.translator-editor-controls-button_apply_all', function (e) {
            e.preventDefault();
            if ($controls[0] && !$controls[0].$_editable_el) return;

            var $editor = $controls[0].$_editable_el;
            var key = $editor.data('t-key');
            var value = getCurrentValue();

            // check is value changed, and do nothing if equal
            var current = getBaseValue(key);
            if (current === value) return;

            if (confirm(`Do you want to apply value "${value}" for key "${key}" for ALL languages?`)) {
                storage[key] = value;
                LOCALES.forEach(function (one_locale) {
                    var tr_key = 'translations-' + one_locale.code;
                    var tr_storage = JSON.parse(localStorage.getItem(tr_key)) || {};
                    tr_storage[key] = value;
                    localStorage.setItem(tr_key, JSON.stringify(tr_storage));
                });
            }
        });

        $controls.on('click', '.translator-editor-controls-button_reset', function (e) {
            e.preventDefault();
            if ($controls[0] && !$controls[0].$_editable_el) return;

            var $editor = $controls[0].$_editable_el;
            var key = $editor.data('t-key');
            var value = getCurrentValue();

            // check is value changed, and do nothing if equal
            var current = getBaseValue(key);
            if (current === value) return;

            var $temp = $('<div>' + current + '</div>');
            var $all = $temp.find('>*');
            if ($all.length === 1) {
                current = '<p>' + current + '</p>';
            }
            $editor[0].ckeditorInstance.setData(current);

            for (var i in LOCALES) {
                if (LOCALES.hasOwnProperty(i)) {
                    let tr_key = 'translations-' + LOCALES[i].code;
                    let tr_storage = null;
                    try {
                        tr_storage = JSON.parse(localStorage.getItem(tr_key));
                    } catch (er) {
                        tr_storage = null;
                    }
                    if (tr_storage) {
                        delete tr_storage[key];
                        localStorage.setItem(tr_key, JSON.stringify(tr_storage));
                    }
                }
            }

            let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 0);}, 300);
        });

        $('.translator-editor').on('click', function(e) {
            e.preventDefault();
        });

        $('.translator-editor').on('mouseenter', function(e) {
            var dom_el = $(e.currentTarget).length ? $(e.currentTarget)[0] : null;
            // $(e.currentTarget).parent().css({position: 'relative'});
            if (dom_el && !dom_el._has_editor) {
                InlineEditor
                    .create(dom_el, {
                        toolbar: ['heading', '|', 'bold', 'italic', 'link', '|', 'insertTable', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                        link: {
                            addTargetToExternalLinks: true
                        },
                        heading: {
                            options: [
                                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                { model: 'heading3', view: 'span', title: 'Normal', class: 'ck-heading_span' }
                            ]
                        },
                        table: {
                            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                        },
                    })
                    .then(editor => {
                        editor.model.document.on( 'change:data', () => {
                            var $editor = $controls[0].$_editable_el;
                            var key = $editor.data('t-key');
                            var value = getCurrentValue();
                            // check is value changed, and do nothing if equal
                            var current = getBaseValue(key);
                            if (current === value) {
                                let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 0);}, 300);
                                updateControlButtons(false);
                            } else {
                                let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 1);}, 300);
                                updateControlButtons(true);
                            }
                            updateControlsPosition();
                        } );
                        // console.log('Editor INITIALIZED', dom_el);
                    })
                    .catch(err => {
                        console.error('Editor ERROR:', err.message);
                    });
                dom_el._has_editor = 1;
            }
        });

        $('.translator-editor').on('blur', function() {
            var $editor = $controls[0].$_editable_el;
            var key = $editor.data('t-key');
            var value = getCurrentValue();
            // check is value changed, and do nothing if equal
            var current = getBaseValue(key);
            if (current === value) {
                let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 0);}, 300);
                $controls.fadeOut();
                return;
            }

            storage[key] = value;
            localStorage.setItem(TRANSLATIONS, JSON.stringify(storage));

            let $_ed = $editor;setTimeout(function () {$_ed.attr('modified', 1);}, 300);
            $controls.fadeOut();
        });

        $('.translator-editor').on('focus', function (e) {
            var $el = $(e.currentTarget);
            $controls[0].$_editable_el = $el;

            var $editor = $controls[0].$_editable_el;
            var key = $editor.data('t-key');
            var value = getCurrentValue();
            // check is value changed, and do nothing if equal
            var current = getBaseValue(key);
            if (current === value) {
                updateControlButtons(false);
            } else {
                updateControlButtons(true);
            }
            $controls.fadeIn();
            updateControlsPosition();
        });
    }

    $('.translator-controls-button_apply').on('click', () => {
        $('.translator-controls-button_apply').attr('disabled', 'disabled').html('<b>🔃</b>')
        fetch(
            '/' + REGULATOR + '/' + ICMLocale + '/translation',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    map_lang_translations: [ICMLocale].reduce(
                        (acc, lang) => {
                            acc[lang] = JSON.parse(localStorage.getItem('translations-' + lang))
                            return acc
                        },
                        {}
                    )
                })
            }
        )
            .then(() =>
                $('.translator-controls-button_apply').removeAttr('disabled').text('Apply')
            )
    })

    $('.translator-controls-button_apply_all').on('click', () => {
        $('.translator-controls-button_apply_all').attr('disabled', 'disabled').html('<b>🔃</b>')
        fetch(
            '/' + REGULATOR + '/' + ICMLocale + '/translation',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    map_lang_translations: LOCALES.reduce(
                        (acc, l) => {
                            const translations = JSON.parse(localStorage.getItem('translations-' + l.code))
                            const has_changes = Object.keys(translations).length !== 0
                            if (has_changes) acc[l.code] = translations
                            return acc
                        },
                        {}
                    )
                })
            }
        )
            .then(() =>
                $('.translator-controls-button_apply_all').removeAttr('disabled').text('Apply ALL')
            )
    })

    $('.translator-controls-button_help').on('click', () => {
        $('#guide').fadeIn(500);
    })

    $('.translator-controls-button_logout').on('click', () => {
      Cookies.remove('translator_token')
      location.reload()
    })
    $('.translator-controls-button_edit').on('click', () => {
        let doEdit = Cookies.get(EDIT_TRANSLATIONS)

        if (doEdit) {
            Cookies.remove(EDIT_TRANSLATIONS)
        } else {
            Cookies.set(EDIT_TRANSLATIONS, true)
        }

        location.reload()
    })

    $('.translator-controls-button_clear').on('click', () => {
        storage = {};
        localStorage.setItem(TRANSLATIONS, JSON.stringify(storage));
        location.reload();
    })

    $('.translator-controls-button_clear_all').on('click', () => {
        storage = {};
        $('.translator-controls-button_clear_all').attr('disabled', 'disabled').html('<b>🔃</b>');
        for (var i in LOCALES) {
            if (LOCALES.hasOwnProperty(i)) {
                let tr_key = 'translations-' + LOCALES[i].code;
                localStorage.setItem(tr_key, JSON.stringify(storage));
            }
        }
        $('.translator-controls-button_clear_all').removeAttr('disabled').text('Clear ALL');
        location.reload();
    })
})
