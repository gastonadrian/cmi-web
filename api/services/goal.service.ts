import * as _ from 'lodash';
import * as moment from 'moment';
import { SemaphoreStatus, Operations, IPerformance } from './../models/shared';

import { MongoGoal } from './../models/mongo/goal';
import { MongoIndicator } from './../models/mongo/indicator';
import { MongoIndicatorData } from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator';
import { IndicatorApiResult } from './../models/api/indicator';
import { GoalApiResult } from './../models/api/goal';

export class GoalService {

    getGoalsPerformance(customerId:string, withIndicators:Boolean, from:Date, to:Date):Array<GoalApiResult>{
        let mongoGoals:Array<MongoGoal> = this.mongoGetGoals(customerId, 'active'),
            goalIds:Array<string> = [],
            indicators:Array<IndicatorApiResult> = [],
            goalIndicatorSpec:Array<MongoGoalIndicator> = [],
            result:Array<GoalApiResult> = [];

        // get the performance of all indicators inside the goals
        goalIds = mongoGoals.map(function goalIdMap(goal:MongoGoal){
            return goal._id;
        });

        indicators = this.getGoalIndicatorsPerformance(customerId, goalIds, from, to);
        goalIndicatorSpec = this.mongoGetGoalIndicators(customerId, goalIds);
        // calculate goal performance
        for(var i = 0; i< mongoGoals.length; i++){
            // take the factors from here
            var indicatorSpecs = _.filter(goalIndicatorSpec, _.matches({ goalId: mongoGoals[i]._id }));

            // take the indicators with performance from here
            var indicatorsWithPerformance = _.filter(indicators, function filterByGoal(ind){
                return _.includes(ind.goalIds, mongoGoals[i]._id)
            });

            let performance:IPerformance = this.calculateGoalPerformance(mongoGoals[i], indicatorsWithPerformance, indicatorSpecs);
            result.push(new GoalApiResult(
                mongoGoals[i]._id,
                mongoGoals[i].customerId,
                mongoGoals[i].title,
                mongoGoals[i].perspectiveId,
                performance
            ));
        }
        return result;
    }

    calculateGoalPerformance(goal:MongoGoal, indicators:Array<IndicatorApiResult>, indicatorFactors:Array<MongoGoalIndicator>):IPerformance{
        let unitPercentage:number = 1 / _.sumBy(indicatorFactors, 'factor');
        let result:IPerformance = {
            semaphoreStatus: SemaphoreStatus.green,
            value: 0
        };
        for(var i=0; i < indicators.length; i++){
            var goalIndicator = indicatorFactors.find( (goalInd: MongoGoalIndicator, index: number) =>{ return goalInd.indicatorId == indicators[i]._id; }  );
            result.value += goalIndicator.factor * unitPercentage * indicators[i].performance.value;
        }

        // so we are on the same scale for comparison (0 to 100)
        result.value = result.value;
        
        if(result.value <= goal.semaphore.yellowUntil){
            if(result.value <= goal.semaphore.redUntil){
                result.semaphoreStatus = SemaphoreStatus.red;
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }

        return result;
    }
    
    mongoGetGoals(customerId:string, status:string):Array<MongoGoal>{
        return[
            // {
            //     id: 1,
            //     customerId:22,
            //     title: 'Crecimiento de ingresos y carteras de clientes',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 2,
            //     title: 'Utilizaci&oacute;n de inversiones y activos',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }            
            // },
            // {
            //     id: 3,
            //     title: 'Reducci&oacute;n de costes y mejora de la productividad',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 4,
            //     title: 'Crear valor para el accionista',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 5,
            //     title: 'Reducir la morosidad',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     } 
            // }
            // {
            //     id: 6,
            //     title: 'Cuota de mercado',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 7,
            //     title: 'Retenci&oacute;n y fidelizaci&oacute;n de clientes',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 8,
            //     title: 'Adquisici&oacute;n de nuevos clientes',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 9,
            //     title: 'Satisfacci&oacute;n del cliente',
            //     indicators: [],
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 10,
            //     title: 'Rentabilidad',
            //     indicators: [],
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 11,
            //     title: 'Capacidad del personal',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 12,
            //     title: 'Utilizaci&oacute;n de inversiones y activos',
            //     indicators: [],
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 13,
            //     title: 'Motivaci&oacute;n y alineamiento',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 14,
            //     title: 'Reducir bajas laborales',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 15,
            //     title: 'Mejorar la formaci&oacute;n',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            new MongoGoal(
                '16',
                customerId,
                'Proceso de operaciones',
                4,
                0.30,
                0.59)
            // {
            //     id: 17,
            //     title: 'Proceso de servicio postventa',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 18,
            //     title: 'Mejorar relaci&oacute;n con distribuidor',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 19,
            //     title: 'Gestionar recursos internos',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 20,
            //     title: 'Renovaci&oacute;n de maquinaria',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // }            
        ];
    }

    mongoGetGoalIndicators(customerId:string, goalIds:Array<string>):Array<MongoGoalIndicator>{
        return [
            new MongoGoalIndicator(
                '2',
                '16',
                4
            ),
            new MongoGoalIndicator(
                '3',
                '16',
                2
            ),
            new MongoGoalIndicator(
                '4',
                '16',
                1
            )                        
        ];
    }

    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} goalIds
     * @param {any} from
     * @param {any} to
     * @returns
     */
    getGoalIndicatorsPerformance(customerId:string, goalIds:Array<string>, from:Date, to:Date):Array<IndicatorApiResult>{

        let indicators:Array<MongoIndicator> = this.mongoGetIndicators(customerId, goalIds);
        let indicatorIds:Array<string> = [];
        let indicatorsData:Array<MongoIndicatorData> = [];
        let indicatorsResult:Array<IndicatorApiResult> = [];

        indicatorIds = indicators.map(function mapIndicatorId(indicator){
            return indicator._id;
        });

        // get indicator data and expectedvalues
        indicatorsData = this.mongoGetIndicatorsData(customerId, indicatorIds, from, to);

        //calculate performance for each indicator
        for(var i = 0; i < indicators.length; i++){
            let performance:IPerformance = this.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id })) );
            indicatorsResult.push(new IndicatorApiResult(
                indicators[i]._id,
                indicators[i].customerId,
                indicators[i].goalIds,
                indicators[i].title,
                performance
            ));
        }
        return indicatorsResult;
    }

    /**
     * 
     * 
     * @param {any} indicator
     * @param {any} indicatorData
     * @param {any} indicatorExpected
     * @returns
     */
    calculateIndicatorPerformance(indicator:MongoIndicator, indicatorData:Array<MongoIndicatorData>):IPerformance{
        let result:IPerformance;

        if(indicator.performanceComparison === 'lessThan' 
        && (indicator.data.operation === Operations.plus || indicator.data.operation === Operations.average) ){
            result = this.calculateLessThanPerformance(indicator, indicatorData);
        }

        return result;  
    }

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
    calculateLessThanPerformance(indicator:MongoIndicator, months: Array<MongoIndicatorData>):IPerformance{
        let consolidateData:number = 0;
        let consolidateExpected:number = 0;
        let onePercentValue: number = 0;
        let performanceResult:IPerformance = {
            semaphoreStatus: SemaphoreStatus.green,
            value:0
        };
        
        // get the consolidates
        for(var i = 0; i < months.length; i++){
            consolidateData += months[i].value;
            consolidateExpected += months[i].expected;   
        }

        if(indicator.data.operation === Operations.average){
            consolidateData = consolidateData / months.length;
            consolidateExpected = consolidateExpected / months.length;
        }

        onePercentValue = consolidateExpected / (100 - indicator.semaphore.yellowUntil*100);

        // calculate percent
        performanceResult.value = 1 - (consolidateData / onePercentValue)/100;
        if(performanceResult.value < 0){
            performanceResult.value = 0;
        }

        if(consolidateData >= consolidateExpected){
            // red or yellow
            if(performanceResult.value > indicator.semaphore.redUntil){
                performanceResult.semaphoreStatus = SemaphoreStatus.yellow;                
            }
            else{
                performanceResult.semaphoreStatus = SemaphoreStatus.red;
            }
        }

        return performanceResult;
    }
 
    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} goalsId
     * @returns
     */
    mongoGetIndicators(customerId:string, goalsId:Array<string>):Array<MongoIndicator>{
        return[           
            new MongoIndicator(
                '2',
                '22',
                ['16'],
                'N&uacute;mero de reclamaciones de clientes',
                'lessThan',
                'number',
                Operations.plus,
                'unidades',
                0.30,
                0.50,
                '1',
                'Soporte',
                'clientId',
                'fecha'),
            new MongoIndicator(
                '3',
                '22',
                ['16'],
                'Devoluciones de clientes',
                'lessThan',
                'number',
                Operations.plus,
                'unidades',
                0.30,
                0.59,
                '1',
                'Retornos',
                'cantidad',
                'fecha'),
            new MongoIndicator(
                '4',
                '22',
                ['16'],
                'Costo de la actividad de inspecci&oaucte;n',
                'lessThan',
                'number',
                Operations.plus,
                '$',
                0.30,
                0.59,
                '1',
                'Inspeccion',
                'total',
                'fecha')
        ];
    }

    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} indicatorIds
     * @param {any} from
     * @param {any} to
     * @returns
     */
    mongoGetIndicatorsData(customerId:string, indicatorIds:Array<string>, from:Date, to:Date):Array<MongoIndicatorData>{
        return[
            new MongoIndicatorData(
                '2',
                '22',
                8,
                new Date('20160130'),
                33.33),
            new MongoIndicatorData(
                '2',
                '22',
                50,
                new Date('20160230'),
                33.33),
            new MongoIndicatorData(
                '2',
                '22',
                42,
                new Date('20160330'),
                33.33),
            new MongoIndicatorData(
                '3',
                '22',
                61,
                new Date('20160130'),
                66.66),
            new MongoIndicatorData(
                '3',
                '22',
                71,
                new Date('20160230'),
                66.66),
            new MongoIndicatorData(
                '3',
                '22',
                76,
                new Date('20160330'),
                66.66),
            new MongoIndicatorData(
                '4',
                '22',
                98,
                new Date('20160130'),
                33.33),
            new MongoIndicatorData(
                '4',
                '22',
                58,
                new Date('20160230'),
                33.33),
            new MongoIndicatorData(
                '4',
                '22',
                26,
                new Date('20160330'),
                33.33)
        ];
    }
}