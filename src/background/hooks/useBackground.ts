import {reactive, ref, toRefs, watch} from "vue";
import type {MessageRequest, TaobaoOrder} from "@/common";
import storage, {TAOBAO_LOSE_ORDER_IDS} from "@/utils/storage"
import {jsonToSheetXlsx} from "@/utils/export2Excel";
import {delayPromise, $log_error} from "@/utils/util";
import envConfig from '@/config_constant'
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
export function useBackground() {
  // 插件后台数据存储
  const states = reactive({
    // 数据申明
    taobao_orderList_errorLoading: false,
    // 插件执行状态
    workStatus: '空闲', // 空闲||工作中
    // 当前功能类型
    pageType: 'taobao', // 参考 Popup typeOptions
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
  /**
   * 第一次尝试将所有的订单拿过来查询物流并做处理 生成 excel
   * @param orders
   */
  const query_asyncBought_pcAllTrackingOrders = async (orders: TaobaoOrder[]) => {
    const timeName = +new Date() + '_query_asyncBought_pcAllTrackingOrders'
    console.time(timeName)
    states.workStatus = '3.工作中(获取物流)'
    // upload_bg_workStatus('3.工作中(获取物流)')
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
      }).catch(e => {})
      // 延时0.5-2.5s
      await delayPromise(2000, 500)
    }
    console.error(loadOrders, '最终orders 可以传给 后台 或生成xlsx 进行处理')
    console.timeEnd(timeName)
    states.workStatus = '4.空闲(订单处理完成)'
    // 工作完成 进行清空
    chromeSendMessage({type: 'upload_bg_taobao_orderLogText', data: ''})
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
    try_query_taobao_trade_trackingNumber_byViewDetailAll
    // // 发消息
    // chromeSendMessage,
    // updateBgMsg,
  }
}
