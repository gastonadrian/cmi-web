import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, Resolve } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppSettings, DataPeriod } from './shared/models/shared';
import { DataPeriodService } from './shared/services/data-period-service';


@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit{
  public title:string;
  public shouldBeAdmin:Boolean;
  public routeDescription:string;
  public dataPeriods: Array<DataPeriod> = [];
  public selectedPeriod: DataPeriod;
  public showPeriods:Boolean;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private dataPeriodService: DataPeriodService) { 
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd) {
        this.showPeriods = this.router.routerState.root.firstChild.data['value']['showPeriods'];
        this.title = this.router.routerState.root.firstChild.data['value']['title'];
        this.routeDescription = this.router.routerState.root.firstChild.data['value']['description'];
        this.titleService.setTitle(this.title); 
        this.title = `${this.title} <small>${this.routeDescription}</small>`; 
      }
    });    
    
    for(let id in AppSettings.dataPeriods){
      this.dataPeriods.push(new DataPeriod(id, AppSettings.dataPeriods[id].legend, AppSettings.dataPeriods[id].start, AppSettings.dataPeriods[id].end));
    }
  }

  ngOnInit(){
    this.selectedPeriod = this.dataPeriods[0];
    this.dataPeriodService.changePeriod(this.selectedPeriod);
  }

  public selectPeriod(newSelectedPeriod:DataPeriod):any{
    this.selectedPeriod = newSelectedPeriod;
    this.dataPeriodService.changePeriod(newSelectedPeriod);    
  }
}