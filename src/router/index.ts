import { createRouter, createWebHistory } from 'vue-router'
import WeatherDashboard from '../views/WeatherDashboard.vue'
import CurrentWeatherPage from '../views/CurrentWeatherPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WeatherDashboard,
    },
    {
      path: '/current',
      name: 'current',
      component: CurrentWeatherPage,
    },
  ],
})

export default router
