(function() {

    'use strict';

    angular.module('directives.navbar', [
            'ui.bootstrap',
            'services.auth'
        ])
        .directive('navbar', [
            function() {
                return {
                    restrict: 'A',
                    scope: { },
                    replace: true,
                    transclude: false,
                    templateUrl: '/partials/directives/navbar.html',
                    controller: [
                        '$scope',
                        '$location',
                        'AuthService',
                        function($scope, $location, AuthService) {

                            $scope.user = AuthService.getUser();
                            $scope.menu = {
                                index: false,
                                users: false,
                                login: false
                            };

                            $scope.logout = function(){
                                AuthService.logout().then(function() {
                                    $location.path('/login');
                                });
                            };

                            $scope.$watch('user.currentPage', function(newPage){
                                for(var key in $scope.menu){
                                    if($scope.menu.hasOwnProperty(key)){
                                        $scope.menu[key] = false;
                                    }
                                }
                                switch (newPage) {
                                    case 'index':
                                        $scope.menu['index'] = true;
                                        break;
                                    case 'users':
                                        $scope.menu['users'] = true;
                                        break;
                                    case 'login':
                                        $scope.menu['login'] = true;
                                        break;
                                }
                            });
                        }
                    ]
                };
            }
        ]);
})();
