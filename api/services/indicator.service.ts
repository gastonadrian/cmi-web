import * as utils from './../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

import { IndicatorDataService } from './../data/indicator.entity';

import { IPerformance, Operations, SemaphoreStatus, PerformanceComparisons  } from './../models/shared';

import { MongoGoalIndicator } from './../models/mongo/goal-indicator.mongo';
import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData } from './../models/mongo/indicator-data';
import { MongoGoal } from './../models/mongo/goal.mongo';


import { IndicatorApiResult } from './../models/api/indicator';
import { GoalApiResult } from './../models/api/goal';
import { GoalIndicatorApiResult } from './../models/api/goal-indicator';
import { IExpectation } from './../models/api/expectation';
import { IIndicatorSync } from './../models/indicator-sync.interface';
import { IndicatorPerformanceBase } from './../models/indicator-performance.base';

import { GoalService } from './goal.service';
export class IndicatorService{
    
    constructor(){
    }

    static get(customerId:string, indicatorId:string):Promise<any>{
        return IndicatorDataService.get(customerId, indicatorId);
    }

    static getAll(customerId:string, active?:Boolean):Promise<any>{
        return IndicatorDataService.getAllByCustomerId(customerId, active);
    }

    static getAllSync(customerId:string):Promise<any>{
        return IndicatorDataService.getAllByCustomerId(customerId, true)
            .then(function onGetAll(indicators:Array<IndicatorApiResult>){
                let ids:string[] = indicators.map(function mapIndicatorId(ind){
                    return ind._id.toString();
                });

                // obtain all the data-indicator grouped by date
                return IndicatorDataService.getIndicatorsLastSync(ids)
                    .then(function (indicatorsData:Array<IIndicatorSync>){
                        for(var i=0; i < indicatorsData.length; i++){
                            let index =  _.findIndex(indicators, function mapId( value:IndicatorApiResult ) { return value._id.toString() === indicatorsData[i]._id } );
                            indicators[index].lastDateSynced = indicatorsData[i].date;
                        }
                        return indicators;
                    });
            });
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

            return IndicatorDataService.getPerformance(indicatorIds, from, to)
            .then(function onPerformance(cachedPerformance:Array<IndicatorPerformanceBase>){

                // we reset the goalids, because we want to ask later for those goals
                // that are not cached
                indicatorIds = [];

                for(var i = 0; i< indicators.length; i++){
                    let performance:IndicatorPerformanceBase = _.find(cachedPerformance, _.matchesProperty('indicatorId', indicators[i]._id.toString()));
                    
                    if(performance){
                                                
                        indicatorsResult.push(                     
                            _.extend(indicators[i], { 
                                performance: performance
                            }) as IndicatorApiResult
                        );   

                    }
                    else{
                        indicatorIds.push(indicators[i]._id.toString());
                    }
                }

                if(!indicatorIds.length){
                    return indicatorsResult;
                }

                return self.calculateSeveralPerformance(customerId, indicatorIds, _.filter(indicators, ( value:MongoIndicator ) => {  return _.includes(indicatorIds, value._id.toString());  } ), from, to)
                    .then(function goalApiResult(response:Array<IndicatorApiResult>){
                        return indicatorsResult.concat(response);
                    });

            });

            

        });
    }

    // get indicator data and expectedvalues
    private static calculateSeveralPerformance(customerId, indicatorIds, indicators:Array<MongoIndicator>, from:Date, to:Date):Promise<Array<IndicatorApiResult>>{
        let result:Array<IndicatorApiResult> = [],
            self = this;

        return IndicatorDataService.getIndicatorsDataBetween(customerId, indicatorIds, from, to).then(function onGetIndicatorsData(indicatorsData:Array<MongoIndicatorData>){
            //calculate performance for each indicator
            for(var i = 0; i < indicators.length; i++){
                let performance:IndicatorPerformanceBase = self.calculateIndicatorPerformance(indicators[i], _.filter(indicatorsData, _.matches({ indicatorId: indicators[i]._id.toString() })), from, to );

                IndicatorDataService.insertPerformance(performance);

                result.push(_.extend(indicators[i], 
                    {
                        performance: performance,
                    }) as IndicatorApiResult);
            }
            return result;    
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

        if(indicator.semaphore){
            if(indicator.semaphore.redUntil > 1){
                indicator.semaphore.redUntil = (indicator.semaphore.redUntil /100) || 0;
            }

            if(indicator.semaphore.yellowUntil > 1){
                indicator.semaphore.yellowUntil = (indicator.semaphore.yellowUntil / 100) || 0;
            }
        }

        if(indicator._id && indicator._id.length){
            return this.update(customerId, indicator as IndicatorApiResult);
        }
        else{
            return IndicatorDataService.insertIndicator(indicator as MongoIndicator);
        }
    }

    static assignGoal(customerId:string, goalIndicator:GoalIndicatorApiResult):Promise<any>{
        let self = this;
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
                return self.update(customerId, indicator)
                    .then(function onUpdateResponse(response:any){
                        return { ok: response.ok && insertGoalIndicatorResult.ok }
                    });
            }

            return insertGoalIndicatorResult;
        });
    }

    static removeGoal(customerId:string, goalId:string, indicatorId:string):Promise<any>{
        let self = this;

        return Promise.all([
            IndicatorDataService.removeGoalIndicator(customerId, goalId, indicatorId),
            IndicatorDataService.get(customerId, indicatorId)
        ]).then(function onAll(values:Array<any>){
            let removeGoalIndicatorResult:any = values[0];
            let indicator:MongoIndicator = values[1];

            _.remove(indicator.goalIds, function(id:string) {
                return id == goalId;
            });
            return self.update(customerId, indicator)
                    .then(function onUpdateResponse(response:any){
                        return { ok: response.ok && removeGoalIndicatorResult.ok }
                    });
        });
    }

    static saveIndicatorDataSource(customerId:string, indicator:MongoIndicator):Promise<any>{
        let self = this;
        return this.get(customerId, indicator._id.toString())
            .then(function onIndicatorGet(oldIndicator:MongoIndicator){
                oldIndicator.datasource = indicator.datasource;

                return self.update(customerId, oldIndicator as IndicatorApiResult);
            });
    }

    static createIndicatorData(customerId:string, indicatorData:Array<MongoIndicatorData>):Promise<any>{
        // guardamos el id
        let indicatorId = indicatorData[0].indicatorId;

        //validar array vacio
        if(!indicatorData.length){
            return new Promise(function(resolve, reject){
                return resolve({
                    ok:false,
                    why: 'Faltan datos'
                });
            });            
        }

        // validar que todos los elementos del array tengan los datos seteados
        for(var i=0; i< indicatorData.length; i++){
            indicatorData[i].customerId = customerId;
            indicatorData[i].date = moment(indicatorData[i].date).toDate(); 

            // validar que todos los datos sean correctos
            if(!(indicatorData[i].indicatorId
            && moment(indicatorData[i].date).isValid())){
                return new Promise(function(resolve, reject){
                    return resolve({
                        ok:false,
                        why: 'Faltan datos'
                    });
                });
            }

        }

        let dates:Array<Date> = _.flatMap(indicatorData, (iData:MongoIndicatorData) => { return iData.date; } );
        let datesToAdd:Array<MongoIndicatorData> = [];
        let datesToUpdate:Array<MongoIndicatorData> = [];
        
        return IndicatorDataService.getIndicatorDataDates(customerId, indicatorId, dates)
            .then(function onGetDates(response:Array<MongoIndicatorData>){
                for(var i =0; i < dates.length; i++){

                    let oldIndicator:MongoIndicatorData = _.find(response, _.matchesProperty('date', dates[i]));
                    let newIndicator:MongoIndicatorData = _.find(indicatorData, _.matchesProperty('date', dates[i]));

                    if(newIndicator.value === null){
                        continue;
                    }

                    if(oldIndicator){
                        // must UPDATE on the db
                        oldIndicator.value = newIndicator.value;
                        datesToUpdate.push(oldIndicator);
                    } else {
                        datesToAdd.push(newIndicator)
                    }
                }

                let requests:Array<Promise<any>> = [];
                
                if(datesToAdd.length){
                     requests.push(IndicatorDataService.insertIndicatorData(datesToAdd))                    
                }
                for(var j=0; j < datesToUpdate.length; j++){
                    requests.push(IndicatorDataService.updateIndicatorDataValue(customerId, datesToUpdate[j]));
                }

                return Promise.all(requests)
                    .then(function onSaveIndicators(response){
                        return IndicatorDataService.getIndicatorsLastSync([indicatorId])
                            .then(function (indicatorSyncs:Array<IIndicatorSync>){
                                return indicatorSyncs[0];
                            });
                        });
            });
    }

    static getAllIndicatorData(customerId:string, indicatorId:string):Promise<any>{
        return IndicatorDataService.getIndicatorsDataBetween(customerId, [indicatorId]);
    }

    static setQuarterExpectation(customerId:string, indicatorId:string, quarter:IExpectation){
        let startOfQuarter:Date = moment(quarter.date).startOf('quarter').toDate();
        let endOfQuarter:Date = moment(quarter.date).endOf('quarter').subtract(1, 'second').toDate();
        let self = this;

        return Promise.all([
            IndicatorDataService.get(customerId, indicatorId),
            IndicatorDataService.getIndicatorsDataBetween(customerId, [indicatorId], startOfQuarter, endOfQuarter)
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
                        promiseArray.push(IndicatorDataService.updateIndicatorData(customerId, indicatorId, indicatorsData[i].date, quarter.value ));                    
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

    static update(customerId:string, indicator:MongoIndicator){
        let currentActive:Boolean = indicator.active,
            newActive:Boolean = !!indicator.datasource._id;

        if(currentActive != newActive && newActive){
            // get goals and update those to active                    
            // we only want the active === false, to update those to active==true
            GoalService.getByIds(customerId, indicator.goalIds, false)
                .then(function onGetByIds(goals:Array<GoalApiResult>){
                    for(var i=0; i<goals.length; i++){
                        goals[i].active = true;
                        GoalService.update(customerId, goals[i]);
                    }
                });
            }

        // is active as long as it has a datasource id assigned
        indicator.active = newActive;

        if(indicator.semaphore){
            if(indicator.semaphore.redUntil > 1){
                indicator.semaphore.redUntil = (indicator.semaphore.redUntil /100) || 0;
            }

            if(indicator.semaphore.yellowUntil > 1){
                indicator.semaphore.yellowUntil = (indicator.semaphore.yellowUntil / 100) || 0;
            }
        }
        
        return IndicatorDataService.updateIndicator(indicator);       
    }

    static updateIndicatorData(customerId:string, indicatorId:string, expect:IExpectation):Promise<any>{
        expect.date = moment(expect.date).toDate();
        return IndicatorDataService.updateIndicatorData(customerId, indicatorId, expect.date, expect.value);
    }
    private static createEmptyIndicatorData(customerId:string, indicatorId:string, expected:number, start:Date, end:Date):Array<MongoIndicatorData>{
        let howManyMonths = moment.duration(moment(end).diff(moment(start))).asMonths();
        let result:Array<MongoIndicatorData> = [];

        for(var i=0; i<howManyMonths; i++){
            result.push({
                indicatorId:indicatorId,
                customerId: customerId,
                date: moment(start).add(i, 'month').endOf('month').toDate(),
                value: null,
                expected: expected
            });
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
    private static calculateIndicatorPerformance(indicator:MongoIndicator, months:Array<MongoIndicatorData>, from:Date, to:Date):IndicatorPerformanceBase{
        let consolidateData:number = 0;
        let consolidateExpected:number = 0;
        
        let oneUnitPercentageValue:number = 0;
        let result:IndicatorPerformanceBase = {
            indicatorId: indicator._id.toString(),
            from: from,
            to:  to,
            unitValue: 0,
            progressPerformance: [],
            // if there is no data the default is "red" and "0%" 
            periodPerformance: {
                semaphoreStatus: SemaphoreStatus.red,
                value: 0,
                date: to
            }
        };
        
        if(!months.length){
            return result;
        }

        consolidateExpected = _.sumBy(months, 'expected');

        if(indicator.datasource.columnOperation === Operations.average){
            consolidateExpected = consolidateExpected / months.length;
        }

        // get the performance progress
        for(var i = 0; i < months.length; i++){
            
            let value:number;
            consolidateData += months[i].value;

            if(indicator.datasource.columnOperation === Operations.average){
                value = consolidateData / (i+1);
            } else {
                value = consolidateData;
            }

            result.progressPerformance.push(this.getAccumulatedMonthPerformance(indicator, from, months[i].date, value, consolidateExpected));
        }

        if(indicator.datasource.columnOperation === Operations.average){
            result.unitValue = consolidateData/ months.length;
        } else {
            result.unitValue = consolidateData;
        }

        result.periodPerformance = result.progressPerformance[result.progressPerformance.length -1];

        return result;
    }

    private static getAccumulatedMonthPerformance(indicator:IndicatorApiResult, from:Date, to:Date, value:number, expected:number):IPerformance{
        let result:IPerformance = {
                semaphoreStatus: SemaphoreStatus.red,
                value:0,
                date: to
        };

        if(indicator.performanceComparison === PerformanceComparisons.lessThan){            
            result.value = this.calculateLessThanPercentage(indicator, value, expected);
        } else {
            result.value = this.calculateEqualsToPercentage(indicator, value, expected);
        }

        if(result.value > 1){
            result.value = 1;
        }

        if(result.value < 0){
            result.value = 0;
        }

        if(result.value > indicator.semaphore.redUntil){
            // yellow or green
            if(result.value > indicator.semaphore.yellowUntil){
                result.semaphoreStatus = SemaphoreStatus.green;                
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }
        else{
            result.semaphoreStatus = SemaphoreStatus.red;
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
    private static calculateLessThanPercentage(indicator:MongoIndicator, value:number, expected:number):number{
        // case study: monthly expected is less than 10 seconds per support call
        // case study: the semaphore will be yellow until 60%

        // if (expected value) is (100% - yellowUntilPercentage)
        // 10 seconds = 40% (because up to 10 seconds the value is according to the expected)
        
        // that means that => (100% - yellowUntilPercentage) / expected value  => % for a unit
        // (100% - 60%) / 10s => 1s %
        // 40% / 10 s => 1s %
        // 4%/s => 1 second of call is equal to a 4% decrease of the performance value
        // a call of 4 seconds subtract 16% of performance
        // a call of 10 seconds is 60%
        // one of 11 56%   
        
        let oneUnitPercentage =  (1 - indicator.semaphore.yellowUntil)/expected;
        return 1 - oneUnitPercentage * value;
    }

    private static calculateEqualsToPercentage(indicator:MongoIndicator, value:number, expected:number):number{
        let oneUnitPercentage: number = 1 / expected;
        return oneUnitPercentage * value;
    }    
}
