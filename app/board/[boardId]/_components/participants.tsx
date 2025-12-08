"use client";

import { connectionIdToColor } from "@/lib/utils";
import { useOthers, useSelf } from "@/liveblocks.config";

import { UserAvatar } from "./user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_SHOWN_OTHER_USERS = 2;

export const Participants = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOWN_OTHER_USERS;

  return (
    <div className="absolute h-12 top-2 right-2 bg-white dark:bg-neutral-800 rounded-lg p-3 flex items-center shadow-lg border border-gray-200 dark:border-neutral-700 z-30">
      <div className="flex gap-x-2">
        {users.slice(0, MAX_SHOWN_OTHER_USERS).map(({ connectionId, info }) => {
          return (
            <UserAvatar
              borderColor={connectionIdToColor(connectionId)}
              key={connectionId}
              src={info?.picture}
              name={info?.name}
              fallback={info?.name?.[0] || "T"}
            />
          );
        })}

        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (You)`}
            fallback={currentUser.info?.name?.[0]}
          />
        )}

        {hasMoreUsers && (
          <UserAvatar
            name={`${users.length - MAX_SHOWN_OTHER_USERS} more`}
            fallback={`+${users.length - MAX_SHOWN_OTHER_USERS}`}
          />
        )}
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div
      className="w-[100px] absolute h-12 top-2 right-2 bg-white dark:bg-neutral-800 rounded-lg p-2 flex items-center shadow-lg border border-gray-200 dark:border-neutral-700 z-30"
      aria-hidden
    >
      <div className="flex -space-x-2">
        <Skeleton className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-800" />
        <Skeleton className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-800" />
        <Skeleton className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-800" />
      </div>
    </div>
  );
};
