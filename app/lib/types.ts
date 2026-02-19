export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type GameWeight = "light" | "medium" | "heavy";

export interface BoardGame {
  id: string;
  title: string;
  boardGameGeekLink: string;
  weight: GameWeight;
  playerCount: string;
  teacher: string;
  owner: string;
}

export type TTRPGStyle = "tactical" | "story" | "hybrid";
export type TTRPGCategory = "campaign" | "oneshot";

export interface TTRPG {
  id: string;
  title: string;
  vibe: string;
  style: TTRPGStyle;
  category: TTRPGCategory;
  gms: string[];
  owner?: string;
}

export type GameType = "boardGame" | "ttrpg" | "roundtableIdea";

export interface UserVote {
  gameType: GameType;
  userId: string;
  gameId: string;
  vote: 0 | 1 | 2;
}
