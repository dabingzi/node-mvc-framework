const routers=[
    {
        match:'/',
        method: 'get',
        controller:'home.indexPage',
        middlewares:['parseMe']
    }
]

module.exports = routers

