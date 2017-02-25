import * as _ from 'lodash';

import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorService } from './../shared/services/';

// Backend imports
import { 
  BackendAppSettings,
  Operations,
  IDataDefinition,
  PerformanceComparisons,
  IColumnOperationOption
     } from './../../../api/models/shared';
import { IndicatorApiResult } from './../../../api/models/api/indicator';

@Component({
  moduleId: module.id,
  selector: 'indicator-create',
  templateUrl: 'indicator-create.template.html'
})
export class IndicatorCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  private htmlElement: HTMLElement;

  public indicator: IndicatorApiResult;

  public dataTypes:Array<IDataDefinition> = BackendAppSettings.dataTypes;

  public columnOperations:Array<IColumnOperationOption> = BackendAppSettings.columnOperations;
  public submitted: Boolean = false;

  public operation:number;
  public comparison:number;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public indicatorService: IndicatorService) {
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }
  
  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
     });
  
    //TODO: Prepare this for edition
    this.indicator = new IndicatorApiResult();
  }
  
  onSubmit() { 
    let emptyDataSource = {
      _id:'',
      table:'',
      rowOperation:'',
      dateColumn:'',
      valueColumn:''
    };

    // create empty datasource, we avoid to overwrite already defined values
    // suitable for indicator edition
    _.extend(this.indicator.datasource, emptyDataSource);

    this.submitted = true; 
    this.indicator.performanceComparison = +(this.comparison as number);

    return this.indicatorService.save(this.indicator)
      
      .subscribe(
        (data:any) => { 
        },
        (error:any) => {
            console.log('error', error);
        },
        () =>{
            this.router.navigateByUrl('/dashboard');
        }
      );
  }
  get diagnostic() { 
    return JSON.stringify(this.indicator); 
  }
}