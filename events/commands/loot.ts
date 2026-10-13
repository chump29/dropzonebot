import { parse } from "node:path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type HexColorString,
  InteractionContextType,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { bucket } from "../../utils/bucket.ts"
import { DropZone, type ILoot } from "../../utils/dropzone.ts"
import { env } from "../../utils/env.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody =>
  new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show loot")
    .setContexts(InteractionContextType.Guild)
    .toJSON()

const getEmbed = (loot: ILoot[]): APIEmbedField[] => {
  const fields: APIEmbedField[] = [
    {
      name: "_ _",
      value: ""
    } as APIEmbedField
  ]
  if (loot.length > 0) {
    fields.push(
      ...loot.map(
        (item: ILoot): APIEmbedField =>
          ({
            inline: true,
            name: item.name,
            value: `-# $${item.min === item.max ? item.min.toLocaleString() : `${item.min.toLocaleString()} - $${item.max.toLocaleString()}`}`
          }) as APIEmbedField
      )
    )
  } else {
    fields.push({
      name: "🚫  Nothing to show",
      value: ""
    } as APIEmbedField)
  }
  return fields
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  if (!bucket.allow(interaction.user.username)) {
    await interaction.editReply({ content: "-# > ❌ Rate limit exceeded" })

    return
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(env.COLOR as HexColorString)
        .setTitle("💰 DropZone Loot")
        .setFields(getEmbed(DropZone.LOOT.toSorted((a: ILoot, b: ILoot): number => b.max - a.max || b.min - a.min)))
        .toJSON()
    ]
  })
}

export { create, invoke }
