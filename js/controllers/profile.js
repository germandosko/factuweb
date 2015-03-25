'use strict';

angular.module('controllers.profile', [
        'ngRoute',
        'resources.user'
    ])
    .controller('ProfileController', [
        '$scope',
        '$routeParams',
        'User',
        function($scope, $routeParams, User) {

            var _load = function(){
                User.FindById($routeParams.userId, true).then(
                    function(user) {
                        $scope.user = user;
                        $scope.loaded = true;
                    }
                );
            };

            $scope.user = {};

            _load();
        }
    ]);