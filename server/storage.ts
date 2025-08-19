import { type Game, type InsertGame, type GameSession, type InsertGameSession, GAME_TYPES } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Games
  getGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;

  // Game Sessions
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSessionStatus(id: string, status: string): Promise<GameSession | undefined>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private gameSessions: Map<string, GameSession>;

  constructor() {
    this.games = new Map();
    this.gameSessions = new Map();
    this.initializeDefaultGames();
  }

  private initializeDefaultGames() {
    const defaultGames: InsertGame[] = [
      {
        name: "Soccer Skeeball",
        type: GAME_TYPES.SOCCER_SKEEBALL,
        description: "Roll soccer balls up a ramp to score points in different target holes. Precision meets fun in this classic arcade experience!",
        maxPlayers: 8,
        maxTeams: 4,
        teamsOnly: 0,
      },
      {
        name: "Elite Shooter",
        type: GAME_TYPES.ELITE_SHOOTER,
        description: "Test your shooting accuracy with timed challenges. Hit targets, beat the clock, and show off your elite skills!",
        maxPlayers: 8,
        maxTeams: 4,
        teamsOnly: 0,
      },
      {
        name: "Team Relay Shootout",
        type: GAME_TYPES.TEAM_RELAY_SHOOTOUT,
        description: "Ultimate team competition! Work together in relay-style shooting challenges. Teamwork makes the dream work!",
        maxPlayers: 0,
        maxTeams: 4,
        teamsOnly: 1,
      },
    ];

    defaultGames.forEach(game => {
      this.createGame(game);
    });
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = { ...insertGame, id };
    this.games.set(id, game);
    return game;
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      ...insertSession,
      id,
      status: 'pending',
      createdAt: new Date(),
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSessionStatus(id: string, status: string): Promise<GameSession | undefined> {
    const session = this.gameSessions.get(id);
    if (session) {
      session.status = status;
      this.gameSessions.set(id, session);
      return session;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
