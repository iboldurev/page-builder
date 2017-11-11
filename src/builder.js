import merge from 'lodash-es/merge'
import Section from './section'
import BuilderComponent from './components/Builder'
import Render from './components/Render'
import styler from './styler'
import mixin from './mixin'
import Sortable from 'sortablejs'
import * as types from './types'
import { cleanDOM } from './util'

let plugins = []
let mixier = {}

const BUILDER_OPTIONS = {
  intro: true,
  sections: [],
  plugins: []
}

let _Vue = null

class Builder {
  constructor (options) {
    this.isEditing = true
    this.isSorting = false
    this.intro = options.intro
    this.sections = options.sections
    this.components = {}

    this.installPlugins()
  }

  create (options) {
    this.sections.push(new Section(options))
  }

  outputFragment () {
    const frag = document.createDocumentFragment()

    frag.appendChild(document.head.cloneNode(true))
    frag.appendChild(this.rootEl.cloneNode(true))

    return frag
  }

  set (data) {
    if (data.sections && Array.isArray(data.sections)) {
      this.sections = data.sections.map(section => {
        if (!section.schema) {
          section.schema = this.components[section.name].options.$schema
        }

        return new Section(section)
      })
    }
  }

  find (id) {
    return this.sections.find(s => s.id === id)
  }

  remove (id) {
    const idx = this.sections.findIndex(s => s.id === id)

    this.sections.splice(idx, 1)
  }

  clear () {
    this.sections = []
  }

  static component (name, definition) {
    Builder.use((ctx) => {
      ctx.builder.component(name, definition)
    })
  }

  static mix (mixinObj) {
    mixier = merge(mixier, mixinObj)
  }

  component (name, definition) {
    if (typeof name === 'object') {
      definition = name
      name = definition.name
    }

    if (!definition.extend) {
      definition = _Vue.extend(definition)
    }

    this.components[name] = definition.extend({
      directives: { styler: this.styler },
      mixins: [this.mixin],
      components: mixier.components
    })
  }

  installPlugins () {
    plugins.forEach((ctx) => {
      ctx.plugin({ builder: this, Vue: _Vue }, ctx.options)
    })

    plugins = []
  }

  static install (Vue, options = {}) {
    if (_Vue) {
      return
    }

    _Vue = Vue

    const builder = new Builder(Object.assign({}, BUILDER_OPTIONS, options))

    Vue.util.defineReactive(builder, 'sections', builder.sections)
    Vue.util.defineReactive(builder, 'isEditing', builder.isEditing)
    Vue.util.defineReactive(builder, 'isSorting', builder.isSorting)

    const extension = {
      components: builder.components,
      beforeCreate () {
        this.$builder = builder
      }
    }

    Vue.component('builder', Vue.extend(BuilderComponent).extend(extension))
    Vue.component('builder-render', Vue.extend(Render).extend(extension))
  }

  static use (plugin, options = {}) {
    if (typeof plugin !== 'function') {
      return console.warn('Plugins must be a function')
    }

    plugins.push({ plugin, options })
  }

  toggleSort () {
    if (!this.isSorting && this.sortable) {
      this.sortable.destroy()
      return
    }
    this.sortable = Sortable.create(this.rootEl, {
      animation: 150,
      scroll: true,
      scrollSpeed: 10
    })
  }

  toJSON () {
    return {
      sections: this.sections.map(s => ({
        name: s.name,
        data: s.data
      }))
    }
  }

  preview () {
    const frag = this.outputFragment()
    const artboard = frag.querySelector('#artboard')
    const head = frag.querySelector('head')
    const printPreview = window.open('about:blank', 'print_preview')
    const printDocument = printPreview.document

    cleanDOM(frag)
    printDocument.open()
    printDocument.write(
      `<!DOCTYPE html>
        <html>
          <head>
             ${head.innerHTML}
          </head>
          <body>
            ${artboard.innerHTML}
          <body>
        </html>`
    )
  }

  export (method = 'json') {
    if (method === 'preview') {
      return this.preview()
    }

    return this.toJSON()
  }
}

Builder.use(styler)
Builder.use(mixin)

if (typeof Vue !== 'undefined') {
  // eslint-disable-next-line
  Vue.use(Builder);
}

Builder.version = '__VERSION__'
Builder.types = types

export default Builder
