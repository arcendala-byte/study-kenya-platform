const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate credentials
const isPlaceholder = (val) => !val || val.includes('your-project-ref') || val.includes('your-anon') || val.includes('your-service-role');

if (!SUPABASE_URL || !SUPABASE_KEY || isPlaceholder(SUPABASE_URL) || isPlaceholder(SUPABASE_KEY)) {
  console.warn('⚠️  Supabase credentials not configured. Running in mock mode — set real SUPABASE_URL and SUPABASE_KEY in backend/.env to enable database access.');
  
  // Export a safe mock with chainable methods
  const makeError = () => ({ data: null, error: new Error('Supabase not configured — add real credentials to backend/.env') });

  const mockQuery = () => {
    const q = {
      eq: () => q,
      neq: () => q,
      order: () => q,
      limit: () => q,
      single: async () => makeError(),
      then: (resolve) => Promise.resolve(makeError()).then(resolve),
    };
    return q;
  };

  const mockFrom = () => ({
    select: () => mockQuery(),
    insert: async () => makeError(),
    update: () => ({ eq: async () => makeError() }),
    delete: () => ({ neq: async () => makeError(), eq: async () => makeError() }),
  });

  // Export as a function for mock
  module.exports = { from: mockFrom };
} else {
  console.log('✅ Supabase client initialized with real credentials');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  module.exports = supabase;
}