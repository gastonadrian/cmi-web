import { Component, OnChanges, Input } from '@angular/core';
import { Goal }  from './../shared/models/goal';
import { Performance }  from './../shared/models/shared';
import { Perspective }  from './../shared/models/perspective';
import { GaugeChartConfig } from './../shared/models/gauge-chart-config';

@Component({
  moduleId: module.id,
  selector: 'dashboard-perspective',
  templateUrl: 'dashboard-perspective.template.html',
  styles:['a{ color:#333; }']
})
export class DashboardPerspectiveComponent implements OnChanges {
  
  
    @Input()perspective:Perspective;
    public gaugeConfig: GaugeChartConfig = {
      status:'',
      percent:0
    };

    constructor() {
    }
    

    ngOnChanges(changes: any): void {
        if (!this.perspective.performance){
            return;
        }
        this.gaugeConfig.status = this.perspective.performance.semaphoreStatus;
        this.gaugeConfig.percent = this.perspective.performance.value;
    }

}