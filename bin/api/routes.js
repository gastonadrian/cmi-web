var routes = {
    routes: {
        prefix: '/api',
        pin: 'role:api,path:*',
        map: {
            dashboard: { GET: true, suffix: '/:from?/:to?' }
        }
    }
};
module.exports = routes;
//# sourceMappingURL=routes.js.map