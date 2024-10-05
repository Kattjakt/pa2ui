/* eslint-disable @typescript-eslint/explicit-function-return-type */
import P from 'parsimmon'

type Type =
  | 'ls'
  | 'sub'
  | 'subr'
  | 'unsubr'
  | 'set'
  | 'setr'
  | 'asyncget'
  | 'get'
  | 'error'
  | 'unknown'

export interface Message {
  type: Type
  path: string[]
  value?: string
  children?: { key: string; value: string }[]
}

const DSPLanguage = P.createLanguage({
  quotedString: (r) => P.string('"').then(P.regex(/[^"]+/)).skip(P.string('"')),
  whitespace: () => P.optWhitespace,
  newline: () => P.string('\n'),

  quotedPath: (r) =>
    P.string('"')
      .then(P.regex(/[^"]+/))
      .skip(P.string('"'))
      .map((str) => str.split('\\').filter(Boolean)),

  get: (r) =>
    P.string('get')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath, r.whitespace, r.quotedString))
      .map(([path, _, value]) => ({ type: 'get', path, value })),

  set: (r) =>
    P.string('set')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath, r.whitespace, r.quotedString))
      .map(([path, _, value]) => ({ type: 'set', path, value })),

  setr: (r) =>
    P.string('setr')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath, r.whitespace, r.quotedString))
      .map(([path, _, value]) => ({ type: 'setr', path, value })),

  sub: (r) =>
    P.string('sub')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath))
      .map(([path]) => ({ type: 'sub', path })),

  unsub: (r) =>
    P.string('unsub')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath))
      .map(([path]) => ({ type: 'unsub', path })),

  unsubr: (r) =>
    P.string('unsubr')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath))
      .map(([path]) => ({ type: 'unsubr', path })),

  subr: (r) =>
    P.string('subr')
      .then(r.whitespace)
      .then(P.seq(r.quotedPath, r.whitespace, r.quotedString))
      .map(([path, _, value]) => ({ type: 'subr', path, value })),

  lsEntry: (r) =>
    P.seq(P.regex(/\s*/), P.regex(/[^:\n]+/), P.string(':'), P.regex(/[^\n]*/), r.newline).map(
      ([_, key, __, value]) => ({ key: key.trim(), value: value.trim() })
    ),

  ls: (r) =>
    P.string('ls')
      .then(r.whitespace)
      .then(r.quotedPath)
      .chain((path) =>
        P.seq(r.newline, r.lsEntry.many()).map(([_, entries]) => ({
          type: 'ls',
          path,
          children: entries.filter((entry) => entry.key !== '..' && entry.key !== '*')
        }))
      )
      .skip(P.string('endls')),

  error: (r) =>
    P.string('error')
      .then(r.whitespace)
      .then(r.quotedString)
      .map((value) => ({ type: 'error', value })),

  unknown: (r) => P.regex(/.+/).map((str) => ({ type: 'unknown', value: str })),

  command: (r) => P.alt(r.get, r.set, r.setr, r.sub, r.unsub, r.unsubr, r.subr, r.ls, r.error),

  commands: (r) => r.command.sepBy(r.newline)
})

export const createMessageParser = (callback: (message: Message) => void) => {
  let buffer: string[] = []

  // wtf lol
  return {
    push: (data: string) => {
      const isPartialMessage = data.endsWith('\n') === false

      buffer.push(data)

      if (isPartialMessage) {
        // console.log('Not parsable yet', { data, buffer })
        return
      }

      let message = buffer.join('')

      // Remove trailing newline
      message = message.slice(0, -1)

      if (buffer.length > 100) {
        console.group('Parser')
        console.error('Buffer is growing too large, probably contains unhandled packets lol')
        console.log(message)
        console.groupEnd()
        buffer = []
        return
      }

      try {
        const parsedMessages = DSPLanguage.commands.tryParse(message) as Message[]

        if (parsedMessages) {
          for (const message of parsedMessages) {
            callback(message)
          }

          buffer = []
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
