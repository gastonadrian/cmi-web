import { BrowserModule, Title  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/line-chart';
import { GaugeChartComponent } from './gauge-chart/gauge-chart';
import { HttpModule } from '@angular/http';

import { GoalService, IndicatorService, PerspectiveService, DashboardService, DataPeriodService } from './shared/services/';

import { DashboardComponent } from './dashboard/dashboard';
import { DashboardPerspectiveComponent } from './dashboard/dashboard-perspective.component';
import { GoalComponent } from './goal/goal.component';
import { IndicatorGridComponent } from './indicator/indicator-grid.component';
import { IndicatorCreateComponent } from './indicator/indicator-create.component';
import { SemaphoreComponent } from './semaphore/semaphore.component';
import { GoalCreateComponent } from './goal/goal-create.component';
import { PerspectiveComponent } from './perspective/perspective.component';

import { GoalResolver } from './shared/services/goal-route-resolver';
import { IndicatorGridResolver } from './shared/services/indicator-grid-route-resolver';
import { DashboardResolver } from './shared/services/dashboard-route-resolver';


const appRoutes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    data:{
      title:'Cuadro de Mando Integral',
      description:'Ve el estado de tus indicadores'
    },
    resolve:{
      perspectives: DashboardResolver
    }    
  },
  { 
    path: 'goals/:goalid', 
    component: GoalComponent,
    data:{
      title:'Detalle de Objetivos',
      description:''
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
      description:'Configuraci&oacute;n de Indicador'
    }
  },
  { 
    path: 'semaphore/configure', 
    component: SemaphoreComponent,
    data:{
      title:'Sem&aacute;foro',
      description:'Configuraci&oacute;n de Semaforo'
    }
  },
  { 
    path: 'goalscreate', 
    component: GoalCreateComponent,
    data:{
      title:'Objetivos',
      description:'Crear'
    }
  },
  { 
    path: 'perspectives/configure', 
    component: PerspectiveComponent,
    data:{
      title:'Perspectivas',
      description:'Configurar'
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
    DashboardPerspectiveComponent
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
    DataPeriodService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }