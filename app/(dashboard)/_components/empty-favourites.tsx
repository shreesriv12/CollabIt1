import Image from "next/image";

export const EmptyFavourites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="animate-pulse">
        <Image src="/empty-favourites.svg" alt="Empty" height={140} width={140} />
      </div>
      <h2 className="text-2xl font-bold mt-6 text-gray-900 dark:text-white">No favourite boards.</h2>

      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
        Try favouriting a board.
      </p>
    </div>
  );
};
