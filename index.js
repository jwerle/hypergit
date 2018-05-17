'use strict'

const { dirname } = require('path')
const hyperdrive = require('hyperdrive')
const mkdirp = require('mkdirp')
const git = require('isomorphic-git')

const noop = () => void 0

module.exports = hypergit

function hypergit(storage, key, opts) {
  const drive = hyperdrive(storage, key, opts)
  const writeFile = drive.writeFile.bind(drive)
  const readFile = drive.readFile.bind(drive)
  const mkdir = drive.mkdir.bind(drive)
  const lstat = drive.lstat.bind(drive)
  const stat = drive.stat.bind(drive)
  return Object.assign(drive, {

    // isomorphic-git's FileSystem exists() method depends on 'ENOENT'
    lstat(path, cb) {
      if ('function' != typeof cb) { cb = noop }
      lstat(path, (err, result) => {
        if (err) {
          cb(Object.assign(new Error(err.message), {code: 'ENOENT'}))
        } else {
          cb(null, result)
        }
      })
    },

    mkdir(path, cb) {
      if ('function' != typeof cb) { cb = noop }
      lstat(path, (err, stat) => {
        if (err && true != err.notFound) { return cb(err) }
        else if (stat && stat.isDirectory()) {
          return cb(Object.assign(new Error(err.message), {code: 'EEXIST'}))
        } else {
          return mkdirp(path, {fs: {stat, mkdir}}, cb)
        }
      })
    },

    writeFile(path, buffer, opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      mkdirp(dirname(path), {fs: {stat, mkdir}}, (err) => {
        if (err) { return cb(err) }
        else { writeFile(path, buffer, opts, cb) }
      })
    },

    readFile(path, opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return readFile(path, opts, cb)
    },



    init(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.init(configure(opts)), cb)
    },

    clone(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.clone(configure(opts)), cb)
    },

    branches(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return drive.listBranches(opts, cb)
    },

    tags(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return drive.listTags(opts, cb)
    },

    files(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return drive.listFiles(opts, cb)
    },

    listBranches(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.listBranches(configure(opts)), cb)
    },

    listTags(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.listTags(configure(opts)), cb)
    },

    listFiles(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.listFiles(configure(opts)), cb)
    },

    add(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.add(configure(opts)), cb)
    },

    remove(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.remove(configure(opts)), cb)
    },

    status(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.status(configure(opts)), cb)
    },

    commit(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.commit(configure(opts)), cb)
    },

    log(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.log(configure(opts)), cb)
    },

    config(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.config(configure(opts)), cb)
    },

    fetch(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.fetch(configure(opts)), cb)
    },

    checkout(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.checkout(configure(opts)), cb)
    },

    push(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.push(configure(opts)), cb)
    },

    pull(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.pull(configure(opts)), cb)
    },

    merge(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.merge(configure(opts)), cb)
    },

    sign(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.sign(configure(opts)), cb)
    },

    verify(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.verify(configure(opts)), cb)
    },

    resolveRef(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.resolveRef(configure(opts)), cb)
    },

    readObject(opts, cb) {
      var [ opts, cb ] = parameters(opts, cb)
      return callback(git.readObject(configure(opts)), cb)
    },
  })

  function parameters(opts, cb) {
    if ('function' == typeof opts) {
      cb = opts
      opts = {}
    }

    if (!opts || 'object' != typeof opts) {
      opts = {}
    }

    if ('function' != typeof cb) {
      cb = noop
    }

    return [opts, cb]
  }

  function callback(promise, cb) {
    if ('function' != typeof cb) { cb = noop }
    return promise
      .then((result) => cb(null, result))
      .catch((err) => cb(err))
  }

  function configure(opts) {
    const defaults = {fs: drive, dir: '/', gitdir: '/.git', filepath: '.'}
    opts = Object.assign({}, defaults, opts)
    return opts
  }
}

