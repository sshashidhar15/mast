//----------
// needed changes to CanvasRenderingContext2D.prototype
//----------
var	CanvasRenderingContext2D_prototype_moveTo = CanvasRenderingContext2D.prototype.moveTo;
var	CanvasRenderingContext2D_prototype_lineTo = CanvasRenderingContext2D.prototype.lineTo;
var	CanvasRenderingContext2D_prototype_fillRect = CanvasRenderingContext2D.prototype.fillRect;
var	CanvasRenderingContext2D_prototype_strokeRect = CanvasRenderingContext2D.prototype.strokeRect;
var	CanvasRenderingContext2D_prototype_rect = CanvasRenderingContext2D.prototype.rect;
var	CanvasRenderingContext2D_prototype_drawImage = CanvasRenderingContext2D.prototype.drawImage;
var	CanvasRenderingContext2D_prototype_clearRect = CanvasRenderingContext2D.prototype.clearRect;
var	CanvasRenderingContext2D_prototype_arcTo = CanvasRenderingContext2D.prototype.arcTo;

CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
    x = x > 0 ? ~~(x) : x;
    y = y > 0 ? ~~(y) : y;
    if (this.lineWidth % 2 !== 0) {
        x += 0.5;
        y += 0.5;
    }
    CanvasRenderingContext2D_prototype_moveTo.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.lineTo = function(x, y) {
    x = x > 0 ? ~~(x) : x;
    y = y > 0 ? ~~(y) : y;
    if (this.lineWidth % 2 !== 0) {
        x += 0.5;
        y += 0.5;
    }
    CanvasRenderingContext2D_prototype_lineTo.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
    x = ~~(x);
    y = ~~(y);
    w = ~~(w);
    h = ~~(h);
    CanvasRenderingContext2D_prototype_fillRect.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.strokeRect = function(x, y, w, h) {
    x = ~~(x);
    y = ~~(y);
    w = ~~(w);
    h = ~~(h);
    CanvasRenderingContext2D_prototype_strokeRect.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.rect = function(x, y, w, h) {
    x = ~~(x);
    y = ~~(y);
    w = ~~(w);
    h = ~~(h);
    CanvasRenderingContext2D_prototype_rect.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.drawImage = function(c, sx, sy, sw, sh, dx, dy, dw, dh) {
    sx = ~~(sx);
    sy = ~~(sy);
    dx = ~~(dx);
    dy = ~~(dy);

    if (sx < 0) {
        sw = sw + sx;
        sx = 0;
    }

    if (sy < 0) {
        sh = sh + sy;
        sy = 0;
    }

    if (dx < 0) {
        dw = dw + dx;
        dx = 0;
    }

    if (dy < 0) {
        dh = dh + dy;
        dy = 0;
    }

    sw = Math.max(1, Math.floor(sw));
    sh = Math.max(1, Math.floor(sh));
    dw = Math.max(1, Math.floor(dw));
    dh = Math.max(1, Math.floor(dh));

    CanvasRenderingContext2D_prototype_drawImage.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.clearRect = function(x, y, w, h) {
    x = ~~(x);
    y = ~~(y);
    w = ~~(w);
    h = ~~(h);
    CanvasRenderingContext2D_prototype_clearRect.apply(this, arguments);
};

CanvasRenderingContext2D.prototype.arcTo = function(x1, y1, x2, y2, r) {
    x1 = ~~(x1);
    y1 = ~~(y1);
    x2 = ~~(x2);
    y2 = ~~(y2);
    if (this.lineWidth % 2 !== 0) {
        x1 += 0.5;
        y1 += 0.5;
        x2 += 0.5;
        y2 += 0.5;
    }
    CanvasRenderingContext2D_prototype_arcTo.apply(this, arguments);
};

//----------
// add support dashed lines to CanvasRenderingContext2D.prototype
//----------
try { CanvasRenderingContext2D.prototype.dashedLine = function (x1, y1, x2, y2, dashLen, color, width, cap) { this.save(); this.beginPath(); this.strokeStyle = color || this.strokeStyle || 'red'; this.lineWidth = width || 1; this.lineCap = cap || 'butt'; if (typeof dashLen == 'undefined') dashLen = 2; this.moveTo(x1, y1); var dX = x2 - x1; var dY = y2 - y1; var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen); var dashX = dX / dashes; var dashY = dY / dashes; var q = 0; while (q++ < dashes) { x1 += dashX; y1 += dashY; this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1 + 0.5, y1 + 0.5); }; this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2 + 0.5, y2 + 0.5); this.stroke(); this.restore(); }; } catch (ex) { }
try { CanvasRenderingContext2D.prototype.dashedLinePattern = function (x0, y0, x1, y1, pattern, color, width, cap) { this.save(); this.beginPath(); this.strokeStyle = color || this.strokeStyle || 'red'; this.lineWidth = width || 1; this.lineCap = cap || 'butt'; var length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)); var vector = { x: (x1 - x0) / length, y: (y1 - y0) / length }; var dist = 0; var i = 0; pattern = pattern && pattern.length ? pattern : [4, 4]; while (dist < length) { var dashLength = Math.min(pattern[i++ % pattern.length], length - dist); var draw = (i % 2); dist += dashLength; draw && this.moveTo(x0 + 0.5, y0 + 0.5); x0 += dashLength * vector.x; y0 += dashLength * vector.y; draw && this.lineTo(x0 + 0.5, y0 + 0.5); } this.stroke(); this.restore(); }; } catch (ex) { alert('Your bowser does not support HTML5!'); }

//----------
// Cross-browser requestAnimationFrame
//----------
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - (typeof lastTime != 'undefined' ? lastTime : 0)));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        }
    })();
}

//----------
// Cross-browser cancelAnimationFrame
//----------
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    }
}

//----------
// Common extension of String prototype
//----------
String.prototype.escape = function () { return this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace('/','\\/'); }
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
String.prototype.triml = function (s) { return this.replace('/^(' + s + ')+/', ''); };
String.prototype.trimr = function (s) { return this.replace(new RegExp(s + "+$"), ''); };
String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
String.prototype.contains = function (it) { return this.indexOf(it) != -1 };
String.prototype.rep = function (searc, replac) { return this.split(searc).join(replac) };
String.prototype.reverse = function () { splitext = this.split(""); revertext = splitext.reverse(); reversed = revertext.join(""); return reversed };
String.prototype.removeFirst = function () { return (this.substring(1, this.length)) };
String.prototype.removeLast = function () { return (this.substring(0, this.length - 1)) };
String.prototype.getFirst = function () { return (this.substring(0, 1)) };
String.prototype.getLast = function () { return (this.substring(this.length - 1, this.length)) };
String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.slice(1); };
String.prototype.decapitalize = function () { return this.charAt(0).toLowerCase() + this.slice(1); };
String.prototype.startsWith = function (str) {
    var raw = this.replace(/\[|\|\(|\)|\\|\.|\^|\$|\||\?|\+]/g, '_');
    var cpr = str.replace(/\[|\|\(|\)|\\|\.|\^|\$|\||\?|\+]/g, '_');
    return (raw.match("^" + cpr) == cpr);
};
String.prototype.endsWith = function (str) {
    var raw = this.replace(/\[|\|\(|\)|\\|\.|\^|\$|\||\?|\+]/g, '_');
    var cpr = str.replace(/\[|\|\(|\)|\\|\.|\^|\$|\||\?|\+]/g, '_');
    return (raw.match(cpr + "$") == cpr);
};

//----------
// Common library (isolated to separated object as Class)
//----------
var ___ = function () {
    var me = this;

    var me_getElement = function (el) {
        if (typeof el == 'undefined' || el == null) return null;
        if (typeof el == 'string') el = document.getElementById(el);
        if (typeof el === 'object') {
            if (typeof el.jquery != 'undefined' && typeof el.jquery == 'string') {
                return el.get(0);
            } else {
                return el;
            }
        }
        else
            return null;
    };
    
    this.no = function() {
        /// <summary>Stop Events Run</summary>
        /// <param name="event" type="object">Event object</param>
        /// <param name="isNeedStopPropagation" type="boolean">StopPropagation</param>
        /// <param name="isNeedCancelBubble" type="boolean">CancelBubble</param>
        var e = arguments[0];
        if (typeof e.preventDefault !== 'undefined') e.preventDefault();
        if (typeof arguments[1] !== 'undefined' && arguments[1] === true)
            if (typeof e.stopPropagation !== 'undefined') e.stopPropagation();
        if (typeof arguments[2] !== 'undefined' && arguments[2] === true)
            if (typeof e.cancelBubble !== 'undefined') e.cancelBubble = true;
        if (typeof e.returnValue !== 'undefined') e.returnValue = false;
    };

    this.toJSON = function(obj) {
        /// <summary>Convert Object to JSON format (string)</summary>
        /// <param name="obj" type="object">object to covert</param>
        var res = null;
        if (typeof obj === 'object')
            if (typeof JSON != 'undefined' && typeof JSON.stringify != 'undefined')
                res = JSON.stringify(obj);
        return res;
    };
    
    this.fromJSON = function(str) {
        /// <summary>Parse string from JSON format to new Object</summary>
        /// <param name="str" type="string">JSON string to parse</param>
        var res = null;
        if (typeof str === 'string') {
            if (typeof JSON != 'undefined' && typeof JSON.parse != 'undefined') {
                try {
                    res = JSON.parse(str);
                } catch (ee) {
                    res = eval(str);
                }
            } else {
                res = eval(str);
            }
        }
        return res;
    };

    this.store = function (key, val, storage) {
        /// <summary>Set data to LOCAL or SESSION STORAGE</summary>
        /// <param name="key" type="string">key name</param>
        /// <param name="val" type="string">value of key</param>
        /// <param name="storage" type="boolean">true for Session Storage</param>
        if (typeof key != 'undefined') {
            if (typeof storage == 'undefined') {
                if (typeof window.localStorage != 'undefined' && typeof window.localStorage.setItem != 'undefined') {
                    window.localStorage.setItem(key, val);
                }
            } else {
                if (typeof window.sessionStorage != 'undefined' && typeof window.sessionStorage.setItem != 'undefined') {
                    window.sessionStorage.setItem(key, val);
                }
            }
            return true;
        }
        return false;
    };
    
    this.restore = function (key, storage) {
        /// <summary>Get data from LOCAL or SESSION STORAGE</summary>
        /// <param name="key" type="string">key name</param>
        /// <param name="storage" type="boolean">true for Session Storage</param>
        var res;
        if (typeof key != 'undefined') {
            if (typeof storage == 'undefined') {
                if (typeof window.localStorage != 'undefined' && typeof window.localStorage.getItem != 'undefined') {
                    res = window.localStorage.getItem(key);
                }
            } else {
                if (typeof window.sessionStorage != 'undefined' && typeof window.sessionStorage.getItem != 'undefined') {
                    res = window.sessionStorage.getItem(key);
                }
            }
        }
        return res;
    };

    this.unstore = function (key, storage) {
        /// <summary>Delete data from LOCAL STORAGE</summary>
        /// <param name="key" type="string">key name to delete (or empty to clear all)</param>
        /// <param name="storage" type="boolean">true for Session Storage</param>
        if (typeof storage == 'undefined') {
            if (typeof window.localStorage != 'undefined' && typeof window.localStorage.getItem != 'undefined') {
                if (typeof key != 'undefined') {
                    return window.localStorage.removeItem(key);
                } else {
                    return window.localStorage.clear();
                }
            }
        } else {
            if (typeof window.sessionStorage != 'undefined' && typeof window.sessionStorage.getItem != 'undefined') {
                if (typeof key != 'undefined') {
                    return window.sessionStorage.removeItem(key);
                } else {
                    return window.sessionStorage.clear();
                }
            }
        }
        return false;
    };

    this.compare = function (a, b, reverse) {
        /// <summary>Compare two parameters (ex. use with [].sort)</summary>
        /// <param name="a" type="any">first parameter</param>
        /// <param name="b" type="any">second parameter</param>
        if (reverse) {
            if (a > b) { return -1 } else if (a < b) { return 1 } else { return 0 }
        } else {
            if (a > b) { return 1 } else if (a < b) { return -1 } else { return 0 }
        }
    };

    this.cls = function (el, css_class_name) {
        /// <summary>Set|Get CSS class name (and return [el] after success Set)</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="css_class_name" type="string">CSS class name to set (if empty - return CSS class name as get)</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.className != 'undefined') {
            if (typeof css_class_name == 'undefined') {
                return el.className;
            } else {
                el.className = '' + css_class_name + "";
                return el;
            }
        }
        return false;
    };
    
    this.style = function (el, css_rules) {
        /// <summary>Set|Get in-line CSS rules into|from [style] attribute (and return [el] after success Set)</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="class_rules" type="string">CSS rules to set (or empty to Get)</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined') {
            if (typeof css_rules == 'undefined') {
                return me.attr(el, 'style');
            } else {
                me.attr(el, 'style', '' + css_rules + "");
                return el;
            }
        }
        return false;
    };
    
    this.hcls = function (el, class_style) {
        /// <summary>Has class style name</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="class_style" type="string">style class name to detect</param>
        if (typeof class_style == 'undefined') return false;
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.className != 'undefined') {
            return el.className.contains(class_style);
        }
        return false;
    };

    this.acls = function (el, class_to_add) {
        /// <summary>Add style class (and return [el] after success add)</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="class_to_add" type="string">style class name to add</param>
        if (typeof class_to_add == 'undefined') return false;
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.className != 'undefined') {
            if (el.className.contains(class_to_add)) return false;
            el.className = (el.className + ' ' + class_to_add).trim();
            return el;
        }
        return false;
    };

    this.rcls = function (el, class_to_remove) {
        /// <summary>Remove style class (and return [el] after success remove)</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="class_to_remove" type="string">style class name to remove (if absent - remove [class] attribute)</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.className != 'undefined') {
            if (typeof class_to_remove != 'undefined') {
                var cls = el.className;
                el.className = cls.replace(class_to_remove, '').trim();
                return el;
            } else {
                me.rattr(el, 'class');
                return el;
            }
        }
        return false;
    };

    this.even = function(number) {
        /// <summary>Is number Even</summary>
        /// <param name="number" type="number">return (number % 2 == 0)</param>
        return (number % 2 == 0);
    };

    this.isarr = function (array) {
        /// <summary>Detect is it Array</summary>
        /// <param name="array" type="array[]">array (not object)</param>
        return Object.prototype.toString.apply(array) === '[object Array]';
    };
    
    this.rifa = function (array, item) {
        /// <summary>Remove Item From Array</summary>
        /// <param name="array" type="array[]/object{}">array or object</param>
        /// <param name="item" type="array[]/object{}">first level keyName of item for remove it</param>
        var new_arr = [];
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                if (array[i] != item) {
                    new_arr.push(array[i]);
                }
            }
        }
        array = new_arr;
        return array;
    };

    this.dt = function(date, isTimeFirst, useLocalTimeZone, dateDelimiter, timeDelimiter, currentTimeZoneOffset, showMilliseconds, millisecondsDelimiter) {
        /// <summary>Get DATE and TIME (return: formated string)</summary>
        /// <param name="date" type="date|number|string">date</param>
        /// <param name="isTimeFirst" type="boolean">for return time first before date</param>
        /// <param name="useLocalTimeZone" type="boolean">change date to local TimeZone</param>
        /// <param name="dateDelimiter" type="string">delimiter (default '-')</param>
        /// <param name="timeDelimiter" type="string">delimiter (default ':')</param>
        dateDelimiter = dateDelimiter || '.';
        timeDelimiter = timeDelimiter || ':';
        millisecondsDelimiter = millisecondsDelimiter || '.';
        currentTimeZoneOffset = currentTimeZoneOffset || new Date().getTimezoneOffset();
        showMilliseconds = showMilliseconds || false;
        //currentTimeZoneOffset *= 60;
        if (typeof date == 'string') {
            // only for parsing DOS time format "Mon 01/20/2014  9:45:28.10"
            // from file created by TeamCity: jsVersion.txt
            if (date.contains('.') && date.contains(':') && date.contains(' ')) {
                var raw = date.split(' ');
                var part = '';
                var dt = new Date();
                var dr = 0;
                var tr = '';
                for (var i = 0; i < raw.length; i++) {
                    part = raw[i];
                    if (part.contains('/')) { // date
                        dr += Date.parse(part);
                    } else
                        if (part.contains('.') && !part.contains(':')) { // date
                            dr += Date.parse(part);
                        } else
                            if (part.contains('-')) { // date
                                dr += Date.parse(part);
                            }
    
                    if (part.contains(':') && part.contains('.')) { // time
                        tr = part.split('.')[0];
                    } else
                        if (part.contains(':') && part.contains(',')) { // time
                            tr = part.split(',')[0];
                        } else
                            if (part.contains(':')) { // time
                                tr = part;
                            }
                }
                dt.setTime(dr);
                var composedDateTime = dt.toDateString() + ' ' + tr;
                var datetime = Date.parse(composedDateTime);
                date = new Date(datetime);
            } else {
                date = new Date(parseInt(date, 10));
            }
        } else if (typeof date == 'undefined' || date === null) {
            date = new Date();
            date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset());    
        } else if (typeof date != 'date') {date = new Date(parseInt(date, 10));}
       var d = date;
        useLocalTimeZone = useLocalTimeZone || true;
        var h = '' + d.getHours(); if(h.length < 2) h = '0' + h;
        var m = '' + d.getMinutes(); if (m.length < 2) m = '0' + m;
        var s = '' + d.getSeconds(); if (s.length < 2) s = '0' + s;
        var ms = '' + d.getMilliseconds(); if (ms.length < 2) ms = '00' + s; if (ms.length < 3) ms = '0' + s;
        var y = '' + d.getFullYear();
        var i_i = (d.getMonth() + 1);
        var ii = '' + i_i; if (ii.length < 2) ii = '0' + ii;
        var a = '' + d.getDate(); if (a.length < 2) a = '0' + a;
        var dxx = a + dateDelimiter + ii + dateDelimiter + y;
        var txx = h + timeDelimiter + m + timeDelimiter + s;
        var res = "";
        if (isTimeFirst) {
            res = txx + (showMilliseconds ? millisecondsDelimiter + ms : '') + " " + dxx;
        } else {
            res = dxx + " " + txx + (showMilliseconds ? millisecondsDelimiter + ms : '');
        }
        return res;
    };
    
    if ([].indexOf) {
        this.iof = function (array, value) {
            /// <summary>Cross-browser [].indexOf</summary>
            if (typeof array != "undefined" && typeof value != "undefined")
                return array.indexOf(value);
            else return -1;
        }
    } else {
        this.iof = function (array, value) {
            /// <summary>Cross-browser [].indexOf</summary>
            if (typeof array != "undefined" && typeof value != "undefined") {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i] === value) return i;
                }
            }
            return -1;
        };
    }

    this.arrdel = function (array, key) {
        /// <summary>Change array without deleted item by key</summary>
        /// <param name="array" type="array[]/object{}">array or object for DELETE item by key</param>
        /// <param name="key" type="number">key of item to DELETE</param>
        if (typeof array == 'undefined' || typeof key == 'undefined') return false;
        var withoutDeletedItemArray = [];
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                if (i != key) {
                    withoutDeletedItemArray[i] = (array[i]);
                }
            }
        }
        return withoutDeletedItemArray;
    };

    this.arrsli = function (array, start, count) {
        /// <summary>Get new Sliced array (range of input array)</summary>
        /// <param name="array" type="array[]/object{}">array or object for SLICE</param>
        /// <param name="start" type="number">index of start element to SLICE</param>
        /// <param name="count" type="number">count of array items for SLICE (delete)</param>
        if (typeof array == 'undefined') return false;
        if (typeof start == 'undefined') start = 0;
        var len = me.arrlen(array);
        if (typeof count == 'undefined') count = len;
        var i, index = 0, slicedArray = [];
        for (i = 0; i < len; i++) {
            if ((index >= start) && (index < (start + count))) {
                slicedArray.push(array[i]);
            }
            index++;
        }
        return slicedArray;
    };

    this.arrkey = function (array, item) {
        /// <summary>Get keyName of array(object) Item (return: from 0 to this.arrlen(array) or false if absent)</summary>
        /// <param name="array" type="array[]/object{}">array or object for calculate it first childrens count</param>
        /// <param name="item" type="string">key value of item to get this counted index</param>
        var key = false;
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                if (array[i] === item) {
                    key = i;
                    break;
                };
            }
        }
        return key;
    };


    this.arrlen = function (array) {
        /// <summary>Get Length of Array (return: array[] or object{only first level} length)</summary>
        /// <param name="array" type="array[]/object{}">array or object for calculate it first childrens count</param>
        var len = 0;
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                len++;
            }
        }
        return len;
    };

    this.clone = function (o) {
        /// <summary>Clone Object (return: object copy) Example: var copyObj = cloneObject(sourceObj); Warning: do not try clone DOM-object!</summary>
        /// <param name="o" type="object">object for create it copy</param>
        if (o == null) return o;
        if ('object' !== typeof o) {
            return o;
        }
        var c = 'function' === typeof o.pop ? [] : {};
        var p, v;
        for (p in o) {
            if (o.hasOwnProperty(p)) {
                v = o[p];
                if (typeof v === 'object') {
                    if (v) {
                        if (typeof v.getMonth === 'function') {
                            c[p] = v;
                        } else {
                            c[p] = me.clone(v);
                        }
                    } else {
                        c[p] = me.clone(v);
                    }
                } else {
                    c[p] = v;
                }
            }
        }
        return c;
    };

    var uniqueID = 0; 
    this.id = function() {
        /// <summary>Generate unique ID, ex. for new DOM element (uniqueID += 1; return '_' + uniqueID;)</summary>
        /// <param name="pre-separator" type="string">prepend separator Before unique number</param>
        /// <param name="post-separator" type="string">add separator after unique number</param>
        uniqueID += 1;
        return (arguments[0] ? arguments[0] : '_') + uniqueID + (arguments[1] ? arguments[1] : '');
    };

    this.$$ = function (id) {
        /// <summary>Get DOM element by id</summary>
        /// <param name="id" type="string">return document.getElementById(id);</param>
        if (typeof id == 'string') {
            if (id.contains('#') || id.contains('.') || id.contains(' ') || id.contains('>') || id.contains(':')) {
                return me.findone(id);
            } else
                return document.getElementById(id);
        } else if (typeof id === 'object') {
            return id;
        } else {
            return null;
        }
    };
    
    this.findall = function (query, base) {
        /// <summary>Get All elements by CSS selector [document|base.querySelectorAll(query)]</summary>
        /// <param name="query" type="string">CSS selector rules</param>
        base = me_getElement(base) || document;
        if (typeof query == 'string') {
            return base.querySelectorAll(query);
        } else {
            return null;
        }
    };

    this.findone = function (query, base) {
        /// <summary>Get first element by CSS selector [document|base.querySelector(query)]</summary>
        /// <param name="query" type="string">CSS selector rules</param>
        base = me_getElement(base) || document;
        if (typeof query == 'string') {
            return base.querySelector(query);
        } else {
            return null;
        }
    };
    
    this.attr = function (el, attribute_name, attribute_value) {
        /// <summary>GET or SET inline attribute:</summary>
        /// <param name="el" type="string|DOM">string = element id, DOM = DOM element object</param>
        /// <param name="attribute_name" type="string>attribute name (for GET)</param>
        /// <param name="attribute_value" type="string>attribute value (for SET)</param>
        el = arguments[0];
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.getAttribute != 'undefined' && typeof el.setAttribute != 'undefined') {
            if (me.arrlen(arguments) == 2) { //get
                if (me.hattr(el, arguments[1])) {
                    return el.getAttribute(arguments[1]);
                } else {
                    return null;
                }
            }
            if (me.arrlen(arguments) == 3) { //set
                el.setAttribute(arguments[1], arguments[2]);
                if (arguments[1] == 'title') {
                    //this.tt(true, el); // convert [title] attribute of DOM node to [tooltip] fpr use custom in ToolTips
                }
                return el;
            }
        }
        return false;
    };
    
    this.hattr = function (el, attribute_to_find) {
        /// <summary>Detect is element has inline attribute by name</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="attribute_to_find" type="string">attribute name</param>
        if (typeof attribute_to_find == 'undefined') return false;
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.hasAttribute != 'undefined') {
            return el.hasAttribute(attribute_to_find);
        }
        return false;
    };
    
    this.rattr = function (el, attribute_to_remove) {
        /// <summary>Remove inline attribute by name</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="attribute_to_remove" type="string">attribute name</param>
        if (typeof attribute_to_remove == 'undefined') return false;
        el = me_getElement(el); if (!el) return false;
            if (typeof el != 'undefined' && typeof el.removeAttribute != 'undefined') {
                el.removeAttribute(attribute_to_remove);
                return el;
            }
       return false;
    };

    this.live = function(parameters_object /*tag, id, target, class_name, display, inline_style, inner_html, before*/) {
        /// <summary>Create DOM Element (return successfull created element)</summary>
        /// <param name="tag" type="string">tag name: 'div', 'span' etc.</param>
        /// <param name="id" type="string|null">element id ('?' - autogenerate id; empty - create without id)</param>
        /// <param name="target" type="string|DOM|null">target: id|DOM element|null - document.body</param>
        /// <param name="display" type="boolean|null">show element after create (null - yes)</param>
        /// <param name="cls" type="string|null">add inline className attribute (null - no)</param>
        /// <param name="style" type="string|null">add inline style attribute (null - no)</param>
        /// <param name="attributes" type="objects array">add inline attributes [{key1:value1}, {key2:value2}]</param>
        /// <param name="html" type="string|null">add innerHTML to element (null - nothing)</param>
        /// <param name="insertBefore_target" type="number|string|DOM|null">to insert before this sibling element (number - index of parentElement.children array; strind - id; DOM - element; null - append to end)</param>
        if (typeof parameters_object != 'object') return null;
        var tag, id, target, display, cls, style, attributes, html, insertBefore_target;
        if (typeof parameters_object.tag != 'string')
            tag = 'DIV'; // default
        else
            tag = parameters_object.tag.toUpperCase();
        if (tag.toLowerCase() == 'br') return null;
        id = parameters_object.id || null;
        if (id == '?') id = (tag + me.id());
        if (typeof parameters_object.target == 'undefined' || parameters_object.target == null) {
            target = document.getElementsByTagName("body")[0];
        } else if (typeof target == 'string') target = document.getElementById(target);
        else target = parameters_object.target;
        if (typeof target == 'undefined' || target == null) {
            target = document.getElementsByTagName("body")[0];
        }
        if (typeof parameters_object.display != 'undefined') {
            display = (parameters_object.display === true);
        } else display = null;
        cls = parameters_object.cls || null;
        style = parameters_object.style || null;
        attributes = parameters_object.attributes || null;
        insertBefore_target = parameters_object.before || null;
        html = parameters_object.html || null;
        //try {
            var d = document.createElement(tag);
            if (id !== null) d.id = id;
            if (cls !== null) d.className = cls;
            if (html !== null) d.innerHTML = html;
            if (style !== null) d.setAttribute("style", style);
            if (display === false) d.style.display = "none";
            if (attributes !== null && this.arrlen(attributes) > 0) {
                me.each(attributes, function (idx, item) {
                    me.each(item, function (name, value) {
                        d.setAttribute(name, value);
                    });
                });
            }
            if (typeof insertBefore_target != 'undefined') { // insert before element
                if (typeof insertBefore_target == 'number') {
                    insertBefore_target = target.children[insertBefore_target];
                } else if (typeof insertBefore_target == 'string') {
                    insertBefore_target = me.$$(insertBefore_target);
                }
                target.insertBefore(d, insertBefore_target);
            } else { // append to end
                target.appendChild(d);
            }
            if (tag.toLowerCase() == 'input') {
                me.attr(d, 'spellcheck', 'false');
            }
            return d;
        //} catch (e) { }
    };

    this.each = function (array, callback){
        /// <summary>Orepate with all Array|Object Items of first level</summary>
        /// <param name="array" type="array|object">source array or object</param>
        /// <param name="callback" type="function">callback returned index and item | or null if error</param>
        if (typeof array == 'undefined' || typeof callback == 'undefined' || typeof callback != 'function') callback();
        for (var i in array){
            if (array.hasOwnProperty(i)) {
                callback(i, array[i]);
            }
        }
    };

    this.kill = function (el) {
        /// <summary>Remove DOM Element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined') {
            var parent = el.parentElement || document.body;
            parent.removeChild(el);
            //if (typeof this.tt_c != 'undefined' && this.tt_c.showed) this.tt_c.hide(); // hide tooltip after element removed
        }
        return true;
    };

    this.html = function (el, html) {
        /// <summary>Set or GET innerHTML of DOM element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="html" type="string">html string to Set (or empty to Get)</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.innerHTML != 'undefined' && typeof html != 'undefined') {
            el.innerHTML = html;
            return el;
        }
        if (typeof el != 'undefined' && typeof el.innerHTML != 'undefined' && typeof html == 'undefined') {
            return el.innerHTML;
        }
        return false;
    };

    this.text = function (el) {
        /// <summary>GET innerText of DOM element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined') {
            return el.innerText || el.textContent;
        }
        return false;
    };

    this.scrollup = function (el) {
        /// <summary>Scroll element content to TOP</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.scrollTop != 'undefined') {
            el.scrollTop = 0;
            return el;
        }
        return false;
    };

    this.scrolldown = function (el) {
        /// <summary>Scroll element content to BOTTOM</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.scrollTop != 'undefined') {
            el.scrollTop = el.scrollHeight + 20;
            return el;
        }
        return false;
    };

    this.show = function (el, value, timeoutToAutoKill) {
        /// <summary>SHOW element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="value" type="string">value of display attribute (default: 'block')</param>
        /// <param name="timeoutToAutoKill" type="number">timeout to kill after timeoutToAutoKill ms</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el == 'undefined' || typeof el.style == 'undefined') return false;
        if (typeof value == 'undefined' && typeof value != 'string') value = 'block';
        el.style.display = value;
        if (typeof timeoutToAutoKill != 'undefined' && !isNaN(timeoutToAutoKill) && typeof setTimeout != 'undefined') {
            var el_ = el;
            setTimeout(function () { me.kill(el_); }, timeoutToAutoKill);
        }
        return el;
    };

    this.hide = function (el) {
        /// <summary>HIDE element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.style != 'undefined') {
            el.style.display = 'none';
            return el;
        }
        return false;
    };

    var me_vendors = ['-webkit-', '-moz-', '-o-', '-ms-', '-khtml-', ''];
    var me_toCamelCase = function (str) {
        return str.toLowerCase().replace(/(\-[a-z])/g, function($1){
                return $1.toUpperCase().replace('-', '');
            });
        };
    this.css3 = function (el, property, value){
        /// <summary>Set supported CSS3 style of element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="property" type="string">property of CSS3 style</param>
        /// <param name="value" type="string">value of CSS3 style property</param>
        for (var i = 0, l = me_vendors.length; i < l; i++) {
            var p = me_toCamelCase(vendors[i] + property);
            if (el.style.hasOwnProperty(p))
                el.style[p] = value;
        }
    };

    this.opacity = function(el, opacity) {
        /// <summary>Set Opacity of element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="opacity" type="string">value of Opacity</param>
        el = me_getElement(el); if (!el) return false;
        if (typeof el != 'undefined' && typeof el.style != 'undefined') {
            if (typeof opacity == 'undefined' || typeof opacity != 'string') opacity = '1';
            el.style.opacity = opacity;
        }
        return el;
    };

    this.rnd = function (min, max) {
        /// <summary>Get Random number from limitations (return Math.floor(Math.random() * (n - m + 1)) + m;)</summary>
        /// <param name="m" type="number|string">minimal number</param>
        /// <param name="n" type="number|string">maximal number</param>
        min = parseInt(min, 10);
        max = parseInt(max, 10);
        if (!isNaN(min) && !isNaN(max)) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return false;
    };

    this.symbol = function () {
        /// <summary>Get random english symbol (var symBase = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";)</summary>
        var symBase = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
        var index = me.rnd(0, symBase.length - 1);
        return symBase[index];
    };

    this.wheel = function (el, callback) {
        /// <summary>Attach cross-browser Mouse Wheel Event to Element</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (el.addEventListener) {
            el.addEventListener("mousewheel", mouseWheelHandler, false);//     IE9, Chrome, Safari, Opera
            el.addEventListener("DOMMouseScroll", mouseWheelHandler, false);// Firefox
        } else el.attachEvent("onmousewheel", mouseWheelHandler);//            IE 6/7/8
        function mouseWheelHandler(e) {
            e = window.event || e; //                                               old IE support
            me.no(e, true);
            var target = e.target || e.srcElement;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));//   cross-browser wheel delta
            //callback(delta, target);
            e.wheelDelta = delta;
            callback(e);
            return false;
        }
        return el;
    };
    
    this.offsetSum = function(el_) {
        /// <summary>Get offset position of Element (by summ offsets of all parent elements)</summary>
        /// <param name="el_" type="DOM">DOM element object</param>
        var left = 0, top = 0;
        while(el_) {
            top = top + parseInt(el_.offsetTop, 10);
            left = left + parseInt(el_.offsetLeft, 10);
            el_ = el_.offsetParent;
        }
        return { left: left, top: top }
    };

    this.offsetRect = function (el_) {
        /// <summary>Get offset position of Element (by use getBoundingClientRect of element)</summary>
        /// <param name="el_" type="DOM">DOM element object</param>
        var box = el_.getBoundingClientRect();
        var body = document.body;
        var docElem = document.documentElement;
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        return { left: Math.round(left), top: Math.round(top) };
    };

    this.offset = function (el) {
        /// <summary>Cross-browser OFFSET position of Element (return object {l:left, t:top})</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        el = me_getElement(el); if (!el) return false;
        if (el.getBoundingClientRect) {
            return me.offsetRect(el);
        } else { // for old browsers
            return me.offsetSum(el);
        }
    };

    this.box = function (el, obj_ltwh, noChangePositonToAbsolute) {
        /// <summary>SET|GET one or multiply parameters of Left_Top_Width_Height object of Element (return: DOM element (or false if error))</summary>
        /// <param name="el" type="string|DOM">string - element id; DOM - DOM element object</param>
        /// <param name="obj_ltwh" type="object">to Set { l: left, t: top, w: width, h: height } (or empty to Get)</param>
        /// <param name="noChangePositonToAbsolute" type="boolean">true for not set position of element to Absolute</param>
        el = me_getElement(el); if (!el) return false;
        if (el == null) return false;
        if (typeof obj_ltwh == 'undefined' || typeof obj_ltwh != 'object') {
            var offset = me.offset(el);
            var l = offset.left;
            var t = offset.top;
            var w = el.offsetWidth;
            var h = el.offsetHeight;
            return { /*short*/ l: l, t: t, w: w, h: h, /*full*/ left: l, top: t, width: w, height: h };
        } else {
            // position
            if (noChangePositonToAbsolute !== true) el.style.position = 'absolute';
            // left
            if (typeof obj_ltwh.l != 'undefined') {
                el.style.left = '' + obj_ltwh.l + 'px';
            } else if (typeof obj_ltwh.left != 'undefined') {
                el.style.left = '' + obj_ltwh.left + 'px';
            }
            // top
            if (typeof obj_ltwh.t != 'undefined') {
                el.style.top = '' + obj_ltwh.t + 'px';
            } else if (typeof obj_ltwh.top != 'undefined') {
                el.style.top = '' + obj_ltwh.top + 'px';
            }
            // width
            if (typeof obj_ltwh.w != 'undefined') {
                el.style.width = '' + obj_ltwh.w + 'px';
            } else if (typeof obj_ltwh.width != 'undefined') {
                el.style.width = '' + obj_ltwh.width + 'px';
            }
            //height
            if (typeof obj_ltwh.h != 'undefined') {
                el.style.height = '' + obj_ltwh.h + 'px';
            } else if (typeof obj_ltwh.height != 'undefined') {
                el.style.height = '' + obj_ltwh.height + 'px';
            }
        }
        return el;
    };

    this.browser = {
        init: function () {
            this.name = this.searchString(this.dataBrowser) || "an unknown browser";
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
            this.os = this.searchString(this.dataOS) || "an unknown OS"
        },
        searchString: function (b) { for (var a = 0; a < b.length; a++) { var c = b[a].string, d = b[a].prop; this.versionSearchString = b[a].versionSearch || b[a].identity; if (c) { if (-1 != c.indexOf(b[a].subString)) return b[a].identity } else if (d) return b[a].identity } },
        searchVersion: function (b) { var a = b.indexOf(this.versionSearchString); if (-1 != a) return parseFloat(b.substring(a + this.versionSearchString.length + 1)) },
        dataBrowser: [
            { string: navigator.userAgent, subString: "OPR", identity: "Opera", versionSearch: "OPR" },
            { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
            { string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb" },
            { string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "Version" },
            { prop: window.opera, identity: "Opera", versionSearch: "Version" },
            { string: navigator.vendor, subString: "iCab", identity: "iCab" },
            { string: navigator.vendor, subString: "KDE", identity: "Konqueror" },
            { string: navigator.userAgent, subString: "FF", identity: "Firefox" },
            { string: navigator.vendor, subString: "Camino", identity: "Camino" },
            { string: navigator.userAgent, subString: "Netscape", identity: "Netscape" },
            { string: navigator.userAgent, subString: "MSIE", identity: "IE", versionSearch: "MSIE" },
            { string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv" },
            { string: navigator.userAgent, subString: "Mozilla", identity: "Netscape", versionSearch: "Mozilla" }],
        dataOS: [
            { string: navigator.platform, subString: "Win", identity: "Windows" },
            { string: navigator.platform, subString: "Mac", identity: "Mac" },
            { string: navigator.userAgent, subString: "iPhone", identity: "iPhone/iPod" },
            { string: navigator.platform, subString: "Linux", identity: "Linux" }]
    }; me.browser.init();
    
    // Cross-browser implementation of Attach|Remove Event
    if(document.addEventListener) {
        this.on = function (el, type, handler, capture){
            el = me_getElement(el); if (!el) return false;
            el.addEventListener(type, handler, !!capture);
            return handler; // ex. for remove
        };
        this.off = function (el, type, handler, capture){
            el = me_getElement(el); if (!el) return false;
            el.removeEventListener(type, handler, !!capture);
            return true;
        };
    } else if (document.attachEvent) {
        this.on = function (el, type, handler) {
            el = me_getElement(el); if (!el) return false;
            type = "on" + type;
            var withHandler = function() {
                return handler.apply(el, arguments);
            };
            el.attachEvent(type, withHandler);
            return withHandler;
        };
        this.off = function(el, type, handler){
            el = me_getElement(el); if (!el) return false;
            type = "on" + type;
            el.detachEvent(type, handler);
            return true;
        };
    } else {
        this.on = function(el, type, handler){
            el = me_getElement(el); if (!el) return false;
            type = "on" + type;
            el.store = el.store || {};
            if(!el.store[type]){
                el.store[type] = { counter: 1 };
                el[type] = function(){
                    for(key in item){
                        if(item.hasOwnProperty(key)){
                            if(typeof item[key] == "function"){
                                item[key].apply(this, arguments);
                            }
                        }
                    }
                };
            }
            var item = el.store[type], id = item.counter++;
            item[id] = handler;
            return id;
        };
        this.off = function(el, type, handlerId){
            el = me_getElement(el); if (!el) return false;
            type = "on" + type;
            if(el.store && el.store[type] && el.store[type][handlerId]) el.store[type][handlerId] = undefined;
            return true;
        };
    }
     
    /* Cross-browser AJAX
     * @param string url
     * @param object callback
     * @param mixed data
     * @param null x
     */
    this.net = function (url, callback, data, cache) {
        if(data && typeof(data) === 'object') {
            data = me.net.uri(data, cache);
        }
        try {
            var x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
            x.open(data ? 'POST' : 'GET', url, 1);
            x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            x.onreadystatechange = function () {
                x.readyState > 3 && callback && callback(x.responseText, x);
            };
            x.send(data)
        } catch (e) {}
    };

    this.net.uri = function(o, cache) {
        var x, y = '', e = encodeURIComponent;
        for (x in o) {
            y += '&' + e(x) + '=' + e(o[x]);
        }
        return y.slice(1) + (! cache ? '&_t=' + new Date().valueOf() : '');
    };
    
    this.net.collect = function (a, f) {
        var n = [], i, v;
        for (i = 0; i < a.length; i++) {
            v = f(a[i]);
            if (v != null) n.push(v);
        }
        return n;
    };
     
    this.net.serialize = function (f) {
        function g(n) {
            return f.getElementsByTagName(n);
        }
        var nv = function (e) {
            if (e.name) { return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value); } else { return null }
        };
        var i = me.net.collect(g('input'), function (i) {
            if ((i.type != 'radio' && i.type != 'checkbox') || i.checked) { return nv(i); } else { return null }
        });
        var s = me.net.collect(g('select'), nv);
        var t = me.net.collect(g('textarea'), nv);
        return i.concat(s).concat(t).join('&');
    };

    this.inherit = function (Child, Parent) {
        if (!Child) throw 'Inherit - child undefined!';
        if (!Parent) throw 'Inherit - parent undefined!';

        var childProto = Child.prototype, i, desc;

        // Inherit parent's prototype
        Child.prototype = Object.create(Parent.prototype);

        // Copy all properties from old prototype (including constructor, which will be overwritten)
        var props = Object.getOwnPropertyNames(childProto);

        for (i = props.length; i--;) {
            if (childProto.hasOwnProperty(props[i])) {
                desc = Object.getOwnPropertyDescriptor(childProto, props[i]);
                Object.defineProperty(Child.prototype, props[i], desc);
            }
        }
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    };

    this.defined = function (obj) {
        return typeof obj !== 'undefined';
    };

    this.pointInBox = function (point, elementLTWH, clipperLTWH) {
        var x = point.x || point.pageX;
        var y = point.y || point.pageY;
        var res = false;
        if (x >= elementLTWH.l && x <= (elementLTWH.l + elementLTWH.w) &&
            y >= elementLTWH.t && y <= (elementLTWH.t + elementLTWH.h)) {
            res = true;
        }
        if (res && typeof clipperLTWH != 'undefined') {
            res = this.pointInBox(point, clipperLTWH);
        }
        return res;
    };

    this.calculateWidth = function (text,  config) {
        if (!this.canvas) {
            this.canvas = $('<canvas />', {
                width: '100',
                height: '100'
            })[0];
            this.ctx = this.canvas.getContext('2d');
            this.fontFamily = 'Tahoma';
            this.fontSize = 12;
            this.paddingLeft = 5;
            this.paddingRight = 5;
            this.ctx.font = this.fontSize + 'px ' + this.fontFamily;
        }
        text = text || '';
        config = config || {};
        var changes = false;
        if (config.fontFamily && (typeof config.fontFamily == 'string')) {
            this.fontFamily = config.fontFamily;
            changes = true;
        }
        if (config.fontSize && (typeof config.fontSize == 'number')) {
            this.fontSize = config.fontSize;
            changes = true;
        }
        if (changes) {
            this.ctx.font = this.fontSize + 'px ' + this.fontFamily;
        }
        if (config.paddingLeft != null && typeof config.paddingLeft == 'number') { this.paddingLeft = config.paddingLeft; }
        if (config.paddingRight != null && typeof config.paddingRight == 'number') { this.paddingRight = config.paddingRight; }

        var measureText = this.ctx.measureText(text);
        return (this.paddingLeft + measureText.width + this.paddingRight);
    };
};

window.common_library = new ___();
 // removing from memory because used just one time!
___ = undefined;

/*! http://mths.be/visibility v1.0.7 by @mathias | MIT license */
(function(window, document, $, undefined) {

	var prefix;
	var property;
	// In Opera, `'onfocusin' in document == true`, hence the extra `hasFocus` check to detect IE-like behavior
	var eventName = 'onfocusin' in document && 'hasFocus' in document
		? 'focusin focusout'
		: 'focus blur';
	var prefixes = ['webkit', 'o', 'ms', 'moz', ''];
	var $support = $.support;
	var $event = $.event;

	while ((prefix = prefixes.pop()) != undefined) {
		property = (prefix ? prefix + 'H': 'h') + 'idden';
		if ($support.pageVisibility = typeof document[property] == 'boolean') {
			eventName = prefix + 'visibilitychange';
			break;
		}
	}

	$(/blur$/.test(eventName) ? window : document).on(eventName, function(event) {
		var type = event.type;
		var originalEvent = event.originalEvent;

		// Avoid errors from triggered native events for which `originalEvent` is
		// not available.
		if (!originalEvent) {
			return;
		}

		var toElement = originalEvent.toElement;

		// If it’s a `{focusin,focusout}` event (IE), `fromElement` and `toElement`
		// should both be `null` or `undefined`; else, the page visibility hasn’t
		// changed, but the user just clicked somewhere in the doc. In IE9, we need
		// to check the `relatedTarget` property instead.
		if (
			!/^focus./.test(type) || (
				toElement == undefined &&
				originalEvent.fromElement == undefined &&
				originalEvent.relatedTarget == undefined
			)
		) {
			$event.trigger(
				(
					property && document[property] || /^(?:blur|focusout)$/.test(type)
						? 'hide'
						: 'show'
				) + '.visibility'
			);
		}
	});

}(this, document, jQuery));
