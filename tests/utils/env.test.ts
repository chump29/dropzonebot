import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"

import { env } from "../../utils/env.ts"

describe("env", (): void => {
  test("ACTIVITY", (): void => {
    expectTypeOf(env.ACTIVITY).toEqualTypeOf<string>()

    expect(env.ACTIVITY.length).toBeGreaterThan(0)
  })

  test("CHANNEL_ID", (): void => {
    expectTypeOf(env.CHANNEL_ID).toEqualTypeOf<string>()

    expect(env.CHANNEL_ID.length).toBeGreaterThan(0)
  })

  test("COLOR", (): void => {
    expectTypeOf(env.COLOR).toEqualTypeOf<string>()

    const LEN: number = 7

    expect(env.COLOR).toHaveLength(LEN)
  })

  test("DB_NAME", (): void => {
    expectTypeOf(env.DB_NAME).toEqualTypeOf<string>()

    expect(env.DB_NAME).toBe("dropzonebot.test.db")
  })

  test("DB_PATH", (): void => {
    expectTypeOf(env.DB_PATH).toEqualTypeOf<string>()

    expect(env.DB_PATH).toBe("./db")
  })

  test("DEBUG", (): void => {
    expectTypeOf(env.DEBUG).toEqualTypeOf<boolean>()

    expect(env.DEBUG).toBeTrue()
  })

  test("EMOJI", (): void => {
    expectTypeOf(env.EMOJI).toEqualTypeOf<string>()

    expect(env.EMOJI.length).toBeGreaterThan(0)
  })

  test("LOGO_NAME", (): void => {
    expectTypeOf(env.LOGO_NAME).toEqualTypeOf<string>()

    expect(env.LOGO_NAME.length).toBeGreaterThan(0)
  })

  test("LOGO_PATH", (): void => {
    expectTypeOf(env.LOGO_PATH).toEqualTypeOf<string>()

    expect(env.LOGO_PATH.length).toBeGreaterThan(0)
  })

  test("LOGO_PORT", (): void => {
    expectTypeOf(env.LOGO_PORT).toEqualTypeOf<number | "random">()

    expect(env.LOGO_PORT).toBe("random")
  })

  test("LOGO_URL", (): void => {
    expectTypeOf(env.LOGO_URL).toEqualTypeOf<string>()

    expect(env.LOGO_URL.length).toBeGreaterThan(0)
  })

  test("MAX_TIME", (): void => {
    expectTypeOf(env.MAX_TIME).toEqualTypeOf<string>()

    expect(env.MAX_TIME.length).toBeGreaterThan(0)
  })

  test("MIN_TIME", (): void => {
    expectTypeOf(env.MIN_TIME).toEqualTypeOf<string>()

    expect(env.MIN_TIME.length).toBeGreaterThan(0)
  })

  test("NAME", (): void => {
    expectTypeOf(env.NAME).toEqualTypeOf<string>()

    expect(env.NAME.length).toBeGreaterThan(0)
  })

  test("TIMEOUT", (): void => {
    expectTypeOf(env.TIMEOUT).toEqualTypeOf<number>()

    expect(env.TIMEOUT).toBeGreaterThan(0)
  })

  test("TOKEN", (): void => {
    expectTypeOf(env.TOKEN).toEqualTypeOf<string>()

    expect(env.TOKEN.length).toBeGreaterThan(0)
  })
})
