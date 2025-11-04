-- Добавление полей для профилей гидов и клиентов
ALTER TABLE t_p71176016_tour_booking_platfor.users
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notifications BOOLEAN DEFAULT false;

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_city ON t_p71176016_tour_booking_platfor.users(city);
CREATE INDEX IF NOT EXISTS idx_users_role ON t_p71176016_tour_booking_platfor.users(role);