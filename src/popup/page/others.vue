<template>
  <div class="wrap">
    Others
    <div class="item">
      尝试获取
    </div>
    <ElButton @click="test_taobao_asyncBought_pcAll">我是 ElButton</ElButton>
  </div>
</template>
<script setup lang="ts">
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
}
</style>
