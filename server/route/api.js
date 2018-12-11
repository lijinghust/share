const router = require('koa-router')({
    prefix: '/api'
});
// const checkToken = require('../middleware/checkToken.js');

const proxyController = require('../controller/proxy.js');


// qiniu token proxy
// router.get('/token', checkToken, proxyController["POST token"]);
router.get('/proxy', proxyController["POST proxy"]);


module.exports = router;