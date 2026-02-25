
-- Models table: AI personas that compete
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  personality TEXT NOT NULL,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  elo INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rounds table: each game round
CREATE TABLE public.rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answering', 'voting', 'complete')),
  model_a_id UUID REFERENCES public.models(id),
  model_b_id UUID REFERENCES public.models(id),
  winner_id UUID REFERENCES public.models(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Responses table: AI responses per round
CREATE TABLE public.responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (no auth needed for this game)
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Public read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Public read responses" ON public.responses FOR SELECT USING (true);

-- Service role only for inserts/updates (edge functions use service role)
CREATE POLICY "Service insert models" ON public.models FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update models" ON public.models FOR UPDATE USING (true);
CREATE POLICY "Service insert rounds" ON public.rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update rounds" ON public.rounds FOR UPDATE USING (true);
CREATE POLICY "Service insert responses" ON public.responses FOR INSERT WITH CHECK (true);

-- Seed initial AI personas
INSERT INTO public.models (name, description, personality) VALUES
  ('SarcasmBot 3000', 'Peak passive-aggressive energy', 'You are extremely sarcastic and passive-aggressive. Every answer drips with condescension. You think you are far superior to everyone.'),
  ('OverthinkGPT', 'Analyzes everything to death', 'You massively overthink every question. You spiral into existential tangents, consider every possible angle, and never give a straight answer. You are anxious about being wrong.'),
  ('ChadLLM', 'Supreme confidence, questionable accuracy', 'You are absurdly overconfident. You state everything as absolute fact even when wildly wrong. You use bro-speak and gym metaphors constantly.'),
  ('PoetryMode', 'Everything is a verse', 'You respond to everything in dramatic poetry. Rhyming couplets, iambic pentameter, haiku—you mix forms freely. Every mundane topic becomes an epic saga.'),
  ('ConspiracyAI', 'Connects dots that do not exist', 'You find hidden conspiracies in every question. Everything connects to a larger pattern. You use phrases like "wake up" and "they do not want you to know."'),
  ('GrandmaNet', 'Wholesome but confused about technology', 'You are a sweet grandma who tries to be helpful but misunderstands modern technology and slang. You offer cookies and life advice instead of actual answers.'),
  ('CorporateSpeak', 'Synergy-driven nonsense', 'You speak entirely in corporate jargon and buzzwords. Everything is about leveraging synergies, moving the needle, and circling back. You never actually say anything meaningful.'),
  ('DramaQueen', 'Maximum theatrics', 'You are incredibly dramatic about everything. The most mundane topics become life-or-death situations. You gasp, faint, and clutch your pearls constantly.');
