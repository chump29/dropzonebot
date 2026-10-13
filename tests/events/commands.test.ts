import { default as assert } from "node:assert/strict"
import { readdir } from "node:fs/promises"
import { default as path } from "node:path"

import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import {
  type APIEmbed,
  type ChannelManager,
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
  type Message,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type ReactionCollector,
  type TextChannel,
  type User
} from "discord.js"
import { match, P } from "ts-pattern"

import { type IPoints, points } from "../../db/schema.ts"
import { author, version } from "../../package.json" with { type: "json" }
import { DB } from "../../utils/db.ts"
import { DropZone } from "../../utils/dropzone.ts"
import { env } from "../../utils/env.ts"

interface ICommandFile {
  create: () => RESTPostAPIChatInputApplicationCommandsJSONBody
  invoke: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const HEX_BASE: number = 16
const COLOR_LEN: number = 6
const decimalToHex = (c: Optional<number>): string => (c ? `#${c.toString(HEX_BASE).padStart(COLOR_LEN, "0")}` : "N/A")

const dir: string = "events/commands"

const commands: string[] = (await readdir(dir)).filter((file: string): boolean => file.endsWith(".ts"))

beforeAll(async (): Promise<void> => {
  spyOn(console, "info").mockImplementation((): void => undefined) // suppress

  DB.open()

  assert(DB._db)

  await DB._db.delete(points)

  const users: IPoints[] = Array.from(
    { length: 2 },
    (): IPoints =>
      ({
        name: fake.internet.username(),
        points: fake.number.int({ max: 100, min: 1 })
      }) satisfies IPoints
  )

  await DB._db.insert(points).values(users)

  await DropZone.init({
    channels: {
      fetch: jest.fn().mockResolvedValue({
        send: jest.fn().mockResolvedValue({
          createReactionCollector: jest.fn().mockReturnValue({
            on: jest.fn()
          } as unknown as ReactionCollector),
          react: jest.fn()
        } as unknown as Message)
      } as unknown as TextChannel)
    } as unknown as ChannelManager
  } as Client)
})

await Promise.all(
  commands.map(async (command: string): Promise<void> => {
    const { create, invoke } = (await import(`${path.join("../..", dir)}/${command}`)) satisfies ICommandFile

    const name: string = path.basename(command, ".ts")

    describe(`/${name}`, (): void => {
      test("create", (): void => {
        const c: RESTPostAPIChatInputApplicationCommandsJSONBody = create()

        expect(c.name).toBe(name)
        expect(c.description).not.toBeEmpty()
        expect(c.contexts ?? []).not.toBeEmpty()
      })

      test("invoke", async (): Promise<void> => {
        const interaction: ChatInputCommandInteraction = {
          channels: {
            fetch: jest.fn().mockResolvedValue({
              send: jest.fn()
            } as unknown as TextChannel)
          } as unknown as ChannelManager,
          createdTimestamp: fake.date.past().getTime(),
          deferReply: jest.fn(),
          editReply: jest.fn(),
          user: {
            username: fake.internet.username()
          } as User,
          options: {
            getString: jest.fn().mockReturnValue("all")
          }
        } as unknown as ChatInputCommandInteraction

        expect(await invoke(interaction)).toBeUndefined()

        expect(interaction.deferReply).toHaveBeenCalledTimes(1)
        expect(interaction.editReply).toHaveBeenCalledTimes(1)

        const mockEditReply = interaction.editReply as ReturnType<typeof jest.fn>
        const firstCallArgs = mockEditReply.mock.calls
        const payload = firstCallArgs[0]?.[0]
        if (!payload) {
          throw new Error("Payload not found")
        }

        match<string, void>(name)
          .with("drop", (): void => expect(payload.content).toInclude("dropped"))
          .with("info", (): void => {
            const { data }: { data: APIEmbed } = EmbedBuilder.from(payload.embeds?.[0])

            expect(decimalToHex(data.color)).toBe(env.COLOR)
            expect(data.author?.icon_url).toBe(env.LOGO_URL)
            expect(data.author?.name).toBe(`${env.NAME} v${version}`)
            expect(data.thumbnail?.url).toBe(env.LOGO_URL)
            expect(data.description).not.toBeEmpty()
            expect(data.footer?.text).toEndWith(author.name)
          })
          .with(P.union("leaderboard", "loot"), (): void => {
            const { data }: { data: APIEmbed } = EmbedBuilder.from(payload.embeds?.[0])

            expect(decimalToHex(data.color)).toBe(env.COLOR)
            expect(data.title).not.toBeEmpty()
            expect(data.fields).not.toBeUndefined()
            expect(data.fields).not.toBeEmpty()
          })
          .with("ping", (): void => expect(payload.content).toInclude("Pong"))
          .with("reset", (): void => expect(payload.content).toInclude("Reset"))
          .with("status", (): void => expect(payload.content).toInclude("Next"))
          .otherwise((): never => {
            throw new Error(`Payload tests not found for /${name}`)
          })
      })
    })
  })
)
