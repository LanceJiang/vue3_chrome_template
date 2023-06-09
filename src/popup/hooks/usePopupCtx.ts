import { provide, inject, ComputedRef } from 'vue'
const key = Symbol('popup')
type Instance = {
  tasksLoading: boolean
  taobao_orderList_error: any[]
  taobao_loseOrder_ids: string[]
  [key: string]: any
}

export function createPopupCtx(instance: Instance) {
  provide(key, instance)
}

export function usePopupCtx(): Instance {
  return inject(key) as Instance
}
