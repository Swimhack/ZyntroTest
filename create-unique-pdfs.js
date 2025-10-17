const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Map of base files to use as templates for each compound type
const baseFileMap = {
    'BPC-157': 'Zyntro BPC-157.pdf',
    'MOTS-c': 'Zyntro MOTS-c COA.pdf',
    'PT-141': 'Zyntro PT-141 COA.pdf'
};

async function createUniquePDFs() {
    try {
        console.log('🔧 Creating unique PDF files for each COA...');
        
        // Get all COAs from database
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*')
            .order('id');
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs to process:\n`);
        
        for (const coa of coas) {
            console.log(`--- Creating unique PDF for COA ${coa.id} ---`);
            console.log(`Client: ${coa.client}`);
            console.log(`Compound: ${coa.compound}`);
            
            // Determine which base file to use based on compound
            const baseFileName = baseFileMap[coa.compound.trim()];
            if (!baseFileName) {
                console.log(`⚠️ No base file found for compound: ${coa.compound}`);
                continue;
            }
            
            const baseFilePath = path.join(__dirname, 'COAs', baseFileName);
            console.log(`Using base file: ${baseFileName}`);
            
            // Check if base file exists
            if (!fs.existsSync(baseFilePath)) {
                console.log(`❌ Base file not found: ${baseFilePath}`);
                continue;
            }
            
            // Create unique filename for this COA
            const uniqueFileName = `${coa.id}_${coa.compound.replace(/\s+/g, '')}_COA.pdf`;
            console.log(`Creating unique file: ${uniqueFileName}`);
            
            // Read the base file
            const fileBuffer = fs.readFileSync(baseFilePath);
            console.log(`Base file size: ${fileBuffer.length} bytes`);
            
            // Upload to Supabase storage with unique name
            const supabasePath = `coa-files/${uniqueFileName}`;
            console.log(`Uploading to Supabase: ${supabasePath}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('coa-files')
                .upload(supabasePath, fileBuffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });
            
            if (uploadError) {
                console.error(`❌ Upload error for ${uniqueFileName}:`, uploadError);
                continue;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('coa-files')
                .getPublicUrl(supabasePath);
            
            console.log(`✅ Uploaded successfully: ${publicUrl}`);
            
            // Update COA record with unique PDF information
            const { error: updateError } = await supabase
                .from('coas')
                .update({
                    file_url: publicUrl,
                    file_name: uniqueFileName,
                    file_size: fileBuffer.length,
                    updated_at: new Date().toISOString()
                })
                .eq('id', coa.id);
            
            if (updateError) {
                console.error(`❌ Database update error for ${coa.id}:`, updateError);
            } else {
                console.log(`✅ Database updated for ${coa.id}`);
                console.log(`   Unique URL: ${publicUrl}`);
            }
            
            console.log('');
        }
        
        console.log('🎉 Unique PDF creation completed!');
        
        // Verify all COAs now have unique PDFs
        console.log('\n🔍 Verifying unique PDF assignment...');
        const { data: finalCOAs, error: verifyError } = await supabase
            .from('coas')
            .select('id, client, compound, file_url, file_name')
            .order('id');
            
        if (verifyError) throw verifyError;
        
        console.log('📊 Final COA PDF assignments:');
        finalCOAs.forEach(coa => {
            console.log(`   ${coa.id}: ${coa.file_name}`);
        });
        
        // Check for any remaining duplicates
        const fileNames = finalCOAs.map(c => c.file_name).filter(Boolean);
        const duplicates = fileNames.filter((item, index) => fileNames.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
            console.log('\n❌ STILL HAVE DUPLICATES:');
            duplicates.forEach(file => {
                const coasWithFile = finalCOAs.filter(c => c.file_name === file);
                console.log(`  ${file} used by: ${coasWithFile.map(c => c.id).join(', ')}`);
            });
        } else {
            console.log('\n✅ ALL PDF FILES ARE NOW UNIQUE!');
        }
        
    } catch (error) {
        console.error('💥 Error creating unique PDFs:', error);
    }
}

createUniquePDFs();
