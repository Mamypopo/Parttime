<template>
  <div class="flex items-center gap-2">
    <button
      v-for="locale in availableLocales"
      :key="locale"
      @click="changeLocale(locale)"
      :class="[
        'px-3 py-1 rounded-lg text-sm font-medium transition-all',
        currentLocale === locale
          ? 'bg-gradient-to-r from-[#6B7F5E] to-[#9FE7DD] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
      ]"
    >
      {{ locale === 'th' ? 'ไทย' : 'ENG' }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale: currentLocale, availableLocales } = useI18n()

const changeLocale = (newLocale) => {
  currentLocale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>
