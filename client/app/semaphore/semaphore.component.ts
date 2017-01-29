import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'semaphore.component',
  templateUrl: 'semaphore.template.html'
})
export class SemaphoreComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  private htmlElement: HTMLElement;

  constructor( 
    private route: ActivatedRoute,
    private router: Router) { 
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
     });
  }
}