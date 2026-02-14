-- =============================================================================
-- 002: Create All Tables with RLS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: profiles
-- Purpose: Store user profile, preferences, and encrypted API keys
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{
    "theme": "light",
    "language": "en",
    "default_view": "grid"
  }'::jsonb,
  ai_selected_model text DEFAULT 'gemini-2.5-flash'
    CHECK (ai_selected_model IN (
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-pro'
    )),
  ai_credentials_encrypted text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Table: media_items
-- Purpose: Store all media entries (books, comics, movies, games, music)
-- -----------------------------------------------------------------------------
CREATE TABLE media_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('movie', 'book', 'comic', 'game', 'music')),
  origin text CHECK (origin IN ('vn', 'cn', 'jp', 'kr', 'us', 'uk', 'eu', 'other')),
  pub_status text CHECK (pub_status IN ('planning', 'ongoing', 'completed', 'dropped')),
  user_status text CHECK (user_status IN ('planning', 'ongoing', 'completed', 'dropped')),
  author text,
  release_year integer CHECK (release_year >= 1000 AND release_year <= 9999),
  rating numeric(3,1) CHECK (rating >= 0 AND rating <= 10),
  tags text[] DEFAULT '{}',
  urls jsonb DEFAULT '[]'::jsonb,
  notes text,
  cover_image_url text,
  embedding vector(768),
  content_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media" ON media_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON media_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media" ON media_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON media_items
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_media_user_id ON media_items(user_id);
CREATE INDEX idx_media_type ON media_items(type);
CREATE INDEX idx_media_user_status ON media_items(user_status);
CREATE INDEX idx_media_tags ON media_items USING GIN(tags);
CREATE INDEX idx_media_title_search ON media_items USING GIN(title gin_trgm_ops);
CREATE INDEX idx_media_updated ON media_items(updated_at DESC);

-- HNSW index for vector similarity search
CREATE INDEX idx_media_embedding ON media_items
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- -----------------------------------------------------------------------------
-- Table: collections
-- Purpose: User-defined collections for organizing media
-- -----------------------------------------------------------------------------
CREATE TABLE collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#EF4444',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_collections_user_id ON collections(user_id);

-- -----------------------------------------------------------------------------
-- Table: collection_media
-- Purpose: Many-to-many relationship between collections and media items
-- -----------------------------------------------------------------------------
CREATE TABLE collection_media (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  media_item_id uuid REFERENCES media_items(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, media_item_id)
);

ALTER TABLE collection_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collection_media" ON collection_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own collection_media" ON collection_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own collection_media" ON collection_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Table: conversations
-- Purpose: AI chat conversation metadata
-- -----------------------------------------------------------------------------
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- -----------------------------------------------------------------------------
-- Table: messages
-- Purpose: Individual messages within AI conversations
-- -----------------------------------------------------------------------------
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at ASC);
