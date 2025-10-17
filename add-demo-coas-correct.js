// Script to add demo COAs with correct schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addDemoCOAsCorrect() {
    try {
        console.log('🔧 Adding demo COAs with correct schema...');
        
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
                compound: 'BPC-157',
                analysis_type: 'Peptide Analysis',
                test_date: '2024-01-15',
                status: 'Complete',
                purity: '99.2%',
                result: { 'Purity': '99.2%', 'Impurities': '<0.1%' },
                notes: 'High purity BPC-157 peptide analysis',
                file_url: './COAs/Zyntro BPC-157.pdf',
                file_name: 'Zyntro BPC-157.pdf',
                file_size: 265618,
                created_by: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'ZT-2024-002', 
                client: 'ZyntroTest Demo',
                compound: 'MOTS-c',
                analysis_type: 'Peptide Analysis',
                test_date: '2024-01-20',
                status: 'Complete',
                purity: '98.8%',
                result: { 'Purity': '98.8%', 'Impurities': '<0.2%' },
                notes: 'MOTS-c peptide purity analysis',
                file_url: './COAs/Zyntro MOTS-c COA.pdf',
                file_name: 'Zyntro MOTS-c COA.pdf',
                file_size: 262622,
                created_by: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'ZT-2024-003',
                client: 'ZyntroTest Demo', 
                compound: 'PT-141',
                analysis_type: 'Peptide Analysis',
                test_date: '2024-01-25',
                status: 'Complete',
                purity: '99.5%',
                result: { 'Purity': '99.5%', 'Impurities': '<0.1%' },
                notes: 'PT-141 peptide analysis with full characterization',
                file_url: './COAs/Zyntro PT-141 COA.pdf',
                file_name: 'Zyntro PT-141 COA.pdf',
                file_size: 251367,
                created_by: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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

addDemoCOAsCorrect();
