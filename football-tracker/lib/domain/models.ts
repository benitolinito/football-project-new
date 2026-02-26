import { PositionGroup } from "./positions";

export type Role = "admin" | "staff";

export type Player = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  heightInInches: number | null;
  weightLbs: number | null;
  highSchool: string | null;
  state: string | null;
  dartmouthClass: string | null;
  developmentTag: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Season = {
  id: string;
  label: string;
  year: number;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RosterEntry = {
  id: string;
  seasonId: string;
  playerId: string;
  positionGroup: PositionGroup;
  positionDetail: string | null;
  classYear: string | null;
  status: string | null;
  depthTag: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type PositionTarget = {
  id: string;
  seasonId: string;
  positionGroup: PositionGroup;
  targetCount: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type PlayerNote = {
  id: string;
  playerId: string;
  seasonId: string | null;
  noteText: string;
  createdAt: string;
  createdBy: string;
};

export type PlayerAward = {
  id: string;
  playerId: string;
  seasonId: string | null;
  awardTag: string;
  awardLabel: string;
  createdAt: string;
  createdBy: string;
};

export type Scenario = {
  id: string;
  name: string;
  baseSeasonId: string;
  createdAt: string;
  createdBy: string;
};

export type ScenarioRosterEntry = {
  id: string;
  scenarioId: string;
  playerId: string;
  positionGroup: PositionGroup;
  positionDetail: string | null;
  classYear: string | null;
  status: string | null;
  depthTag: string | null;
  updatedAt: string;
  updatedBy: string;
};

export type ScenarioTarget = {
  id: string;
  scenarioId: string;
  positionGroup: PositionGroup;
  targetCount: number;
  updatedAt: string;
  updatedBy: string;
};

export type AuditEvent = {
  id: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: "insert" | "update" | "delete";
  metadata: Record<string, unknown>;
  createdAt: string;
};
