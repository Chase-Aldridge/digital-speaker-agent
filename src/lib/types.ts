export type User = {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
};

export type SpeakingEngagement = {
  event: string;
  year?: string;
  role?: string;
};

export type Profile = {
  headline: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  topics: string[];
  speakingHistory: SpeakingEngagement[];
  feeRange: string;
  videoUrl: string;
  headshotUrl: string;
  social: Record<string, string>;
  testimonials: string[];
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  location: string;
  format: "in-person" | "virtual" | "hybrid" | string;
  topics: string[];
  description: string;
  audienceSize: string;
  feeOffered: string;
  applicationUrl: string;
  deadline: string | null;
  eventDate: string | null;
  source: string;
  createdAt: string;
};

export type SubmissionStatus =
  | "saved"
  | "drafted"
  | "applied"
  | "in_review"
  | "accepted"
  | "rejected";

export type Submission = {
  id: string;
  opportunityId: string;
  status: SubmissionStatus;
  pitch: string;
  notes: string;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: Opportunity | null;
};

export type Stats = {
  total: number;
  byStatus: Record<SubmissionStatus, number>;
  availableOpportunities: number;
  applied: number;
  accepted: number;
};
