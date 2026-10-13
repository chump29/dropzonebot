import { error, info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { parse as ms } from "@lukeed/ms"
import { default as csvToJson } from "convert-csv-to-json"
import { default as dayjs } from "dayjs"
import { default as localizedFormat } from "dayjs/plugin/localizedFormat"
import {
  type Channel,
  type Client,
  type Message,
  MessageFlags,
  type MessageReaction,
  type ReactionCollector,
  type TextChannel,
  type User
} from "discord.js"
import { default as pretty } from "pretty-ms"
import { exhaustiveUniqueRandom } from "unique-random"

import { DB } from "./db.ts"
import { env } from "./env.ts"

dayjs.extend(localizedFormat)

interface ILoot {
  max: number
  min: number
  name: string
}

interface IDropZoneBot {
  readonly COUNT: number
  drop: () => Promise<void>
  init: (client: Client) => Promise<void>
  readonly LOOT: ILoot[]
  readonly TIME: string
}

class DropZoneBot implements IDropZoneBot {
  LOOT: ILoot[] = []

  private random!: ReturnType<typeof exhaustiveUniqueRandom>

  private CHANNEL!: TextChannel

  private NEW_TIME_MS: number = 0
  private NEW_TIME!: dayjs.Dayjs

  get COUNT(): number {
    return this.LOOT.length
  }

  get TIME(): string {
    return `🕒  Next Loot Drop: ${pretty(this.NEW_TIME_MS, { secondsDecimalDigits: 0 })} @ ${this.NEW_TIME.format("LTS")}`
  }

  private static getRandom(min: number, max: number): number {
    // ! NOTE: min is string at runtime
    const minimum: number = Number(min)
    const maximum: number = Number(max)

    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
  }

  async drop(): Promise<void> {
    const message: Message = await this.CHANNEL.send({
      content: "✯ 𝕃𝕆𝕆𝕋 𝔻ℝ𝕆ℙ ✯", // cspell: disable-line
      flags: MessageFlags.SuppressNotifications
    })

    await message.react(env.EMOJI)

    const filter = (reaction: MessageReaction, user: User): boolean => reaction.emoji.name === env.EMOJI && !user.bot

    const collector: ReactionCollector = message.createReactionCollector({
      filter,
      max: 1,
      time: ms(`${env.TIMEOUT}m`)
    })

    collector.on("collect", async (_: MessageReaction, user: User): Promise<void> => {
      const loot: Optional<ILoot> = this.LOOT[this.random()]
      if (!loot) {
        error("❌ Could not get loot")

        return
      }

      const points: number = DropZoneBot.getRandom(loot.min, loot.max)

      await this.CHANNEL.send({
        content: `-# > **Congratulations, \`${user.displayName}\`!  ✨  You found \`${loot.name}\` for \`$${points.toLocaleString()}\`**`,
        flags: MessageFlags.SuppressNotifications
      })

      await DB.updatePoints(user.displayName, points)

      if (env.DEBUG) {
        info(`${user.displayName} claimed ${loot.name} for $${points.toLocaleString()}`)
      }

      this.handleNewTime()
    })

    collector.on("end", async (): Promise<void> => {
      if (collector.collected.size === 0) {
        await this.CHANNEL.send({
          content: "-# > 🐢 Too slow.",
          flags: MessageFlags.SuppressNotifications
        })
      }

      await message.reactions.removeAll()
    })
  }

  private getRandomTime(): void {
    this.NEW_TIME_MS = DropZoneBot.getRandom(ms(env.MIN_TIME) as number, ms(env.MAX_TIME) as number)

    this.NEW_TIME = dayjs().add(this.NEW_TIME_MS, "ms")
  }

  private handleNewTime(): void {
    this.getRandomTime()

    setTimeout(() => this.drop(), this.NEW_TIME_MS)

    if (env.DEBUG) {
      info(this.TIME)
    }
  }

  async init(client: Client): Promise<void> {
    this.LOOT = (await csvToJson.getJsonFromCsvAsync("loot.csv")) as ILoot[]

    if (this.COUNT === 0) {
      throw new Error("No loot found")
    }

    this.random = exhaustiveUniqueRandom(0, this.COUNT - 1)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("loot item", this.COUNT, true)}`)
    }

    const channel: Nullable<Channel> = await client.channels.fetch(env.CHANNEL_ID)
    if (!channel) {
      throw new Error("Could not get channel")
    }

    this.CHANNEL = channel as TextChannel

    this.handleNewTime()
  }
}

const DropZone: IDropZoneBot = new DropZoneBot()

export { DropZone, type ILoot }
