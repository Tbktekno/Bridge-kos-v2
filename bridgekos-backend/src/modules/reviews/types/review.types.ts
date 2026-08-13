export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string | null;
  photo?: string | null;
}

export interface CreateReplyInput {
  comment: string;
}
