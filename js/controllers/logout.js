(function() {

    'use strict';

    angular.module('controllers.logout', [
            'ngRoute',
            'services.auth'
        ])
        .controller('LogoutController', [
            '$location',
            'AuthService',
            function($location, AuthService) {
                if (AuthService.isOnline()) {
                    AuthService.reset();
                }
                $location.path('/login');
            }
        ]);
})();
