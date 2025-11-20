import request from './request'
// import storage from '@/utils/storage'
import { $log_error, delayPromise, parseUrlQuery } from '@/utils/util'
import type { TaobaoOrder } from '@/common'
// import test from '@/config_constant'

// v3 已不支持 webRequest 处理  改用 declarativeNetRequest
/*chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    console.error(details, 'details....')

    if (details.type === 'xmlhttprequest') {

      const requestHeadersKeys = details.requestHeaders.map(item => item.name)
      // chrome 72以上已经不支持修改referer
      if (requestHeadersKeys.indexOf('Referer') === -1) {
        details.requestHeaders.push({
          name: 'Referer',
          // value: details.url
          value: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'
        })
      }

      // if (requestHeadersKeys.indexOf('Upgrade-Insecure-Requests') === -1) {
      //   details.requestHeaders.push({
      //     name: 'Upgrade-Insecure-Requests',
      //     value: '1'
      //   })
      // }

      console.log(details)

      return {
        requestHeaders: details.requestHeaders
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders']
)*/

// 重置/获取 亚马逊接口请求
export const setTaobaoBaseURL = (origin: string) => {
  if (origin) {
    request.defaults.baseURL = origin
  }
  return request.defaults.baseURL
}

/**
 * @description 获取商品列表（sellerId, marketplace, seller_name）
 * @returns {Promise<[]>}
 */
export function query_goodList(keyWord = '', s = 0) {
  return request({
    url: `https://s.taobao.com/search?q=${keyWord}&s=${s}`,
    method: 'GET'
  })
    .then((res: any) => {
      // 此方式 已经不再适用  todo 处理额外搜索查询数据
      /*// 不带g str.match(reg) 和 reg.exec(str) 相同
    // console.log(res.match(/g_page_config = (.*);/))
    // console.warn(/g_page_config = (.*);/.exec(res))
    // 获取 g_page_config ={捕获组};的 捕获组*/
      res = (res.match(/g_page_config = (.*);/) || [])[1]
      // todo 若res 获取不到 走另外的方式 需要进行研究尝试
      if (!res) {
        console.error('未匹配到 g_page_config 需要进行处理...')
      }
      return new Promise((resolve, reject) => {
        try {
          res = JSON.parse(res)
          // 商品列表
          // const good_list = res?.['mods']?.['itemlist']?.['data']?.['auctions'] || []
          const good_list = res['mods']['itemlist']['data']['auctions']
          // 默认keys
          const keys = [
            // 商品标题
            'raw_title',
            // 商品价格
            'view_price',
            // 快递费用
            'view_fee',
            // 商品来源地
            'item_loc',
            // 已付款人数展示
            'view_sales',
            // 店铺名称
            'nick',
            // 商品搜索id
            'nid'
          ]
          // 链接相关keys
          const link_keys = [
            // 商品图片
            'pic_url',
            // 商品详情链接
            'detail_url',
            // 店铺链接
            'shopLink'
          ]
          const list = good_list.map((v: any) => {
            const obj: any = {}
            // 默认key赋值
            keys.forEach((key) => {
              obj[key] = v[key]
            })
            // 链接key赋值
            link_keys.forEach((key) => {
              // 针对 link 配置协议
              obj[key] = `https:${(v[key] || '').replace(/https?:/g, '')}`
            })
            return obj
          })
          resolve(list)
        } catch (e) {
          reject(`获取g_page_config失败: ${e}`)
        }
      })
    })
    .catch((err) => {
      $log_error('获取taobao.com/search > g_page_config失败', err)
      throw '获取taobao.com/search > 获取g_page_config失败'
    })
}

// 获取当前搜索所有商品列表
/**
 * @description 获取当前搜索所有商品列表（keyWord）
 * @returns {Promise<[]>}
 */
export function query_goodListAll(keyWord = '') {
  let all_list: any[] = []
  // 淘宝每一页都有44个商品
  const pageNum = 44
  return new Promise(async (resolve) => {
    // 淘宝搜索最多100页
    for (let i = 0; i < 100; i++) {
      const title_str = `获取商品:${keyWord}, 第${i + 1}页`
      // console.log(title_str)
      let queryError = false
      const list: any[] = await query_goodList(keyWord, i * pageNum).catch((e) => {
        $log_error(e, `${title_str} 失败...`)
        queryError = true
        return []
      })
      all_list = all_list.concat(list)
      if (!queryError && list.length < pageNum) {
        break
      } else if (i !== 99) {
        console.time(title_str)
        await new Promise((resolve) => {
          setTimeout(resolve, Math.random() * 2000)
        })
        console.timeEnd(title_str)
      }
    }
    resolve(all_list)
  })
}

/**
 * @description 获取商品详情（nid）
 * @returns {Promise<[]>}
 */
export function query_goodDetail_mobile(id = '705124996327') {
  return request({
    url: `https://new.m.taobao.com/detail.htm?id=${id}`,
    method: 'GET'
    // headers: {"Cache-Control": "no-store"}
  })
    .then((res: any) => {
      // <script data-from="server">window.__INITIAL_DATA__={}</script>
      res = (res.match(/window\.__INITIAL_DATA__=(.*?)\<\/script\>/) || [])[1]
      /*
    // 通过创建dom 处理
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res
    res = (wrapper.querySelector('script[data-from="server"]').innerHTML).replace(/window.__INITIAL_DATA__=/g, '')
    */
      return new Promise((resolve, reject) => {
        try {
          res = JSON.parse(res)
          const obj = res.pageInitialProps || {}
          const _res = { componentsVO: obj.componentsVO, priceSectionData: obj.priceSectionData }
          resolve(_res)
        } catch (e) {
          reject(`获取m.taobao.com/detail > __INITIAL_DATA__失败: ${e}`)
        }
      })
    })
    .catch((err) => {
      console.log('获取m.taobao.com/detail失败', err)
      throw '获取m.taobao.com/detail失败'
    })
}

/**
 * @description 获取商品详情（nid）
 * @returns {Promise<[]>}
 */
// 暂时不做处理 若有需要再做跟进
export function query_goodDetail_pc(id = '705124996327') {
  /*{// taobao -> tmall  -> tmall_chaoshi 进行重定向跳转
    // 淘宝 -> 天猫 √
    taobao: 'https://item.taobao.com/item.htm?id=', // 淘宝
    tmall: 'https://detail.tmall.com/item.htm?id=', // 天猫
    天猫 -> 天猫超市 √
    tmall_chaoshi: 'https://chaoshi.detail.tmall.com/item.htm??id=', // 天猫超市
  }*/
  return request({
    url: `https://item.taobao.com/item.htm?id=${id}`,
    method: 'GET'
    // headers: {"Cache-Control": "no-store"}
  })
    .then((res) => {
      const wrapper = document.createElement('root')
      wrapper.innerHTML = res
      debugger
      return new Promise((resolve, reject) => {
        try {
          const price = wrapper.querySelector('input[name="current_price"]')
          resolve({
            price
          })
        } catch (e) {
          reject(`query_goodDetail_pc失败: ${e}`)
        }
      })
    })
    .catch((err) => {
      debugger
      return request({
        url: `https://chaoshi.detail.tmall.com/item.htm??id=${id}`,
        method: 'GET'
        // headers: {"Cache-Control": "no-store"}
      })
        .then((res) => {
          const wrapper = document.createElement('root')
          wrapper.innerHTML = res
          debugger
          return new Promise((resolve, reject) => {
            try {
              const price = wrapper.querySelector('input[name="current_price"]')
              resolve({
                price
              })
            } catch (e) {
              reject(`query_goodDetail_pc失败: ${e}`)
            }
          })
        })
        .catch((_err) => {
          console.log('query_goodDetail_pc失败', err)
          throw 'query_goodDetail_pc失败'
        })
    })
}

/**
 * @description 获取淘宝订单列表
 * @returns {Promise<[]>}
 */
// 由于插件不再支持修改 referer 导致 模拟请求 订单列表 获取不到数据 改用 content注入 https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm 页面 请求方式 在该页面内 进行获取 通过 sendMessage 返回background进行下一步处理
/*export const query_list_bought_items_pc = () => {
  // 经验证: 天猫/淘宝/天猫超市公用一个已买到宝贝链接
  /!*return request({
    url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm',
    method: 'GET'
  }).then(res => {
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res
    let data: any
    // res = (res.match(/var data = JSON.parse\('(.*)'\);/) || [])[1]
    res = (res.match(/var (data = JSON.parse\(.*\));/) || [])[1]
    eval(res)
    // console.error(res, 'res..........', data)
    // console.error(typeof res, 'res..........  type')
    return new Promise( (resolve, reject) => {
      try {
        // res = JSON.parse(res)
        resolve(data)
        // 商品列表
        /!*!// const good_list = res?.['mods']?.['itemlist']?.['data']?.['auctions'] || []
        const good_list = res['mods']['itemlist']['data']['auctions']
        // 默认keys
        const keys = [
          // 商品标题
          'raw_title',
          // 商品价格
          'view_price',
          // 快递费用
          'view_fee',
          // 商品来源地
          'item_loc',
          // 已付款人数展示
          'view_sales',
          // 店铺名称
          'nick',
          // 商品搜索id
          'nid',
        ]
        // 链接相关keys
        const link_keys = [
          // 商品图片
          'pic_url',
          // 商品详情链接
          'detail_url',
          // 店铺链接
          'shopLink',
        ]
        const list = good_list.map((v: any) => {
          const obj: any = {}
          // 默认key赋值
          keys.forEach(key => {
            obj[key] = v[key]
          })
          // 链接key赋值
          link_keys.forEach(key => {
            // 针对 link 配置协议
            obj[key] = `https:${(v[key] || '').replace(/https?:/g, '')}`
          })
          return obj
        })*!/
        // resolve(list)
      } catch (e) {
        console.error(e, 'eeeee')
        debugger
        reject(`获取g_page_config失败: ${e}`)
      }
    })
  }).catch(err => {
    debugger
  })*!/
  return request({
    url: 'https://buyertrade.taobao.com/trade/itemlist/asyncBought.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&_input_charset=utf8',
    method: 'POST',
    data: {
      pageNum: 2,
      pageSize: 50,
      prePageNo: 1
    },
    headers: {
      // 'bx-v': '2.5.0',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      // 'accept': 'application/json, text/javascript, *!/!*; q=0.01',
      // todo 由于 referer 不为 https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm 时, 没有data 数据, request请求 设置header referer 不允许 且 chrome.webRequest 处理referer chorome 72版本以上不再支持修改 固该方式不再适用  尝试 通过其他方式获取 [思考： 通过chrome.tab 打开 已买到的宝贝 https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?spm=a230r.1.1997525045.2.45612caeub9RQL 通过 注入的js 进行模拟客户操作尝试进行获取 ...]
      // 'Referer': 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'
    }
  }).then(res => {
    // console.error(res, 'res..........', data)
    // console.error(typeof res, 'res..........  type')
    return new Promise( (resolve, reject) => {
      try {
        // res = JSON.parse(res)
        resolve(res)
      } catch (e) {
        console.error(e, 'eeeee')
        debugger
        reject(`获取g_page_config失败: ${e}`)
      }
    })
  }).catch(err => {
    debugger
  })
}*/
/**
 * 通过淘宝订单号获取纯物流信息
 * @param orderId
 */
export const query_taobao_trade_trackingNumber = (orderId: string) => {
  /*// 交易成功 但是没有显示 查看物流的  获取 {isSuccess: "false"}
    query_taobao_trade_trackingNumber('1805880399546594069').then(res => console.error(res, 'res'))
    // 已退货的 为: {}
    query_taobao_trade_trackingNumber('1822776528808594069').then(res => console.error(res, 'res'))*/
  return request({
    url: `https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=${orderId}`,
    method: 'GET'
  }) /*.then(res => {
    console.warn(res, 'res  query_taobao_trade_trackingNumber')
    return res
  })*/
    .catch((err) => {
      console.error(
        err,
        'error by https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId'
      )
      return {}
    })
}

/**
 * 通过淘宝详情链接获取详情信息(单包裹快递时间从纯物流接口读取)
 * @param order
 */
export const query_taobao_trade_trackingNumber_byViewDetail = (order: Partial<TaobaoOrder>) => {
  const { local_viewDetail_url, orderId } = order
  // 通过重定向之后的路径一般为(目前验证全是) eg: //trade.taobao.com/trade/detail/trade_order_detail.htm?biz_order_id=1830202466507594069
  const common_taobao_redirect_handler = (res: string | object) => {
    // console.error(res, 'res.... common_taobao_redirect_handler')
    return new Promise((resolve, reject) => {
      try {
        // 形式如:<script> var data = JSON.parse({});
        // 数据监控拦截: 验证失败
        if (typeof res === 'object') {
          // eg: {ret: ['FAIL_SYS_USER_VALIDATE', 'RGV587_ERROR::SM::哎哟喂,被挤爆啦,请稍后重试'], data: {url:"https://trade.taobao.com:443//trade/detail/trade_o…Ftrade%2Fdetail%2Ftrade_order_detail.htm&x5step=2"}}
          return reject({ type: 'system_api', data: res })
        }
        let data: any
        // res = (res.match(/var data = JSON.parse\('(.*)'\);/) || [])[1]
        res = (res.match(/var (data = JSON.parse\(.*\));/) || [])[1]
        eval(res)
        // console.error(res, 'res..........', data)
        const obj = data.deliveryInfo
        // 运单号: data.logisticsNum
        // 物流公司: data.logisticsName
        let _res = [
          {
            expressName: obj.logisticsName,
            expressId: obj.logisticsNum,
            consignTime: undefined
          }
        ]
        // 当 showLogistics 为false 表示存在多个包裹 需要尝试从packageInfos获取快递集合
        // 多包裹类型订单
        if (!obj.showLogistics) {
          // 多包裹类型订单
          const lists: any[] = data.packageInfos?.list || []
          _res = lists.map((v) => ({
            // 物流公司
            expressName: v.companyName,
            // 运单号
            expressId: v.invoiceNo,
            // 快递发货时间
            consignTime: v.consignTime
          }))
          resolve(_res)
          return
        }
        // 单包裹类型无法获取到发货时间另做请求处理
        query_taobao_trade_trackingNumber(orderId).then((res: any) => {
          // console.log(`单包裹订单：${orderId}物流获取成功`, res)
          const _res_0 = _res[0]
          const address = res.address || []
          // 倒数第二条数据{place:'您的订单开始处理||等待揽收中', time: 'yyyy-MM-dd hh:mm:ss'}
          _res_0.consignTime = address[address.length - 2]?.time
          // 若详情物流公司获取为空 进行修正处理
          if ((!_res_0.expressName || _res_0.expressName === '—') && res.expressName) {
            _res_0.expressName = res.expressName
          }
          resolve(_res)
        })
      } catch (e) {
        reject({
          type: 'system_api',
          message: `query_taobao_trade_trackingNumber_byViewDetail [//trade.taobao.com/trade/detail/trade_item_detail.htm] 失败: ${e}`
        })
      }
    })
  }
  const handleConfig: { [key: string]: (res: any) => void } = {
    // 淘宝详情类型1
    // eg://tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069
    // todo 验证 直接通过 url 拼接跳转 能否获取到淘宝相关数据  todo  smthy 的数据
    '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm': (res) => {
      const wrapper = document.createElement('root')
      wrapper.innerHTML = res
      return new Promise((resolve, reject) => {
        try {
          const labels = [...wrapper.querySelectorAll('td.label')]
          // 物流公司
          const expressName = (
            (labels.find((_dom) => _dom?.innerText === '物流公司：') || {}).nextElementSibling
              ?.innerText || ''
          ).replace(/(^\s*)|(\s*$)/g, '')
          // 运单号
          const expressId = (
            (labels.find((_dom) => _dom.innerText === '运单号：') || {}).nextElementSibling
              ?.innerText || ''
          ).replace(/(^\s*)|(\s*$)/g, '')
          // todo 验证 多包裹类型进行处理
          resolve([
            {
              expressName,
              expressId
            }
          ])
        } catch (e) {
          reject({
            type: 'system_api',
            message: `query_taobao_trade_trackingNumber_byViewDetail [//tradearchive.taobao.com/trade/detail/trade_item_detail.htm] 失败: ${e}`
          })
        }
      })
    },
    // 淘宝详情类型2
    // eg://trade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1823572599339594069 -> 重定向 处理 验证√
    '//trade.taobao.com/trade/detail/trade_item_detail.htm': common_taobao_redirect_handler,
    // 淘宝详情类型3
    // eg://buyertrade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1830202466507594069
    '//buyertrade.taobao.com/trade/detail/trade_item_detail.htm': common_taobao_redirect_handler,
    // 天猫详情
    // eg://trade.tmall.com/detail/orderDetail.htm?bizOrderId=1823544375217594069
    '//trade.tmall.com/detail/orderDetail.htm': (res) => {
      return new Promise((resolve, reject) => {
        // todo.... 需要进行验证(天猫一单多包裹问题)
        // 形式如:<script>var detailData = {} \n \x3C/script>
        // res = (res.match(/var detailData = (.*)\n.*\<\/script\>/) || [])[1]
        console.error(res, 'res........')
        res = (res.match(/var detailData = (.*)/) || [])[1]
        try {
          res = JSON.parse(res)
          /*const obj = res.orders?.list?.[0]?.logistic?.content?.[0] || {}
          const _res = [{
            expressName: obj.companyName,
            expressId: obj.mailNo
          }]*/
          // 天猫多包裹的数据 需要 有数据 进行验证 todo...
          const list = res.orders?.list || []
          const _res = list.map((v: any) => {
            const info = v.logistic?.content[0] || {}
            return {
              expressName: info.companyName,
              expressId: info.mailNo
            }
          })
          // 第一单快递发货时间
          const consignTime_0 = (
            (res.stepbar.options || []).find((v) => v.content === '卖家发货') || {}
          ).time
          if (consignTime_0) {
            _res.forEach((v: any, index: number) => {
              v.consignTime = consignTime_0
              // 多包裹类型 发货时间 目前遇到的包裹中时间是一样的 若有不同再进行优化处理
              if (index > 0) {
                v.consignTime += ' tmall多包裹'
              }
            })
          }
          resolve(_res)
        } catch (e) {
          reject({
            type: 'system_api',
            message: `query_taobao_trade_trackingNumber_byViewDetail [//trade.tmall.com/detail/orderDetail.htm] 失败: ${e}`
          })
        }
      })
    }
  }
  const url =
    local_viewDetail_url!.indexOf('http') === 0
      ? local_viewDetail_url
      : `https:${local_viewDetail_url}`
  return request({
    url,
    method: 'GET'
  }).then((res) => {
    let handler_res = null
    const bool = Object.keys(handleConfig).some((url) => {
      if (local_viewDetail_url!.indexOf(url) === 0) {
        handler_res = handleConfig[url](res)
        return true
      }
    })
    // 查不到处理方法 提醒进行其他处理
    if (!bool) {
      $log_error(
        '匹配url类型获取失败 请做其他处理',
        `query_taobao_trade_trackingNumber_byViewDetail`
      )
    }
    return handler_res
  })
}

function signFn(a) {
  function b(a, b) {
    return (a << b) | (a >>> (32 - b))
  }
  function c(a, b) {
    let c, d, e, f, g
    return (
      (e = 2147483648 & a),
      (f = 2147483648 & b),
      (c = 1073741824 & a),
      (d = 1073741824 & b),
      (g = (1073741823 & a) + (1073741823 & b)),
      c & d
        ? 2147483648 ^ g ^ e ^ f
        : c | d
        ? 1073741824 & g
          ? 3221225472 ^ g ^ e ^ f
          : 1073741824 ^ g ^ e ^ f
        : g ^ e ^ f
    )
  }
  function d(a, b, c) {
    return (a & b) | (~a & c)
  }
  function e(a, b, c) {
    return (a & c) | (b & ~c)
  }
  function f(a, b, c) {
    return a ^ b ^ c
  }
  function g(a, b, c) {
    return b ^ (a | ~c)
  }
  function h(a, e, f, g, h, i, j) {
    return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e)
  }
  function i(a, d, f, g, h, i, j) {
    return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d)
  }
  function j(a, d, e, g, h, i, j) {
    return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d)
  }
  function k(a, d, e, f, h, i, j) {
    return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d)
  }
  function l(a) {
    for (
      var b,
        c = a.length,
        d = c + 8,
        e = (d - (d % 64)) / 64,
        f = 16 * (e + 1),
        g = new Array(f - 1),
        h = 0,
        i = 0;
      c > i;

    )
      (b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (a.charCodeAt(i) << h)), i++
    return (
      (b = (i - (i % 4)) / 4),
      (h = (i % 4) * 8),
      (g[b] = g[b] | (128 << h)),
      (g[f - 2] = c << 3),
      (g[f - 1] = c >>> 29),
      g
    )
  }
  function m(a) {
    let b,
      c,
      d = '',
      e = ''
    for (c = 0; 3 >= c; c++)
      (b = (a >>> (8 * c)) & 255), (e = '0' + b.toString(16)), (d += e.substr(e.length - 2, 2))
    return d
  }
  function n(a) {
    a = a.replace(/\r\n/g, '\n')
    for (var b = '', c = 0; c < a.length; c++) {
      const d = a.charCodeAt(c)
      128 > d
        ? (b += String.fromCharCode(d))
        : d > 127 && 2048 > d
        ? ((b += String.fromCharCode((d >> 6) | 192)), (b += String.fromCharCode((63 & d) | 128)))
        : ((b += String.fromCharCode((d >> 12) | 224)),
          (b += String.fromCharCode(((d >> 6) & 63) | 128)),
          (b += String.fromCharCode((63 & d) | 128)))
    }
    return b
  }
  let o,
    p,
    q,
    r,
    s,
    t,
    u,
    v,
    w,
    x = [],
    y = 7,
    z = 12,
    A = 17,
    B = 22,
    C = 5,
    D = 9,
    E = 14,
    F = 20,
    G = 4,
    H = 11,
    I = 16,
    J = 23,
    K = 6,
    L = 10,
    M = 15,
    N = 21
  for (
    a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0;
    o < x.length;
    o += 16
  )
    (p = t),
      (q = u),
      (r = v),
      (s = w),
      (t = h(t, u, v, w, x[o + 0], y, 3614090360)),
      (w = h(w, t, u, v, x[o + 1], z, 3905402710)),
      (v = h(v, w, t, u, x[o + 2], A, 606105819)),
      (u = h(u, v, w, t, x[o + 3], B, 3250441966)),
      (t = h(t, u, v, w, x[o + 4], y, 4118548399)),
      (w = h(w, t, u, v, x[o + 5], z, 1200080426)),
      (v = h(v, w, t, u, x[o + 6], A, 2821735955)),
      (u = h(u, v, w, t, x[o + 7], B, 4249261313)),
      (t = h(t, u, v, w, x[o + 8], y, 1770035416)),
      (w = h(w, t, u, v, x[o + 9], z, 2336552879)),
      (v = h(v, w, t, u, x[o + 10], A, 4294925233)),
      (u = h(u, v, w, t, x[o + 11], B, 2304563134)),
      (t = h(t, u, v, w, x[o + 12], y, 1804603682)),
      (w = h(w, t, u, v, x[o + 13], z, 4254626195)),
      (v = h(v, w, t, u, x[o + 14], A, 2792965006)),
      (u = h(u, v, w, t, x[o + 15], B, 1236535329)),
      (t = i(t, u, v, w, x[o + 1], C, 4129170786)),
      (w = i(w, t, u, v, x[o + 6], D, 3225465664)),
      (v = i(v, w, t, u, x[o + 11], E, 643717713)),
      (u = i(u, v, w, t, x[o + 0], F, 3921069994)),
      (t = i(t, u, v, w, x[o + 5], C, 3593408605)),
      (w = i(w, t, u, v, x[o + 10], D, 38016083)),
      (v = i(v, w, t, u, x[o + 15], E, 3634488961)),
      (u = i(u, v, w, t, x[o + 4], F, 3889429448)),
      (t = i(t, u, v, w, x[o + 9], C, 568446438)),
      (w = i(w, t, u, v, x[o + 14], D, 3275163606)),
      (v = i(v, w, t, u, x[o + 3], E, 4107603335)),
      (u = i(u, v, w, t, x[o + 8], F, 1163531501)),
      (t = i(t, u, v, w, x[o + 13], C, 2850285829)),
      (w = i(w, t, u, v, x[o + 2], D, 4243563512)),
      (v = i(v, w, t, u, x[o + 7], E, 1735328473)),
      (u = i(u, v, w, t, x[o + 12], F, 2368359562)),
      (t = j(t, u, v, w, x[o + 5], G, 4294588738)),
      (w = j(w, t, u, v, x[o + 8], H, 2272392833)),
      (v = j(v, w, t, u, x[o + 11], I, 1839030562)),
      (u = j(u, v, w, t, x[o + 14], J, 4259657740)),
      (t = j(t, u, v, w, x[o + 1], G, 2763975236)),
      (w = j(w, t, u, v, x[o + 4], H, 1272893353)),
      (v = j(v, w, t, u, x[o + 7], I, 4139469664)),
      (u = j(u, v, w, t, x[o + 10], J, 3200236656)),
      (t = j(t, u, v, w, x[o + 13], G, 681279174)),
      (w = j(w, t, u, v, x[o + 0], H, 3936430074)),
      (v = j(v, w, t, u, x[o + 3], I, 3572445317)),
      (u = j(u, v, w, t, x[o + 6], J, 76029189)),
      (t = j(t, u, v, w, x[o + 9], G, 3654602809)),
      (w = j(w, t, u, v, x[o + 12], H, 3873151461)),
      (v = j(v, w, t, u, x[o + 15], I, 530742520)),
      (u = j(u, v, w, t, x[o + 2], J, 3299628645)),
      (t = k(t, u, v, w, x[o + 0], K, 4096336452)),
      (w = k(w, t, u, v, x[o + 7], L, 1126891415)),
      (v = k(v, w, t, u, x[o + 14], M, 2878612391)),
      (u = k(u, v, w, t, x[o + 5], N, 4237533241)),
      (t = k(t, u, v, w, x[o + 12], K, 1700485571)),
      (w = k(w, t, u, v, x[o + 3], L, 2399980690)),
      (v = k(v, w, t, u, x[o + 10], M, 4293915773)),
      (u = k(u, v, w, t, x[o + 1], N, 2240044497)),
      (t = k(t, u, v, w, x[o + 8], K, 1873313359)),
      (w = k(w, t, u, v, x[o + 15], L, 4264355552)),
      (v = k(v, w, t, u, x[o + 6], M, 2734768916)),
      (u = k(u, v, w, t, x[o + 13], N, 1309151649)),
      (t = k(t, u, v, w, x[o + 4], K, 4149444226)),
      (w = k(w, t, u, v, x[o + 11], L, 3174756917)),
      (v = k(v, w, t, u, x[o + 2], M, 718787259)),
      (u = k(u, v, w, t, x[o + 9], N, 3951481745)),
      (t = c(t, p)),
      (u = c(u, q)),
      (v = c(v, r)),
      (w = c(w, s))
  const O = m(t) + m(u) + m(v) + m(w)
  return O.toLowerCase()
}
const getToken = async () => {
  const key = '_m_h5_tk' // _m_h5_c || _m_h5_tk_enc
  /*// from https://g.alicdn.com/mtb/lib-mtop/2.7.0/mtop.js
  const b = new RegExp("(?:^|;\\s*)" + key + "\\=([^;]+)(?:;\\s*|$)").exec(document.cookie);
  const value = b ? b[1] : void 0
  if (value) return value.split('_')[0]*/
  return new Promise((resolve) => {
    // @ts-ignore
    chrome.cookies.get({ url: 'https://taobao.com', name: key }, (cookie) => {
      console.log(cookie, 'cookie')
      resolve(cookie?.value?.split('_')[0])
    })
    // return resolve('392acb6079dc3f374a1887119f574cfd_1741871966331'.split('_')[0])
    /*chrome.cookies.getAll({ name: key }, (cookies) => {
      console.error(cookies)
      resolve(cookies[0]?.value?.split('_')[0])
    })*/
  })
}
/**
 * 通过淘宝物流详情链接获取物流信息
 * @param order
 */
export const query_taobao_trade_trackingNumber_by_viewLogistic = async (
  order: Partial<TaobaoOrder>
) => {
  const { /*local_express_url,*/ orderId } = order

  // 编码 encodeURIComponent || URLSearchParams || encodeURI 完整URL编码
  // 解码 decodeURIComponent || decodeURI
  const token = await getToken()
  if (!token) {
    // token失效 验证失败 (taobao对cookie做了 partition key site限制 导致无法通过chrome.cookies.get获取信息)
    return Promise.reject({
      type: 'token_lose',
      message: `query_taobao_trade_trackingNumber_by_viewLogistic 失败: token 失效`
    })
  }
  const getLogistics = (
    _data: { orderId: string; logisticsOrderId?: string; mailNo?: string /*test?: any*/ },
    _type = 'detail' | 'list'
  ) => {
    // data: {orderId, logisticsOrderId, mailNo, // test: Ti.test(无数据)}
    /**
     * jsv: 2.7.0
     * appKey: 12574478 // 固定
     * t: 1741765712947 // +new Date() // token 看上面的方式
     * sign: 348cb140d033b514b486fe895a650efe signFn(`${token}&${+new Date()}&${appKey}&${'{"orderId":"2487900612967594069","logisticsOrderId":"LP00718656805085","mailNo":"434455364534537"}'}`)
     * api: mtop.taobao.logistics.detailorlist.query // 固定
     * v: '1.0' // 固定
     * needLogin: true // 固定
     * LoginRequest: true // 固定
     * type: json // 固定
     * dataType: json // 固定
     * timeout: 20000 // 固定 or 不用???
     * ttid: #t#ip##_h5_web_default   通过信息调用 得出的是固定的
     * preventFallback: true // 固定???
    // callback: mtopjsonp3 // 可不用 获取list
    data: '{"orderId":"2487900612967594069"}' // a) 获取list
    data: '{"orderId":"2487900612967594069","logisticsOrderId":"LP00718656805085","mailNo":"434455364534537"}' // b) 获取 物流详情
     signFn(`${token}&${+new Date()}&${appKey}&${'{"orderId":"2487900612967594069","logisticsOrderId":"LP00718656805085","mailNo":"434455364534537"}'}`)
     */
    const appKey = '12574478'
    const t = +new Date()
    const data = JSON.stringify(_data)
    const sign = signFn(`${token}&${t}&${appKey}&${data}`)
    const api = 'mtop.taobao.logistics.detailorlist.query'
    const type = 'json'
    // const ttid = '#t#ip##_h5_web_default' // %23t%23ip%23%23_h5_web_default
    const queryStr = new URLSearchParams({
      jsv: '2.7.0',
      appKey,
      t,
      sign,
      api,
      v: '1.0',
      needLogin: true,
      LoginRequest: true,
      type,
      dataType: type,
      timeout: 20000,
      ttid: '#t#ip##_h5_web_default',
      preventFallback: true,
      data
    })
    const url = `https://h5api.m.taobao.com/h5/${api}/1.0/?${queryStr}`
    return request({
      url,
      method: 'GET'
    }).then(async (res) => {
      const retStr = res.ret?.join(',')
      if (retStr.indexOf('FAIL_SYS_USER_VALIDATE') > -1) {
        // 验证失败
        return Promise.reject({
          type: 'system_api',
          message: `query_taobao_trade_trackingNumber_by_viewLogistic 失败`,
          data: res
        })
      }
      // FAIL_SYS_ILLEGAL_ACCESS::非法请求 // 监听淘宝非法获取 todo???
      // fields: {"icon":"https://img.alicdn.com/imgextra/i4/6000000007961/O1CN01V7RTmj28gBqX1cNrG_!!6000000007961-2-urc.png","mailNo":"434455364534629","name":"韵达快递","phoneNum":"95546"}
      // 快递信息
      const compony_fields = res.data?.data?.popupBodyCompony?.fields
      let expressItem = {}
      if (compony_fields) {
        expressItem = {
          expressName: compony_fields.name,
          expressId: compony_fields.mailNo
          // consignTime:
        }
        if (_type === 'list') {
          return [expressItem]
        }
      }
      if (_type === 'detail') {
        // 获取的是详情
        return expressItem
      } else {
        // 获取的是list
        const data = res.data || {}
        const endpoint = data.endpoint || {}
        if (endpoint.page === 'logisticsPackageList') {
          const data_ = data.data || {}
          const pakcages = []
          Object.keys(data_).forEach((key) => {
            const item = data_[key] || {}
            // console.error(item, item.tag)
            // 找到包裹数据
            if (item.tag === 'pakcage') {
              // fields: {"foldItems":[{"pic":"https://img.alicdn.com/tps//i1/2219509495/O1CN01glDW452K0lXgg5AvU_!!2219509495.jpg"}],"hightLight":"false","numInfo":"共1件","rightBtnText":"详细信息","rightBtnUrl":"/app/dinamic/h5-tb-logistics/home?orderId=2487900612967594069&logisticsOrderId=LP00718656805085&mailNo=434455364534537","subTitle":"包裹1","title":"已签收 "}
              // => orderId, logisticsOrderId, mailNo
              const params = parseUrlQuery(item.fields?.rightBtnUrl || '')
              pakcages.push(params)
            }
          })
          return Promise.all(pakcages.map((params) => getLogistics(params, 'detail')))
        }
        return []
      }
    })
  }

  return getLogistics({ orderId }, 'list')
  /*[{
    expressName: obj.logisticsName,
    expressId: obj.logisticsNum,
    consignTime: undefined
  }]*/
}

// 暂时不做处理 若有需要再做跟进
export function query_jump_goodDetail_pc(url = '') {
  return request({
    url,
    method: 'GET'
    // responseAll: true
  })
    .then((res) => {
      console.log(res, 'res')
      /* const { data, request } = res
    const responseURL = request.responseURL
    debugger*/
      const wrapper = document.createElement('root')
      wrapper.innerHTML = res // https://item.taobao.com/item.htm?id=547826051836
      debugger
      return new Promise((resolve, reject) => {
        try {
          const price = wrapper.querySelector('input[name="current_price"]')
          resolve({
            price
          })
        } catch (e) {
          reject(`query_goodDetail_pc失败: ${e}`)
        }
      })
    })
    .catch((err) => {
      console.log('query_goodDetail_pc失败', err)
      throw 'query_goodDetail_pc失败'
    })
}

/**
 * @description 获取当前站点数据（sellerId, marketplace, seller_name）
 * @returns {Promise<[]>}
 */
/*
export function query_curSiteDropdown () {
  return request({
    url: `/trim/component/partner-dropdown?timestamp=${+new Date()}`,
    method: 'GET',
    headers: {"Cache-Control": "no-store"}
  }).then(res => {
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res
    return new Promise( (resolve, reject) => {
      try {
        const switcher = wrapper.querySelector('#partner-switcher')
        const sellerId = switcher.getAttribute('data-merchant_selection').split('.').pop() // 'amzn1.merchant.o.A367GJUEQYVM4R'
        const accountId = switcher.getAttribute("data-partner_selection") // 'amzn1.pa.o.A19J9R6NRIUM4H'
        const marketplace = switcher.getAttribute('data-marketplace_selection') // 'A2EUQ1WTGCTBG2'
        const seller_name = ((switcher.querySelector('button b') || '').innerText || '').replace(/(^\s*)|(\s*$)/g, "")  // 'CHENG  LEI'
        resolve({
          sellerId,
          accountId,
          marketplace,
          seller_name
        })
      } catch (e) {
        reject(`获取当前站点(partner-dropdown)失败: ${e}`)
      }
    })
  }).catch(err => {
    console.log('获取当前站点(partner-dropdown)失败(断网/超时/被重定向)', err)
    throw '获取当前站点(partner-dropdown)失败(断网/超时/被重定向)'
  })
}*/
