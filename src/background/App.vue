<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import {
    query_goodListAll,
    query_goodList,
    query_goodDetail_mobile,
    query_goodDetail_pc,
    query_jump_goodDetail_pc
} from '@/api/taobao';
export default defineComponent({
    name: 'background',
    created() {
        // 初始化
        chrome.runtime.onInstalled.addListener(details => {
            console.log('欢迎使用 vue3_crx_template')
            const curVersion = details.previousVersion
            console.log(`当前版本：${curVersion || '- -'}`)
            // // 当版本不一致 清空原来存留的历史数据
            // const lastVersionKey = 'bg_tool_version'
            // // const lastVersion = storage.ls_get(lastVersionKey)
            // if (curVersion !== lastVersion) {
            //     localStorage.clear() // 清空原数据
            //     storage.ls_set(lastVersionKey, curVersion)
            // }
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
        // console.error(props, { emit, attrs }, 'props, { emit, attrs } setup')
        window.query_goodDetail_mobile = query_goodDetail_mobile
        window.query_goodDetail_pc = query_goodDetail_pc
        // 天猫 617266453987
        // const testQueryDetail =
        onMounted(() => {
            // 测试获取商品列表 Start
            /*query_goodList('6个核桃').then(res => {
              console.log(res, res.length, '6个核桃 所有数据')
              // console.log(res, '6个核桃 所有数据')
            })*/
            // 3页
            /*query_goodListAll('6个核桃').then(res => {
            // query_goodList('6个核桃').then(res => {
                console.log(res, res.length, '6个核桃 所有数据')
                // console.log(res, '6个核桃 所有数据')
            })*/
            // 100页
            /*query_goodListAll('核桃').then(res => {
                console.log(res, res.length, '核桃 所有数据')
                // console.log(res, '核桃 所有数据')
            })*/
            // 测试获取商品列表 End

            // 测试获取商品详情 Start
            // query_goodDetail_mobile('547826051836')
            // todo 测试 fetch detail
            // query_jump_goodDetail_pc("https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1479345303&k=1113&e=QEIum8N%2FE8ZNjRjdgEzBox2T7kXXz1eCFGSckyV7oyN3bJMtNLCUGI3WX8koj8xzMkqvcNiN7%2F5%2BTXvE1qCa7zL5IKs8zooBydN%2FGW68XjTahggur97VwDWR2Yz7GTv5YFTn8y8P9uGhZvTrN04fg8MFc0OkFpgTxH9OYuVXlQRT2uqVVzNimOF39YzXJARuuUTKYg%2FTlhHTOLxcNjwrVFb7oCejbfqIDdStFMF42wHHPi9JVs4Gse%2Bot7%2FvZ70EoJaX%2BqBcanGbSmTJ5jTTo6kf0Ve8KtQuOR5glqhnCwuM6TRByslgJfukHCFkzgYKtL08d8yE1RC12%2FOSrrXftumxCabm0ssTancHGkNwpQZpFytu54SJaUZoSLQAYjIQLEEXnCk1QWd%2FxzbKpwr6oa4kaHyEli%2F7Bxzkiz3LQ08%2BHnJIDIuiPbP%2BDtPQ9wPLeCMJZrcYxE1OM26j%2FD7MOkVVSr0FgZqg1KrPV4KBJdCkZE41DmsEGNxasfp9HKiYyCLO4xnkeo8nykDjYDS9Zuz3H7Tsn%2FNCjDzkvCt2HOb4KrwlTIBOZF5QMLIis45O9IQCmWSDgp032xXmWfv%2FKszjLaM8l6dzCeLVHGTPQhf998s20udvLzuyOiCF2wGnMQKnzEBoC3A0IxxIS2XHNg0JhEB1RoApmwpq2Fq7oP%2Fijf1OUtWy8ASC0gLZo%2Fi6n6uhvznxvEag%2BiZSRwIJzmc0k1HOJPG1Y%2F28zPsApjPmjiN6dIYY8oNgvWVrFSn4TAKJW3LZ3SUXa438vzF0mo724w2y%2BHmkToD%2B%2F%2Fi%2FmN6h9k2GpVYZMKk%2FRekoDlBs51a3S%2BXKRoes%2BcnqE5w5FA10v3cYr9I0qWO2tby8jnAaUljipqfPgTw3%2BV26h%2FzFM6GpoBhuv%2BXE9kTnTLeEOBk9RRnl%2BCad%2FyrY7MlEZw8Rw53Z%2FvGiDEcf14hbRdiytjw8LpcGHqVp85lqsnIhf85cIJ8kxYKcGfP50WKWOg9PtXJ5lkpdBILUrgTZjtO0Q%2FF5NpkBgHDEk0FrT35bIx2IGqy6B175kqAeAzLy7oPXBqEPI9VCD9JoaPsqj4CsuQ2Ij%2FGtFCj6XihmxfiXkw%3D%3D")
            // query_jump_goodDetail_pc("https://item.taobao.com/item.htm?id=547826051836")
            // 会自动跳转切换域名 但是 切换过去后 返回跨域... todo...
            /*fetch("https://item.taobao.com/item.htm?id=547826051836").then((res => {
                console.log(res, 'res')
                debugger
            }))*/
            /*fetch("https://detail.tmall.com/item.htm?id=?id=608030379744").then((res => {
                console.log(res, 'res')
                debugger
            }))*/
            // query_jump_goodDetail_pc("https://chaoshi.detail.tmall.com/item.htm?id=547826051836")
            // todo... 可能会涉及到 重定向失败问题 todo...
            // item.detail_url
            // query_jump_goodDetail_pc("https://click.simba.taobao.com/cc_im?p=6%B8%F6%BA%CB%CC%D2&s=1479345303&k=1113&e=QEIum8N%2FE8ZNjRjdgEzBox2T7kXXz1eCFGSckyV7oyN3bJMtNLCUGI3WX8koj8xzMkqvcNiN7%2F5%2BTXvE1qCa7zL5IKs8zooBydN%2FGW68XjTahggur97VwDWR2Yz7GTv5YFTn8y8P9uGhZvTrN04fg8MFc0OkFpgTxH9OYuVXlQRT2uqVVzNimOF39YzXJARuuUTKYg%2FTlhHTOLxcNjwrVFb7oCejbfqIDdStFMF42wHHPi9JVs4Gse%2Bot7%2FvZ70EoJaX%2BqBcanGbSmTJ5jTTo6kf0Ve8KtQuOR5glqhnCwuM6TRByslgJfukHCFkzgYKtL08d8yE1RC12%2FOSrrXftumxCabm0ssTancHGkNwpQZpFytu54SJaUZoSLQAYjIQLEEXnCk1QWd%2FxzbKpwr6oa4kaHyEli%2F7Bxzkiz3LQ08%2BHnJIDIuiPbP%2BDtPQ9wPLeCMJZrcYxE1OM26j%2FD7MOkVVSr0FgZqg1KrPV4KBJdCkZE41DmsEGNxasfp9HKiYyCLO4xnkeo8nykDjYDS9Zuz3H7Tsn%2FNCjDzkvCt2HOb4KrwlTIBOZF5QMLIis45O9IQCmWSDgp032xXmWfv%2FKszjLaM8l6dzCeLVHGTPQhf998s20udvLzuyOiCF2wGnMQKnzEBoC3A0IxxIS2XHNg0JhEB1RoApmwpq2Fq7oP%2Fijf1OUtWy8ASC0gLZo%2Fi6n6uhvznxvEag%2BiZSRwIJzmc0k1HOJPG1Y%2F28zPsApjPmjiN6dIYY8oNgvWVrFSn4TAKJW3LZ3SUXa438vzF0mo724w2y%2BHmkToD%2B%2F%2Fi%2FmN6h9k2GpVYZMKk%2FRekoDlBs51a3S%2BXKRoes%2BcnqE5w5FA10v3cYr9I0qWO2tby8jnAaUljipqfPgTw3%2BV26h%2FzFM6GpoBhuv%2BXE9kTnTLeEOBk9RRnl%2BCad%2FyrY7MlEZw8Rw53Z%2FvGiDEcf14hbRdiytjw8LpcGHqVp85lqsnIhf85cIJ8kxYKcGfP50WKWOg9PtXJ5lkpdBILUrgTZjtO0Q%2FF5NpkBgHDEk0FrT35bIx2IGqy6B175kqAeAzLy7oPXBqEPI9VCD9JoaPsqj4CsuQ2Ij%2FGtFCj6XihmxfiXkw%3D%3D")
            window.testAll = () => query_goodList('6个核桃').then(async res => {
                console.log(res, res.length, '6个核桃 所有数据')
                res.length = 3
                const list = []
                while(res.length) {
                    await new Promise((r) => setTimeout(r, Math.random() * 2000))
                    const cur = res.shift()
                    await query_goodDetail_mobile(cur.nid).then(obj => {
                        console.log(obj, 'mobile 详情')
                        list.push(obj)
                    })
                }
                console.log(list, '6个核桃 所有详情数据')
            })
            // 测试获取商品详情 End
        })
    },
});
</script>

<style lang="scss" scoped>
</style>