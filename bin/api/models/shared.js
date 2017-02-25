"use strict";
;
;
var Operations;
(function (Operations) {
    Operations[Operations["average"] = 1] = "average";
    Operations[Operations["plus"] = 2] = "plus";
    Operations[Operations["count"] = 3] = "count";
    Operations[Operations["countdistinct"] = 4] = "countdistinct";
    Operations[Operations["query"] = 5] = "query";
})(Operations = exports.Operations || (exports.Operations = {}));
;
var SemaphoreStatus;
(function (SemaphoreStatus) {
    SemaphoreStatus[SemaphoreStatus["green"] = 1] = "green";
    SemaphoreStatus[SemaphoreStatus["yellow"] = 2] = "yellow";
    SemaphoreStatus[SemaphoreStatus["red"] = 3] = "red";
})(SemaphoreStatus = exports.SemaphoreStatus || (exports.SemaphoreStatus = {}));
;
var UserDataTypes;
(function (UserDataTypes) {
    UserDataTypes[UserDataTypes["number"] = 1] = "number";
    UserDataTypes[UserDataTypes["currency"] = 2] = "currency";
    UserDataTypes[UserDataTypes["percentage"] = 3] = "percentage";
    UserDataTypes[UserDataTypes["days"] = 4] = "days";
    UserDataTypes[UserDataTypes["hours"] = 5] = "hours";
    UserDataTypes[UserDataTypes["minutes"] = 6] = "minutes";
    UserDataTypes[UserDataTypes["seconds"] = 7] = "seconds";
})(UserDataTypes = exports.UserDataTypes || (exports.UserDataTypes = {}));
var SystemDataTypes;
(function (SystemDataTypes) {
    SystemDataTypes[SystemDataTypes["number"] = 1] = "number";
    SystemDataTypes[SystemDataTypes["date"] = 2] = "date";
})(SystemDataTypes = exports.SystemDataTypes || (exports.SystemDataTypes = {}));
var PerformanceComparisons;
(function (PerformanceComparisons) {
    PerformanceComparisons[PerformanceComparisons["lessThan"] = 1] = "lessThan";
    PerformanceComparisons[PerformanceComparisons["equals"] = 2] = "equals";
})(PerformanceComparisons = exports.PerformanceComparisons || (exports.PerformanceComparisons = {}));
var BackendAppSettings = (function () {
    function BackendAppSettings() {
    }
    BackendAppSettings.getDataDefinition = function (dataType) {
        var index = dataType - 1;
        return this.dataTypes[index];
    };
    return BackendAppSettings;
}());
BackendAppSettings.dataTypes = [
    {
        title: 'unidades',
        type: SystemDataTypes.number
    },
    {
        title: '$',
        type: SystemDataTypes.number
    },
    {
        title: '%',
        type: SystemDataTypes.number
    },
    {
        title: 'dias',
        type: SystemDataTypes.date
    },
    {
        title: 'horas',
        type: SystemDataTypes.date
    },
    {
        title: 'minutos',
        type: SystemDataTypes.date
    },
    {
        title: 'segundos',
        type: SystemDataTypes.date
    }
];
BackendAppSettings.columnOperations = [
    {
        title: 'sumar',
        id: Operations.plus
    },
    {
        title: 'promediar',
        id: Operations.average
    },
    {
        title: 'contar',
        id: Operations.count
    },
    {
        title: 'contar valores distintos',
        id: Operations.countdistinct
    },
    {
        title: 'consulta(query) personalizada [avanzado]',
        id: Operations.query
    }
];
exports.BackendAppSettings = BackendAppSettings;
//# sourceMappingURL=shared.js.map