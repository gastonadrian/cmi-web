import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'; 
import { LineChartConfig } from './../shared/models/line-chart-config';
import { GoalService } from './../shared/services/';

import { GoalApiResult } from './../../../api/models/api/goal';
import { GoalPerformanceBase } from './../../../api/models/goal-performance.base';

import { Performance, AppSettings } from './../shared/models/shared';
import { IPerformance } from "../../../api/models/shared";

declare let moment:any;

@Component({
  moduleId: module.id,
  selector: 'goal-component',
  templateUrl: 'goal.template.html'
})
export class GoalComponent implements OnInit{
  public goal: GoalApiResult;
  public chartConfig: LineChartConfig;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public goalService: GoalService) { 
  }

  getSemaphoreStatusColour(semaphoreValue:number):string{
    return AppSettings.semaphoreStatusText[semaphoreValue];
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
}