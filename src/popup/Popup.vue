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
import {ElSelect, ElOption, ElMessage} from 'element-plus'
import {onMounted, reactive, ref} from "vue";
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
// 与bg关联的状态管理
const bg_state = reactive({
  tasksLoading: false,
  bg_tasks: [],
})
const $background = chrome.extension.getBackgroundPage()
console.error($background, '$background...')
window.$background = $background // '123456'
window.$bg = $background.$bg // '123456'
// 接收来自background发来的数据
chrome.runtime.onMessage.addListener((msg) => {
  let { type, data, message } = msg
  switch (type) {
    // 更新 taskLoading
    case 'upload_bg_tasksLoading': {
      bg_state.tasksLoading = data
      return
    }
    // 更新 bg_task
    case 'upload_bg_task': {
      console.error('请更新 Popup 的 upload_bg_task')
      // bg_state.bg_tasks = [] // storage.ls_getBgTasks()
      return
    }
    // 更新数据成功 提示
    case 'upload_bg_msg_success': {
      return ElMessage.success(message || '操作成功~')
    }
    // 更新数据错误 提示
    case 'upload_bg_msg_error': {
      return ElMessage.warning(message || '获取出错~')
    }
    default:
      console.log(`暂未获取到[${type}]监听类型`)
  }
})

/*onMounted(() => {

})*/
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
