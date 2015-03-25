'use strict';

angular.module('services.socket-io', [])
    .factory('SocketIOService', ['$rootScope', function($rootScope) {
        var RETRY_TIME = 500;

        var socket, events = [], syncListeners = [], retryTimeout, isConnected = false;

        function _prepareConnection() {
            if (!socket) {
                socket = io.connect(window.location.hostname, {
                    'force new connection': true
                });

                socket.on('error', _retryConnection);

                socket.on('connect', function() {
                    clearTimeout(retryTimeout);

                    isConnected = true;
                    _reattachEvents();

                    _sync();
                });

                socket.on('disconnect', function() {
                    isConnected = false;
                    _retryConnection();
                });
            }
        }

        function _retryConnection() {
            isConnected = false;
            socket.removeAllListeners();

            socket = null;
            retryTimeout = setTimeout(function() {
                _prepareConnection();
            }, RETRY_TIME);
        }

        function _reattachEvents() {
            angular.forEach(events, function(evt) {
                socket.on(evt.event, evt.cb);
            });
        }

        function _sync() {
            angular.forEach(syncListeners, function(evt) {
                cb();
            });
        }

        return {
            onSynchronize: function(cb) {
                syncListeners.push(cb);
            },
            on: function(eventName, callback) {
                _prepareConnection();
                events.push({
                    event: eventName,
                    cb: callback
                });

                if (isConnected) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                }
            },
            emit: function(eventName, data, callback) {
                _prepareConnection();

                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }]);