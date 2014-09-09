# Karma adapter for Polymer framewrok

This adapter helps to test [Polymer](http://www.polymer-project.org/) projects with [Karma](http://karma-runner.github.io/0.12/index.html).

# Installation

Add npm module to your dependencies:

```
{
  "devDependencies": {
    "karma": "~0.12.0",
    "karma-polymer": "~0.1.0"
  }
}
```

or install it from command line:

```sh
npm install karma-polymer --save-dev
```

# Configuration

> Note to add `polymer` **before** test framework (jasmine for example).

Add `polymer` to frameworks array and specify your `platform.js`, `polymer.html` and project modules:

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['polymer', 'jasmine'],

    files: [
      // necessary for nested imports
      { pattern: 'bower_components/**', included: false, served: true, watched: true },
      'test/**/*Spec.js'
    ],

    polymer: {
      platform: 'bower_components/platform/platform.js',
      src: [
        'bower_components/polymer/polymer.html',
        'src/*.html'
      ]
    },
  });
};
```

Polymer adapter will add your modules to files array as `served`, but it can't detect any other imports inside this modules, so you should specify their manually (see `nested imports` above).

# Usage

The polymer adapter creates necessary `script` element for load `platform.js` and a set of specified `import` elements (don't forget to specify `polymer.html` itself).

Polymer adapter provides usefull object `polymer` in global space:

### polymer.create(el1, el2, ..., callback)

Creates polymer elements

This function takes a list of elements to create and callback function as a last argument. You can pass just a tag name of element or entire html code with nested elements. Callback will be called with all top-level created elements as arguments when polymer will be ready.

Callback is usefull for jasmine async resolve:

```js
beforeEach(function(done) {
  polymer.create('my-test-element', done)
})

it('should be true', function(done) {
  polymer.create('<x-el><span>test</span></x-el>', function(el) {
    expect(el.querySelector('span').text).toEqual('test')
    done()
  })
})
```

### polymer.with(el1, el2, ..., callback)

Creates elements, runs callback and removes all elements after it

This function is very si,ilar to create except it removes all created elements after callback is finished:

```js
it('should be true', function(done) {
  polymer.with('<x-el><span>test</span></x-el>', function(el) {
    expect(el.querySelector('span').text).toEqual('test')
    done()
  })
})
```

### polymer.clear()

Removes all created elements. Usefull for teardown:

```js
afterEach(function(done) {
  polymer.clear()
})
```

### polymer.first, polymer.last, polymer.elements
 
Returns first, last or all created and existed elements respectively. Usefull with beforeEach blocks:

```js
beforeEach(function(done) {
  polymer.create('my-first-element', 'my-second-element', done)
})

it('should be true', function() {
  expect(polymer.first.tagName).toEqual('MY-FIRST-ELEMENT')
  expect(polymer.last.tagName).toEqual('MY-SECOND-ELEMENT')
  expect(polymer.elements.length).toEqual(2)
  expect(polymer.elements[0].tagName).toEqual('MY-FIRST-ELEMENT')
})
```
