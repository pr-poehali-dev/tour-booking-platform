ALTER TABLE t_p71176016_tour_booking_platfor.tours 
ADD COLUMN max_guests INTEGER DEFAULT 8;

UPDATE t_p71176016_tour_booking_platfor.tours 
SET max_guests = 8 
WHERE max_guests IS NULL;