-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  discord_id TEXT UNIQUE,
  discord_username TEXT,
  discord_avatar TEXT,
  upload_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT,
  game_name TEXT,
  game_image TEXT,
  categories_json TEXT DEFAULT '[]',
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  is_nexus_team BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  key_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create script_ratings table
CREATE TABLE IF NOT EXISTS script_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(script_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scripts_author_id ON scripts(author_id);
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_game_id ON scripts(game_id);
CREATE INDEX IF NOT EXISTS idx_users_upload_token ON users(upload_token);
CREATE INDEX IF NOT EXISTS idx_script_ratings_script_id ON script_ratings(script_id);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_ratings ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read scripts
CREATE POLICY "Anyone can read scripts" ON scripts
  FOR SELECT USING (true);

-- Users can insert their own scripts
CREATE POLICY "Users can insert own scripts" ON scripts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own scripts
CREATE POLICY "Users can update own scripts" ON scripts
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own scripts
CREATE POLICY "Users can delete own scripts" ON scripts
  FOR DELETE USING (auth.uid() = author_id);

-- Anyone can read script ratings
CREATE POLICY "Anyone can read script ratings" ON script_ratings
  FOR SELECT USING (true);

-- Users can manage their own ratings
CREATE POLICY "Users can manage own ratings" ON script_ratings
  FOR ALL USING (auth.uid() = user_id);
