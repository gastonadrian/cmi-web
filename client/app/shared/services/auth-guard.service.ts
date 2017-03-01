import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { AppSettings } from './../models/shared';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  canActivate() {
    return AppSettings.admin;
  }

  canActivateChild() {
    console.log('checking child route access');
    return true;
  }

}