
export class Performance{
    constructor(public dateFrom:number, public value:number, public semaphoreStatus:number, public dateTo?:number){
        // this.value = this.value * 100;
    }
}

export class DateValue{
    constructor(public date:Date, public value:number, public expected?:number){}
}

export class DataPeriod{
    constructor(public id:string, public legend:string, public start:Date, public end:Date){
    }
}

declare let dataPeriods:any;
declare let admin:any;

export class AppSettings{
    
    public static dateFormat:string = 'YYYYMMDD';
    public static admin: any = admin;
    public static dataPeriods:Array<any> = dataPeriods;

    public static semaphoreStatusText:Array<string> = ['','green','yellow','red'];

    public static DataTableLangConfig:any ={
        "sProcessing":     "Procesando...",
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sZeroRecords":    "No se encontraron resultados",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
        "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
        "sInfoPostFix":    "",
        "sSearch":         "Buscar:",
        "sUrl":            "",
        "sInfoThousands":  ",",
        "sLoadingRecords": "Cargando...",
        "oPaginate": {
            "sFirst":    "Primero",
            "sLast":     "Último",
            "sNext":     "Siguiente",
            "sPrevious": "Anterior"
        },
        "oAria": {
            "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
        }
    };

    public static DataTableConfig:any = {
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "language": AppSettings.DataTableLangConfig
      };
}