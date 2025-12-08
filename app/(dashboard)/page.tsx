import { auth } from "@clerk/nextjs";
import { BoardList } from "./_components/board-list";
import { EmptyOrg } from "./_components/empty-org";

type DashboardPageProps = {
  searchParams: {
    search?: string;
    favourites?: string;
  };
};

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  const { orgId } = auth();

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-slate-900 dark:to-slate-800">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Your Boards</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {!orgId ? "Select an organization to get started" : "Create and manage your collaborative boards"}
          </p>
        </div>
        
        {!orgId ? (
          <EmptyOrg />
        ) : (
          <BoardList orgId={orgId} query={searchParams} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;