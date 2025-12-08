import { v } from "convex/values";
import { query } from "./_generated/server";

// Get board analytics
export const getBoardAnalytics = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    const cards = await ctx.db
      .query("cards")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    const activities = await ctx.db
      .query("cardActivities")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    // Calculate basic statistics
    const totalLists = lists.length;
    const totalCards = cards.length;

    // Cards per list
    const cardsPerList: Record<string, { name: string; count: number }> = {};
    lists.forEach((list) => {
      const cardCount = cards.filter((card) => card.listId === list._id).length;
      cardsPerList[list._id] = {
        name: list.title,
        count: cardCount,
      };
    });

    // Activity over last 7 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentActivities = activities.filter((a) => a.timestamp >= sevenDaysAgo);

    // Group activities by day
    const activityByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    recentActivities.forEach((activity) => {
      const daysAgo = Math.floor((now - activity.timestamp) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7) {
        activityByDay[6 - daysAgo]++;
      }
    });

    // Activity by action type
    const activityByAction: Record<string, number> = {
      created: 0,
      moved: 0,
      updated: 0,
      deleted: 0,
    };
    recentActivities.forEach((activity) => {
      if (activityByAction[activity.action] !== undefined) {
        activityByAction[activity.action]++;
      }
    });

    // Top contributors (by activity count)
    const contributorActivity: Record<string, { name: string; count: number }> = {};
    activities.forEach((activity) => {
      if (activity.userId && activity.userName) {
        if (!contributorActivity[activity.userId]) {
          contributorActivity[activity.userId] = {
            name: activity.userName,
            count: 0,
          };
        }
        contributorActivity[activity.userId].count++;
      }
    });

    const topContributors = Object.entries(contributorActivity)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        activityCount: data.count,
      }));

    // Calculate average card lifetime
    const completedCards = cards.filter((card) => {
      // Assuming the last list is "Done" or similar - you can adjust this logic
      const cardList = lists.find((l) => l._id === card.listId);
      return cardList && cardList.order === Math.max(...lists.map((l) => l.order));
    });

    let totalLifetime = 0;
    completedCards.forEach((card) => {
      totalLifetime += card.updatedAt - card.createdAt;
    });

    const avgCardLifetimeDays =
      completedCards.length > 0
        ? totalLifetime / completedCards.length / (24 * 60 * 60 * 1000)
        : 0;

    // Most active list (by card movements)
    const listActivity: Record<string, number> = {};
    activities
      .filter((a) => a.action === "moved")
      .forEach((activity) => {
        const listId = activity.listId;
        listActivity[listId] = (listActivity[listId] || 0) + 1;
      });

    const mostActiveList = Object.entries(listActivity).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const mostActiveListName = mostActiveList
      ? lists.find((l) => l._id === mostActiveList[0])?.title
      : "N/A";

    return {
      totalLists,
      totalCards,
      cardsPerList: Object.values(cardsPerList),
      activityLast7Days: activityByDay,
      activityByAction,
      topContributors,
      avgCardLifetimeDays: Math.round(avgCardLifetimeDays * 10) / 10,
      mostActiveList: mostActiveListName,
      recentActivityCount: recentActivities.length,
      completedCardsCount: completedCards.length,
    };
  },
});

// Get recent activities for a board
export const getRecentActivities = query({
  args: {
    boardId: v.id("boards"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const activities = await ctx.db
      .query("cardActivities")
      .withIndex("by_board_timestamp", (q) => q.eq("boardId", args.boardId))
      .order("desc")
      .take(limit);

    return activities;
  },
});
