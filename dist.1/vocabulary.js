(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var storage_1 = require("../shared/storage");
document.addEventListener('DOMContentLoaded', function () {
    storage_1.queryStorage(':ngl@vocabulary', function (vocabulary) {
        if (vocabulary) {
            var arr = new Array();
            for (var key in vocabulary) {
                arr.push({ word: key, count: vocabulary[key].count });
            }
            arr.sort(function (item1, item2) {
                return item2.count - item1.count || item2.word.length - item1.word.length || (item1.word.toLowerCase() >= item2.word.toLowerCase() ? 1 : -1);
            });
            var main = document.getElementById('main');
            var html = '';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    html += "<div class=\"item-h\"><div class=\"word\">" + item.word + "</div><div class=\"count\">" + item.count + "</div></div>";
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

            main.innerHTML = html;
        }
    });
});

},{"../shared/storage":1}]},{},[2]);
