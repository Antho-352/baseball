/**
 * MLB Team Logos URLs
 * Served directly from mlbstatic.com (official CDN)
 * No local download needed
 */

/**
 * Get MLB team logo URL from official CDN
 * @param teamId - MLB team ID
 * @param variant - 'cap' (default) or 'primary'
 */
export function getMLBLogoUrl(teamId: number, variant: 'cap' | 'primary' = 'cap'): string {
  if (variant === 'primary') {
    return `https://www.mlbstatic.com/team-logos/team-primary-logo/${teamId}.svg`;
  }
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}

/**
 * MLB Team abbreviations mapping
 */
export const MLB_TEAMS: Record<string, { id: number; name: string; abbr: string }> = {
  'LAA': { id: 108, name: 'Los Angeles Angels', abbr: 'LAA' },
  'AZ': { id: 109, name: 'Arizona Diamondbacks', abbr: 'AZ' },
  'BAL': { id: 110, name: 'Baltimore Orioles', abbr: 'BAL' },
  'BOS': { id: 111, name: 'Boston Red Sox', abbr: 'BOS' },
  'CHC': { id: 112, name: 'Chicago Cubs', abbr: 'CHC' },
  'CIN': { id: 113, name: 'Cincinnati Reds', abbr: 'CIN' },
  'CLE': { id: 114, name: 'Cleveland Guardians', abbr: 'CLE' },
  'COL': { id: 115, name: 'Colorado Rockies', abbr: 'COL' },
  'DET': { id: 116, name: 'Detroit Tigers', abbr: 'DET' },
  'HOU': { id: 117, name: 'Houston Astros', abbr: 'HOU' },
  'KC': { id: 118, name: 'Kansas City Royals', abbr: 'KC' },
  'LAD': { id: 119, name: 'Los Angeles Dodgers', abbr: 'LAD' },
  'WSH': { id: 120, name: 'Washington Nationals', abbr: 'WSH' },
  'NYM': { id: 121, name: 'New York Mets', abbr: 'NYM' },
  'OAK': { id: 133, name: 'Oakland Athletics', abbr: 'OAK' },
  'PIT': { id: 134, name: 'Pittsburgh Pirates', abbr: 'PIT' },
  'SD': { id: 135, name: 'San Diego Padres', abbr: 'SD' },
  'SEA': { id: 136, name: 'Seattle Mariners', abbr: 'SEA' },
  'SF': { id: 137, name: 'San Francisco Giants', abbr: 'SF' },
  'STL': { id: 138, name: 'St. Louis Cardinals', abbr: 'STL' },
  'TB': { id: 139, name: 'Tampa Bay Rays', abbr: 'TB' },
  'TEX': { id: 140, name: 'Texas Rangers', abbr: 'TEX' },
  'TOR': { id: 141, name: 'Toronto Blue Jays', abbr: 'TOR' },
  'MIN': { id: 142, name: 'Minnesota Twins', abbr: 'MIN' },
  'PHI': { id: 143, name: 'Philadelphia Phillies', abbr: 'PHI' },
  'ATL': { id: 144, name: 'Atlanta Braves', abbr: 'ATL' },
  'CWS': { id: 145, name: 'Chicago White Sox', abbr: 'CWS' },
  'MIA': { id: 146, name: 'Miami Marlins', abbr: 'MIA' },
  'NYY': { id: 147, name: 'New York Yankees', abbr: 'NYY' },
  'MIL': { id: 158, name: 'Milwaukee Brewers', abbr: 'MIL' },
  'TBR': { id: 139, name: 'Tampa Bay Rays', abbr: 'TB' },
  'KCR': { id: 118, name: 'Kansas City Royals', abbr: 'KC' },
  'SDP': { id: 135, name: 'San Diego Padres', abbr: 'SD' },
  'SFG': { id: 137, name: 'San Francisco Giants', abbr: 'SF' },
  'ARI': { id: 109, name: 'Arizona Diamondbacks', abbr: 'AZ' },
};

/**
 * Get team logo by abbreviation
 */
export function getMLBLogo(abbrOrId: string | number, variant: 'cap' | 'primary' = 'cap'): string {
  if (typeof abbrOrId === 'number') {
    return getMLBLogoUrl(abbrOrId, variant);
  }

  const team = MLB_TEAMS[abbrOrId.toUpperCase()];
  if (!team) {
    console.warn(`Unknown MLB team abbreviation: ${abbrOrId}`);
    return getMLBLogoUrl(119, variant); // Fallback to LAD
  }

  return getMLBLogoUrl(team.id, variant);
}

/**
 * KBO Team Logos from TheSportsDB
 * Source: https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Korean%20KBO%20League
 * Updated: 2026-04-16
 */
export const KBO_LOGOS: Record<string, string> = {
  'SSG Landers': 'https://r2.thesportsdb.com/images/media/team/badge/kii9pd1742225451.png',
  'LG Twins': 'https://r2.thesportsdb.com/images/media/team/badge/ajpsiq1648069368.png',
  'Samsung Lions': 'https://r2.thesportsdb.com/images/media/team/badge/5u6k511589709673.png',
  'KIA Tigers': 'https://r2.thesportsdb.com/images/media/team/badge/2z389i1648069353.png',
  'Doosan Bears': 'https://r2.thesportsdb.com/images/media/team/badge/2qo9zp1740573854.png',
  'Kiwoom Heroes': 'https://r2.thesportsdb.com/images/media/team/badge/qcj18p1589709259.png',
  'Lotte Giants': 'https://r2.thesportsdb.com/images/media/team/badge/p7q92w1742225576.png',
  'NC Dinos': 'https://r2.thesportsdb.com/images/media/team/badge/6gwcg81589708218.png',
  'Hanwha Eagles': 'https://r2.thesportsdb.com/images/media/team/badge/7aztmc1740573842.png',
  'KT Wiz': 'https://r2.thesportsdb.com/images/media/team/badge/qk8erg1589709962.png',
};

/**
 * NPB Team Logos from TheSportsDB
 * Source: https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Nippon%20Baseball%20League
 * Updated: 2026-04-16
 */
export const NPB_LOGOS: Record<string, string> = {
  'Yomiuri Giants': 'https://r2.thesportsdb.com/images/media/team/badge/0qyqs41576014298.png',
  'Hanshin Tigers': 'https://r2.thesportsdb.com/images/media/team/badge/h2jhos1576009994.png',
  'Chunichi Dragons': 'https://r2.thesportsdb.com/images/media/team/badge/jli5jv1576009060.png',
  'Hiroshima Toyo Carp': 'https://r2.thesportsdb.com/images/media/team/badge/bv50e51576010505.png',
  'Yakult Swallows': 'https://r2.thesportsdb.com/images/media/team/badge/ryyku01576013231.png',
  'Tokyo Yakult Swallows': 'https://r2.thesportsdb.com/images/media/team/badge/ryyku01576013231.png',
  'Yokohama DeNA BayStars': 'https://r2.thesportsdb.com/images/media/team/badge/fuhqf21576013789.png',
  'Fukuoka SoftBank Hawks': 'https://r2.thesportsdb.com/images/media/team/badge/ampozy1576009547.png',
  'Orix Buffaloes': 'https://r2.thesportsdb.com/images/media/team/badge/53lv6f1576011517.png',
  'Saitama Seibu Lions': 'https://r2.thesportsdb.com/images/media/team/badge/onmvow1576012163.png',
  'Chiba Lotte Marines': 'https://r2.thesportsdb.com/images/media/team/badge/na10tn1576008207.png',
  'Tohoku Rakuten Golden Eagles': 'https://r2.thesportsdb.com/images/media/team/badge/qx24pm1576012656.png',
  'Hokkaido Nippon-Ham Fighters': 'https://r2.thesportsdb.com/images/media/team/badge/qxgzq01576011016.png',
};

/**
 * KBO Team abbreviations mapping
 */
const KBO_ABBR_MAP: Record<string, string> = {
  'SSG': 'SSG Landers',
  'LGT': 'LG Twins',
  'SAM': 'Samsung Lions',
  'KIA': 'KIA Tigers',
  'DOO': 'Doosan Bears',
  'KIW': 'Kiwoom Heroes',
  'LOT': 'Lotte Giants',
  'NCD': 'NC Dinos',
  'HAN': 'Hanwha Eagles',
  'KTW': 'KT Wiz',
};

/**
 * NPB Team abbreviations mapping
 */
const NPB_ABBR_MAP: Record<string, string> = {
  'YOM': 'Yomiuri Giants',
  'HAN': 'Hanshin Tigers',
  'CHP': 'Chunichi Dragons',
  'HIR': 'Hiroshima Toyo Carp',
  'SWA': 'Yakult Swallows',
  'YOK': 'Yokohama DeNA BayStars',
  'SBH': 'Fukuoka SoftBank Hawks',
  'ORI': 'Orix Buffaloes',
  'SEI': 'Saitama Seibu Lions',
  'CHI': 'Chiba Lotte Marines',
  'RAK': 'Tohoku Rakuten Golden Eagles',
  'NIP': 'Hokkaido Nippon-Ham Fighters',
  'TIG': 'Hanshin Tigers',
};

/**
 * Get KBO logo by team name or abbreviation
 * Fallback: colored circle with team initials
 */
export function getKBOLogo(teamNameOrAbbr: string): string {
  // Try direct lookup first
  if (KBO_LOGOS[teamNameOrAbbr]) {
    return KBO_LOGOS[teamNameOrAbbr];
  }

  // Try abbreviation mapping
  const fullName = KBO_ABBR_MAP[teamNameOrAbbr];
  if (fullName && KBO_LOGOS[fullName]) {
    return KBO_LOGOS[fullName];
  }

  return `/images/fallback-kbo.png`;
}

/**
 * Get NPB logo by team name or abbreviation
 * Fallback: colored circle with team initials
 */
export function getNPBLogo(teamNameOrAbbr: string): string {
  // Try direct lookup first
  if (NPB_LOGOS[teamNameOrAbbr]) {
    return NPB_LOGOS[teamNameOrAbbr];
  }

  // Try abbreviation mapping
  const fullName = NPB_ABBR_MAP[teamNameOrAbbr];
  if (fullName && NPB_LOGOS[fullName]) {
    return NPB_LOGOS[fullName];
  }

  return `/images/fallback-npb.png`;
}

/**
 * Bookmaker Logos (ANJ-approved operators only)
 * Temporary SVG placeholders - replace with official logos (.png) when available
 * See /public/logos/bookmakers/README.md for instructions
 */
export const BOOKMAKER_LOGOS: Record<string, string> = {
  betclic: '/logos/bookmakers/betclic.svg',
  unibet: '/logos/bookmakers/unibet.svg',
  winamax: '/logos/bookmakers/winamax.svg',
  pmu: '/logos/bookmakers/pmu.svg',
  parionssport: '/logos/bookmakers/parionssport.svg',
};

/**
 * Get bookmaker logo by slug
 * @param slug - Bookmaker slug (betclic, unibet, winamax, pmu, parionssport)
 * @returns Logo URL or fallback
 */
export function getBookmakerLogo(slug: string): string {
  return BOOKMAKER_LOGOS[slug] ?? '/logos/bookmakers/default.svg';
}
