// Script to add demo COAs with correct file URLs for testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addDemoCOAs() {
    try {
        console.log('🔧 Adding demo COAs for testing...');
        
        // Check if demo COAs already exist
        const { data: existingCOAs, error: checkError } = await supabase
            .from('coas')
            .select('id')
            .in('id', ['ZT-2024-001', 'ZT-2024-002', 'ZT-2024-003']);
            
        if (checkError) {
            console.error('❌ Error checking existing COAs:', checkError);
            return;
        }
        
        const existingIds = existingCOAs.map(coa => coa.id);
        console.log(`📊 Existing demo COAs: ${existingIds.join(', ')}`);
        
        // Demo COAs with local file paths (from the COAs folder)
        const demoCOAs = [
            {
                id: 'ZT-2024-001',
                client: 'ZyntroTest Demo',
                product: 'BPC-157 Peptide',
                type: 'peptide',
                file_url: './COAs/Zyntro BPC-157.pdf',
                file_name: 'Zyntro BPC-157.pdf',
                created_at: new Date().toISOString()
            },
            {
                id: 'ZT-2024-002', 
                client: 'ZyntroTest Demo',
                product: 'MOTS-c Peptide',
                type: 'peptide',
                file_url: './COAs/Zyntro MOTS-c COA.pdf',
                file_name: 'Zyntro MOTS-c COA.pdf',
                created_at: new Date().toISOString()
            },
            {
                id: 'ZT-2024-003',
                client: 'ZyntroTest Demo', 
                product: 'PT-141 Peptide',
                type: 'peptide',
                file_url: './COAs/Zyntro PT-141 COA.pdf',
                file_name: 'Zyntro PT-141 COA.pdf',
                created_at: new Date().toISOString()
            }
        ];
        
        for (const coa of demoCOAs) {
            if (existingIds.includes(coa.id)) {
                console.log(`⏭️ Skipping ${coa.id} - already exists`);
                continue;
            }
            
            console.log(`➕ Adding demo COA: ${coa.id}`);
            
            const { error: insertError } = await supabase
                .from('coas')
                .insert(coa);
                
            if (insertError) {
                console.error(`❌ Error inserting ${coa.id}:`, insertError);
            } else {
                console.log(`✅ Demo COA ${coa.id} added successfully`);
            }
        }
        
        console.log('\n🎉 Demo COAs setup complete!');
        
    } catch (error) {
        console.error('💥 Demo COAs error:', error);
    }
}

addDemoCOAs();
