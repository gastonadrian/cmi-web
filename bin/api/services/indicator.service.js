"use strict";
var _ = require("lodash");
var moment = require("moment");
var indicator_entity_1 = require("./../data/indicator.entity");
var shared_1 = require("./../models/shared");
var indicator_data_1 = require("./../models/mongo/indicator-data");
var IndicatorService = (function () {
    function IndicatorService() {
    }
    IndicatorService.get = function (customerId, indicatorId) {
        return indicator_entity_1.IndicatorDataService.get(customerId, indicatorId);
    };
    IndicatorService.getAll = function (customerId) {
        return indicator_entity_1.IndicatorDataService.getAllByCustomerId(customerId);
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
        // is active as long as it has a datasource id assigned
        indicator.active = !!indicator.datasource._id;
        if (indicator._id && indicator._id.length) {
            return indicator_entity_1.IndicatorDataService.updateIndicator(indicator);
        }
        else {
            return indicator_entity_1.IndicatorDataService.insertIndicator(indicator);
        }
    };
    IndicatorService.assignGoal = function (customerId, goalIndicator) {
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
                return indicator_entity_1.IndicatorDataService.updateIndicator(indicator)
                    .then(function onUpdateResponse(response) {
                    return { ok: response.ok && insertGoalIndicatorResult.ok };
                });
            }
            return insertGoalIndicatorResult;
        });
    };
    IndicatorService.removeGoal = function (customerId, goalId, indicatorId) {
        return Promise.all([
            indicator_entity_1.IndicatorDataService.removeGoalIndicator(customerId, goalId, indicatorId),
            indicator_entity_1.IndicatorDataService.get(customerId, indicatorId)
        ]).then(function onAll(values) {
            var removeGoalIndicatorResult = values[0];
            var indicator = values[1];
            _.remove(indicator.goalIds, function (id) {
                return id == goalId;
            });
            return indicator_entity_1.IndicatorDataService.updateIndicator(indicator)
                .then(function onUpdateResponse(response) {
                return { ok: response.ok && removeGoalIndicatorResult.ok };
            });
        });
    };
    IndicatorService.saveIndicatorDataSource = function (customerId, indicator) {
        return this.get(customerId, indicator._id.toString())
            .then(function onIndicatorGet(oldIndicator) {
            oldIndicator.datasource = indicator.datasource;
            return indicator_entity_1.IndicatorDataService.updateIndicator(oldIndicator);
        });
    };
    IndicatorService.update = function (indicator) {
        return indicator_entity_1.IndicatorDataService.updateIndicator(indicator);
    };
    IndicatorService.createIndicatorData = function (customerId, indicatorData) {
        indicatorData.customerId = customerId;
        if (!(indicatorData.indicatorId
            && indicatorData.value
            && moment(indicatorData.date).isValid())) {
            return new Promise(function (resolve, reject) {
                return reject('Faltan datos');
            });
        }
        return indicator_entity_1.IndicatorDataService.insertIndicatorData([indicatorData]);
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
                    promiseArray.push(indicator_entity_1.IndicatorDataService.updateIndicatorData(customerId, indicatorId, quarter.value));
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
    IndicatorService.createEmptyIndicatorData = function (customerId, indicatorId, expected, start, end) {
        var howManyMonths = moment.duration(moment(end).diff(moment(start))).asMonths();
        var result = [];
        for (var i = 0; i < howManyMonths; i++) {
            result.push(new indicator_data_1.MongoIndicatorData(indicatorId, customerId, moment(start).add(i, 'month').endOf('month').toDate(), null, expected));
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
        if (indicator.performanceComparison === shared_1.PerformanceComparisons.lessThan
            && (indicator.datasource.columnOperation === shared_1.Operations.plus || indicator.datasource.columnOperation === shared_1.Operations.average)) {
            result = this.calculateLessThanPerformance(indicator, indicatorData);
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
    return IndicatorService;
}());
exports.IndicatorService = IndicatorService;
//# sourceMappingURL=indicator.service.js.map