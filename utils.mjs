/**
 * Bind event handlers to a target element
 * @param {HTMLElement} elem
 * @param {object} events
 * @param {AddEventListenerOptions} [delegationListenerOptions] for the parent element
 *     .addEventListener() call when using event delegation
 */
export function bindEvents(elem, events, delegationListenerOptions = undefined) {
    for (const [eventType, handlers] of Object.entries(events)) {
        const delegatedListeners = {}
        for (let [selector, handler] of Object.entries(handlers)) {
            let delegate, options
            if (typeof handler == 'object') {
                handler = handler.handler
                delegate = handler.delegate
            } else {
                delegate = true
            }

            const listener = makeEventListener(elem, handler)
            if (!listener) {
                if (window.ENV?.NODE_ENV === 'development') {
                    throw Error('bindEvents(): Invalid handler type')
                }
                return
            }

            if (delegate) {
                delegatedListeners[selector] = listener
            } else if (selector != '') {
                elem.querySelector(selector).addEventListener(
                    eventType,
                    listener,
                    options,
                )
            }
        }

        if (Object.keys(delegatedListeners).length) {
            elem.addEventListener(
                eventType,
                (e) => {
                    for (const [selector, listener] of Object.entries(
                        delegatedListeners,
                    )) {
                        if (selector && e.target.matches(selector)) {
                            listener(e)
                        }
                    }
                },
                delegationListenerOptions,
            )
        }
    }
}

function makeEventListener(elem, handler) {
    if (typeof handler == 'string') {
        if (elem[handler]) {
            return (e) => elem[handler].call(elem, e)
        } else if (window.ENV?.NODE_ENV === 'development') {
            throw Error(`bindEvents(): handler "${handler}" not found`)
        }
    } else if (typeof handler == 'function') {
        return handler
    }
}
