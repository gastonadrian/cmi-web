import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'; 
import { LineChartConfig } from './../shared/models/line-chart-config';
import { GoalService } from './../shared/services/';
import { DataPeriodService } from './../shared/services/data-period-service';

import { GoalApiResult } from './../../../api/models/api/goal';
import { GoalPerformanceBase } from './../../../api/models/goal-performance.base';


import { Performance, AppSettings, DataPeriod } from './../shared/models/shared';
import { IPerformance } from "../../../api/models/shared";
import { Subscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

declare let moment:any;

@Component({
  moduleId: module.id,
  selector: 'goal-component',
  templateUrl: 'goal.template.html'
})
export class GoalComponent implements OnInit, AfterViewInit, OnDestroy{
  public goal: GoalApiResult;
  public chartConfig: LineChartConfig;
  public selectedPeriod: DataPeriod;
  private subscription: Subscription;

  private lineChartConfigChangedSource:Subject<LineChartConfig> = new Subject<LineChartConfig>();
  public lineChartConfigChanged$:Observable<LineChartConfig> = this.lineChartConfigChangedSource.asObservable();

  

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    private dataPeriodService: DataPeriodService,    
    public goalService: GoalService) { 

    this.selectedPeriod = this.dataPeriodService.selectedPeriod;
    this.subscription = this.dataPeriodService.dataPeriodChanged$.subscribe(
      (period:DataPeriod) => {
        this.selectedPeriod = period;
        this.goalService.getPerformance(this.goal._id, period.start, period.end)
          .subscribe(
            (data:GoalApiResult) =>{
      
              this.goal = data;
              let datasetValues = this.goal.performance.progressPerformance.map( (data:IPerformance) => {
                    return { x: moment(data.date).toDate().getTime(), y: data.value*100 };
                  });
              this.chartConfig.dataset[0].values = datasetValues;

              this.lineChartConfigChangedSource.next(this.chartConfig);
            }
          );
    });      

  }

  getSemaphoreStatusColour(semaphoreValue:number):string{
    return AppSettings.semaphoreStatusText[semaphoreValue];
  }

  ngAfterViewInit(){
    this.lineChartConfigChangedSource.next(this.chartConfig);        
  }
    

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
        this.goal = data.goal;
        let datasetValues = this.goal.performance.progressPerformance.map( (data:IPerformance) => {
              return { x: moment(data.date).toDate().getTime(), y: data.value*100 };
            });

        this.chartConfig = {
          settings: {
            xAxisLabel: 'Fecha',
            yAxisLabel: 'Progreso (%)',
            xAxisFormat: 'MMM-YY'
          }, 
          dataset:[{
            values: datasetValues,
            key: this.goal.title,
            color: '#7777ff'
          }] 
        };       
     });
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }  
}