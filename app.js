let Path = require('path');
const Hapi = require('hapi');
const hapiAuthJWT2 = require('hapi-auth-jwt2');
const inert = require('inert');
require('env2')('./.env.prod');
const config = require('./config');
var Logger = require('./utils/logger');
const routesHelloHapi = require('./routes/hello-hapi');
const routesUsers = require('./routes/users');
const routesUpload = require('./routes/upload');
const routesOcr = require('./routes/ocr');
const routesNotes = require('./routes/notes');
const routesFile = require('./routes/file');


const pluginHapiSwagger = require('./plugins/hapi-swagger');
const pluginHapiPagination = require('./plugins/hapi-pagination');
const pluginHapiAuthJWT2 = require('./plugins/hapi-auth-jwt2');

var logger = Logger.getLogger('app');

const server = new Hapi.Server();
// 配置服务器启动host与端口
server.connection({
  port: config.port,
  host: config.host,
});

const init = async () => {
  // 注册插件
  await server.register([
    ...pluginHapiSwagger,
    pluginHapiPagination,
    hapiAuthJWT2,
    inert,
  ]);
  pluginHapiAuthJWT2(server);
  // 注册路由
  server.route([
    // 创建一个简单的hello hapi接口
    ...routesHelloHapi,
    ...routesUsers,
    ...routesUpload,
    ...routesOcr,
    ...routesNotes,
    ...routesFile,
   
  ]);
  // 启动服务
  await server.start();

  console.log(`Server running at: ${server.info.uri}`);
};

init();