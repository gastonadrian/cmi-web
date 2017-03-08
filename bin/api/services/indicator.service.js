"use strict";
var _ = require("lodash");
var moment = require("moment");
var indicator_entity_1 = require("./../data/indicator.entity");
var shared_1 = require("./../models/shared");
var goal_service_1 = require("./goal.service");
var IndicatorService = (function () {
    function IndicatorService() {
    }
    IndicatorService.get = function (customerId, indicatorId) {
        return indicator_entity_1.IndicatorDataService.get(customerId, indicatorId);
    };
    IndicatorService.getAll = function (customerId, active) {
        return indicator_entity_1.IndicatorDataService.getAllByCustomerId(customerId, active);
    };
    IndicatorService.getAllSync = function (customerId) {
        return indicator_entity_1.IndicatorDataService.getAllByCustomerId(customerId, true)
            .then(function onGetAll(indicators) {
            var ids = indicators.map(function mapIndicatorId(ind) {
                return ind._id.toString();
            });
            // obtain all the data-indicator grouped by date
            return indicator_entity_1.IndicatorDataService.getIndicatorsLastSync(ids)
                .then(function (indicatorsData) {
                for (var i = 0; i < indicatorsData.length; i++) {
                    var index = _.findIndex(indicators, function mapId(value) { return value._id.toString() === indicatorsData[i]._id; });
                    indicators[index].lastDateSynced = indicatorsData[i].date;
                }
                return indicators;
            });
        });
    };
    IndicatorService.getGoalIndicators = function (customerId, goalIds) {
        return indicator_entity_1.IndicatorDataService.getGoalIndicators(customerId, goalIds);
    };
    IndicatorService.getIndicatorsByGoalId = function (customerId, goalIds) {
        return indicator_entity_1.IndicatorDataService.getAllByGoalIds(customerId, goalIds);
    };
    /**
     *
     *
     * @param {any} customerId
     * @param {any} goalIds
     * @param {any} from
     * @param {any} to
     * @returns
     */
    IndicatorService.getIndicatorsPerformance = function (customerId, goalIds, from, to) {
        var indicatorIds = [];
        var indicatorsResult = [];
        var self = this;
        return indicator_entity_1.IndicatorDataService.getAllByGoalIds(customerId, goalIds).then(function onGetIndicators(indicators) {
            indicatorIds = indicators.map(function mapIndicatorId(indicator) {
                return indicator._id.toString();
            });
            return indicator_entity_1.IndicatorDataService.getPerformance(indicatorIds, from, to)
                .then(function onPerformance(cachedPerformance) {
                // we reset the goalids, because we want to ask later for those goals
                // that are not cached
                indicatorIds = [];
                for (var i = 0; i < indicators.length; i++) {
                    var performance = _.find(cachedPerformance, _.matchesProperty('indicatorId', indicators[i]._id.toString()));
                    if (performance) {
                        indicatorsResult.push(_.extend(indicators[i], {
                            performance: performance
                        }));
                    }
                    else {
                        indicatorIds.push(indicators[i]._id.toString());
                    }
                }
                if (!indicatorIds.length) {
                    return indicatorsResult;
                }
                return self.calculateSeveralPerformance(customerId, indicatorIds, _.filter(indicators, function (value) { return _.includes(indicatorIds, value._id.toString()); }), from, to)
                    .then(function goalApiResult(response) {
                    return indicatorsResult.concat(response);
                });
            });
        });
    };
    // get indicator data and expectedvalues
    IndicatorService.calculateSeveralPerformance = function (customerId, indicatorIds, indicators, from, to) {
        var result = [], self = this;
        return indicator_entity_1.IndicatorDataService.getIndicatorsDataBetween(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData) {
            //calculate performance for each indicator
            for (var i = 0; i < indicators.length; i++) {
                var performance = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })), from, to);
                indicator_entity_1.IndicatorDataService.insertPerformance(performance);
                result.push(_.extend(indicators[i], {
                    performance: performance,
                }));
            }
            return result;
        });
    };
    IndicatorService.saveIndicator = function (customerId, indicator) {
        indicator.customerId = customerId;
        if (!(indicator.title.length
            && indicator.data && indicator.data.title.length
            && (indicator.performanceComparison === shared_1.PerformanceComparisons.lessThan || indicator.performanceComparison === shared_1.PerformanceComparisons.equals)
            && indicator.datasource && !!indicator.datasource.columnOperation)) {
            ;
            return new Promise(function (resolve, reject) {
                return reject('Faltan datos');
            });
        }
        if (indicator.semaphore) {
            if (indicator.semaphore.redUntil > 1) {
                indicator.semaphore.redUntil = (indicator.semaphore.redUntil / 100) || 0;
            }
            if (indicator.semaphore.yellowUntil > 1) {
                indicator.semaphore.yellowUntil = (indicator.semaphore.yellowUntil / 100) || 0;
            }
        }
        if (indicator._id && indicator._id.length) {
            return this.update(customerId, indicator);
        }
        else {
            return indicator_entity_1.IndicatorDataService.insertIndicator(indicator);
        }
    };
    IndicatorService.assignGoal = function (customerId, goalIndicator) {
        var self = this;
        goalIndicator.customerId = customerId;
        return Promise.all([
            indicator_entity_1.IndicatorDataService.insertGoalIndicator(customerId, goalIndicator),
            indicator_entity_1.IndicatorDataService.get(customerId, goalIndicator.indicatorId)
        ]).then(function onAll(values) {
            var insertGoalIndicatorResult = values[0];
            var indicator = values[1];
            if (!_.includes(indicator.goalIds, goalIndicator.goalId)) {
                if (!indicator.goalIds) {
                    indicator.goalIds = [];
                }
                // add the goal to "goalIds" property
                indicator.goalIds.push(goalIndicator.goalId);
                return self.update(customerId, indicator)
                    .then(function onUpdateResponse(response) {
                    return { ok: response.ok && insertGoalIndicatorResult.ok };
                });
            }
            return insertGoalIndicatorResult;
        });
    };
    IndicatorService.removeGoal = function (customerId, goalId, indicatorId) {
        var self = this;
        return Promise.all([
            indicator_entity_1.IndicatorDataService.removeGoalIndicator(customerId, goalId, indicatorId),
            indicator_entity_1.IndicatorDataService.get(customerId, indicatorId)
        ]).then(function onAll(values) {
            var removeGoalIndicatorResult = values[0];
            var indicator = values[1];
            _.remove(indicator.goalIds, function (id) {
                return id == goalId;
            });
            return self.update(customerId, indicator)
                .then(function onUpdateResponse(response) {
                return { ok: response.ok && removeGoalIndicatorResult.ok };
            });
        });
    };
    IndicatorService.saveIndicatorDataSource = function (customerId, indicator) {
        var self = this;
        return this.get(customerId, indicator._id.toString())
            .then(function onIndicatorGet(oldIndicator) {
            oldIndicator.datasource = indicator.datasource;
            return self.update(customerId, oldIndicator);
        });
    };
    IndicatorService.createIndicatorData = function (customerId, indicatorData) {
        // guardamos el id
        var indicatorId = indicatorData[0].indicatorId;
        //validar array vacio
        if (!indicatorData.length) {
            return new Promise(function (resolve, reject) {
                return resolve({
                    ok: false,
                    why: 'Faltan datos'
                });
            });
        }
        // validar que todos los elementos del array tengan los datos seteados
        for (var i = 0; i < indicatorData.length; i++) {
            indicatorData[i].customerId = customerId;
            indicatorData[i].date = moment(indicatorData[i].date).toDate();
            // validar que todos los datos sean correctos
            if (!(indicatorData[i].indicatorId
                && indicatorData[i].value !== null
                && moment(indicatorData[i].date).isValid())) {
                return new Promise(function (resolve, reject) {
                    return resolve({
                        ok: false,
                        why: 'Faltan datos'
                    });
                });
            }
        }
        var dates = _.flatMap(indicatorData, function (iData) { return iData.date; });
        var datesToAdd = [];
        var datesToUpdate = [];
        return indicator_entity_1.IndicatorDataService.getIndicatorDataDates(customerId, indicatorId, dates)
            .then(function onGetDates(response) {
            for (var i = 0; i < dates.length; i++) {
                var oldIndicator = _.find(response, _.matchesProperty('date', dates[i]));
                var newIndicator = _.find(indicatorData, _.matchesProperty('date', dates[i]));
                if (oldIndicator) {
                    // must UPDATE on the db
                    oldIndicator.value = newIndicator.value;
                    datesToUpdate.push(oldIndicator);
                }
                else {
                    datesToAdd.push(newIndicator);
                }
            }
            var requests = [];
            if (datesToAdd.length) {
                requests.push(indicator_entity_1.IndicatorDataService.insertIndicatorData(datesToAdd));
            }
            for (var j = 0; j < datesToUpdate.length; j++) {
                requests.push(indicator_entity_1.IndicatorDataService.updateIndicatorDataValue(customerId, datesToUpdate[j]));
            }
            return Promise.all(requests)
                .then(function onSaveIndicators(response) {
                return indicator_entity_1.IndicatorDataService.getIndicatorsLastSync([indicatorId])
                    .then(function (indicatorSyncs) {
                    return indicatorSyncs[0];
                });
            });
        });
    };
    IndicatorService.getAllIndicatorData = function (customerId, indicatorId) {
        return indicator_entity_1.IndicatorDataService.getIndicatorsDataBetween(customerId, [indicatorId]);
    };
    IndicatorService.setQuarterExpectation = function (customerId, indicatorId, quarter) {
        var startOfQuarter = moment(quarter.date).startOf('quarter').toDate();
        var endOfQuarter = moment(quarter.date).endOf('quarter').subtract(1, 'second').toDate();
        var self = this;
        return Promise.all([
            indicator_entity_1.IndicatorDataService.get(customerId, indicatorId),
            indicator_entity_1.IndicatorDataService.getIndicatorsDataBetween(customerId, [indicatorId], startOfQuarter, endOfQuarter)
        ]).then(function onResponseAll(values) {
            // detalles del indicador solicitado
            var indicator = values[0];
            var indicatorsData = values[1];
            // first we need to calculate the month value for the indicator
            // si la operacion es promediar =>  el valor es el mismo
            if (indicator.datasource.columnOperation !== shared_1.Operations.average) {
                // cualquier otra operacion => el  valor se divide en la cantidad de meses
                quarter.value = quarter.value / 3;
            }
            // si ya hay datos importados cargados para este periodo
            if (indicatorsData.length) {
                // update indicator data with expectation
                var promiseArray = [];
                for (var i = 0; i < indicatorsData.length; i++) {
                    promiseArray.push(indicator_entity_1.IndicatorDataService.updateIndicatorData(customerId, indicatorId, indicatorsData[i].date, quarter.value));
                }
                return Promise.all(promiseArray)
                    .then(function (values) {
                    var isOk = true;
                    for (var j = 0; j < values.length; j++) {
                        isOk = isOk && values[j].ok;
                    }
                    return { ok: isOk };
                });
            }
            // if there aren't import, create empty imports with expect value set
            var newIndicatorsData = self.createEmptyIndicatorData(customerId, indicatorId, quarter.value, startOfQuarter, endOfQuarter);
            return indicator_entity_1.IndicatorDataService.insertIndicatorData(newIndicatorsData)
                .then(function onInsert(response) {
                return {
                    ok: !!response.insertedIds.length
                };
            });
        });
    };
    IndicatorService.update = function (customerId, indicator) {
        var currentActive = indicator.active, newActive = !!indicator.datasource._id;
        if (currentActive != newActive && newActive) {
            // get goals and update those to active                    
            // we only want the active === false, to update those to active==true
            goal_service_1.GoalService.getByIds(customerId, indicator.goalIds, false)
                .then(function onGetByIds(goals) {
                for (var i = 0; i < goals.length; i++) {
                    goals[i].active = true;
                    goal_service_1.GoalService.update(customerId, goals[i]);
                }
            });
        }
        // is active as long as it has a datasource id assigned
        indicator.active = newActive;
        if (indicator.semaphore) {
            if (indicator.semaphore.redUntil > 1) {
                indicator.semaphore.redUntil = (indicator.semaphore.redUntil / 100) || 0;
            }
            if (indicator.semaphore.yellowUntil > 1) {
                indicator.semaphore.yellowUntil = (indicator.semaphore.yellowUntil / 100) || 0;
            }
        }
        return indicator_entity_1.IndicatorDataService.updateIndicator(indicator);
    };
    IndicatorService.updateIndicatorData = function (customerId, indicatorId, expect) {
        expect.date = moment(expect.date).toDate();
        return indicator_entity_1.IndicatorDataService.updateIndicatorData(customerId, indicatorId, expect.date, expect.value);
    };
    IndicatorService.createEmptyIndicatorData = function (customerId, indicatorId, expected, start, end) {
        var howManyMonths = moment.duration(moment(end).diff(moment(start))).asMonths();
        var result = [];
        for (var i = 0; i < howManyMonths; i++) {
            result.push({
                indicatorId: indicatorId,
                customerId: customerId,
                date: moment(start).add(i, 'month').endOf('month').toDate(),
                value: null,
                expected: expected
            });
        }
        return result;
    };
    /**
     *
     *
     * @param {any} indicator
     * @param {any} indicatorData
     * @param {any} indicatorExpected
     * @returns
     */
    IndicatorService.calculateIndicatorPerformance = function (indicator, months, from, to) {
        var consolidateData = 0;
        var consolidateExpected = 0;
        var oneUnitPercentageValue = 0;
        var result = {
            indicatorId: indicator._id.toString(),
            from: from,
            to: to,
            unitValue: 0,
            progressPerformance: [],
            // if there is no data the default is "red" and "0%" 
            periodPerformance: {
                semaphoreStatus: shared_1.SemaphoreStatus.red,
                value: 0,
                date: to
            }
        };
        if (!months.length) {
            return result;
        }
        consolidateExpected = _.sumBy(months, 'expected');
        if (indicator.datasource.columnOperation === shared_1.Operations.average) {
            consolidateExpected = consolidateExpected / months.length;
        }
        // get the performance progress
        for (var i = 0; i < months.length; i++) {
            var value = void 0;
            consolidateData += months[i].value;
            if (indicator.datasource.columnOperation === shared_1.Operations.average) {
                value = consolidateData / (i + 1);
            }
            else {
                value = consolidateData;
            }
            result.progressPerformance.push(this.getAccumulatedMonthPerformance(indicator, from, months[i].date, value, consolidateExpected));
        }
        if (indicator.datasource.columnOperation === shared_1.Operations.average) {
            result.unitValue = consolidateData / months.length;
        }
        else {
            result.unitValue = consolidateData;
        }
        result.periodPerformance = result.progressPerformance[result.progressPerformance.length - 1];
        return result;
    };
    IndicatorService.getAccumulatedMonthPerformance = function (indicator, from, to, value, expected) {
        var result = {
            semaphoreStatus: shared_1.SemaphoreStatus.red,
            value: 0,
            date: to
        };
        if (indicator.performanceComparison === shared_1.PerformanceComparisons.lessThan) {
            result.value = this.calculateLessThanPercentage(indicator, value, expected);
        }
        else {
            result.value = this.calculateEqualsToPercentage(indicator, value, expected);
        }
        if (result.value > 1) {
            result.value = 1;
        }
        if (result.value < 0) {
            result.value = 0;
        }
        if (result.value > indicator.semaphore.redUntil) {
            // yellow or green
            if (result.value > indicator.semaphore.yellowUntil) {
                result.semaphoreStatus = shared_1.SemaphoreStatus.green;
            }
            else {
                result.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
        }
        else {
            result.semaphoreStatus = shared_1.SemaphoreStatus.red;
        }
        return result;
    };
    /**
     * @name calculatePlusLessThanPerformance
     * @description
     * En esta forma de comparacion todos los valores menores al esperado califican como "verde"
     * La complejidad radica en determinar cuando un valor es amarillo, o rojo
     *
     * Caso de estudio (c.s. desde ahora): El usuario ingreso en los esperados del primer
     * trimestre (ene-febrero-marzo) que los desperdicios deben ser menores a $15000.
     * Esto se divide en tres, y por cada mes el esperado es de $5000.
     *
     * La idea es emparejar el rango de porcentajes fuera de verde (desde 0% al limite superior de amarillo)
     * Para realizarlo, necesitamos saber cual es el porcentaje de "verde" en la torta del semaforo, al dividir
     * el monto esperado sobre el porcentaje del semaforo, sabemos cuantas unidades representan 1%
     *
     * c.s. El semaforo para este indicador es semaphore = { redUntil: 30, yellowUntil: 59 } lo que se traduce como
     * c.s. Rojo: de 0% a 30%, amarillo: de 30% a 59%, Verde: de 59% a 100%.
     * c.s. Por lo que verde representa el 41% de la torta
     * c.s. El esperado mensual es de $5000 por lo que un 1% es igual a $5000 / 41 = 121,95
     *
     *  Una vez obtenido el 1% con ese valor calculamos el porcentaje de los valores y comparamos con el semaforo
     * @param {Object} indicator
     * @param {Array} months
     * @returns
     */
    IndicatorService.calculateLessThanPercentage = function (indicator, value, expected) {
        // case study: monthly expected is less than 10 seconds per support call
        // case study: the semaphore will be yellow until 60%
        // if (expected value) is (100% - yellowUntilPercentage)
        // 10 seconds = 40% (because up to 10 seconds the value is according to the expected)
        // that means that => (100% - yellowUntilPercentage) / expected value  => % for a unit
        // (100% - 60%) / 10s => 1s %
        // 40% / 10 s => 1s %
        // 4%/s => 1 second of call is equal to a 4% decrease of the performance value
        // a call of 4 seconds subtract 16% of performance
        // a call of 10 seconds is 60%
        // one of 11 56%   
        var oneUnitPercentage = (1 - indicator.semaphore.yellowUntil) / expected;
        return 1 - oneUnitPercentage * value;
    };
    IndicatorService.calculateEqualsToPercentage = function (indicator, value, expected) {
        var oneUnitPercentage = 1 / expected;
        return oneUnitPercentage * value;
    };
    return IndicatorService;
}());
exports.IndicatorService = IndicatorService;
//# sourceMappingURL=indicator.service.js.map