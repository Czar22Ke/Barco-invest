import { ref, onMounted, watch } from 'vue';

const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
const isDark = ref(savedTheme !== 'light');

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  watch(isDark, (val) => {
    if (val) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });

  onMounted(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      isDark.value = false;
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  });

  return { isDark, toggleTheme };
}
