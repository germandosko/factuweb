(function() {

    'use strict';

    angular.module('services.population-engine', []).factory('PopulationEngine', ['$q',
        function($q) {
            return function(obj, resourceMap) {
                return new PopulationEngine(obj, resourceMap, { $q: $q });
            }
        }
    ]);

    function PopulationEngine(obj, resourceMap, inject) {
        this._populationResources = resourceMap;

        this._i_ = inject;
        this._obj = obj;

        obj.populate = this.populate.bind(this);
        obj.$export = this.revertPopulation.bind(this);
    }

    PopulationEngine.prototype.populate = function() {
        var that = this;

        that._populateAll().then(null, function(err) {
            setTimeout(function() {
                throw err;
            }, 0);
        });

        return that._obj;
    };

    PopulationEngine.prototype.revertPopulation = function() {
        var newObj, that;

        that = this;
        newObj = _.clone(that._obj);

        _.each(that._populationResources, function(Resource, name) {
            that._exportField(name, newObj);
        });

        delete newObj['populated'];

        return newObj;
    };

    PopulationEngine.prototype._populateArrayField = function(name, Resource) {
        var $q, that, itemId, totalItems, itemIndex, propValue, promises, obj;

        that = this;
        obj = that._obj;
        $q = that._i_.$q;

        promises = [];

        propValue = obj[name];

        for (itemIndex = 0, totalItems = propValue.length; itemIndex < totalItems; itemIndex++) {
            itemId = propValue[itemIndex];

            promises.push(Resource.FindById(itemId));
        }

        return $q.all(promises).then(function(items) {
            obj[name].length = 0;

            _.each(items, function(item) {
                if (item) {
                    obj[name].push(item);
                }
            });
        });
    };

    PopulationEngine.prototype._populatePlainField = function(name, Resource) {
        var that, obj;
        that = this;
        obj = that._obj;
        return Resource.FindById(obj[name], true).then(function(item) {
            obj[name] = item;
        });
    };

    PopulationEngine.prototype._populateField = function(name, Resource) {
        var $q, that, promise, obj;

        that = this;
        obj = that._obj;
        $q = that._i_.$q;

        promise = $q.when(true);

        if (angular.isArray(obj[name])) {

            promise = that._populateArrayField(name, Resource);
        } else if (obj[name] !== null && !angular.isUndefined(obj[name])) {

            promise = that._populatePlainField(name, Resource);
        }

        return promise;
    };

    PopulationEngine.prototype._populated = function(statusOrName) {
        var that, result, obj;

        that = this;
        obj = that._obj;

        if (angular.isString(statusOrName)) {
            result = obj.populated;
        } else {
            obj.populated = !!statusOrName;
        }

        return result;
    };

    PopulationEngine.prototype.setPopulated = function(status) {
        return this._populated(status);
    };

    PopulationEngine.prototype._populateAll = function() {
        var that, promises, $q;

        that = this;
        $q = that._i_.$q;

        if (!that._populated(name)) {

            promises = _.map(that._populationResources, function(Resource, name) {
                return that._populateField(name, Resource);
            });

            that._populated(true);

            return $q.all(promises).then(null, function() {
                that._populated(false);
            });
        } else {
            return $q.when(true);
        }
    };

    PopulationEngine.prototype._exportField = function(name, obj) {
        var that;

        that = this;

        if (that._populated(name)) {
            if (angular.isArray(obj[name])) {

                that._exportArrayField(name, obj);
            } else if (obj[name] !== null && !angular.isUndefined(obj[name])) {

                that._exportPlainField(name, obj);
            }
        }
    };

    PopulationEngine.prototype._exportArrayField = function(name, obj) {
        var result;

        result = [];

        _.each(obj[name], function(item) {
            return result.push(item._id);
        });

        obj[name] = result;
    };

    PopulationEngine.prototype._exportPlainField = function(name, obj) {
        obj[name] = obj[name]._id;
    };

})();