-- Insert default sequence for new workspaces
-- This should be called when a workspace is created

-- Function to create default sequence
CREATE OR REPLACE FUNCTION create_default_sequence(p_workspace_id UUID)
RETURNS UUID AS $$
DECLARE
  v_sequence_id UUID;
BEGIN
  -- Create the default sequence
  INSERT INTO sequences (workspace_id, name, is_default, is_active)
  VALUES (p_workspace_id, 'Städ-offert uppföljning', true, true)
  RETURNING id INTO v_sequence_id;
  
  -- Create step 1 (day 2)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_days, subject_template, body_template)
  VALUES (
    v_sequence_id,
    1,
    2,
    'Uppföljning: Din offertförfrågan',
    E'Hej {namn},\n\nJag ville följa upp din förfrågan om {tjänst}. Har du haft möjlighet att titta på informationen?\n\nJag hjälper gärna till om du har några frågor!\n\n{signatur}'
  );
  
  -- Create step 2 (day 5)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_days, subject_template, body_template)
  VALUES (
    v_sequence_id,
    2,
    5,
    'Fortfarande intresserad av {tjänst}?',
    E'Hej {namn},\n\nJag hoppas att allt är bra! Jag tänkte höra om du fortfarande är intresserad av {tjänst}?\n\nVi har just nu lite lediga tider och skulle kunna erbjuda en snabb start.\n\n{signatur}'
  );
  
  -- Create step 3 (day 9)
  INSERT INTO sequence_steps (sequence_id, step_number, delay_days, subject_template, body_template)
  VALUES (
    v_sequence_id,
    3,
    9,
    'Sista uppföljningen angående {tjänst}',
    E'Hej {namn},\n\nDetta är min sista uppföljning angående din förfrågan om {tjänst}.\n\nOm du fortfarande är intresserad är du varmt välkommen att höra av dig, annars önskar jag dig lycka till!\n\n{signatur}'
  );
  
  RETURN v_sequence_id;
END;
$$ LANGUAGE plpgsql;
