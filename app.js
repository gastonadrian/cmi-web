var express = require('express'),
  seneca = require('seneca'),
  senecaWeb = require('seneca-web'),
  router = express.Router,
  context = new router(),
  app = express(),
  seneca = seneca(),
  utils = require('./api/utils')(),
  moment = require('moment'),
  senecaWebConfig = {
    context: context,
    adapter: require('seneca-web-adapter-express'),
    // so we can use body-parser
    options: { parseBody: false } 
  };

  // specify the views directory
  app.set('view engine', 'pug');
  app.set('views', './client/app');
  app.use(express.static('./client/dist'));
  app.use(express.static('./client/bower_components'));
  app.use(express.static('./client/node_modules'));

  app.use( require('body-parser').json() )
    .use( context )
    .listen(3000);

  seneca
    .use( senecaWeb, senecaWebConfig )
    .use( 'entity' )
    .use( './api/index' )
    .use( './api/dashboard.service' )
    .use( './api/goal.service' )
    .client( { type:'tcp',  pin:'role:api' } );

  function getGoals(){
    var goals = [
      {
        id:1,
        label:'Proceso de operaciones',
        perspective:3
      },
      {
        id:2,
        label:'Proceso de servicio postventa',
        perspective:3
      },
      {
        id: 3,
        label: 'Mejorar relaci&oacute;n con distribuidor',
        perspective:3
      },
      {
        id: 4,
        label: 'Gestionar recursos internos',
        perspective:3
      },
      {
        id: 5,
        label: 'Renovaci&oacute;n de maquinaria',
        perspective:3
      },
      {
        id: 6,
        label: 'Cuota de mercado',
        perspective:2
      },
      {
        id: 7,
        label: 'Retenci&oacute;n y fidelizaci&oacute;n de clientes',
        perspective:2
      },
      {
        id: 8,
        label: 'Adquisici&oacute;n de nuevos clientes',
        perspective:2
      },
      {
        id: 9,
        label: 'Satisfacci&oacute;n del cliente',
        perspective:2
      },
      {
        id: 10,
        label: 'Rentabilidad',
        perspective:2
      },
      {
        id: 11,
        label: 'Capacidad del personal',
        perspective:2
      },
      {
        id: 12,
        label: 'Cualificaci&oacute;n de los trabajadores',
        perspective:2
      },
      {
        id: 13,
        label: 'Motivaci&oacute;n y alineamiento',
        perspective:2
      },
      {
        id: 14,
        label: 'Reducir bajas laborales',
        perspective:2
      },
      {
        id: 15,
        label: 'Mejorar la formaci&oacute;n',
        perspective:2
      },
      {
        id: 16,
        label: 'Crecimiento de ingresos y carteras de clientes',
        perspective:1
      },
      {
        id: 17,
        label: 'Utilizaci&oacute;n de inversiones y activos',
        perspective:1
      },
      {
        id: 18,
        label: 'Reducci&oacute;n de costes y mejora de la productividad',
        perspective:1
      },
      {
        id: 19,
        label: 'Crear valor para el accionista',
        perspective:1
      },
      {
        id: 20,
        label: 'Reducir la morosidad',
        perspective:1
      }
    ];
    return goals;
  }

  function getPerspectives(){

    var perspectives = [
      {
        id: 1,
        label: 'Perspectiva Financiera'
      },
      {
        id: 2,
        label: 'Perspectiva Clientes'
      },
      {
        id: 3,
        label: 'Perspectiva de Procesos'
      },      {
        id: 4,
        label: 'Perspectiva de Aprendizaje'
      },
    ];
    return perspectives;
  }

  // TODO: RENAME performancePercentage to performance
  function getIndicators(){
    var kpis = [
        {
            id: 1,
            label: '% Productos defectuosos',
            goals:[1],
            unit:{
                type: 'percentage',
                title: '%'
            },
            performanceComparison: 'lessThan',
            datasource:{
                id: 1,
                table:'Productos',
                column: '% defectos',
                tableOperation: 'average',
                rowOperation:'',
            }
        },
      {
          id: 2,
          label: 'N&uacute;mero de reclamaciones de clientes',
          performancePercentage: 133,
          goals:[1]
      },
      {
          id: 3,
          label: 'Devoluciones de clientes',
          performancePercentage: 500,
          goals:[1]
      },
      {
          id: 4,
          label: 'Costo de la actividad de inspecci&oaucte;n',
          performancePercentage: 100,
          goals:[1]
      },
      {
          id: 5,
          label: 'An&aacute;lisis de tiempos de espera',
          performancePercentage: 40,
          goals:[1]
      },
      {
          id: 6,
          label: 'An&aacute;lisis de tiempos de colas',
          performancePercentage: 100,
          goals:[1]
      },
      {
          id: 7,
          label: 'An&aacute;lisis de tiempos de inactividad',
          performancePercentage: 80,
          goals:[1]
      },
      {
          id: 8,
          label: 'Costo de las reparaciones',
          performancePercentage: 100,
          goals:[2]
      },    
      {
          id: 9,
          label: 'Tiempos de respuesta',
          performancePercentage: 50,
          goals:[2]
      },    
      {
          id: 10,
          label: 'Tiempos de servicios de asistencia t&eacute;cnica',
          performancePercentage: 100,
          goals:[2]
      },    
      {
          id: 11,
          label: 'Encuesta satisfacc&oacute;n distribuidor',
          performancePercentage: 20,
          goals:[3]
      },
      {
          id: 12,
          label: 'N&uacute;mero de subcontrataciones externas',
          performancePercentage: 35,
          goals:[4]
      },
      {
          id: 13,
          label: 'N&uacute;mero de años medio de maquinarias',
          performancePercentage: 55,
          goals:[5]
      },   
      {
          id: 14,
          label: '% Crecimiento de la cuota de mercado',
          performancePercentage: 500,
          goals:[6,8,16]
      },    
      {
          id: 15,
          label: '% Ingresos nuevos clientes',
          performancePercentage: 400,
          goals:[6,16]
      },    
      {
          id: 16,
          label: '% Ingresos nuevas zonas geogr&aacute;ficas',
          performancePercentage: 80,
          goals:[6,16]
      },    
      {
          id: 17,
          label: '% Ingresos nuevos segmentos de mercado',
          performancePercentage: 200,
          goals:[6]
      },    
      {
          id: 18,
          label: '% Crecimiento negocio cliente actual',
          performancePercentage: 200,
          goals:[7]
      },    
      {
          id: 19,
          label: '&Iacute;ndice repetici&oacute;n de compras',
          performancePercentage: 100,
          goals:[7]
      },    
      {
          id: 20,
          label: 'Tiempo medio de repetici&oacute;n del cliente',
          performancePercentage: 200,
          goals:[7]
      },
      {
          id: 21,
          label: '% descuentos presentados',
          performancePercentage: 20,
          goals:[9]
      },
      {
          id: 22,
          label: '% quejas presentadas',
          performancePercentage: 1,
          goals:[9]
      },
      {
          id: 23,
          label: 'Nivel de garant&iacute;a del servicio',
          performancePercentage: 14,
          goals:[9]
      },
      {
          id: 24,
          label: 'Benchmarking estrat&eacute;gico de precios',
          performancePercentage: 29,
          goals:[9]
      },
      {
          id: 25,
          label: '% incidencias, defectos, errores',
          performancePercentage: 7,
          goals:[9]
      },
      {
          id: 26,
          label: '% nivel de respuesta de quejas',
          performancePercentage: 5,
          goals:[9]
      },
      {
          id: 27,
          label: 'N&uacute;mero de llamadas entrantes',
          performancePercentage: 8,
          goals:[9]
      },
      {
          id: 28,
          label: '% Ingresos por pedidos',
          performancePercentage: 70,
          goals:[10]
      },
      {
          id: 29,
          label: 'Desviaci&oacute;n en precios',
          performancePercentage: 40,
          goals:[10]
      },
      {
          id: 30,
          label: 'An&aacute;lisis de margenes brutos',
          performancePercentage: 70,
          goals:[10]
      },
      {
          id: 31,
          label: 'C&aacute;lculo neto de perdidas y ganancias',
          performancePercentage: 40,
          goals:[10]
      },
      {
          id: 32,
          label: 'Rentabilidad por cliente',
          performancePercentage: 55,
          goals:[10]
      },
      {
          id: 33,
          label: 'añadido por empleado',
          performancePercentage: 100,
          goals:[11]
      },
      {
          id: 34,
          label: 'Producci&oacute;n por empleado',
          performancePercentage: 250,
          goals:[11]
      },
      {
          id: 35,
          label: 'Nivel de cualificaci&oacute;n requerido',
          performancePercentage: 50,
          goals:[12]
      },
      {
          id: 36,
          label: 'Nivel de mejoras conseguido',
          performancePercentage: 100,
          goals:[12]
      },
      {
          id: 37,
          label: 'N&uacute;mero de sugerencias por empleado',
          performancePercentage: 50,
          goals:[13]
      },
      {
          id: 38,
          label: 'N&uacute;mero de sugerencias implementadas',
          performancePercentage: 400,
          goals:[13]
      },
      {
          id: 39,
          label: '% empleados gestionados con el CM',
          performancePercentage: 50,
          goals:[13]
      },
      {
          id: 40,
          label: '% empleados relacionados con el CM',
          performancePercentage: 25,
          goals:[13]
      },
      {
          id: 41,
          label: 'Desarrollo personal: encuestas de clima laborales',
          performancePercentage: 25,
          goals:[13]
      },
      {
          id: 42,
          label: 'Proyectos comunes entre departamentos',
          performancePercentage: 33,
          goals:[13]
      },
      {
          id: 43,
          label: '% de proyectos que alcanzan los objetivos previstos',
          performancePercentage: 46,
          goals:[13]
      },
      {
          id: 44,
          label: '% Empleados que renuncian',
          performancePercentage: 35,
          goals:[14]
      },
      {
          id: 45,
          label: 'N&uacute;mero de cursos al año por empleado',
          performancePercentage: 42,
          goals:[15]
      },
      {
          id: 46,
          label: '% Incremento de ventas',
          performancePercentage: 166,
          goals:[16]
      },
      {
          id: 47,
          label: '% Ingresos nuevos canales de distribuci&oacute;n',
          performancePercentage: 300,
          goals:[16]
      },
      {
          id: 48,
          label: 'Rentabilidad Financiera',
          performancePercentage: 250,
          goals:[17]
      },
      {
          id: 49,
          label: 'Rentabilidad Econ&oacute;mica',
          performancePercentage: 75,
          goals:[17]
      },
      {
          id: 50,
          label: 'Rentabilidad de las ventas',
          performancePercentage: 400,
          goals:[17]
      },
      {
          id: 51,
          label: '% Reducci&oacute;n gastos operativos',
          performancePercentage: 50,
          goals:[18]
      },
      {
          id: 52,
          label: '% Reducci&oacute;n gastos administrativos',
          performancePercentage: 166,
          goals:[18]
      },
      {
          id: 53,
          label: '% Reducci&oacute;n gastos generales',
          performancePercentage: 50,
          goals:[18]
      },
      {
          id: 54,
          label: 'Flujos de caja generados (cash flow)',
          performancePercentage: 81,
          goals:[19]
      },
      {
          id: 55,
          label: 'Beneficio por acci&oacute;n',
          performancePercentage: 81,
          goals:[19]
      },
      {
          id: 56,
          label: 'BAI',
          performancePercentage: 81,
          goals:[19]
      },
      {
          id: 57,
          label: 'ROI',
          performancePercentage: 81,
          goals:[19]
      },
      {
          id: 58,
          label: '% Morosidad',
          performancePercentage: 32,
          goals:[20]
      }
    ];
    return kpis;
  }

  function getPerformance(individualPerformances){
    var averagePerformance = 0;

    for(var i=0;i < individualPerformances.length; i++){
      if(individualPerformances[i] > 100){
        averagePerformance+=100;
      }
      else{
        averagePerformance = individualPerformances[i];
      }
    }

    averagePerformance = averagePerformance / individualPerformances.length;
    return averagePerformance;
  }

  function getStatusByPerformance(performance){
      var statusBreakpoints = {
        yellow: 40,
        green: 70
      };
    if (performance >= statusBreakpoints.yellow){
      return 'yellow';
    }

    if(performance >= statusBreakpoints.green){
      return 'green';
    }

    return 'red';
  }

function s(req, res){

    var date = new Date(),
      stringDate = date.getUTCFullYear() + date.getUTCMonth() + date.getUTCDay(),
      perspectives = getPerspectives(date),
      goals = getGoals(date),
      indicators = getIndicators(date),
      result = {
        filterDate: stringDate,
        data: []
      };

    // calculation vars;
    var currentGoalPerformance = [],
      currentGoalId = 0,
      goalsPerformance = [];

    // get indicators performance by goal
    for(var i =0; i< indicators.length;i++){

      indicators[i].status = getStatusByPerformance(indicators[i].performance);

      for(var j=0; j< indicators[i].goals.length; j++){
        currentGoalId = indicators[i].goals[j];
        
        // setup performance Array for current goal
        if(!goalsPerformance[currentGoalId]){
          goalsPerformance[currentGoalId] = {
            kpisPerformance: [],
            performance: 0,
            status: ''
          };
        }
        goalsPerformance[currentGoalId].kpisPerformance.push(indicators[i].performance);
      }
    }
}

app.get('/', function (req, res) {
    var dataPeriods = JSON.stringify(utils.getDataPeriods());
    res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods })
});

app.get('/api/goals/:goalId', function(req, res){
    var data =   {
        "Id": req.params['goalId'],
        "title": "Satisfacci&oacute;n del cliente",
        "semaphoreStatus":'yellow',
        "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 6.3382185140371] , [ 1030766400000 , 5.9507873460847] , [ 1033358400000 , 11.569146943813] , [ 1036040400000 , 5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , 5.5310285460542] , [ 1043989200000 , 5.7838296963382] , [ 1046408400000 , 7.3249341615649] , [ 1049086800000 , 6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]],
        "indicators":[
            {
                id: 1,
                title: 'Cantidad de descuentos presentados',
                performance: 100,
                value: '5',
                unit:'value',
                operation: 'average',
                semaphoreStatus:'red',
                comparison: '<'                    
            },
            {
                id: 2,
                title: 'Cantidad en $ de descuentos presentados',
                performance: 133,
                value: '90000',
                unit:'$',
                operation: '+',
                semaphoreStatus:'yellow',
                comparison: '<'
            },
            {
                id: 3,
                title: 'Calidad del servicio',
                performance: 500,
                semaphoreStatus:'green',
                value: '10',
                unit:'value',
                operation: '+',
                comparison: '='                    
            },
            {
                id: 4,
                title: '% incidencias, defectos, errores',
                semaphoreStatus:'yellow',
                performance: 100,
                value: '13',
                unit:'%',
                operation: '%',
                comparison: '<'                    
            },
            {
                id: 5,
                title: 'Tiempo de respuesta de quejas',
                performance: 40,
                value: '19',
                unit:'value',
                semaphoreStatus:'red',
                operation: 'average',
                comparison: '<'                    
            },
            {
                id: 6,
                title: 'N&uacute;mero de llamadas entrantes',
                performance: 100,
                value: '27031',
                unit:'value',
                operation: '+',
                semaphoreStatus:'red',
                comparison: '<'                    
            }            
        ]
    };

    for(var i=0; i < data.values.length; i++){
        if(data.values[i][1] > 60){
            data.values[i][1] = getRandomInt(35,61);
        }
    }

    res.send(data);
});

app.get('/api/goals/:goalId/indicators/:indicatorId', function(req, res){
    var data = {
    id: 1,
    title: 'Tiempo de respuesta de quejas',
    performance: 100,
    value: '19',
    unit:'%',
    operation: 'average',
    semaphoreStatus:'red',
    comparison: '<',          
    values:[
        {
            date:1454209200000,
            expected:15,
            value:5
        },
        {
            date:1456628400000,
            expected:15,
            value:7
        },
        {
            date:1459306800000,
            expected:15,
            value:2
        },
        {
            date:1461985200000,
            expected:10,
            value:6
        },
        {
            date:1464577200000,
            expected:10,
            value:22
        },
        {
            date:1467255600000,
            expected:10,
            value:18
        },
        {
            date:1469847600000,
            expected:10,
            value:3
        },
        {
            date:1472526000000,
            expected:10,
            value:25
        },
        {
            date:1475204400000,
            expected:10,
            value:15
        },
        {
            date:1477796400000,
            expected:7,
            value:8
        },
        {
            date:1480474800000,
            expected:7,
            value:19
        },
        {
            date:1483066800000,
            expected:7,
            value:5
        }                                    
    ]        
    };


    res.send(data);
});

app.get('/api/perspectives', function(req, res){
    var goals = getGoals();
    var tmpPerspectives = getPerspectives();
    var perspectives = [];

    for(var j=0; j < tmpPerspectives.length; j++){
    perspectives[tmpPerspectives[j].id] = tmpPerspectives[j];
    perspectives[tmpPerspectives[j].id].goals = [];        
    perspectives[tmpPerspectives[j].id].title = tmpPerspectives[j].label;
    }

    for(var i=0; i < goals.length; i++){          
        perspectives[goals[i].perspectives[0]].goals.push({
            title: goals[i].label,
            id: goals[i].id
        });
    }

    perspectives.splice(0,1);
    res.send(perspectives);
});

// 404 catch 
app.all('*', function(req, res){
    console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
    var dataPeriods = JSON.stringify(utils.getDataPeriods());

    res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods });
});


// UTILS

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}
