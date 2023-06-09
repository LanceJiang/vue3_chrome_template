<script lang="ts">
import {defineComponent, onMounted} from 'vue';
import {
  query_goodListAll,
  query_goodList,
  query_goodDetail_mobile,
  query_goodDetail_pc,
  query_taobao_trade_trackingNumber,
  // query_list_bought_items_pc,
  query_jump_goodDetail_pc
} from '@/api/taobao';
import {jsonToSheetXlsx} from "@/utils/export2Excel";
import storage, {TAOBAO_LOSE_ORDER_IDS} from "@/utils/storage"
import type {MessageRequest} from "@/common";

export default defineComponent({
  name: 'background',
  beforeUnmount() {
    console.log('bg 卸载')
    window.$bg = null
  },
  setup() {
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
    const chromeSendMessage = chrome.runtime.sendMessage
    /**
     * 接收来自popup和content_script发来的信息请求
     */
    chrome.runtime.onMessage.addListener((message: MessageRequest, sender, sendResponse) => {
      console.log(message, 'message')
      switch (message.type) {
        case 'bg_query_taobao_asyncBought_pcAll': {
          console.error(message, 'message')
          const { data, code } = message
          // 获取成功处理 物流信息
          if(code === 200) {
            console.error('数据为： ', data)
            // orders: 有效订单, loseOrder_ids: 无物流且不为交易成功的订单
            const { orders, loseOrder_ids } = data
            storage.ls_set_list(TAOBAO_LOSE_ORDER_IDS, loseOrder_ids)
            // 更新条件失效的订单
            chromeSendMessage({type: 'upload_bg_taobao_loseOrder_ids'})
            try_asyncBought_pcAllTrackingOrders(orders)
          } else {
            console.error('bg_query_taobao_asyncBought_pcAll 获取失败', data)
          }
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
          debugger
          sendResponse({
            code: 0,
            data: null,
            message: `错误请求，没有找到type=“${message.type}”的方法`
          })
        }
      }
      return true
    })

    const states = {
      // 数据申明
    }
    // 连接 list_bought_items 页面 通知 该页面注入的方法 获取订单列表
    const try_connect_content_query_taobao_asyncBought_pcAll = (params) => {
      // 获取淘宝所有订单
      const workingUrl = 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'
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
        console.error(idx, 'idx..................')
        if(idx > 1) return
        idx++
        sendMessageToContentScript({
          message: { type: 'content_query_taobao_asyncBought_pcAll', data: params },
          callback: ({ data, message, code }) => {
            console.error(data, message, code, 'data, message, code')
            if (code === 400) {
              // 若找不到 合适的 tabs， 新开一个 订单页面
              chrome.tabs.create({ url: workingUrl })
              // 因为该页面加载比较慢 6s后再次尝试获取订单列表
              setTimeout(localRun, 6000)
            }
          },
          tabsFilter
        })
      }
      localRun()
    }
    // 测试下载 Excel
    const testDownLoadExcel = (data: any[]) => {
      /*let data: any[] = Array.from({length: 10}).map((_, i) => ({
        // 商家订单号
        orderId: '1894436546428441573' + i,
        // 快递号
        expressId: '78688738027061' + i,
        // 快递公司
        expressName: '中通快递' + i,
        // 快递支付类型
        expressType: i,
        // 商品名称
        goods: 'aa;bb;',
        // 商品名称
        createTime: '2020-02-02 11:13:12',
      }))*/
      const header = {
        orderId: '订单号',
        expressId: '快递号',
        expressName: '快递公司',
        // createTime: '订单创建时间',
        // goods: '商品名称',
        // total_price: '商品价格',
        expressType: '快递支付类型' // todo
      }
      const header_keys = Object.keys(header)
      data = data.map(v => header_keys.reduce((o, k) => {
        o[k] = v[k]
        return o
      }, {}))
      const data_first = data[0]
      // 手动设置cols 宽度
      const worksheet_cols = header_keys.map(k => {
        const val = (data_first[k] || '').toString()
        return { 'wch': val.length * (val.charCodeAt(0) > 255 ? 2 : 1) + 2 }
      })
      // 修改 expressType col 长度
      worksheet_cols[3] = {wch: 12 + 2}
      const _date = new Date()
      ;jsonToSheetXlsx({
        data,
        // 自定义头
        header,
        filename: `${_date.toLocaleDateString()} ${_date.toLocaleTimeString()}订单导出.xlsx`,
        worksheet_cols,
        /*json2sheetOpts: {
          // 指定顺序
          header: ['expressId', 'orderId'],
        },*/
      })
    }
    const update_taobao_orderList_error = (file) => {
      const files = storage.ls_get_taobao_orderList('error')
      files.unshift(file)
      storage.ls_set_taobao_orderList(files, 'error')
      // 更新 bg_淘宝订单数据_失败
      chromeSendMessage({type: 'upload_bg_taobao_orderList_error'})
    }
    // 尝试将所有的订单拿过来查询物流并做处理 生成 excel
    const try_asyncBought_pcAllTrackingOrders = async (orders: any[]) => {
      // todo  需要针对 有物流信息的优先处理 local_expressFlag:true, 不为true 的丢到 poopup 进行展示做下一步处理验证
      for(let order of orders) {
        // 暂时先过滤掉无物流的数据
        if (!order.local_expressFlag) {
          update_taobao_orderList_error(order)
          continue
        }
        await query_taobao_trade_trackingNumber(order.orderId).then((res: any) => {
          // {isSuccess: "true|false"}
          console.warn(`订单：${order.orderId}获取成功`, JSON.stringify(res))
          // 若未获取成功 更新到列表数据_失败
          if(!res.expressId) {
            update_taobao_orderList_error(order)
          }
          order.expressId = res.expressId // || '-'
          order.expressName = res.expressName // || '-'
        })
        const timeName = +new Date() + '_'
        console.time(timeName)
        await new Promise((r) => {
          // 0-2s 延时
          setTimeout(r, Math.random() * 2000 )
        })
        console.timeEnd(timeName)
      }
      console.error(orders, '最终orders 可以传给 后台 或生成xlsx 进行处理')
      testDownLoadExcel(orders)
    }
    // 给contentJs 发送消息
    // message: {type, data}
    // console.error(import.meta.env.PROD, 'ddddddddddddd');
    // const sendMessageToContentScript = (message, callback, config = {}) => {
    const sendMessageToContentScript = (config = {}) => {
      const { message, callback = (...args) => console.error(...args), tabsFilter = (tabs) => tabs.filter(v => v.url) } = config
      // 给每个 符合的 都给提示
      // 由于 currentWindow 时 通过插件获取debugger 获取不到数据 为了方便测试用于区分
      const queryConfig = { /*url: 'https://sellercentral.amazon.com/!*', */ /*active: true,*/ }
      // 生产环境
      // if(!local.IS_DEV) {
      //   queryConfig.currentWindow = true
      // } // todo...
      chrome.tabs.query(queryConfig, (tabs) => {
        // 如果有 url 的话 证明 是 在manifest 授权 且 也授权 content_scripts 的数据 【即后台页面数据】
        // 条件过滤 tabs
        let filterTabs = typeof tabsFilter === "function" ? tabsFilter(tabs) : tabs.filter(v => v.url)
        console.error(tabs, 'tabs filterTabs', filterTabs)
        if(filterTabs.length) {
          filterTabs.map((tab, i) => {
            chrome.tabs.sendMessage(tab.id, message, (response) => {
              const error = chrome.runtime.lastError
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
    window.$bg = {
      storage,
      // 数据申明
      states,
      // 方法申明
      query_goodList,
      query_goodListAll,
      query_goodDetail_mobile,
      query_goodDetail_pc,
      testDownLoadExcel,
      sendMessageToContentScript,
      try_connect_content_query_taobao_asyncBought_pcAll
    }
    window.query_goodDetail_mobile = query_goodDetail_mobile
    window.query_goodDetail_pc = query_goodDetail_pc
    // 天猫 617266453987
    // const testQueryDetail =
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
        await new Promise((r) => setTimeout(r, Math.random() * 5000))
        const cur = keyWords.shift()
        await testQuery(cur)
      }
      // 测试获取商品详情 End

      // query_list_bought_items_pc  获取
      /*query_list_bought_items_pc().then(res => {
          console.error(res, 'result')
      })*/

      // todo 尝试 获取淘宝订单相关数据 导出 xlsx

    })
  },
});

</script>

<style lang="scss" scoped>
</style>
