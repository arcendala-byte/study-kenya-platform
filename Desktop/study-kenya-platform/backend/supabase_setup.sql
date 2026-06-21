-- ============================================================
-- STUDYKENYA PLATFORM — COMPLETE DATABASE SETUP
-- Paste this ENTIRE script into the Supabase SQL Editor and Run.
-- URL: https://supabase.com/dashboard/project/ydiwlcqvlwvfvmhubfrh/sql/new
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: ADMINS
-- Stores admin login credentials for the dashboard
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,   -- bcrypt hash
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

-- RLS: Allow anon key to read (backend does bcrypt check server-side)
-- Allow anon key to insert (for first-run seeding from Express)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select" ON admins;
DROP POLICY IF EXISTS "admins_insert" ON admins;
DROP POLICY IF EXISTS "admins_update" ON admins;
DROP POLICY IF EXISTS "admins_delete" ON admins;

CREATE POLICY "admins_select" ON admins FOR SELECT USING (true);
CREATE POLICY "admins_insert" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "admins_update" ON admins FOR UPDATE USING (true);
CREATE POLICY "admins_delete" ON admins FOR DELETE USING (true);


-- ============================================================
-- TABLE 2: UNIVERSITIES
-- Stores all university listings shown on the platform
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    location     TEXT,
    type         TEXT,            -- 'Public' | 'Private' | 'TVET'
    description  TEXT,
    programs     TEXT[],          -- e.g. ['Engineering', 'Medicine']
    courses      TEXT[],          -- specific courses
    requirements TEXT[],          -- admission requirements
    fees         TEXT,            -- display string e.g. "$1,500 - $3,000 / year"
    tuition      JSONB,           -- { "usd": "3000", "local": "390,000 KES" }
    categories   TEXT[],          -- filter tags e.g. ['Public', 'Technology']
    image        TEXT,            -- cover image URL
    website      TEXT,            -- official website URL
    featured     BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities (slug);
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities (type);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "universities_select" ON universities;
DROP POLICY IF EXISTS "universities_insert" ON universities;
DROP POLICY IF EXISTS "universities_update" ON universities;
DROP POLICY IF EXISTS "universities_delete" ON universities;

CREATE POLICY "universities_select" ON universities FOR SELECT USING (true);
CREATE POLICY "universities_insert" ON universities FOR INSERT WITH CHECK (true);
CREATE POLICY "universities_update" ON universities FOR UPDATE USING (true);
CREATE POLICY "universities_delete" ON universities FOR DELETE USING (true);


-- ============================================================
-- TABLE 3: BLOG_POSTS
-- Stores blog articles, guides and news
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT NOT NULL,
    slug       TEXT UNIQUE NOT NULL,
    content    TEXT NOT NULL,
    image      TEXT,              -- cover image URL
    author     TEXT DEFAULT 'Admin',
    tags       TEXT[],            -- e.g. ['Visa', 'Guide', 'Scholarship']
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete" ON blog_posts;

CREATE POLICY "blog_posts_select" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "blog_posts_insert" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_posts_update" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "blog_posts_delete" ON blog_posts FOR DELETE USING (true);


-- ============================================================
-- TABLE 4: INQUIRIES
-- Stores contact form submissions from students
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    message    TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;
DROP POLICY IF EXISTS "inquiries_delete" ON inquiries;

CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (true);
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (true);
CREATE POLICY "inquiries_delete" ON inquiries FOR DELETE USING (true);


-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin Account
-- Email: admin@studykenya.com
-- Password: password123
INSERT INTO admins (email, password)
VALUES (
    'admin@studykenya.com',
    '$2b$10$LdP4LePR/vKKXE1JFCIqAuZC1pM13RY7fXDWh2WuvOEsnXIsGKaTe'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Universities
INSERT INTO universities (name, slug, location, type, description, fees, categories, image, website, programs)
VALUES
(
    'Strathmore University',
    'strathmore-university',
    'Nairobi',
    'Private',
    'Strathmore University is one of Kenya''s strongest private universities for business, technology, law, data, and professional studies. Its Nairobi campus is known for disciplined academic culture and strong industry links.',
    '$3,000 - $5,000 / year',
    ARRAY['Private', 'Business', 'Technology', 'Law'],
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
    'https://strathmore.edu',
    ARRAY['Bachelor of Business Information Technology', 'Bachelor of Commerce', 'Bachelor of Laws (LLB)', 'Data Science and Analytics']
),
(
    'United States International University - Africa',
    'usiu-africa',
    'Nairobi',
    'Private',
    'USIU-Africa offers a highly international campus experience with American-style academic structures and a diverse student body.',
    '$2,800 - $5,500 / year',
    ARRAY['Private', 'International', 'Business', 'Social Sciences'],
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    'https://www.usiu.ac.ke',
    ARRAY['International Relations', 'Psychology', 'Business Administration', 'Journalism and Communication']
),
(
    'University of Nairobi',
    'university-of-nairobi',
    'Nairobi',
    'Public',
    'Kenya''s oldest and most recognized public university, with a wide academic footprint across medicine, engineering, law, architecture, and business.',
    '$1,500 - $3,800 / year',
    ARRAY['Public', 'Medicine', 'Engineering', 'Law'],
    'https://images.unsplash.com/photo-1562774053-701939374585',
    'https://www.uonbi.ac.ke',
    ARRAY['Medicine and Surgery', 'Civil Engineering', 'Architecture', 'Law', 'Computer Science']
),
(
    'Kenyatta University',
    'kenyatta-university',
    'Nairobi',
    'Public',
    'A large public research university with strong schools in education, health sciences, creative arts, business, and public policy.',
    '$1,400 - $3,200 / year',
    ARRAY['Public', 'Education', 'Health', 'Creative Arts'],
    'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc',
    'https://www.ku.ac.ke',
    ARRAY['Education', 'Public Health', 'Fine Art and Design', 'Business Management']
),
(
    'Mount Kenya University',
    'mount-kenya-university',
    'Thika',
    'Private',
    'One of Kenya''s largest private universities, popular for accessible tuition, flexible study modes, and a broad set of professional programs.',
    '$1,200 - $3,000 / year',
    ARRAY['Private', 'Health', 'Education', 'Business'],
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952',
    'https://www.mku.ac.ke',
    ARRAY['Clinical Medicine', 'Nursing', 'Education', 'Business Management', 'Information Technology']
),
(
    'Daystar University',
    'daystar-university',
    'Athi River',
    'Private',
    'A leading private university known for communication, media, journalism and community development programs.',
    '$2,000 - $4,000 / year',
    ARRAY['Private', 'Media', 'Communication', 'Christian'],
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846',
    'https://www.daystar.ac.ke',
    ARRAY['Journalism and Mass Communication', 'Community Development', 'Business Administration', 'Education']
),
(
    'JKUAT',
    'jkuat',
    'Juja',
    'Public',
    'Jomo Kenyatta University of Agriculture and Technology — a leading public university specializing in technology, engineering, and agriculture.',
    '$1,600 - $3,500 / year',
    ARRAY['Public', 'Technology', 'Engineering', 'Agriculture'],
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    'https://www.jkuat.ac.ke',
    ARRAY['Mechatronics Engineering', 'Computer Science', 'Food Science', 'Architecture and Building Sciences']
),
(
    'Moi University',
    'moi-university',
    'Eldoret',
    'Public',
    'A comprehensive public university offering diverse programs including medicine, journalism, and technology in Eldoret.',
    '$1,500 - $3,200 / year',
    ARRAY['Public', 'Medicine', 'Technology'],
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    'https://www.mu.ac.ke',
    ARRAY['Medicine and Surgery', 'Journalism and Media Studies', 'Computer Science', 'Law']
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Blog Posts
INSERT INTO blog_posts (title, slug, content, image, author, tags)
VALUES
(
    'How to Get a Student Visa for Kenya in 2026',
    'student-visa-kenya-2026',
    'The student visa application process for Kenya is fully digitized. This guide covers all the steps international students need to follow, from collecting documents to the final approval.',
    'https://images.unsplash.com/photo-1544717305-2782549b5136',
    'Admin',
    ARRAY['Visa', 'Guide', 'Immigration']
),
(
    'Top 5 Reasons to Study in Kenya',
    'top-5-reasons-study-in-kenya',
    'Kenya offers world-class universities, affordable tuition, a vibrant culture, and English-language instruction. Discover why thousands of international students choose Kenya every year.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'Admin',
    ARRAY['Guide', 'Lifestyle', 'Education']
),
(
    'Cost of Living in Nairobi as a Student',
    'cost-of-living-nairobi-student',
    'Nairobi is one of East Africa''s most dynamic cities. Learn how to budget for accommodation, food, transport, and entertainment as an international student.',
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437',
    'Admin',
    ARRAY['Cost of Living', 'Nairobi', 'Budget']
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE! Your database is ready.
-- Admin login: admin@studykenya.com / password123
-- ============================================================
