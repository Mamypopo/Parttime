<!-- components/ToastNotification.vue -->
<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed bottom-20 inset-x-4 z-50">
      <div :class="[
        'max-w-md w-full mx-auto shadow-lg rounded-lg pointer-events-auto overflow-hidden',
        typeClasses[type]
      ]">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i :class="[
                iconClasses[type],
                'text-xl text-white'
              ]"></i>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-white">
                {{ title }}
              </p>
              <p class="mt-1 text-sm text-white/90">
                {{ message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                class="inline-flex text-white hover:text-white/80"
                @click="$emit('close')"
              >
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ToastNotification',
  
  props: {
    show: Boolean,
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning'].includes(value)
    },
    title: String,
    message: String
  },
  
  data() {
    return {
      typeClasses: {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
      },
      iconClasses: {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
      }
    }
  }
}
</script>