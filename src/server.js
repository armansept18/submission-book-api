const Hapi = require('@hapi/hapi');
const routes = require('./routes/books');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      status: 'success',
      message: 'Welcome to Bookshelf API! \n Go to route /books',
    }),
  });
  server.route(routes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
