import { Component, OnChanges, Input, AfterViewInit } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Goal }  from './../shared/models/goal';
import { Performance, AppSettings }  from './../shared/models/shared';
import { Perspective }  from './../shared/models/perspective';
import { GaugeChartConfig } from './../shared/models/gauge-chart-config';
import { Observable } from "rxjs/Observable";

@Component({
  moduleId: module.id,
  selector: 'dashboard-perspective',
  templateUrl: 'dashboard-perspective.template.html',
  styles:['a{ color:#333; }']
})
export class DashboardPerspectiveComponent implements OnChanges, AfterViewInit {
  
  
    @Input()perspective:Perspective;
    public gaugeConfig: GaugeChartConfig = {
      status:'',
      percent:0
    };
    private gaugeConfigChangedSource:Subject<GaugeChartConfig> = new Subject<GaugeChartConfig>();
    public gaugeConfigChanged$:Observable<GaugeChartConfig> = this.gaugeConfigChangedSource.asObservable();
    
    constructor() {
    }
    
    ngAfterViewInit(){
        this.gaugeConfigChangedSource.next(this.gaugeConfig);        
    }

    ngOnChanges(changes: any): void {
        this.gaugeConfig.status = this.getGaugeStatusColour(this.perspective.performance.semaphoreStatus);
        this.gaugeConfig.percent = this.perspective.performance.value;
        this.gaugeConfigChangedSource.next(this.gaugeConfig);
    }

    getSemaphoreStatusColour(semaphoreValue:number):string{
        return AppSettings.semaphoreStatusText[semaphoreValue];
    }

    getGaugeStatusColour(semaphoreValue:number):string{
        let status = {
            '0':'',
            '1':'green',
            '2':'yellow',
            '3':'red'
        };

        return status[semaphoreValue];
    }

}