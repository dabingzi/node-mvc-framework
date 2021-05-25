const Router = require('koa-router');
const koaCompose = require('koa-compose');
const ControllerLoader =require('../mvc/loader/findcontroller')
console.log(ControllerLoader.prototype.getClass)
module.exports=(routerConfig)=>{
  const router = new Router();

  if(routerConfig&&routerConfig.length>0){
    routerConfig.forEach((routerInfo) => {
        let { match, method = 'get', controller, middlewares } = routerInfo;
        let args = [match];

        if(!method||method==='*'){method='all' };
        // if(middlewares instanceof Array && middlewares.length>0){
        //     args=args.concat(middlewares)
        // };
        controller && args.push(async (context, next) => {
            // Todo 找到controller
            const arr = controller.split('.');
            if (arr && arr.length) {
                const controllerName = arr[0]; // home
                const controllerMethod = arr[1]; // index
                const controllerClass = ControllerLoader.prototype.getClass(controllerName); // 通过loader获取class
                // controller每次请求都要重新new一个，因为每次请求context都是新的
                // 传入context和next
                const controller = new controllerClass(context, next);
                if (controller && controller[controllerMethod]) {
                    // console.log('helloisyou')
                  await controller[controllerMethod](context, next);
                }
              } else {
                await next();
              }
          });

          // 很多人对上面着一段不甚明白，其实就是顺序构建了一个
           //const args = ['/', middleware1, middleware2, async (context, next) => {
           //   await home.indexPage(context, next);
           //}];
           // 最后使用apply
           //router[method].apply(router, args)  

          if (router[method] && router[method].apply) {
            // apply的妙用
            // router.get('/demo', fn1, fn2, fn3);
             router[method].apply(router, args)
          }
    })
  }
  return koaCompose([router.routes(), router.allowedMethods()])
}