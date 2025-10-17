// Test script to verify COA View modal functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testViewModal() {
    try {
        console.log('🧪 Testing COA View modal functionality...');
        
        // Get a COA with a PDF file
        const { data: coas, error: listError } = await supabase
            .from('coas')
            .select('*')
            .not('file_url', 'is', null)
            .limit(1);
            
        if (listError) {
            console.error('❌ Error listing COAs:', listError);
            return;
        }
        
        if (coas.length === 0) {
            console.log('❌ No COAs with PDF files found to test with');
            return;
        }
        
        const testCOA = coas[0];
        console.log(`📊 Testing with COA: ${testCOA.id}`);
        console.log(`   Client: ${testCOA.client}`);
        console.log(`   Compound: ${testCOA.compound}`);
        console.log(`   File URL: ${testCOA.file_url}`);
        console.log(`   File Name: ${testCOA.file_name}`);
        
        // Test PDF URL accessibility
        if (testCOA.file_url) {
            console.log('\n🔍 Testing PDF URL accessibility...');
            try {
                const response = await fetch(testCOA.file_url, { method: 'HEAD' });
                if (response.ok) {
                    console.log('✅ PDF URL is accessible');
                    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
                    console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
                } else {
                    console.error(`❌ PDF URL not accessible: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`❌ Error testing PDF URL: ${error.message}`);
            }
        }
        
        // Test the getCOAById function logic
        console.log('\n🔍 Testing getCOAById function logic...');
        const { data: coaById, error: getError } = await supabase
            .from('coas')
            .select('*')
            .eq('id', testCOA.id)
            .single();
            
        if (getError) {
            console.error('❌ Error getting COA by ID:', getError);
        } else if (coaById) {
            console.log('✅ COA found by ID successfully');
            console.log(`   ID: ${coaById.id}`);
            console.log(`   Client: ${coaById.client}`);
            console.log(`   Compound: ${coaById.compound}`);
            console.log(`   File URL: ${coaById.file_url || 'NOT SET'}`);
            console.log(`   File Name: ${coaById.file_name || 'NOT SET'}`);
            
            // Check if file URL is properly formatted
            if (coaById.file_url) {
                if (coaById.file_url.includes('supabase.co')) {
                    console.log('✅ File URL is Supabase storage URL');
                } else if (coaById.file_url.startsWith('./COAs/')) {
                    console.log('✅ File URL is local path');
                } else {
                    console.log('⚠️ File URL format is unknown:', coaById.file_url);
                }
            }
        } else {
            console.log('❌ COA not found by ID');
        }
        
        console.log('\n🎉 View modal test completed!');
        console.log('\n📋 Manual Testing Instructions:');
        console.log('1. Go to https://zyntrotest.com/admin/manage-coas.html');
        console.log('2. Click "View" on any COA with a PDF');
        console.log('3. Verify the modal opens with:');
        console.log('   - Sticky header with visible X button');
        console.log('   - PDF displayed by default (not hidden)');
        console.log('   - Proper error handling if PDF fails to load');
        console.log('   - Toggle button works (Show/Hide PDF)');
        console.log('   - Download link is available');
        
    } catch (error) {
        console.error('💥 Test error:', error);
    }
}

testViewModal();
