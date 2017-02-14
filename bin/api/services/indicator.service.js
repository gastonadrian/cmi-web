"use strict";
var _ = require("lodash");
var indicator_entity_1 = require("./../data/indicator.entity");
var shared_1 = require("./../models/shared");
var indicator_1 = require("./../models/api/indicator");
var IndicatorService = (function () {
    function IndicatorService() {
    }
    IndicatorService.getGoalIndicators = function (customerId, goalIds) {
        return indicator_entity_1.IndicatorDataService.getGoalIndicators(customerId, goalIds);
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
        return indicator_entity_1.IndicatorDataService.getIndicators(customerId, goalIds).then(function onGetIndicators(indicators) {
            indicatorIds = indicators.map(function mapIndicatorId(indicator) {
                return indicator._id.toString();
            });
            // get indicator data and expectedvalues
            return indicator_entity_1.IndicatorDataService.getIndicatorsData(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData) {
                //calculate performance for each indicator
                for (var i = 0; i < indicators.length; i++) {
                    var performance = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })));
                    indicatorsResult.push(new indicator_1.IndicatorApiResult(indicators[i]._id.toString(), indicators[i].customerId, indicators[i].goalIds, indicators[i].title, performance));
                }
                return indicatorsResult;
            });
        });
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
        if (indicator.performanceComparison === 'lessThan'
            && (indicator.data.operation === shared_1.Operations.plus || indicator.data.operation === shared_1.Operations.average)) {
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
        // get the consolidates
        for (var i = 0; i < months.length; i++) {
            consolidateData += months[i].value;
            consolidateExpected += months[i].expected;
        }
        if (indicator.data.operation === shared_1.Operations.average) {
            consolidateData = consolidateData / months.length;
            consolidateExpected = consolidateExpected / months.length;
        }
        onePercentValue = consolidateExpected / (100 - indicator.semaphore.yellowUntil * 100);
        // calculate percent
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