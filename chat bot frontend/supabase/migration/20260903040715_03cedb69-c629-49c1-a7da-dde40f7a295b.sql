-- Customers can read and self-provision their own customer record
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own record" ON public.customers
  FOR SELECT TO authenticated USING (customer_id = auth.uid()::text);
CREATE POLICY "Customers create own record" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid()::text);
CREATE POLICY "Customers update own record" ON public.customers
  FOR UPDATE TO authenticated USING (customer_id = auth.uid()::text)
  WITH CHECK (customer_id = auth.uid()::text);

-- Ownership map: which customer owns which conversation
CREATE TABLE public.customer_conversations (
  conversation_id text PRIMARY KEY,
  tenant_id text NOT NULL,
  customer_id text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_activity timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customer_conversations_customer_idx
  ON public.customer_conversations (customer_id, last_activity DESC);

GRANT SELECT, INSERT, UPDATE ON public.customer_conversations TO authenticated;
GRANT SELECT ON public.customer_conversations TO anon;
GRANT ALL ON public.customer_conversations TO service_role;
ALTER TABLE public.customer_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own conversations" ON public.customer_conversations
  FOR SELECT TO authenticated USING (customer_id = auth.uid()::text);
CREATE POLICY "Ops console read" ON public.customer_conversations
  FOR SELECT TO anon USING (true);
CREATE POLICY "Customers create own conversations" ON public.customer_conversations
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid()::text);
CREATE POLICY "Customers update own conversations" ON public.customer_conversations
  FOR UPDATE TO authenticated USING (customer_id = auth.uid()::text)
  WITH CHECK (customer_id = auth.uid()::text);

-- Chat attachments metadata
CREATE TABLE public.conversation_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id text NOT NULL,
  conversation_id text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversation_attachments_conversation_idx
  ON public.conversation_attachments (conversation_id, created_at);

GRANT SELECT, INSERT ON public.conversation_attachments TO authenticated;
GRANT SELECT ON public.conversation_attachments TO anon;
GRANT ALL ON public.conversation_attachments TO service_role;
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own attachments" ON public.conversation_attachments
  FOR SELECT TO authenticated USING (customer_id = auth.uid()::text);
CREATE POLICY "Ops console read attachments" ON public.conversation_attachments
  FOR SELECT TO anon USING (true);
CREATE POLICY "Customers create own attachments" ON public.conversation_attachments
  FOR INSERT TO authenticated WITH CHECK (
    customer_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.customer_conversations cc
      WHERE cc.conversation_id = conversation_attachments.conversation_id
        AND cc.customer_id = auth.uid()::text
    )
  );

-- Signed-in customers must also be able to read their own conversation turns
GRANT SELECT ON public.conversation_turns TO authenticated;
CREATE POLICY "Customers read own turns" ON public.conversation_turns
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.customer_conversations cc
      WHERE cc.conversation_id = conversation_turns.conversation_id
        AND cc.customer_id = auth.uid()::text
    )
  );

-- Signed-in customers can see escalation status for their own conversations
GRANT SELECT ON public.escalation_cases TO authenticated;
CREATE POLICY "Customers read own escalations" ON public.escalation_cases
  FOR SELECT TO authenticated USING (customer_id = auth.uid()::text);