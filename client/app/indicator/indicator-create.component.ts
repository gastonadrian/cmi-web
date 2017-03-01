import * as _ from 'lodash';

import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorService, WindowRef } from './../shared/services/';

// Backend imports
import { 
  BackendAppSettings,
  Operations,
  IDataDefinition,
  IDataSource,
  PerformanceComparisons,
  IColumnOperationOption
     } from './../../../api/models/shared';
import { IndicatorApiResult } from './../../../api/models/api/indicator';

declare let window:any;

// TODO: Mostrar errores
@Component({
  moduleId: module.id,
  selector: 'indicator-create',
  templateUrl: 'indicator-create.template.html'
})
export class IndicatorCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  nativeWindow: any;
  private htmlElement: HTMLElement;

  public indicator: IndicatorApiResult;

  public dataTypes:Array<IDataDefinition> = BackendAppSettings.dataTypes;

  public columnOperations:Array<IColumnOperationOption> = BackendAppSettings.columnOperations;
   emptyDataSource:IDataSource = {
      _id:'',
      table:'',
      rowOperation:'',
      dateColumn:'',
      valueColumn:''
   };
  public submitted: Boolean = false;

  public operation:number;
  public comparison:string;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public indicatorService: IndicatorService) {
      this.nativeWindow = WindowRef.getNativeWindow();
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }
  
  ngOnInit(){
    this.route.data
      .subscribe((data:any) => { 
        if(data.indicator){
          this.indicator = data.indicator;
          
          for(var i =0; i< this.dataTypes.length; i++){
            if(this.dataTypes[i].title === this.indicator.data.title){
              this.indicator.data = this.dataTypes[i];
              break;
            }
          }
          this.comparison = this.indicator.performanceComparison.toString();

        } else{
          this.indicator = new IndicatorApiResult();
          this.indicator.semaphore = {
            redUntil:0,
            yellowUntil:0
          };
          this.indicator.datasource = this.emptyDataSource;
      
        }
     });  
  }
  
  onSubmit(callback?:Function) { 

    this.submitted = true; 
    this.indicator.performanceComparison = +(this.comparison);

    return this.indicatorService.save(this.indicator)
      
      .subscribe(
        (indicatorId:any) => { 
          if(callback){
            callback(indicatorId);
          }          
        },
        (error:any) => {
            console.log('error', error);
        },
        () =>{
            this.router.navigateByUrl('/indicators/list');
        }
      );
  }

  redirectToCollector(){
    if(this.indicator._id){
      this.openDataCollector(this.indicator._id);
    }
    else{
      this.onSubmit(this.openDataCollector);
    }
  }

  protected openDataCollector(indicatorId: string): void {
    var newWindow = window.open(`data-collector://indicators/configure/${indicatorId}`);
  }

}