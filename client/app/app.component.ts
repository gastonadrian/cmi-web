import { Component, OnInit } from '@angular/core';
import { Router, 
    ActivatedRoute, 
    Params, 
    NavigationEnd, 
    Resolve } from '@angular/router';
import { Title }     from '@angular/platform-browser';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent{
  public title:string;
  public routeDescription:string;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) { 
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd) {
        this.title = this.router.routerState.root.firstChild.data['value']['title'];
        this.routeDescription = this.router.routerState.root.firstChild.data['value']['description'];
        this.titleService.setTitle(this.title); 
        this.title = `${this.title} <small>${this.routeDescription}</small>`; 
      }
    });    

  }


}