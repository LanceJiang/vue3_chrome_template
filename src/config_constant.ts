import type {DefaultObject} from "@/common";

// 生产/本地 环境 不同的 数据源
const getConfigByEnv = () => {
  console.log(import.meta.env, 'import_meta_env')
  // {"BASE_URL":"/","MODE":"dev","DEV":false,"PROD":true,"SSR":false}
  const isDev = import.meta.env.MODE === 'dev'
  const configs: DefaultObject = {
    // key: [dev, prod]
    IS_DEV: [true, false], // 是否dev 环境
    INIT_TIME_NUM: [60, 5 * 60], // 倒计时(s)
    TASK_DELAY_TIME: [2, 5], // 任务延时计时(s)
  }
  return Object.keys(configs).reduce((res: DefaultObject, key) => {
    res[key] = configs[key][isDev ? 0 : 1]
    return res
  }, {})
}

// 更新淘宝订单数据时间间隔
export const taobao_orderUpdateIntervalOptions = [
  {
    label: '0.5-4s',
    value: '0.5-4s'
  },{
    label: '1-5s',
    value: '1-5s'
  },{
    label: '2-6s',
    value: '2-6s'
  },{
    label: '3-7s',
    value: '3-7s'
  },{
    label: '5-10s',
    value: '5-10s'
  },
  // 仅作为debugger测试
  {
    label: '0s',
    value: '0s',
    disabled: true
  },
]
export const taobao_orderUpdateIntervalConfig = {
  // value: [randomNum, baseNum] 毫秒数
  '0.5-4s': [3500, 500],
  '1-5s': [4000, 1000],
  '2-6s': [4000, 2000],
  '3-7s': [4000, 3000],
  '5-10s': [5000, 5000],
  '0s': [0, 0],
}

export default getConfigByEnv()

