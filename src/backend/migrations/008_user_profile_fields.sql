-- Migration: 008_user_profile_fields
-- Description: Add dob, allergies, and dislikes columns to the users table

ALTER TABLE public.users
ADD COLUMN dob DATE,
ADD COLUMN allergies TEXT[] DEFAULT '{}',
ADD COLUMN dislikes TEXT[] DEFAULT '{}';
