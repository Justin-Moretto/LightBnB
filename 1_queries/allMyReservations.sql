SELECT properties.*, reservations.*, avg(rating) as average_rating
FROM reservations
JOIN properties ON properties.id = reservations.property_id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.end_date < now()::date
AND reservations.guest_id = 1
GROUP BY property_id.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;