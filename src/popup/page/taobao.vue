<template>
  <div class="wrap">
    <div class="item-title">获取淘宝订单列表数据</div>
    <div class="item-content">
      <ElInput
        v-model="orderQuery.itemTitle"
        style="width: 170px;margin-right: 4px;"
        size="small"
        placeholder="请输入商品标题或订单号"/>
      <span>订单开始时间：<ElDatePicker
        v-model="orderQuery.dateBegin"
        style="width: 150px;margin-right: 4px;"
        size="small"
        type="datetime"
        format="YYYY/MM/DD HH:mm:ss"
        placeholder="订单开始时间过滤"/></span>
      <ElButton
        size="small"
        style="margin-left: auto;"
        type="primary"
        @click="query_taobao_asyncBought_pcAll"
      >获取</ElButton>
    </div>
    <div class="item-box">
      <!-- 条件失效的订单数据列表 -->
      <template v-if="taobao_loseOrder_ids.length">
        <div class="item-title _title">条件失效的订单数据列表: {{taobao_loseOrder_ids.length}}</div>
        <div style="max-height: 86px; border: 1px solid #ccc; background: #fef0f0;">
          <el-scrollbar max-height="84px">
            <div
              v-for="id of taobao_loseOrder_ids"
              :key="id"
              class="order error"
            >
              {{id || '-'}}
            </div>
          </el-scrollbar>
        </div>
      </template>
      <template v-if="taobao_orderList_error.length">
        <div class="item-title _title">数据获取失败展示: {{taobao_orderList_error.length}}</div>
        <!--        <div class="tr">
          <div class="td">(失败)订单号</div>
          <div class="td">商品名称</div>
        </div>-->
        <div style="max-height: 142px; border: 1px solid #ccc; background: #ecf5ff;">
          <el-scrollbar max-height="140px">
            <div
              v-for="o of taobao_orderList_error"
              :key="o.orderId"
              class="order">
              {{o.orderId || '-'}}({{o.createTime || '-'}})
            </div>
          </el-scrollbar>
        </div>
        <div class="item-content" style="margin-top: 6px;">
          <ElButton
            size="small"
            style="margin-left: auto;"
            type="primary"
            @click="tryGetOrders"
          >尝试重新获取</ElButton>
        </div>
      </template>
    </div>
    <div class="item-title">其他功能...</div>
    <div class="item-content">
      <ElButton
        style="margin-left: auto;"
        type="primary"
        size="small"
        @click="test2">其他功能todo</ElButton>
    </div>
  <!--  todo 展示失败的订单列表 todo...  -->
  </div>
</template>
<script setup lang="ts" name="Taobao">
import {ElButton, ElMessage, ElDatePicker, ElInput} from "element-plus";
import {reactive, computed} from "vue";
import {usePopupCtx} from "../hooks/usePopupCtx";
const bg_state = usePopupCtx()
const taobao_orderList_error = computed(() => bg_state.taobao_orderList_error)
const taobao_loseOrder_ids = computed(() => bg_state.taobao_loseOrder_ids)
// import {jsonToSheetXlsx} from "@/utils/export2Excel";
const orderQuery = reactive({
  dateBegin: '2022/12/31 00:00:00',
  // dateEnd: undefined,
  itemTitle: ''
})
window.orderQuery = orderQuery
const query_taobao_asyncBought_pcAll = () => {
  console.error('test....')
  // $bg.try_connect_content_query_taobao_asyncBought_pcAll(JSON.parse(JSON.stringify(orderQuery)))
  $bg.try_connect_content_query_taobao_asyncBought_pcAll(orderQuery)
  ElMessage.warning('ttttttttttttt')
  // sendMessageToContentScript
}

const tryGetOrders = () => {
  console.error('尝试重新获取...')
}
const test2 = () => {
  // console.log(window, 'window....test2')
  // window.$bg.testDownLoadExcel()
  ElMessage.warning('其他功能todo')
}
</script>
<style scoped lang="scss">
.wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  .item-title {
    position: relative;
    display: flex;
    align-items: center;
    padding: 6px 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    &:before {
      content: "";
      width: 3px;
      height: 16px;
      margin-right: 6px;
      background: #4097fd;
    }
  }
  .item-content {
    display: flex;
    align-items: center;
    //justify-content: center;
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
        background: #79bbff;
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
