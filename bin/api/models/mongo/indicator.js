"use strict";
var MongoIndicator = (function () {
    function MongoIndicator(_id, customerId, goalIds, title, performanceComparison, dataType, dataOperation, dataTitle, semaphoreRedUntil, semaphoreYellowuntil, dataSourceId, datasourceTable, dataSourceColumn, dataSourceDateColumn, dataSourceRowOperation) {
        this._id = _id;
        this.customerId = customerId;
        this.goalIds = goalIds;
        this.title = title;
        this.performanceComparison = performanceComparison;
        this.dataType = dataType;
        this.dataOperation = dataOperation;
        this.dataTitle = dataTitle;
        this.semaphoreRedUntil = semaphoreRedUntil;
        this.semaphoreYellowuntil = semaphoreYellowuntil;
        this.dataSourceId = dataSourceId;
        this.datasourceTable = datasourceTable;
        this.dataSourceColumn = dataSourceColumn;
        this.dataSourceDateColumn = dataSourceDateColumn;
        this.dataSourceRowOperation = dataSourceRowOperation;
        this.semaphore = {
            redUntil: semaphoreRedUntil,
            yellowUntil: semaphoreYellowuntil
        };
        this.data = {
            type: dataType,
            operation: dataOperation,
            title: dataTitle
        };
        this.datasource = {
            _id: dataSourceId,
            table: datasourceTable,
            column: dataSourceColumn,
            dateColumn: dataSourceDateColumn,
            rowOperation: dataSourceRowOperation
        };
    }
    return MongoIndicator;
}());
exports.MongoIndicator = MongoIndicator;
;
//# sourceMappingURL=indicator.js.map