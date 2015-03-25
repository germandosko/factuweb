(function() {

    'use strict';

    angular.module('controllers.login', [
            'ngRoute',
            'services.auth'
        ])
        .controller('LoginController', [
            '$location',
            'AuthService',
            function($location, AuthService) {
                if (AuthService.isOnline()) {
                    $location.path('/');
                }
            }
        ]);
})();
