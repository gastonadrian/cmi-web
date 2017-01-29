import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'; 
import { LineChartConfig } from './../shared/models/line-chart-config';
import { GoalService } from './../shared/services/';

import { Goal, GoalIndicator } from './../shared/models/goal';
import { DateValue, Performance } from './../shared/models/shared';


@Component({
  moduleId: module.id,
  selector: 'goal-component',
  templateUrl: 'goal.template.html'
})
export class GoalComponent implements OnInit{
  public goal: Goal;
  public chartConfig: LineChartConfig;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public goalService: GoalService) { 
  }
  
  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
        this.goal = data.goal;
        this.chartConfig = {
          settings: {
            xAxisLabel: 'Date',
            yAxisLabel: 'Progress (%)',
            xAxisFormat: 'MMM-YY'
          }, 
          dataset:[{
            values: this.goal.values.map( (data:DateValue) => {
              return { x: data.date, y: data.value };
            }),
            key: this.goal.title,
            color: '#7777ff'
          }] 
        };       
     });
  }
}