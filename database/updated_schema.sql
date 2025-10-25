-- Complete Job Board Database Schema for Cambodia Board Jobs
-- AUTO-GENERATED IDs:
-- - profiles.id, user_id, companies.profile_id, job_seeker_profiles.profile_id = UUID (auto-generated)
-- - All other table IDs = BIGSERIAL (auto-incrementing integers starting from 1)

-- Drop existing tables and types (run this first to clean up)
DROP TABLE IF EXISTS company_followers CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS job_categories CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS job_seeker_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'remote', 'hybrid');
CREATE TYPE job_status AS ENUM ('active', 'expired', 'draft', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE notification_type AS ENUM ('application_received', 'application_status_updated', 'job_posted', 'subscription_reminder', 'system');

-- Create profiles table (UUID auto-generated for id and user_id)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'job_seeker',
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    experience_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job seeker specific fields (id auto-increments, profile_id is UUID FK)
CREATE TABLE job_seeker_profiles (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT,
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    skills TEXT[],
    job_preferences TEXT[],
    availability_date DATE,
    is_actively_seeking BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table (id auto-increments, profile_id is UUID FK)
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    industry TEXT,
    company_size TEXT,
    founding_year INTEGER,
    headquarters TEXT,
    company_website TEXT,
    linkedin_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    free_job_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_founding_year CHECK (founding_year > 1800 AND founding_year <= EXTRACT(YEAR FROM NOW()))
);

-- Job categories table (id auto-increments)
CREATE TABLE job_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (id auto-increments, company_id and category_id are INTEGER FKs)
create table public.jobs (
  id bigserial not null,
  company_id bigint not null,
  category_id bigint null,
  title text not null,
  description text not null,
  requirements jsonb null,
  benefits jsonb null,
  location text null,
  is_remote boolean null default false,
  job_type public.job_type not null default 'full_time'::job_type,
  experience_level text null,
  salary_min integer null,
  salary_max integer null,
  salary_currency text null default 'USD'::text,
  application_deadline date null,
  status public.job_status null default 'active'::job_status,
  view_count integer null default 0,
  application_count integer null default 0,
  featured boolean null default false,
  tags text[] null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint jobs_pkey primary key (id),
  constraint jobs_category_id_fkey foreign KEY (category_id) references job_categories (id),
  constraint jobs_company_id_fkey foreign KEY (company_id) references companies (id) on delete CASCADE,
  constraint valid_application_deadline check (
    (
      (application_deadline is null)
      or (application_deadline >= CURRENT_DATE)
    )
  ),
  constraint valid_salary_range check (
    (
      (salary_min is null)
      or (salary_max is null)
      or (salary_min <= salary_max)
    )
  )
);


-- Applications table (id auto-increments, job_id and job_seeker_id are INTEGER FKs)
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_seeker_id BIGINT NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    custom_resume_url TEXT,
    status application_status DEFAULT 'pending',
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    status_updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, job_seeker_id)
);

-- Subscriptions table (id auto-increments, company_id is INTEGER FK)
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_type subscription_plan NOT NULL DEFAULT 'free',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    job_posts_limit INTEGER DEFAULT 1,
    job_posts_used INTEGER DEFAULT 0,
    featured_jobs_limit INTEGER DEFAULT 0,
    featured_jobs_used INTEGER DEFAULT 0,
    price_paid DECIMAL(10,2),
    payment_status payment_status DEFAULT 'completed',
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT valid_usage_limits CHECK (job_posts_used <= job_posts_limit AND featured_jobs_used <= featured_jobs_limit)
);

-- Payments table (id auto-increments, subscription_id is INTEGER FK)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    receipt_url TEXT,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Notifications table (id auto-increments, user_id is UUID FK, related IDs are INTEGER FKs)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    related_job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    related_application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Saved jobs table (id auto-increments, both FKs are INTEGER)
CREATE TABLE saved_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_seeker_id BIGINT NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_seeker_id, job_id)
);

-- Company followers table (id auto-increments, both FKs are INTEGER)
CREATE TABLE company_followers (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_seeker_id BIGINT NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, job_seeker_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_companies_profile_id ON companies(profile_id);
CREATE INDEX idx_job_seeker_profiles_profile_id ON job_seeker_profiles(profile_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_saved_jobs_job_seeker_id ON saved_jobs(job_seeker_id);
CREATE INDEX idx_company_followers_company_id ON company_followers(company_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_profiles_updated_at BEFORE UPDATE ON job_seeker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update application counts on jobs
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET application_count = application_count - 1 WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_application_count_trigger
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Function to automatically update application status timestamp
CREATE OR REPLACE FUNCTION update_application_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_updated_at = NOW();
        IF NEW.status != 'pending' AND OLD.status = 'pending' THEN
            NEW.reviewed_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_status_timestamp_trigger
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_application_status_timestamp();
