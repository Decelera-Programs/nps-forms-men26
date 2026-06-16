import express from 'express';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// "Who are you?" question ID per form
const WHO_ARE_YOU_ID = {
  vLykWXJdX8us: 't7Vu', // Portfolio Satisfaction
  xm6f42GHesus: 'x5nD', // EM's Satisfaction
  '6bwBL2945Lus': 't7Vu', // VC's Satisfaction
  hanR7Z1i6wus: 't7Vu',  // Founder's Satisfaction
};

const KNOWN_FORM_IDS = new Set(Object.keys(WHO_ARE_YOU_ID));

app.post('/webhook/nps', async (req, res) => {
  try {
    const { formId, formName, submission } = req.body;

    if (!formId || !submission) {
      return res.status(400).json({ error: 'Missing formId or submission' });
    }

    if (!KNOWN_FORM_IDS.has(formId)) {
      return res.status(400).json({ error: `Unknown formId: ${formId}` });
    }

    const { submissionId, submissionTime, questions } = submission;
    const whoId = WHO_ARE_YOU_ID[formId];

    const whoQuestion = questions.find(q => q.id === whoId);
    const personName = whoQuestion?.value;

    if (!personName) {
      return res.status(400).json({ error: 'Missing "Who are you?" answer' });
    }

    // Build answers map (skip "Who are you?" and unanswered questions)
    const answers = {};
    for (const q of questions) {
      if (q.id === whoId || q.value === null || q.value === undefined) continue;
      answers[q.id] = { type: q.type, value: q.value, question: q.name };
    }

    const npsData = {
      form_id: formId,
      form_name: formName,
      submission_id: submissionId,
      submitted_at: submissionTime,
      answers,
    };

    // Find person by name (case-insensitive)
    const { data: persons, error: findError } = await supabase
      .from('Person')
      .select('id, full_name')
      .ilike('full_name', personName)
      .limit(1);

    if (findError) throw findError;

    if (!persons || persons.length === 0) {
      console.warn(`Person not found: "${personName}" (form: ${formName})`);
      return res.status(404).json({ error: `Person not found: ${personName}` });
    }

    const person = persons[0];

    const { error: updateError } = await supabase
      .from('Person')
      .update({ nps_forms: npsData })
      .eq('id', person.id);

    if (updateError) throw updateError;

    console.log(`NPS saved — ${person.full_name} | ${formName} | ${submissionId}`);
    res.json({ success: true, person: person.full_name });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NPS webhook listening on port ${PORT}`));
