export const LOG_KEY = 'bg_log'
export const TAOBAO_TASKS_KEY = 'bg_taobao_tasks'
export const TAOBAO_LOSE_ORDER_IDS = 'taobao_loseOrder_ids'


const storage = {
  ls_get(key: string) {
    return localStorage.getItem(key)
  },
  ls_set (key: string, data: string) {
    return localStorage.setItem(key, data)
  },
  ls_get_list(key: string) {
    return JSON.parse(this.ls_get(key) || '[]')
  },
  ls_set_list(key: string, list: any[] = []) {
    this.ls_set(key, JSON.stringify(list || []))
  },
  // 获取淘宝有效/失效订单
  ls_get_taobao_orderList(type = 'success') {
    // default || error
    const key = `${TAOBAO_TASKS_KEY}_${type}`
    return this.ls_get_list(key)
  },
  // 设置淘宝有效/失效订单
  ls_set_taobao_orderList(list: any[], type = 'success') {
    // type: success || error || default
    const key = `${TAOBAO_TASKS_KEY}_${type}`
    return this.ls_set_list(key, list)
  },
}
export default storage
