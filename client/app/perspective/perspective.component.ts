import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { PerspectiveService } from './../shared/services/';
import { Perspective } from './../shared/models/perspective';

@Component({
  moduleId: module.id,
  selector: 'perspective-configure',
  templateUrl: 'perspective.template.html'
})
export class PerspectiveComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  private htmlElement: HTMLElement;
  public perspectives: Array<any> = new Array<any>();
  private newGoal:any = {
    title:'',
    status:3
  };

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public perspectiveService: PerspectiveService) { 
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }

  private getRandomInt(min:number, max:number):number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  ngOnInit(){
    this.perspectiveService.get()
      .subscribe((data:Array<Perspective>) => {        
        for(var i=0; i < data.length; i++){

          var goals:any = [];
          for(var j=0; j < data[i].goals.length; j++){
             goals.push({
                id: data[i].goals[j].id,
                title:data[i].goals[j].title,
                status: this.getRandomInt(1,3)
             });
          }
          goals.push(this.newGoal);

          this.perspectives.push({
            id: data[i].id,
            title: data[i].title,
            goals: goals
          });
        }

     });
  }
}