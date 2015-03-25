'use strict';

angular.module('controllers.index', ['ui.bootstrap'])
    .controller('IndexController', [
        '$scope',
        '$http',
        function($scope, $http) {

            var _parseResults = function(results){
                var i, col, rank;
                for (i = 0; i < results.length; i++) {
                    col = results[i].col;
                    rank = results[i].rank;
                    if (angular.isNumber(col) && angular.isNumber(rank)) {
                        $scope.hasResults = true;
                        if (angular.isUndefined($scope.results['stack' + col])) {
                            $scope.results['stack' + col] = {
                                header: {},
                                articles: []
                            };
                        }
                        if (rank > 0) {
                            $scope.results['stack' + col].articles.push(results[i]);
                        } else {
                            $scope.results['stack' + col].header = results[i];
                        }
                    }
                }
            };

            $scope.searchBox = {
                show: false,
                target1Text: null,
                target2Text: null
            };
            $scope.hasResults = false;
            $scope.params = {
                dip: 0,
                strip: 1,
                target1: '',
                target2: ''
            };
            $scope.results = {};
            $scope.current = {};

            $scope.checkShowSearchBox = function() {
                $scope.searchBox.show = false;
                $scope.searchBox.target1Text = '';
                $scope.searchBox.target1Text = '';
                $scope.params.target1 = '';
                $scope.params.target2 = '';
                switch ($scope.params.dip){
                    case 0:
                        if ($scope.params.strip > 3) {
                            $scope.searchBox.show = true;
                            $scope.searchBox.target1Text = 'Target Handle';
                            $scope.searchBox.target2Text = '';
                        }
                        break;
                    case 1:
                        if ($scope.params.strip <= 3) {
                            $scope.searchBox.show = true;
                            $scope.searchBox.target1Text = 'Target';
                            $scope.searchBox.target2Text = '';
                        } else if ($scope.params.strip > 3) {
                            $scope.searchBox.show = true;
                            $scope.searchBox.target1Text = 'Target Handle';
                            $scope.searchBox.target2Text = '';
                        }
                        break;
                    case 2:
                        if ($scope.params.strip < 3) {
                            $scope.searchBox.show = true;
                            $scope.searchBox.target1Text = 'Target 1';
                            $scope.searchBox.target2Text = 'Target 2';
                        } else if ($scope.params.strip === 3) {
                            $scope.searchBox.show = true;
                            $scope.searchBox.target1Text = 'Target 1 Handle';
                            $scope.searchBox.target2Text = 'Target 2 Handle';
                        }
                        break;
                }
            };

            $scope.send = function(postfix) {
                var url = '/v2/dip/'+$scope.params.dip+'/strip/'+$scope.params.strip;
                $scope.hasResults = false;
                $scope.results = {};
                $scope.current = {};
                if(angular.isString($scope.params.target1) && $scope.params.target1.length > 0) {
                    url += '/target/'+$scope.params.target1;
                    if(angular.isString($scope.params.target2) && $scope.params.target2.length > 0) {
                        url += '/target/'+$scope.params.target2;
                    }
                }
                url += postfix;
                $http.get(url).then(function(response) {
                    _parseResults(response.data.results);
                });
            };

            $scope.show = function(stack) {
                $scope.current = stack;
            };
        }
    ]);