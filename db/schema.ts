import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const points = sqliteTable("points", {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  points: integer().notNull()
})

export type IPoints = Omit<typeof points.$inferInsert, "id">
