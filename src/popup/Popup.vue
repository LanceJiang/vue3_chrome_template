<template>
  <ElConfigProvider :locale="locale">
    <div class="popup-wrap">
      <header class="header-wrap">
        <!-- <DropDown :options="typeOptions" v-model="bg_state.pageType"/>-->
        <img class="logo" src="@/../public/img/logo.png"/>
        <ElSelect :modelValue="bg_state.pageType" @change="updatePageType" size="small">
          <ElOption
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
        <span style="margin-left: auto;">{{ crxName }}</span>
      </header>
      <main class="main">
        <component :is="components[bg_state.pageType]"/>
      </main>
      <footer class="footer-wrap">
        <div class="tip-wrap">
          <div class="version-group">
            <!--          <span v-if="IS_DEV" style="background: #f00;color:#fff;">测试-</span>-->
            <i :class="['isNewVersion' ? 'version_success' : 'version_error']">当前版本号：{{ version }}</i>
          </div>
          <div class="tip-wrap-right">
            <span style="color: #999;">(当前状态： {{ bg_state.workStatus || '-' }})</span>
          </div>
        </div>
      </footer>
    </div>
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
// import DropDown from "@/popup/components/DropDown.vue";
import Taobao from "@/popup/page/taobao.vue";
import Others from "@/popup/page/others.vue";
import {ElSelect, ElOption, ElMessage} from 'element-plus'
import {onMounted, reactive, ref} from "vue";
import {createPopupCtx} from "./hooks/usePopupCtx";
import {TAOBAO_LOSE_ORDER_IDS} from "@/utils/storage";
import config from '@/../public/manifest.json'
import envConfig from '@/config_constant'
const $background = chrome.extension.getBackgroundPage()
console.error($background, '$background...')
window.$background = $background // '123456'
window.$bg = $background.$bg // '123456'
const storage = $background.$bg.storage
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
const version = config.version
const crxName = config.name
const IS_DEV = envConfig.IS_DEV
// 与bg关联的状态管理
const bg_state = reactive({
  tasksLoading: false,
  taobao_orderUpdateInterval: $bg.states.taobao_orderUpdateInterval,
  taobao_orderList_loading: $bg.states.taobao_orderList_loading,
  taobao_orderList_error: storage.ls_get_taobao_orderList('error'),
  taobao_orderList_errorLoading: $bg.states.taobao_orderList_errorLoading,
  taobao_loseOrder_ids: storage.ls_get_list(TAOBAO_LOSE_ORDER_IDS),
  taobao_orderLogText: '',
  workStatus: $bg.states.workStatus,
  pageType: $bg.states.pageType || 'taobao',
})
const updatePageType = (val) => {
  bg_state.pageType = val
  // bg状态更新
  $bg.states.pageType = val
}
createPopupCtx(bg_state)

// 接收来自background发来的数据
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  let { type, data, message } = msg
  /**仅接收pop_前缀的数据用以 区分 background(bg_)*/
  switch (type) {
    // 更新 taskLoading
    case 'pop_upload_bg_tasksLoading': {
      bg_state.tasksLoading = data
      return
    }
    // 更新 插件工作状态
    case 'pop_upload_bg_workStatus': {
      bg_state.workStatus = data
      return
    }
    // 更新 当前爬取的淘宝信息
    case 'pop_upload_bg_taobao_orderLogText': {
      bg_state.taobao_orderLogText = data
      return
    }
    /*// 更新 bg_淘宝订单数据_成功
    case 'pop_upload_bg_taobao_orderList_success': {
      console.error('请更新 Popup 的 pop_upload_bg_taobao_orderList_success')
      return
    }*/
    // 更新 bg_淘宝订单数据_失败
    case 'pop_upload_bg_taobao_orderList_error': {
      bg_state.taobao_orderList_error = storage.ls_get_taobao_orderList('error')
      return
    }
    // 更新 bg_淘宝订单数据_处理loading状态
    case 'pop_upload_bg_taobao_orderList_loading': {
      console.log('pop_upload_bg_taobao_orderList_loading ----', data)
      bg_state.taobao_orderList_loading = data
      return
    }
    // 更新 bg_淘宝订单数据_失败重新处理loading状态
    case 'pop_upload_bg_taobao_orderList_errorLoading': {
      console.log('pop_upload_bg_taobao_orderList_errorLoading ----', data)
      bg_state.taobao_orderList_errorLoading = data
      return
    }
    // 更新 bg_淘宝订单数据_失败
    case 'pop_upload_bg_taobao_loseOrder_ids': {
      // console.log('请更新 条件失效的订单数据列表 pop_upload_bg_taobao_loseOrder_ids')
      bg_state.taobao_loseOrder_ids = storage.ls_get_list(TAOBAO_LOSE_ORDER_IDS)
      return
    }
    // 更新数据成功 提示
    case 'pop_upload_bg_msg_success': {
      return ElMessage.success(message || '操作成功~')
    }
    // 更新数据错误 提示
    case 'pop_upload_bg_msg_error': {
      return ElMessage.error(message || '获取出错~')
    }
    default:
      console.log(`暂未获取到[${type}]监听类型`)
      sendResponse({
        code: 0,
        data: null,
        message: type.toString().indexOf('pop_') === 0 ? `bg_:错误请求，没有找到type=“${type}”的方法` : `pop_:type=“${type}”不关我事`
      })
  }
})

/*onMounted(() => {

})*/
</script>

<style lang="scss">
.header-wrap {
  height: 35px;
  padding: 0 10px;
  border-bottom: 1px solid #E8E8E8;
  display: flex;
  align-items: center;
}
.footer-wrap {
  min-height: 35px;
  line-height: 1;
  padding: 0 10px;
  border-top: 1px solid #E8E8E8;
  //display: flex;
  //align-items: center;
  .tip-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    .version-group {
      > i {
        font-style: normal;
        & + i {
          margin-left: 4px;
        }
      }
      .version_success {
        //color: #67c23a;
      }
      .version_error {
        color: #f00;
      }
    }
    &-right {
      display: flex;
      text-align: right;
      overflow: hidden;
      color: inherit;
    }
  }
}
.common-title {
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
</style>
<style lang="scss" scoped>
//@import 'element-plus/theme-chalk/src/button.scss';
.popup-wrap {
  width: 510px;
  height: 600px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  .logo {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
  .main {
    padding: 0 10px;
    flex: 1;
  }
}
</style>
