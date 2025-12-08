import { Id } from "@/convex/_generated/dataModel";

export type List = {
  _id: Id<"lists">;
  _creationTime: number;
  boardId: Id<"boards">;
  title: string;
  order: number;
  createdAt: number;
};

export type Card = {
  _id: Id<"cards">;
  _creationTime: number;
  listId: Id<"lists">;
  boardId: Id<"boards">;
  title: string;
  description?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type ListWithCards = List & {
  cards: Card[];
};
