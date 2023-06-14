import request from './request'
// import storage from "@/utils/storage"
import { $log_error } from "@/utils/util";
import type {TaobaoOrder} from "@/common";
// import test from "@/config_constant";

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
  if(origin) {
    request.defaults.baseURL = origin
  }
  return request.defaults.baseURL
}

/**
 * @description 获取商品列表（sellerId, marketplace, seller_name）
 * @returns {Promise<[]>}
 */
export function query_goodList (keyWord = '', s = 0) {
  return request({
    url: `https://s.taobao.com/search?q=${keyWord}&s=${s}`,
    method: 'GET',
  }).then((res: any) => {
    /*// 不带g str.match(reg) 和 reg.exec(str) 相同
    // console.log(res.match(/g_page_config = (.*);/))
    // console.warn(/g_page_config = (.*);/.exec(res))
    // 获取 g_page_config ={捕获组};的 捕获组*/
    res = (res.match(/g_page_config = (.*);/) || [])[1]
    // todo 若res 获取不到 走另外的方式 需要进行研究尝试
    if(!res) {
      console.error('未匹配到 g_page_config 需要进行处理...')
    }
    return new Promise( (resolve, reject) => {
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
        })
        resolve(list)
      } catch (e) {
        reject(`获取g_page_config失败: ${e}`)
      }
    })
  }).catch(err => {
    $log_error('获取taobao.com/search > g_page_config失败', err)
    throw '获取taobao.com/search > 获取g_page_config失败'
  })
}

// 获取当前搜索所有商品列表
/**
 * @description 获取当前搜索所有商品列表（keyWord）
 * @returns {Promise<[]>}
 */
export function query_goodListAll (keyWord = '') {
  let all_list: any[] = []
  // 淘宝每一页都有44个商品
  const pageNum = 44
  return new Promise(async (resolve) => {
    // 淘宝搜索最多100页
    for(let i = 0; i < 100; i++) {
      const title_str = `获取商品:${keyWord}, 第${i+1}页`
      // console.log(title_str)
      let queryError = false
      const list: any[] = await query_goodList(keyWord, i * pageNum).catch(e => {
        $log_error(e, `${title_str} 失败...`)
        queryError = true
        return []
      })
      all_list = all_list.concat(list)
      if(!queryError && list.length < pageNum) {
        break
      } else if(i !== 99) {
        console.time(title_str)
        await new Promise(resolve => {
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
export function query_goodDetail_mobile (id = '705124996327') {
  return request({
    url: `https://new.m.taobao.com/detail.htm?id=${id}`,
    method: 'GET',
    // headers: {"Cache-Control": "no-store"}
  }).then((res: any) => {
    // <script data-from="server">window.__INITIAL_DATA__={}</script>
    res = (res.match(/window\.__INITIAL_DATA__=(.*?)\<\/script\>/) || [])[1]
    /*
    // 通过创建dom 处理
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res
    res = (wrapper.querySelector('script[data-from="server"]').innerHTML).replace(/window.__INITIAL_DATA__=/g, '')
    */
    return new Promise( (resolve, reject) => {
      try {
        res = JSON.parse(res)
        const obj = res.pageInitialProps || {}
        const _res = {componentsVO: obj.componentsVO, priceSectionData: obj.priceSectionData}
        resolve(_res)
      } catch (e) {
        reject(`获取m.taobao.com/detail > __INITIAL_DATA__失败: ${e}`)
      }
    })
  }).catch(err => {
    console.log('获取m.taobao.com/detail失败', err)
    throw '获取m.taobao.com/detail失败'
  })
}

/**
 * @description 获取商品详情（nid）
 * @returns {Promise<[]>}
 */
// 暂时不做处理 若有需要再做跟进
export function query_goodDetail_pc (id = '705124996327') {
  /*{// taobao -> tmall  -> tmall_chaoshi 进行重定向跳转
    // 淘宝 -> 天猫 √
    taobao: 'https://item.taobao.com/item.htm?id=', // 淘宝
    tmall: 'https://detail.tmall.com/item.htm?id=', // 天猫
    天猫 -> 天猫超市 √
    tmall_chaoshi: 'https://chaoshi.detail.tmall.com/item.htm??id=', // 天猫超市
  }*/
  return request({
    url: `https://item.taobao.com/item.htm?id=${id}`,
    method: 'GET',
    // headers: {"Cache-Control": "no-store"}
  }).then(res => {
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res
    debugger
    return new Promise( (resolve, reject) => {
      try {
        const price = wrapper.querySelector('input[name="current_price"]')
        resolve({
          price
        })
      } catch (e) {
        reject(`query_goodDetail_pc失败: ${e}`)
      }
    })
  }).catch(err => {
    debugger
    return request({
      url: `https://chaoshi.detail.tmall.com/item.htm??id=${id}`,
      method: 'GET',
      // headers: {"Cache-Control": "no-store"}
    }).then(res => {
      const wrapper = document.createElement('root')
      wrapper.innerHTML = res
      debugger
      return new Promise( (resolve, reject) => {
        try {
          const price = wrapper.querySelector('input[name="current_price"]')
          resolve({
            price
          })
        } catch (e) {
          reject(`query_goodDetail_pc失败: ${e}`)
        }
      })
    }).catch(_err => {
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
  })/*.then(res => {
    console.warn(res, 'res  query_taobao_trade_trackingNumber')
    return res
  })*/.catch(err => {
    console.error(err, 'error by https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId')
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
  const common_taobao_redirect_handler = (res: string) => {
    // 形式如:<script> var data = JSON.parse({});
    let data: any
    // res = (res.match(/var data = JSON.parse\('(.*)'\);/) || [])[1]
    res = (res.match(/var (data = JSON.parse\(.*\));/) || [])[1]
    eval(res)
    // console.error(res, 'res..........', data)
    return new Promise( (resolve, reject) => {
      try {
        const obj = data.deliveryInfo
        // 运单号: data.logisticsNum
        // 物流公司: data.logisticsName
        let _res = [{
          expressName: obj.logisticsName,
          expressId: obj.logisticsNum,
          consignTime: undefined
        }]
        // 当 showLogistics 为false 表示存在多个包裹 需要尝试从packageInfos获取快递集合
        // 多包裹类型订单
        if(!obj.showLogistics) {
          // 多包裹类型订单
          const lists: any[] = data.packageInfos?.list || []
          _res = lists.map(v => ({
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
          if((!_res_0.expressName || _res_0.expressName === '—') && res.expressName) {
            _res_0.expressName = res.expressName
          }
          resolve(_res)
        })
      } catch (e) {
        reject(`query_taobao_trade_trackingNumber_byViewDetail [//trade.taobao.com/trade/detail/trade_item_detail.htm] 失败: ${e}`)
      }
    })
  }
  const handleConfig: {[key: string]: (res: any) => void} = {
   // 淘宝详情类型1
   // eg://tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069
   // todo 验证 直接通过 url 拼接跳转 能否获取到淘宝相关数据  todo  smthy 的数据
   '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm': (res) => {
     const wrapper = document.createElement('root')
     wrapper.innerHTML = res
     return new Promise( (resolve, reject) => {
       try {
         const labels = [...wrapper.querySelectorAll('td.label')]
         // 物流公司
         const expressName = ((labels.find(_dom => _dom?.innerText === '物流公司：') || {}).nextElementSibling?.innerText || '').replace(/(^\s*)|(\s*$)/g, "")
         // 运单号
         const expressId = ((labels.find(_dom => _dom.innerText === '运单号：') || {}).nextElementSibling?.innerText || '').replace(/(^\s*)|(\s*$)/g, "")
         // todo 验证 多包裹类型进行处理
         resolve([{
           expressName,
           expressId
         }])
       } catch (e) {
         reject(`query_taobao_trade_trackingNumber_byViewDetail [//tradearchive.taobao.com/trade/detail/trade_item_detail.htm] 失败: ${e}`)
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
     // todo.... 需要进行验证(天猫一单多包裹问题)
     // 形式如:<script>var detailData = {} \n \x3C/script>
     // res = (res.match(/var detailData = (.*)\n.*\<\/script\>/) || [])[1]
     res = (res.match(/var detailData = (.*)/) || [])[1]
     return new Promise( (resolve, reject) => {
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
         const consignTime_0 = ((res.stepbar.options || []).find(v => v.content === '卖家发货') || {}).time
         if(consignTime_0) {
           _res[0].consignTime = consignTime_0
         }
         // 多包裹类型 发货时间 需要另做处理 todo...
         // 提示添加处理(方便从订单进行查询跟进) temptemptemp
         if(_res.length > 1) {
           _res[1].consignTime = '天猫多包裹发货时间(todo)'
         }
         resolve(_res)
       } catch (e) {
         reject(`query_taobao_trade_trackingNumber_byViewDetail [//trade.tmall.com/detail/orderDetail.htm] 失败: ${e}`)
       }
     })
   }
 }
  const url = local_viewDetail_url!.indexOf('http') === 0 ? local_viewDetail_url : `https:${local_viewDetail_url}`
  return request({
    url,
    method: 'GET'
  }).then(res => {
    let handler_res = null
    const bool = Object.keys(handleConfig).some(url => {
      if(local_viewDetail_url!.indexOf(url) === 0) {
        handler_res = handleConfig[url](res)
        return true
      }
    })
    // 查不到处理方法 提醒进行其他处理
    if(!bool) {
      $log_error('匹配url类型获取失败 请做其他处理', `query_taobao_trade_trackingNumber_byViewDetail`)
    }
    return handler_res
  })
}
// 暂时不做处理 若有需要再做跟进
export function query_jump_goodDetail_pc (url = '') {
  return request({
    url,
    method: 'GET',
    // responseAll: true
  }).then(res => {
    console.log(res, 'res')
/*    const { data, request } = res
    const responseURL = request.responseURL
    debugger*/
    const wrapper = document.createElement('root')
    wrapper.innerHTML = res // https://item.taobao.com/item.htm?id=547826051836
    debugger
    return new Promise( (resolve, reject) => {
      try {
        const price = wrapper.querySelector('input[name="current_price"]')
        resolve({
          price
        })
      } catch (e) {
        reject(`query_goodDetail_pc失败: ${e}`)
      }
    })
  }).catch(err => {
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
