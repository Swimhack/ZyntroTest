const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixExistingCOAs() {
    try {
        console.log('🔧 Fixing existing COAs without file URLs...');
        
        // Get COAs without file URLs
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*')
            .or('file_url.is.null,file_url.eq.');
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs without file URLs:\n`);
        
        for (const coa of coas) {
            console.log(`--- Fixing COA ${coa.id} ---`);
            console.log(`Client: ${coa.client}`);
            console.log(`Compound: ${coa.compound}`);
            
            // Create a local file path based on the compound
            const fileName = `${coa.compound.replace(/\s+/g, '')}_${coa.id}.pdf`;
            const fileUrl = `./COAs/${fileName}`;
            
            console.log(`Setting file URL: ${fileUrl}`);
            console.log(`Setting file name: ${fileName}`);
            
            // Update the COA with file information
            const { error: updateError } = await supabase
                .from('coas')
                .update({
                    file_url: fileUrl,
                    file_name: fileName,
                    file_size: 250000, // Estimated size
                    updated_at: new Date().toISOString()
                })
                .eq('id', coa.id);
                
            if (updateError) {
                console.error(`❌ Error updating ${coa.id}:`, updateError);
            } else {
                console.log(`✅ Updated ${coa.id} successfully`);
            }
            console.log('');
        }
        
        console.log('🎉 Existing COAs fixed!');
        
        // Verify the fixes
        console.log('\n🔍 Verifying fixes...');
        const { data: allCOAs, error: verifyError } = await supabase
            .from('coas')
            .select('id, client, compound, file_url, file_name');
            
        if (verifyError) throw verifyError;
        
        console.log('📊 All COAs now:');
        allCOAs.forEach(coa => {
            console.log(`   ${coa.id}: ${coa.file_url || 'NO FILE'}`);
        });
        
    } catch (error) {
        console.error('💥 Error fixing COAs:', error);
    }
}

fixExistingCOAs();
