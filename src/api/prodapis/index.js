import * as handlers from './handlers';

let routes = [
  {
    method: 'GET',
    path: '/loop',
    handler: handlers.loop,
  },
  {
    method: 'POST',
    path: '/csv2json',
    handler: handlers.csv2JsonHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
      },
    },
  },
  {
    method: 'GET',
    path: '/offers',
    handler: handlers.offers,
  },
  {
    method: 'GET',
    path: '/user-wallet/{userId}',
    handler: handlers.getUserWallet,
  },
  {
    method: 'POST',
    path: '/user-wallet',
    handler: handlers.addUserWallet,
  },
  {
    method: 'PUT',
    path: '/user-wallet/{userId}',
    handler: handlers.updateUserWallet,
  },
  {
    method: 'DELETE',
    path: '/user-wallet/{userId}',
    handler: handlers.deleteUserWallet,
  },
  {
    method: 'POST',
    path: '/query',
    handler: handlers.query,
  },
];

export default routes;
