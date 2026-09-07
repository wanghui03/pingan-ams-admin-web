<template>
  <div class="contract-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="合同列表" name="list">
        <ContractList ref="listRef" />
      </el-tab-pane>
      <el-tab-pane label="合同变更" name="change">
        <ChangeTab ref="changeRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ContractList from './ContractList.vue'
import ChangeTab from './ChangeTab.vue'

const activeTab = ref('list')
const listRef = ref(null)
const changeRef = ref(null)
</script>

<style scoped lang="scss">
.contract-container {
  padding: 20px;
}
</style>
