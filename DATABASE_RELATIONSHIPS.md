# Database Relationships - Cambodia Board Jobs

## Entity Relationship Diagram (ERD) Explanation

### Core Entities and Relationships

#### 1. **User Authentication & Profiles**
```
auth.users (Supabase Auth)
    ↓ 1:1
profiles (Base user info)
    ↓ 1:1 (conditional)
    ├── job_seeker_profiles (if role = 'job_seeker')
    └── companies (if role = 'employer')
```

**Details:**
- Every authenticated user has exactly one profile
- Profile role determines if they get a job_seeker_profile or company record
- Cascade delete ensures cleanup when user is deleted

#### 2. **Job Management Flow**
```
companies
    ↓ 1:many
jobs ← many:1 → job_categories
    ↓ 1:many
applications ← many:1 → job_seeker_profiles
```

**Details:**
- One company can post multiple jobs
- Each job belongs to one category (optional)
- One job can receive multiple applications
- One job seeker can apply to multiple jobs (but only once per job)

#### 3. **Subscription & Payment System**
```
companies
    ↓ 1:many
subscriptions
    ↓ 1:many
payments
```

**Details:**
- Companies can have multiple subscription records (history)
- Only one subscription should be active at a time
- Each subscription can have multiple payment records
- Free tier: 1 job post, then subscription required

#### 4. **Notification System**
```
auth.users
    ↓ 1:many
notifications → jobs (optional)
            → applications (optional)
```

**Details:**
- Users receive notifications for various events
- Notifications can reference specific jobs or applications
- Soft references (SET NULL on delete)

#### 5. **Additional Features**
```
job_seeker_profiles
    ↓ many:many
saved_jobs ← many:many → jobs

job_seeker_profiles
    ↓ many:many
company_followers ← many:many → companies
```

**Details:**
- Job seekers can save/bookmark multiple jobs
- Job seekers can follow multiple companies
- Many-to-many relationships with junction tables

## Key Constraints & Business Rules

### 1. **User Roles**
- Enforced by `user_role` enum: 'job_seeker', 'employer', 'admin'
- Role determines which additional profile table gets populated

### 2. **Job Posting Limits**
- Companies get 1 free job post (`free_job_used` flag)
- Additional posts require active subscription
- Tracked via `job_posts_limit` and `job_posts_used` in subscriptions

### 3. **Application Rules**
- One application per job seeker per job (UNIQUE constraint)
- Applications cascade delete with jobs
- Status tracking with timestamps

### 4. **Data Integrity**
- Salary ranges validated (min ≤ max)
- Application deadlines must be future dates
- Subscription date ranges validated
- Payment amounts must be positive

## Indexes for Performance

### High-Traffic Queries
- Job listings by location, type, status
- Applications by job and job seeker
- User notifications (unread first)
- Company job posts

### Search Optimization
- Jobs by category, location, tags
- Full-text search ready (description, title)
- Date-based sorting (newest first)

## Security Considerations

### Row Level Security (RLS)
Recommended RLS policies:
- Users can only see their own profile data
- Companies can only manage their own jobs
- Job seekers can only see their own applications
- Public read access to active job listings

### Sensitive Data
- Resume URLs stored as references (not files)
- Payment data linked to external providers (Stripe)
- Email/contact info in auth.users (Supabase managed)

## Scalability Features

### Partitioning Ready
- Notifications table (by date)
- Applications table (by date)
- Payments table (by date)

### Caching Friendly
- Job view counts (separate from main query)
- Category-based job counts
- Company follower counts

## Migration Strategy

This schema builds on existing:
1. `profiles` table (extended with new columns)
2. `user_role` enum (already created)
3. Supabase auth system

All new tables use proper foreign key constraints and cascade deletes for data consistency.