// Fix: Replaced circular import with the definition of RegionData.
export interface RegionData {
  [key: string]: string[];
}

export interface Query {
  year: number;
  city: string;
  country: string;
  topic: string;
}

export interface SummaryResult {
  primary: string;
  related: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
  type: 'preceding' | 'main' | 'succeeding';
  interestingDetail?: string;
}

export interface EventInDepth {
  keyFigures: string;
  socioPoliticalContext: string;
  opposingViews: string;
  immediateConsequences: string;
}

// New types for Person search
export interface PersonSummary {
  overview: string;
  family: string;
  keyEvents: string;
}

export interface PersonInDepth {
  friendsAndAssociates: string;
  influencesAndMentors: string;

  achievements: string;
  funnyAnecdotes: string;
  embarrassingStories: string;
  conspiracyTheories: string;
  enemies: string;
  notableQuotes: string;
  contextualAnalysis: string;
}

export interface FamilyTreeNode {
  name: string;
  relation: string;
  children?: FamilyTreeNode[];
}

// New type for Historical Echoes (formerly Six Degrees)
export interface HistoricalEchoLink {
  title: string;
  consequence: string;
  year: string;
}

// Discriminated union for different result types
interface BaseResult {
  imageUrl: string | null;
}

export interface TimeResult extends BaseResult {
  type: 'time';
  query: Query;
  summary: SummaryResult | null;
  inDepth: EventInDepth | null;
  timeline: TimelineEvent[] | null;
}

export interface PersonResult extends BaseResult {
  type: 'person';
  query: { searchTerm: string };
  summary: PersonSummary | null;
  inDepth: PersonInDepth | null;
  sixDegrees: HistoricalEchoLink[] | null;
  familyTree: FamilyTreeNode | null;
}

export interface TopicResult extends BaseResult {
  type: 'topic';
  query: { searchTerm: string };
  summary: string | null;
  inDepth: string | null;
  timeline: TimelineEvent[] | null;
}

export type SearchResult = TimeResult | PersonResult | TopicResult;

// New types for Authentication
export interface User {
  status: 'guest' | 'pending' | 'approved';
  username: string | null;
  credits: number;
}

export interface AuthContextType {
  user: User;
  login: () => void;
  logout: () => void;
  approveUser: () => void;
  useCredit: (cost: number) => boolean;
  addCredits: () => void;
}
