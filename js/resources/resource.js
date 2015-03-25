(function() {

    'use strict';

    angular.module('resources.resource', [
            'ngRoute'
        ]).factory('Resource', [
            '$q',
            '$http',
            function($q, $http) {

                var _cache = {
                    lastFetchAll: {}
                };

                var _arrays = {};

                var _timeout = 60 * 1000; //1 minute

                var _checkCacheEmpty = function(name) {
                    if (!angular.isObject(_cache[name])) {
                        _cache[name] = {};
                    }
                    if (!angular.isArray(_arrays[name])) {
                        _arrays[name] = [];
                    }
                };

                var _updateCache = function(name, obj) {
                    var key, id = obj._id;
                    _checkCacheEmpty(name);
                    if (angular.isObject(_cache[name][id])) {
                        for (key in obj) {
                            if (obj.hasOwnProperty(key) && !angular.isFunction(obj[key])) {
                                _cache[name][id][key] = obj[key];
                            }
                        }
                    } else {
                        _cache[name][id] = obj;
                        _arrays[name].push(obj);
                    }
                    return _cache[name][id];
                };

                var _deleteCache = function(name, id) {
                    var index;

                    if (angular.isObject(_cache[name]) && angular.isObject(_cache[name][id])) {
                        index = _arrays[name].indexOf(_cache[name][id]);

                        if (index >= 0) {
                            _arrays[name].splice(index, 1);
                        }

                        delete _cache[name][id];
                    }
                    return true;
                };

                var _mustGoToServer = function(name) {
                    var elapsedTime,
                        isEmpty = angular.isObject(_cache[name]) && angular.isArray(_arrays[name]),
                        needsUpdate = false,
                        now = new Date();
                    if (isEmpty && angular.isDate(_cache.lastFetchAll[name])) {
                        elapsedTime = now.getTime() - _cache.lastFetchAll[name].getTime();
                        needsUpdate = elapsedTime > _timeout;
                    } else {
                        needsUpdate = true;
                    }
                    if (needsUpdate) {
                        _cache.lastFetchAll[name] = now;
                    }
                    return needsUpdate;
                };

                var _populateAll = function(name) {
                    _checkCacheEmpty(name);
                    for (var key in _cache[name]) {
                        if (_cache[name].hasOwnProperty(key) && angular.isObject(_cache[name][key])) {
                            _cache[name][key].populate();
                        }
                    }
                };

                var _updateCachePromise = function(name, obj, populate) {
                    var deferred = $q.defer();
                    if (populate) {
                        deferred.resolve(obj.populate());
                        return deferred.promise.then(
                            function(newResource) {
                                return _updateCache(name, newResource);
                            }
                        );
                    } else {
                        return $q.when(_updateCache(name, obj));
                    }
                };

                var _$export = function() {
                    var key, newObj = {};
                    for (key in this) {
                        if (this.hasOwnProperty(key)) {
                            newObj[key] = this[key];
                        }
                    }
                    return newObj;
                };

                var Resource = function(config) {
                    var key, that = this;
                    if (angular.isObject(config)) {
                        for (key in config) {
                            if (config.hasOwnProperty(key)) {
                                that[key] = config[key];
                            }
                        }
                    }
                    that.populated = false;
                    that.populate = function() {
                        that.populated = true;
                        return that;
                    };
                    that.$export = _$export;
                    return that;
                };

                Resource.FetchAll = function(name, createResource, populate, config) {
                    var url = '/' + name,
                        promises = [],
                        deferred = $q.defer();
                    if (_mustGoToServer(name)) {
                        if (!angular.isFunction(createResource)) {
                            createResource = function(data) {
                                return new Resource(data);
                            };
                        }
                        $http.get(url, config).then(
                            function(response) {
                                var i, newResource;
                                if (angular.isArray(response.data)) {
                                    for (i = 0; i < response.data.length; i++) {
                                        newResource = createResource(response.data[i]);
                                        promises.push(_updateCachePromise(name, newResource, populate));
                                    }
                                }
                                if (promises.length > 0) {
                                    $q.all(promises).then(function() {
                                        if (!angular.isObject(_cache[name])) {
                                            _cache[name] = {};
                                        }
                                        if (!angular.isArray(_arrays[name])) {
                                            _arrays[name] = [];
                                        }
                                        deferred.resolve(_arrays[name]);
                                    });
                                } else {
                                    if (!angular.isObject(_cache[name])) {
                                        _cache[name] = {};
                                    }
                                    if (!angular.isArray(_arrays[name])) {
                                        _arrays[name] = [];
                                    }
                                    deferred.resolve(_arrays[name]);
                                }
                            },
                            function(err) {
                                deferred.reject(err.data);
                            }
                        );
                    } else {
                        if (populate) {
                            _populateAll(name);
                        }
                        deferred.resolve(_arrays[name]);
                    }
                    return deferred.promise;
                };

                Resource.FindById = function(name, id, createResource, populate, config) {
                    var url, deferred = $q.defer();
                    _checkCacheEmpty(name);
                    if (angular.isObject(_cache[name][id])) {
                        if (populate) {
                            _cache[name][id].populate();
                        }
                        deferred.resolve(_cache[name][id]);
                    } else {
                        url = '/' + name + '/' + id;
                        if (!angular.isFunction(createResource)) {
                            createResource = function(data) {
                                return new Resource(data);
                            };
                        }
                        $http.get(url, config).then(
                            function(response) {
                                var newResource = createResource(response.data);
                                deferred.resolve(_updateCachePromise(name, newResource, populate));
                            },
                            function(err) {
                                deferred.reject(err.data);
                            }
                        );
                    }
                    return deferred.promise;
                };

                Resource.Fetch = function(name, params, createResource, populate, config) {
                    var i, j, key, url = '/' + name,
                        deferred = $q.defer();
                    if (angular.isArray(params)) {
                        for (i = 0; i < params.length; i++) {
                            if (angular.isArray(params[i])) {
                                for (j = 0; j < params[i].length; j++) {
                                    url += '/' + params[i][j];
                                }
                            } else if (angular.isObject(params[i])) {
                                for (key in params[i]) {
                                    if (params[i].hasOwnProperty(key)) {
                                        url += '/' + key + '/' + params[i][key];
                                    }
                                }
                            } else {
                                url += '/' + params[i];
                            }
                        }
                    } else {
                        url += '/' + params;
                    }
                    _checkCacheEmpty(name);
                    if (!angular.isFunction(createResource)) {
                        createResource = function(data) {
                            return new Resource(data);
                        };
                    }
                    $http.get(url, config).then(
                        function(response) {
                            var i, newResource, result = {};
                            if (angular.isArray(response.data)) {
                                for (i = 0; i < response.data.length; i++) {
                                    newResource = createResource(response.data[i]);
                                    _updateCachePromise(name, newResource, populate);
                                    result[newResource._id] = newResource;
                                }
                            } else {
                                newResource = createResource(response.data);
                                _updateCachePromise(name, newResource, populate);
                                result = newResource;
                            }
                            deferred.resolve(result);
                        },
                        function(err) {
                            deferred.reject(err.data);
                        }
                    );
                    return deferred.promise;
                };

                Resource.FindBy = function(name, property, value, createResource, populate, config) {
                    return Resource.Fetch(name, [property, value], createResource, populate, config);
                };

                Resource.Save = function(name, obj, createResource, populate, config) {
                    var method = 'post', url = '/' + name,
                        deferred = $q.defer();
                    if (angular.isObject(obj)) {
                        if (angular.isString(obj._id)) {
                            method = 'put';
                            url += '/' + obj._id;
                        }
                        if (!angular.isFunction(createResource)) {
                            createResource = function(data) {
                                return new Resource(data);
                            };
                        }
                        obj = obj.$export();
                        $http[method](url, obj, config).then(
                            function(response) {
                                var newResource = createResource(response.data);
                                deferred.resolve(_updateCachePromise(name, newResource, populate));
                            },
                            function(err) {
                                deferred.reject(err.data);
                            }
                        );
                    } else {
                        deferred.reject({message: 'Unable to save empty resource'});
                    }
                    return deferred.promise;
                };

                Resource.Remove = function(name, id, config) {
                    var url = '/' + name + '/' + id,
                        deferred = $q.defer();
                    $http['delete'](url, config).then(
                        function() {
                            deferred.resolve(_deleteCache(name, id));
                        },
                        function(err) {
                            deferred.reject(err.data);
                        }
                    );
                    return deferred.promise;
                };

                Resource.Clear = function() {
                    _cache = {
                        lastFetchAll: {}
                    };
                    _arrays = {};
                };

                Resource.$extend = function(name, child) {
                    var createResource = function(data) {
                        if (angular.isArray(data)) {
                            for (var i = 0; i < data.length; i++) {
                                data[i] = new child(data[i]);
                            }
                        } else {
                            data = new child(data);
                        }
                        return data;
                    };

                    //TODO: createResource used two times, must use just once
                    child.FetchAll = function(populate, config) {
                        return Resource.FetchAll(name.toPascalCase(), createResource, populate, config).then(createResource);
                    };

                    child.FindById = function(id, populate, config) {
                        return Resource.FindById(name.toPascalCase(), id, createResource, populate, config).then(createResource);
                    };

                    child.Fetch = function(params, populate, config) {
                        return Resource.Fetch(name.toPascalCase(), params, createResource, populate, config).then(createResource);
                    };

                    child.FindBy = function(property, value, populate, config) {
                        return Resource.FindBy(name.toPascalCase(), property, value, createResource, populate, config).then(createResource);
                    };

                    child.Save = function(data, populate, config) {
                        return Resource.Save(name.toPascalCase(), data, createResource, populate, config).then(createResource);
                    };

                    child.Remove = function(id, config) {
                        return Resource.Remove(name.toPascalCase(), id, config);
                    };
                };

                return Resource;
            }
        ]);
})();
