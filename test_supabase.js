const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'd:\\Antigravity\\vpxhXAMYTHIEN\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  const insertPayload = {
    title: 'Test RLS',
    slug: 'test-rls',
    category_id: 'an-sinh',
    type: 'news',
    summary: 'Test',
    content: '<p>Test</p>'
  };
  
  const { data, error } = await supabase.from('posts').insert([insertPayload]).select();
  console.log("Insert result:");
  console.log("Error:", error);
  console.log("Data:", data);
})();
