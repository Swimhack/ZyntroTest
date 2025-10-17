// Script to check the actual structure of the coa-files bucket
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkBucketStructure() {
    try {
        console.log('🔍 Checking coa-files bucket structure...');
        
        // List files in root
        const { data: rootFiles, error: rootError } = await supabase.storage
            .from('coa-files')
            .list();
            
        if (rootError) {
            console.error('❌ Error listing root files:', rootError);
            return;
        }
        
        console.log('📁 Root level files:');
        rootFiles.forEach(file => {
            console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'} bytes)`);
        });
        
        // Check if there's a coa-files subfolder
        const coaFilesFolder = rootFiles.find(f => f.name === 'coa-files');
        if (coaFilesFolder) {
            console.log('\n📁 Files in coa-files/ subfolder:');
            const { data: subFiles, error: subError } = await supabase.storage
                .from('coa-files')
                .list('coa-files');
                
            if (subError) {
                console.error('❌ Error listing subfolder files:', subError);
            } else {
                subFiles.forEach(file => {
                    console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'} bytes)`);
                });
            }
        }
        
        // Test accessing the file with the corrected URL
        console.log('\n🧪 Testing corrected file URL...');
        const testUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co/storage/v1/object/public/coa-files/ZT-2025-002_1760580093844.pdf';
        console.log(`Testing: ${testUrl}`);
        
        // Try to fetch the file
        try {
            const response = await fetch(testUrl);
            if (response.ok) {
                console.log('✅ File is accessible via corrected URL');
            } else {
                console.log(`❌ File not accessible: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Error fetching file: ${error.message}`);
        }
        
    } catch (error) {
        console.error('💥 Check error:', error);
    }
}

checkBucketStructure();
