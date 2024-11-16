<template>
  <div class="inline-flex items-center justify-center space-x-2">
    <div
      class="loading-spinner"
      :class="[
        size === 'sm' ? 'w-4 h-4 border-2' : '',
        size === 'md' ? 'w-5 h-5 border-2' : '',
        size === 'lg' ? 'w-6 h-6 border-3' : ''
      ]"
    ></div>
    <span
      v-if="text"
      class="text-inherit animate-pulse"
      :class="[
        size === 'sm' ? 'text-xs' : '',
        size === 'md' ? 'text-sm' : '',
        size === 'lg' ? 'text-base' : ''
      ]"
    >
      {{ text }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'sm',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  border-radius: 50%;
  border-color: currentColor;
  border-right-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
