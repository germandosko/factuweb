"use strict";

angular.module('filters.capitalize', [])
    .filter('capitalize', function() {
        return function(text) {
            var newText = '';
            if (angular.isDefined(text)) {
                newText = text.charAt(0).toUpperCase() + text.slice(1);
            }
            return newText;
        };
    })
    .filter('capitalizeAll', function() {
        return function(text) {
            var i, words = [];
            if (angular.isDefined(text)) {
                words = text.split(' ');
                for (i in words) {
                    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
                }
            }
            return words.join(' ');
        };
    });