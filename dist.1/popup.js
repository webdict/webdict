(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var timeago_1 = require("./timeago");
document.addEventListener('DOMContentLoaded', function () {
    var clickEls = document.querySelectorAll('[data-url]');

    var _loop = function _loop(i) {
        var el = clickEls[i];
        el.onclick = function (event) {
            var path = el.getAttribute('data-url');
            if (path.indexOf(':') < 0) {
                path = chrome.runtime.getURL(path);
            }
            chrome.tabs.create({ url: path });
            event.preventDefault();
            window.close();
        };
    };

    for (var i = 0; i < clickEls.length; i++) {
        _loop(i);
    }
    var timeAgoEl = document.getElementById('time-ago');
    if (timeAgoEl) {
        var update = function update() {
            if (xhr) return;
            xhr = new XMLHttpRequest();
            xhr.open("GET", 'http://120.78.146.219/s/json');
            xhr.onload = function () {
                timeAgoEl.className = '';
                var data = JSON.parse(xhr.responseText);
                timeAgoEl.innerText = data.count + ' @' + timeago_1.default(data.stamp);
                timeAgoEl.style.display = 'block';
                if (intervalId !== undefined) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(function () {
                    if (!timeAgoEl.className) timeAgoEl.className = 'fadeout';
                    timeAgoEl.innerText = data.count + ' @' + timeago_1.default(data.stamp);
                }, 1000);
                xhr = null;
            };
            xhr.onerror = function () {
                xhr = null;
            };
            xhr.send();
        };

        var intervalId = void 0;
        var xhr = void 0;

        update();
        timeAgoEl.onclick = update;
    }
});

},{"./timeago":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function secondString(second) {
    var mark = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' AGO';

    if (second <= 0) return mark;
    return second + 'S AGO';
}
function minuteString(minute) {
    if (minute <= 0) return '';
    return minute + 'M';
}
function timeAgo(stamp) {
    var second = Math.round(Date.now() / 1000 - stamp);
    if (second < 60) return secondString(second, 'NOW');
    var minute = Math.round(second / 60);
    second %= 60;
    if (minute < 60) return minuteString(minute) + secondString(second);
    var hour = Math.round(minute / 60);
    minute %= 60;
    return hour + 'H' + minuteString(minute) + secondString(second);
}
exports.default = timeAgo;

},{}]},{},[1]);
