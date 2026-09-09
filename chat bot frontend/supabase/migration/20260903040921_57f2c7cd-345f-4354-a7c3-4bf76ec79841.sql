-- chat-attachments objects are laid out as {tenant_id}/{customer_id}/{conversation_id}/{file}
CREATE POLICY "Customers upload own chat attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Customers read own chat attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Customers delete own chat attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );