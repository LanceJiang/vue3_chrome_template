<script lang="ts">
import { defineComponent, onMounted } from 'vue';
export default defineComponent({
    name: 'background',
    created() {
        // 初始化
        chrome.runtime.onInstalled.addListener(details => {
            console.log('欢迎使用 vue3_crx_template')
            const curVersion = details.previousVersion
            console.log(`当前版本：${curVersion || '- -'}`)
        })
        window.$bg = this
        /**
         * 接收来自popup和options发来的数据
         * 短连接 sendMessage({type, data}, cb) 用以区分
         */
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log(request, 'request')
            switch (request.type) {
                /*case 'XXXXXXX': {
                  // 获取相关网页
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve({data: '测试.....'})
                    }, 4000)
                  }).then(res => {
                      sendResponse({ code: 200, data: res })
                    })
                  break
                }*/
                default: {
                    sendResponse({
                        code: 0,
                        data: null,
                        message: `错误请求，没有找到type=“${request.type}”的方法`
                    })
                }
            }
            return true
        })
    },
    beforeUnmount() {
        console.log('bg 卸载')
    },
    setup(props, { emit, attrs }) {
        onMounted(() => {
            // todo
        })
    },
});
</script>

<style lang="scss" scoped>
</style>