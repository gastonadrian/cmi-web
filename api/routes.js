var routes={
    
    routes:{
        prefix: '/api',
        pin:    'role:api,path:*',
        map: {
            dashboard: { 
                GET:true, 
                suffix:'/:from?/:to?',
                secure: {
                    fail: '/login'
                } 
            },
            perspectives: { 
                GET:true, 
                POST:true,
                secure: {
                    fail: '/login'
                } 
            },
            goals:{
                GET:true,
                suffix:'/:goalId',                
                secure:{
                    fail: '/login'
                }
            },
            goalcreate: {
                POST:true,
                secure:{
                    fail: '/login'
                }
            },
            goalupdate: {
                POST:true,
                secure:{
                    fail: '/login'
                }
            },
            goalremove:{
                POST:true,
                suffix:'/:goalId',
                secure:{
                    fail: '/login'
                }
            },   
            goalindicator:{
                POST:true,
                secure:{
                    fail:'/login'
                }
            },
            goalindicatorremove:{
                POST:true,
                secure:{
                    fail:'/login'
                }
            },
            indicatorsgetall:{
                GET:true,
                secure:{
                    fail:'/login'
                }
            },              
            indicators: { 
                GET:true, 
                suffix:'/:indicatorId',
                secure: {
                    fail: '/login'
                }                 
            },
            indicatorcreate:{
                POST:true,
                secure: {
                    fail: '/login'
                }                                
            },
            indicatorexpectation:{
                POST:true,
                suffix: '/:indicatorId',
                secure:{
                    fail: '/login'
                }
            },
            indicatorsgetsync:{
                GET:true,
                secure:{
                    fail: '/login'
                }
            },
            datasources: { 
                POST: true, 
                GET:true,
                secure: {
                    fail: '/login'
                }                
            },            
            indicatorsdata: {
                POST:true,
                secure: {
                    fail: '/login'
                }                 
            },
            indicatorsdatagetall:{
                GET:true,
                suffix:'/:indicatorId',
                secure: {
                    fail: '/login'
                }                
            },
            updateindicatordata:{
                POST:true,
                suffix:'/:indicatorId',
                secure: {
                    fail: '/login'
                }                 
            },
            indicatorsdatasource: { 
                POST: true,
                secure: {
                    fail: '/login'
                }                
            },
            customers:{
                GET:true,
                POST:true,
                secure: {
                    fail: '/login'
                }                
            },
            login: { 
                POST:true,
                auth: {
                    strategy: 'local',
                    successReturnTo: '/'
                }      
            }
        }
    }
};

module.exports = routes;