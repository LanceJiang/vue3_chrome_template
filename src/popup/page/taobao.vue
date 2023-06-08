<template>
  <div class="wrap">
    Taobao <br/> <br/>
    <div class="item">
      todo... <ElButton size="small" @click="test_taobao_asyncBought_pcAll">获取淘宝订单列表数据</ElButton>
    </div>
  </div>
</template>
<script setup lang="ts" name="Taobao">
import {ElButton, ElMessage} from "element-plus";
const test_taobao_asyncBought_pcAll = () => {
  console.error('test....')
  ElMessage.warning('ttttttttttttt')
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
