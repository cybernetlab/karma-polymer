+function() {
  'use strict';

  var cwd = process.cwd(),
      glob = require('glob'),
      path = require('path'),
      concat = Array.prototype.concat

  module.exports = function(files, basePath, polymer, client) {
    if (!polymer) polymer = {}
    if (!client.polymer) client.polymer = {}

    // include adapter
    files.unshift({ pattern: __dirname + '/adapter.js',
                    included: true, served: true, watched: false })

    // include polymer platform.js
    if (polymer.platform) {
      files.push({ pattern: path.normalize(cwd + '/' + polymer.platform),
                   included: false, served: true, watched: false})
      client.polymer.platform = polymer.platform
    }

    // find and include polymer modules
    if (typeof polymer.src === 'string') polymer.src = [polymer.src]
    client.polymer.src = concat.apply([], polymer.src.map(function(file) {
      files.push({ pattern: path.normalize(cwd + "/" + (file.pattern || file)),
                   included: false, served: true, watched: true })
      return glob.sync(file.pattern || file).map(function (filePath) {
        return filePath.replace(/\//g, path.sep)
      })
    }))
  }
}()
