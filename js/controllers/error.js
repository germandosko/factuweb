(function() {

    'use strict';

    angular.module('controllers.error', [
            'ngRoute',
            'services.error'
        ])
        .controller('ErrorController', [
            '$scope',
            '$routeParams',
            'ErrorService',
            function($scope, $routeParams, ErrorService) {
                $scope.code = $routeParams.error;
                $scope.error = ErrorService.getCurrent();
                if (angular.isObject($scope.error) && !$scope.error.shown) {
                    $scope.error.shown = true;
                } else {
                    $scope.error = {
                        title: 'Not Found',
                        description: 'The requested page does not exist',
                        shown: true
                    };
                }
            }
        ]
        );
})();
