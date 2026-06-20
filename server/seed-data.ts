// Sample speaking opportunities. In production these would be ingested from
// conference CFP feeds, event APIs, podcast directories, and the AI discovery
// engine (see server/discover.ts). For the MVP they ship as seed data so the
// directory is populated on first run. Opportunities are either events or
// podcasts, and each carries a pay model so a speaker sees the money up front.

export type OppType = "event" | "podcast";
export type PayModel =
  | "paid-opportunity" // the speaker gets paid (honorarium or fee)
  | "free-to-speak" // no fee, exposure only (travel may be covered)
  | "paid-to-speak" // the speaker pays to be on stage (pay to play)
  | "paid-to-pitch"; // podcast charges to feature a guest

export type SeedOpportunity = {
  id: string;
  type: OppType;
  title: string;
  organization: string;
  location: string;
  format: "in-person" | "virtual" | "hybrid" | "remote";
  payModel: PayModel;
  topics: string[];
  description: string;
  audienceSize: string;
  feeOffered: string;
  contact: string; // how to reach the organizer or host (role based, verify before use)
  applicationUrl: string;
  deadline: string; // ISO date
  eventDate: string; // ISO date
  source: string;
};

export const SAMPLE_OPPORTUNITIES: SeedOpportunity[] = [
  {
    id: "opp_saastr_2026",
    type: "event",
    title: "Breakout Speaker - Scaling Revenue Teams",
    organization: "SaaStr Annual 2026",
    location: "San Francisco, CA",
    format: "in-person",
    payModel: "free-to-speak",
    topics: ["SaaS", "Sales", "Leadership", "Go-To-Market"],
    description:
      "SaaStr Annual is the largest community of B2B SaaS founders and execs. We are seeking breakout speakers to deliver tactical, no-fluff sessions on building and scaling revenue teams. Sessions are 25 minutes plus Q&A.",
    audienceSize: "12,000+",
    feeOffered: "Travel + lodging covered",
    contact: "Speaker Programming Team via application page",
    applicationUrl: "https://example.com/saastr/cfp",
    deadline: "2026-07-15",
    eventDate: "2026-09-22",
    source: "Conference CFP",
  },
  {
    id: "opp_inbound_2026",
    type: "event",
    title: "Keynote & Spotlight Sessions",
    organization: "INBOUND by HubSpot",
    location: "Boston, MA",
    format: "hybrid",
    payModel: "paid-opportunity",
    topics: ["Marketing", "AI", "Growth", "Content"],
    description:
      "INBOUND brings together marketers, sales leaders, and creators. We want bold ideas on the future of go-to-market in the age of AI. Spotlight sessions run 30 minutes.",
    audienceSize: "11,000+",
    feeOffered: "$2,500 honorarium",
    contact: "Speaker Relations via application page",
    applicationUrl: "https://example.com/inbound/speak",
    deadline: "2026-08-01",
    eventDate: "2026-10-14",
    source: "Conference CFP",
  },
  {
    id: "opp_localcraft_2026",
    type: "event",
    title: "Workshop Facilitator - Personal Branding",
    organization: "Craft + Commerce",
    location: "Boise, ID",
    format: "in-person",
    payModel: "paid-opportunity",
    topics: ["Personal Branding", "Creators", "Audience"],
    description:
      "A hands-on workshop for creators building an audience. Looking for a facilitator who can run a 90-minute interactive session on building a personal brand from scratch.",
    audienceSize: "600",
    feeOffered: "$3,000 + travel",
    contact: "Workshop Committee via application page",
    applicationUrl: "https://example.com/craftcommerce/apply",
    deadline: "2026-07-05",
    eventDate: "2026-08-19",
    source: "Event Organizer",
  },
  {
    id: "opp_womenintech_2026",
    type: "event",
    title: "Panel Speaker - Women in Engineering Leadership",
    organization: "Women in Tech Global Summit",
    location: "Virtual",
    format: "virtual",
    payModel: "paid-opportunity",
    topics: ["Leadership", "Engineering", "Diversity", "Career"],
    description:
      "Join a moderated panel on navigating the path to engineering leadership. Remote, 45-minute panel with live audience Q&A.",
    audienceSize: "5,000+ online",
    feeOffered: "$1,000 honorarium",
    contact: "Panel Producer via application page",
    applicationUrl: "https://example.com/witg/panel",
    deadline: "2026-06-30",
    eventDate: "2026-07-28",
    source: "Conference CFP",
  },
  {
    id: "opp_finova_2026",
    type: "event",
    title: "Mainstage Talk - The Future of Fintech",
    organization: "Finova Conference",
    location: "New York, NY",
    format: "in-person",
    payModel: "paid-opportunity",
    topics: ["Fintech", "AI", "Payments", "Regulation"],
    description:
      "Mainstage 18-minute talk in the style of a TED session. We want forward-looking perspectives on where fintech is headed over the next five years.",
    audienceSize: "3,500",
    feeOffered: "$5,000 + travel & lodging",
    contact: "Content Team via application page",
    applicationUrl: "https://example.com/finova/cfp",
    deadline: "2026-08-20",
    eventDate: "2026-11-03",
    source: "Conference CFP",
  },
  {
    id: "opp_devworld_2026",
    type: "event",
    title: "Technical Session - Building with LLMs in Production",
    organization: "DevWorld",
    location: "Amsterdam, NL",
    format: "in-person",
    payModel: "free-to-speak",
    topics: ["AI", "Engineering", "LLMs", "DevTools"],
    description:
      "Developer-focused 40-minute technical session. Code-forward talks strongly preferred. Share real lessons from shipping LLM features to production.",
    audienceSize: "8,000",
    feeOffered: "Travel covered, no honorarium",
    contact: "Program Committee via application page",
    applicationUrl: "https://example.com/devworld/speak",
    deadline: "2026-09-01",
    eventDate: "2026-12-09",
    source: "Conference CFP",
  },
  {
    id: "opp_chamber_denver",
    type: "event",
    title: "Luncheon Keynote - AI for Small Business",
    organization: "Denver Metro Chamber of Commerce",
    location: "Denver, CO",
    format: "in-person",
    payModel: "paid-opportunity",
    topics: ["AI", "Small Business", "Productivity"],
    description:
      "Monthly member luncheon keynote, 30 minutes. Practical, approachable talk on how small business owners can adopt AI tools today.",
    audienceSize: "250",
    feeOffered: "$1,500",
    contact: "Events Coordinator via application page",
    applicationUrl: "https://example.com/denverchamber/speakers",
    deadline: "2026-07-10",
    eventDate: "2026-08-06",
    source: "Local Org",
  },
  {
    id: "opp_podcastmovement_2026",
    type: "event",
    title: "Session Speaker - Audience Growth",
    organization: "Podcast Movement",
    location: "Dallas, TX",
    format: "in-person",
    payModel: "free-to-speak",
    topics: ["Podcasting", "Audience", "Content", "Marketing"],
    description:
      "Educational 50-minute session for podcasters at all levels. Looking for proven, repeatable audience growth tactics.",
    audienceSize: "3,000",
    feeOffered: "Conference pass + travel stipend",
    contact: "Education Track Team via application page",
    applicationUrl: "https://example.com/podmov/cfp",
    deadline: "2026-07-31",
    eventDate: "2026-10-21",
    source: "Conference CFP",
  },
  {
    id: "opp_healthnext_2026",
    type: "event",
    title: "Fireside Chat - AI in Healthcare",
    organization: "HealthNext Summit",
    location: "Chicago, IL",
    format: "hybrid",
    payModel: "paid-opportunity",
    topics: ["Healthcare", "AI", "Innovation"],
    description:
      "Moderated 35-minute fireside chat with a healthcare innovation leader. We are matching the right expert with our moderator.",
    audienceSize: "1,800",
    feeOffered: "$4,000 + travel",
    contact: "Speaker Curation Team via application page",
    applicationUrl: "https://example.com/healthnext/apply",
    deadline: "2026-08-15",
    eventDate: "2026-11-18",
    source: "Event Organizer",
  },
  {
    id: "opp_remotework_2026",
    type: "event",
    title: "Virtual Keynote - The Future of Distributed Teams",
    organization: "Running Remote",
    location: "Virtual",
    format: "virtual",
    payModel: "paid-opportunity",
    topics: ["Remote Work", "Leadership", "Operations", "Culture"],
    description:
      "Opening virtual keynote, 25 minutes. We want a sharp, opinionated take on where distributed work is going.",
    audienceSize: "10,000+ online",
    feeOffered: "$3,500",
    contact: "Programming Team via application page",
    applicationUrl: "https://example.com/runningremote/keynote",
    deadline: "2026-06-28",
    eventDate: "2026-07-22",
    source: "Conference CFP",
  },
  {
    id: "opp_edtech_2026",
    type: "event",
    title: "Breakout - AI Tutors and the Classroom",
    organization: "EdTech Forward",
    location: "Austin, TX",
    format: "in-person",
    payModel: "paid-opportunity",
    topics: ["Education", "AI", "EdTech"],
    description:
      "45-minute breakout for K-12 and higher-ed educators. Balance vision with classroom-ready practicality.",
    audienceSize: "1,200",
    feeOffered: "$2,000 + travel",
    contact: "Sessions Team via application page",
    applicationUrl: "https://example.com/edtechfwd/cfp",
    deadline: "2026-09-10",
    eventDate: "2026-12-02",
    source: "Conference CFP",
  },
  {
    id: "opp_founderretreat_2026",
    type: "event",
    title: "Guest Speaker - Founder Mental Health",
    organization: "Founders Retreat",
    location: "Park City, UT",
    format: "in-person",
    payModel: "paid-opportunity",
    topics: ["Mental Health", "Founders", "Wellbeing", "Leadership"],
    description:
      "Intimate 60-minute talk plus discussion for an invite-only founder retreat. Candid, story-driven sessions land best here.",
    audienceSize: "80",
    feeOffered: "$6,000 all-inclusive",
    contact: "Host Committee via application page",
    applicationUrl: "https://example.com/foundersretreat/speak",
    deadline: "2026-08-05",
    eventDate: "2026-10-09",
    source: "Private Event",
  },

  // --- Podcasts -------------------------------------------------------------
  {
    id: "pod_scaleup_show",
    type: "podcast",
    title: "Guest Expert - SaaS Growth Episode",
    organization: "The Scale Up Show",
    location: "Remote",
    format: "remote",
    payModel: "free-to-speak",
    topics: ["SaaS", "Growth", "Sales", "Leadership"],
    description:
      "A weekly podcast for B2B founders and operators. The host books guests who can teach one sharp, tactical growth lesson in 35 minutes. Remote recording, no fee to appear.",
    audienceSize: "20,000 downloads/episode",
    feeOffered: "Unpaid guest spot, strong audience reach",
    contact: "Guest booking form on the show site",
    applicationUrl: "https://example.com/scaleupshow/guest",
    deadline: "2026-07-20",
    eventDate: "2026-08-12",
    source: "Podcast Directory",
  },
  {
    id: "pod_ai_builders",
    type: "podcast",
    title: "Guest - Building with AI Episode",
    organization: "AI Builders Podcast",
    location: "Remote",
    format: "remote",
    payModel: "free-to-speak",
    topics: ["AI", "Engineering", "Startups", "LLMs"],
    description:
      "Interview show featuring practitioners shipping real AI products. The host wants guests with a concrete build story and lessons learned. 45-minute remote conversation.",
    audienceSize: "12,000 downloads/episode",
    feeOffered: "Unpaid guest spot",
    contact: "Booking team via guest form",
    applicationUrl: "https://example.com/aibuilders/be-a-guest",
    deadline: "2026-07-25",
    eventDate: "2026-08-18",
    source: "Podcast Directory",
  },
  {
    id: "pod_founder_stories",
    type: "podcast",
    title: "Featured Guest - Founder Journey Episode",
    organization: "Founder Stories Network",
    location: "Remote",
    format: "remote",
    payModel: "paid-to-pitch",
    topics: ["Founders", "Startups", "Leadership", "Personal Branding"],
    description:
      "A founder-interview network that offers a paid featured-guest placement, including promotion across its channels. Best for speakers building a personal brand who want guaranteed reach.",
    audienceSize: "35,000 downloads/episode",
    feeOffered: "Paid placement (you pay to be featured)",
    contact: "Sponsorship and guest desk via site",
    applicationUrl: "https://example.com/founderstories/featured",
    deadline: "2026-08-10",
    eventDate: "2026-09-05",
    source: "Podcast Directory",
  },
  {
    id: "pod_growth_mic",
    type: "podcast",
    title: "Guest - Marketing & Audience Growth Episode",
    organization: "The Growth Mic",
    location: "Remote",
    format: "remote",
    payModel: "free-to-speak",
    topics: ["Marketing", "Audience", "Content", "Creators"],
    description:
      "Short, punchy 25-minute episodes on growing an audience. The host prefers guests with a repeatable framework listeners can use the same week. Remote recording.",
    audienceSize: "8,000 downloads/episode",
    feeOffered: "Unpaid guest spot",
    contact: "Host via guest pitch form",
    applicationUrl: "https://example.com/growthmic/pitch",
    deadline: "2026-07-18",
    eventDate: "2026-08-08",
    source: "Podcast Directory",
  },
];
