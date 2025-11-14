-- Add trial support to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- Create index for trial queries
CREATE INDEX IF NOT EXISTS subscriptions_trial_end_idx ON subscriptions(trial_end);

