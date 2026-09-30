CREATE TABLE IF NOT EXISTS devices (
  id text PRIMARY KEY,
  q_order int[] NOT NULL,
  mcq_index int NOT NULL DEFAULT 0,
  break_done int NOT NULL DEFAULT 0,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS answers (
  device_id text NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  q_id int NOT NULL,
  choice smallint NOT NULL,
  correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, q_id)
);
