import * as utils from './../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

import { IndicatorDataService } from './../data/indicator.entity';

import { IPerformance, Operations, SemaphoreStatus, PerformanceComparisons  } from './../models/shared';

import { MongoGoalIndicator } from './../models/mongo/goal-indicator.mongo';
import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData } from './../models/mongo/indicator-data';

import { IndicatorApiResult } from './../models/api/indicator';
import { GoalIndicatorApiResult } from './../models/api/goal-indicator';
import { IExpectation } from './../models/api/expectation';
export class IndicatorService{
    
    constructor(){
    }

    static get(customerId:string, indicatorId:string):Promise<any>{
        return IndicatorDataService.get(customerId, indicatorId);
    }

    static getAll(customerId:string):Promise<any>{
        return IndicatorDataService.getAllByCustomerId(customerId);
    }

    static getGoalIndicators(customerId:string, goalIds:Array<string>):Promise<Array<MongoGoalIndicator>>{
        return IndicatorDataService.getGoalIndicators(customerId, goalIds);
    }

    static getIndicatorsByGoalId(customerId:string, goalIds:Array<string>):Promise<Array<MongoIndicator>>{
        return IndicatorDataService.getAllByGoalIds(customerId, goalIds);        
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

        return IndicatorDataService.getAllByGoalIds(customerId, goalIds).then(function onGetIndicators(indicators: Array<MongoIndicator>){
            
            indicatorIds = indicators.map(function mapIndicatorId(indicator:MongoIndicator){
                return indicator._id.toString();
            });    

            // get indicator data and expectedvalues
            return IndicatorDataService.getIndicatorsData(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData:Array<MongoIndicatorData>){
                //calculate performance for each indicator
                for(var i = 0; i < indicators.length; i++){
                    let performance:IPerformance = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })) );
                    
                    indicatorsResult.push(_.extend(indicators[i], 
                        { performance: performance, id:indicators[i]._id.toString()  }) as IndicatorApiResult);
                }
                return indicatorsResult;    
            });
        });
    }

    static saveIndicator(customerId:string, indicator:IndicatorApiResult):Promise<any>{
        indicator.customerId = customerId;
        if(!(indicator.title.length 
            && indicator.data && indicator.data.title.length 
            && (indicator.performanceComparison ===  PerformanceComparisons.lessThan || indicator.performanceComparison ===  PerformanceComparisons.equals)
            && indicator.datasource && !!indicator.datasource.columnOperation )){;
            return new Promise(function(resolve, reject){
                return reject('Faltan datos');
            });
        }
    
        // is active as long as it has a datasource id assigned
        indicator.active = !!indicator.datasource._id;


        if(indicator._id && indicator._id.length){
            return IndicatorDataService.updateIndicator(indicator as MongoIndicator);
        }
        else{
            return IndicatorDataService.insertIndicator(indicator as MongoIndicator);
        }
    }

    static assignGoal(customerId:string, goalIndicator:GoalIndicatorApiResult):Promise<any>{
        goalIndicator.customerId = customerId;
        return Promise.all([
            IndicatorDataService.insertGoalIndicator(customerId, goalIndicator),
            IndicatorDataService.get(customerId, goalIndicator.indicatorId)
        ]).then(function onAll(values:Array<any>){
            let insertGoalIndicatorResult:any = values[0];
            let indicator:MongoIndicator = values[1];
            if(! _.includes(indicator.goalIds, goalIndicator.goalId)){

                if(!indicator.goalIds){
                    indicator.goalIds = [];
                }

                // add the goal to "goalIds" property
                indicator.goalIds.push(goalIndicator.goalId);
                return IndicatorDataService.updateIndicator(indicator)
                    .then(function onUpdateResponse(response:any){
                        return { ok: response.ok && insertGoalIndicatorResult.ok }
                    });
            }

            return insertGoalIndicatorResult;
        });
    }

    static removeGoal(customerId:string, goalId:string, indicatorId:string):Promise<any>{
        return Promise.all([
            IndicatorDataService.removeGoalIndicator(customerId, goalId, indicatorId),
            IndicatorDataService.get(customerId, indicatorId)
        ]).then(function onAll(values:Array<any>){
            let removeGoalIndicatorResult:any = values[0];
            let indicator:MongoIndicator = values[1];

            _.remove(indicator.goalIds, function(id:string) {
                return id == goalId;
            });
            return IndicatorDataService.updateIndicator(indicator)
                    .then(function onUpdateResponse(response:any){
                        return { ok: response.ok && removeGoalIndicatorResult.ok }
                    });
        });
    }

    static saveIndicatorDataSource(customerId:string, indicator:MongoIndicator):Promise<any>{
        return this.get(customerId, indicator._id.toString())
            .then(function onIndicatorGet(oldIndicator:MongoIndicator){
                oldIndicator.datasource = indicator.datasource;

                return IndicatorDataService.updateIndicator(oldIndicator as MongoIndicator);
            });
    }

    static update(indicator:MongoIndicator):Promise<any>{
        return IndicatorDataService.updateIndicator(indicator);       
    }

    static createIndicatorData(customerId:string, indicatorData:MongoIndicatorData):Promise<any>{
        indicatorData.customerId = customerId;
        if(!(indicatorData.indicatorId
        && indicatorData.value
        && moment(indicatorData.date).isValid())){
            return new Promise(function(resolve, reject){
                return reject('Faltan datos');
            });
        }

        return IndicatorDataService.insertIndicatorData([indicatorData] as Array<MongoIndicatorData>);
    }

    static setQuarterExpectation(customerId:string, indicatorId:string, quarter:IExpectation){
        let startOfQuarter:Date = moment(quarter.date).startOf('quarter').toDate();
        let endOfQuarter:Date = moment(quarter.date).endOf('quarter').subtract(1, 'second').toDate();
        let self = this;

        return Promise.all([
            IndicatorDataService.get(customerId, indicatorId),
            IndicatorDataService.getIndicatorsData(customerId, [indicatorId], startOfQuarter, endOfQuarter)
        ]).then(function onResponseAll(values:Array<any>){
                // detalles del indicador solicitado
                let indicator:MongoIndicator = values[0];
                let indicatorsData:Array<MongoIndicatorData> = values[1];

                // first we need to calculate the month value for the indicator
                    // si la operacion es promediar =>  el valor es el mismo
                if(indicator.datasource.columnOperation !== Operations.average){
                    // cualquier otra operacion => el  valor se divide en la cantidad de meses
                    quarter.value = quarter.value / 3;
                }

                // si ya hay datos importados cargados para este periodo
                if(indicatorsData.length){
                    
                    // update indicator data with expectation
                    let promiseArray:Array<Promise<any>> = [];
                    for(var i=0; i < indicatorsData.length; i++){
                        promiseArray.push(IndicatorDataService.updateIndicatorData(customerId, indicatorId, quarter.value ));                    
                    }
    
                    return Promise.all(promiseArray)
                        .then(function (values:Array<any>){
                            let isOk:boolean = true;
                            for(var j=0; j < values.length; j++){
                                isOk = isOk && values[j].ok;
                            }
                            return { ok: isOk };
                        });
                }

                // if there aren't import, create empty imports with expect value set
                let newIndicatorsData:Array<MongoIndicatorData> = self.createEmptyIndicatorData(customerId, indicatorId, quarter.value, startOfQuarter, endOfQuarter);
                return IndicatorDataService.insertIndicatorData(newIndicatorsData)
                    .then(function onInsert(response){
                        return {
                            ok: !!response.insertedIds.length
                        }
                    });
            });        
    }

    private static createEmptyIndicatorData(customerId:string, indicatorId:string, expected:number, start:Date, end:Date):Array<MongoIndicatorData>{
        let howManyMonths = moment.duration(moment(end).diff(moment(start))).asMonths();
        let result:Array<MongoIndicatorData> = [];

        for(var i=0; i<howManyMonths; i++){
            result.push(new MongoIndicatorData(indicatorId, customerId, moment(start).add(i, 'month').endOf('month').toDate(), null, expected));
        }

        return result;
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

        if(indicator.performanceComparison === PerformanceComparisons.lessThan 
        && (indicator.datasource.columnOperation === Operations.plus || indicator.datasource.columnOperation === Operations.average) ){
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
        
        if(!months.length){
            performanceResult.semaphoreStatus = SemaphoreStatus.red;
            performanceResult.value = 0;
            return performanceResult;
        }

        // get the consolidates
        for(var i = 0; i < months.length; i++){
            consolidateData += months[i].value;
            consolidateExpected += months[i].expected;   
        }

        if(indicator.datasource.columnOperation === Operations.average){
            consolidateData = consolidateData / months.length;
            consolidateExpected = consolidateExpected / months.length;
        }

        onePercentValue = consolidateExpected / (100 - indicator.semaphore.yellowUntil*100);

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
