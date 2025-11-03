-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'guide', 'admin')),
    avatar_url TEXT,
    telegram VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tours table
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    guide_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    short_description TEXT,
    full_description TEXT,
    image_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'moderation', 'active', 'inactive')),
    instant_booking BOOLEAN DEFAULT false,
    telegram_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tour_dates table
CREATE TABLE tour_dates (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    date DATE NOT NULL,
    available_slots INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tour_id, date)
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    client_id INTEGER REFERENCES users(id),
    guide_id INTEGER REFERENCES users(id),
    booking_date DATE NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    client_name VARCHAR(255),
    client_telegram VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    sender_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'message', 'review', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id),
    booking_id INTEGER REFERENCES bookings(id),
    client_id INTEGER REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tours_guide_id ON tours(guide_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_guide_id ON bookings(guide_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);

-- Insert demo users
INSERT INTO users (name, email, role, avatar_url, telegram) VALUES
('Анна Смирнова', 'anna@example.com', 'guide', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna', '@anna_guide'),
('Дмитрий Петров', 'dmitry@example.com', 'guide', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry', '@dmitry_tours'),
('Елена Иванова', 'elena@example.com', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', '@elena_travel'),
('Михаил Козлов', 'mikhail@example.com', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikhail', '@mikhail_k');
