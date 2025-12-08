import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all lists for a board
export const get = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .order("asc")
      .collect();

    return lists.sort((a, b) => a.order - b.order);
  },
});

// Create a new list
export const create = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current max order
    const existingLists = await ctx.db
      .query("lists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    const maxOrder = existingLists.length > 0 
      ? Math.max(...existingLists.map(l => l.order))
      : -1;

    const listId = await ctx.db.insert("lists", {
      boardId: args.boardId,
      title: args.title,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return listId;
  },
});

// Update list title
export const update = mutation({
  args: {
    id: v.id("lists"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, title } = args;

    await ctx.db.patch(id, {
      title,
    });

    return id;
  },
});

// Delete a list and all its cards
export const remove = mutation({
  args: { id: v.id("lists") },
  handler: async (ctx, args) => {
    // Delete all cards in this list
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_list", (q) => q.eq("listId", args.id))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    // Delete the list
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Reorder lists
export const reorder = mutation({
  args: {
    boardId: v.id("boards"),
    listOrders: v.array(v.object({
      id: v.id("lists"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const { id, order } of args.listOrders) {
      await ctx.db.patch(id, { order });
    }
  },
});
