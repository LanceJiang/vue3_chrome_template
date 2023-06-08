<template>
  <ElDropdown size="small" trigger="click" @command="handleCommand">
    <span class="el-dropdown-link">
      <ElImage src="img/logo.png" />
      {{ showLabel }}
      <ElIcon class="el-icon--right">
        <ArrowDown />
      </ElIcon>
    </span>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem v-for="v of options" :key="v.label" :command="v.value">{{ v.label }}</ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<script setup lang="ts">
import {ArrowDown} from "@element-plus/icons-vue";
import { ElDropdown, ElImage, ElIcon, ElDropdownMenu, ElDropdownItem } from 'element-plus'
const props = withDefaults(defineProps<{
  options: {label: string; value: any;[key: string]: any}[]
  value: string
}>(), {
  options: () => [],
  value: ''
})
export type DropdownEmits = {
  (e: 'command', value: any): void
  (e: 'update:modelValue', value: any): void
  // command: [value: string|object]
  // 'update:modelValue': [value: string|object]
}
const emit = defineEmits<DropdownEmits>()
// const dropdownList = ref(options)
// const curType = ref(options[0].label)
const handleCommand = (command: string) => {
  // curType.value = command
  emit('update:modelValue', command)
  // emit('command', command)
}
</script>
<style scoped lang="scss">

</style>
