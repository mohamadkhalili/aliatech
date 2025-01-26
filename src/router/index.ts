import { createRouter, createWebHistory } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'
import HomeView from '../views/formList/PageFormList.vue'
import Login from '../views/login/PageLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const cookies = useCookies()
  const token = cookies?.get('access')
  console.log('token');
  console.log(token);
  if (to.name !== 'Login' && !token) {
    console.log('tokentokentoken');

  }

  if (to.name !== 'login' && !token) {
    next({ name: 'login' })
  } else {
    // if you have page access manager can request to that
    next()
  }

})


export default router
