(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var trans = require("./trans");
var gtag_1 = require("./gtag");
var Q_URL = 'http://127.0.0.1:5000/q/';
var F_URL = 'http://127.0.0.1:5000/f/';
var VERSION = '1';
function resolveFromServer(entry, qword) {
    if (entry.cleng) {
        entry.qword = qword.substr(0, entry.cleng);
        if (entry.family) {
            var family = entry.family;
            entry.family = new Array(family.length);
            for (var i = 0; i < family.length; i++) {
                entry.family[i] = qword.substr(0, family[i]);
            }
            entry.index = 0;
        }
    } else {
        entry.poses.sort(function (i1, i2) {
            return i1.split('$$')[1].toLowerCase() > i2.split('$$')[1].toLowerCase() ? 1 : -1;
        });
        if (entry.family) {
            if (entry.family[0] === entry.qword) {
                var _family = [];
                var set = {};
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = entry.family[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var form = _step.value;

                        if (set[form.toLowerCase()]) continue;
                        set[form.toLowerCase()] = true;
                        _family.push(form);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (_family.length <= 1) delete entry.family;else {
                    entry.family = _family.sort(function (a, b) {
                        return b.length - a.length;
                    });
                    entry.index = entry.family.indexOf(entry.qword);
                }
            } else entry.index = entry.family.length - 1;
        }
    }
    entry.trans = entry.trans && trans.add(entry.qword, entry.trans) || '[Not Found]';
    if (qword !== entry.qword) map[qword] = entry;
    return entry;
}
var EMPTY = Object.create(null);
var map = Object.create(null);
var mapSize = 0;
function query(qword, lang, consume) {
    var async = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var entry = map[qword];
    if (entry) {
        if (entry !== EMPTY) {
            entry.trans = trans.get(entry.qword) || '[Not Found]';
            consume(entry);
            gtag_1.default('lookup', { qword: entry.qword });
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', F_URL + encodeURIComponent(lang + qword), async);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.responseText) {
                    var baseEntry = JSON.parse(xhr.responseText);
                    if (baseEntry.next) consume(baseEntry);else {
                        baseEntry.qword = qword;
                        baseEntry.trans = baseEntry.trans && trans.add(qword, baseEntry.trans) || '[Not Found]';
                        if (lang === 'zh') baseEntry.cleng = qword.length;else baseEntry.poses.sort(function (i1, i2) {
                            return i1.split('$$')[1].toLowerCase() > i2.split('$$')[1].toLowerCase() ? 1 : -1;
                        });
                        mapSize++;
                        consume(map[qword] = baseEntry);
                        gtag_1.default('lookup', { qword: qword });
                    }
                } else consume(undefined);
            };
            xhr.onerror = function () {
                consume(undefined);
            };
            xhr.send();
        }
    } else {
        var _xhr = new XMLHttpRequest();
        _xhr.open('GET', Q_URL + encodeURIComponent(VERSION + lang + qword), async);
        _xhr.onreadystatechange = function () {
            if (_xhr.readyState === 4 && _xhr.responseText.trim()) {
                var response = JSON.parse(_xhr.responseText);
                if (response.next) consume(response);else {
                    var newEntry = resolveFromServer(response, qword);
                    if (newEntry.family) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = newEntry.family[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var form = _step2.value;

                                map[form] = EMPTY;
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                    mapSize++;
                    consume(map[newEntry.qword] = newEntry);
                    gtag_1.default('lookup', { qword: newEntry.qword });
                }
            } else consume(undefined);
        };
        _xhr.onerror = function () {
            consume(undefined);
            gtag_1.default('lookup_error', { qword: qword });
        };
        _xhr.send();
    }
}
exports.query = query;
exports.post = trans.set;

},{"./gtag":2,"./trans":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function default_1(action, data) {
    if (gtag) gtag('event', action, data);
}
exports.default = default_1;

},{}],3:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var gtag_1 = require("./gtag");
var ZH_URL = 'http://127.0.0.1:5000/static/pron/zh/';
var UK_URL = 'http://127.0.0.1:5000/static/pron/uk/';
var US_URL = 'http://127.0.0.1:5000/static/pron/us/';
var map = Object.create(null);
function play(id, onerror) {
    var oldAudio = map[id];
    if (oldAudio) {
        if (oldAudio.getAttribute('disabled')) {
            if (onerror) onerror(id);
        } else {
            oldAudio.play();
        }
    } else {
        var newAudio = map[id] = document.createElement('audio');
        newAudio.preload = 'auto';
        newAudio.autoplay = true;

        var _id$split = id.split(':'),
            _id$split2 = _slicedToArray(_id$split, 2),
            lang = _id$split2[0],
            url = _id$split2[1];

        if (lang === 'zh') {
            newAudio.src = ZH_URL + url + '.ogg';
        } else if (lang === 'uk') {
            newAudio.src = UK_URL + url + '.mp3';
        } else if (lang === 'us') {
            newAudio.src = US_URL + url + '.mp3';
        }
        newAudio.onerror = function (event) {
            event.stopPropagation();
            newAudio.setAttribute('disabled', 'disabled');
            if (onerror) onerror(id);
            gtag_1.default('play_error', { id: id });
        };
    }
}
exports.default = play;

},{"./gtag":2}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var D_URL = 'http://127.0.0.1:5000/d/';
var P_URL = 'http://127.0.0.1:5000/definition';
var trans = Object.create(null);
var older = Object.create(null);
function add(key, value) {
    return trans[key = key.toLowerCase()] ? get(key) : trans[key] = value;
}
exports.add = add;
function get(key, value) {
    return (value = trans[key.toLowerCase()] || value) && (value.charAt(0) !== '@' ? value : get(value.substr(1)));
}
exports.get = get;
function set(key, value, consume) {
    var async = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    key = key.toLowerCase();
    if (!older[key]) older[key] = trans[key];
    if (value.charAt(0) !== '@') {
        trans[key] = value;
        if (consume) {
            consume(value);
        }
    } else {
        var val = get(value.substr(1));
        if (val) {
            trans[key] = value;
            consume(val);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', D_URL + encodeURIComponent(value), async);
            xhr.onload = function () {
                if (xhr.responseText) {
                    trans[key] = value;
                    consume(trans[value.substr(1).toLowerCase()] = xhr.responseText);
                } else {
                    consume('[Ref Error]');
                }
            };
            xhr.onerror = xhr.ontimeout = function () {
                consume('[Net Error]');
            };
            xhr.send();
        }
    }
}
exports.set = set;
if (chrome && chrome.windows && chrome.tabs) {
    try {
        chrome.windows.onRemoved.addListener(post);
        chrome.tabs.onRemoved.addListener(post);
    } catch (_a) {}
}
function post() {
    var formData = new FormData();
    var keys = new Array();
    for (var key in older) {
        var value = trans[key];
        if (older[key] !== value && key.indexOf('&') < 0 && value.indexOf('&&') < 0) {
            formData.append(key, value);
            keys.push(key);
        }
    }
    if (keys.length > 0) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', P_URL);
        xhr.onload = function () {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _key = _step.value;

                    delete older[_key];
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        };
        xhr.send(formData);
    }
}

},{}],5:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var ipal = ' -(-(r)-)-aɪ-aʊ-b-d-dʒ-e-eə-eɪ-f-h-i-iː-j-juː-k-l-m-n-oʊ-p-r-s-t-tʃ-u-uː-v-w-x-z-æ-ð-ŋ-ɑ-ɑː-ɒ-ɔɪ-ɔː-ə-ər-əʊ-ɜː-ɡ-ɪ-ɪə-ʃ-ʊ-ʊə-ʌ-ʒ-ˈ-ˌ-θ'.split('-');
var secretKey = 'AabcdeBCfDghEFGiHjIJKLkMNOPlQmRSTUVWXYnZop0qrs12t34u56789';
var pron = function pron(input) {
    var output = '',
        mark = '';
    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        output += ipal[secretKey.indexOf(char)];
        mark += char >= 'a' ? '-' + char : char;
    }
    mark = secretKey.charAt((output.length - 1) % secretKey.length) + mark;
    return [output, mark.toUpperCase()];
};
function dePron(input, lang) {
    var prons = input.split(', ');
    var output = '';
    for (var i = 0; i < prons.length; i++) {
        if (i > 0) output += ', ';
        var p = prons[i];
        if (p.charAt(0) === '[') {
            p = p.substr(1);
            output += '[';
        }
        var suffix = p.charAt(p.length - 1) === ']';
        if (suffix) p = p.substring(0, p.length - 1);
        var pronMark = pron(p);
        output += '<span data-url="' + lang + pronMark[1] + '">' + pronMark[0] + '</span>';
        if (suffix) output += ']';
    }
    return output;
}
exports.dePron = dePron;
var mask = 'aāáǎàoōóǒòeēéěèiīíǐìuūúǔùüǖǘǚǜ';
function mark(input, lang) {
    var pv = input.replace('nue', 'nüe').replace('lue', 'lüe').replace('nv', 'nü').replace('lv', 'lü').replace('v', 'ü');
    for (var i = 0; i < pv.length; i++) {
        var pin = mask.indexOf(pv.charAt(i));
        if (pin >= 0) {
            var end = pv.length - 1;
            var tone = pv.charCodeAt(end) - 48;
            if (tone === 5) tone = 0;
            return '<span data-url="' + lang + input + '">' + pv.substr(0, i) + mask.charAt(pin + tone) + pv.substring(i + 1, end) + '</span>';
        }
    }
    return input;
}
function dePinv(input, lang) {
    var res = input.match(/\b[a-z]{1,6}[1-5]\b/);
    if (res === null) return input;
    var rem = (res.index || 0) + res[0].length;
    if (rem === input.length) return input.substr(0, res.index) + mark(res[0], lang);
    return input.substr(0, res.index) + mark(res[0], lang) + dePinv(input.substr(rem), lang);
}
exports.dePinv = dePinv;
function find(ipa) {
    var high = ipal.length - 1;
    var low = 0;
    while (low <= high) {
        var mid = low + high >> 1;
        if (ipal[mid] === ipa) {
            return [secretKey[mid], ipa.length];
        } else if (ipal[mid] < ipa) {
            low = mid + 1;
        } else high = mid - 1;
    }
    if (ipa.length === 1) {
        throw ipa;
    }
    return find(ipa.substr(0, ipa.length - 1));
}
function encode(input) {
    var i = 0;
    var output = '';
    while (i < input.length) {
        var _find = find(input.substr(i, i + 3)),
            _find2 = _slicedToArray(_find, 2),
            sub = _find2[0],
            len = _find2[1];

        output += sub;
        i += len;
    }
    return output;
}
exports.encode = encode;

},{}],6:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var dict_1 = require("./dict");
var utility_1 = require("./utility");
function default_1(injector, handler) {
    var Dict = dict_1.default(injector, handler);
    var mouseupEnabled = true;
    var dictEnabled = true;
    var mousedownTargetIsInput = false;
    function capture() {
        try {
            var sel = window.getSelection();
            var text = utility_1.shorten(sel && sel.toString().trim());
            console.log(text);
            var rect = sel.getRangeAt(0).getBoundingClientRect();
            if (text && rect.left >= 0 && rect.right <= document.documentElement.clientWidth) {
                if (utility_1.staticText(sel.anchorNode)) {
                    var x = window.pageXOffset,
                        y = window.pageYOffset;
                    return [text, { left: rect.left + x, right: rect.right + x, bottom: rect.bottom + y, top: rect.top + y }];
                }
            }
        } catch (_a) {}
        return ['', null];
    }
    var input = Dict.input;
    document.addEventListener('mousedown', function (event) {
        mouseupEnabled = dictEnabled && utility_1.staticText(event.target);
        mousedownTargetIsInput = event.target === input;
    }, true);
    document.addEventListener('mouseup', function (event) {
        if (mousedownTargetIsInput) return;
        if (mouseupEnabled && utility_1.staticText(event.target)) {
            if (event.target !== document) {
                var _capture = capture(),
                    _capture2 = _slicedToArray(_capture, 2),
                    text = _capture2[0],
                    rect = _capture2[1];

                if (text) {
                    Dict.tryToShowDict(text, rect);
                } else Dict.hideDict();
            }
        } else Dict.hideDict();
    });
    return function (enable) {
        dictEnabled = enable;
    };
}
exports.default = default_1;

},{"./dict":7,"./utility":8}],7:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var storage_1 = require("../shared/storage");
var coder_1 = require("./coder");
function default_1(injector, handler) {
    var rentry = void 0;
    var absoluteRect = void 0;
    var styles = {
        '#header': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;padding-bottom:6px;text-align:center;user-select:none;white-space:nowrap;z-index:100000',
        '#ngl-blayer': 'border-left:12px solid transparent;border-right:12px solid transparent;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;left:-12px;line-height:1.125;position:absolute;text-align:center;user-select:none;z-index:99997',
        '#ngl-edit': 'border:none;box-sizing:border-box;color:#222;cursor:pointer;display:none;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;margin:0;outline:none;padding:0;text-align:center;user-select:none;z-index:100000',
        '#ngl-hide': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:16px;height:16px;line-height:1.125;margin-left:2px;margin-right:2px;position:relative;text-align:center;top:3px;user-select:none;width:16px;z-index:100000',
        '#ngl-link': 'box-sizing:border-box;color:#222;cursor:pointer;display:none;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.125;padding-top:6px;text-align:center;text-decoration:underline;user-select:none;white-space:nowrap;z-index:100000',
        '#ngl-next': 'border:none;box-sizing:border-box;color:#222;cursor:pointer;display:none;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;margin:0;outline:none;padding:0;text-align:center;user-select:none;z-index:100000',
        '#ngl-pron': 'border:none;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;margin:0;outline:none;padding:0;text-align:center;user-select:none;z-index:100000',
        '#ngl-tran': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;padding-bottom:6px;text-align:left;user-select:none;word-wrap:break-word;z-index:100000',
        '#ngl-word': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:1.125;text-align:center;user-select:none;z-index:100000',
        '#pron-uk': 'box-sizing:border-box;color:#07255e;cursor:pointer;display:inline;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;text-align:center;user-select:none;z-index:100000',
        '#pron-item': 'box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;padding-top:2px;text-align:center;user-select:none;white-space:nowrap;z-index:100000',
        '#ngl-done': 'background-color:#E9DECF;border-radius:2px;box-sizing:border-box;color:#222;cursor:pointer;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.125;padding:6px 9px;text-align:center;user-select:none;z-index:100000',
        '#ngl-main': 'background-color:#FFF1E0;border:1px solid #E9DECF;border-radius:2px;box-shadow:0 0 16px #a7a59b;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;min-width:220px;padding:6px 8px 12px;position:absolute;text-align:center;user-select:none;z-index:99998',
        '#ngl-show': 'border:none;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;margin:0;outline:none;padding:0;text-align:center;user-select:none;z-index:100000',
        '#pinv-pos': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;text-align:center;user-select:none;z-index:100000',
        '#ngl-tlayer': 'border-left:11px solid transparent;border-right:11px solid transparent;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;left:-11px;line-height:1.125;position:absolute;text-align:center;user-select:none;z-index:99999',
        '#origin': 'border:none;box-sizing:border-box;color:#222;cursor:pointer;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;height:0;line-height:1.125;margin:0;padding:0;position:absolute;text-align:center;user-select:none;width:0;z-index:100000',
        '#ngl-input': 'background-color:transparent;border:1px solid #a7a59b;border-radius:2px;box-sizing:border-box;color:#222;cursor:text;display:block;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;margin:6px 0;min-height:88px;padding:6px;resize:none;text-align:left;user-select:none;width:100%;z-index:100000',
        '#pron-us': 'box-sizing:border-box;color:#8f0610;cursor:pointer;display:inline;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.125;text-align:center;user-select:none;z-index:100000',
        '#ngl-head': 'box-sizing:border-box;color:#222;cursor:pointer;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:1.125;padding-bottom:6px;text-align:center;user-select:none;z-index:100000'
    };
    var html = '<div id="ngl-main"><div id="ngl-show"><span id="header"><span id="ngl-word"></span><svg id="ngl-hide" viewBox="0 0 100 100"><circle fill="#FFF1E0" cx="50" cy="50" r="42"/><path fill="#8f0610" d="M71,34.921l-5.922-5.92L50.001,44.079L34.921,29L29,34.921L44.08,50L29,65.08L34.921,71l15.08-15.078L65.079,71L71,65.078L55.922,50L71,34.921z"/></svg></span><span id="ngl-tran"></span><div id="ngl-pron"></div><a id="ngl-link" target="_blank"></a></div><div id="ngl-edit"><div id="ngl-head" title="取消"></div><textarea id="ngl-input"></textarea><div id="ngl-done">完成</div></div><div id="ngl-next"></div></div><div id="ngl-blayer"></div><div id="ngl-tlayer"></div>';
    var dict = document.createElement('div');
    dict.setAttribute('style', styles['#origin']);
    dict.style.display = 'none';
    document.body.appendChild(dict);
    dict.innerHTML = html;
    html = null;

    var _map = ['main', 'show', 'word', 'hide', 'tran', 'pron', 'link', 'edit', 'head', 'input', 'done', 'next', 'blayer', 'tlayer'].map(function (id) {
        return dict.querySelector('#ngl-' + id);
    }),
        _map2 = _slicedToArray(_map, 14),
        main = _map2[0],
        show = _map2[1],
        word = _map2[2],
        hide = _map2[3],
        tran = _map2[4],
        pron = _map2[5],
        link = _map2[6],
        edit = _map2[7],
        head = _map2[8],
        input = _map2[9],
        done = _map2[10],
        next = _map2[11],
        blay = _map2[12],
        tlay = _map2[13];

    for (var id in styles) {
        var element = dict.querySelector(id);
        if (element) {
            element.setAttribute('style', styles[id]);
            element.removeAttribute('id');
        }
    }
    var attrs = [styles['#pron-uk'], styles['#pinv-pos'], styles['#pron-us'], styles['#pron-item']];
    styles = null;
    hide.addEventListener('mouseup', function (event) {
        event.stopPropagation();
        dict.style.display = 'none';
        handler({ action: 3 });
    }, true);
    var back = hide.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'circle')[0];
    var arch = hide.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'path')[0];
    hide.onmouseover = function () {
        back.setAttribute('fill', word.style.color);
        arch.setAttribute('fill', main.style.backgroundColor);
    };
    hide.onmouseout = function () {
        back.setAttribute('fill', main.style.backgroundColor);
        arch.setAttribute('fill', word.style.color);
    };
    word.addEventListener('click', function (event) {
        event.stopPropagation();
        if (rentry.family && rentry.family.length > 1) {
            var qword = rentry.family[++rentry.index % rentry.family.length];
            injector.query({ query: qword, lang: rentry.cleng ? 'zh' : 'en' }, function (entry) {
                if (entry) {
                    entry.family = rentry.family;
                    entry.index = rentry.index;
                    showDict(entry, absoluteRect);
                    handler({ action: 9 });
                }
            });
        }
    });
    [main, blay, tlay].forEach(function (element) {
        element.addEventListener('mouseup', function (event) {
            event.stopPropagation();
        });
    });
    tran.addEventListener('click', function (event) {
        show.style.display = 'none';
        edit.style.display = 'block';
        event.stopPropagation();
        if (pinpoint(absoluteRect)) input.focus();else {
            show.style.display = 'none';
            edit.style.display = 'block';
        }
    });
    head.addEventListener('click', function (event) {
        show.style.display = 'block';
        edit.style.display = 'none';
        event.stopPropagation();
        pinpoint(absoluteRect);
        input.value = rentry.trans;
    });
    var listener = function listener(event) {
        show.style.display = 'block';
        edit.style.display = 'none';
        event.stopPropagation();
        var newVal = (input.value || '').trim().replace(/\s\s+|[\n\r\t]/g, ' ');
        if (newVal && newVal !== rentry.trans) {
            if (newVal.charAt(0) !== '@' || rentry.qword.toLowerCase() === newVal.substr(1).toLowerCase()) {
                rentry.trans = newVal.charAt(0) !== '@' ? newVal : '[Ref Error]';
                updateContent(rentry);
                pinpoint(absoluteRect);
                injector.post({ query: rentry.qword, newVal: newVal });
                handler({ action: 1 });
            } else {
                injector.post({ query: rentry.qword, newVal: newVal }, function (trans) {
                    rentry.trans = trans;
                    updateContent(rentry);
                    pinpoint(absoluteRect);
                });
                handler({ action: 2 });
            }
        } else pinpoint(absoluteRect);
    };
    done.addEventListener('click', listener);
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            listener(event);
        }
    }, true);
    window.addEventListener('resize', function () {
        if (dict.style.display !== 'none') {
            dict.style.display = 'none';
            handler({ action: 4 });
        }
    });
    function playAudio(event) {
        event.stopPropagation();
        var el = event.target;
        var play = el.getAttribute('data-url');
        injector.play({ play: play });
        if (play.startsWith('zh')) {
            handler({ action: 5 });
        } else if (play.startsWith('uk')) {
            handler({ action: 6 });
        } else {
            handler({ action: 7 });
        }
    }
    injector.onplayerror = function (id) {
        var target = pron.querySelector("[data-url=\"" + id + "\"]");
        if (target) target.style.textDecoration = 'line-through';
        handler({ action: 8 });
    };
    function ensurePronItem(pron, count) {
        var childCount = pron.childElementCount;
        var divs = new Array();
        if (childCount >= count) {
            for (var i = 0; i < childCount; i++) {
                var el = pron.children[i];
                if (i < count) {
                    el.style.display = 'block';
                    divs.push(el);
                } else el.style.display = 'none';
            }
        } else {
            for (var _i = 0; _i < childCount; _i++) {
                var _el = pron.children[_i];
                _el.style.display = 'block';
                divs.push(_el);
            }
            while (count > childCount) {
                var div = document.createElement('div');
                div.setAttribute('style', attrs[3]);
                pron.appendChild(div);
                for (var _i2 = 0; _i2 < 3; _i2++) {
                    var span = document.createElement('span');
                    span.setAttribute('style', attrs[_i2]);
                    div.appendChild(span);
                }
                divs.push(div);
                count--;
            }
        }
        return divs;
    }
    var setButton = function setButton(button, style, mark) {
        button.setAttribute('style', style);
        button.addEventListener('mouseup', playAudio, true);
        button.setAttribute('title', '播放' + mark + ' » [' + button.innerText + ']');
    };
    function updateContent(entry) {
        dict.style.display = 'block';
        if (entry.next) {
            show.style.display = 'none';
            edit.style.display = 'none';
            next.style.display = 'block';
            next.innerHTML = entry.next;
        } else {
            next.style.display = 'none';
            edit.style.display = 'none';
            show.style.display = 'block';
            head.innerText = word.innerText = entry.qword;
            if (entry.family && entry.family.length > 1) {
                done.style.color = head.style.color = word.style.color = '#8f0610';
                arch.setAttribute('fill', '#8f0610');
            } else {
                done.style.color = head.style.color = word.style.color = '#07255e';
                arch.setAttribute('fill', '#07255e');
            }
            if (entry.count) word.setAttribute('title', '第' + entry.count + '次查询');else word.removeAttribute('title');
            input.value = tran.innerText = entry.trans;
            if (entry.link) {
                link.style.color = entry.link.color ? entry.link.color : main.style.color;
                link.setAttribute('title', entry.link.title);
                link.setAttribute('href', entry.link.href);
                link.innerHTML = entry.link.html;
                link.style.display = 'block';
            } else link.style.display = 'none';
            ensurePronItem(pron, entry.poses.length).forEach(function (div, c) {
                var parts = entry.cleng ? ['»', entry.poses[c], '«'] : entry.poses[c].split('$$');
                parts[1] = ' ' + parts[1] + ' ';
                for (var p = 0; p < 3; p++) {
                    var span = div.children[p];
                    if (entry.cleng && p === 1) {
                        span.innerHTML = coder_1.dePinv(parts[p], 'zh:');
                    } else if (!(entry.cleng || p === 1)) {
                        span.innerHTML = coder_1.dePron(parts[p], p === 0 ? 'uk:' : 'us:');
                    } else {
                        span.innerHTML = parts[p];
                        continue;
                    }
                    var buttons = span.querySelectorAll('span[data-url]');
                    for (var b = 0; b < buttons.length; b++) {
                        setButton(buttons[b], attrs[p], entry.cleng ? '拼音' : p === 0 ? '英式' : '美式');
                    }
                }
            });
        }
    }
    function pinpoint(aRect) {
        var x = window.pageXOffset,
            y = window.pageYOffset;
        var rRect = { left: aRect.left - x, right: aRect.right - x, top: aRect.top - y, bottom: aRect.bottom - y };
        if (Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth) < main.offsetWidth) {
            dict.style.display = 'none';
            return false;
        }
        if (rRect.left < 0 || rRect.right > document.documentElement.clientWidth) {
            dict.style.display = 'none';
            return false;
        }
        var margin = 14;
        var above = rRect.top >= main.offsetHeight + margin;
        var below = above || document.documentElement.clientHeight - rRect.bottom >= main.offsetHeight + margin;
        above = above || !below && rRect.top + y >= main.offsetHeight + margin;
        below = above || below || Math.max(document.documentElement.offsetHeight, document.documentElement.clientHeight) - rRect.bottom >= main.offsetHeight + margin;
        if (!(above || below)) {
            dict.style.display = 'none';
            return false;
        }
        if (above) {
            main.style.top = -main.offsetHeight + 'px';
        } else {
            main.style.top = '0';
        }
        var middle = rRect.left + rRect.right;
        var total = document.documentElement.clientWidth;
        if (total < main.offsetWidth) {
            middle += x;
            total = Math.max(total, document.documentElement.offsetWidth);
        }
        if (middle >= main.offsetWidth) {
            var offset = main.offsetWidth + middle - 2 * total;
            if (offset <= 0) {
                main.style.left = -main.offsetWidth / 2 + 'px';
            } else {
                main.style.left = (-offset - main.offsetWidth) / 2 + 'px';
            }
        } else {
            main.style.left = -middle / 2 + 'px';
        }
        dict.style.left = (rRect.right + rRect.left) / 2 + x + 'px';
        if (above) {
            dict.style.top = rRect.top + y - margin + 'px';
            tlay.style.borderTop = '11px solid #FFF1E0';
            blay.style.borderTop = '12px solid #E9DECF';
            tlay.style.borderBottom = 'none';
            blay.style.borderBottom = 'none';
            tlay.style.top = '-1px';
            blay.style.top = '0';
        } else {
            dict.style.top = rRect.bottom + y + margin + 'px';
            tlay.style.borderTop = 'none';
            blay.style.borderTop = 'none';
            tlay.style.borderBottom = '11px solid #FFF1E0';
            blay.style.borderBottom = '12px solid #E9DECF';
            tlay.style.top = '-10px';
            blay.style.top = '-12px';
        }
        return true;
    }
    function showDict(entry, rect) {
        updateContent(rentry = entry);
        return pinpoint(rect);
    }
    function hideDict() {
        dict.style.display = 'none';
        handler({ action: 3 });
    }
    function tryToShowDict(text, rect) {
        var qword = text.substr(2);
        var lang = text.substr(0, 2);
        injector.query({ query: qword, lang: lang }, function (entry) {
            if (entry) {
                absoluteRect = rect;
                if (showDict(entry, rect)) {
                    storage_1.updateStorage(':ngl@vocabulary', entry.qword, function (item, save) {
                        item.count = item.count + 1 || 1;
                        item.moment = Date.now();
                        save(item);
                    });
                    handler({ action: lang === 'zh' ? 10 : 11 });
                }
            }
        });
    }
    return { input: input, hideDict: hideDict, tryToShowDict: tryToShowDict };
}
exports.default = default_1;

},{"../shared/storage":9,"./coder":5}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function detect(char) {
    var code = char.charCodeAt(0);
    if (code < 128) {
        if ('a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || char === '-') return 1;
        return 0;
    }
    if (code >= 0x2E80) {
        if (0x4E00 <= code && code <= 0x9FD5 || 0x3400 <= code && code <= 0x4DB5 || 0xF900 <= code && code <= 0xFAFF || 0x2F00 <= code && code <= 0x2FDF || 0x2E80 <= code && code <= 0x2EFF || 0x31C0 <= code && code <= 0x31EF || 0x2FF0 <= code && code <= 0x2FFF) {
            return 2;
        }
    }
    if (code <= 0x02FF) {
        if (char === 'ª' || char === 'º') return 1;
        if (char < 'À') return 0;
        if (char <= 'ʯ') {
            if (char === '×' || char === '÷') return 0;else return 1;
        }
        return 0;
    }
    if ('Ḁ' <= char && char <= 'ỿ') {
        return 1;
    }
    return 0;
}
function legalWord(word) {
    for (var i = 0; i < word.length; i++) {
        var char = word.charAt(i);
        if ("，’' ".indexOf(char) < 0 && detect(char) === 0) return false;
    }
    return true;
}
exports.legalWord = legalWord;
function shorten(text) {
    if (!text || text.length > 99) return null;
    var max = 0;
    var len = 0;
    var count = 0;
    while (len < text.length) {
        var flag = detect(text.charAt(len));
        max = Math.max(max, flag);
        if (flag === 0) {
            if ("，’' ".indexOf(text.charAt(len)) >= 0) {
                if (count > 4) break;else if (max === 2 && count > 0) break;
                count++;
            } else {
                if (len === 0) return null;
                if (text.charAt(len) === '.') len++;
                break;
            }
        }
        len++;
    }
    if (max === 1 && len === 1) return null;
    return (max === 2 ? 'zh' : 'en') + text.substr(0, len).replace("'", '’');
}
exports.shorten = shorten;
function staticText(element) {
    if (document.designMode && 'on' === document.designMode.toLowerCase().trim()) return false;
    while (element) {
        if (element.isContentEditable) return false;
        if (element.tagName) {
            var name = element.tagName.toLocaleLowerCase().trim();
            if ('input' === name || 'textarea' === name) return false;
        }
        element = element.parentNode;
    }
    return true;
}
exports.staticText = staticText;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function queryStorage(sectionKey, consume) {
    try {
        chrome.storage.local.get(sectionKey, function (storage) {
            consume(storage[sectionKey], function (section) {
                storage[sectionKey] = section;
                chrome.storage.local.set(storage);
            });
        });
    } catch (_a) {}
}
exports.queryStorage = queryStorage;
function updateStorage(sectionKey, itemKey, update) {
    try {
        chrome.storage.local.get(sectionKey, function (storage) {
            if (!storage[sectionKey]) storage[sectionKey] = Object.create(null);
            update(storage[sectionKey][itemKey] || Object.create(null), function (item) {
                storage[sectionKey][itemKey] = item;
                chrome.storage.local.set(storage);
            });
        });
    } catch (_a) {}
}
exports.updateStorage = updateStorage;
function insertStorage(sectionKey, itemKey, item) {
    try {
        chrome.storage.local.get(sectionKey, function (storage) {
            if (!storage[sectionKey]) storage[sectionKey] = Object.create(null);
            storage[sectionKey][itemKey] = item;
            chrome.storage.local.set(storage);
        });
    } catch (_a) {}
}
exports.insertStorage = insertStorage;
function removeStorage(sectionKey, itemKey) {
    try {
        chrome.storage.local.get(sectionKey, function (storage) {
            if (storage[sectionKey] && storage[sectionKey][itemKey]) {
                delete storage[sectionKey][itemKey];
                chrome.storage.local.set(storage);
            }
        });
    } catch (_a) {}
}
exports.removeStorage = removeStorage;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var popdict_1 = require("./popdict");
popdict_1.default(function (action) {
    console.log(action.action);
});

},{"./popdict":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ctrler_1 = require("../content/ctrler");
var player_1 = require("../background/player");
var entry_1 = require("../background/entry");
function default_1(handler) {
    var injector = {
        query: function query(data, cb) {
            entry_1.query(data.query, data.lang, cb, true);
        },
        play: function play(data) {
            player_1.default(data.play, function (id) {
                if (injector.onplayerror) injector.onplayerror(id);
            });
        },
        post: function post(data, cb) {
            entry_1.post(data.query, data.newVal, cb, true);
        }
    };
    return ctrler_1.default(injector, handler);
}
exports.default = default_1;

},{"../background/entry":1,"../background/player":3,"../content/ctrler":6}]},{},[10]);
