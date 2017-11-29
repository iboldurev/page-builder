<template>
  <section>section2</section>
</template>

<script>
import { types } from '../../../dist/builder'

export default {
  name: 'section2',
  props: { id: Number },
  $schema: {
    classes: types.ClassList
  }
}
</script>
