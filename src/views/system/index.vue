<template>
  <div class="system-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="系统配置" name="config">
        <ConfigTab ref="configRef" />
      </el-tab-pane>
      <el-tab-pane label="字典配置" name="dict">
        <DictTab ref="dictRef" />
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="log">
        <LogTab ref="logRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConfigTab from './ConfigTab.vue'
import DictTab from './DictTab.vue'
import LogTab from './LogTab.vue'

const activeTab = ref('config')
const configRef = ref(null)
const dictRef = ref(null)
const logRef = ref(null)
</script>

<style scoped lang="scss">
.system-container {
  padding: 20px;
}
</style>