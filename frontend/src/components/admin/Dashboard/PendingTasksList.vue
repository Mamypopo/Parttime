<template>
  <div class="space-y-2">
    <div
      v-for="task in tasks"
      :key="task.id"
      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
    >
      <div>
        <div class="font-medium">{{ task.title }}</div>
        <div class="text-sm text-gray-500">{{ task.description }}</div>
      </div>
      <button
        @click="handleTask(task)"
        class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        ดำเนินการ
      </button>
    </div>
  </div>
</template>
