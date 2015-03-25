(function() {

    'use strict';

    angular.module('services.auth', [
            'ngRoute',
            'resources.resource',
            'resources.user'
        ]).factory('AuthService', [
            '$q',
            'Resource',
            'User',
            function($q, Resource, User) {

                var _user = {
                        _id: undefined,
                        name: undefined,
                        email: undefined,
                        photo: undefined,
                        network: undefined,
                        token: undefined,
                        currentPage: undefined,
                        expires: undefined,
                        lastExpirationCheck: 0
                    },
                    _isConnected = false,
                    _timeout = 10 * 1000;

                var _reset = function() {
                    _user._id = undefined;
                    _user.name = undefined;
                    _user.email = undefined;
                    _user.photo = undefined;
                    _user.network = undefined;
                    _user.token = undefined;
                    _user.expires = undefined;
                    _user.lastExpirationCheck = 0;
                    _isConnected = false;
                    Resource.Clear();
                };

                var _set = function(data) {
                    _reset();
                    var isValid = angular.isObject(data) &&
                        angular.isString(data._id) && data._id.length > 0 &&
                        angular.isString(data.name) && data.name.length > 0;
                    if (isValid) {
                        _user._id = data._id;
                        _user.name = data.name;
                        _user.email = data.email;
                        _user.photo = data.photo;
                        _user.network = data.network;
                        _user.token = data.token;
                    }
                };

                var _connect = function() {
                    var defer;
                    if (_isConnected) {
                        if (Date.now() - _user.lastExpirationCheck > _timeout) {
                            return User.GetExpirationDate().then(
                                function(expires) {
                                    _user.expires = expires;
                                    _user.lastExpirationCheck = Date.now();
                                }
                            );
                        } else {
                            defer = $q.defer();
                            defer.resolve(_user);
                            return defer.promise;
                        }
                    } else {
                        return User.GetSession().then(
                            function(user) {
                                if (angular.isObject(user) && angular.isString(user._id) && user._id.length > 0) {
                                    _set(user);
                                    _isConnected = true;
                                    User.GetExpirationDate().then(
                                        function(expires) {
                                            _user.expires = expires;
                                            _user.lastExpirationCheck = Date.now();
                                        }
                                    );
                                }
                                return _user;
                            },
                            function(err) {
                                console.error(err);
                                return _user;
                            }
                        );
                    }
                };

                var _logout = function() {
                    return User.Logout().then(
                        function() {
                            _reset();
                        },
                        function(err) {
                            console.error(err);
                        }
                    );
                };

                _reset();

                return {
                    connect: function() {
                        return _connect();
                    },
                    reset: function() {
                        return _reset();
                    },
                    logout: function() {
                        return _logout();
                    },
                    getUser: function() {
                        return _user;
                    },
                    isOnline: function() {
                        return angular.isString(_user._id) && _user._id.length;
                    },
                    isPrivatePage: function(pageAccess) {
                        return angular.isArray(pageAccess) && pageAccess.length;
                    }
                };
            }
        ]);
})();
