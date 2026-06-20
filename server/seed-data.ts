// Sample speaking opportunities. In production these would be ingested from
// conference CFP feeds, event APIs, and scrapers. For the MVP they ship as seed
// data so the directory is populated on first run.

export type SeedOpportunity = {
  id: string;
  title: string;
  organization: string;
  location: string;
  format: "in-person" | "virtual" | "hybrid";
  topics: string[];
  description: string;
  audience_size: string;
  fee_offered: string;
  application_url: string;
  deadline: string; // ISO date
  event_date: string; // ISO date
  source: string;
};

export const SAMPLE_OPPORTUNITIES: SeedOpportunity[] = [
  {
    id: "opp_saastr_2026",
    title: "Breakout Speaker — Scaling Revenue Teams",
    organization: "SaaStr Annual 2026",
    location: "San Francisco, CA",
    format: "in-person",
    topics: ["SaaS", "Sales", "Leadership", "Go-To-Market"],
    description:
      "SaaStr Annual is the largest community of B2B SaaS founders and execs. We are seeking breakout speakers to deliver tactical, no-fluff sessions on building and scaling revenue teams. Sessions are 25 minutes plus Q&A.",
    audience_size: "12,000+",
    fee_offered: "Travel + lodging covered",
    application_url: "https://example.com/saastr/cfp",
    deadline: "2026-07-15",
    event_date: "2026-09-22",
    source: "Conference CFP",
  },
  {
    id: "opp_inbound_2026",
    title: "Keynote & Spotlight Sessions",
    organization: "INBOUND by HubSpot",
    location: "Boston, MA",
    format: "hybrid",
    topics: ["Marketing", "AI", "Growth", "Content"],
    description:
      "INBOUND brings together marketers, sales leaders, and creators. We want bold ideas on the future of go-to-market in the age of AI. Spotlight sessions run 30 minutes.",
    audience_size: "11,000+",
    fee_offered: "$2,500 honorarium",
    application_url: "https://example.com/inbound/speak",
    deadline: "2026-08-01",
    event_date: "2026-10-14",
    source: "Conference CFP",
  },
  {
    id: "opp_localcraft_2026",
    title: "Workshop Facilitator — Personal Branding",
    organization: "Craft + Commerce",
    location: "Boise, ID",
    format: "in-person",
    topics: ["Personal Branding", "Creators", "Audience"],
    description:
      "A hands-on workshop for creators building an audience. Looking for a facilitator who can run a 90-minute interactive session on building a personal brand from scratch.",
    audience_size: "600",
    fee_offered: "$3,000 + travel",
    application_url: "https://example.com/craftcommerce/apply",
    deadline: "2026-07-05",
    event_date: "2026-08-19",
    source: "Event Organizer",
  },
  {
    id: "opp_womenintech_2026",
    title: "Panel Speaker — Women in Engineering Leadership",
    organization: "Women in Tech Global Summit",
    location: "Virtual",
    format: "virtual",
    topics: ["Leadership", "Engineering", "Diversity", "Career"],
    description:
      "Join a moderated panel on navigating the path to engineering leadership. Remote, 45-minute panel with live audience Q&A.",
    audience_size: "5,000+ online",
    fee_offered: "$1,000 honorarium",
    application_url: "https://example.com/witg/panel",
    deadline: "2026-06-30",
    event_date: "2026-07-28",
    source: "Conference CFP",
  },
  {
    id: "opp_finova_2026",
    title: "Mainstage Talk — The Future of Fintech",
    organization: "Finova Conference",
    location: "New York, NY",
    format: "in-person",
    topics: ["Fintech", "AI", "Payments", "Regulation"],
    description:
      "Mainstage 18-minute talk in the style of a TED session. We want forward-looking perspectives on where fintech is headed over the next five years.",
    audience_size: "3,500",
    fee_offered: "$5,000 + travel & lodging",
    application_url: "https://example.com/finova/cfp",
    deadline: "2026-08-20",
    event_date: "2026-11-03",
    source: "Conference CFP",
  },
  {
    id: "opp_devworld_2026",
    title: "Technical Session — Building with LLMs in Production",
    organization: "DevWorld",
    location: "Amsterdam, NL",
    format: "in-person",
    topics: ["AI", "Engineering", "LLMs", "DevTools"],
    description:
      "Developer-focused 40-minute technical session. Code-forward talks strongly preferred. Share real lessons from shipping LLM features to production.",
    audience_size: "8,000",
    fee_offered: "Travel covered, no honorarium",
    application_url: "https://example.com/devworld/speak",
    deadline: "2026-09-01",
    event_date: "2026-12-09",
    source: "Conference CFP",
  },
  {
    id: "opp_chamber_denver",
    title: "Luncheon Keynote — AI for Small Business",
    organization: "Denver Metro Chamber of Commerce",
    location: "Denver, CO",
    format: "in-person",
    topics: ["AI", "Small Business", "Productivity"],
    description:
      "Monthly member luncheon keynote, 30 minutes. Practical, approachable talk on how small business owners can adopt AI tools today.",
    audience_size: "250",
    fee_offered: "$1,500",
    application_url: "https://example.com/denverchamber/speakers",
    deadline: "2026-07-10",
    event_date: "2026-08-06",
    source: "Local Org",
  },
  {
    id: "opp_podcastmovement_2026",
    title: "Session Speaker — Audience Growth",
    organization: "Podcast Movement",
    location: "Dallas, TX",
    format: "in-person",
    topics: ["Podcasting", "Audience", "Content", "Marketing"],
    description:
      "Educational 50-minute session for podcasters at all levels. Looking for proven, repeatable audience growth tactics.",
    audience_size: "3,000",
    fee_offered: "Conference pass + travel stipend",
    application_url: "https://example.com/podmov/cfp",
    deadline: "2026-07-31",
    event_date: "2026-10-21",
    source: "Conference CFP",
  },
  {
    id: "opp_healthnext_2026",
    title: "Fireside Chat — AI in Healthcare",
    organization: "HealthNext Summit",
    location: "Chicago, IL",
    format: "hybrid",
    topics: ["Healthcare", "AI", "Innovation"],
    description:
      "Moderated 35-minute fireside chat with a healthcare innovation leader. We are matching the right expert with our moderator.",
    audience_size: "1,800",
    fee_offered: "$4,000 + travel",
    application_url: "https://example.com/healthnext/apply",
    deadline: "2026-08-15",
    event_date: "2026-11-18",
    source: "Event Organizer",
  },
  {
    id: "opp_remotework_2026",
    title: "Virtual Keynote — The Future of Distributed Teams",
    organization: "Running Remote",
    location: "Virtual",
    format: "virtual",
    topics: ["Remote Work", "Leadership", "Operations", "Culture"],
    description:
      "Opening virtual keynote, 25 minutes. We want a sharp, opinionated take on where distributed work is going.",
    audience_size: "10,000+ online",
    fee_offered: "$3,500",
    application_url: "https://example.com/runningremote/keynote",
    deadline: "2026-06-28",
    event_date: "2026-07-22",
    source: "Conference CFP",
  },
  {
    id: "opp_edtech_2026",
    title: "Breakout — AI Tutors and the Classroom",
    organization: "EdTech Forward",
    location: "Austin, TX",
    format: "in-person",
    topics: ["Education", "AI", "EdTech"],
    description:
      "45-minute breakout for K-12 and higher-ed educators. Balance vision with classroom-ready practicality.",
    audience_size: "1,200",
    fee_offered: "$2,000 + travel",
    application_url: "https://example.com/edtechfwd/cfp",
    deadline: "2026-09-10",
    event_date: "2026-12-02",
    source: "Conference CFP",
  },
  {
    id: "opp_founderretreat_2026",
    title: "Guest Speaker — Founder Mental Health",
    organization: "Founders Retreat",
    location: "Park City, UT",
    format: "in-person",
    topics: ["Mental Health", "Founders", "Wellbeing", "Leadership"],
    description:
      "Intimate 60-minute talk plus discussion for an invite-only founder retreat. Candid, story-driven sessions land best here.",
    audience_size: "80",
    fee_offered: "$6,000 all-inclusive",
    application_url: "https://example.com/foundersretreat/speak",
    deadline: "2026-08-05",
    event_date: "2026-10-09",
    source: "Private Event",
  },
];
