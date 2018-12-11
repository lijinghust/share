const jwt = require('jsonwebtoken');
const config = require('../config.js');

module.exports = async function(ctx, next){
    // console.log('params',ctx.params)
    const token = ctx.cookies.get('token');
    // console.log('token=',token)
    if(token){
        let tokenContent;
        try{
            tokenContent = await jwt.verify(token, config.token.secret);

        }catch(e){
            // ctx.throw('401', 'invalid token');
            ctx.status = 200;
            ctx.body = {
                errno: 1,
                msg: 'invalid token'
            }
            console.log('invalid token')
        }
        // console.log('tokencotent',tokenContent)
        if(tokenContent && tokenContent.exp >= new Date()/1000){
            const params = ctx.params;
            const body = ctx.request.body;
            
            if((tokenContent.phonenumber && (tokenContent.phonenumber == params.phonenumber || tokenContent.phonenumber == body.phonenumber)) || (tokenContent.userid && (tokenContent.userid == params.userid || tokenContent.phonenumber == body.phonenumber))){
                // 权限校验正确，交给下一个中间件处理
                return next()
            }else{
                ctx.status = 200;
                ctx.body = {
                    errno: 1,
                    msg: 'token不匹配'
                }
            }
        }else if(tokenContent){
            ctx.status = 200;
            ctx.body = {
                errno: 1,
                msg: 'token已过期'
            }
        }
    }else{
        ctx.status = 200;
        ctx.body = {
            errno: 1,
            msg: 'token不存在'
        }
    }
}