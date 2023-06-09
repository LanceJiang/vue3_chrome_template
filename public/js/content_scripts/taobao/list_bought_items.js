{
  console.log('这是 content-script> js/content_scripts/taobao/list_bought_items test Start:');

  // 注意，必须设置了run_at=document_start 此段代码才会生效
  document.addEventListener('DOMContentLoaded', function () {
    // 注入自定义JS
    injectCustomJs();
    // query_taobao_asyncBought_pcAll()
    // try_asyncBought_pcAllTrackingOrders()
    // tip('33333')
    // initCustomWarnPanel();
  });

  // 业务相关功能 Start
  // 自定义简易request请求
  const request = (query = {}) => {
    const { method = 'get', url = '', data, headers = {} } = query
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            console.log(xhr, 'xhr.... request res')
            resolve(JSON.parse(xhr.responseText || '{}'))
          } else {
            reject({
              errorType: "onerror",
              xhr: xhr,
            });
          }
        }
      }
      xhr.open(method, url, true)
      // 设置 requestHeader
      if(Object.keys(headers).length) {
        Object.keys(headers).forEach(k => {
          xhr.setRequestHeader(k, headers[k])
        })
      }
      xhr.send(data || null)
    })
  }

  // 尝试获取某一页的订单数据
  const query_taobao_asyncBought_pc = (pageNum = 1, pageSize = 50) => {
    const params = {
      pageSize,
      pageNum
    }
    return request({
      method: 'post',
      url: '//buyertrade.taobao.com/trade/itemlist/asyncBought.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&_input_charset=utf8',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
    })
  }
  const query_taobao_asyncBought_pcAll = async (interceptDate = '2022-12-31') => {
    const interceptDateNum = +new Date(interceptDate)
    const pageSize = 50
    let pageNum = 1
    let bool = true
    // 有效订单
    let all_orders = []
    // 时间有效 但 过滤条件无效订单 订单号集合
    const loseOrder_ids = []
    while(bool) {
      const cur_res = await query_taobao_asyncBought_pc(pageNum, pageSize)
      const { mainOrders = [], page = {} } = cur_res || {}
      if(page?.currentPage === page?.totalPage) {
        bool = false
      }
      const lastOrder = mainOrders[mainOrders.length - 1] || {}
      // 超过最小时间 做判断不再请求下一页
      if(+new Date(lastOrder.orderInfo?.createTime) < interceptDateNum) {
        bool = false
      }
      // 给订单做处理
      // step1: 时间有效过滤
      let mainOrders_ = mainOrders.filter((o) => {
        // 通过 时间限制 过滤
        return +new Date(o.orderInfo?.createTime) > interceptDateNum
      })
      const filterNum_1 = mainOrders_.length
      console.warn(`当前第${pageNum}页， 生成时间有效订单个数为: ${filterNum_1}`)
      // step2: 订单有效过滤
      mainOrders_ = mainOrders_.filter(v => {
        // 订单状态信息
        const statusInfo = v.statusInfo || {}
        const operations = statusInfo.operations || []
        // 通过 是否有物流状态进行过滤 (viewLogistic 表示有物流)
        let expressLimit = operations.find(operate => operate.id === 'viewLogistic')

        /** 自定义扩展数据相关 Start */
        // 自定义扩展数据_状态信息url
        v.local_expressFlag = !!expressLimit
        // 自定义扩展数据_订单详情链接(用于尝试 进一步获取物流信息重要数据)
        v.local_viewDetail_url = (operations.find(operate => operate.id === 'viewDetail') || {}).url
        /** 自定义扩展数据相关 End */

        // 过滤条件 (有查看物流的 || 交易成功的(订单存在过久或者其他原因可能导致不再展示物流标记)) // 初步认定 交易成功的是实体交易 有物流信息
        const bool = expressLimit || statusInfo.text === '交易成功'
        // 过滤条件不符合的 orderId 丢置 loseOrder_ids
        if(!bool) {
          loseOrder_ids.push(v.id)
        }
        return bool
      })
      console.error(`当前是第${pageNum}页，需要获取的订单有${mainOrders_.length}个，定义为失效的订单有${filterNum_1 - mainOrders_.length}个`)
      // 对有效数据重新定义数据内容
      mainOrders_.map(v => {
        const orderInfo = v.orderInfo || {}
        return {
          // 订单创建时间
          createTime: orderInfo.createTime,
          // 订单id
          orderId: v.id,
          // orderId: orderInfo.id,
          // 商品价格
          total_price: v.payInfo?.actualFee,
          // 商品名称集合: 'xxx;yyy;...'
          goods: v.subOrders.map(_v => _v.itemInfo?.title).join(';'),
          // 自定义扩展数据_状态信息url
          local_expressFlag: v.local_expressFlag,
          // 自定义扩展数据_订单详情链接(主要用于尝试 进一步获取物流信息重要数据) todo...
          local_viewDetail_url: v.local_viewDetail_url,
          // express_xx相关内容数据做预留 交给 物流请求获取进行赋值
          // 物流号
          expressId: '',
          // 物流公司名称
          expressName: '',
        }
      })
      all_orders = all_orders.concat(mainOrders_)
      if(bool) {
        pageNum++
        const timeName = +new Date() + '_'
        console.time(timeName)
        await new Promise((r) => {
          // 2-4s 延时
          setTimeout(r, 2000 + Math.random() * 2000 )
        })
        console.timeEnd(timeName)
      }
    }
    console.log(`总共需要请求数据${all_orders.length}个, 条件失效的(时间有效)订单数据${loseOrder_ids.length}个`)
    console.error(all_orders, 'all_orders, loseOrder_ids', loseOrder_ids)
    return { orders: all_orders, loseOrder_ids }
  }

  const query_taobao_trade_trackingNumber = (orderId) => {
    return request({
      method: 'get',
      url: `https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=${orderId}`
    })
  }

  /*const try_asyncBought_pcAllTrackingOrders = () => {
    query_taobao_asyncBought_pcAll('2022-10-31').then(async orders => {
      for(let order of orders) {
        await query_taobao_trade_trackingNumber(order.orderId).then(res => {
          console.warn(`订单：${order.orderId}获取成功`, JSON.stringify(res))
          order.expressId = res.expressId
          order.expressName = res.expressName
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
    })
  }*/

  let cur_panel = null
  const iconUrl = chrome.runtime.getURL('img/logo.png')

  function initCustomWarnPanel() {
    // var pathname = new URL(location.href).pathname
    // if (pathname.includes("/ap/signin")) return // 过滤登录页面的情况
    var panel = document.createElement('div');
    panel.className = 'chrome-plugin-ectool';
    panel.innerHTML = `
    <header><img src="${iconUrl}">xxx工具 <span class="close">&times;</span></header>
		<div class="contentWrap">
        <h2>您的taobao后台登录已失效，请尝试重新登录后继续工作</h2>
        <p class="footer">
          <span class="btn">我已登录</span>
        </p>
    </div>
		<!--<div class="btn-area">
			<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
			&lt;!&ndash;<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>&ndash;&gt;
			<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
		</div>
		<div id="my_custom_log"></div>-->
	`;
    document.body.appendChild(panel);
    panel.querySelector('.close').onclick = clearWarnPanel
    // 提示background 激活 update updateCoookieHandeler
    panel.querySelector('.btn').onclick = function () {
      clearWarnPanel()
      // 发送消息给后台 更新 任务
      sendMessageToBackground({type: 'activate_updateCookie', data: null})
    }      // console.log('触发 background 更新 ....')

    cur_panel = panel
  }

  function clearWarnPanel() {
    if (cur_panel) {
      document.body.removeChild(cur_panel);
      cur_panel = null
    }
  }

  // 业务相关功能 End

  // 向页面注入JS
  function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
      // 放在页面不好看，执行完后移除掉
      this.parentNode.removeChild(this);
    };
    document.body.appendChild(temp);
  }

  // 接收来自后台的消息
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // message: {type, message, data }
    console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', message);
    // 清空 弹窗指令
    // type命名方式  content_YourHandlerName
    // sendResponse({message,data})
    switch (message.type) {
      // 清除亚马逊后台提示窗口
      case 'content_clearWarnPanel':
        clearWarnPanel()
        sendResponse({message: '我收到你的消息了：' + JSON.stringify(message)});
        break
      // 添加亚马逊后台提示窗口(接口失效情况下)
      case 'content_addWarnPanel':
        !cur_panel && initCustomWarnPanel()
        sendResponse({message: '我收到你的消息了：' + JSON.stringify(message)});
        break
      // 获取淘宝所有的订单数据
      case 'content_query_taobao_asyncBought_pcAll': {
        query_taobao_asyncBought_pcAll(message.data || undefined).then(res => {
          console.warn('content_query_taobao_asyncBought_pcAll 获取成功： ', res)
          sendMessageToBackground({type: 'bg_query_taobao_asyncBought_pcAll', data: res, code: 200 })
        }).catch(err => {
          console.error('content_query_taobao_asyncBought_pcAll 获取失败： ', err)
          sendMessageToBackground({type: 'bg_query_taobao_asyncBought_pcAll', data: err, code: 400 })
        })
        setTimeout(() => {
          sendResponse({message: '我收到你的消息了(隔了2s告诉你的)', data: '处理中...'});
        }, 2000)
      }
        break
      default: {
        sendResponse({
          code: 0,
          data: null,
          message: `错误请求，没有找到type=“${message.type}”的方法`
        })
        tip(JSON.stringify(message))
      }
    }
  });

  // 主动发送消息给后台
  // 要演示此功能，请打开控制台主动执行sendMessageToBackground()
  function sendMessageToBackground(message, cb = (res) => {
    console.log('收到来自后台的回复：' + JSON.stringify(res || {})) // tip('.........')
  }) {
    chrome.runtime.sendMessage(message, res => {
      debugger
      const error = chrome.runtime.lastError
      if (error) {
        console.log(error.message, 'chrome.runtime.lastError by [sendMessageToBackground]')
        // do you work, that's it. No more unchecked error
      } else {
        cb && cb(res)
      }
    });
  }

  // 接受页面消息
  //   window.addEventListener("message", function(e) {
  //     console.log('收到消息：', e.data);
  //     if(e.data && e.data.cmd == 'invoke') {
  //       eval('('+e.data.code+')');
  //     }
  //     else if(e.data && e.data.cmd == 'message') {
  //       tip(e.data.data);
  //     }
  //   }, false);

  var tipCount = 0;

  // 简单的消息通知
  function tip(info) {
    info = info || '';
    var ele = document.createElement('div');
    ele.className = 'chrome-plugin-ectool-tip slideInLeft';
    ele.style.top = tipCount * 70 + 20 + 'px';
    ele.innerHTML = `<div>${info}</div>`;
    document.body.appendChild(ele);
    ele.classList.add('animated');
    tipCount++;
    setTimeout(() => {
      ele.style.top = '-120px';
      setTimeout(() => {
        ele.remove();
        tipCount--;
      }, 400);
    }, 3000);
  }
}
