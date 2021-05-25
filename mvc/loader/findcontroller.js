const glob = require('glob');
const path = require('path');

const controllerMap = new Map(); // 缓存文件名和对应的路径
const controllerClass = new Map(); // 缓存文件名和对应的require对象


class ControllerLoader {
    constructor(controllerPath) {
      this.loadFiles(controllerPath).forEach(filepath => {
        const basename = path.basename(filepath);
        const extname = path.extname(filepath);
        const fileName = basename.substring(0, basename.indexOf(extname));
  
        if (controllerMap.get(fileName)) {
          throw new Error(`controller文件夹下有${fileName}文件同名!`)
        } else {
          controllerMap.set(fileName, filepath);
        }
      })
    }
  
    loadFiles(target) {
      const files = glob.sync(`${target}/**/*.js`)
      return files
    }
  
    getClass(name) {
      if (controllerMap.get(name)) {
        if (!controllerClass.get(name)) {
          const c = require(controllerMap.get(name));
          controllerClass.set(name, c);
        }
        return controllerClass.get(name);
      } else {
        throw new Error(`controller文件夹下没有${name}文件`)
      }
    }
  
  }
  
  module.exports = ControllerLoader