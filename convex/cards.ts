import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all cards for a list
export const getByList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .order("asc")
      .collect();

    return cards.sort((a, b) => a.order - b.order);
  },
});

// Get all cards for a board
export const getByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    return cards;
  },
});

// Get a single card
export const get = query({
  args: { id: v.id("cards") },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.id);
    return card;
  },
});

// Create a new card
export const create = mutation({
  args: {
    listId: v.id("lists"),
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current max order for this list
    const existingCards = await ctx.db
      .query("cards")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    const maxOrder = existingCards.length > 0 
      ? Math.max(...existingCards.map(c => c.order))
      : -1;

    const now = Date.now();
    const cardId = await ctx.db.insert("cards", {
      listId: args.listId,
      boardId: args.boardId,
      title: args.title,
      description: args.description,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    // Track activity
    await ctx.db.insert("cardActivities", {
      cardId,
      boardId: args.boardId,
      listId: args.listId,
      action: "created",
      timestamp: now,
    });

    return cardId;
  },
});

// Update a card
export const update = mutation({
  args: {
    id: v.id("cards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, title, description } = args;
    
    const card = await ctx.db.get(id);
    if (!card) return id;

    const now = Date.now();
    const updates: any = {
      updatedAt: now,
    };

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    await ctx.db.patch(id, updates);

    // Track activity
    await ctx.db.insert("cardActivities", {
      cardId: id,
      boardId: card.boardId,
      listId: card.listId,
      action: "updated",
      timestamp: now,
    });

    return id;
  },
});

// Delete a card
export const remove = mutation({
  args: { id: v.id("cards") },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.id);
    if (!card) return args.id;

    const now = Date.now();

    // Track activity before deletion
    await ctx.db.insert("cardActivities", {
      cardId: args.id,
      boardId: card.boardId,
      listId: card.listId,
      action: "deleted",
      timestamp: now,
    });

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Move card to different list or reorder within same list
export const move = mutation({
  args: {
    cardId: v.id("cards"),
    newListId: v.id("lists"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) return args.cardId;

    const now = Date.now();
    const oldListId = card.listId;

    await ctx.db.patch(args.cardId, {
      listId: args.newListId,
      order: args.newOrder,
      updatedAt: now,
    });

    // Track activity if moved to a different list
    if (oldListId !== args.newListId) {
      await ctx.db.insert("cardActivities", {
        cardId: args.cardId,
        boardId: card.boardId,
        listId: args.newListId,
        action: "moved",
        timestamp: now,
        metadata: { fromListId: oldListId },
      });
    }

    return args.cardId;
  },
});

// Reorder cards within a list
export const reorder = mutation({
  args: {
    listId: v.id("lists"),
    cardOrders: v.array(v.object({
      id: v.id("cards"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const { id, order } of args.cardOrders) {
      await ctx.db.patch(id, { 
        order,
        updatedAt: now,
      });
    }
  },
});
