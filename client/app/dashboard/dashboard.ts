import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Title }     from '@angular/platform-browser';
import { DashboardPerspectiveComponent } from './dashboard-perspective.component';
import { Perspective } from './../shared/models/perspective';
import { DataPeriod } from './../shared/models/shared';

import { DataPeriodService } from './../shared/services/data-period-service';
import { Subscription }   from 'rxjs/Subscription';
import { DashboardService } from './../shared/services/dashboard-service';

@Component({
  moduleId: module.id,
  selector: 'dashboard-component',
  templateUrl: 'dashboard.template.html'
})
export class DashboardComponent implements OnInit {
    public perspectives:Array<Perspective>;
    public selectedPeriod: DataPeriod;
    private subscription: Subscription;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private dataPeriodService: DataPeriodService,
    private dashboardService: DashboardService   
  ) {

    this.selectedPeriod = this.dataPeriodService.selectedPeriod;
    this.subscription = this.dataPeriodService.dataPeriodChanged$.subscribe(
      (period:DataPeriod) => {
        this.selectedPeriod = period;
        this.dashboardService.get(period.start, period.end).subscribe( (data:Array<Perspective>) => {
            this.perspectives = data;
        });
    });
  }

  ngOnInit() { 
    this.route.data
      .subscribe((data:any) => {
        this.perspectives = data.perspectives;
     });    
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}