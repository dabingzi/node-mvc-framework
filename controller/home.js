
class Home {

   async indexPage(ctx){
       console.log('执行到controller文件了')
       const jsonRes= await ctx.services.homeData.getList();
       ctx.body=jsonRes
    }
}

module.exports = Home