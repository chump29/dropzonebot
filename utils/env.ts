import { type Optional } from "@postfmly/types"

import { bool, cleanEnv, type ExactValidator, makeExactValidator, str, url } from "envalid"
import { anyOf, caseInsensitive, charIn, createRegExp, exactly, wordChar } from "magic-regexp"
import {
  digits,
  emoji,
  integer,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nonEmpty,
  parse,
  pipe,
  regex,
  string,
  toNumber,
  trim,
  union
} from "valibot"

const COLOR_LEN: number = 6

const MIN_ID_LEN: number = 17
const MAX_ID_LEN: number = 19

const MIN_PORT: number = 1024
const MAX_PORT: number = 65_535

const UID_MIN_LEN: number = 23
const UID_MAX_LEN: number = 28
const TS_MIN_LEN: number = 6
const TS_MAX_LEN: number = 7
const HMAC_MIN_LEN: number = 27
const HMAC_MAX_LEN: number = 38

const StringSchema = pipe(string(), trim(), nonEmpty())
const IdSchema = pipe(StringSchema, digits(), minLength(MIN_ID_LEN), maxLength(MAX_ID_LEN))
const ColorSchema = pipe(
  StringSchema,
  regex(
    // ! Desired: /^(?:#[\da-f]{6})$/i
    createRegExp(exactly("#").and(charIn("0123456789abcdef").times(COLOR_LEN)).at.lineStart().at.lineEnd(), [
      caseInsensitive
    ])
  )
)
const EmojiSchema = pipe(StringSchema, emoji())
const MinMaxTimeSchema = pipe(
  StringSchema,
  regex(
    // ! Desired: /^(?:(?:[1-9]|[1-5]\d)m|[1-6]h)$/i
    createRegExp(
      anyOf(
        anyOf(charIn("123456789"), charIn("12345").and(charIn("0123456789"))).and(exactly("m")),
        charIn("123456").and(exactly("h"))
      )
        .at.lineStart()
        .at.lineEnd(),
      [caseInsensitive]
    )
  )
)
const PortSchema = union([
  literal("random"),
  pipe(StringSchema, toNumber(), integer(), minValue(MIN_PORT), maxValue(MAX_PORT))
])
const TimeoutSchema = pipe(StringSchema, toNumber(), integer(), minValue(1))
const TokenSchema = pipe(
  StringSchema,
  regex(
    createRegExp(
      anyOf(wordChar, "-")
        .times.between(UID_MIN_LEN, UID_MAX_LEN)
        .and(exactly("."))
        .and(anyOf(wordChar, "-").times.between(TS_MIN_LEN, TS_MAX_LEN))
        .and(exactly("."))
        .and(anyOf(wordChar, "-").times.between(HMAC_MIN_LEN, HMAC_MAX_LEN))
        .at.lineStart()
        .at.lineEnd(),
      [caseInsensitive]
    )
  )
)

const idValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(IdSchema, s))
const colorValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(ColorSchema, s))
const emojiValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(EmojiSchema, s))
const minMaxTimeValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string =>
  parse(MinMaxTimeSchema, s)
)
const portValidator: ExactValidator<"random" | number> = makeExactValidator<"random" | number>(
  (s: string): "random" | number => parse(PortSchema, s)
)
const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(TimeoutSchema, s)
)
const tokenValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TokenSchema, s))

let fakeId: Optional<string>
let fakeURL: Optional<string>
let fakeToken: Optional<string>

if (Bun.env.NODE_ENV === "test") {
  const { fakerEN_US: fake } = await import("@faker-js/faker")

  let chars: string = "[0-9]"
  fakeId = fake.helpers.fromRegExp(`${chars}{${MIN_ID_LEN},${MAX_ID_LEN}}`)

  fakeURL = fake.image.url({ height: 64, width: 64 })

  chars = "[a-zA-Z0-9]"
  fakeToken = fake.helpers.fromRegExp(
    `${chars}{${UID_MIN_LEN},${UID_MAX_LEN}}[.]${chars}{${TS_MIN_LEN},${TS_MAX_LEN}}[.]${chars}{${HMAC_MIN_LEN},${HMAC_MAX_LEN}}`
  )
}

const env = cleanEnv(Bun.env, {
  ACTIVITY: str({ default: "Dropping" }),
  CHANNEL_ID: idValidator({ testDefault: fakeId }),
  COLOR: colorValidator({ default: "#78866b" }),
  DB_NAME: str({ default: "dropzonebot.db", testDefault: "dropzonebot.test.db" }),
  DB_PATH: str({ default: "./db" }),
  DEBUG: bool({ default: false, testDefault: true }),
  EMOJI: emojiValidator({ default: "💰" }),
  LOGO_NAME: str({ default: "dropzonebot.webp" }),
  LOGO_PATH: str({ default: "./utils/images" }),
  LOGO_PORT: portValidator({ default: "random" }),
  LOGO_URL: url({ testDefault: fakeURL }),
  MAX_TIME: minMaxTimeValidator({ default: "3h" }),
  MIN_TIME: minMaxTimeValidator({ default: "1h" }),
  NAME: str({ default: "DropZoneBot" }),
  TIMEOUT: timeoutValidator({ default: 1 }),
  TOKEN: tokenValidator({ testDefault: fakeToken })
})

if (import.meta.main) {
  const { printVars } = await import("@postfmly/logger")

  printVars(env, ["CHANNEL_ID", "TOKEN"])
}

export { env }
