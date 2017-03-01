import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';

import { PerspectiveService } from './../shared/services/';
import { GoalService } from './../shared/services';

import { PerspectiveApiResult } from './../../../api/models/api/perspective';
import { GoalApiResult } from './../../../api/models/api/goal';


@Component({
  moduleId: module.id,
  selector: 'perspective-configure',
  templateUrl: 'perspective.template.html'
})
export class PerspectiveComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  private htmlElement: HTMLElement;
  public perspectives: Array<PerspectiveApiResult> = [];
  public newGoals:Array<string> = [];

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public perspectiveService: PerspectiveService,
    public goalService: GoalService) { 
    
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }

  addGoal(perspectiveIndex: number){
    let goalTitle:string = this.newGoals[perspectiveIndex];
    if(!goalTitle || !goalTitle.length){
      return;
    }

    let goal:GoalApiResult = new GoalApiResult();
    goal.title = goalTitle;
    goal.perspectiveId = this.perspectives[perspectiveIndex]._id;
    // save
    this.goalService.save(goal)
      .subscribe(
        (goalId:any) => { 
          goal._id = goalId;
          this.perspectives[perspectiveIndex].goals.unshift(goal);
        },
        (error:any) => {
            console.log('error', error);
        }
      );
  }
  deleteGoal(goal:GoalApiResult, perspectiveIndex:number, goalIndex:number){
    if(!goal._id){
      return;
    }

    this.goalService.delete(goal)
      .subscribe(
      (ok:any) => { 
          if(ok){
            this.perspectives[perspectiveIndex].goals.splice(goalIndex,1);
          }
        },
        (error:any) => {
            console.log('error', error);
        }
      );
  }

  ngOnInit(){
    this.perspectiveService.get()
      .subscribe((data:Array<PerspectiveApiResult>) => {        
        for(var i=0; i < data.length; i++){
          let tmpGoal:GoalApiResult = new GoalApiResult();
          tmpGoal.perspectiveId = data[i]._id;
          data[i].goals.push(tmpGoal);
        }
        this.perspectives = data;
     });
  }


  save():void{
    this.perspectiveService.save(this.perspectives)
        .subscribe(
      (ok:any) => { 
          if(ok){
            this.router.navigateByUrl('/dashboard');
          }
        },
        (error:any) => {
            console.log('error', error);
        }
      );
  }
}