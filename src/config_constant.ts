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

export default getConfigByEnv()

