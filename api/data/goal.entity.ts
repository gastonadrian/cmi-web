import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';

import { MongoGoal } from './../models/mongo/goal';

export class GoalDataService{

    constructor(){}
    static getGoals(customerId:string, active:Boolean):Promise<Array<MongoGoal>>{

        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goals',
            query: {
                customerId:customerId,
                active:active
            }
        };
        
        return mongoControl.find(findParams);


        // return[
            // {
            //     id: 1,
            //     customerId:22,
            //     title: 'Crecimiento de ingresos y carteras de clientes',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 2,
            //     title: 'Utilizaci&oacute;n de inversiones y activos',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }            
            // },
            // {
            //     id: 3,
            //     title: 'Reducci&oacute;n de costes y mejora de la productividad',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 4,
            //     title: 'Crear valor para el accionista',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 5,
            //     title: 'Reducir la morosidad',
            //     perspective:1,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     } 
            // }
            // {
            //     id: 6,
            //     title: 'Cuota de mercado',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 7,
            //     title: 'Retenci&oacute;n y fidelizaci&oacute;n de clientes',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 8,
            //     title: 'Adquisici&oacute;n de nuevos clientes',
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 9,
            //     title: 'Satisfacci&oacute;n del cliente',
            //     indicators: [],
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 10,
            //     title: 'Rentabilidad',
            //     indicators: [],
            //     perspective:2,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 11,
            //     title: 'Capacidad del personal',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 12,
            //     title: 'Utilizaci&oacute;n de inversiones y activos',
            //     indicators: [],
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 13,
            //     title: 'Motivaci&oacute;n y alineamiento',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 14,
            //     title: 'Reducir bajas laborales',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 15,
            //     title: 'Mejorar la formaci&oacute;n',
            //     perspective:3,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // new MongoGoal(
            //     '16',
            //     customerId,
            //     'Proceso de operaciones',
            //     '4',
            //     0.30,
            //     0.59)
            // {
            //     id: 17,
            //     title: 'Proceso de servicio postventa',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 18,
            //     title: 'Mejorar relaci&oacute;n con distribuidor',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 19,
            //     title: 'Gestionar recursos internos',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // },
            // {
            //     id: 20,
            //     title: 'Renovaci&oacute;n de maquinaria',
            //     perspective:4,
            //     semaphore:{
            //         redUntil:30,
            //         yellowUntil:59                    
            //     }
            // }            
        // ];
    }

    static insertGoal(goal:MongoGoal):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'goals',
            data: [goal]
        };
        return mongoControl.insert(params);
    }

}