<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import {
  query_goodListAll,
  query_goodList,
  query_goodDetail_mobile,
  query_goodDetail_pc,
  query_taobao_trade_trackingNumber,
  // query_list_bought_items_pc,
  query_jump_goodDetail_pc,
  query_taobao_trade_trackingNumber_byViewDetail,
  query_taobao_trade_trackingNumber_by_viewLogistic
} from '@/api/taobao'
import envConfig from '@/config_constant'
import storage from '@/utils/storage'
import type { MessageRequest } from '@/common'
import { delayPromise } from '@/utils/util'
import {
  useBackground,
  updateBgMsg,
  chromeSendMessage,
  update_taobao_loseOrder_ids,
  update_taobao_orderList_error,
  update_taobao_orderList_errorOne,
  tryDownLoadDataToExcel
} from './hooks/useBackground'

/**
 * 连接给contentJs注入的文件进行消息传递
 * @param config
 */
const sendMessageToContentScript = (config = {}) => {
  const {
    message,
    callback = (...args) => console.error(...args),
    tabsFilter = (tabs) => tabs.filter((v) => v.url)
  } = config
  // 给每个 符合的 都给提示
  // 由于 currentWindow 时 通过插件获取debugger 获取不到数据 为了方便测试用于区分
  const queryConfig = {
    /*url: 'https://!*.taobao.com/!*',  active: true*/
  }
  // 生产环境
  // if(!envConfig.IS_DEV) {
  //   queryConfig.currentWindow = true
  // }
  chrome.tabs.query(queryConfig, (tabs) => {
    // 如果有 url 的话 证明 是 在manifest 授权 且 也授权 content_scripts 的数据 【即后台页面数据】
    // 条件过滤 tabs
    let filterTabs =
      typeof tabsFilter === 'function' ? tabsFilter(tabs) : tabs.filter((v: any) => v.url)
    console.error(tabs, 'tabs filterTabs', filterTabs)
    if (filterTabs.length) {
      filterTabs.map((tab, i) => {
        chrome.tabs.sendMessage(tab.id, message as MessageRequest, (response) => {
          const error: any = chrome.runtime.lastError
          if (error) {
            console.log(
              tab,
              error.message,
              'chrome.runtime.lastError by [sendMessageToContentScript]'
            )
            callback({
              message: `通过tabs.sendMessage 处理失败:编号#${i}, 请重新尝试处理~`,
              code: 401
            })
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
    // 测试 弹窗 以及 btnClick callback
    window.test_onlyTest = () => {
      createNotification(notificationTypeOpts.onlyTest)
    }
    window.test_taobao_system_api = () => {
      createNotification(notificationTypeOpts.taobao_system_api)
    }
    // 初始化
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('欢迎使用 vue3_crx_template', details)
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
      // console.log(message, 'message')
      /**仅接收bg_前缀的数据用以 区分 popup(pop_)*/
      switch (message.type) {
        case 'bg_query_taobao_asyncBought_pcAll': {
          const { data, code } = message
          // 获取成功处理 物流信息
          if (code === 200) {
            console.error('爬取的淘宝数据为： ', data)
            // orders: 有效订单, loseOrder_ids: 无物流且不为交易成功的订单
            const { orders, loseOrder_ids } = data
            states.workStatus = '2.工作中(get订单列表ok)'
            // 更新条件失效的订单 (非交易成功/无物流信息) eg: 已关闭/未发货/等...
            update_taobao_loseOrder_ids(loseOrder_ids)
            /*// 获取到的订单列表 更新到本地
            storage.ls_set_taobao_orderList(orders)*/
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
            message:
              message.type.toString().indexOf('bg_') === 0
                ? `bg_:错误请求，没有找到type=“${message.type}”的方法`
                : `bg_:type=“${message.type}”不关我事`
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
        workingUrl += `?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=${params.tabCode}`
      }
      states.active_list_bought_itemsUrl = workingUrl
      // 匹配tabs 进行过滤
      const tabsFilter = (tabs) => {
        const _tabs = []
        tabs.some((v) => {
          if (v.url && v.url.indexOf(workingUrl) === 0) {
            _tabs.unshift(v)
            if (v.active) return true
          }
        })
        return _tabs.length ? [_tabs[0]] : []
      }
      let idx = 0
      const localRun = () => {
        states.taobao_orderList_loading = true
        // console.log(idx, 'idx..................')
        if (idx > 1) return (states.taobao_orderList_loading = false)
        idx++
        // 清空 历史的错误数据列表
        clear_localErrorData()
        // 连接content注入 进行数据获取
        sendMessageToContentScript({
          message: { type: 'content_query_taobao_asyncBought_pcAll', data: params },
          callback: ({ data, message, code }) => {
            console.log(data, message, code, 'data, message, code')
            if (code === 400) {
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
    const try_query_taobao_trade_trackingNumber = (
      info = {
        orderId: '1796441988877594069',
        local_viewDetail_url:
          '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069'
      }
    ) => {
      console.time(`try_query_taobao_trade_trackingNumber${info.orderId}`)
      return query_taobao_trade_trackingNumber(info.orderId).then((res) => {
        console.error('try_query_taobao_trade_trackingNumber 获取成功', res)
        console.timeEnd(`try_query_taobao_trade_trackingNumber${info.orderId}`)
      })
    }
    // 测试 通过订单详情获取跟踪号
    const try_query_taobao_trade_trackingNumber_byViewDetail = (
      info = {
        orderId: '1796441988877594069',
        local_viewDetail_url:
          '//tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069'
      }
    ) => {
      console.time(`try_query_taobao_trade_trackingNumber_byViewDetail${info.orderId}`)
      return query_taobao_trade_trackingNumber_byViewDetail(info).then((res) => {
        console.error('query_taobao_trade_trackingNumber_byViewDetail 获取成功', res)
        console.timeEnd(`try_query_taobao_trade_trackingNumber_byViewDetail${info.orderId}`)
      })
    }
    // 测试 通过订单详情获取跟踪号
    const try_query_taobao_trade_trackingNumber_by_viewLogistic = (
      info = {
        createTime: '2025-03-05 19:09:47',
        orderId: '2487900612967594069'
        // local_viewDetail_url:"//trade.tmall.com/detail/orderDetail.htm?bizOrderId=2487900612967594069",
        // 查看订单物流的物流链接
        /*local_express_url:"https://market.m.taobao.com/app/dinamic/pc-trade-logistics/home.html?orderId=2487900612967594069&entrance=pc&oldUrl=%2F%2Fwuliu.taobao.com%2Fuser%2Forder_detail_new.htm%3Ftrade_id%3D2487900612967594069%26seller_id%3D2219509495",*/
        // "expressId":"",
        // "expressName":"",
        // "consignTime":""
      }
    ) => {
      console.time(`try_query_taobao_trade_trackingNumber_by_viewLogistic${info.orderId}`)
      return query_taobao_trade_trackingNumber_by_viewLogistic(info).then((res) => {
        console.error('query_taobao_trade_trackingNumber_by_viewLogistic 获取成功', res)
        console.timeEnd(`try_query_taobao_trade_trackingNumber_by_viewLogistic${info.orderId}`)
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
    window.try_query_taobao_trade_trackingNumber_byViewDetail =
      try_query_taobao_trade_trackingNumber_byViewDetail
    window.try_query_taobao_trade_trackingNumber_by_viewLogistic =
      try_query_taobao_trade_trackingNumber_by_viewLogistic
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
      // const testQuery = window.testAll = (keyWord) => query_goodList(keyWord).then(async res => {
      const testQuery = (window.testAll = (keyWord) =>
        query_goodListAll(keyWord).then(async (res) => {
          console.log(res, res.length, `${keyWord} 所有商品列表数据`)
          // res.length = 3
          const list = []
          while (res.length) {
            await new Promise((r) => setTimeout(r, Math.random() * 5000))
            const cur = res.shift()
            await query_goodDetail_mobile(cur.nid)
              .then((obj) => {
                console.log(obj, 'mobile 详情')
                list.push(obj)
              })
              .catch((e) => {
                console.error(`获取 ${keyWord} 失败： nid: ${cur.nid}`)
              })
          }
          console.log(list, `${keyWord}所有详情数据`)
        }))
      const keyWords = [
        '手机'
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
  }
})
</script>

<style lang="scss" scoped></style>
