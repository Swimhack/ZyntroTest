// Script to fix COA file URLs in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCOAUrls() {
    try {
        console.log('🔧 Fixing COA file URLs...');
        
        // Get all COAs
        const { data: coas, error } = await supabase
            .from('coas')
            .select('*');
            
        if (error) {
            console.error('❌ Database error:', error);
            return;
        }
        
        console.log(`📊 Found ${coas.length} COAs to process:`);
        
        for (const coa of coas) {
            console.log(`\n--- Processing COA ${coa.id} ---`);
            
            let needsUpdate = false;
            let newFileUrl = coa.file_url;
            let newFileName = coa.file_name;
            
            // Fix double path issue
            if (coa.file_url && coa.file_url.includes('coa-files/coa-files/')) {
                console.log('🔧 Fixing double path in file URL...');
                newFileUrl = coa.file_url.replace('coa-files/coa-files/', 'coa-files/');
                needsUpdate = true;
                console.log(`   Old: ${coa.file_url}`);
                console.log(`   New: ${newFileUrl}`);
            }
            
            // Check if file exists in storage
            if (newFileUrl && newFileUrl.includes('supabase.co')) {
                const fileName = newFileUrl.split('/').pop();
                console.log(`🔍 Checking if file exists: ${fileName}`);
                
                const { data: fileData, error: fileError } = await supabase.storage
                    .from('coa-files')
                    .list('', {
                        search: fileName
                    });
                    
                if (fileError) {
                    console.log(`❌ Error checking file: ${fileError.message}`);
                } else if (fileData.length === 0) {
                    console.log(`⚠️ File not found in storage: ${fileName}`);
                    // Try to find the file with a different name
                    const { data: allFiles } = await supabase.storage
                        .from('coa-files')
                        .list();
                        
                    console.log('📁 Available files:');
                    allFiles.forEach(file => {
                        console.log(`   - ${file.name}`);
                    });
                } else {
                    console.log(`✅ File found in storage: ${fileName}`);
                }
            }
            
            // For COAs without file URLs, we need to either:
            // 1. Find existing PDFs in the COAs folder
            // 2. Create placeholder entries
            if (!coa.file_url) {
                console.log('❌ No file URL - needs manual attention');
                
                // Try to find a matching PDF in the local COAs folder
                const possibleNames = [
                    `${coa.id}.pdf`,
                    `${coa.client.replace(/\s+/g, '_')}.pdf`,
                    `${coa.client.replace(/\s+/g, '_')}_${coa.id}.pdf`
                ];
                
                console.log('🔍 Looking for possible local files:');
                possibleNames.forEach(name => {
                    console.log(`   - ${name}`);
                });
            }
            
            // Update the COA if needed
            if (needsUpdate) {
                console.log('💾 Updating COA...');
                const { error: updateError } = await supabase
                    .from('coas')
                    .update({
                        file_url: newFileUrl,
                        file_name: newFileName
                    })
                    .eq('id', coa.id);
                    
                if (updateError) {
                    console.error(`❌ Error updating COA: ${updateError.message}`);
                } else {
                    console.log('✅ COA updated successfully');
                }
            }
        }
        
        console.log('\n🎉 COA URL fixing complete!');
        
    } catch (error) {
        console.error('💥 Fix error:', error);
    }
}

fixCOAUrls();
