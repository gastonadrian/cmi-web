;
;
export var Operations;
(function (Operations) {
    Operations[Operations["average"] = 1] = "average";
    Operations[Operations["plus"] = 2] = "plus";
})(Operations || (Operations = {}));
;
export var SemaphoreStatus;
(function (SemaphoreStatus) {
    SemaphoreStatus[SemaphoreStatus["green"] = 1] = "green";
    SemaphoreStatus[SemaphoreStatus["yellow"] = 2] = "yellow";
    SemaphoreStatus[SemaphoreStatus["red"] = 3] = "red";
})(SemaphoreStatus || (SemaphoreStatus = {}));
;
export var UserDataTypes;
(function (UserDataTypes) {
    UserDataTypes[UserDataTypes["number"] = 1] = "number";
    UserDataTypes[UserDataTypes["currency"] = 2] = "currency";
    UserDataTypes[UserDataTypes["percentage"] = 3] = "percentage";
    UserDataTypes[UserDataTypes["days"] = 4] = "days";
    UserDataTypes[UserDataTypes["hours"] = 5] = "hours";
    UserDataTypes[UserDataTypes["minutes"] = 6] = "minutes";
    UserDataTypes[UserDataTypes["seconds"] = 7] = "seconds";
})(UserDataTypes || (UserDataTypes = {}));
export var SystemDataTypes;
(function (SystemDataTypes) {
    SystemDataTypes[SystemDataTypes["number"] = 1] = "number";
    SystemDataTypes[SystemDataTypes["date"] = 2] = "date";
})(SystemDataTypes || (SystemDataTypes = {}));
export var PerformanceComparisons;
(function (PerformanceComparisons) {
    PerformanceComparisons[PerformanceComparisons["lessThan"] = 1] = "lessThan";
    PerformanceComparisons[PerformanceComparisons["equals"] = 2] = "equals";
})(PerformanceComparisons || (PerformanceComparisons = {}));
export var BackendAppSettings = (function () {
    function BackendAppSettings() {
    }
    BackendAppSettings.getDataDefinition = function (dataType) {
        var index = dataType - 1;
        return this.dataTypes[index];
    };
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
    return BackendAppSettings;
}());
//# sourceMappingURL=shared.js.map