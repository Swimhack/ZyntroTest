const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAllCOAs() {
    try {
        console.log('🔍 Checking all COAs in database...');
        
        const { data: coas, error } = await supabase
            .from('coas')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        console.log(`📊 Found ${coas.length} COAs total:\n`);
        
        coas.forEach((coa, i) => {
            console.log(`--- COA ${i + 1} ---`);
            console.log(`ID: ${coa.id}`);
            console.log(`Client: ${coa.client}`);
            console.log(`Compound: ${coa.compound}`);
            console.log(`File URL: ${coa.file_url || 'NOT SET'}`);
            console.log(`File Name: ${coa.file_name || 'NOT SET'}`);
            console.log(`Created: ${coa.created_at}`);
            console.log('');
        });
        
        // Check if we have any COAs with file URLs
        const coasWithFiles = coas.filter(coa => coa.file_url);
        console.log(`📁 COAs with file URLs: ${coasWithFiles.length}`);
        
        if (coasWithFiles.length > 0) {
            console.log('\n✅ COAs with files:');
            coasWithFiles.forEach(coa => {
                console.log(`   - ${coa.id}: ${coa.file_url}`);
            });
        } else {
            console.log('\n❌ No COAs have file URLs set');
        }
        
    } catch (error) {
        console.error('💥 Error checking COAs:', error);
    }
}

checkAllCOAs();
