const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function uploadPDFsToSupabase() {
    try {
        console.log('🔧 Uploading local PDFs to Supabase storage...');
        
        // Get all COAs from database
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*');
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs to process:\n`);
        
        for (const coa of coas) {
            console.log(`--- Processing COA ${coa.id} ---`);
            console.log(`Current file URL: ${coa.file_url}`);
            
            // Check if this COA needs a PDF uploaded
            if (coa.file_url && coa.file_url.startsWith('/COAs/')) {
                const fileName = coa.file_url.replace('/COAs/', '');
                const localPath = path.join(__dirname, 'COAs', fileName);
                
                console.log(`Looking for local file: ${localPath}`);
                
                // Check if local file exists
                if (fs.existsSync(localPath)) {
                    console.log(`✅ Local file found: ${fileName}`);
                    
                    // Read the file
                    const fileBuffer = fs.readFileSync(localPath);
                    
                    // Upload to Supabase storage
                    const supabasePath = `coa-files/${fileName}`;
                    console.log(`Uploading to Supabase: ${supabasePath}`);
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('coa-files')
                        .upload(supabasePath, fileBuffer, {
                            contentType: 'application/pdf',
                            upsert: true
                        });
                    
                    if (uploadError) {
                        console.error(`❌ Upload error for ${fileName}:`, uploadError);
                        continue;
                    }
                    
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('coa-files')
                        .getPublicUrl(supabasePath);
                    
                    console.log(`✅ Uploaded successfully: ${publicUrl}`);
                    
                    // Update COA record with Supabase URL
                    const { error: updateError } = await supabase
                        .from('coas')
                        .update({
                            file_url: publicUrl,
                            file_name: fileName,
                            file_size: fileBuffer.length,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', coa.id);
                    
                    if (updateError) {
                        console.error(`❌ Database update error for ${coa.id}:`, updateError);
                    } else {
                        console.log(`✅ Database updated for ${coa.id}`);
                    }
                    
                } else {
                    console.log(`❌ Local file not found: ${localPath}`);
                }
            } else if (coa.file_url && coa.file_url.includes('supabase.co')) {
                console.log(`✅ Already using Supabase URL: ${coa.file_url}`);
            } else {
                console.log(`⚠️ No file URL or unknown format: ${coa.file_url}`);
            }
            
            console.log('');
        }
        
        console.log('🎉 PDF upload process completed!');
        
        // Verify final state
        console.log('\n🔍 Verifying final state...');
        const { data: finalCOAs, error: verifyError } = await supabase
            .from('coas')
            .select('id, file_url, file_name');
            
        if (verifyError) throw verifyError;
        
        console.log('📊 Final COA file URLs:');
        finalCOAs.forEach(coa => {
            console.log(`   ${coa.id}: ${coa.file_url}`);
        });
        
    } catch (error) {
        console.error('💥 Error uploading PDFs:', error);
    }
}

uploadPDFsToSupabase();
