# Kanban Board Feature - Implementation Guide

## Overview
A complete Trello-style Lists + Cards system has been implemented in CollabIT, allowing users to switch between the Canvas whiteboard view and a Kanban board view.

## ✅ Implemented Features

### 1. Database Schema (Convex)
- **Lists Table**: Stores board columns with title, order, and board reference
- **Cards Table**: Stores task cards with title, description, order, and list reference
- Proper indexing for fast queries by board and list
- Automatic ordering system for drag-and-drop

### 2. CRUD Operations
**Lists API** (`convex/lists.ts`):
- `get` - Get all lists for a board
- `create` - Create a new list
- `update` - Update list title
- `remove` - Delete list and all its cards
- `reorder` - Reorder lists

**Cards API** (`convex/cards.ts`):
- `getByList` - Get all cards in a list
- `getByBoard` - Get all cards on a board
- `get` - Get a single card
- `create` - Create a new card
- `update` - Update card title and description
- `remove` - Delete a card
- `move` - Move card to different list
- `reorder` - Reorder cards within a list

### 3. User Interface Components

**KanbanBoard** (`app/board/[boardId]/_components/kanban/kanban-board.tsx`):
- Main board container with horizontal scroll
- Drag-and-drop context provider
- "Add a list" button
- Real-time active users indicator
- DragOverlay for smooth dragging

**List** (`app/board/[boardId]/_components/kanban/list.tsx`):
- List header with editable title
- Cards container with vertical scroll
- "Add a card" button
- List actions menu (edit, delete)
- Drop zone for cards

**Card** (`app/board/[boardId]/_components/kanban/card.tsx`):
- Card display with title and description
- Double-click to edit
- Inline editing with save/cancel
- Card actions menu (edit, delete)
- Draggable with visual feedback

**BoardView** (`app/board/[boardId]/_components/board-view.tsx`):
- View mode toggle (Canvas ⇄ Kanban)
- Seamless switching between views
- Persists within same board session

### 4. Drag and Drop
Using **@dnd-kit** library:
- Drag cards within the same list (reorder)
- Drag cards between different lists (move)
- Visual feedback during drag (opacity, cursor)
- Smooth animations
- Touch-friendly (8px activation threshold)

### 5. Real-time Collaboration
- **Convex**: Automatic real-time sync for all list/card operations
- **Liveblocks**: Shows active users count in Kanban view
- Optimistic updates for instant UI feedback
- Conflict-free collaborative editing

## 📁 File Structure

```
convex/
  ├── schema.ts           # Database schema with lists and cards tables
  ├── lists.ts            # Lists CRUD operations
  └── cards.ts            # Cards CRUD operations

app/board/[boardId]/
  ├── page.tsx            # Updated to use BoardView
  └── _components/
      ├── board-view.tsx  # View mode switcher
      └── kanban/
          ├── index.tsx
          ├── kanban-board.tsx
          ├── list.tsx
          └── card.tsx

types/
  └── kanban.ts           # TypeScript types for List and Card
```

## 🚀 How to Use

### For Users:
1. Open any board
2. Click the **Kanban icon** in the top-right to switch to Kanban view
3. Click **"Add a list"** to create columns
4. Click **"Add a card"** within a list to create tasks
5. **Drag cards** between lists or reorder within a list
6. **Double-click a card** to edit title and description
7. Use the **menu (⋮)** to delete lists or cards
8. Click the **Layout icon** to switch back to Canvas view

### For Developers:
```bash
# Install dependencies (already done)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Push schema to Convex
npx convex dev

# Start development server
npm run dev
```

## 🔧 API Usage Examples

### Creating a List
```typescript
const createList = useMutation(api.lists.create);
await createList({
  boardId: "board_id_here",
  title: "To Do"
});
```

### Creating a Card
```typescript
const createCard = useMutation(api.cards.create);
await createCard({
  listId: "list_id_here",
  boardId: "board_id_here",
  title: "Task title",
  description: "Task description"
});
```

### Moving a Card
```typescript
const moveCard = useMutation(api.cards.move);
await moveCard({
  cardId: "card_id_here",
  newListId: "new_list_id_here",
  newOrder: 0
});
```

## 🎨 Styling
- Uses **Tailwind CSS** for consistent styling
- **shadcn/ui** components for buttons, inputs, menus
- Responsive design with horizontal scroll
- Light theme with subtle shadows and hover effects

## ⚡ Performance
- **Indexed queries** for fast data retrieval
- **Optimistic updates** for instant UI feedback
- **Lazy loading** of card details
- **Efficient re-rendering** with React memoization

## 🔒 Data Flow
1. User performs action (create, update, delete, move)
2. Mutation sent to Convex
3. Convex updates database
4. All connected clients receive real-time update via subscription
5. UI automatically re-renders with new data

## 🐛 Known Limitations
- No labels/tags on cards yet (planned)
- No file attachments yet (planned)
- No comments on cards yet (planned)
- No board analytics yet (planned)
- No JSON export for Kanban boards yet (planned)

## 🎯 Next Steps (To Match Problem Statement)
1. **Comments System**: Add threaded comments to cards
2. **Card Labels**: Color-coded tags for categorization
3. **Attachments**: File upload support for cards
4. **Full-text Search**: Search within cards and lists
5. **Board Analytics**: Usage stats and activity tracking
6. **Export as JSON**: Download board structure

## 📝 Testing Checklist
- [x] Create a new list
- [x] Create cards in a list
- [x] Edit list title
- [x] Edit card title and description
- [x] Drag card within same list
- [x] Drag card to different list
- [x] Delete a card
- [x] Delete a list (with cards)
- [x] Switch between Canvas and Kanban views
- [x] Multiple users see real-time updates
- [x] Active users indicator works

## 🎓 Technical Decisions

**Why @dnd-kit over react-beautiful-dnd?**
- More modern and actively maintained
- Better TypeScript support
- More flexible and lightweight
- Better touch device support

**Why Convex over separate backend?**
- Real-time by default
- No need to manage WebSocket connections
- Automatic conflict resolution
- Simpler deployment

**Why not Liveblocks for Kanban state?**
- Convex already provides real-time sync
- Liveblocks used for presence (active users)
- Avoids redundant state management
- Simpler architecture

## 🔗 Related Files
- Main board page: `app/board/[boardId]/page.tsx`
- Canvas view: `app/board/[boardId]/_components/canvas.tsx`
- Info bar: `app/board/[boardId]/_components/info.tsx`
- Room wrapper: `components/room.tsx`
