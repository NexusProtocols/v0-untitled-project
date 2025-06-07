-- Create gateways table
CREATE TABLE IF NOT EXISTS gateways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  creator_id TEXT,
  creator_name TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  stages JSONB DEFAULT '[]'::jsonb,
  reward JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{"visits": 0, "completions": 0, "conversionRate": 0, "revenue": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gateway_progress table
CREATE TABLE IF NOT EXISTS gateway_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  gateway_id UUID REFERENCES gateways(id) ON DELETE CASCADE,
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, gateway_id)
);

-- Create completed_tasks table
CREATE TABLE IF NOT EXISTS completed_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  gateway_id UUID REFERENCES gateways(id) ON DELETE CASCADE,
  tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, gateway_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gateways_creator_id ON gateways(creator_id);
CREATE INDEX IF NOT EXISTS idx_gateways_is_public ON gateways(is_public);
CREATE INDEX IF NOT EXISTS idx_gateways_created_at ON gateways(created_at);
CREATE INDEX IF NOT EXISTS idx_gateway_progress_user_gateway ON gateway_progress(user_id, gateway_id);
CREATE INDEX IF NOT EXISTS idx_completed_tasks_user_gateway ON completed_tasks(user_id, gateway_id);

-- Enable Row Level Security (optional)
-- ALTER TABLE gateways ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gateway_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (optional - uncomment if you want to enable RLS)
-- CREATE POLICY "Public gateways are viewable by everyone" ON gateways
--   FOR SELECT USING (is_public = true);

-- CREATE POLICY "Users can view their own gateways" ON gateways
--   FOR SELECT USING (creator_id = current_user);

-- CREATE POLICY "Users can create gateways" ON gateways
--   FOR INSERT WITH CHECK (creator_id = current_user);

-- CREATE POLICY "Users can update their own gateways" ON gateways
--   FOR UPDATE USING (creator_id = current_user);

-- CREATE POLICY "Users can delete their own gateways" ON gateways
--   FOR DELETE USING (creator_id = current_user);
