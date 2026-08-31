<template>
  <div class="file-upload">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :show-file-list="false"
      :accept="accept"
      :disabled="disabled"
    >
      <slot>
        <el-button type="primary" :disabled="disabled">
          <el-icon><Upload /></el-icon> 点击上传
        </el-button>
      </slot>
    </el-upload>
    
    <!-- 预览区域 -->
    <div v-if="modelValue" class="preview-area">
      <template v-if="isImage">
        <el-image :src="modelValue" fit="contain" class="preview-image" @click="handlePreview" />
      </template>
      <template v-else>
        <div class="file-info">
          <el-icon><Document /></el-icon>
          <span>{{ fileName }}</span>
        </div>
      </template>
      <div class="preview-actions">
        <el-button link type="primary" @click="handlePreview">查看</el-button>
        <el-button link type="danger" @click="handleRemove">删除</el-button>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="previewVisible" title="预览" width="800px">
      <el-image :src="modelValue" fit="contain" style="width: 100%;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 10 // MB
  },
  directory: {
    type: String,
    default: 'common'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const previewVisible = ref(false)
const fileName = ref('')

const uploadUrl = computed(() => {
  return `/api/file/upload?directory=${props.directory}`
})

const headers = computed(() => {
  return {
    Authorization: `Bearer ${getToken()}`
  }
})

const isImage = computed(() => {
  if (!props.modelValue) return false
  const ext = props.modelValue.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
})

const beforeUpload = (file) => {
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  fileName.value = file.name
  return true
}

const handleSuccess = (response) => {
  if (response.code === 200) {
    emit('update:modelValue', response.data.url)
    emit('change', response.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败')
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleRemove = () => {
  emit('update:modelValue', '')
  emit('change', null)
}
</script>

<style scoped lang="scss">
.file-upload {
  .preview-area {
    margin-top: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
    
    .preview-image {
      max-width: 200px;
      max-height: 200px;
      cursor: pointer;
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
    }
    
    .preview-actions {
      margin-top: 10px;
    }
  }
}
</style>
