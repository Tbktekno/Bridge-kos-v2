import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { RatingStars } from '@/components/common/rating-stars';
import { useMyReviews } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/app';

export function TenantReviewsPage() {
  const { data: reviews, isLoading, isError, error, refetch } = useMyReviews();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Saya"
        description="Ulasan yang pernah Anda tulis untuk kos."
        actions={
          <Button asChild variant="outline">
            <Link to={ROUTES.search}>
              <Star className="mr-1.5 h-4 w-4" /> Tulis Review Baru
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat review..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState
          title="Belum ada review"
          description="Setelah booking selesai, Anda bisa menulis ulasan untuk kos tersebut."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RatingStars value={review.rating} size={14} showValue />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                {review.boardingHouse && (
                  <Link
                    to={`/kos/${review.boardingHouse.id}`}
                    className="mt-3 block text-sm font-medium hover:text-primary"
                  >
                    {review.boardingHouse.name}
                  </Link>
                )}
                {review.content && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                )}
                {review.reply && (
                  <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                    <span className="font-semibold">Balasan pemilik:</span> {review.reply.content}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}