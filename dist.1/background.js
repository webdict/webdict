(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var urld = {
    'ajax.googleapis.com': 'ajax.lug.ustc.edu.cn',
    'themes.googleusercontent.com': 'google-themes.lug.ustc.edu.cn'
};
chrome.webRequest.onBeforeRequest.addListener(function (_ref) {
    var url = _ref.url;

    for (var key in urld) {
        url = url.replace(key, urld[key]);
    }
    return { redirectUrl: url };
}, { urls: Object.keys(urld).map(function (url) {
        return '*://' + url + '/*';
    }) }, ['blocking']);

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var trans = require("./trans");
var Q_URL = 'http://120.78.146.219/q/';
var F_URL = 'http://120.78.146.219/f/';
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
function find(qword, lang, consume) {
    var async = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var entry = map[qword];
    if (entry) {
        if (entry !== EMPTY) {
            entry.trans = trans.get(entry.qword) || '[Not Found]';
            consume(entry);
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
                        consume(map[qword] = baseEntry);
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
                    console.log(JSON.stringify(newEntry));
                    consume(map[newEntry.qword] = newEntry);
                }
            } else consume(undefined);
        };
        _xhr.onerror = function () {
            consume(undefined);
        };
        _xhr.send();
    }
}
exports.find = find;
exports.post = trans.set;

},{"./trans":7}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function default_1(action, data) {
    if (gtag) gtag('event', action, data);
}
exports.default = default_1;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
require("./cnd");
require("./menus");
var player_1 = require("./player");
var entry_1 = require("./entry");
chrome.runtime.onMessage.addListener(function (_ref, sender, sendRes) {
    var action = _ref.action,
        data = _ref.data;

    switch (action) {
        case 'ADD_NOTE':
            console.log(data);
            return false;
        case 'PLAY_SOUND':
            var tabId = sender.tab && sender.tab.id;
            player_1.default(data.play, function (data) {
                chrome.tabs.sendMessage(tabId, { action: 'PLAY_ERROR', data: data });
            });
            return false;
        case 'FIND_WORD':
            entry_1.find(data.word, data.lang, sendRes);
            return true;
        case 'POST_WORD':
            entry_1.post(data.query, data.newVal, sendRes);
            return true;
        default:
            return false;
    }
});

},{"./cnd":1,"./entry":2,"./menus":5,"./player":6}],5:[function(require,module,exports){
'use strict';

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    try {
        var action = info.menuItemId;
        var id = tab.id,
            data = tab.url;

        if (action === 'REPORT_BUG') {
            console.log('Reporting bugs to server...');
        } else {
            chrome.tabs.sendMessage(id, { action: action, data: data });
        }
    } catch (_a) {}
});
chrome.contextMenus.create({
    contexts: ['selection'],
    id: 'ADD_NOTE',
    title: 'Add Note'
});
chrome.contextMenus.create({
    contexts: ['page'],
    id: 'STOP_FIND',
    title: 'Disable Dict'
});

},{}],6:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var gtag_1 = require("./gtag");
var ZH_URL = 'http://120.78.146.219/static/pron/zh/';
var UK_URL = 'http://120.78.146.219/static/pron/uk/';
var US_URL = 'http://120.78.146.219/static/pron/us/';
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

},{"./gtag":3}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var D_URL = 'http://120.78.146.219/d/';
var P_URL = 'http://120.78.146.219/definition';
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

},{}]},{},[4]);
