'use strict'
const getParent = require('brisky-core/lib/render/dom/parent')
const props = require('brisky-core/lib/render/static').property
const Property = require('brisky-core/lib/property').Constructor

exports.properties = {
  props: new Property({
    render: {
      static: props,
      state (target, state, type, stamp, subs, tree, id, pid) {
        const pnode = getParent(type, stamp, subs, tree, pid)
        if (pnode && !pnode._propsStaticParsed) {
          props(target, pnode)
          pnode._propsStaticParsed = true
        }
      }
    },
    child: {
      properties: { name: true },
      render: {
        static (target, pnode) {
          const val = target.compute()
          const key = target.name || target.key
          if (val === target) {
            pnode.removeAttribute(key) // cover is this even nessecary here?
          } else {
            if (key === 'xlink:href') {
              pnode.setAttributeNS('http://www.w3.org/1999/xlink', key, val)
            } else {
              pnode.setAttribute(key, val)
            }
          }
        },
        state (target, state, type, stamp, subs, tree, id, pid) {
          const pnode = getParent(type, stamp, subs, tree, pid)
          const key = target.name || target.key || state.key
          if (type === 'remove') {
            if (pnode) {
              pnode.removeAttribute(key)
            }
          } else {
            let val = target.compute(state)
            if (typeof val === 'boolean') { val = val + '' }
            if (val === state || val === target) {
              if (pnode.getAttribute(key)) {
                pnode.removeAttribute(key) // missing
              }
            } else {
              if (pnode.getAttribute(key) != val) { // eslint-disable-line
                if (key === 'xlink:href') {
                  pnode.setAttributeNS('http://www.w3.org/1999/xlink', key, val)
                } else {
                  pnode.setAttribute(key, val)
                }
              }
            }
          }
        }
      }
    },
    properties: {
      type: null,
      value: {
        render: {
          static (target, pnode) {
            const val = target.compute() // missing
            pnode.value = val // missing
          },
          state (target, state, type, stamp, subs, tree, id, pid) {
            const pnode = getParent(type, stamp, subs, tree, pid)
            if (type === 'remove') {
              if (pnode) { pnode.value = '' } // missing
            } else {
              const val = target.compute(state)
              // is value handeled correctly by html-element ?
              if (val !== pnode.value) {
                pnode.value = val === target ? '' : val
              }
            }
          }
        }
      }
    }
  })
}
