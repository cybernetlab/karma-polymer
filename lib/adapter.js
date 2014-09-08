(function(karma) {
  'use strict';

  var head = document.getElementsByTagName('head')[0],
      arrProto = Array.prototype

  var notEmpty = function(x) { return x != null }

  // load polymer platform
  if (karma.config.polymer.platform) {
    var script = document.createElement('script')
    script.src = 'base/' + karma.config.polymer.platform
    head.appendChild(script)
  }

  // add polymer import links
  var src = karma.config.polymer.src
  if (src) {
    var l = src.length
    for (var i = 0; i < l; i++) {
      var link = document.createElement('link')
      link.rel = 'import'
      link.href = 'base/' + src[i]
      head.appendChild(link)
    }
  }

  /**
   * @brief Polymer helper class for testing
   */
  var PolymerLoader = function() {
    // prepare container
    this.container = document.createElement('div')
    document.body.appendChild(this.container)

    // promise polymer loading
    this.polymerReady = new Promise(function(done, reject) {
      if (PolymerLoader.prototype.polymerReady) {
        done()
      } else {
        var listener = function() {
          PolymerLoader.prototype.polymerReady = true
          window.removeEventListener('polymer-ready', listener)
          // resolve promise in next microstep
          setTimeout(done, 0)
        }
        window.addEventListener('polymer-ready', listener)
      }
    })
  }

  /**
   * @brief Creates polymer elements
   * @details This function takes a list of elements to create and callback
   *          function as a last argument. You can pass just a tag name of
   *          element or entire html code with nested elements. Callback will
   *          be called for each top-level created element when polymer will
   *          be ready.
   *
   * @example Callback is usefull for jasmine async resolve:
   *
   *   beforeEach(function(done) {
   *     polymer.create('my-test-element', done)
   *   })
   *
   *   it('should be true', function(done) {
   *     polymer.create('<x-el><span>test</span></x-el>', function(el) {
   *       expect(el.querySelector('span').text).toEqual('test')
   *       done()
   *     })
   *   })
   */
  PolymerLoader.prototype.create = function() {
    var args = arrProto.slice.call(arguments)
    var cb = typeof args[args.length - 1] === 'function' ? args.pop() : null

    // parse arguments and construct list of elements
    var list = arrProto.concat.apply([], args.map(function(arg) {
      if (!arg) return null
      if (typeof arg === 'string') {
        arg = arg.trim()
        if (arg[0] == '<') {
          var wrapper = document.createElement('div')
          wrapper.innerHTML = arg
          return arrProto.slice.call(wrapper.children)
        }
        return document.createElement(arg)
      }
      if (typeof arg === 'object' && arg.constructor == Object && arg.tag) {
        var el = document.createElement(arg.tag)
        delete arg.tag
        for (var attr in arg) el.setAttribute(attr, arg[attr])
        return el
      }
      return null
    }).filter(notEmpty)) // remove null elements

    // append elements to container
    list.forEach(function(el) { this.container.appendChild(el) }, this)

    // call callback when polymer will be ready
    if (cb) this.polymerReady.then(function() { cb.apply(null, list) })
  }

  /**
   * @brief Removes all created elements
   *
   * @example Usefull for teardown:
   *
   *   afterEach(function(done) {
   *     polymer.clear()
   *   })
   */
  PolymerLoader.prototype.clear = function() {
    if (!this.container) return
    var list = arrProto.slice.call(this.container.children)
    list.forEach(function(el) { if(el) el.remove() })
  }

  /**
   * @brief Creates elements, runs callback and removes all elements after it
   * @details This function is very si,ilar to create except it removes all
   *          created elements after callback is finished
   *
   *   it('should be true', function(done) {
   *     polymer.with('<x-el><span>test</span></x-el>', function(el) {
   *       expect(el.querySelector('span').text).toEqual('test')
   *       done()
   *     })
   *   })
   */
  PolymerLoader.prototype.with = function(el, callback) {
    var args = arrProto.slice.call(arguments)
    var cb = typeof args[args.length - 1] === 'function' ? args.pop() : null
    args.push(function() {
      if (cb) cb.apply(null, arguments)
      var list = arrProto.slice.call(arguments)
      list.forEach(function(el) { if(el) el.remove() })
    })
    this.create.apply(this, args)
  }

  /**
   * @brief Returns first created existed element
   *
   * @example Usefull with beforeEach blocks:
   *
   *   beforeEach(function(done) {
   *     polymer.create('my-test-element', done)
   *   })
   *
   *   it('should be true', function() {
   *     expect(polymer.first.tagName).toEqual('MY-TEST-ELEMENT')
   *   })
   */
  Object.defineProperty(PolymerLoader.prototype, 'first', {
    get: function() {
      return this.elements[0]
    }
  })

  /**
   * @brief Returns last created existed element
   */
  Object.defineProperty(PolymerLoader.prototype, 'last', {
    get: function() {
      var list = this.elements
      return list[list.length - 1]
    }
  })

  /**
   * @brief Returns all elements, creaed by create function
   */
  Object.defineProperty(PolymerLoader.prototype, 'elements', {
    get: function() {
      return arrProto.filter.call(this.container.children, notEmpty)
    }
  })

  window.polymer = new PolymerLoader()
})(window.__karma__)
