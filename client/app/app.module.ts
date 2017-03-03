import { BrowserModule, Title  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/line-chart';
import { GaugeChartComponent } from './gauge-chart/gauge-chart';
import { HttpModule } from '@angular/http';

import { GoalService, IndicatorService, PerspectiveService, DashboardService, DataPeriodService, WindowRef, UserService, AuthGuard, IndicatorDataService } from './shared/services/';

import { DashboardComponent } from './dashboard/dashboard';
import { DashboardPerspectiveComponent } from './dashboard/dashboard-perspective.component';
import { GoalComponent } from './goal/goal.component';
import { IndicatorGridComponent } from './indicator/indicator-grid.component';
import { IndicatorCreateComponent } from './indicator/indicator-create.component';
import { SemaphoreComponent } from './semaphore/semaphore.component';
import { GoalCreateComponent } from './goal/goal-create.component';
import { PerspectiveComponent } from './perspective/perspective.component';
import { UserCreateComponent } from './user/user-create.component';
import { IndicatorListComponent } from './indicator/indicator-list.component';
import { UserListComponent } from './user/user-list.component';
import { IndicatorExpectedComponent } from './indicator/indicator-expected.component';


import { GoalResolver } from './shared/services/goal-route-resolver';
import { IndicatorGridResolver } from './shared/services/indicator-grid-route-resolver';
import { DashboardResolver } from './shared/services/dashboard-route-resolver';
import { PerspectiveResolver } from './shared/services/perspective-resolver';
import { IndicatorResolver } from './shared/services/indicator-resolver';
import { IndicatorEditResolver } from './shared/services/indicator-edit-resolver';
import { UserListResolver } from './shared/services/user-list-resolver';
import { IndicatorDataResolver } from './shared/services/indicator-data-resolver';

const appRoutes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    data:{
      title:'Cuadro de Mando Integral',
      description:'Ve el estado de tus indicadores',
      showPeriods:true
    },
    resolve:{
      perspectives: DashboardResolver
    }    
  },
  { 
    path: 'goals/details/:goalid', 
    component: GoalComponent,
    data:{
      title:'Detalle de Objetivos',
      description:'',
      showPeriods:true      
    },
    resolve:{
      goal: GoalResolver
    },
    children: [
      { 
        path: 'indicators/:indicatorid', 
        component: IndicatorGridComponent,
        resolve:{
          indicator: IndicatorGridResolver
        }
      },
    ]
  },
  { 
    path: 'indicators/create', 
    component: IndicatorCreateComponent,
    data:{
      title:'Crear Indicador',
      description:'Configuraci&oacute;n de Indicador',
      showPeriods:false      
    }
  },
  { 
    path: 'indicators/edit/:indicatorid', 
    component: IndicatorCreateComponent,
    data:{
      title:'Editar Indicador',
      description:'Configuraci&oacute;n de Indicador',
      showPeriods:false      
    },
    resolve:{
      indicator:IndicatorEditResolver
    }
  },  
  { 
    path: 'indicators/list', 
    component: IndicatorListComponent,
    data:{
      title:'Indicadores',
      description:'',
      showPeriods:false      
    },
    resolve:{
      indicators: IndicatorResolver
    }
  }, 
  { 
    path: 'indicators/expected/:indicatorid', 
    component: IndicatorExpectedComponent,
    data:{
      title:'Indicadores',
      description:'Ingresar valores esperados',
      showPeriods:false      
    },
    resolve:{
      indicatorsdata: IndicatorDataResolver
    }
  },      
  { 
    path: 'semaphore/configure', 
    component: SemaphoreComponent,
    data:{
      title:'Sem&aacute;foro',
      description:'Configuraci&oacute;n de Semaforo',
      showPeriods:false
    }
  },
  { 
    path: 'goals/configure/:goalid', 
    component: GoalCreateComponent,
    data:{
      title:'Objetivos',
      description:'Configurar'
    },
    resolve:{
      goal: GoalResolver,
      perspectives: PerspectiveResolver,
      indicators: IndicatorResolver
    }    
  },
  { 
    path: 'perspectives', 
    component: PerspectiveComponent,
    data:{
      title:'Perspectivas',
      description:'Configurar',
      showPeriods:false
    }
  },  
  { 
    path: 'users/create', 
    component: UserCreateComponent,
    canActivate: [AuthGuard],
    data:{
      title:'Crear Usuario',
      description:'Creaci&oacute;n de Usuario',
      showPeriods:false,
      onlyAdmin:true
    }
  }, 
  { 
    path: 'users/list', 
    component: UserListComponent,
    canActivate: [AuthGuard],    
    data:{
      title:'Usuarios',
      description:'',
      showPeriods:false      
    },
    resolve:{
      users: UserListResolver
    }
  },      
  { 
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    GoalComponent,
    DashboardComponent,
    IndicatorGridComponent,
    IndicatorCreateComponent,
    SemaphoreComponent,
    GoalCreateComponent,
    PerspectiveComponent,
    GaugeChartComponent,
    DashboardPerspectiveComponent,
    UserCreateComponent,
    IndicatorListComponent,
    UserListComponent,
    IndicatorExpectedComponent    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    GoalService,
    Title, 
    GoalResolver, 
    IndicatorService, 
    IndicatorGridResolver,
    PerspectiveService,
    DashboardResolver,
    DashboardService,
    DataPeriodService,
    WindowRef,
    UserService,
    AuthGuard,
    PerspectiveResolver,
    IndicatorResolver,
    IndicatorEditResolver,
    UserListResolver,
    IndicatorDataResolver,
    IndicatorDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }