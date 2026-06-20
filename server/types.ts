// Shared server types and row->API mappers (snake_case DB -> camelCase JSON).

export type AppEnv = { Variables: { userId: string } };

export function mapOpportunity(r: any) {
  return {
    id: r.id,
    title: r.title,
    organization: r.organization,
    location: r.location,
    format: r.format,
    topics: safeJson(r.topics, []),
    description: r.description,
    audienceSize: r.audience_size,
    feeOffered: r.fee_offered,
    applicationUrl: r.application_url,
    deadline: r.deadline,
    eventDate: r.event_date,
    source: r.source,
    createdAt: r.created_at,
  };
}

export function mapProfile(r: any) {
  return {
    headline: r.headline,
    bio: r.bio,
    location: r.location,
    phone: r.phone,
    website: r.website,
    topics: safeJson(r.topics, []),
    speakingHistory: safeJson(r.speaking_history, []),
    feeRange: r.fee_range,
    videoUrl: r.video_url,
    headshotUrl: r.headshot_url,
    social: safeJson(r.social, {}),
    testimonials: safeJson(r.testimonials, []),
    updatedAt: r.updated_at,
  };
}

export function mapSubmission(r: any) {
  return {
    id: r.id,
    opportunityId: r.opportunity_id,
    status: r.status,
    pitch: r.pitch,
    notes: r.notes,
    appliedAt: r.applied_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    opportunity: r.opp_id ? mapOpportunity({
      id: r.opp_id,
      title: r.opp_title,
      organization: r.opp_organization,
      location: r.opp_location,
      format: r.opp_format,
      topics: r.opp_topics,
      description: r.opp_description,
      audience_size: r.opp_audience_size,
      fee_offered: r.opp_fee_offered,
      application_url: r.opp_application_url,
      deadline: r.opp_deadline,
      event_date: r.opp_event_date,
      source: r.opp_source,
      created_at: r.opp_created_at,
    }) : null,
  };
}

function safeJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
