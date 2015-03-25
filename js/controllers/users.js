'use strict';

angular.module('controllers.users', [
        'ngRoute',
        'resources.user'
    ])
    .controller('UsersController', [
        '$scope',
        '$routeParams',
        'User',
        function($scope, $routeParams, User) {

            var _load = function(){
                User.FetchAll(true).then(
                    function(users) {
                        $scope.allUsers = users;
                        $scope.loaded = true;
                    }
                );
            };

            $scope.allUsers = [];

            _load();
        }
    ]);