<template>
  <div class="wrap">
    Taobao <br/> <br/>
    <div class="item">
      todo... <ElButton size="small" @click="test_taobao_asyncBought_pcAll">获取淘宝订单列表数据</ElButton>
    </div>
    <div class="item">
      <ElButton size="small" @click="test2">todo</ElButton>
    </div>
  <!--  todo 展示失败的订单列表 todo...  -->
  </div>
</template>
<script setup lang="ts" name="Taobao">
import {ElButton, ElMessage} from "element-plus";
// import {jsonToSheetXlsx} from "@/utils/export2Excel";

const test_taobao_asyncBought_pcAll = () => {
  console.error('test....')
  $bg.try_connect_content_query_taobao_asyncBought_pcAll()
  ElMessage.warning('ttttttttttttt')
  // sendMessageToContentScript
}
const test2 = () => {
  console.log(window, 'window....test2')
  // window.$bg.testDownLoadExcel()
}
</script>
<style scoped lang="scss">
.wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  .item {
    display: flex;
    align-items: center;
    //justify-content: center;
  }
}
</style>
