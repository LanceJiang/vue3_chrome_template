// 原始链接： //g.alicdn.com/??kissy/k/1.4.15/import-style-min.js,tb/tracker/1.0.19/index.js,/tb/tsrp/1.70.29/config.js
/*
Copyright 2014, KISSY v1.49.10
MIT Licensed
build time: Dec 10 15:03
*/
(function(c) {
        function s(a, e, f, g, b, i) {
            var d = a.getName();
            if (!(m && b[d] || i[d]))
                if (i[d] = 1,
                "css" === a.getType())
                    g[d] || (a.status = 4,
                        e.push(a),
                        g[d] = 1);
                else if (a = a.getRequiredMods(),
                m && (b[d] = 1,
                    f.push(d)),
                    c.each(a, function(a) {
                        s(a, e, f, g, b, i)
                    }),
                    m)
                    f.pop(),
                        delete b[d]
        }
        var m;
        c.importStyle = function(a) {
            var e = c.Loader.Utils
                , a = e.getModNamesAsArray(a)
                , a = e.normalizeModNames(c, a)
                , f = []
                , g = c.Env.host.document
                , b = c.Config
                , i = {}
                , d = []
                , t = {}
                , u = {};
            m = b.debug;
            c.each(a, function(a) {
                a = c.Loader.Utils.createModuleInfo(c, a);
                s(a, f, d, i, t, u)
            });
            if (f.length)
                if (b.combine) {
                    for (var a = b.comboPrefix, e = b.comboSep, v = b.comboMaxFileNum, b = b.comboMaxUrlLength, n = "", o = "", j = [], h = [], p = 0; p < f.length; p++) {
                        var q = f[p]
                            , k = q.getPackage()
                            , r = k.getPrefixUriForCombo()
                            , l = q.getFullPath();
                        if (!k.isCombine() || !c.startsWith(l, r))
                            g.writeln('<link href="' + l + '"  rel="stylesheet"/>');
                        else if (l = l.slice(r.length).replace(/\?.*$/, ""),
                            j.push(q),
                            h.push(l),
                        1 === j.length)
                            n = r + a,
                            k.getTag() && (o = "?t=" + encodeURIComponent(k.getTag()) + ".css");
                        else if (h.length > v || n.length + h.join(e).length + o.length > b || j[0].getPackage() !== k)
                            j.pop(),
                                h.pop(),
                                g.writeln('<link href="' + (n + h.join(e) + o) + '"  rel="stylesheet"/>'),
                                j = [],
                                h = [],
                                p--
                    }
                    h.length && g.writeln('<link href="' + (n + h.join(e) + o) + '"  rel="stylesheet"/>')
                } else
                    c.each(f, function(a) {
                        g.writeln('<link href="' + a.getFullPath() + '"  rel="stylesheet"/>')
                    })
        }
    }
)(KISSY);
try {
    (function(e) {
            function n() {
                for (var e = document.getElementsByTagName("meta"), n = [], r = 0; e.length > r; r++) {
                    var o = e[r];
                    o && o.name && ("data-spm" == o.name || "spm-id" == o.name) && n.push(o.content)
                }
                return document.body && document.body.getAttribute("data-spm") && n.push(document.body.getAttribute("data-spm")),
                    n = n.length ? n.join(".") : 0,
                n && -1 == n.indexOf(".") && (n += ".0"),
                    n
            }
            function r(e, n) {
                var r = {};
                for (var o in e)
                    r[o] = e[o];
                for (var o in n)
                    r[o] = n[o];
                return r
            }
            if (!e.JSTracker) {
                var o = n()
                    , t = function() {
                    try {
                        if (window.scrollMaxX !== void 0)
                            return "";
                        var e = "track"in document.createElement("track")
                            , n = window.chrome && window.chrome.webstore ? Object.keys(window.chrome.webstore).length : 0;
                        return e ? n > 1 ? " QIHU 360 EE" : " QIHU 360 SE" : ""
                    } catch (r) {
                        return ""
                    }
                }()
                    , c = e.g_config && e.g_config.startTime || +new Date;
                e.JSTracker = {
                    _configs: {
                        sampling: 100,
                        spm: o,
                        debug: -1 != location.href.indexOf("jt_debug"),
                        nick: "",
                        url: "",
                        ignore: []
                    }
                },
                e.g_config && e.g_config.jstracker && "object" == typeof e.g_config.jstracker && null !== e.g_config.jstracker && (e.JSTracker._configs = r(e.JSTracker._configs, e.g_config.jstracker));
                var a = function() {
                    var n;
                    if ("" !== e.JSTracker._configs.nick)
                        return e.JSTracker._configs.nick;
                    try {
                        return TB.Global.util.getNick()
                    } catch (r) {}
                    try {
                        if (n = /_nk_=([^;]+)/.exec(document.cookie) || /_w_tb_nick=([^;]+)/.exec(document.cookie) || /lgc=([^;]+)/.exec(document.cookie))
                            return decodeURIComponent(n[1])
                    } catch (r) {
                        return ""
                    } finally {
                        return ""
                    }
                }();
                e.JSTracker.config = function(n, r) {
                    return n || r ? r ? (e.JSTracker._configs[n] = r,
                        void 0) : e.JSTracker._configs[n] : e.JSTracker._configs
                }
                ;
                var i = function(n) {
                    var r = "jsFeImage_" + +new Date
                        , o = e[r] = new Image;
                    o.onload = o.onerror = function() {
                        e[r] = null
                    }
                        ,
                        o.src = n,
                        o = null
                }
                    , s = function() {
                    return "https:" == location.protocol ? "https://log.mmstat.com/jstracker.2?" : "http://gm.mmstat.com/jstracker.2?"
                }();
                e.JSTracker.send = function(n) {
                    var o = {
                        msg: "",
                        file: "",
                        line: 0,
                        delay: +new Date - c,
                        category: "",
                        spm: e.JSTracker._configs.spm,
                        sampling: e.JSTracker._configs.sampling,
                        url: location.href,
                        ua: navigator.userAgent + t,
                        scrolltop: document.documentElement && document.documentElement.scrollTop || document.body && document.body.scrollTop || 0,
                        screen: screen.width + "x" + screen.height,
                        nick: a
                    };
                    e.JSTracker._configs.url && (o.url = e.JSTracker._configs.url);
                    var d = r(o, n)
                        , g = [];
                    d.url != location.href && g.push("[u" + d.url + "]"),
                    d.delay > 0 && g.push("[t" + d.delay + "]"),
                    d.category && g.push("[c" + d.category + "]"),
                    d.spm && g.push("[s" + d.spm + "]"),
                    d.sampling && g.push("[r" + d.sampling + "]"),
                    d.msg && g.push(d.msg),
                        g = g.join("");
                    var u = 1 >= Math.random() * d.sampling;
                    try {
                        for (var m = 0; e.JSTracker._configs.ignore.length > m; m++) {
                            var l = e.JSTracker._configs.ignore[m];
                            l.test(n.msg) && (u = !1)
                        }
                    } catch (f) {
                        e.JSTracker.send({
                            category: "error_ignore",
                            url: "http://jstracker/0.1/"
                        })
                    }
                    (u || e.JSTracker._configs.debug) && i(s + ["type=9", "id=jstracker", "v=1.0.17", "nick=" + d.nick, "msg=" + encodeURIComponent(g), "file=" + encodeURIComponent(d.file), "ua=" + encodeURIComponent(d.ua), "line=" + d.line, "scrolltop=" + d.scrolltop, "screen=" + screen.width + "x" + screen.height, "t=" + (new Date).valueOf()].join("&")),
                    e.JSTracker._configs.debug && console && console.log(d)
                }
                ;
                var d = ["log", "info", "debug", "warn", "error"];
                for (var g in d) {
                    var u = d[g];
                    e.JSTracker[u] = function(n) {
                        return function() {
                            var r = Array.prototype.slice.call(arguments, 0)
                                , o = r.join("");
                            e.JSTracker.send({
                                category: n.toUpperCase(),
                                msg: o
                            })
                        }
                    }(u)
                }
                var m = e.onerror;
                e.onerror = function(n, r, o) {
                    m && m(n, r, o),
                        e.JSTracker.send({
                            msg: n,
                            file: r,
                            line: o
                        })
                }
                ;
                var l = function() {
                    var n = {}
                        , r = "";
                    if (e.performance) {
                        var o = e.performance.timing;
                        n.dns = o.domainLookupEnd - o.domainLookupStart,
                            n.con = o.connectEnd - o.connectStart,
                            n.req = o.responseStart - o.requestStart,
                            n.res = o.responseEnd - o.responseStart,
                            n.dcl = o.domContentLoadedEventEnd - o.domLoading,
                            n.onload = o.loadEventStart - o.domLoading,
                            n.type = window.performance.navigation.type;
                        try {
                            r = JSON.stringify(n)
                        } catch (t) {}
                    }
                    e.JSTracker.send({
                        msg: r,
                        category: "__PV"
                    })
                };
                window.addEventListener ? (document.addEventListener("DOMContentLoaded", function() {
                    o = n(),
                        e.JSTracker._configs.spm = o
                }, !1),
                    window.addEventListener("load", l, !1)) : (document.attachEvent("onreadystatechange", function() {
                    "complete" === document.readyState && document.detachEvent("onreadystatechange", arguments.callee),
                        o = n(),
                        e.JSTracker._configs.spm = o
                }),
                    window.attachEvent("onload", l))
            }
        }
    )(window)
} catch (e) {}
function g_srp_getGlobalValue(s, r) {
    var e = window.g_page_config || {};
    return s ? e[s] || r : e
}
function g_srp_getValidFieldNames() {
    return ["updatebar", "p4p", "header", "tab", "choosecar", "menulist", "shopcombo", "shopcombotip", "shopstar", "sc", "tips", "phonenav", "spuseries", "vbaby", "brandbang", "nav", "related", "sortbar", "d11filterbar", "personalbar", "apasstips", "spucombo", "itemlist", "noresult", "navtablink", "navtabtags", "pager", "bottomsearch", "feedback", "supertab", "sctabframe", "bottomlink", "hongbao", "debugbar"]
}
function g_srp_setPageUI(s, r) {
    Search.set("pageConfig_" + s, {
        pageName: s,
        modMap: r
    })
}
function g_srp_getPageUI(s) {
    s = s || "";
    var r = Search.get("pageConfig_" + s) || {};
    return r
}
function g_srp_resolve(s) {
    for (var r = [], e = s.split("/"), p = 0; p < e.length; p++) {
        var i = e[p];
        ".." === i ? r.pop() : r.push(i)
    }
    return r.join("/")
}
function g_srp_getInitMods() {
    if (!g_srp_getInitMods.__return) {
        var s = Search.get("appName")
            , r = g_srp_getGlobalValue("pageName", "")
            , e = g_srp_getPageUI(r)
            , p = e.modMap || {}
            , i = g_srp_getGlobalValue("mods", {})
            , a = []
            , c = []
            , t = KISSY.keys(p)
            , n = g_srp_getValidFieldNames()
            , o = n.concat(t);
        o = KISSY.unique(o),
            KISSY.each(o, function(e) {
                if (i[e]) {
                    var t, n = p[e];
                    n ? (t = s + "/p/" + r + "/" + n,
                    -1 !== n.indexOf("..") && (t = g_srp_resolve(t))) : t = s + "/c/ui/" + e + "/",
                        a.push(t),
                        c.push({
                            name: e
                        })
                }
            }),
            g_srp_getInitMods.__return = {
                appInitName: [s + "/p/" + r + "/app"],
                modInitNames: a,
                modsConfig: c
            }
    }
    return g_srp_getInitMods.__return
}
function g_srp_loadCss() {
    var s = g_srp_getInitMods()
        , r = s.appInitName
        , e = s.modInitNames
        , p = r.concat(e);
    KISSY.importStyle(p)
}
function g_srp_init() {
    var s = window;
    if (s.g_page_config && s.g_page_config.mods && s.g_page_config.mods.header && s.g_page_config.mods.header.data && s.g_page_config.mods.header.data.hb && s.g_page_config.mods.header.data.hb_v) {
        var r = s.g_page_config.mods.header.data.hb_v;
        KISSY.config({
            packages: [{
                name: "hbhub",
                path: "//g.alicdn.com/mtb/app-hongbaohub/" + r + "/",
                ignorePackageNameInUri: !0
            }]
        })
    }
    var e = g_srp_getInitMods()
        , p = e.appInitName
        , i = e.modInitNames
        , a = p.concat(i)
        , c = e.modsConfig;
    KISSY.use(a, function(r, e) {
        var p = arguments;
        KISSY.ready(function() {
            Search.safeRun(function() {
                var a = g_srp_getGlobalValue();
                s.g_page_config = null;
                var t = 2;
                r.each(i, function(s, r) {
                    c[r].CONSTRUCTOR = p[t + r]
                }),
                    a.modsConfig = c;
                var n = new e({
                    el: "#main",
                    data: a
                });
                Search.set("app", n)
            })
        })
    })
}
!function(s, r) {
    function e(r) {
        var e = s.Config && s.Config.packages && s.Config.packages.srp && s.Config.packages.srp.base || r.base;
        (-1 !== e.indexOf("taobao.net") || -1 !== e.indexOf("waptest")) && s.config({
            packages: [{
                name: "tbc",
                path: "//g-assets.daily.taobao.net/tbc/",
                ignorePackageNameInUri: !0
            }]
        }),
            s.config({
                packages: {
                    "sd/data_sufei": {
                        base: "//g.alicdn.com/sd/data_sufei/1.4.5/sufei",
                        ignorePackageNameInUri: !0,
                        charset: "utf8"
                    }
                },
                modules: {
                    datalazyload: {
                        alias: "kg/datalazyload/2.0.2/"
                    },
                    "kg/xtemplate/": {
                        alias: "kg/xtemplate/4.3.0/"
                    },
                    "kg/xtemplate/runtime": {
                        alias: "kg/xtemplate/4.3.0/runtime"
                    }
                }
            })
    }

    var p = r.Search = r.Search || {};
    p.config = function(r) {
        if (!r || !r.name || !r.base || "undefined" === r.combine)
            throw new Error("Search.config options error");
        s.log("config Search"),
            s.log("xcake.base:" + r.base),
            s.log("xcake.name:" + r.name),
            s.log("xcake.combine:" + r.combine),
            s.config({
                combine: r.combine,
                comboMaxFileNum: 10,
                packages: [{
                    name: r.name,
                    base: r.base,
                    ignorePackageNameInUri: !0,
                    debug: !0,
                    combine: r.combine
                }]
            }),
            p.set("appName", r.name),
            e(r),
            KISSY.config("modules", {
                "srp/_0": {
                    requires: ["srp/_1", "srp/_2", "srp/_1j", "srp/_1g", "srp/_1k", "srp/_1i", "srp/_5", "srp/_3", "srp/_9", "srp/_6"]
                },
                "srp/_1": {
                    requires: ["srp/c/app/base.css", "node", "event", "base"]
                },
                "srp/_2": {
                    requires: ["srp/_1l", "srp/_1e"]
                },
                "srp/_3": {
                    requires: ["srp/_7"]
                },
                "srp/_4": {
                    requires: ["srp/_1"]
                },
                "srp/_5": {
                    requires: ["io", "ua"]
                },
                "srp/_6": {
                    requires: ["srp/c/app/responsive.css"]
                },
                "srp/_9": {
                    requires: ["srp/c/libs/nprogress/nprogress.css"]
                },
                "srp/_a": {
                    requires: ["srp/c/ui/apasstips/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_b": {
                    requires: ["srp/c/ui/bottomsearch/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_c": {
                    requires: ["srp/c/ui/brandbang/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_d": {
                    requires: ["srp/c/ui/choosecar/index.css", "srp/_4", "kg/xtemplate/runtime", "io", "srp/_1i", "node"]
                },
                "srp/_e": {
                    requires: ["srp/c/ui/d11filterbar/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_f": {
                    requires: ["srp/_4", "node"]
                },
                "srp/_g": {
                    requires: ["srp/c/ui/feedback/advice2visual/index.css", "kg/xtemplate/runtime", "srp/_8", "srp/_h", "tbc/mini-login/2.2.9/index", "cookie"]
                },
                "srp/_h": {
                    requires: ["srp/_4"]
                },
                "srp/_i": {
                    requires: ["srp/c/ui/feedback/index.css", "srp/_4", "kg/xtemplate/runtime", "srp/_j", "dom", "event"]
                },
                "srp/_k": {
                    requires: ["srp/c/ui/header/index.css", "node", "ua", "cookie", "kg/xtemplate/runtime", "srp/_4", "srp/c/ui/header/mods/tips.css", "event"]
                },
                "srp/_l": {
                    requires: ["srp/_4"]
                },
                "srp/_m": {
                    requires: ["srp/c/ui/itemlist/index.css", "kg/xtemplate/runtime", "srp/_1k", "io", "node", "event", "dom", "cookie", "srp/_1i", "datalazyload", "srp/_1o", "srp/_1n", "srp/_1r", "srp/_4", "srp/c/ui/itemlist/thumb/index.css", "srp/_1q"]
                },
                "srp/_n": {
                    requires: ["srp/c/ui/menulist/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_o": {
                    requires: ["srp/c/ui/nav/index.css", "ua", "kg/xtemplate/runtime", "srp/_1m", "srp/_1i", "srp/_4"]
                },
                "srp/_p": {
                    requires: ["srp/c/ui/navtablink/index.css", "srp/_4", "kg/xtemplate/runtime", "io", "srp/c/ui/navtablink/popup/index.css", "srp/_1q"]
                },
                "srp/_q": {
                    requires: ["srp/c/ui/navtabtags/index.css", "node", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_r": {
                    requires: ["srp/c/ui/noresult/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_s": {
                    requires: ["srp/c/ui/p4p/index.css", "srp/_4"]
                },
                "srp/_t": {
                    requires: ["srp/c/ui/pager/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_u": {
                    requires: ["srp/c/ui/personalbar/index.css", "srp/_4", "kg/xtemplate/runtime", "srp/_1m"]
                },
                "srp/_v": {
                    requires: ["srp/c/ui/phonenav/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_10": {
                    requires: ["srp/c/ui/related/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_11": {
                    requires: ["srp/c/ui/sc/index.css", "kg/xtemplate/runtime", "srp/_4", "dom", "srp/c/ui/sc/birthday/index.css"]
                },
                "srp/_12": {
                    requires: ["srp/c/ui/sctabframe/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_13": {
                    requires: ["srp/c/ui/shopcombo/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_14": {
                    requires: ["srp/c/ui/shopcombotip/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_15": {
                    requires: ["srp/c/ui/shopstar/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_16": {
                    requires: ["srp/c/ui/sortbar/index.css", "kg/xtemplate/runtime", "srp/_4", "srp/c/ui/sortbar/price-rank/index.css", "dom", "overlay"]
                },
                "srp/_17": {
                    requires: ["srp/c/ui/spucombo/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_18": {
                    requires: ["srp/c/ui/spuseries/index.css", "kg/xtemplate/runtime", "srp/_4", "base"]
                },
                "srp/_19": {
                    requires: ["srp/c/ui/supertab/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_1a": {
                    requires: ["srp/c/ui/tab/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_1b": {
                    requires: ["srp/c/ui/tips/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_1c": {
                    requires: ["srp/c/ui/updatebar/index.css", "srp/_4", "cookie", "kg/xtemplate/runtime"]
                },
                "srp/_1d": {
                    requires: ["srp/c/ui/vbaby/index.css", "node", "kg/xtemplate/runtime", "io", "srp/_4"]
                },
                "srp/_1f": {
                    requires: ["dom"]
                },
                "srp/_1g": {
                    requires: ["srp/_2"]
                },
                "srp/_1h": {
                    requires: ["srp/_1i"]
                },
                "srp/_1i": {
                    requires: ["node", "ua"]
                },
                "srp/_1j": {
                    requires: ["json"]
                },
                "srp/_1k": {
                    requires: ["event", "dom", "ua"]
                },
                "srp/_1m": {
                    requires: ["srp/c/widgets/baike/index.css", "base", "kg/xtemplate/runtime", "node", "json"]
                },
                "srp/_1n": {
                    requires: ["srp/c/widgets/icon-popup-new/index.css", "kg/xtemplate/runtime", "srp/_1q"]
                },
                "srp/_1o": {
                    requires: ["srp/c/widgets/icon-popup/index.css", "ua", "kg/xtemplate/runtime", "srp/_1q"]
                },
                "srp/_1p": {
                    requires: ["srp/c/widgets/overlay/index.css", "base", "node", "event", "dom"]
                },
                "srp/_1q": {
                    requires: ["overlay"]
                },
                "srp/_1r": {
                    requires: ["srp/c/widgets/shopcard/index.css", "io", "kg/xtemplate/runtime", "srp/_1q"]
                },
                "srp/_1s": {
                    requires: ["srp/c/widgets/spudetail/index.css", "io", "base", "node", "event", "srp/_1i", "kg/xtemplate/runtime"]
                },
                "srp/_1t": {
                    requires: ["srp/c/widgets/tips/index.css", "base", "kg/xtemplate/runtime", "node", "json"]
                },
                "srp/_1u": {
                    requires: ["srp/c/widgets/typo/index.css", "base", "event", "node", "dom", "io", "kg/xtemplate/runtime"]
                },
                "srp/_1v": {
                    requires: ["srp/_0", "srp/p/bigtabsrp/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime", "srp/_1h"]
                },
                "srp/_20": {
                    requires: ["srp/_0", "srp/p/i2i/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_21": {
                    requires: ["srp/p/i2i/c/header/index.css", "node", "ua", "cookie", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_22": {
                    requires: ["srp/p/i2i/c/recitem/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_23": {
                    requires: ["srp/p/i2i/c/singleauction/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_24": {
                    requires: ["srp/p/i2i/c/sortbar/index.css", "ua", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_25": {
                    requires: ["srp/_0", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_26": {
                    requires: ["srp/p/imgsearch/c/banner/index.css", "kg/xtemplate/runtime", "srp/_4", "node", "kg/imgcrop/2.0.2/index", "base", "event", "uri"]
                },
                "srp/_27": {
                    requires: ["srp/p/imgsearch/c/itemlist/index.css", "kg/xtemplate/runtime", "srp/_1o", "srp/_1r", "srp/_4", "event", "dom", "ua"]
                },
                "srp/_28": {
                    requires: ["srp/p/imgsearch/c/sharebar/index.css", "srp/_4", "kg/xtemplate/runtime", "dom", "event", "node", "tbc/share/1.2.0/index", "kg/qrcode/2.0.1/index", "srp/_1i"]
                },
                "srp/_29": {
                    requires: ["srp/_0", "srp/p/listsrp/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime", "srp/_1h"]
                },
                "srp/_2a": {
                    requires: ["srp/_0", "srp/c/icons/bg.css", "srp/c/icons/text.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime", "srp/_1h"]
                },
                "srp/_2b": {
                    requires: ["srp/_0", "srp/p/minisrp/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime", "srp/_1h"]
                },
                "srp/_2c": {
                    requires: ["srp/_0", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_2d": {
                    requires: ["srp/p/mysearch/c/explain/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_2e": {
                    requires: ["srp/p/mysearch/c/grid/index.css", "kg/xtemplate/runtime", "srp/_4", "datalazyload", "io", "srp/_1k", "srp/_1i", "srp/_1t"]
                },
                "srp/_2f": {
                    requires: ["srp/p/mysearch/c/guide/index.css", "srp/_4", "kg/xtemplate/runtime", "node", "dom", "ua", "event"]
                },
                "srp/_2g": {
                    requires: ["srp/p/mysearch/c/myblock/index.css", "kg/xtemplate/runtime", "srp/_4", "ua"]
                },
                "srp/_2h": {
                    requires: ["srp/p/mysearch/c/nav/index.css", "node", "srp/_1m", "kg/xtemplate/runtime", "srp/_1i", "srp/_4", "srp/p/mysearch/c/nav/breadcrumbs/index.css", "srp/p/mysearch/c/nav/common/index.css", "event", "srp/p/mysearch/c/nav/overlay/index.css"]
                },
                "srp/_2i": {
                    requires: ["srp/_0", "srp/c/icons/btn.css", "srp/c/icons/mysearch.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_2j": {
                    requires: ["srp/p/mysearchv4/c/gridv4/index.css", "srp/_4", "io", "datalazyload", "kg/xtemplate/runtime", "srp/_1i", "srp/_1t", "srp/_1k"]
                },
                "srp/_2k": {
                    requires: ["srp/p/mysearchv4/c/myblockv4/index.css", "node", "io", "dom", "kg/xtemplate/runtime", "srp/_4", "kg/moment/2.0.1/index", "ua"]
                },
                "srp/_2l": {
                    requires: ["base", "node", "srp/p/mysearchv4/c/myblockv4/welcome.css", "event", "kg/xtemplate/runtime", "srp/_1i"]
                },
                "srp/_2m": {
                    requires: ["srp/_0", "srp/c/icons/btn.css", "srp/c/icons/mysearch.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_2n": {
                    requires: ["srp/_0", "srp/c/icons/bg.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/4.1.4/runtime"]
                },
                "srp/_2o": {
                    requires: ["srp/p/scenesearch/c/banner/index.css", "srp/_4", "node", "anim", "kg/xtemplate/runtime"]
                },
                "srp/_2p": {
                    requires: ["srp/p/scenesearch/c/loft/index.css", "srp/_4", "kg/xtemplate/runtime", "event", "dom", "node", "io", "datalazyload", "srp/_1o", "srp/_1n"]
                },
                "srp/_2q": {
                    requires: ["srp/_0", "srp/p/shopsearch/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_2r": {
                    requires: ["srp/_4"]
                },
                "srp/_2s": {
                    requires: ["srp/p/shopsearch/c/shoplist/index.css", "srp/_4", "srp/_1k", "kg/xtemplate/runtime", "datalazyload", "kg/slide/2.0.2/index", "io", "dom", "json", "event"]
                },
                "srp/_2t": {
                    requires: ["srp/p/shopsearch/c/sortbar/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_2u": {
                    requires: ["srp/p/shopsearch/c/tab/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_2v": {
                    requires: ["srp/_0", "srp/p/shopsearchindex/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_30": {
                    requires: ["srp/p/shopsearchindex/c/handpick/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_31": {
                    requires: ["srp/p/shopsearchindex/c/hotcat/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_32": {
                    requires: ["srp/_0", "srp/p/shopsearchsimilar/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_33": {
                    requires: ["srp/p/shopsearchsimilar/c/similarcombo/index.css", "srp/_4", "kg/xtemplate/runtime", "gallery/slide/1.3/index", "io", "dom", "json"]
                },
                "srp/_34": {
                    requires: ["srp/_0", "srp/p/spudetail/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_35": {
                    requires: ["srp/p/spudetail/c/itemlist/index.css", "kg/xtemplate/runtime", "io", "srp/_4", "dom", "event", "srp/p/spudetail/c/itemlist/thumb/index.css", "srp/_1q"]
                },
                "srp/_36": {
                    requires: ["srp/p/spudetail/c/moredetail/index.css", "kg/xtemplate/runtime", "node", "srp/_4", "event", "io"]
                },
                "srp/_37": {
                    requires: ["srp/p/spudetail/c/sortbar/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_38": {
                    requires: ["srp/p/spudetail/c/spuhead/index.css", "kg/xtemplate/runtime", "srp/_4", "srp/_1p"]
                },
                "srp/_39": {
                    requires: ["srp/_0", "srp/p/spulist/app.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_3a": {
                    requires: ["srp/p/spulist/c/grid/index.css", "kg/xtemplate/runtime", "srp/_4", "event", "dom"]
                },
                "srp/_3b": {
                    requires: ["srp/p/spulist/c/sortbar/index.css", "kg/xtemplate/runtime", "srp/_4"]
                },
                "srp/_3c": {
                    requires: ["srp/p/spulist/c/spucombo/index.css", "kg/xtemplate/runtime", "srp/_4", "base", "node", "io"]
                },
                "srp/_3d": {
                    requires: ["srp/_0", "srp/c/icons/bg.css", "srp/c/icons/btn.css", "srp/c/icons/service.css", "srp/c/icons/supple.css", "kg/xtemplate/runtime"]
                },
                "srp/_3e": {
                    requires: ["srp/p/theme/c/album/index.css", "srp/_4", "kg/xtemplate/runtime", "datalazyload"]
                },
                "srp/_3f": {
                    requires: ["srp/p/theme/c/banner/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_3g": {
                    requires: ["srp/p/theme/c/bottomlink/index.css", "srp/_4", "kg/xtemplate/runtime"]
                },
                "srp/_3h": {
                    requires: ["srp/p/theme/c/itemlist/index.css", "srp/_4", "datalazyload", "kg/xtemplate/runtime", "srp/_1n"]
                },
                "srp/c/app/app-base": {
                    alias: "srp/_0"
                },
                "srp/c/app/base": {
                    alias: "srp/_1"
                },
                "srp/c/app/env": {
                    alias: "srp/_2"
                },
                "srp/c/app/history": {
                    alias: "srp/_3"
                },
                "srp/c/app/mod-base": {
                    alias: "srp/_4"
                },
                "srp/c/app/requester": {
                    alias: "srp/_5"
                },
                "srp/c/app/responsive": {
                    alias: "srp/_6"
                },
                "srp/c/libs/history": {
                    alias: "srp/_7"
                },
                "srp/c/libs/html2canvas": {
                    alias: "srp/_8"
                },
                "srp/c/libs/nprogress/nprogress": {
                    alias: "srp/_9"
                },
                "srp/c/ui/apasstips/index": {
                    alias: "srp/_a"
                },
                "srp/c/ui/bottomsearch/index": {
                    alias: "srp/_b"
                },
                "srp/c/ui/brandbang/index": {
                    alias: "srp/_c"
                },
                "srp/c/ui/choosecar/index": {
                    alias: "srp/_d"
                },
                "srp/c/ui/d11filterbar/index": {
                    alias: "srp/_e"
                },
                "srp/c/ui/debugbar/index": {
                    alias: "srp/_f"
                },
                "srp/c/ui/feedback/advice2visual/index": {
                    alias: "srp/_g"
                },
                "srp/c/ui/feedback/advice2visual/panel": {
                    alias: "srp/_h"
                },
                "srp/c/ui/feedback/index": {
                    alias: "srp/_i"
                },
                "srp/c/ui/feedback/tpl/index": {
                    alias: "srp/_j"
                },
                "srp/c/ui/header/index": {
                    alias: "srp/_k"
                },
                "srp/c/ui/hongbao/index": {
                    alias: "srp/_l"
                },
                "srp/c/ui/itemlist/index": {
                    alias: "srp/_m"
                },
                "srp/c/ui/menulist/index": {
                    alias: "srp/_n"
                },
                "srp/c/ui/nav/index": {
                    alias: "srp/_o"
                },
                "srp/c/ui/navtablink/index": {
                    alias: "srp/_p"
                },
                "srp/c/ui/navtabtags/index": {
                    alias: "srp/_q"
                },
                "srp/c/ui/noresult/index": {
                    alias: "srp/_r"
                },
                "srp/c/ui/p4p/index": {
                    alias: "srp/_s"
                },
                "srp/c/ui/pager/index": {
                    alias: "srp/_t"
                },
                "srp/c/ui/personalbar/index": {
                    alias: "srp/_u"
                },
                "srp/c/ui/phonenav/index": {
                    alias: "srp/_v"
                },
                "srp/c/ui/related/index": {
                    alias: "srp/_10"
                },
                "srp/c/ui/sc/index": {
                    alias: "srp/_11"
                },
                "srp/c/ui/sctabframe/index": {
                    alias: "srp/_12"
                },
                "srp/c/ui/shopcombo/index": {
                    alias: "srp/_13"
                },
                "srp/c/ui/shopcombotip/index": {
                    alias: "srp/_14"
                },
                "srp/c/ui/shopstar/index": {
                    alias: "srp/_15"
                },
                "srp/c/ui/sortbar/index": {
                    alias: "srp/_16"
                },
                "srp/c/ui/spucombo/index": {
                    alias: "srp/_17"
                },
                "srp/c/ui/spuseries/index": {
                    alias: "srp/_18"
                },
                "srp/c/ui/supertab/index": {
                    alias: "srp/_19"
                },
                "srp/c/ui/tab/index": {
                    alias: "srp/_1a"
                },
                "srp/c/ui/tips/index": {
                    alias: "srp/_1b"
                },
                "srp/c/ui/updatebar/index": {
                    alias: "srp/_1c"
                },
                "srp/c/ui/vbaby/index": {
                    alias: "srp/_1d"
                },
                "srp/c/utils/httpUrlComp": {
                    alias: "srp/_1e"
                },
                "srp/c/utils/imgmagic": {
                    alias: "srp/_1f"
                },
                "srp/c/utils/logger": {
                    alias: "srp/_1g"
                },
                "srp/c/utils/onesearch": {
                    alias: "srp/_1h"
                },
                "srp/c/utils/stat": {
                    alias: "srp/_1i"
                },
                "srp/c/utils/timing": {
                    alias: "srp/_1j"
                },
                "srp/c/utils/utils": {
                    alias: "srp/_1k"
                },
                "srp/c/utils/webp": {
                    alias: "srp/_1l"
                },
                "srp/c/widgets/baike/index": {
                    alias: "srp/_1m"
                },
                "srp/c/widgets/icon-popup-new/index": {
                    alias: "srp/_1n"
                },
                "srp/c/widgets/icon-popup/index": {
                    alias: "srp/_1o"
                },
                "srp/c/widgets/overlay/index": {
                    alias: "srp/_1p"
                },
                "srp/c/widgets/popup/index": {
                    alias: "srp/_1q"
                },
                "srp/c/widgets/shopcard/index": {
                    alias: "srp/_1r"
                },
                "srp/c/widgets/spudetail/index": {
                    alias: "srp/_1s"
                },
                "srp/c/widgets/tips/index": {
                    alias: "srp/_1t"
                },
                "srp/c/widgets/typo/index": {
                    alias: "srp/_1u"
                },
                "srp/p/bigtabsrp/app": {
                    alias: "srp/_1v"
                },
                "srp/p/i2i/app": {
                    alias: "srp/_20"
                },
                "srp/p/i2i/c/header/index": {
                    alias: "srp/_21"
                },
                "srp/p/i2i/c/recitem/index": {
                    alias: "srp/_22"
                },
                "srp/p/i2i/c/singleauction/index": {
                    alias: "srp/_23"
                },
                "srp/p/i2i/c/sortbar/index": {
                    alias: "srp/_24"
                },
                "srp/p/imgsearch/app": {
                    alias: "srp/_25"
                },
                "srp/p/imgsearch/c/banner/index": {
                    alias: "srp/_26"
                },
                "srp/p/imgsearch/c/itemlist/index": {
                    alias: "srp/_27"
                },
                "srp/p/imgsearch/c/sharebar/index": {
                    alias: "srp/_28"
                },
                "srp/p/listsrp/app": {
                    alias: "srp/_29"
                },
                "srp/p/mainsrp/app": {
                    alias: "srp/_2a"
                },
                "srp/p/minisrp/app": {
                    alias: "srp/_2b"
                },
                "srp/p/mysearch/app": {
                    alias: "srp/_2c"
                },
                "srp/p/mysearch/c/explain/index": {
                    alias: "srp/_2d"
                },
                "srp/p/mysearch/c/grid/index": {
                    alias: "srp/_2e"
                },
                "srp/p/mysearch/c/guide/index": {
                    alias: "srp/_2f"
                },
                "srp/p/mysearch/c/myblock/index": {
                    alias: "srp/_2g"
                },
                "srp/p/mysearch/c/nav/index": {
                    alias: "srp/_2h"
                },
                "srp/p/mysearchv4/app": {
                    alias: "srp/_2i"
                },
                "srp/p/mysearchv4/c/gridv4/index": {
                    alias: "srp/_2j"
                },
                "srp/p/mysearchv4/c/myblockv4/index": {
                    alias: "srp/_2k"
                },
                "srp/p/mysearchv4/c/myblockv4/welcome": {
                    alias: "srp/_2l"
                },
                "srp/p/mysearchv4patch/app": {
                    alias: "srp/_2m"
                },
                "srp/p/scenesearch/app": {
                    alias: "srp/_2n"
                },
                "srp/p/scenesearch/c/banner/index": {
                    alias: "srp/_2o"
                },
                "srp/p/scenesearch/c/loft/index": {
                    alias: "srp/_2p"
                },
                "srp/p/shopsearch/app": {
                    alias: "srp/_2q"
                },
                "srp/p/shopsearch/c/p4p/index": {
                    alias: "srp/_2r"
                },
                "srp/p/shopsearch/c/shoplist/index": {
                    alias: "srp/_2s"
                },
                "srp/p/shopsearch/c/sortbar/index": {
                    alias: "srp/_2t"
                },
                "srp/p/shopsearch/c/tab/index": {
                    alias: "srp/_2u"
                },
                "srp/p/shopsearchindex/app": {
                    alias: "srp/_2v"
                },
                "srp/p/shopsearchindex/c/handpick/index": {
                    alias: "srp/_30"
                },
                "srp/p/shopsearchindex/c/hotcat/index": {
                    alias: "srp/_31"
                },
                "srp/p/shopsearchsimilar/app": {
                    alias: "srp/_32"
                },
                "srp/p/shopsearchsimilar/c/similarcombo/index": {
                    alias: "srp/_33"
                },
                "srp/p/spudetail/app": {
                    alias: "srp/_34"
                },
                "srp/p/spudetail/c/itemlist/index": {
                    alias: "srp/_35"
                },
                "srp/p/spudetail/c/moredetail/index": {
                    alias: "srp/_36"
                },
                "srp/p/spudetail/c/sortbar/index": {
                    alias: "srp/_37"
                },
                "srp/p/spudetail/c/spuhead/index": {
                    alias: "srp/_38"
                },
                "srp/p/spulist/app": {
                    alias: "srp/_39"
                },
                "srp/p/spulist/c/grid/index": {
                    alias: "srp/_3a"
                },
                "srp/p/spulist/c/sortbar/index": {
                    alias: "srp/_3b"
                },
                "srp/p/spulist/c/spucombo/index": {
                    alias: "srp/_3c"
                },
                "srp/p/theme/app": {
                    alias: "srp/_3d"
                },
                "srp/p/theme/c/album/index": {
                    alias: "srp/_3e"
                },
                "srp/p/theme/c/banner/index": {
                    alias: "srp/_3f"
                },
                "srp/p/theme/c/bottomlink/index": {
                    alias: "srp/_3g"
                },
                "srp/p/theme/c/itemlist/index": {
                    alias: "srp/_3h"
                }
            })
    }
    ;
    var i = {};
    p.set = function(s, r) {
        i[s] = r
    }
        ,
        p.get = function(s) {
            return i[s]
        }
    ;
    var a = location.href
        , c = !1;
    -1 !== a.indexOf("ks-debug=true") && (c = !0),
        p.isDebug = c,
        p.safeRun = function(s, r) {
            try {
                s()
            } catch (e) {
                if (window.JSTracker && (r = r || function(s) {
                    return s.toString()
                }
                    ,
                    window.JSTracker.error(r(e))),
                    c)
                    throw e
            }
        }
}(KISSY, this),
    g_srp_setPageUI("page0", {
        itemlist: "c/itemlist/",
        desc: "c/desc/"
    }),
    g_srp_setPageUI("mysearch", {
        myblock: "c/myblock/",
        explain: "c/explain/",
        nav: "c/nav/",
        grid: "c/grid/",
        guide: "c/guide/"
    }),
    g_srp_setPageUI("mysearchv4", {
        myblockv4: "c/myblockv4/",
        explain: "../mysearch/c/explain/",
        nav: "../mysearch/c/nav/",
        gridv4: "c/gridv4/",
        guide: "../mysearch/c/guide/"
    }),
    g_srp_setPageUI("mysearchv4patch", {
        myblockv4: "../mysearchv4/c/myblockv4/",
        explain: "../mysearch/c/explain/",
        nav: "../mysearch/c/nav/",
        grid: "../mysearch/c/grid/",
        guide: "../mysearch/c/guide/"
    }),
    g_srp_setPageUI("i2i", {
        singleauction: "c/singleauction/",
        sortbar: "c/sortbar/",
        recitem: "c/recitem/"
    }),
    g_srp_setPageUI("floor", {
        floors: "c/floors/"
    }),
    g_srp_setPageUI("find-brand", {
        header: "c/header/",
        "brand-detail": "c/brand-detail/",
        discussion: "c/discussion/",
        evaluate: "c/evaluate/",
        "star-product": "c/star-product/",
        "brand-record": "c/brand-record/",
        "ranking-list": "c/ranking-list/",
        info: "c/info/"
    }),
    g_srp_setPageUI("spulist", {
        spucombo: "c/spucombo/",
        sortbar: "c/sortbar/",
        grid: "c/grid/"
    }),
    g_srp_setPageUI("spudetail", {
        spuhead: "c/spuhead/",
        sortbar: "c/sortbar/",
        itemlist: "c/itemlist/",
        moredetail: "c/moredetail/"
    }),
    g_srp_setPageUI("imgsearch", {
        banner: "c/banner/",
        itemlist: "c/itemlist/",
        sharebar: "c/sharebar/"
    }),
    g_srp_setPageUI("theme", {
        banner: "c/banner/",
        itemlist: "c/itemlist/",
        album: "c/album/"
    }),
    g_srp_setPageUI("shopsearchindex", {
        hotcat: "c/hotcat/",
        handpick: "c/handpick/"
    }),
    g_srp_setPageUI("shopsearch", {
        tab: "c/tab/",
        sortbar: "c/sortbar/",
        shoplist: "c/shoplist/",
        p4p: "c/p4p/",
        handpick: "../shopsearchindex/c/handpick/"
    }),
    g_srp_setPageUI("shopsearchsimilar", {
        tab: "../shopsearch/c/tab/",
        sortbar: "../shopsearch/c/sortbar/",
        shoplist: "../shopsearch/c/shoplist/",
        similarcombo: "c/similarcombo/",
        handpick: "../shopsearchindex/c/handpick/"
    }),
    g_srp_setPageUI("noresultrec", {
        norestip: "c/norestip/",
        alterword: "c/alterword/"
    }),
    g_srp_setPageUI("scenesearch", {
        banner: "c/banner/",
        loft: "c/loft/"
    });
