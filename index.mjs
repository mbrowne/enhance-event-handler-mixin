import { bindEvents } from "./utils.mjs"

const EventHandlerMixin = (superclass) => class extends superclass {
  constructor() {
    super()
    this.eventsToRemove = []
  }

  /**
   * Bind event handlers to this component
   * @param {object} events 
   */
  bindEvents(events) {
    bindEvents(this, events)
  }

  connectedCallback() {
    const htmlElementPrototype = Object.getOwnPropertyNames(HTMLElement.prototype)
    const attrs = this?.state?.attrs
    Object.keys(attrs)
      .map(event => {
        if (htmlElementPrototype.indexOf(`on${event}`) !== -1) {
          const target = attrs[event]
            ? this.querySelector(attrs[event]) ||
              this.shadowRoot.querySelector(attrs[event]) ||
              this
            : this

          if (target && this[event]) {
            target.addEventListener(event, this[event].bind(this))
            this.eventsToRemove.push({ target, event: this[event] })
          }
          else {
            throw Error(`Unable to add event listener. Double check ${event}="${attrs[event]}".`)
          }
        }
      })

    if(super.connectedCallback) {
      super.connectedCallback()
    }
  }

  disconnectedCallback() {
    this.eventsToRemove.forEach(l => removeEventListener(l.event, l.target))
    if (super.disconnectedCallback) {
      super.disconnectedCallback()
    }
  }
}

export default EventHandlerMixin
export { bindEvents }
