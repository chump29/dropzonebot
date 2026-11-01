import { error, info } from "@postfmly/logger"

import { default as pluralize } from "@jarrodek/pluralize"
import { parse as ms } from "@lukeed/ms"
import { default as csvToJson } from "convert-csv-to-json"
import { default as dayjs } from "dayjs"
import { default as localizedFormat } from "dayjs/plugin/localizedFormat"
import { ChannelType, type Client, MessageFlags, type MessageReaction, type TextChannel, type User } from "discord.js"
import { default as pretty } from "pretty-ms"
import { titleCase } from "title-case"
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
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async drop(): Promise<void> {
    const message = await this.CHANNEL.send({
      content: "✯ 𝕃𝕆𝕆𝕋 𝔻ℝ𝕆ℙ ✯", // cspell: disable-line
      flags: MessageFlags.SuppressNotifications
    })

    await message.react(env.EMOJI)

    const filter = (reaction: MessageReaction, user: User): boolean => reaction.emoji.name === env.EMOJI && !user.bot

    const collector = message.createReactionCollector({
      filter,
      max: 1,
      time: ms(`${env.TIMEOUT}m`)
    })

    collector.on("collect", async (_: MessageReaction, user: User): Promise<void> => {
      const loot = this.LOOT[this.random()]
      if (!loot) {
        error("❌ Could not get loot")

        return
      }

      const points = DropZoneBot.getRandom(loot.min, loot.max)

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
    this.NEW_TIME_MS = DropZoneBot.getRandom(ms(env.MIN_TIME), ms(env.MAX_TIME))

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
    this.LOOT = (await csvToJson
      .formatValueByType(true)
      .mapRows((row: ILoot): ILoot => {
        row.name = titleCase(row.name.trim())

        return row
      })
      .getJsonFromCsvAsync("loot.csv")) satisfies ILoot[]
    if (this.COUNT === 0) {
      throw new Error("No loot found")
    }

    this.random = exhaustiveUniqueRandom(0, this.COUNT - 1)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("loot item", this.COUNT, true)}`)
    }

    const channel = await client.channels.fetch(env.CHANNEL_ID)
    if (channel?.type !== ChannelType.GuildText) {
      throw new Error("Could not get channel")
    }

    this.CHANNEL = channel

    this.handleNewTime()
  }
}

const DropZone = new DropZoneBot()

export { DropZone, type ILoot }
