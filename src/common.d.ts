export type MessageRequest = {
  code?: number
  type: string | number
  data?: any
  message?: string | object
}
export type DefaultObject = {
  [key: string]: any
}
export type TaobaoOrder = {
  // 本地唯一标记(存在1个订单多个物流用local_id 进行自定义方便做处理)
  local_id: string
  // // 订单创建时间
  // createTime: string
  // 订单id
  orderId: v.id
  // 是否部分发货标记: todo
  partialShipment: boolean
  // // 商品价格
  // total_price: string
  // 商品名称集合: 'xxx;yyy;...'
  // goods: string
  // 自定义扩展数据_状态:是否有物流信息
  // local_expressFlag: boolean
  // 自定义扩展数据_订单详情链接(主要用于尝试 进一步获取物流信息重要数据)
  local_viewDetail_url: string
  // 物流号
  expressId: string
  // 物流公司名称
  expressName: string
  // 发货时间
  consignTime: string
}
