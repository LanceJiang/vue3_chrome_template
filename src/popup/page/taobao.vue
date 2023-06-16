<template>
  <div class="wrap">
    <div class="common-title">
      获取淘宝订单列表数据
      <div class="common-title_right">
        <span style="margin-right: 4px;">获取数据间隔(即时生效)</span>
        <ElSelect
          v-model="taobao_orderUpdateInterval"
          style="width: 120px;"
          size="small">
          <ElOption
            v-for="item in taobao_orderUpdateIntervalOptions_"
            :key="item.value"
            v-bind="item"
          />
        </ElSelect>
      </div>
    </div>
    <div class="item-wrap">
      <div class="item-content">
        <div class="item">
          <div class="label">订单类型：</div>
          <ElSelect
            v-model="orderType"
            style="width: 170px;"
            size="small">
            <ElOption
              v-for="item in typeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </ElSelect>
        </div>
        <div v-show="orderType === '所有订单'">
          <div class="item">
            <div class="label">订单开始时间：</div>
            <ElDatePicker
              v-model="orderQuery.dateBegin"
              style="width: 170px;"
              size="small"
              type="datetime"
              format="YYYY/MM/DD HH:mm:ss"
              placeholder="订单开始时间过滤"/>
          </div>
          <div class="item">
            <div class="label">商品标题或订单号：</div>
            <ElInput
              v-model="orderQuery.itemTitle"
              style="width: 170px;"
              size="small"
              placeholder="请输入商品标题或订单号"/>
          </div>
        </div>
      </div>
      <ElButton
        size="small"
        style="margin-left: auto;"
        type="primary"
        :loading="taobao_orderList_loading"
        :disabled="taobao_orderList_errorLoading"
        @click="query_taobao_asyncBought_pcAll"
      >获取(下载excel)</ElButton>
    </div>
    <div class="item-box">
      <template v-if="taobao_orderLogText">
        <div class="common-title _title">当前获取</div>
        <div style="background: #ff6000;color: #fff;">{{taobao_orderLogText}}</div>
      </template>
      <template v-if="taobao_loseOrder_ids.length">
        <div class="common-title _title">条件失效的订单数据列表(无'交易成功'&&'订单详情'订单): {{taobao_loseOrder_ids.length}}</div>
        <div style="max-height: 86px; border: 1px solid #ccc; background: #fef0f0;">
          <el-scrollbar max-height="84px">
            <div
              v-for="id of taobao_loseOrder_ids"
              :key="id"
              class="order error"
            >
              订单号： {{id || '-'}}
            </div>
          </el-scrollbar>
        </div>
      </template>
      <template v-if="taobao_orderList_error.length">
        <div class="common-title _title">数据获取失败展示: {{taobao_orderList_error.length}}</div>
        <!--        <div class="tr">
          <div class="td">(失败)订单号</div>
          <div class="td">商品名称</div>
        </div>-->
        <div style="max-height: 142px; border: 1px solid #ccc; background: #f8e3c5;">
          <el-scrollbar max-height="140px">
            <div
              v-for="o of taobao_orderList_error"
              :key="o.orderId"
              class="order">
              订单号： {{o.orderId || '-'}}
            </div>
          </el-scrollbar>
        </div>
        <div class="item-content" style="margin-top: 6px; display: flex;">
          <ElButton
            size="small"
            style="margin-left: auto;"
            type="warning"
            :loading="taobao_orderList_errorLoading"
            :disabled="taobao_orderList_loading"
            @click="tryGetOrders"
          >尝试重新获取(下载excel)</ElButton>
        </div>
      </template>
    </div>
<!--    <div class="common-title">其他功能...</div>
    <div class="item-content">
      <ElButton
        style="margin-left: auto;"
        type="primary"
        size="small"
        @click="test2">其他功能todo</ElButton>
    </div>-->
  <!--  todo 展示失败的订单列表 todo...???  -->
  </div>
</template>
<script setup lang="ts" name="Taobao">
import {ElButton, ElMessage, ElDatePicker, ElInput, ElSelect, ElOption } from "element-plus";
import {reactive, computed, ref, watch} from "vue";
import {usePopupCtx} from "../hooks/usePopupCtx";
import {taobao_orderUpdateIntervalOptions} from "@/config_constant";
const bg_state = usePopupCtx()
const taobao_orderUpdateInterval = computed({
  get: () => bg_state.taobao_orderUpdateInterval,
  set: (val) => {
    bg_state.taobao_orderUpdateInterval = val
    $bg.states.taobao_orderUpdateInterval = val
  }
})

const taobao_orderUpdateIntervalOptions_ = ref(JSON.parse(JSON.stringify(taobao_orderUpdateIntervalOptions)))
// 用于测试切换间隔0s打开
window.test_switch0sStatus = () => taobao_orderUpdateIntervalOptions_.value[3].disabled = !taobao_orderUpdateIntervalOptions_.value[3].disabled
const taobao_orderList_loading = computed(() => bg_state.taobao_orderList_loading)
const taobao_orderList_error = computed(() => bg_state.taobao_orderList_error)
const taobao_orderList_errorLoading = computed(() => bg_state.taobao_orderList_errorLoading)
const taobao_loseOrder_ids = computed(() => bg_state.taobao_loseOrder_ids)
const taobao_orderLogText = computed(() => bg_state.taobao_orderLogText)
const orderQuery = reactive({
  dateBegin: '2023/01/01 00:00:00',
  // dateEnd: undefined,
  itemTitle: ''
})
const typeOptions = ref([
  '待收货',
  '待发货',
  '所有订单',
])
const orderType = ref('待收货')
const query_taobao_asyncBought_pcAll = () => {
  const typeParams = {
    '待收货': {
      orderStatus: 'SEND',
      tabCode: 'waitConfirm'
    },
    '待发货': {
      orderStatus: 'NOT_SEND',
      tabCode: 'waitSend'
    },
    '所有订单': {
      orderStatus: '',
      tabCode: ''
    }
  }
  const params = {
    ...(orderType.value === '所有订单' ? orderQuery : {}),
    ...typeParams[orderType.value]
  }
  console.error(params, 'params....')
  taobao_orderList_loading
  $bg.try_connect_content_query_taobao_asyncBought_pcAll(params)
  /*// 验证待收货
  $bg.try_connect_content_query_taobao_asyncBought_pcAll({
    // 待收货
    orderStatus: 'SEND',
    tabCode: 'waitConfirm'
    // 待发货
    // orderStatus: 'NOT_SEND',
    // tabCode: 'waitSend'
  })*/
}

const tryGetOrders = () => {
  console.error('尝试重新获取...')
  // bg_state.taobao_orderList_errorLoading = true
  // $bg.states.taobao_orderList_errorLoading
  $bg.try_query_taobao_trade_trackingNumber_byViewDetailAll()
  // $bg.try_query_taobao_trade_trackingNumber_byViewDetail()
  /*$bg.try_query_taobao_trade_trackingNumber_byViewDetail({
    // 天猫测试
    // local_viewDetail_url: "//trade.tmall.com/detail/orderDetail.htm?bizOrderId=1823544375217594069",
    // orderId: "1823544375217594069"
    // 淘宝测试1
    // local_viewDetail_url: "//tradearchive.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1796441988877594069",
    // orderId: "1796441988877594069"
    // 淘宝测试2
    local_viewDetail_url: "//trade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=1823572599339594069",
    orderId: "1823572599339594069"
  })*/
}
const test2 = () => {
  // console.log(window, 'window....test2')
  // window.$bg.tryDownLoadDataToExcel()
  ElMessage.warning('其他功能todo')
}
</script>
<style scoped lang="scss">
.wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  .item-wrap {
    display: flex;
  }
  .common-title_right {
    margin-left: auto;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #4097fd;
  }
  .item-content {
    flex: 1;
    //margin-right: 10px;
    //justify-content: center;
    .item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      .label {
        width: 114px;
        text-align: right;
      }
      /*& + .item {
        margin-top: 4px;
      }*/
    }
  }
  .item-box {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    ._title {
      font-size: 12px;
      color: #b5b5b5;
    }
    .order {
      line-height: 14px;
      color: #666;
      font-size: 12px;
      &:hover {
        background: #eebe77;
      }
      &.error {
        //color: #f56c6c;
        &:hover {
          background: #f89898;
        }
      }
    }
  }
}
</style>
