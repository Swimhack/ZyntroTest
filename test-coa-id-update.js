// Test script to verify COA ID update functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testCOAIdUpdate() {
    try {
        console.log('🧪 Testing COA ID update functionality...');
        
        // First, let's see what COAs exist
        const { data: existingCOAs, error: listError } = await supabase
            .from('coas')
            .select('id, client, compound')
            .limit(5);
            
        if (listError) {
            console.error('❌ Error listing COAs:', listError);
            return;
        }
        
        console.log('📊 Existing COAs:');
        existingCOAs.forEach(coa => {
            console.log(`   - ${coa.id}: ${coa.client} (${coa.compound})`);
        });
        
        if (existingCOAs.length === 0) {
            console.log('❌ No COAs found to test with');
            return;
        }
        
        // Use the first COA for testing
        const testCOA = existingCOAs[0];
        const originalId = testCOA.id;
        const newId = `TEST-${Date.now()}`;
        
        console.log(`\n🔧 Testing ID update: ${originalId} -> ${newId}`);
        
        // Test the update with ID change
        const updateData = {
            id: newId,
            client: testCOA.client,
            compound: testCOA.compound,
            type: 'Peptide Analysis',
            status: 'Complete',
            date: '2024-01-01',
            purity: '99.5%',
            result: 'Test result',
            notes: 'Test update with ID change'
        };
        
        // Update the COA with new ID
        const { data: updateResult, error: updateError } = await supabase
            .from('coas')
            .update({
                id: newId,
                client: updateData.client,
                compound: updateData.compound,
                analysis_type: updateData.type,
                test_date: updateData.date,
                status: updateData.status,
                purity: updateData.purity,
                result: updateData.result,
                notes: updateData.notes
            })
            .eq('id', originalId)
            .select()
            .single();
            
        if (updateError) {
            console.error('❌ Update error:', updateError);
            return;
        }
        
        console.log('✅ COA updated successfully');
        console.log(`   New ID: ${updateResult.id}`);
        
        // Test searching for the old ID (should not find)
        console.log(`\n🔍 Testing search for old ID: ${originalId}`);
        const { data: oldSearch, error: oldSearchError } = await supabase
            .from('coas')
            .select('*')
            .eq('id', originalId)
            .single();
            
        if (oldSearchError && oldSearchError.code === 'PGRST116') {
            console.log('✅ Old ID correctly not found (as expected)');
        } else if (oldSearch) {
            console.log('❌ Old ID still found - this is a problem!');
        } else {
            console.log('⚠️ Unexpected error searching for old ID:', oldSearchError);
        }
        
        // Test searching for the new ID (should find)
        console.log(`\n🔍 Testing search for new ID: ${newId}`);
        const { data: newSearch, error: newSearchError } = await supabase
            .from('coas')
            .select('*')
            .eq('id', newId)
            .single();
            
        if (newSearchError) {
            console.error('❌ Error searching for new ID:', newSearchError);
        } else if (newSearch) {
            console.log('✅ New ID found successfully');
            console.log(`   Client: ${newSearch.client}`);
            console.log(`   Compound: ${newSearch.compound}`);
        } else {
            console.log('❌ New ID not found - this is a problem!');
        }
        
        // Clean up - change back to original ID
        console.log(`\n🧹 Cleaning up - changing back to original ID: ${originalId}`);
        const { error: cleanupError } = await supabase
            .from('coas')
            .update({
                id: originalId,
                client: testCOA.client,
                compound: testCOA.compound,
                analysis_type: 'Peptide Analysis',
                test_date: '2024-01-01',
                status: 'Complete',
                purity: '99.5%',
                result: 'Test result',
                notes: 'Test update with ID change'
            })
            .eq('id', newId);
            
        if (cleanupError) {
            console.error('⚠️ Cleanup error:', cleanupError);
        } else {
            console.log('✅ Cleanup completed');
        }
        
        console.log('\n🎉 COA ID update test completed!');
        
    } catch (error) {
        console.error('💥 Test error:', error);
    }
}

testCOAIdUpdate();
