<template>
    <div class="popup-wrap">
        <header class="header">title</header>
        <main class="main">content</main>
        <footer class="footer">footer</footer>
    </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.popup-wrap {
    width: 510px;
    height: 550px;
    display: flex;
    flex-direction: column;
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