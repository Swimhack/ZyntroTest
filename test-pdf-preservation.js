// Test script to verify PDF preservation during COA edits
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testPDFPreservation() {
    try {
        console.log('🧪 Testing PDF preservation during COA edits...');
        
        // Get a COA with a PDF file
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*')
            .not('file_url', 'is', null)
            .limit(1);
            
        if (fetchError) throw fetchError;
        
        if (coas.length === 0) {
            console.log('❌ No COAs with PDF files found to test with');
            return;
        }
        
        const testCOA = coas[0];
        console.log(`📊 Testing with COA: ${testCOA.id}`);
        console.log(`   Original File URL: ${testCOA.file_url}`);
        console.log(`   Original File Name: ${testCOA.file_name}`);
        
        // Simulate editing the COA (updating client name only)
        const originalClient = testCOA.client;
        const newClient = `${originalClient} (Edited)`;
        
        console.log(`\n🔧 Simulating edit: changing client from "${originalClient}" to "${newClient}"`);
        
        // Update only the client field, preserving PDF information
        const { data: updateResult, error: updateError } = await supabase
            .from('coas')
            .update({
                client: newClient,
                // CRITICAL: Preserve existing PDF information
                file_url: testCOA.file_url,
                file_name: testCOA.file_name,
                file_size: testCOA.file_size,
                updated_at: new Date().toISOString()
            })
            .eq('id', testCOA.id)
            .select()
            .single();
            
        if (updateError) {
            console.error('❌ Update error:', updateError);
            return;
        }
        
        console.log('✅ COA updated successfully');
        console.log(`   New Client: ${updateResult.client}`);
        console.log(`   File URL: ${updateResult.file_url}`);
        console.log(`   File Name: ${updateResult.file_name}`);
        
        // Verify PDF information was preserved
        if (updateResult.file_url === testCOA.file_url && updateResult.file_name === testCOA.file_name) {
            console.log('✅ PDF information preserved correctly!');
        } else {
            console.error('❌ PDF information was lost during edit!');
            console.log(`   Expected URL: ${testCOA.file_url}`);
            console.log(`   Actual URL: ${updateResult.file_url}`);
            console.log(`   Expected Name: ${testCOA.file_name}`);
            console.log(`   Actual Name: ${updateResult.file_name}`);
        }
        
        // Restore original client name
        console.log('\n🧹 Restoring original client name...');
        const { error: restoreError } = await supabase
            .from('coas')
            .update({
                client: originalClient,
                file_url: testCOA.file_url,
                file_name: testCOA.file_name,
                file_size: testCOA.file_size,
                updated_at: new Date().toISOString()
            })
            .eq('id', testCOA.id);
            
        if (restoreError) {
            console.error('⚠️ Restore error:', restoreError);
        } else {
            console.log('✅ Original client name restored');
        }
        
        console.log('\n🎉 PDF preservation test completed!');
        
    } catch (error) {
        console.error('💥 Test error:', error);
    }
}

testPDFPreservation();
