<template>
  <div class="popup-wrap">
    <header class="header">
      <!-- <DropDown :options="typeOptions" v-model="curType"/>-->
      <img class="logo" src="@/../public/img/logo.png"/>
      <ElSelect v-model="curType" size="small">
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
      <span style="margin-left: auto;">title</span>
    </header>
    <main class="main">
      <component :is="components[curType]"/>
    </main>
    <footer class="footer">footer</footer>
  </div>
</template>

<script lang="ts" setup>
// import DropDown from "@/popup/components/DropDown.vue";
import Taobao from "@/popup/page/taobao.vue";
import Others from "@/popup/page/others.vue";
import {ElSelect, ElOption} from 'element-plus'

import {ref} from "vue";
const components = {
  taobao: Taobao,
  others: Others,
}
const typeOptions = ref([
  {
    label: '获取淘宝订单',
    value: 'taobao'
  },
  {
    label: '其他功能',
    value: 'others'
  }
])
const curType = ref('taobao')
</script>

<style lang="scss" scoped>
//@import 'element-plus/theme-chalk/src/button.scss';

.popup-wrap {
  width: 510px;
  height: 550px;
  display: flex;
  flex-direction: column;

  .logo {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
  .main {
    padding: 0 10px;
    flex: 1;
  }

  .header {
    height: 36px;
    padding: 0 10px;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
  }

  .footer {
    height: 36px;
    padding: 0 10px;
    border-top: 1px solid #ccc;
    display: flex;
    align-items: center;
  }
}
</style>
