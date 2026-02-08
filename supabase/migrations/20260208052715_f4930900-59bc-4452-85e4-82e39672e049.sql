-- Create dreams table
CREATE TABLE public.dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  event TEXT,
  mood_x INT,
  mood_y INT,
  analysis_summary TEXT,
  analysis_symbols TEXT,
  analysis_emotion TEXT,
  analysis_advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dreams table
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a dream
CREATE OR REPLACE FUNCTION public.is_owner_of_dream(dream_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dreams
    WHERE id = dream_id AND user_id = auth.uid()
  )
$$;

-- RLS policies for dreams table
CREATE POLICY "Users can select their own dreams"
  ON public.dreams
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dreams"
  ON public.dreams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
  ON public.dreams
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
  ON public.dreams
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_dreams_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dreams_timestamp
BEFORE UPDATE ON public.dreams
FOR EACH ROW
EXECUTE FUNCTION public.update_dreams_updated_at();

-- Create index for faster queries on user_id
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_dreams_created_at ON public.dreams(created_at DESC);
