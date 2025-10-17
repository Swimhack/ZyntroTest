const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCOAPaths() {
    try {
        console.log('🔧 Fixing COA file paths for proper display...');
        
        // Get all COAs
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*');
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs to fix:\n`);
        
        for (const coa of coas) {
            console.log(`--- Fixing COA ${coa.id} ---`);
            console.log(`Current file URL: ${coa.file_url}`);
            
            let newFileUrl = coa.file_url;
            let newFileName = coa.file_name;
            
            // Fix the file paths to be accessible from the web interface
            if (coa.file_url && coa.file_url.startsWith('./COAs/')) {
                // Convert local path to web-accessible path
                newFileUrl = coa.file_url.replace('./COAs/', '/COAs/');
                console.log(`   Converting to web path: ${newFileUrl}`);
            } else if (!coa.file_url) {
                // Create a proper local path for COAs without URLs
                const fileName = `${coa.compound.replace(/\s+/g, '')}_${coa.id}.pdf`;
                newFileUrl = `/COAs/${fileName}`;
                newFileName = fileName;
                console.log(`   Creating new path: ${newFileUrl}`);
            }
            
            // Update the COA
            const { error: updateError } = await supabase
                .from('coas')
                .update({
                    file_url: newFileUrl,
                    file_name: newFileName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', coa.id);
                
            if (updateError) {
                console.error(`❌ Error updating ${coa.id}:`, updateError);
            } else {
                console.log(`✅ Updated ${coa.id} successfully`);
                console.log(`   New URL: ${newFileUrl}`);
            }
            console.log('');
        }
        
        console.log('🎉 COA paths fixed!');
        
        // Verify the fixes
        console.log('\n🔍 Verifying fixes...');
        const { data: allCOAs, error: verifyError } = await supabase
            .from('coas')
            .select('id, client, compound, file_url, file_name');
            
        if (verifyError) throw verifyError;
        
        console.log('📊 All COAs with corrected paths:');
        allCOAs.forEach(coa => {
            console.log(`   ${coa.id}: ${coa.file_url}`);
        });
        
    } catch (error) {
        console.error('💥 Error fixing COA paths:', error);
    }
}

fixCOAPaths();
