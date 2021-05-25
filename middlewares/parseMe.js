

const parasMe = () =>{
  return async (context,next)=>{
    console.log('中间件执行啦',context.url)
    await next()
  }
}

module.exports = parasMe()