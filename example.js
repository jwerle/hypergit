'use strict'

const discovery = require('hyperdiscovery')
const hypergit = require('./')
const pify = require('pify')
const ram = require('random-access-memory')

const git = hypergit(ram, process.argv[2])

process.on('unhandledRejection', (err) => {
  console.error(err.stack || err)
})

git.ready(async () => {
  console.log(git.key.toString('hex'))
  const swarm = discovery(git)

  await pify(git.init)()
  console.log('git init')

  //await pify(git.checkout)({ref: 'master'})
  //console.log('check out');

  await pify(git.writeFile.bind(git))('hello.txt', Buffer.from('world!'))
  await pify(git.config)({
    path: 'user.name',
    value: 'test'
  })

  await pify(git.config)({
    path: 'user.email',
    value: 'test@email.com'
  })
  await pify(git.add)({filepath: 'hello.txt'})
  await pify(git.commit)({message: 'commit'})
  console.log(await pify(git.files)({}))
  //console.log('dir', await pify(git.readdir.bind(git))('/.git/refs/heads'));
  console.log(await pify(git.status)({filepath: 'hello.txt'}))
})
