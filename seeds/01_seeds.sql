

INSERT INTO users (name, email, password)
VALUES ('Justin Moretto', 'JustinMoretto@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Tatiana Kalantzis', 'Tatiana@Kalantzis.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Dana Moretto', 'Dana@Moretto.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u');

INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
VALUES (1, 'big house', 'description', 'fakeurl', 'fakeurl', 600, 3, 1, 2, 'Canada', '1st street', 'montreal', 'qc', 'h8p2s2', true),
(2, 'red house', 'description', 'fakeurl', 'fakeurl', 650, 3, 2, 3, 'Canada', '2nd street', 'montreal', 'qc', 'h8p3s3', true),
(3, 'lil apartment', 'description', 'fakeurl', 'fakeurl', 450, 0, 1, 2, 'Canada',' 23rd street', 'montreal', 'qc', 'g5p3s3', true);

INSERT INTO reservations (guest_id, property_id, start_date, end_date) 
VALUES (1, 1, '2018-09-11', '2018-09-26'),
(2, 2, '2019-01-04', '2019-02-01'),
(3, 3, '2021-10-01', '2021-10-14');

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message)
VALUES (1, 1, 1, 3, 'message'),
(2, 3, 2, 4, 'message'),
(3, 2, 1, 5, 'message');