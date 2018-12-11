const router = require("koa-router")();
const path = require('path');
const fs = require("fs");


router.get(['/', '/index'], async ctx => {
    await ctx.render('index', {
        userinfo: {
            name: 'lj',
            sex: 'male'
        }
    })
})

router.get('/404', async ctx => {

    await ctx.render('404');
})

module.exports = router;
