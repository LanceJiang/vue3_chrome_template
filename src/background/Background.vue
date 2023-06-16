<script lang="ts">
import {defineComponent, onMounted} from 'vue';
import {
  query_goodListAll,
  query_goodList,
  query_goodDetail_mobile,
  query_goodDetail_pc,
  query_taobao_trade_trackingNumber,
  // query_list_bought_items_pc,
  query_jump_goodDetail_pc,
  query_taobao_trade_trackingNumber_byViewDetail
} from '@/api/taobao';
import envConfig from '@/config_constant'
import storage from "@/utils/storage"
import type {MessageRequest} from "@/common";
import {delayPromise} from "@/utils/util";
import {
  useBackground,
  updateBgMsg,
  chromeSendMessage,
  update_taobao_loseOrder_ids,
  update_taobao_orderList_error,
  update_taobao_orderList_errorOne,
  tryDownLoadDataToExcel
} from "./hooks/useBackground";

/**
 * 连接给contentJs注入的文件进行消息传递
 * @param config
 */
const sendMessageToContentScript = (config = {}) => {
  const { message, callback = (...args) => console.error(...args), tabsFilter = (tabs) => tabs.filter(v => v.url) } = config
  // 给每个 符合的 都给提示
  // 由于 currentWindow 时 通过插件获取debugger 获取不到数据 为了方便测试用于区分
  const queryConfig = { /*url: 'https://!*.taobao.com/!*',  active: true*/ }
  // 生产环境
  // if(!envConfig.IS_DEV) {
  //   queryConfig.currentWindow = true
  // }
  chrome.tabs.query(queryConfig, (tabs) => {
    // 如果有 url 的话 证明 是 在manifest 授权 且 也授权 content_scripts 的数据 【即后台页面数据】
    // 条件过滤 tabs
    let filterTabs = typeof tabsFilter === "function" ? tabsFilter(tabs) : tabs.filter((v: any) => v.url)
    console.error(tabs, 'tabs filterTabs', filterTabs)
    if(filterTabs.length) {
      filterTabs.map((tab, i) => {
        chrome.tabs.sendMessage(tab.id, message as MessageRequest, (response) => {
          const error: any = chrome.runtime.lastError
          if (error) {
            console.log(tab, error.message, 'chrome.runtime.lastError by [sendMessageToContentScript]')
            callback({ message: `通过tabs.sendMessage 处理失败:编号#${i}, 请重新尝试处理~`, code: 401 })
            // do you work, that's it. No more unchecked error
          } else {
            callback({ code: 200, data: response })
          }
        })
      })
    } else {
      callback({ message: '未查到匹配的tabs, 请重新尝试处理~', code: 400 })
    }
  })
}
export default defineComponent({
  beforeUnmount() {
    console.log('bg 卸载')
    window.$bg = null
  },
  setup() {
    const {
      states,
      // updateBgMsg,
      // chromeSendMessage
      query_asyncBought_pcAllTrackingOrders,
      try_query_taobao_trade_trackingNumber_byViewDetailAll,
      notificationTypeOpts,
      createNotification
    } = useBackground()
    window.test_onlyTest = () => {
      createNotification(notificationTypeOpts.onlyTest)
    }
    window.test_taobao_system_api = () => {
      createNotification(notificationTypeOpts.taobao_system_api)
    }
    // 初始化
    chrome.runtime.onInstalled.addListener(details => {
      console.log('欢迎使用 vue3_crx_template')
      const curVersion = details.previousVersion
      console.log(`当前版本：${curVersion || '- -'}`)
      // 当版本不一致 清空原来存留的历史数据
      const lastVersionKey = 'bg_tool_version'
      const lastVersion = storage.ls_get(lastVersionKey)
      if (curVersion !== lastVersion) {
          localStorage.clear() // 清空原数据
          storage.ls_set(lastVersionKey, curVersion)
      }
    })
    /**
     * 接收来自popup和content_script发来的信息请求
     */
    chrome.runtime.onMessage.addListener((message: MessageRequest, sender, sendResponse) => {
      console.log(message, 'message')
      switch (message.type) {
        case 'bg_query_taobao_asyncBought_pcAll': {
          const { data, code } = message
          // 获取成功处理 物流信息
          if(code === 200) {
            console.error('爬取的淘宝数据为： ', data)
            // orders: 有效订单, loseOrder_ids: 无物流且不为交易成功的订单
            const { orders, loseOrder_ids } = data
            states.workStatus = '2.工作中(get订单列表ok)'
            // 更新条件失效的订单
            update_taobao_loseOrder_ids(loseOrder_ids)
            // 获取所有订单物流信息
            query_asyncBought_pcAllTrackingOrders(orders)
          } else {
            console.error('bg_query_taobao_asyncBought_pcAll 获取失败', data)
          }
          sendResponse({
            code: 200,
            data: null,
            message: '[bg_query_taobao_asyncBought_pcAll]请求接收成功'
          })
          break
        }
        /*case 'XXXXXXX': {
          // 获取相关网页
          new Promise(resolve => {
            setTimeout(() => {
              resolve({data: '测试.....'})
            }, 4000)
          }).then(res => {
              sendResponse({ code: 200, data: res })
            })
          break
        }*/
        default: {
          sendResponse({
            code: 0,
            data: null,
            message: `错误请求，没有找到type=“${message.type}”的方法`
          })
        }
      }
      return true
    })
    // 清除历史错误数据
    const clear_localErrorData = () => {
      // 1.清空条件失效的订单
      update_taobao_loseOrder_ids([])
      // 2.清空bg_淘宝订单数据_失败
      update_taobao_orderList_error([])
    }
    /**
     * 尝试连接 list_bought_items 页面 通知 该页面注入的方法 获取订单列表
     * @param params
     */
    const try_connect_content_query_taobao_asyncBought_pcAll = (params) => {
      states.taobao_orderList_loading = true
      // 获取淘宝所有订单
      let workingUrl = 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'
      // 需要添加tabCode 保证数据获取正常
      if (params.tabCode) {
        workingUrl += `?tabCode=${params.tabCode}`
      }
      // 匹配tabs 进行过滤
      const tabsFilter = (tabs) => {
        const _tabs = []
        tabs.some(v => {
          if(v.url && v.url.indexOf(workingUrl) === 0) {
            _tabs.unshift(v)
            if (v.active) return true
          }
        })
        return _tabs.length ? [_tabs[0]] : []
      };
      let idx = 0
      const localRun = () => {
        console.log(idx, 'idx..................')
        if(idx > 1) return
        idx++
        // 清空 历史的错误数据列表
        clear_localErrorData()
        // 连接content注入 进行数据获取
        sendMessageToContentScript({
          message: { type: 'content_query_taobao_asyncBought_pcAll', data: params },
          callback: ({ data, message, code }) => {
            console.log(data, message, code, 'data, message, code')
            if (code === 400) {
              states.taobao_orderList_loading = false
              // 若找不到 合适的 tabs， 新开一个 订单页面
              chrome.tabs.create({ url: workingUrl })
              // 因为该页面加载比较慢 6s后再次尝试获取订单列表
              setTimeout(localRun, 6000)
            } else if (code === 401) {
              // pop提示失败
              // updateBgMsg(message, false)
              const msg = '当前打开的淘宝 我的订单页 关联失效，建议关闭原我的淘宝订单页，进行重试'
              states.taobao_orderList_loading = false
              updateBgMsg(msg, false)
            } else {
              // 消息派发成功: 更新popup 工作状态描述
              states.workStatus = '1.工作中(get订单列表)'
            }
          },
          tabsFilter
        })
      }
      localRun()
    }
    // 测试 通过纯物流获取跟踪号
    const try_query_taobao_trade_trackingNumber = (info = {
      orderId: '1796441988877594069',
      local_viewDetail_url: '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069'
    }) => {
      console.time(`try_query_taobao_trade_trackingNumber${info.orderId}`)
      return query_taobao_trade_trackingNumber(info.orderId).then(res => {
        console.error('try_query_taobao_trade_trackingNumber 获取成功', res)
        console.timeEnd(`try_query_taobao_trade_trackingNumber${info.orderId}`)
      })
    }
    // 测试 通过订单详情获取跟踪号
    const try_query_taobao_trade_trackingNumber_byViewDetail = (info = {
      orderId: '1796441988877594069',
      local_viewDetail_url: '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069'
    }) => {
      console.time(`try_query_taobao_trade_trackingNumber_byViewDetail${info.orderId}`)
      return query_taobao_trade_trackingNumber_byViewDetail(info).then(res => {
        console.error('query_taobao_trade_trackingNumber_byViewDetail 获取成功', res)
        console.timeEnd(`try_query_taobao_trade_trackingNumber_byViewDetail${info.orderId}`)
      })
    }
    // 可于popup使用的$bg集合
    window.$bg = {
      storage,
      // 数据申明
      states,
      // 方法申明
      query_goodList,
      query_goodListAll,
      query_goodDetail_mobile,
      query_goodDetail_pc,
      tryDownLoadDataToExcel,
      sendMessageToContentScript,
      try_connect_content_query_taobao_asyncBought_pcAll,
      try_query_taobao_trade_trackingNumber,
      try_query_taobao_trade_trackingNumber_byViewDetail,
      try_query_taobao_trade_trackingNumber_byViewDetailAll
    }
    window.query_goodDetail_mobile = query_goodDetail_mobile
    window.query_goodDetail_pc = query_goodDetail_pc
    window.try_query_taobao_trade_trackingNumber = try_query_taobao_trade_trackingNumber
    window.try_query_taobao_trade_trackingNumber_byViewDetail = try_query_taobao_trade_trackingNumber_byViewDetail
    // 3361026423687600618
    /*
    // 多包裹 (通过详情查 比 通过物流查 慢1.5倍-2倍)
    try_query_taobao_trade_trackingNumber('3361026423687600618')
    try_query_taobao_trade_trackingNumber_byViewDetail({
      orderId: '3361026423687600618',
        local_viewDetail_url: '//buyertrade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=3361026423687600618'
    })
    // 单包裹类型...
    try_query_taobao_trade_trackingNumber('3388522248766600618')
    try_query_taobao_trade_trackingNumber_byViewDetail({
      orderId: '3361026423687600618',
        local_viewDetail_url: '//buyertrade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=3388522248766600618'
    })
    */
    onMounted(async () => {
      // 测试获取商品列表 Start
      /*query_goodList('6个核桃').then(res => {
        console.log(res, res.length, '6个核桃 所有数据')
        // console.log(res, '6个核桃 所有数据')
      })*/
      // 3页
      /*query_goodListAll('6个核桃').then(res => {
      // query_goodList('6个核桃').then(res => {
          console.log(res, res.length, '6个核桃 所有数据')
          // console.log(res, '6个核桃 所有数据')
      })*/
      // 100页
      /*query_goodListAll('核桃').then(res => {
          console.log(res, res.length, '核桃 所有数据')
          // console.log(res, '核桃 所有数据')
      })*/
      // 测试获取商品列表 End

      // 测试获取商品详情 Start
      // query_goodDetail_mobile('547826051836')
      // todo 测试 fetch detail
      // query_jump_goodDetail_pc("https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1479345303&k=1113&e=QEIum8N%2FE8ZNjRjdgEzBox2T7kXXz1eCFGSckyV7oyN3bJMtNLCUGI3WX8koj8xzMkqvcNiN7%2F5%2BTXvE1qCa7zL5IKs8zooBydN%2FGW68XjTahggur97VwDWR2Yz7GTv5YFTn8y8P9uGhZvTrN04fg8MFc0OkFpgTxH9OYuVXlQRT2uqVVzNimOF39YzXJARuuUTKYg%2FTlhHTOLxcNjwrVFb7oCejbfqIDdStFMF42wHHPi9JVs4Gse%2Bot7%2FvZ70EoJaX%2BqBcanGbSmTJ5jTTo6kf0Ve8KtQuOR5glqhnCwuM6TRByslgJfukHCFkzgYKtL08d8yE1RC12%2FOSrrXftumxCabm0ssTancHGkNwpQZpFytu54SJaUZoSLQAYjIQLEEXnCk1QWd%2FxzbKpwr6oa4kaHyEli%2F7Bxzkiz3LQ08%2BHnJIDIuiPbP%2BDtPQ9wPLeCMJZrcYxE1OM26j%2FD7MOkVVSr0FgZqg1KrPV4KBJdCkZE41DmsEGNxasfp9HKiYyCLO4xnkeo8nykDjYDS9Zuz3H7Tsn%2FNCjDzkvCt2HOb4KrwlTIBOZF5QMLIis45O9IQCmWSDgp032xXmWfv%2FKszjLaM8l6dzCeLVHGTPQhf998s20udvLzuyOiCF2wGnMQKnzEBoC3A0IxxIS2XHNg0JhEB1RoApmwpq2Fq7oP%2Fijf1OUtWy8ASC0gLZo%2Fi6n6uhvznxvEag%2BiZSRwIJzmc0k1HOJPG1Y%2F28zPsApjPmjiN6dIYY8oNgvWVrFSn4TAKJW3LZ3SUXa438vzF0mo724w2y%2BHmkToD%2B%2F%2Fi%2FmN6h9k2GpVYZMKk%2FRekoDlBs51a3S%2BXKRoes%2BcnqE5w5FA10v3cYr9I0qWO2tby8jnAaUljipqfPgTw3%2BV26h%2FzFM6GpoBhuv%2BXE9kTnTLeEOBk9RRnl%2BCad%2FyrY7MlEZw8Rw53Z%2FvGiDEcf14hbRdiytjw8LpcGHqVp85lqsnIhf85cIJ8kxYKcGfP50WKWOg9PtXJ5lkpdBILUrgTZjtO0Q%2FF5NpkBgHDEk0FrT35bIx2IGqy6B175kqAeAzLy7oPXBqEPI9VCD9JoaPsqj4CsuQ2Ij%2FGtFCj6XihmxfiXkw%3D%3D")
      // query_jump_goodDetail_pc("https://item.taobao.com/item.htm?id=547826051836")
      // 会自动跳转切换域名 但是 切换过去后 返回跨域... todo...
      /*fetch("https://item.taobao.com/item.htm?id=547826051836").then((res => {
          console.log(res, 'res')
          debugger
      }))*/
      /*fetch("https://detail.tmall.com/item.htm?id=?id=608030379744").then((res => {
          console.log(res, 'res')
          debugger
      }))*/
      // query_jump_goodDetail_pc("https://chaoshi.detail.tmall.com/item.htm?id=547826051836")
      // todo... 可能会涉及到 重定向失败问题 todo...
      // item.detail_url
      // query_jump_goodDetail_pc("https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1479345303&k=1113&e=QEIum8N%2FE8ZNjRjdgEzBox2T7kXXz1eCFGSckyV7oyN3bJMtNLCUGI3WX8koj8xzMkqvcNiN7%2F5%2BTXvE1qCa7zL5IKs8zooBydN%2FGW68XjTahggur97VwDWR2Yz7GTv5YFTn8y8P9uGhZvTrN04fg8MFc0OkFpgTxH9OYuVXlQRT2uqVVzNimOF39YzXJARuuUTKYg%2FTlhHTOLxcNjwrVFb7oCejbfqIDdStFMF42wHHPi9JVs4Gse%2Bot7%2FvZ70EoJaX%2BqBcanGbSmTJ5jTTo6kf0Ve8KtQuOR5glqhnCwuM6TRByslgJfukHCFkzgYKtL08d8yE1RC12%2FOSrrXftumxCabm0ssTancHGkNwpQZpFytu54SJaUZoSLQAYjIQLEEXnCk1QWd%2FxzbKpwr6oa4kaHyEli%2F7Bxzkiz3LQ08%2BHnJIDIuiPbP%2BDtPQ9wPLeCMJZrcYxE1OM26j%2FD7MOkVVSr0FgZqg1KrPV4KBJdCkZE41DmsEGNxasfp9HKiYyCLO4xnkeo8nykDjYDS9Zuz3H7Tsn%2FNCjDzkvCt2HOb4KrwlTIBOZF5QMLIis45O9IQCmWSDgp032xXmWfv%2FKszjLaM8l6dzCeLVHGTPQhf998s20udvLzuyOiCF2wGnMQKnzEBoC3A0IxxIS2XHNg0JhEB1RoApmwpq2Fq7oP%2Fijf1OUtWy8ASC0gLZo%2Fi6n6uhvznxvEag%2BiZSRwIJzmc0k1HOJPG1Y%2F28zPsApjPmjiN6dIYY8oNgvWVrFSn4TAKJW3LZ3SUXa438vzF0mo724w2y%2BHmkToD%2B%2F%2Fi%2FmN6h9k2GpVYZMKk%2FRekoDlBs51a3S%2BXKRoes%2BcnqE5w5FA10v3cYr9I0qWO2tby8jnAaUljipqfPgTw3%2BV26h%2FzFM6GpoBhuv%2BXE9kTnTLeEOBk9RRnl%2BCad%2FyrY7MlEZw8Rw53Z%2FvGiDEcf14hbRdiytjw8LpcGHqVp85lqsnIhf85cIJ8kxYKcGfP50WKWOg9PtXJ5lkpdBILUrgTZjtO0Q%2FF5NpkBgHDEk0FrT35bIx2IGqy6B175kqAeAzLy7oPXBqEPI9VCD9JoaPsqj4CsuQ2Ij%2FGtFCj6XihmxfiXkw%3D%3D")
      // const testQuery = window.testAll = (keyWord) => query_goodList(keyWord).then(async res => {
      const testQuery = window.testAll = (keyWord) => query_goodListAll(keyWord).then(async res => {
        console.log(res, res.length, `${keyWord} 所有商品列表数据`)
        // res.length = 3
        const list = []
        while (res.length) {
          await new Promise((r) => setTimeout(r, Math.random() * 5000))
          const cur = res.shift()
          await query_goodDetail_mobile(cur.nid).then(obj => {
            console.log(obj, 'mobile 详情')
            list.push(obj)
          }).catch(e => {
            console.error(`获取 ${keyWord} 失败： nid: ${cur.nid}`)
          })
        }
        console.log(list, `${keyWord}所有详情数据`)
      })
      const keyWords = [
        '手机',
        // '笔记本电脑',
        // '平板',
        // '手表',
        // '鞋子',
        // '长裤',
        // '短裤'
      ]
      while (keyWords.length && false) {
        // 延时0-5s
        await delayPromise(5000)
        const cur = keyWords.shift()
        await testQuery(cur)
      }
      // 测试获取商品详情 End

      // query_list_bought_items_pc  获取
      /*query_list_bought_items_pc().then(res => {
          console.error(res, 'result')
      })*/

    })
  },
});

</script>

<style lang="scss" scoped>
</style>
