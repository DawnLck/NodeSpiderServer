import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Vue.use(Loading.directive);

/* 或写为
 * Vue.use(Button)
 * Vue.use(Select)
 */

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
