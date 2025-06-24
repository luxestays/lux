import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const ReviewSection = ({ resortId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCanReview, setUserCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserCanReview();
    }
  }, [resortId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles (full_name)
        `)
        .eq('resort_id', resortId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        variant: "destructive",
        title: "Failed to load reviews",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserCanReview = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, check_out_date')
        .eq('resort_id', resortId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .lt('check_out_date', new Date().toISOString())
        .not('id', 'in', `(select booking_id from reviews where user_id = '${user.id}' and resort_id = '${resortId}')`);

      if (error) throw error;
      setUserCanReview(bookings && bookings.length > 0);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleRatingClick = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Review",
        description: "Please provide both a rating and comment.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('resort_id', resortId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .lt('check_out_date', new Date().toISOString())
        .limit(1);

      if (!bookings?.[0]?.id) throw new Error('No eligible booking found');

      const { error } = await supabase
        .from('reviews')
        .insert([{
          resort_id: resortId,
          user_id: user.id,
          booking_id: bookings[0].id,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
        }]);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setNewReview({ rating: 0, comment: '' });
      fetchReviews();
      checkUserCanReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        variant: "destructive",
        title: "Failed to Submit Review",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, interactive = false, onRatingClick = null }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'} 
            ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onRatingClick(star)}
        />
      ))}
    </div>
  );

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">Guest Reviews</h2>

      {userCanReview && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <StarRating rating={newReview.rating} interactive onRatingClick={handleRatingClick} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Your Review</p>
                <Textarea
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleSubmitReview} 
                disabled={submitting || !newReview.rating || !newReview.comment.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{review.user_profiles?.full_name || 'Guest'}</p>
                          <div className="flex items-center mt-1">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <p className="text-foreground/90">{review.comment}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review this resort!</p>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;