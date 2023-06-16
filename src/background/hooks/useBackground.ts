import {reactive, ref, toRefs, watch} from "vue";
import type {MessageRequest, TaobaoOrder} from "@/common";
import storage, {TAOBAO_LOSE_ORDER_IDS} from "@/utils/storage"
import {jsonToSheetXlsx} from "@/utils/export2Excel";
import {delayPromise, $log_error} from "@/utils/util";
import envConfig, {taobao_orderUpdateIntervalConfig, taobao_orderUpdateIntervalOptions} from '@/config_constant'
import {
  query_taobao_trade_trackingNumber,
  query_taobao_trade_trackingNumber_byViewDetail
} from '@/api/taobao';
// @ts-ignore
export const chromeSendMessage: (p: MessageRequest) => void = chrome.runtime.sendMessage
// 发消息
export const updateBgMsg = (message: string, isSuccess = false) => {
  return chromeSendMessage({
    type: isSuccess ? 'upload_bg_msg_success' : 'upload_bg_msg_error',
    message
  })
}

// 更新无效订单列表 taobao_loseOrder_ids
export const update_taobao_loseOrder_ids = (list: string[] = [], sendMessage = true) => {
  storage.ls_set_list(TAOBAO_LOSE_ORDER_IDS, list)
  // 更新条件失效的订单
  if(sendMessage) {
    chromeSendMessage({type: 'upload_bg_taobao_loseOrder_ids'})
  }
}
// 更新获取数据失败订单
export const update_taobao_orderList_error = (files: TaobaoOrder[] = [], sendMessage = true) => {
  storage.ls_set_taobao_orderList(files, 'error')
  // 更新条件失效的订单
  if(sendMessage) {
    chromeSendMessage({type: 'upload_bg_taobao_orderList_error'})
  }
}
// 对本地存储 添加||删除 单个订单 做更新
export const update_taobao_orderList_errorOne = (file: TaobaoOrder, isAdd = true) => {
  const files: TaobaoOrder[] = storage.ls_get_taobao_orderList('error')
  // 清除相同orderId 订单记录
  let file_idx = files.findIndex(v => file.orderId === v.orderId)
  while (file_idx > -1) {
    files.splice(file_idx, 1)
    file_idx = files.findIndex(v => file.orderId === v.orderId)
  }
  // 添加新的错误数据
  if(isAdd) {
    files.unshift(file)
  }
  // 更新条件失效的订单
  update_taobao_orderList_error(files)
}

// 订单数据导出excel
export const tryDownLoadDataToExcel = (data: any[]) => {
  if(!data.length) {
    const msg = '暂无订单数据,无法打印~'
    $log_error(msg)
    return updateBgMsg(msg, false)
  }
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
    // 部分发货
    partialShipment: true,
  }))*/
  const header = {
    orderId: '订单号',
    expressId: '快递号',
    consignTime: '发货时间',
    // 是否部分发货
    partialShipment: '发货状态',
    expressName: '快递公司',
    // expressType: '快递支付类型' // todo
  }
  const header_keys = Object.keys(header)
  // 生成excel 前 数据美化
  data = data.map(v => {
    const obj: any = header_keys.reduce((o, k) => {
      o[k] = v[k]
      return o
    }, {} as any)
    obj.partialShipment = obj.partialShipment ? '部分发货' : '已发货'
    return obj
  })
  // const data_first = data[0]
  // 手动设置cols 宽度
  const worksheet_cols = [
    // 0:orderId: '订单号', 19位数 + 2
    { 'wch': 21 },
    // 1:expressId: '快递号',15位数 + 2
    { 'wch': 17 },
    // 2:consignTime: '发货时间',20位数 + 2
    { 'wch': 22 },
    // 3:partialShipment: '发货状态',12位数 + 2
    { 'wch': 14 },
    // 4:expressName: '快递公司',14位数 + 2
    { 'wch': 16 },
    // // 5:expressType: '快递支付类型' // todo
    // { 'wch': 14 },
  ]
  /*const worksheet_cols = header_keys.map(k => {
    const val = (data_first[k] || '').toString()
    return { 'wch': val.length * (val.charCodeAt(0) > 255 ? 2 : 1) + 2 }
  })
  // 修改 expressType col 长度
  worksheet_cols[3] = {wch: 12 + 2}*/
  const _date = new Date()
  ;jsonToSheetXlsx({
    data,
    // 自定义头
    header,
    filename: `订单导出${_date.toLocaleDateString()} ${_date.toLocaleTimeString()}.xlsx`,
    worksheet_cols,
    /*json2sheetOpts: {
      // 指定顺序
      header: ['expressId', 'orderId'],
    },*/
  })
}
export type NotificationType = {
  // 类型标识唯一值
  notificationType: string;
  // 标题
  title?: string;
  // 弹窗信息
  message: string;
  // 操作按钮集合  // 最多支持两btn 触发index [0, 1]
  buttons?: {title:string}[]
}

// 使用谷歌notification 提示窗
export const useChromeNotification = () => {
  // 判断是否为获取弹窗的标记
  const isFireFox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1
  // notification 定时器
  let notificationTimer: any
  const notificationTypeOpts = {
    // 淘宝处理接口出错
    taobao_system_api: {
      notificationType: 'taobao_system_api',
      message: '您的淘宝登录验证出现问题\n请重试验证淘宝后继续工作',
      // buttons: [{title: '确定'}]
    },

    // 请添加新类型
    onlyTest: {
      notificationType: 'onlyTest',
      message: '我只是onlyTest。\n若您5s内未确认将自动执行',
      buttons: [{title: '立即执行'}, {title: '30s后再试'}] // [0, 1]
    },
  }

  // 定义弹窗按钮点击封装集合
  /** 针对不同的chrome弹窗类型 添加对应的操作函数 Start
   *  添加时的函数定义: [notificationType](Cancel): () => {}
   */
  const notification_btnClicks = {
    taobao_system_api: () => {
      console.error('taobao_system_api 测试成功 todo....')
    },
    onlyTest: () => {
      console.error('onlyTest 测试成功')
    },
    onlyTestCancel: () => {
      console.error('onlyTestCancel 测试成功')
      // 延时30min 后执行 重新唤起询问窗口
      return setTimeout(() => {
        createNotification(notificationTypeOpts.onlyTest)
      }, 30 * 1000)
    }
  }
  const fnSplitKey = '_&_'
  // 发送弹窗提示
  const createNotification = (opts: NotificationType) => {
    const {
      message = '',
      notificationType = '', // 用于弹窗按钮点击判断对应的类型[唯一类型]
      buttons = [{title: '确定'}],
      title = '提示'
    } = opts
    // // 开启提示音
    // try{
    //   this.warningAudio.play()
    // }catch (e) {
    //   console.log('无法开启提示音', e)
    // }
    const notificationId = `${notificationType}${fnSplitKey}${+new Date()}`
    // @ts-ignore
    chrome.notifications.create(notificationId, {
      // 类型
      type: 'basic',
      // 优先级
      priority: 2,
      iconUrl: 'img/logo.png', // chrome.runtime.getURL('img/logo.png'),
      contextMessage: 'lance_vue3_crx',
      title,
      message, // 字数多了 会被隐藏 最多4行
      // 最多传递两个button
      ...(!isFireFox && { buttons }) // 火狐不支持buttons
    }, (notificationId: string) => {
      // 提示5s 实际使用默认 6s 倒计时 (若不选中按钮操作 默认 6s 自动选择第一个按钮选项(确认类型按钮)调用)
      /*notificationTimer = setTimeout(() => {
        console.log('延时6s 执行默认确认的 回调....   notificationId', notificationId)
        tryNotificationsBtnClick(notificationId,0)
      }, 6000)*/
    })
  }
  // 尝试获取到对应类型的按钮类型操作
  const tryNotificationsBtnClick = (notificationId: string, index: number) => {
    // console.log('notificationId, index', notificationId, index)
    // 若有操作对应的按钮 清空6s默认问题自动执行操作
    clearTimeout(notificationTimer)
    // 清除当前提示
    // @ts-ignore
    chrome.notifications.clear(notificationId/*, () => {console.log('clear to do....')}*/)
    const notificationType = notificationId.split(fnSplitKey)[0]
    // 回调方法名定义 !!!!
    const handlerName = `${notificationType}${index !== 0 ? 'Cancel' : ''}`
    // 执行对应匹配上的 按钮回调
    ; // @ts-ignore
    (notification_btnClicks[handlerName] || function(){ console.log(`暂未找到‘${handlerName}’类型的chrome弹窗按钮回调`) })()
  }
  /**
   * 通知按钮事件  function(notificationId, index){}
   */
  // @ts-ignore
  chrome.notifications.onButtonClicked.addListener(tryNotificationsBtnClick)
  return {
    // notification类型集合
    notificationTypeOpts,
    // 开启notification弹窗 方法
    createNotification,
    // notification类型弹窗按钮点击处理集合
    notification_btnClicks
  }
}
export function useBackground() {
  // 插件后台数据存储
  const states = reactive({
    // 数据申明
    // 订单列表更新间隔
    taobao_orderUpdateInterval: '2-6s', // 2-6秒间隔
    // 全订单获取
    taobao_orderList_loading: false,
    // 历史的失败订单获取
    taobao_orderList_errorLoading: false,
    // 插件执行状态
    workStatus: '空闲', // 空闲||工作中
    // 当前功能类型
    pageType: 'taobao', // 参考 Popup typeOptions
  })
  watch(() => states.taobao_orderList_loading, (bool) => {
    // 更新 bg_淘宝订单数据_失败 loading
    console.log('watch states.taobao_orderList_loading 变更触发', bool)
    chromeSendMessage({type: 'upload_bg_taobao_orderList_loading', data: bool})
  })
  watch(() => states.taobao_orderList_errorLoading, (bool) => {
    // 更新 bg_淘宝订单数据_失败 loading
    console.log('watch states.taobao_orderList_errorLoading 变更触发', bool)
    chromeSendMessage({type: 'upload_bg_taobao_orderList_errorLoading', data: bool})
  })
  watch(() => states.workStatus, (status) => {
    // 更新 bg_工作状态描述
    console.log('watch states.upload_bg_workStatus 变更触发', status)
    chromeSendMessage({type: 'upload_bg_workStatus', data: status})
  })
  // 使用Notification 弹窗
  const {
    // notification类型集合
    notificationTypeOpts,
    // 开启notification弹窗 方法
    createNotification,
    // notification类型弹窗按钮点击处理集合
    notification_btnClicks
  } = useChromeNotification()
  /**
   * 第一次尝试将所有的订单拿过来查询物流并做处理 生成 excel
   * @param orders
   */
  const query_asyncBought_pcAllTrackingOrders = async (orders: TaobaoOrder[]) => {
    const timeName = +new Date() + '_query_asyncBought_pcAllTrackingOrders'
    console.time(timeName)
    states.workStatus = '3.工作中(获取物流)'
    // states.taobao_orderList_loading = true
    const loadOrders: TaobaoOrder[] = []
    let num = 1
    const total_num = orders.length
    for(const order of orders) {
      // 暂时先过滤掉无物流的数据
      /*if (!order.local_expressFlag) {
        update_taobao_orderList_errorOne(order)
        continue
      }*/
      // 获取物流信息快捷接口(但涉及到单订单多包裹数据 获取到的值会有问题)
      /*await query_taobao_trade_trackingNumber(order.orderId).then((res: any) => {
        // {isSuccess: "true|false"}
        console.warn(`订单：${order.orderId}获取成功`, JSON.stringify(res))
        // 若未获取成功 更新到列表数据_失败
        if(!res.expressId) {
          update_taobao_orderList_errorOne(order)
        }
        order.expressId = res.expressId // || '-'
        order.expressName = res.expressName // || '-'
        loadOrders.push(order)
      })*/
      const txt = `获取第${num}条订单：${order.orderId}, 剩：${total_num - num}条数据`
      console.error(txt)
      // popup 上进行更新
      chromeSendMessage({type: 'upload_bg_taobao_orderLogText', data: txt})
      num++
      // @ts-ignore
      await query_taobao_trade_trackingNumber_byViewDetail(order).then((list: any[]) => {
        console.warn(`订单：${order.orderId}获取成功`, JSON.stringify(list))
        list.forEach((v, idx) => {
          // 若获取成功 剔除列表数据_失败
          if(v.expressId && idx === 0) {
            update_taobao_orderList_errorOne(order, false)
          }
          loadOrders.push({
            ...order,
            // // 唯一值
            // local_id: `${order.local_id}${v.expressId}`,
            // 物流公司
            expressName: v.expressName,
            // 运单号
            expressId: v.expressId,
            // 快递发货时间
            consignTime: v.consignTime,
          })
        })
      }).catch(async (e: any) => {
        update_taobao_orderList_errorOne(order, true)
        /*// 失败输入填充
        loadOrders.push({
          ...order,
          // // 唯一值
          // local_id: `${order.local_id}${v.expressId}`,
        })*/
        // 2-5s
        let delayArgs = [3000, 2000]
        if (e?.type === 'system_api') { // taobao_system_api
          if(e.data) {
            console.error(e, '错误监测......')
            // 5-10s
            delayArgs = [5000, 5000]
            // createNotification 告诉用户 出现错误
            createNotification(notificationTypeOpts.taobao_system_api)
          } else {
            console.error(`订单：${order.orderId}详情获取失败`, e.message)
          }
        } else {
          console.error(`订单：${order.orderId}详情获取失败(非自定义reject类型)`, e)
        }
        // 延时器
        await delayPromise(...delayArgs)
      })
      // 延时1-4s
      // @ts-ignore
      const delayValue = taobao_orderUpdateIntervalConfig[states.taobao_orderUpdateInterval] || taobao_orderUpdateIntervalConfig['2-6s']
      console.error('间隔', states.taobao_orderUpdateInterval, 'delayValue', delayValue)
      // taobao_orderUpdateInterval todo
      await delayPromise(...delayValue)
    }
    console.error(loadOrders, '最终orders 可以传给 后台 或生成xlsx 进行处理')
    console.timeEnd(timeName)
    states.workStatus = '4.空闲(订单处理完成)'
    // 工作完成 进行清空
    chromeSendMessage({type: 'upload_bg_taobao_orderLogText', data: ''})
    states.taobao_orderList_loading = false
    // 下载excel
    tryDownLoadDataToExcel(loadOrders)
  }

  /**
   * 重新尝试获取失败的订单列表
   * @param orders
   */
  const try_query_taobao_trade_trackingNumber_byViewDetailAll = async (orders: any) => {
    // 更新 bg_淘宝订单数据_失败 loading
    states.taobao_orderList_errorLoading = true
    if(!orders) {
      orders = storage.ls_get_taobao_orderList('error')
    }
    /*const loadOrders = []
    for(let order of orders) {
      /!*await query_taobao_trade_trackingNumber_byViewDetail(order).then((list: any) => {
        console.warn(`订单：${order.orderId}获取成功`, JSON.stringify(list))
        console.error('query_taobao_trade_trackingNumber_byViewDetail 获取成功', list)
        list.forEach((v, idx) => {
          // 若获取成功 剔除列表数据_失败
          if(v.expressId && idx === 0) {
            update_taobao_orderList_errorOne(order, false)
          }
          loadOrders.push({
            ...order,
            // // 唯一值
            // local_id: `${order.local_id}${v.expressId}`,
            // 物流公司
            expressName: v.expressName,
            // 运单号
            expressId: v.expressId,
            // 快递发货时间
            consignTime: v.consignTime,
          })
        })
      }).catch(e => {})*!/
      // 2-5s 延时
      await delayPromise(3000, 2000)
    }*/
    await query_asyncBought_pcAllTrackingOrders(orders)
    // 更新 bg_淘宝订单数据_失败 loading
    states.taobao_orderList_errorLoading = false
  }
  return {
    // states
    states,
    // fns
    query_asyncBought_pcAllTrackingOrders,
    try_query_taobao_trade_trackingNumber_byViewDetailAll,
    // notification类型集合
    notificationTypeOpts,
    // 开启notification弹窗 方法
    createNotification,
    // notification类型弹窗按钮点击处理集合
    notification_btnClicks
    // // 发消息
    // chromeSendMessage,
    // updateBgMsg,
  }
}
