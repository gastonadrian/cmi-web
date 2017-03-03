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
            // get indicator data and expectedvalues
            return indicator_entity_1.IndicatorDataService.getIndicatorsData(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData) {
                //calculate performance for each indicator
                for (var i = 0; i < indicators.length; i++) {
                    var performance = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })));
                    indicatorsResult.push(_.extend(indicators[i], { performance: performance, id: indicators[i]._id.toString() }));
                }
                return indicatorsResult;
            });
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
                && indicatorData[i].value
                && moment(indicatorData[i].date).isValid())) {
                return new Promise(function (resolve, reject) {
                    return resolve({
                        ok: false,
                        why: 'Faltan datos'
                    });
                });
            }
        }
        return indicator_entity_1.IndicatorDataService.insertIndicatorData(indicatorData)
            .then(function onSaveIndicators(response) {
            return indicator_entity_1.IndicatorDataService.getIndicatorsLastSync([indicatorId])
                .then(function (indicatorSyncs) {
                return indicatorSyncs[0];
            });
        });
    };
    IndicatorService.getAllIndicatorData = function (customerId, indicatorId) {
        return indicator_entity_1.IndicatorDataService.getIndicatorsData(customerId, [indicatorId]);
    };
    IndicatorService.setQuarterExpectation = function (customerId, indicatorId, quarter) {
        var startOfQuarter = moment(quarter.date).startOf('quarter').toDate();
        var endOfQuarter = moment(quarter.date).endOf('quarter').subtract(1, 'second').toDate();
        var self = this;
        return Promise.all([
            indicator_entity_1.IndicatorDataService.get(customerId, indicatorId),
            indicator_entity_1.IndicatorDataService.getIndicatorsData(customerId, [indicatorId], startOfQuarter, endOfQuarter)
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
    IndicatorService.calculateIndicatorPerformance = function (indicator, indicatorData) {
        var result;
        if (indicator.performanceComparison === shared_1.PerformanceComparisons.lessThan) {
            result = this.calculateLessThanPerformance(indicator, indicatorData);
        }
        else {
            result = this.calculateEqualsToPerformance(indicator, indicatorData);
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
    IndicatorService.calculateLessThanPerformance = function (indicator, months) {
        var consolidateData = 0;
        var consolidateExpected = 0;
        var onePercentValue = 0;
        var performanceResult = {
            semaphoreStatus: shared_1.SemaphoreStatus.green,
            value: 0
        };
        if (!months.length) {
            performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.red;
            performanceResult.value = 0;
            return performanceResult;
        }
        // get the consolidates
        for (var i = 0; i < months.length; i++) {
            consolidateData += months[i].value;
            consolidateExpected += months[i].expected;
        }
        if (indicator.datasource.columnOperation === shared_1.Operations.average) {
            consolidateData = consolidateData / months.length;
            consolidateExpected = consolidateExpected / months.length;
        }
        onePercentValue = consolidateExpected / (100 - indicator.semaphore.yellowUntil * 100);
        performanceResult.value = 1 - (consolidateData / onePercentValue) / 100;
        if (performanceResult.value < 0) {
            performanceResult.value = 0;
        }
        if (consolidateData >= consolidateExpected) {
            // red or yellow
            if (performanceResult.value > indicator.semaphore.redUntil) {
                performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
            else {
                performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.red;
            }
        }
        return performanceResult;
    };
    IndicatorService.calculateEqualsToPerformance = function (indicator, months) {
        var consolidateData = 0;
        var consolidateExpected = 0;
        var onePercentValue = 0;
        var performanceResult = {
            semaphoreStatus: shared_1.SemaphoreStatus.green,
            value: 0
        };
        if (!months.length) {
            performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.red;
            performanceResult.value = 0;
            return performanceResult;
        }
        // get the consolidates
        for (var i = 0; i < months.length; i++) {
            consolidateData += months[i].value;
            consolidateExpected += months[i].expected;
        }
        if (indicator.datasource.columnOperation === shared_1.Operations.average) {
            consolidateData = consolidateData / months.length;
            consolidateExpected = consolidateExpected / months.length;
        }
        performanceResult.value = (consolidateData / consolidateExpected);
        if (performanceResult.value > 1) {
            performanceResult.value = 1;
        }
        if (performanceResult.value < 0) {
            performanceResult.value = 0;
        }
        if (consolidateData >= consolidateExpected) {
            // red or yellow
            if (performanceResult.value > indicator.semaphore.redUntil) {
                performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
            else {
                performanceResult.semaphoreStatus = shared_1.SemaphoreStatus.red;
            }
        }
        return performanceResult;
    };
    return IndicatorService;
}());
exports.IndicatorService = IndicatorService;
//# sourceMappingURL=indicator.service.js.map