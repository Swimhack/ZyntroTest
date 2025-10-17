// Script to fix COA file URLs with correct bucket structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCOAUrlsCorrect() {
    try {
        console.log('🔧 Fixing COA file URLs with correct bucket structure...');
        
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
            
            // Fix the file URL to use the correct bucket structure
            if (coa.file_url && coa.file_url.includes('supabase.co')) {
                // Extract the filename from the current URL
                const currentFileName = coa.file_url.split('/').pop();
                console.log(`🔍 Current filename: ${currentFileName}`);
                
                // Create the correct URL with the subfolder
                newFileUrl = `https://hctdzwmlkgnuxcuhjooe.supabase.co/storage/v1/object/public/coa-files/coa-files/${currentFileName}`;
                needsUpdate = true;
                console.log(`   Old: ${coa.file_url}`);
                console.log(`   New: ${newFileUrl}`);
            } else if (!coa.file_url) {
                // For COAs without file URLs, try to find matching files
                console.log('🔍 Looking for matching files...');
                
                // Get all files in the coa-files subfolder
                const { data: files, error: filesError } = await supabase.storage
                    .from('coa-files')
                    .list('coa-files');
                    
                if (filesError) {
                    console.error('❌ Error listing files:', filesError);
                    continue;
                }
                
                // Look for files that might match this COA
                const matchingFiles = files.filter(file => 
                    file.name.includes(coa.id) || 
                    file.name.includes(coa.client.replace(/\s+/g, '_'))
                );
                
                if (matchingFiles.length > 0) {
                    // Use the most recent file
                    const latestFile = matchingFiles.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    )[0];
                    
                    newFileUrl = `https://hctdzwmlkgnuxcuhjooe.supabase.co/storage/v1/object/public/coa-files/coa-files/${latestFile.name}`;
                    newFileName = latestFile.name;
                    needsUpdate = true;
                    
                    console.log(`✅ Found matching file: ${latestFile.name}`);
                    console.log(`   New URL: ${newFileUrl}`);
                } else {
                    console.log('❌ No matching files found');
                }
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
                    
                    // Test the new URL
                    try {
                        const response = await fetch(newFileUrl);
                        if (response.ok) {
                            console.log('✅ File is accessible via new URL');
                        } else {
                            console.log(`⚠️ File not accessible: ${response.status} ${response.statusText}`);
                        }
                    } catch (error) {
                        console.log(`⚠️ Error testing file: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('\n🎉 COA URL fixing complete!');
        
    } catch (error) {
        console.error('💥 Fix error:', error);
    }
}

fixCOAUrlsCorrect();
