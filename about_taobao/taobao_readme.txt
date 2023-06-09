淘宝搜索商品列表 通过接口/资源获取 逻辑反推：
搜索栏目 搜索关键词： 触发 标记为 [SEARCH_GOOD]: https://s.taobao.com/search?q={关键词}(以及其他相关数据(从登录的数据获取)进行搜索)
eg: 'https://s.taobao.com/search?q=6个核桃&imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20230509&ie=utf8'
                                            // encodeURI URI转义
                                            // decodeURI URI解码
1. https://s.taobao.com/search?q=6%E4%B8%AA%E6%A0%B8%E6%A1%83&imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20230509&ie=utf8
通过 [SEARCH_GOOD] 拿到的返回 html页面可以获取相关 关键数据：
1_1:  初始化 Search 并 创建 g_srp_[相关方法](包含：g_srp_init): //g.alicdn.com/??kissy/k/1.4.15/import-style-min.js,tb/tracker/1.0.19/index.js,/tb/tsrp/1.70.29/config.js
1_2:  修改Search配置: Search.config({base:'//g.alicdn.com/tb/tsrp/1.70.29/', ...})
1_3:  html片段： g_page_config 在 g_srp_init 进行初始化 并将 g_page_config 设为null  ===> 加载渲染html
结论： 通过 https://s.taobao.com/search?q={关键词} 进行fetch 把 html片段匹配到 g_page_config 获取出
 其中 g_page_config['mods']['itemlist']['data']['auctions'] 获取 商品列表
eg: actions[0] = {
     "p4p": 1,
     "p4pSameHeight": true,
     "nid": "705796275470",
     "category": "",
     "pid": "",
 "title": "杏人的原味核桃乳植物蛋白饮料200ml*12瓶礼盒箱", // 商品标题
     "raw_title": "杏人的原味核桃乳植物蛋白饮料200ml12瓶礼盒箱",
 "pic_url": "//g-search1.alicdn.com/img/bao/uploaded/i4/imgextrahttps://img.alicdn.com/imgextra/i4/2215545871982/O1CN01C5109x1QVnpM4RxRd_!!2215545871982-0-alimamacc.jpg", // 商品图片
 "detail_url": "https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1813128228&k=1165&e=SXFMJvDMh1%2BXTNDl%2BwaW1HCizkVScP07DdHRlLuaTHaH0s8ghdVPKIXdGV%2BJmwpygEwigWU6vUWQtnuC9qbplbjwf4iypM34y7ZZ9Hs8zpJh2lrIwhaDfM%2FRZH7wOjaWVB6Av8gLPHoYsYRnyJHHy145CUkhqWclfuEmDwf39LqJbAooxlVjVYD6v%2BER3%2BxsKymFqL2DL15Fd3DIUrFso0HPhSjiittsWiiLRpH6qNHKCRXRcnL5qUdB65JLL%2ByWd3gdCKliEujGuLZDvsd50pDVmS4LCaKvrGrkbFdSnExH8chXfjIDBZfEljPEK7C8EaabLxqLdqgcSbm2CR8kYyYxtZrENoL7X6tMY4KT5%2BD3iMKJuuDQfbwkZdaVOMJOdS1rHJW8grewSh01Jdzr%2FhUOSwWYOA2xeLsMpERIhIQywtBdZbDWIZ3VvQjVRLr%2B7VoYMXVqPRl6hN3gBAvNJUu8CqaTX2QvzgXSCaR6SxBPAXzZ7Cl8WFAlUb48AfXj2J3CrTicR1lv5b0rsXoPH7N88B2gDAtlCcvb5MQfjQ3xgxQat4fmPc%2FjVCMX9pldE%2FJ1iRdhwZGmgorE2OC4ySSnf9ifHr6pffMszzQ1alPDFvceKiYT0gdHdR%2BCchDK7nBXls2mVQ5PNfz7tvWP8mDnUWCBJAzH5d37WbOc2FCu3lMQ%2BAtw7qE0dkmw5onoV%2BUlMmXqGj00oNxDcsMaUKbmHEoqrDGNgJQqW1ZNsRLhW%2BmVzQdITDMDQofwKpKdeCWpkhbceRiTz7IbCKPuoZA%2BdIjvV4ifaQZaHeydPEDuI8SpgJV8Bsa2r7AAgAj4n4IWyML%2Fi5CjnY9eVfwMhazrkrGqZXAsz3pxoVL9dXArFyw8Cqu%2Fj%2BY1GH51cVKKnqFh8UxuYSgPr9637lO3S3KAU8lgjoodcXu72HOpl0%2Bkuxud7sC19XnBaLqiLxzk49ENZ1ybEfHAkflEicvfEDGwkFCEQUd%2FeLsMpERIhIT%2BhegYAcI1cA5dq77LUOgTh2hhsUgUlqHsPNI375XV92wHOtzuO%2FJVrWbQvHvFgaVhaQs9b6moZ3pTtMETFnLwAh13rIREZGtKWxtIMKCPlEioWucXwoYYBIxM7VIfhHNoTIDYQIi5Y%2BZkRsQwqWoABqHq9eVXJy0%3D#detail", // 商品详情链接 detail_url
 "view_price": "89.90", // 展示价格
 "view_fee": "0.00", // 快递费用
 "item_loc": "浙江 嘉兴", // 商品来源地
 "view_sales": "12人付款", // 已付款人数展示
     "comment_count": "",
     "user_id": "2215545871982",
 "nick": "杏人的品牌店", // 店铺名称
     "shopcard": {
         "levelClasses": [],
         "isTmall": false,
         "delivery": [],
         "description": [],
         "service": [],
         "encryptedUserId": "UvCIYMF80MFguvFk4vgTT"
     },
     "icon": [{
         "title": "掌柜热卖宝贝",
         "dom_class": "icon-service-remai",
         "position": "1",
         "show_type": "0",
         "icon_category": "baobei",
         "outer_text": "0",
         "html": "",
         "icon_key": "icon-service-remai",
         "trace": "srpservice",
         "traceIdx": 0,
         "innerText": "掌柜热卖宝贝",
         "url": "//re.taobao.com/search?keyword=6%B8%F6%BA%CB%CC%D2&refpid=420432_1006&frcatid=&"
     }],
     "isHideIM": true,
     "isHideNick": false,
     "comment_url": "https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1813128228&k=1165&e=SXFMJvDMh1%2BXTNDl%2BwaW1HCizkVScP07DdHRlLuaTHaH0s8ghdVPKIXdGV%2BJmwpygEwigWU6vUWQtnuC9qbplbjwf4iypM34y7ZZ9Hs8zpJh2lrIwhaDfM%2FRZH7wOjaWVB6Av8gLPHoYsYRnyJHHy145CUkhqWclfuEmDwf39LqJbAooxlVjVYD6v%2BER3%2BxsKymFqL2DL15Fd3DIUrFso0HPhSjiittsWiiLRpH6qNHKCRXRcnL5qUdB65JLL%2ByWd3gdCKliEujGuLZDvsd50pDVmS4LCaKvrGrkbFdSnExH8chXfjIDBZfEljPEK7C8EaabLxqLdqgcSbm2CR8kYyYxtZrENoL7X6tMY4KT5%2BD3iMKJuuDQfbwkZdaVOMJOdS1rHJW8grewSh01Jdzr%2FhUOSwWYOA2xeLsMpERIhIQywtBdZbDWIZ3VvQjVRLr%2B7VoYMXVqPRl6hN3gBAvNJUu8CqaTX2QvzgXSCaR6SxBPAXzZ7Cl8WFAlUb48AfXj2J3CrTicR1lv5b0rsXoPH7N88B2gDAtlCcvb5MQfjQ3xgxQat4fmPc%2FjVCMX9pldE%2FJ1iRdhwZGmgorE2OC4ySSnf9ifHr6pffMszzQ1alPDFvceKiYT0gdHdR%2BCchDK7nBXls2mVQ5PNfz7tvWP8mDnUWCBJAzH5d37WbOc2FCu3lMQ%2BAtw7qE0dkmw5onoV%2BUlMmXqGj00oNxDcsMaUKbmHEoqrDGNgJQqW1ZNsRLhW%2BmVzQdITDMDQofwKpKdeCWpkhbceRiTz7IbCKPuoZA%2BdIjvV4ifaQZaHeydPEDuI8SpgJV8Bsa2r7AAgAj4n4IWyML%2Fi5CjnY9eVfwMhazrkrGqZXAsz3pxoVL9dXArFyw8Cqu%2Fj%2BY1GH51cVKKnqFh8UxuYSgPr9637lO3S3KAU8lgjoodcXu72HOpl0%2Bkuxud7sC19XnBaLqiLxzk49ENZ1ybEfHAkflEicvfEDGwkFCEQUd%2FeLsMpERIhIT%2BhegYAcI1cA5dq77LUOgTh2hhsUgUlqHsPNI375XV92wHOtzuO%2FJVrWbQvHvFgaVhaQs9b6moZ3pTtMETFnLwAh13rIREZGtKWxtIMKCPlEioWucXwoYYBIxM7VIfhHNoTIDYQIi5Y%2BZkRsQwqWoABqHq9eVXJy0%3D&on_comment=1",
 "shopLink": "https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1813128228&k=1133&e=dXqwuxQIlLiXTNDl%2BwaW1HCizkVScP07DdHRlLuaTHaH0s8ghdVPKIXdGV%2BJmwpygEwigWU6vUWSSWEPy5tWzLjwf4iypM34y7ZZ9Hs8zpJh2lrIwhaDfM%2FRZH7wOjaWVB6Av8gLPHoYsYRnyJHHy145CUkhqWclfuEmDwf39LqJbAooxlVjVYD6v%2BER3%2BxsKymFqL2DL15Fd3DIUrFso0HPhSjiittsWiiLRpH6qNHKCRXRcnL5qUdB65JLL%2ByWd3gdCKliEujGuLZDvsd50pDVmS4LCaKvrGrkbFdSnExH8chXfjIDBZfEljPEK7C8EaabLxqLdqgcSbm2CR8kYyYxtZrENoL7X6tMY4KT5%2BD3iMKJuuDQfbwkZdaVOMJOdS1rHJW8grewSh01Jdzr%2FhUOSwWYOA2xeLsMpERIhIQywtBdZbDWIZ8%2BMx3nwpXcI0OJeOBCl0sUVa%2BO%2FwA860HHYaCAnDh5jnEqC7H85%2F0Uq2yJficqJRWRJpEBeyl7uMJT1tVqzK%2F7nxBaAw0xQ8zE1Cz%2FbWwf6Zllu0P4qeH7aW8YijIFx0Q3K0AdkZqq8XTMqQYI1U6bzmDLORlcudBfo4tZU%2FU694jCibrg0H1nGhcNttwuVcSWqw9vh2aL1THEV8cDREJXFcEtSiE7bG5qKt%2Fyn4AOrSZ3qL51d0oyo3K2R7%2BfiycHx7wuAKSDZSlxF0eAeXZCTT7zS0nzz7Kcxso1ojQc02oUXhpxzbnvXga0KLm5d5iLKuXB4vne9T3FH%2FjyOxV3D8psy8nYv6lWH8DAGp8lVhxLudzwMoFhjxrwkCbo%2BhH1%2B32aq%2F45edHhcHD%2FKhV4Jy6%2FEA4g%2BouG6X9nttOigfEEWZXwJK4v%2B6Y9Y%2F2biqNR9GaXYFnN5ffugPzlEDHLvh5T7eQfuymGAHUYW7%2BcQic9oLMwGynJgLVois1sLWXcwRKtoV5y0CNwd6BhtAFAdVyxJ7WRsMg3aAxYX5%2B%2BaSxzSdATgGp5nBkluR8QSSFNBxCgwQLhTR0UgukzfAgPDacrzTVMnpHS4L4uUIGst3pVuSTDKs8LLZInMIpvD3wVA%2FIDdbR8R%2F1N5immu6VRRZf3S7axHR%2BKxsX14wUU%2FTS%2BWGLb74Y%3D", // 店铺链接
     "shopName": "杏人的"
 }
 注： 若涉及切换页面的逻辑 查询较为困难暂不做逻辑查询

2. 通过商品详情链接[detail_url] 进行模拟跳转 --> 重定向一个 item.taobao 的链接 ([detail_url] https://click.simba.taobao.com/cc_im?xxxx -->> [真实detail_url] https://item.taobao.com/item.htm?xxx)
eg: https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1813128228&k=1165&e=SXFMJvDMh1%2BXTNDl%2BwaW1HCizkVScP07DdHRlLuaTHaH0s8ghdVPKIXdGV%2BJmwpygEwigWU6vUWQtnuC9qbplbjwf4iypM34y7ZZ9Hs8zpJh2lrIwhaDfM%2FRZH7wOjaWVB6Av8gLPHoYsYRnyJHHy145CUkhqWclfuEmDwf39LqJbAooxlVjVYD6v%2BER3%2BxsKymFqL2DL15Fd3DIUrFso0HPhSjiittsWiiLRpH6qNHKCRXRcnL5qUdB65JLL%2ByWd3gdCKliEujGuLZDvsd50pDVmS4LCaKvrGrkbFdSnExH8chXfjIDBZfEljPEK7C8EaabLxqLdqgcSbm2CR8kYyYxtZrENoL7X6tMY4KT5%2BD3iMKJuuDQfbwkZdaVOMJOdS1rHJW8grewSh01Jdzr%2FhUOSwWYOA2xeLsMpERIhIQywtBdZbDWIZ3VvQjVRLr%2B7VoYMXVqPRl6hN3gBAvNJUu8CqaTX2QvzgXSCaR6SxBPAXzZ7Cl8WFAlUb48AfXj2J3CrTicR1lv5b0rsXoPH7N88B2gDAtlCcvb5MQfjQ3xgxQat4fmPc%2FjVCMX9pldE%2FJ1iRdhwZGmgorE2OC4ySSnf9ifHr6pffMszzQ1alPDFvceKiYT0gdHdR%2BCchDK7nBXls2mVQ5PNfz7tvWP8mDnUWCBJAzH5d37WbOc2FCu3lMQ%2BAtw7qE0dkmw5onoV%2BUlMmXqGj00oNxDcsMaUKbmHEoqrDGNgJQqW1ZNsRLhW%2BmVzQdITDMDQofwKpKdeCWpkhbceRiTz7IbCKPuoZA%2BdIjvV4ifaQZaHeydPEDuI8SpgJV8Bsa2r7AAgAj4n4IWyML%2Fi5CjnY9eVfwMhazrkrGqZXAsz3pxoVL9dXArFyw8Cqu%2Fj%2BY1GH51cVKKnqFh8UxuYSgPr9637lO3S3KAU8lgjoodcXu72HOpl0%2Bkuxud7sC19XnBaLqiLxzk49ENZ1ybEfHAkflEicvfEDGwkFCEQUd%2FeLsMpERIhIT%2BhegYAcI1cA5dq77LUOgTh2hhsUgUlqHsPNI375XV92wHOtzuO%2FJVrWbQvHvFgaVhaQs9b6moZ3pTtMETFnLwAh13rIREZGtKWxtIMKCPlEioWucXwoYYBIxM7VIfhHNoTIDYQIi5Y%2BZkRsQwqWoABqHq9eVXJy0%3D

 --->>

 https://item.taobao.com/item.htm?id=705796275470&ali_refid=a3_430582_1006:1682628509:N:S8QVcW%2FEhhkwxWCGznUR97ze5fhEt7cd:edbd19f56f729ad2c33cda0c9f7107cf&ali_trackid=162_edbd19f56f729ad2c33cda0c9f7107cf
 --> 截取 id数据去除其他参数 https://item.taobao.com/item.htm?id=705796275470
    详情数据逻辑解析：
    eg1：天猫超市
    detail_url => 重定向到详情页 =>  加载 html中的  item.js ( //g.alicdn.com/detail-project/pc-detail/0.2.11/web/item.js)
    加载  loadDetail 方法：
    var e = Ga(Ua().mark((function e() {
                    var t, n;
                    return Ua().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return t = this.getQueryParams(),
                                n = {
                                    id: t.id,
                                    detail_v: "3.3.2",
                                    exParams: JSON.stringify(Ja({}, t, {
                                        queryParams: De.a.stringify(t),
                                        domain: window.location.protocol + "//" + window.location.host,
                                        path_name: window.location.pathname
                                    }))
                                },
                                e.abrupt("return", en("mtop.taobao.pcdetail.data.get", "1.0", n, {
                                    ttid: "2022@taobao_litepc_9.17.0",
                                    AntiFlood: !0,
                                    AntiCreep: !0
                                }));
                            case 3:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e, this)
    拼接调取： mtop.taobao.pcdetail.data.get 的相关接口 获取返回值详情参数
    eg: https://h5api.m.tmall.com/h5/mtop.taobao.pcdetail.data.get/1.0/?jsv=2.6.1&appKey=12574478&t=1684290906911&sign=38c445ccf5464d6535b0593a5e6c6bd4&api=mtop.taobao.pcdetail.data.get&v=1.0&isSec=0&ecode=0&timeout=10000&ttid=2022%40taobao_litepc_9.17.0&AntiFlood=true&AntiCreep=true&dataType=json&valueType=string&preventFallback=true&type=json&data=%7B%22id%22%3A%22608030379744%22%2C%22detail_v%22%3A%223.3.2%22%2C%22exParams%22%3A%22%7B%5C%22ali_refid%5C%22%3A%5C%22a3_430582_1006%3A1627170028%3AN%3AWHJ%2FpRuTyWMhnZ2Qb0aKkA%3D%3D%3A105662fac5ba932c1baed1c8e58350b6%5C%22%2C%5C%22ali_trackid%5C%22%3A%5C%22162_105662fac5ba932c1baed1c8e58350b6%5C%22%2C%5C%22id%5C%22%3A%5C%22608030379744%5C%22%2C%5C%22queryParams%5C%22%3A%5C%22ali_refid%3Da3_430582_1006%253A1627170028%253AN%253AWHJ%252FpRuTyWMhnZ2Qb0aKkA%253D%253D%253A105662fac5ba932c1baed1c8e58350b6%26ali_trackid%3D162_105662fac5ba932c1baed1c8e58350b6%26id%3D608030379744%5C%22%2C%5C%22domain%5C%22%3A%5C%22https%3A%2F%2Fchaoshi.detail.tmall.com%5C%22%2C%5C%22path_name%5C%22%3A%5C%22%2Fitem.htm%5C%22%7D%22%7D


##其他###
    M端   PC端 不同
    M端搜索：https://main.m.taobao.com/search/index.html?q=6%E4%B8%AA%E6%A0%B8%E6%A1%83 区别 PC端的展示列表不一样
            该项目是个打包好的单页应用
    M端详情：https://new.m.taobao.com/detail.htm?id=705124996327 区别 PC端 有卷后价格
            参考：m_detail   window.__INITIAL_DATA__ 数据
M端滑块校验较多
16.9
缺少部分： 1.登录  2.登录态在线  3.token 失效/或某些状态变更 获取数据方式变更 无法获取数据处理


关于物流信息爬取：
PC 端数据查取
1_1. 查询订单列表 (https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm) 返回的数据： <script>
                                                                                                                    var data = JSON.parse('{ ...}')'</script> 获取数据
1_2.
 -> 的 home.js(https://g.alicdn.com/dinamic/pc-trade-logistics/0.0.5/home.js) 内部加载
var T = [new oi]
                      , I = function(t, e) {
                        var n = t.orderId
                          , r = t.logisticsOrderId
                          , o = t.mailNo;
                        e ? h(!0) : m(!0),
                        ca({
                            api: "mtop.taobao.logistics.detailorlist.query",
                            v: "1.0",
                            ttid: Ii, // '#t#ip##_h5_web_default'
                            data: {
                                orderId: n, // '1905585745177594069'
                                logisticsOrderId: r,
                                mailNo: o,
                                test: Ti.test
                            }
                        }).then((function(t) {
                            !function(t, e) {
                                if (e) {
                                    var n = t.data
                                      , r = void 0 === n ? {} : n
                                      , o = t.endpoint
                                      , i = {
                                        type: "detail"
                                    };
                                    if ("logisticsPackageList" === (void 0 === o ? {} : o).page) {
                                        i.type = "list";
                                        var a = [];
                                        Object.keys(r).forEach((function(t) {
                                            var e = r[t] || {}
                                              , n = e.tag
                                              , o = e.fields
                                              , i = void 0 === o ? {} : o;
                                            if ("pakcage" === n) {
                                                var u = i.subTitle
                                                  , s = i.rightBtnUrl
                                                  , c = i.numInfo;
                                                a.push({
                                                    key: t,
                                                    title: u,
                                                    numInfo: c,
                                                    params: Ai(s.split("?")[1])
                                                })
                                            }
                                        }
                                        ));
                                        var u = a[0]
                                          , s = u.key
                                          , c = u.params;
                                        w(a),
                                        O(s),
                                        I(c, !1)
                                    } else
                                        j(t),
                                        h(!1);
                                    Ni("logistics_detail_pc.page_exposure", i, "EXP")
                                } else
                                    j(t),
                                    h(!1),
                                    m(!1)
                            }((t || {}).data, e)
                        }
                        )).catch((function(t) {
                            var r = (null != t && t.ret && t.ret[0] ? t.ret[0] : "").split("::")
                              , o = r[0]
                              , a = r[1]
                              , u = a.split("<br/>")
                              , c = u[0]
                              , l = u[1];
                            i(!0),
                            s(c),
                            f(l),
                            -1 !== Ia.indexOf(o) && C(o, a),
                            Mi({
                                code: "apiError",
                                message: o + "::" + a,
                                success: !1,
                                c1: n,
                                c2: e
                            })
                        }
                        ))
                    }

                    其中 ca 为：
                    ca = function(t) {
                                return void 0 === t && (t = {}),
                                Oo.request(Object.assign({ // api / v /
                                    api: "",
                                    v: "1.0",
                                    needLogin: !0,
                                    LoginRequest: !0,
                                    type: "GET",
                                    dataType: "jsonp",
                                    timeout: 2e4
                                }, t)).then((function(t) {
                                    var e;
                                    return t && t.ret && t.ret[0] && (e = t.ret[0].split("::")[0]),
                                    t && t.data && "SUCCESS" === e ? Promise.resolve(t) : Promise.reject(t)
                                }
                                )).catch((function(t) {
                                    return Promise.reject(t)
                                }
                                ))
                            }


// 切换页面 用....
   https://buyertrade.taobao.com/trade/itemlist/asyncBought.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&_input_charset=utf8

   canGetHistoryCount: false
   historyCount: 0
   needQueryHistory: false
   onlineCount: 0
   pageNum: 2
   pageSize: 50
   queryForV2: false
   scene: pcBaseBought
   prePageNo: 1