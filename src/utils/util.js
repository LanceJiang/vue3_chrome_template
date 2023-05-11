
// 自定义个性 log
export function consoleInfo(content = 'content', title = 'title', background = '#1475b2') {
  content = typeof content === 'object' ? JSON.stringify(content) : content
  console.log.apply(void 0, [`%c ${title}： %c ${content} `, 'padding: 1px; border-radius: 10px; color: #fff; background: #9159B2;', `padding: 1px; border-radius: 10px; color: #fff; background: ${background};`])
}
// 自定义 error log
export function $log_error(info, title = 'error') {
  consoleInfo(info, title, '#f00')
}

/**
 * 提取深层数据的值 (防止中间项 不存在导致的报错)
 * @param obj 【检测对象】
 * @param keyArr 【需要获取该对象内部数据key数组】
 * @returns {*}
 */
export function getDeepValue (obj, keyArr) {
  return keyArr.reduce((acc, key) => acc &&acc[key], obj)
}
