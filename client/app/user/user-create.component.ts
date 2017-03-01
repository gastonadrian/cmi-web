import * as _ from 'lodash';

import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from './../shared/services/';

// TODO: Mostrar errores
@Component({
  moduleId: module.id,
  selector: 'user-create',
  templateUrl: 'user-create.template.html'
})
export class UserCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  nativeWindow: any;
  private htmlElement: HTMLElement;

  public user: any = {
    nick: '',
    name:'',
    email:'',
    password:'',
    repeat:'',
    admin:false   
  };

  public submitted: Boolean = false;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService) {
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
  }
  
  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
     });
  }
  
  onSubmit(callback?:Function) { 

    this.submitted = true; 
    return this.userService.save(this.user)
      
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
            this.router.navigateByUrl('/dashboard');
        }
      );
  }

}