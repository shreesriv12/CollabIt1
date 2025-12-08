import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
  })
    .index("by_org", ["orgId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["orgId"],
    }),
  userFavourites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    boardId: v.id("boards"),
  })
    .index("by_board", ["boardId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_board", ["userId", "boardId"])
    .index("by_user_board_org", ["userId", "boardId", "orgId"]),
  lists: defineTable({
    boardId: v.id("boards"),
    title: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_board_order", ["boardId", "order"]),
  cards: defineTable({
    listId: v.id("lists"),
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_board", ["boardId"])
    .index("by_list_order", ["listId", "order"]),
  cardActivities: defineTable({
    cardId: v.id("cards"),
    boardId: v.id("boards"),
    listId: v.id("lists"),
    action: v.string(), // "created", "moved", "updated", "deleted"
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_card", ["cardId"])
    .index("by_board", ["boardId"])
    .index("by_board_timestamp", ["boardId", "timestamp"]),
});
