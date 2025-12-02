import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BingoCardProps {
  playerUuid: string;
  roundNumber: number;
  calledImageIds: number[];
  imageCatalog: Array<{
    id: number;
    path: string;
    description: string;
  }>;
}

export function BingoCard({
  playerUuid,
  roundNumber,
  calledImageIds,
  imageCatalog,
}: BingoCardProps) {
  const { data: card, refetch } = trpc.game.getMyCard.useQuery({
    playerUuid,
    roundNumber,
  });

  const markTileMutation = trpc.game.markTile.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleTileClick = (row: number, col: number) => {
    if (!card) return;

    const markedTiles = card.markedTiles as boolean[][];
    if (markedTiles[row][col]) {
      toast.info("Already marked");
      return;
    }

    markTileMutation.mutate({
      playerUuid,
      row,
      col,
    });
  };

  if (!card) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">Loading your bingo card...</p>
      </div>
    );
  }

  const cardData = card.cardData as number[][];
  const markedTiles = card.markedTiles as boolean[][];

  return (
    <div className="glass rounded-2xl p-6 shadow-2xl">
      <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto">
        {cardData.map((row, rowIdx) =>
          row.map((imageId, colIdx) => {
            const isMarked = markedTiles[rowIdx][colIdx];
            const isFree = imageId === -1;
            const image = imageCatalog.find((img) => img.id === imageId);

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleTileClick(rowIdx, colIdx)}
                disabled={isMarked || markTileMutation.isPending}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden transition-all duration-200",
                  "border-2 border-white/40 hover:border-primary/60",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isMarked && "tile-marked",
                  !isMarked && "hover:scale-105 active:scale-95",
                  isMarked && "animate-tile-mark"
                )}
              >
                {isFree ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/40">
                    <span className="text-2xl font-bold text-accent-foreground">
                      FREE
                    </span>
                  </div>
                ) : image ? (
                  <img
                    src={image.path}
                    alt={image.description}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
