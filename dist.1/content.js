(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var dict_1 = require("./dict");
var utility_1 = require("./utility");
function default_1(injector) {
    var Dict = dict_1.default(injector);
    var mouseupEnabled = true;
    var dictEnabled = true;
    var mousedownTargetIsInput = false;
    function capture() {
        try {
            var sele = window.getSelection();
            var text = utility_1.shorten(sele.toString().trim());
            var rect = sele.getRangeAt(0).getBoundingClientRect();
            if (text && rect.left >= 0 && rect.right <= document.documentElement.clientWidth && rect.right > rect.left && utility_1.staticText(sele.anchorNode)) {
                var x = window.pageXOffset,
                    y = window.pageYOffset;
                return [text, {
                    left: rect.left + x,
                    right: rect.right + x,
                    bottom: rect.bottom + y,
                    top: rect.top + y
                }];
            }
        } catch (_a) {}
        return [null, null];
    }
    var input = Dict.input;
    document.addEventListener('mousedown', function (_ref) {
        var target = _ref.target;

        mouseupEnabled = dictEnabled && utility_1.staticText(target);
        mousedownTargetIsInput = target === input;
    }, true);
    document.addEventListener('mouseup', function (_ref2) {
        var target = _ref2.target;

        if (mousedownTargetIsInput) return;
        if (mouseupEnabled && utility_1.staticText(target)) {
            if (target !== document) {
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

},{"./dict":3,"./utility":5}],3:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", { value: true });
var coder_1 = require("./coder");
function default_1(injector) {
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
            injector.find({ word: qword, lang: rentry.cleng ? 'zh' : 'en' }, function (entry) {
                if (entry) {
                    entry.family = rentry.family;
                    entry.index = rentry.index;
                    showDict(entry, absoluteRect);
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
            } else {
                injector.post({ query: rentry.qword, newVal: newVal }, function (trans) {
                    rentry.trans = trans;
                    updateContent(rentry);
                    pinpoint(absoluteRect);
                });
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
        }
    });
    function playAudio(event) {
        event.stopPropagation();
        var el = event.target;
        var play = el.getAttribute('data-url');
        injector.play({ play: play });
    }
    injector.onplayerror = function (id) {
        var target = pron.querySelector("[data-url=\"" + id + "\"]");
        if (target) target.style.textDecoration = 'line-through';
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
        return pinpoint(absoluteRect = rect);
    }
    function hideDict() {
        dict.style.display = 'none';
    }
    function tryToShowDict(text, rect) {
        var qword = text.substr(2);
        var lang = text.substr(0, 2);
        injector.find({ word: qword, lang: lang }, function (entry) {
            if (entry) {
                showDict(entry, rect);
            }
        });
    }
    return { input: input, hideDict: hideDict, tryToShowDict: tryToShowDict };
}
exports.default = default_1;

},{"./coder":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ctrler_1 = require("./ctrler");
var injector = {
    play: function play(data) {
        chrome.runtime.sendMessage({ action: 'PLAY_SOUND', data: data });
    },
    find: function find(data, cb) {
        chrome.runtime.sendMessage({ action: 'FIND_WORD', data: data }, cb);
    },
    post: function post(data, cb) {
        if (cb) chrome.runtime.sendMessage({ action: 'POST_WORD', data: data }, cb);else chrome.runtime.sendMessage({ action: 'POST_WORD', data: data });
    }
};
var setEnable = ctrler_1.default(injector);
chrome.runtime.onMessage.addListener(function (_ref) {
    var action = _ref.action,
        data = _ref.data;

    if (action === 'PLAY_ERROR') {
        if (injector.onplayerror) injector.onplayerror(data);
    } else if (action === 'STOP_FIND') {
        setEnable(false);
    } else if (action === 'ADD_NOTE') {
        var noteText = window.getSelection().toString().trim();
        if (noteText) {
            chrome.runtime.sendMessage({
                action: action,
                data: {
                    text: noteText,
                    time: Date.now(),
                    url: data
                }
            });
        }
    }
});

},{"./ctrler":2}],5:[function(require,module,exports){
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
            var name = element.tagName.toLowerCase().trim();
            if (['input', 'textarea', 'button'].indexOf(name) > -1) return false;
        }
        element = element.parentNode;
    }
    return true;
}
exports.staticText = staticText;

},{}]},{},[4]);
