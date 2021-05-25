const App = require('./mvc/index')
const parasMe= require('./middlewares/parseMe')
const routers =require('./middlewares/router')


console.log(typeof parasMe)
const app = new App({
    routers,
    parasMe,
})

app.listen(4001,()=>{
    console.log('app start at localhost:4001')
})
