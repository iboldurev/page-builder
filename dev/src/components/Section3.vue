<template>
  <section>section3</section>
</template>

<script>
import { types } from '../../../dist/builder'

export default {
  name: 'section3',
  props: { id: Number },
  $schema: {
    classes: types.ClassList
  }
}
</script>
