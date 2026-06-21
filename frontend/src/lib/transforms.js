// Adapters from raw gtm_v4_fixed agent JSON → view models.
// Every accessor is defensive: a missing field returns an empty default so the
// UI never breaks on a partial run.  No synthetic numbers, no fake metrics.

const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" ? x : {});

// ── RESEARCH (result.report) ─────────────────────────────────────────────────
export function getReportView(result) {
  const r = obj(obj(result).report);
  const plan = obj(obj(result).plan);
  return {
    title: r.title || plan.subject_entity || "",
    industry: plan.industry || plan.market || "",
    geography: plan.geography || "",
    confidence: r.confidence_level || "",
    executiveSummary: r.executive_summary || "",
    swot: {
      strengths: arr(r.subject_swot?.strengths),
      weaknesses: arr(r.subject_swot?.weaknesses),
      opportunities: arr(r.subject_swot?.opportunities),
      threats: arr(r.subject_swot?.threats),
    },
    companyCompetitors: arr(r.company_competitors),
    productCompetitors: arr(r.product_competitors),
    alternatives: arr(r.alternative_solutions),
    personas: arr(r.buyer_personas),
    trends: arr(r.market_trends),
    opportunities: arr(r.opportunities),
    risks: arr(r.risks),
    recommendations: arr(r.recommendations),
    evidenceLimitation: r._evidence_limitation || "",
    guardrailIssues: arr(r._output_guard_issues),
  };
}

export function getSources(result) {
  return arr(obj(result).sources).map((s) => ({
    id: s.id, title: s.title, url: s.url, domain: s.domain,
    official: !!s.official, role: s.role || "",
  }));
}

// ── STRATEGY (result.gtm_strategy) ───────────────────────────────────────────
export function getStrategyView(result) {
  const g = obj(obj(result).gtm_strategy);
  if (!g.foundation && !g.activation && !g.execution) return null;
  const f = obj(g.foundation);
  const a = obj(g.activation);
  const x = obj(g.execution);
  return {
    northStar: g.north_star || f.north_star || "",
    foundation: {
      positioning: f.positioning_statement || "",
      slot: obj(f.slot_statement),
      icp: obj(f.icp),
      topPains: arr(f.top_pains),
      triggers: arr(f.trigger_events),
      disqualifiers: arr(f.disqualifiers),
      secondarySegments: arr(f.secondary_segments),
      beachhead: obj(f.beachhead),
      competitiveEdges: arr(f.competitive_differentiation),
    },
    activation: {
      pricing: obj(a.pricing),
      motion: obj(a.motion),
      channelPlays: arr(a.channel_plays),
      messagingByPersona: arr(a.messaging_by_persona),
      contentEngine: obj(a.content_engine),
    },
    execution: {
      salesPlaybook: obj(x.sales_playbook),
      demandGen: obj(x.demand_gen),
      metrics: obj(x.metrics),
      roadmap: arr(x.roadmap_90day),
      risks: arr(x.risks),
    },
  };
}

// ── CONTENT (result.content_phase_a + result.content) ───────────────────────
export function getContentView(result) {
  const a = obj(obj(result).content_phase_a);
  const b = obj(obj(result).content);
  const merged = {
    positioning_line: b.positioning_line || a.positioning_line || "",
    messaging_pillars: arr(b.messaging_pillars || a.messaging_pillars),
    // Phase A always exposes linkedin_posts. Phase B may add more.
    linkedin: arr(b.linkedin_posts && b.linkedin_posts.length ? b.linkedin_posts : a.linkedin_posts),
    blogs: arr(b.blog_drafts),
    emails: arr(b.email_drafts),
  };
  return merged;
}

export function hasStrategy(result) {
  const g = obj(obj(result).gtm_strategy);
  return !!(g.foundation || g.activation || g.execution);
}
export function hasPhaseA(result) {
  const a = obj(obj(result).content_phase_a);
  return arr(a.linkedin_posts).length > 0;
}
export function hasPhaseB(result) {
  const b = obj(obj(result).content);
  return arr(b.linkedin_posts).length > 0 || arr(b.blog_drafts).length > 0 || arr(b.email_drafts).length > 0;
}
