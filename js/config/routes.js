(function() {

    'use strict';

    angular.module('config.routes', [])
        .provider('Routes', [
            function() {

                var accessLevels = {
                    'public': [ ],
                    'user': ['user'],
                    'admin': ['user', 'admin']
                };

                var routes = [
                    /* ***************** Public ***************** */
                    {
                        'url': '/error/:error',
                        'template': '/partials/pages/error.html',
                        'controller': 'Error',
                        'roles': accessLevels['public']
                    },
                    {
                        'url': '/login',
                        'template': '/partials/pages/login.html',
                        'controller': 'Login',
                        'roles': accessLevels['public']
                    },
                    /* ***************** User ***************** */
                    {
                        'url': '/',
                        'template': '/partials/pages/index.html',
                        'controller': 'Index',
                        'roles': accessLevels['user']
                    },
                    {
                        'url': '/users',
                        'template': '/partials/pages/users.html',
                        'controller': 'Users',
                        'roles': accessLevels['user']
                    },
                    {
                        'url': '/profile/:userId',
                        'template': '/partials/pages/profile.html',
                        'controller': 'Profile',
                        'roles': accessLevels['user']
                    },
                    {
                        'url': '/logout',
                        'template': '/partials/pages/logout.html',
                        'controller': 'Logout',
                        'roles': accessLevels['public']
                    }
                ];

                this.getRoutes = function() {
                    return routes;
                };

                this.$get = function() {
                    return {
                        accessLevels: accessLevels,
                        routes: routes
                    };
                };
            }
        ]);
})();
