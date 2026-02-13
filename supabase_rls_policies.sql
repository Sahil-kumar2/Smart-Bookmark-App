-- ============================================
-- SmartMark Bookmark Manager
-- Row Level Security (RLS) Policies
-- ============================================
-- 
-- CRITICAL: Run this SQL in your Supabase SQL Editor
-- to enable proper security and data privacy
--
-- This ensures users can ONLY access their own bookmarks
-- ============================================

-- Step 1: Enable Row Level Security on bookmarks table
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy for SELECT (viewing bookmarks)
-- Users can only view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Step 3: Create policy for INSERT (adding bookmarks)
-- Users can only insert bookmarks with their own user_id
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Create policy for DELETE (removing bookmarks)
-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create policy for UPDATE (editing bookmarks)
-- Users can only update their own bookmarks
CREATE POLICY "Users can update own bookmarks"
  ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify RLS is working:

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookmarks';
-- Should return: rowsecurity = true

-- 2. List all policies on bookmarks table
SELECT * 
FROM pg_policies 
WHERE tablename = 'bookmarks';
-- Should return 4 policies

-- ============================================
-- Testing RLS
-- ============================================
-- After enabling RLS, test by:
-- 1. Login as User A
-- 2. Try to query all bookmarks (should only see User A's)
-- 3. Login as User B in another browser
-- 4. Verify User B cannot see User A's bookmarks
-- ============================================
