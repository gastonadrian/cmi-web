var routes={
    
    routes:{
        prefix: '/api',
        pin:    'role:api,path:*',
        map: {
            dashboard: { GET:true, suffix:'/:from?/:to?' },
            datasources: { POST: true, GET:true },
            indicators: { POST: true },
            indicatorsdata: {POST:true}
        }
    }
};

module.exports = routes;