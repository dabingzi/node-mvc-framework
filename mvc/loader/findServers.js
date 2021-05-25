const path = require('path');
const glob = require('glob');

const serviceMap = new Map();
const serviceClass = new Map();
const services = {};

class ServiceLoader {
  constructor(servicePath) {
    this.loadFiles(servicePath).forEach(filepath => {
      const basename = path.basename(filepath);
      const extname = path.extname(filepath);
      const fileName = basename.substring(0, basename.indexOf(extname));

      if (serviceMap.get(fileName)) {
        throw new Error(`servies文件夹下有${fileName}文件同名!`)
      } else {
        serviceMap.set(fileName, filepath);
      }


      const _this = this;
      Object.defineProperty(services, fileName, {
        get() {
          if (serviceMap.get(fileName)) {
            if (!serviceClass.get(fileName)) {
              const S = require(serviceMap.get(fileName));
              serviceClass.set(fileName, S);
            }
            const S = serviceClass.get(fileName);
            return new S(_this.context);
          }
        }
      })

    });
  }

  loadFiles(target) {
    const files = glob.sync(`${target}/**/*.js`)
    return files
  }

  getServices(context) {
    this.context = context;
    return services;
  }

}

module.exports = ServiceLoader