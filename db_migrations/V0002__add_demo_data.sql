-- Insert demo tours
INSERT INTO tours (guide_id, title, city, price, duration, short_description, full_description, image_url, rating, reviews_count, status, instant_booking, telegram_notifications) VALUES
(1, 'Обзорная экскурсия по историческому центру', 'Москва', 2500.00, 180, 'Погрузитесь в историю столицы', 'Увлекательная прогулка по самым известным местам Москвы', 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800', 4.8, 124, 'active', true, true),
(2, 'Ночная прогулка по Питеру', 'Санкт-Петербург', 3000.00, 240, 'Романтика белых ночей', 'Ночная экскурсия по разводным мостам и набережным', 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800', 4.9, 89, 'active', true, true),
(1, 'Гастрономический тур', 'Казань', 3500.00, 240, 'Татарская кухня и традиции', 'Попробуйте лучшие блюда татарской кухни', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 4.7, 56, 'active', false, true);

-- Insert demo bookings
INSERT INTO bookings (tour_id, client_id, guide_id, booking_date, guests_count, total_price, status, client_name, client_telegram) VALUES
(1, 3, 1, '2025-11-10', 2, 5000.00, 'confirmed', 'Елена Иванова', '@elena_travel'),
(2, 4, 2, '2025-11-12', 1, 3000.00, 'pending', 'Михаил Козлов', '@mikhail_k'),
(3, 3, 1, '2025-11-15', 3, 10500.00, 'confirmed', 'Елена Иванова', '@elena_travel');

-- Insert demo chat messages
INSERT INTO chat_messages (booking_id, sender_id, message, is_read) VALUES
(1, 3, 'Здравствуйте! Подскажите, пожалуйста, где встречаемся?', true),
(1, 1, 'Добрый день! Встречаемся у главного входа в Красную площадь', true),
(1, 3, 'Отлично, спасибо! До встречи', false),
(2, 4, 'Здравствуйте! Можно ли перенести экскурсию на один день?', false),
(3, 3, 'Добрый день! Очень жду нашу экскурсию!', false);

-- Insert demo notifications
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
(1, 'booking', 'Новое бронирование', 'Елена Иванова забронировала тур "Обзорная экскурсия"', '/guide', false),
(1, 'message', 'Новое сообщение', 'Здравствуйте! Подскажите, пожалуйста, где встречаемся?', '/guide', true),
(2, 'message', 'Новое сообщение', 'Здравствуйте! Можно ли перенести экскурсию на один день?', '/guide', false),
(3, 'booking', 'Бронирование подтверждено', 'Ваше бронирование тура подтверждено', '/client', true),
(4, 'booking', 'Ожидание подтверждения', 'Ваше бронирование ожидает подтверждения от гида', '/client', false);

-- Insert demo reviews
INSERT INTO reviews (tour_id, booking_id, client_id, rating, comment) VALUES
(1, 1, 3, 5, 'Потрясающая экскурсия! Анна очень интересно рассказывала об истории Москвы. Рекомендую всем!');
