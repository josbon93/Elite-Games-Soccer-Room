import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'soccer-skeeball', 'elite-shooter', 'team-relay-shootout'
  description: text("description").notNull(),
  maxPlayers: integer("max_players").notNull(),
  maxTeams: integer("max_teams").notNull(),
  teamsOnly: integer("teams_only").notNull().default(0), // 0 = false, 1 = true (SQLite boolean)
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  mode: text("mode").notNull(), // 'individual' or 'team'
  playerCount: integer("player_count"),
  teamCount: integer("team_count"),
  teams: jsonb("teams"), // Array of team objects with colors and names
  status: text("status").notNull().default('pending'), // 'pending', 'active', 'completed'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

// Game types enum for consistency
export const GAME_TYPES = {
  SOCCER_SKEEBALL: 'soccer-skeeball',
  ELITE_SHOOTER: 'elite-shooter',
  TEAM_RELAY_SHOOTOUT: 'team-relay-shootout',
} as const;

export const TEAM_COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
} as const;
