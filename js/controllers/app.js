(function() {

    'use strict';

    angular.module('delimall', [
            'ngRoute',
            //'ngTouch',
            'config.routes',
            'controllers.error',
            'controllers.index',
            'controllers.login',
            'controllers.logout',
            'controllers.profile',
            'controllers.users',
            'services.auth',
            'services.error',
            'directives.navbar',
            'chieffancypants.loadingBar'
        ]).config([
            '$routeProvider',
            '$httpProvider',
            'RoutesProvider',
            'cfpLoadingBarProvider',
            function($routeProvider, $httpProvider, RoutesProvider, cfpLoadingBarProvider) {
                var routes = RoutesProvider.getRoutes(),
                    expires = 0;
                cfpLoadingBarProvider.includeSpinner = true;
                cfpLoadingBarProvider.includeBar = true;
                angular.forEach(routes, function(route) {
                    var resolve = route.hasOwnProperty('resolve') ? route.resolve : {};
                    $routeProvider.when(route.url, {
                        templateUrl: route.template,
                        controller: route.controller + 'Controller',
                        access: route.roles,
                        resolve: route.resolve
                    });
                });
                $routeProvider.otherwise({ redirectTo: '/error/404' });
                $httpProvider.interceptors.push([
                    '$q',
                    '$location',
                    'ErrorService',
                    function($q, $location, ErrorService) {
                        return {
                            'responseError': function(response) {
                                var redirect = ErrorService.parse($location.path(), response);
                                switch (redirect) {
                                    case 401:
                                        $location.path('/logout');
                                        break;
                                    case 403:
                                        $location.path('/error/403');
                                        break;
                                    case 404:
                                        $location.path('/error/404');
                                        break;
                                }
                                return $q.reject(response);
                            }
                        }
                    }
                ]);
            }
        ]).run([
            '$rootScope',
            '$location',
            '$http',
            'AuthService',
            function($rootScope, $location, $http, AuthService) {
                $rootScope.$on("$routeChangeStart", function(event, next) {
                    var user = AuthService.getUser();
                    if (angular.isString(next.controller) && next.controller.length > 0) {
                        user.currentPage = next.controller.substr(0, next.controller.indexOf("Controller")).toLowerCase();
                    } else {
                        user.currentPage = '';
                    }
                    AuthService.connect().then(
                        function() {
                            if (AuthService.isPrivatePage(next.access)) {
                                if (!AuthService.isOnline()) {
                                    console.warn('Redirecting from "' + next.controller + '" to "login"');
                                    $location.path('/login');
                                }
                            }
                        }
                    );
                });
            }
        ]).controller('MainController', [
            '$scope',
            function($scope) {
            }
        ]);
})();