-- Supabase Database Schema for Moodle Exam Simulator

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    language TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    initial_code TEXT,
    expected_output TEXT,
    test_cases TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    solution TEXT,
    execution_time FLOAT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, challenge_id)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_path TEXT,
    storage_path TEXT,
    url TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_policy ON users
    FOR SELECT USING (true);

CREATE POLICY users_insert_policy ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (auth.uid() = id);

-- Challenges table policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY challenges_select_policy ON challenges
    FOR SELECT USING (true);

CREATE POLICY challenges_insert_policy ON challenges
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY challenges_update_policy ON challenges
    FOR UPDATE USING (auth.uid() = created_by);

-- User challenges table policies
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_challenges_select_policy ON user_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_challenges_insert_policy ON user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_challenges_update_policy ON user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- Resources table policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY resources_select_policy ON resources
    FOR SELECT USING (true);

CREATE POLICY resources_insert_policy ON resources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY resources_update_policy ON resources
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
