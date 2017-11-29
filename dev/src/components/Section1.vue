<template>
  <section>section1</section>
</template>

<script>
import { types } from '../../../dist/builder'

export default {
  name: 'section1',
  props: { id: Number },
  $schema: {
    classes: types.ClassList
  }
}
</script>
