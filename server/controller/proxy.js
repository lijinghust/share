const request = require('request');
const sha1 = require('sha1');

const APPID = 'wxd5dc964c75491502';
const getWechatAccessToken = function(){
    const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ APPID +'&secret=b4de8fd7623a0f2d7c7fedd724304ea7';
    return new Promise(function(resolve, reject){
        request.post({url: url}, function(err, res, body){
            if(err){
                reject(err)
            }
            resolve(body);
            console.log('access_token', body)
        })    
    })
}
const getJsApiTicket = async function(){
    const ret = await getWechatAccessToken();
    const json = JSON.parse(ret);
    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${json.access_token}&type=jsapi`;
    return new Promise(function(resolve, reject){
        request.post({url: url}, function(err, res, body){
            if(err){
                reject(err);
            }
            resolve(body);
        })
    })
}

const sign = async function(url){
    const ret = await getJsApiTicket();
    const noncestr = Math.random().toString(36).substring(2);
    const json = JSON.parse(ret);
    const jsapi_ticket = json.ticket;
    const timestamp = +new Date();
    const str = [
        'jsapi_ticket='+jsapi_ticket,
        'noncestr='+noncestr,
        'timestamp='+timestamp,
        'url='+url
    ].join('')

    const signature = sha1(str);
    return {
        appId: APPID,
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

const proxy = async function(ctx, next){
    const params = ctx.params;
    // const ret = await getJsApiTicket();
    const ret = await sign(params.url);
    // console.log(ret)
    ctx.response.body = ret;

}


module.exports = {
    'POST proxy': proxy
}