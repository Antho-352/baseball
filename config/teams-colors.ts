/**
 * Couleurs officielles des équipes
 *
 * Source: Sites officiels des ligues et équipes
 * Date: 2026-04-14
 *
 * Format: { primary: '#HEX', secondary: '#HEX' }
 * - primary: Couleur principale (dominant brand color)
 * - secondary: Couleur secondaire/accent
 *
 * Note: Ne modifier ce fichier que si une franchise change officiellement ses couleurs.
 */

export interface TeamColors {
  primary: string;
  secondary: string;
}

export const TEAM_COLORS: Record<string, TeamColors> = {
  // ============================================================
  // MLB - AMERICAN LEAGUE EAST
  // ============================================================
  'mlb-bal': { primary: '#DF4601', secondary: '#000000' }, // Baltimore Orioles
  'mlb-bos': { primary: '#BD3039', secondary: '#0C2340' }, // Boston Red Sox
  'mlb-nya': { primary: '#003087', secondary: '#E4002B' }, // New York Yankees
  'mlb-tba': { primary: '#092C5C', secondary: '#8FBCE6' }, // Tampa Bay Rays
  'mlb-tor': { primary: '#134A8E', secondary: '#1D2D5C' }, // Toronto Blue Jays

  // ============================================================
  // MLB - AMERICAN LEAGUE CENTRAL
  // ============================================================
  'mlb-cha': { primary: '#27251F', secondary: '#C4CED4' }, // Chicago White Sox
  'mlb-cle': { primary: '#0C2340', secondary: '#E31937' }, // Cleveland Guardians
  'mlb-det': { primary: '#0C2340', secondary: '#FA4616' }, // Detroit Tigers
  'mlb-kca': { primary: '#004687', secondary: '#BD9B60' }, // Kansas City Royals
  'mlb-min': { primary: '#002B5C', secondary: '#D31145' }, // Minnesota Twins

  // ============================================================
  // MLB - AMERICAN LEAGUE WEST
  // ============================================================
  'mlb-hou': { primary: '#002D62', secondary: '#EB6E1F' }, // Houston Astros
  'mlb-ana': { primary: '#BA0021', secondary: '#003263' }, // Los Angeles Angels
  'mlb-oak': { primary: '#003831', secondary: '#EFB21E' }, // Oakland Athletics
  'mlb-sea': { primary: '#0C2C56', secondary: '#005C5C' }, // Seattle Mariners
  'mlb-tex': { primary: '#003278', secondary: '#C0111F' }, // Texas Rangers

  // ============================================================
  // MLB - NATIONAL LEAGUE EAST
  // ============================================================
  'mlb-atl': { primary: '#CE1141', secondary: '#13274F' }, // Atlanta Braves
  'mlb-mia': { primary: '#00A3E0', secondary: '#EF3340' }, // Miami Marlins
  'mlb-nyn': { primary: '#002D72', secondary: '#FF5910' }, // New York Mets
  'mlb-phi': { primary: '#E81828', secondary: '#002D72' }, // Philadelphia Phillies
  'mlb-was': { primary: '#AB0003', secondary: '#14225A' }, // Washington Nationals

  // ============================================================
  // MLB - NATIONAL LEAGUE CENTRAL
  // ============================================================
  'mlb-chn': { primary: '#0E3386', secondary: '#CC3433' }, // Chicago Cubs
  'mlb-cin': { primary: '#C6011F', secondary: '#000000' }, // Cincinnati Reds
  'mlb-mil': { primary: '#12284B', secondary: '#FFC52F' }, // Milwaukee Brewers
  'mlb-pit': { primary: '#27251F', secondary: '#FDB827' }, // Pittsburgh Pirates
  'mlb-sln': { primary: '#C41E3A', secondary: '#0C2340' }, // St. Louis Cardinals

  // ============================================================
  // MLB - NATIONAL LEAGUE WEST
  // ============================================================
  'mlb-ari': { primary: '#A71930', secondary: '#E3D4AD' }, // Arizona Diamondbacks
  'mlb-col': { primary: '#33006F', secondary: '#C4CED4' }, // Colorado Rockies
  'mlb-lan': { primary: '#005A9C', secondary: '#EF3E42' }, // Los Angeles Dodgers
  'mlb-sdn': { primary: '#2F241D', secondary: '#FFC425' }, // San Diego Padres
  'mlb-sfn': { primary: '#FD5A1E', secondary: '#27251F' }, // San Francisco Giants

  // ============================================================
  // KBO - KOREAN BASEBALL ORGANIZATION
  // ============================================================
  'kbo-doosan': { primary: '#131230', secondary: '#ED1C24' },      // Doosan Bears
  'kbo-hanwha': { primary: '#FF6600', secondary: '#000000' },      // Hanwha Eagles
  'kbo-kia': { primary: '#EA0029', secondary: '#000000' },         // KIA Tigers
  'kbo-kiwoom': { primary: '#570514', secondary: '#000000' },      // Kiwoom Heroes
  'kbo-kt': { primary: '#000000', secondary: '#ED1C24' },          // KT Wiz
  'kbo-lg': { primary: '#C30452', secondary: '#000000' },          // LG Twins
  'kbo-lotte': { primary: '#041E42', secondary: '#D00F31' },       // Lotte Giants
  'kbo-nc': { primary: '#315288', secondary: '#C4A24A' },          // NC Dinos
  'kbo-samsung': { primary: '#074CA1', secondary: '#000000' },     // Samsung Lions
  'kbo-ssg': { primary: '#CE0E2D', secondary: '#000000' },         // SSG Landers

  // ============================================================
  // NPB - CENTRAL LEAGUE
  // ============================================================
  'npb-chunichi': { primary: '#002D62', secondary: '#FFFFFF' },    // Chunichi Dragons
  'npb-hanshin': { primary: '#FFE201', secondary: '#000000' },     // Hanshin Tigers
  'npb-hiroshima': { primary: '#FF0000', secondary: '#FFFFFF' },   // Hiroshima Toyo Carp
  'npb-yokohama': { primary: '#003087', secondary: '#FFFFFF' },    // Yokohama DeNA BayStars
  'npb-yomiuri': { primary: '#F56500', secondary: '#000000' },     // Yomiuri Giants
  'npb-yakult': { primary: '#00843D', secondary: '#FFFFFF' },      // Tokyo Yakult Swallows

  // ============================================================
  // NPB - PACIFIC LEAGUE
  // ============================================================
  'npb-chiba': { primary: '#000000', secondary: '#C8102E' },       // Chiba Lotte Marines
  'npb-fukuoka': { primary: '#FFE500', secondary: '#000000' },     // Fukuoka SoftBank Hawks
  'npb-hokkaido': { primary: '#003087', secondary: '#FFFFFF' },    // Hokkaido Nippon-Ham Fighters
  'npb-orix': { primary: '#0F1B2B', secondary: '#B59A57' },        // Orix Buffaloes
  'npb-rakuten': { primary: '#8B0304', secondary: '#B4975A' },     // Tohoku Rakuten Golden Eagles
  'npb-seibu': { primary: '#0050A0', secondary: '#FFFFFF' },       // Saitama Seibu Lions
};

/**
 * Récupère les couleurs d'une équipe
 * @param teamId - ID de l'équipe (ex: 'mlb-nya', 'kbo-doosan')
 * @returns Couleurs primary/secondary ou couleurs par défaut si introuvable
 */
export function getTeamColors(teamId: string): TeamColors {
  return TEAM_COLORS[teamId] || { primary: '#000000', secondary: '#FFFFFF' };
}

/**
 * Génère un gradient CSS pour les backgrounds d'équipe
 * @param teamId - ID de l'équipe
 * @returns String CSS gradient
 */
export function getTeamGradient(teamId: string): string {
  const colors = getTeamColors(teamId);
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
}

/**
 * Vérifie si une couleur est "claire" (pour contraste texte)
 * @param hexColor - Couleur hex (ex: '#FFFFFF')
 * @returns true si la couleur est claire
 */
export function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

/**
 * Retourne la couleur de texte optimale (noir ou blanc) pour un background
 * @param bgColor - Couleur de background (hex)
 * @returns '#000000' ou '#FFFFFF'
 */
export function getContrastTextColor(bgColor: string): string {
  return isLightColor(bgColor) ? '#000000' : '#FFFFFF';
}

/**
 * Export de toutes les équipes par ligue (utile pour génération pages)
 */
export const TEAMS_BY_LEAGUE = {
  mlb: [
    'mlb-bal', 'mlb-bos', 'mlb-nya', 'mlb-tba', 'mlb-tor',
    'mlb-cha', 'mlb-cle', 'mlb-det', 'mlb-kca', 'mlb-min',
    'mlb-hou', 'mlb-ana', 'mlb-oak', 'mlb-sea', 'mlb-tex',
    'mlb-atl', 'mlb-mia', 'mlb-nyn', 'mlb-phi', 'mlb-was',
    'mlb-chn', 'mlb-cin', 'mlb-mil', 'mlb-pit', 'mlb-sln',
    'mlb-ari', 'mlb-col', 'mlb-lan', 'mlb-sdn', 'mlb-sfn',
  ],
  kbo: [
    'kbo-doosan', 'kbo-hanwha', 'kbo-kia', 'kbo-kiwoom', 'kbo-kt',
    'kbo-lg', 'kbo-lotte', 'kbo-nc', 'kbo-samsung', 'kbo-ssg',
  ],
  npb: [
    'npb-chunichi', 'npb-hanshin', 'npb-hiroshima', 'npb-yokohama', 'npb-yomiuri', 'npb-yakult',
    'npb-chiba', 'npb-fukuoka', 'npb-hokkaido', 'npb-orix', 'npb-rakuten', 'npb-seibu',
  ],
} as const;

/**
 * Nombre total d'équipes par ligue
 */
export const TEAMS_COUNT = {
  mlb: 30,
  kbo: 10,
  npb: 12,
} as const;
