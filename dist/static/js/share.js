;(function(){
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign != 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target/*, varArgs*/) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
    // 一个简单的ajax get请求的服务
    var ajax = function(url,success, fail){
        var xhr = new XMLHttpRequest(); // 创建ajax对象，不兼容ie6
        
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200){
                    var json = JSON.parse(xhr.responseText);
                    success && success(json);
                }else{
                    fail && fail();
                }            
            }
        }
        xhr.send();
    };

    window.bbtShare = (function(){
        var isInWechat = !!navigator.userAgent.match(/MicroMessenger\/([\d]+)/),
            isInApp = /lama/.test(navigator.userAgent.toLowerCase()) ||
                        /pregnancy/.test(navigator.userAgent.toLowerCase()),
            isInQQ = !!navigator.userAgent.match(/QQ\/([\d]+)/);


        var wxjsUrl = '//res.wx.qq.com/open/js/jweixin-1.4.0.js',
            qqApiUrl = '//open.mobile.qq.com/sdk/qqapi.js',
            nativejsUrl = '//static02.babytreeimg.com/img/bca/native/0.1.4/native.min.js';


        var defaultOptions = {
            title: '宝宝树',
            content: '全球最大的母婴育儿网站',
            url: 'https://m.babytree.com/',
            imageUrl: 'https://pic05.babytreeimg.com/img/header_footer/logo-201610.png',
            timelineTitle: '宝宝树 - 全球最大的母婴育儿网站',
        };

        // 加载js脚本
        function loadjs(url, success, fail) {
            var script = document.createElement('script');
            script.onload = function(){
                success();
            };
            script.onerror = function(){
                fail();
            };
            script.async = true;
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
        /**
         * Compare versions (only number)
         * @param v1
         * @param v2
         * @returns {
         *  1: v1 > v2
         *  0: v1 == v2
         *  -1: v1 < v2
         *  }
         */
        function compareVersions(v1, v2){
            var v1Parts = v1.split('.');
            var v2Parts = v2.split('.');
            for (var i = 0; i < v2Parts.length; i++) {
                var a = parseInt(v2Parts[i], 10) || 0;
                var b = parseInt(v1Parts[i], 10) || 0;
                if (a > b) { return -1; }
                if (a < b) { return 1; }
            }
            return 0;
        }
        /**
         * 微信分享
         * 微信JS-SDK说明文档:https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
         * @param options 
         */
        function _initWechat(options){
            if(window.wx){
                init();
            }else{
                loadjs(wxjsUrl, function(){
                    init();
                })
            }

            // 原有的 wx.onMenuShareTimeline、wx.onMenuShareAppMessage、wx.onMenuShareQQ、wx.onMenuShareQZone 接口，即将废弃。
            // 请尽快迁移使用客户端6.7.2及JSSDK 1.4.0以上版本支持的 wx.updateAppMessageShareData、updateTimelineShareData 接口。
            var isNewWechat = (function check() {
                // android 6.7.2 有问题
                var match = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i);
                if (!match) {
                    return false;
                }
                if (match.length === 2) {
                    var version = match[1];
                    return compareVersions(version, '6.7.2') > -1;
                }
                return false;
            }());
            function setWechatShare(opts){
                var jsApiList = [];
                if (isNewWechat) {
                    jsApiList = [
                        'updateAppMessageShareData',
                        'updateTimelineShareData',
                        'onMenuShareWeibo',
                    ];
                } else {
                    jsApiList = [
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                    ];
                }
                opts.jsApiList = jsApiList;
                wx.config(opts);
                wx.ready(function(){
                    var shareInfo = {
                        title: options.title,
                        desc: options.content,
                        link: options.url,
                        imgUrl: options.imgUrl
                    }
                    if (isNewWechat) {
                        wx.updateTimelineShareData(shareInfo);
                        wx.updateAppMessageShareData(shareInfo);
                    } else {
                        wx.onMenuShareTimeline(shareInfo);
                        wx.onMenuShareAppMessage(shareInfo);
                        wx.onMenuShareQQ(shareInfo);
                        wx.onMenuShareQZone(shareInfo);
                    }
                    wx.onMenuShareWeibo(shareInfo);
                });
            }
            // 获取微信验签数据
            function requestSign(cb){
                var localUrl = location.href.split('#')[0];
                var apiUrl = 'http://ws.erzhe.net/api/proxy';
                var url = apiUrl + '?url=' + encodeURIComponent(localUrl) + '&_t=' + new Date().getTime();
                ajax(url, cb)
            }
            function init(){
                requestSign(function(data){
                    var opts = {
                        appId: data.appId,
                        timestamp: data.timestamp,
                        nonceStr: data.noncestr,
                        signature: data.signature
                    }
                    setWechatShare(opts);
                })            
            }

        }
        /**
         * QQ分享
         * QQsdk说明文档：http://open.mobile.qq.com/api/mqq/index#api:setShareInfo
         * @param data 
         */
        function _initQQ(options) {
        
            function setQQShare() {
                var shareInfo = {
                    title: options.title,
                    desc: options.content,
                    share_url: options.url,
                    image_url: options.imageUrl,
                };
                try {
                    window.mqq.invoke('data', 'setShareInfo', shareInfo);
                } catch (e) {
                    console.error(e);
                }
            }
        
            if (window.mqq) {
                setQQShare();
            } else {
                loadjs(qqApiUrl, function(){
                    setQQShare();
                })
            }
        }

        /**
         * 在app中分享
         * @param options 
         */
        function _initNative(options){
            function setNativeShare(){
                var shareInfo = {
                    url: options.url,
                    title: options.title,
                    content: options.content,
                    imageUrl: options.imageUrl,
                };
                bbtNative.setShareContent(shareInfo);
                bbtNative.showShareButton();
            }

            if(window.bbtNative){
                setNativeShare();
            }else{
                loadjs(nativejsUrl, function(){
                    setNativeShare();
                })
            }

        }

        function setShareInfo(opts){
            Object.assign(defaultOptions, opts);

            isInWechat && _initWechat(defaultOptions);
            isInQQ && _initQQ(defaultOptions);
            isInApp && _initNative(defaultOptions);
        }

        return {
            setShareInfo: setShareInfo
        }
    })();

})();