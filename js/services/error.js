(function() {

    'use strict';

    angular.module('services.error', [
            'ngRoute'
        ]).factory('ErrorService', [
            function() {

                var _current = undefined;

                var _parse = function(path, response) {
                    var redirect = 0;
                    _current = undefined;
                    switch (response.status) {
                        case 400:
                            if (angular.isObject(response.data) && angular.isString(response.data.message)) {
                                _current = response.data;
                                _current.shown = true;
                                console.warn('Error 400: ' + response.data.message);
                            } else {
                                console.warn('Error 400: Client error.', response);
                            }
                            break;
                        case 401:
                            console.warn('Error 401: Redirecting from "' + path + '" to "/Login"');
                            redirect = 401;
                            break;
                        case 403:
                            switch (response.data.code) {
                                case 'invalid_request_source':
                                    _current = {
                                        title: 'Unable to access',
                                        description: 'The requested action is disabled for web access. ' +
                                            'Valid sources: ' + response.data.description.allowedSources.join(', '),
                                        shown: false
                                    };
                                    redirect = 403;
                                    break;
                                case 'disabled_error':
                                    if (angular.isObject(response.data) && angular.isString(response.data.message)) {
                                        console.warn('Error 403: ' + response.data.message);
                                    } else {
                                        console.warn('Error 403: Disabled Action.', response);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case 404:
                            _current = {
                                title: 'Not Found',
                                description: 'The requested page does not exist',
                                shown: false
                            };
                            switch (response.data.code) {
                                case 'not_found':
                                    _current.description = 'The requested ' + response.data.description.entityName +
                                        ' does not exist';
                                    break;
                                case 'static_view_not_found':
                                default:
                                    break;
                            }
                            redirect = 404;
                            break;
                        case 500:
                            console.warn('Error 500: Server Error: ', response);
                            break;
                    }
                    return redirect;
                };

                return {
                    getCurrent: function() {
                        return _current;
                    },
                    parse: function(path, response) {
                        return _parse(path, response);
                    }
                };
            }
        ]);
})();
