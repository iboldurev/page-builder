<template lang="pug">
  .styler(ref="styler" v-if="$builder.isEditing")
    ul.styler-list
      li(v-if="type === 'button' || type === 'section'")
        button.styler-button(@click="updateOption('colorer')")
          i.material-icons palette
      li(v-if="type === 'button'")
        button.styler-button(@click="updateOption('link')")
          i.material-icons link
      li(v-if="type === 'header' || type === 'section'")
        button.styler-button(@click="removeSection")
          i.material-icons delete
      template(v-if="type === 'text'")
        li
          button.styler-button(@click="updateOption('textColor')")
            i.material-icons palette
        li
          button.styler-button(@click="updateOption('align')")
            i.material-icons format_align_justify
        li
          button.styler-button(@click="updateOption('textStyle')")
            i.material-icons text_format

    ul.styler-list
      li(v-if="currentOption === 'colorer'")
        ul.colorer
          li(v-for="color in colors")
            input(
              type="radio"
              :id="`color${color.charAt(0).toUpperCase() + color.slice(1)}`"
              name="colorer"
              :value="color"
              v-model="colorerColor")
      li(v-if="currentOption === 'textColor'")
          ul.colorer
            li(v-for="(color, index) in colors")
              input(
                type="radio"
                :id="`color${color.charAt(0).toUpperCase() + color.slice(1)}`"
                name="colorer"
                :value="textColors[index]"
                v-model="textColor"
                @click="execute('forecolor', textColor)")
      li(v-if="currentOption === 'link'")
        .input.is-rounded.is-button
          input(type="text" placeholder="type your link" v-model="url")
          button.button.is-green(@click="addLink")
            i.material-icons link

      li(v-if="currentOption === 'align'")
        ul.align
          li: button.styler-button(@click="execute('justifyleft')")
            i.material-icons format_align_left
          li: button.styler-button(@click="execute('justifycenter')")
            i.material-icons format_align_center
          li: button.styler-button(@click="execute('justifyright')")
            i.material-icons format_align_right

      li(v-if="currentOption === 'textStyle'")
        ul.align
          li: button.styler-button(@click="execute('bold')")
            i.material-icons format_bold
          li: button.styler-button(@click="execute('italic')")
            i.material-icons format_italic
          li: button.styler-button(@click="execute('underline')")
            i.material-icons format_underlined
</template>

<script>
import Popper from 'popper.js'
import { isParentTo } from '../util'

export default {
  name: 'styler',

  props: ['el', 'type', 'name', 'section'],

  data: () => ({
    colors: ['blue', 'green', 'red', 'black', 'white'],
    textColors: ['#4da1ff', '#38E4B7', '#EA4F52', '#000000', '#FFFFFF'],
    textColor: '',
    oldColorerColor: '',
    colorerColor: '',
    mouseTarget: '',
    currentOption: '',
    url: ''
  }),

  watch: {
    colorerColor () {
      this.changeColor()
    }
  },

  methods: {
    updateOption (option) {
      this.currentOption = option
      this.popper.update()
    },

    addLink () {
      this.section.set(`${this.name}.href`, this.url)
    },

    changeColor () {
      this.removeClass(`is-${this.oldColorerColor}`)
      this.oldColorerColor = this.colorerColor
      this.addClass(`is-${this.colorerColor}`)
    },

    addClass (className) {
      this.section.set(this.name, value => {
        if (value && value.classes && Array.isArray(value.classes)) {
          value = value.classes
        }

        value.push(className)
      })
    },

    removeClass (className) {
      if (Array.isArray(className)) {
        return className.forEach(c => {
          this.removeClass(c)
        })
      }

      this.section.set(this.name, value => {
        if (value && value.classes && Array.isArray(value.classes)) {
          value = value.classes
        }

        const idx = value.indexOf(className)

        value.splice(idx, 1)
      })
    },

    removeSection () {
      document.removeEventListener('click', this.hideStyler)

      this.popper.destroy()
      this.styler.remove()
      this.$builder.remove(this.id)
    },

    execute (command, value = null) {
      document.execCommand(command, false, value)
    },

    showStyler () {
      this.styler.classList.add('is-visible')
      this.currentOption = ''

      this.popper.update()
    },

    hideStyler (evnt) {
      const mouseTarget = evnt.target

      if (!isParentTo(mouseTarget, this.styler) && !isParentTo(mouseTarget, this.el)) {
        this.styler.classList.remove('is-visible')
        document.removeEventListener('click', this.hideStyler)

        if (this.type === 'section') { return }

        if (this.type === 'button') {
          this.section.set(`${this.name}.text`, this.el.innerHTML)

          return
        }

        this.section.set(this.name, this.el.innerHTML)
      }
    }
  },

  created () {
    if (this.type === 'button') {
      this.url = this.section.get(`${this.name}.href`)
    }
  },

  mounted () {
    if (!this.$builder.isEditing) { return }

    this.styler = this.$refs.styler
    this.id = Number(this.section.id)

    const position = this.$props.type === 'section' ? 'left-start' : 'top'

    this.popper = new Popper(this.el, this.styler, {
      placement: position
    })

    this.el.addEventListener('click', () => {
      this.showStyler()

      document.addEventListener('click', this.hideStyler, false)
    }, false)
  },

  updated () {
    if (!this.$builder.isEditing) { return }

    this.styler = this.$refs.styler

    const position = this.$props.type === 'section' ? 'left-start' : 'top'

    this.popper = new Popper(this.el, this.styler, {
      placement: position
    })
  }
}
</script>

<style lang="sass">
  .styler
    position: relative
    z-index: 100
    visibility: hidden
    opacity: 0
    margin: 10px 0
    padding: 5px
    background: #323c47
    border-radius: 26px
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center

    .material-icons
      color: #fff

    &-list
      display: flex
      justify-content: center
      align-items: center
      list-style: none
      margin: 0
      padding: 0

    &-button
      display: flex
      justify-content: center
      align-items: center
      outline: 0
      background: #323c47
      border: 0
      fill: #fff
      width: 42px
      height: 42px
      border-radius: 42px
      margin: 0 5px 0 0

      &:hover
        background: #323c47

      &:first-child
        margin-left: 5px

    &-selector
      margin: 0 5px

    &.is-visible
      visibility: visible
      opacity: 1

    .input
      margin: 0

  .align
    @extend .styler-list
    height: 42px

  .colorer
    @extend .styler-list
    height: 42px

    li >input
      -webkit-appearance: none
      width: 30px
      height: 30px
      border-radius: 40px
      border: 4px solid #323c47
      margin: 0 5px
      outline: none

      &:checked
        border-color: #323c47

      &:hover
        border-color: #323c47

      &#colorRed
        background #EA4F52

      &#colorBlue
        background #4da1ff

      &#colorGreen
        background #38E4B7

      &#colorBlack
        background #000000

      &#colorWhite
        background #FFFFFF

  .is-hidden
    display: none
</style>
