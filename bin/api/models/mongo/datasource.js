"use strict";
var MongoDatasource = (function () {
    function MongoDatasource(customerId, type, title, tables, database, file) {
        this.customerId = customerId;
        this.type = type;
        this.title = title;
        this.tables = tables;
        this.database = database;
        this.file = file;
    }
    ;
    return MongoDatasource;
}());
exports.MongoDatasource = MongoDatasource;
;
var DatasourceType;
(function (DatasourceType) {
    DatasourceType[DatasourceType["database"] = 1] = "database";
    DatasourceType[DatasourceType["file"] = 2] = "file";
})(DatasourceType = exports.DatasourceType || (exports.DatasourceType = {}));
;
;
;
//# sourceMappingURL=datasource.js.map