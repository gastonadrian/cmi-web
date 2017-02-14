import * as utils from './../utils';
import * as _ from 'lodash';

import { IndicatorDataService } from './../data/indicator.entity';

import { IPerformance, Operations, SemaphoreStatus  } from './../models/shared';

import { MongoGoalIndicator } from './../models/mongo/goal-indicator';
import { MongoIndicator } from './../models/mongo/indicator';
import { MongoIndicatorData } from './../models/mongo/indicator-data';

import { IndicatorApiResult } from './../models/api/indicator';

export class IndicatorService{
    
    constructor(){
    }

    static getGoalIndicators(customerId:string, goalIds:Array<string>):Promise<Array<MongoGoalIndicator>>{
        return IndicatorDataService.getGoalIndicators(customerId, goalIds);
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
    static getIndicatorsPerformance(customerId:string, goalIds:Array<string>, from:Date, to:Date):Promise<Array<IndicatorApiResult>>{

        let indicatorIds:Array<string> = [];
        let indicatorsResult:Array<IndicatorApiResult> = [];
        let self = this;

        return IndicatorDataService.getIndicators(customerId, goalIds).then(function onGetIndicators(indicators: Array<MongoIndicator>){
            
            indicatorIds = indicators.map(function mapIndicatorId(indicator:MongoIndicator){
                return indicator._id.toString();
            });    

            // get indicator data and expectedvalues
            return IndicatorDataService.getIndicatorsData(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData:Array<MongoIndicatorData>){
                //calculate performance for each indicator
                for(var i = 0; i < indicators.length; i++){
                    let performance:IPerformance = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })) );
                    indicatorsResult.push(new IndicatorApiResult(
                        indicators[i]._id.toString(),
                        indicators[i].customerId,
                        indicators[i].goalIds,
                        indicators[i].title,
                        performance
                    ));
                }
                return indicatorsResult;    
            });
        });
    }

    /**
     * 
     * 
     * @param {any} indicator
     * @param {any} indicatorData
     * @param {any} indicatorExpected
     * @returns
     */
    private static calculateIndicatorPerformance(indicator:MongoIndicator, indicatorData:Array<MongoIndicatorData>):IPerformance{
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
    private static calculateLessThanPerformance(indicator:MongoIndicator, months: Array<MongoIndicatorData>):IPerformance{
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
}
