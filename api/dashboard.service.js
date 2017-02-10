function dashboardService(options){

    var utils = require('./utils')();

    this.add('role:dashboard,cmd:index', getDashboard);

    this.add('role:dashboard,cmd:another', function product(msg, respond) {
        respond(null, { answer: msg.left * msg.right });
    });
    
    this.wrap('role:dashboard', function (msg, respond) {
        // console.log('entered the wrapper');
        this.prior(msg, respond);
    });

    function getDashboard(msg, respond){
        var period = utils.getPeriodFromParams(msg.args.params);
        // desired result
        var result = {
            dataPeriod: period.legend,
            filterDateFrom: period.from,
            filterDateTo: period.to,
            data: [
                {
                    id: 1,
                    title: 'Perspectiva Financiera',
                    performance:{
                        dateFrom: period.from,
                        dateTo: period.to,
                        semaphoreStatus: 'green',
                        value: 0.80                    
                    },
                    goals:[
                        {
                            id: 1,
                            title: 'Crecimiento de ingresos y carteras de clientes',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 1
                            }
                        },
                        {
                            id: 1,
                            title: 'Utilizaci&oacute;n de inversiones y activos',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 1
                            }
                        },
                        {
                            id: 1,
                            title: 'Reducci&oacute;n de costes y mejora de la productividad',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.88
                            }
                        },
                        {
                            id: 1,
                            title: 'Crear valor para el accionista',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.81
                            }
                        },
                        {
                            id: 1,
                            title: 'Reducir la morosidad',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'red',
                                value: 0.32
                            } 
                        }                
                    ]
                },
                {
                    id: 2,
                    title: 'Perspectiva Clientes',
                    performance:{
                        dateFrom: period.from,
                        dateTo: period.to,
                        semaphoreStatus: 'yellow',
                        value: 0.45                    
                    },
                    goals:[
                        {
                            id: 1,
                            title: 'Cuota de mercado',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 1
                            }
                        },
                        {
                            id: 1,
                            title: 'Retenci&oacute;n y fidelizaci&oacute;n de clientes',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.9
                            }
                        },
                        {
                            id: 1,
                            title: 'Adquisici&oacute;n de nuevos clientes',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.87
                            }
                        },
                        {
                            id: 1,
                            title: 'Satisfacci&oacute;n del cliente',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'red',
                                value: 0.25
                            }
                        },
                        {
                            id: 1,
                            title: 'Rentabilidad',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'yellow',
                                value: 0.55
                            }
                        }                                
                    ]
                },
                {
                    id: 3,
                    title: 'Perspectiva de Aprendizaje',
                    performance:{
                        dateFrom: period.from,
                        dateTo: period.to,
                        semaphoreStatus: 'yellow',
                        value: 0.65                    
                    },
                    goals:[
                        {
                            id: 1,
                            title: 'Capacidad del personal',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 1
                            }
                        },
                        {
                            id: 1,
                            title: 'Utilizaci&oacute;n de inversiones y activos',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.75
                            }
                        },
                        {
                            id: 1,
                            title: 'Motivaci&oacute;n y alineamiento',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.84
                            }
                        },
                        {
                            id: 1,
                            title: 'Reducir bajas laborales',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'red',
                                value: 0.35
                            }
                        },
                        {
                            id: 1,
                            title: 'Mejorar la formaci&oacute;n',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'yellow',
                                value: 0.42
                            }
                        }                                
                    ]
                },
                {
                    id: 4,
                    title: 'Perspectiva de Procesos',
                    performance:{
                        dateFrom: period.from,
                        dateTo: period.to,
                        semaphoreStatus: 'yellow',
                        value: 0.58                    
                    },
                    goals:[
                        {
                            id: 1,
                            title: 'Proceso de operaciones',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 1
                            }
                        },
                        {
                            id: 1,
                            title: 'Proceso de servicio postventa',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.83
                            }
                        },
                        {
                            id: 1,
                            title: 'Mejorar relaci&oacute;n con distribuidor',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'green',
                                value: 0.2
                            }
                        },
                        {
                            id: 1,
                            title: 'Gestionar recursos internos',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'red',
                                value: 0.35
                            }
                        },
                        {
                            id: 1,
                            title: 'Renovaci&oacute;n de maquinaria',
                            indicators: [],
                            performance:{
                                dateFrom: period.from,
                                dateTo: period.to,
                                semaphoreStatus: 'yellow',
                                value: 0.55
                            }
                        }                                
                    ]
                }                
            ]
        };

        respond(null, result);
    }
}

module.exports = dashboardService;