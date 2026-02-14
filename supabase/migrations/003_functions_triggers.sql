-- =============================================================================
-- 003: Functions & Triggers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: Auto-update updated_at timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Function: Auto-set completed_at when user_status changes to 'completed'
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_media_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_status = 'completed' AND (OLD.user_status IS NULL OR OLD.user_status != 'completed') THEN
    NEW.completed_at = now();
  ELSIF NEW.user_status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_media_status_change
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_media_completion();

-- Also handle on insert
CREATE TRIGGER on_media_insert_completion
  BEFORE INSERT ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_media_completion();

-- -----------------------------------------------------------------------------
-- Function: Auto-create profile on user signup
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
