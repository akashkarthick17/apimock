import testRoutes from './testapis'; 
import prodRoutes from './prodapis'; 

let routes = [];
routes.push(...testRoutes, ...prodRoutes);

export default routes;