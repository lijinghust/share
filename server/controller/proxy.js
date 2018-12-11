const request = require('request');

const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxd5dc964c75491502&secret=b4de8fd7623a0f2d7c7fedd724304ea7';

const getData = function(ctx){
    return new Promise(function(resolve, reject){
        request.post({url: url}, function(err, res, body){
            if(err){
                reject(err)
            }
            resolve(body);
        })    
    })
}

const proxy = async function(ctx, next){
    const ret = await getData(ctx);

    console.log(ret)
    ctx.response.body = ret;

}


module.exports = {
    'POST proxy': proxy
}