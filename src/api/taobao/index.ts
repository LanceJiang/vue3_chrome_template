import request from './request'
// import storage from "@/utils/storage"
import { $log_error } from "@/utils/util";

/*chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.type === 'xmlhttprequest') {
      const requestHeadersKeys = details.requestHeaders.map(item => item.name)

      if (requestHeadersKeys.indexOf('Referer') === -1) {
        details.requestHeaders.push({
          name: 'Referer',
          value: details.url
        })
      }

      if (requestHeadersKeys.indexOf('Upgrade-Insecure-Requests') === -1) {
        details.requestHeaders.push({
          name: 'Upgrade-Insecure-Requests',
          value: '1'
        })
      }

      console.log(details)

      return {
        requestHeaders: details.requestHeaders
      }
    }
  },
  { urls: [`*://!*api.home?*`] },
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
      console.log(title_str)
      const list: [] = await query_goodList(keyWord, i * pageNum).catch(e => {
        $log_error(e, `${title_str} 失败...`)
        return []
      })
      all_list = all_list.concat(list)
      if(list.length < pageNum) {
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

// 暂时不做处理 若有需要再做跟进
export function query_jump_goodDetail_pc (url = '') {
  return request({
    url,
    method: 'GET',
    responseAll: true
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
