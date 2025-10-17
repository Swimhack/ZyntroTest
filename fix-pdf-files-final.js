const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Map COA IDs to actual file names
const coaFileMap = {
    'ZT-2024-001': 'Zyntro BPC-157.pdf',
    'ZT-2024-002': 'Zyntro MOTS-c COA.pdf', 
    'ZT-2024-003': 'Zyntro PT-141 COA.pdf',
    'ZT-2025-001': 'Zyntro BPC-157.pdf',  // Use existing file
    'ZT-2025-002': 'Zyntro MOTS-c COA.pdf',  // Use existing file
    'ZT-2025-003': 'Zyntro PT-141 COA.pdf'   // Use existing file
};

async function fixPDFFiles() {
    try {
        console.log('🔧 Fixing PDF files and uploading to Supabase...');
        
        // Get all COAs from database
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*');
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs to process:\n`);
        
        for (const coa of coas) {
            console.log(`--- Processing COA ${coa.id} ---`);
            
            // Get the correct file name for this COA
            const correctFileName = coaFileMap[coa.id];
            if (!correctFileName) {
                console.log(`⚠️ No file mapping found for ${coa.id}, skipping`);
                continue;
            }
            
            const localPath = path.join(__dirname, 'COAs', correctFileName);
            console.log(`Using file: ${correctFileName}`);
            console.log(`Local path: ${localPath}`);
            
            // Check if local file exists
            if (!fs.existsSync(localPath)) {
                console.log(`❌ Local file not found: ${localPath}`);
                continue;
            }
            
            console.log(`✅ Local file found: ${correctFileName}`);
            
            // Read the file
            const fileBuffer = fs.readFileSync(localPath);
            console.log(`File size: ${fileBuffer.length} bytes`);
            
            // Upload to Supabase storage
            const supabasePath = `coa-files/${correctFileName}`;
            console.log(`Uploading to Supabase: ${supabasePath}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('coa-files')
                .upload(supabasePath, fileBuffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });
            
            if (uploadError) {
                console.error(`❌ Upload error for ${correctFileName}:`, uploadError);
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
                    file_name: correctFileName,
                    file_size: fileBuffer.length,
                    updated_at: new Date().toISOString()
                })
                .eq('id', coa.id);
            
            if (updateError) {
                console.error(`❌ Database update error for ${coa.id}:`, updateError);
            } else {
                console.log(`✅ Database updated for ${coa.id}`);
                console.log(`   New URL: ${publicUrl}`);
            }
            
            console.log('');
        }
        
        console.log('🎉 PDF files fixed and uploaded!');
        
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
        
        // Test URL accessibility
        console.log('\n🧪 Testing URL accessibility...');
        for (const coa of finalCOAs) {
            if (coa.file_url && coa.file_url.includes('supabase.co')) {
                try {
                    const response = await fetch(coa.file_url, { method: 'HEAD' });
                    if (response.ok) {
                        console.log(`✅ ${coa.id}: URL accessible`);
                    } else {
                        console.error(`❌ ${coa.id}: URL not accessible (${response.status})`);
                    }
                } catch (error) {
                    console.error(`❌ ${coa.id}: Error testing URL: ${error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('💥 Error fixing PDF files:', error);
    }
}

fixPDFFiles();
