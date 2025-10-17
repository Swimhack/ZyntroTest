// Script to check the COA table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCOASchema() {
    try {
        console.log('🔍 Checking COA table schema...');
        
        // Get a sample COA to see the structure
        const { data: coas, error } = await supabase
            .from('coas')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Error fetching COAs:', error);
            return;
        }
        
        if (coas.length > 0) {
            console.log('📊 COA table structure:');
            const coa = coas[0];
            Object.keys(coa).forEach(key => {
                console.log(`   - ${key}: ${typeof coa[key]} (${coa[key]})`);
            });
        } else {
            console.log('❌ No COAs found in database');
        }
        
    } catch (error) {
        console.error('💥 Schema check error:', error);
    }
}

checkCOASchema();
