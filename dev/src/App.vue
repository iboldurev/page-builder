<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <builder :data="data" @saved="saved" />
  </div>
</template>

<script>
import Vue from 'vue'
import Builder from '../../dist/builder'
import '../../dist/builder.css'
import Section1 from './components/Section1'
import Section2 from './components/Section2'
import Section3 from './components/Section3'

Builder.component(Section1)
Builder.component(Section2)
Builder.component(Section3)

Vue.use(Builder)

export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      data: {
        sections: [
          {name: 'section1', data: {}},
          {name: 'section2', data: {}},
          {name: 'section1', data: {}}
        ]
      }
    }
  },
  methods: {
    saved (builder) {
      console.log(builder.export('json'))
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
