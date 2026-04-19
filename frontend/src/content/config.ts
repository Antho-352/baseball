import { defineCollection, z } from 'astro:content';

/**
 * Bookmakers Content Collection Schema
 * Source: src/content/bookmakers/*.md
 */
const bookmakersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    slug: z.string().optional(),
    name: z.string(),
    rank: z.number(),
    globalRating: z.number(),
    bonusHeadline: z.string(),
    bonusCode: z.string().optional(),
    bonusType: z.string(),
    bonusMinDeposit: z.number().nullable(),
    bonusWagering: z.string(),
    bonusValidityDays: z.number().nullable().optional(),
    anjLicenseSport: z.string(),
    anjLicensePoker: z.string().optional(),
    anjLicenseHippique: z.string().optional(),
    anjLicenseDate: z.string(),
    companyNumber: z.string(),
    address: z.string(),
    supportEmail: z.string(),
    supportPhone: z.string(),
    supportHours: z.string(),
    liveChat: z.boolean(),
    minDeposit: z.number(),
    minBet: z.number(),
    appIosRating: z.union([z.number(), z.string()]),
    appIosReviews: z.union([z.number(), z.string()]),
    appAndroidRating: z.union([z.number(), z.string()]),
    appAndroidReviews: z.union([z.number(), z.string()]),
    ratings: z.object({
      live: z.number(),
      mobile: z.number(),
      diversity: z.number(),
      website: z.number(),
      odds: z.number(),
      payments: z.number(),
      support: z.number(),
      reputation: z.number(),
      bonus: z.number(),
    }),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    paymentMethods: z.array(
      z.object({
        method: z.string(),
        min: z.number(),
        max: z.number(),
        fees: z.string(),
        delay: z.string(),
      })
    ),
    trjBySport: z.record(
      z.object({
        min: z.number(),
        max: z.number(),
      })
    ).optional(),
    sportsOffered: z.array(z.string()),
    lotoFoot: z.boolean(),
    combined: z.boolean(),
    cashOut: z.boolean(),
    cashOutAuto: z.boolean(),
    cashOutPartial: z.boolean(),
    esport: z.boolean(),
    liveOdds: z.boolean(),
    boostedOdds: z.boolean(),
    liveStreaming: z.boolean(),
    poker: z.boolean(),
    publishedAt: z.string(),
    updatedAt: z.string(),
    author: z.string(),
    relatedArticles: z.array(
      z.object({
        label: z.string(),
        slug: z.string(),
      })
    ),
  }),
});

/**
 * Articles/News Content Collection Schema
 * Source: src/content/articles/*.md
 */
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Baseball FR'),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.enum(['news', 'analysis', 'history', 'transfers', 'injuries']),
    league: z.enum(['mlb', 'kbo', 'npb', 'all']).optional(),
    featuredImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedArticles: z.array(z.string()).optional(),
  }),
});

export const collections = {
  bookmakers: bookmakersCollection,
  articles: articlesCollection,
};
