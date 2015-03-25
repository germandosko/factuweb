(function() {

    'use strict';

    angular.module('resources.user', [
            'resources.resource'
        ]).factory('User', [
            '$http',
            'Resource',
            function($http, Resource) {

                var _prepareUI = function(obj) {
                    obj.logo = obj.network;
                    if (obj.network == 'google') {
                        obj.logo = obj.network + '-plus';
                    }
                    return obj;
                };

                var User = function(config) {
                    var defaultProperties = {
                        _id: null,
                        name: null,
                        email: null,
                        photo: null,
                        network: null,
                        logo: null,
                        created: null
                    };
                    angular.extend(defaultProperties, new Resource(config));
                    angular.extend(this, defaultProperties);
                    return _prepareUI(this);
                };

                Resource.$extend('User', User);

                User.GetSession = function() {
                    return User.Fetch('session', true);
                };

                User.GetExpirationDate = function() {
                    return $http.get('/user/expiration-date').then(
                        function(response) {
                            return response.data.expires;
                        }
                    );
                };

                User.Logout = function() {
                    return User.Fetch('logout', true);
                };

                return User;
            }
        ]);
})();
