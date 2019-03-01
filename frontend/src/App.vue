<template>
  <div id="app">
    <nav id="nav">
      <router-link to="/home">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
  background: $background_color;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: $text-color;
    text-decoration: none;
    .router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<script lang='ts'>
export default {
  methods: {},
};
</script>