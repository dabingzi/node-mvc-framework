const koa = require("koa");
const ControllerLoader = require('./loader/findcontroller');
const ServiceLoader = require('./loader/findServers');
const routerConfig = require('../routers')
const path = require('path');

class App extends koa {
    constructor(options={}){
      super();
      this.opts= options // 以后中间件以对象的形式提供
      const projectRoot = process.cwd();
      this.rootControllerPath =  path.join(projectRoot, 'controller'); 
      this.rootServicePath =  path.join(projectRoot, 'services'); 
      this.initService()
      this.initController()
      this.initMiddleWare()
    }
    initMiddleWare(){
        const {routers,parasMe}=this.opts;
        this.use(routers(routerConfig))
        this.use(parasMe)
    }
    initController() {
        this.controllerLoader = new ControllerLoader(this.rootControllerPath);
    }
    initService() {
        this.serviceLoader = new ServiceLoader(this.rootServicePath);
    }
   createContext(req, res) {
    const context = super.createContext(req, res);
    // 注入全局方法
    this.injectUtil(context);

    // 注入Services
    this.injectService(context);
    return context
  }

  injectUtil(context) {
    Object.defineProperty(context, 'setData', {
      get() {
        return function (data) {
          Object.assign(context.state.global, data)
        }
      }
    })
  }

  injectService(context) {
    const serviceLoader = this.serviceLoader;
    // 给context添加services对象
    Object.defineProperty(context, 'services', {
      get() {
        return serviceLoader.getServices(context)
      }
    })
  }


}

module.exports = App