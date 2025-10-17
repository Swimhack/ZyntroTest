// Test script to verify View modal PDF display
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testViewModalPDFs() {
    try {
        console.log('🧪 Testing View modal PDF display functionality...');
        
        // Get all COAs with file URLs
        const { data: coas, error: fetchError } = await supabase
            .from('coas')
            .select('*')
            .not('file_url', 'is', null);
            
        if (fetchError) throw fetchError;
        
        console.log(`📊 Found ${coas.length} COAs with file URLs:\n`);
        
        for (const coa of coas) {
            console.log(`--- Testing COA ${coa.id} ---`);
            console.log(`Client: ${coa.client}`);
            console.log(`Compound: ${coa.compound}`);
            console.log(`File URL: ${coa.file_url}`);
            console.log(`File Name: ${coa.file_name}`);
            
            // Test URL accessibility
            if (coa.file_url) {
                try {
                    const response = await fetch(coa.file_url, { method: 'HEAD' });
                    if (response.ok) {
                        console.log(`✅ PDF URL is accessible`);
                        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
                        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
                        
                        // Test if it's actually a PDF
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/pdf')) {
                            console.log(`✅ Confirmed PDF content type`);
                        } else {
                            console.log(`⚠️ Unexpected content type: ${contentType}`);
                        }
                    } else {
                        console.error(`❌ PDF URL not accessible: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.error(`❌ Error testing PDF URL: ${error.message}`);
                }
            } else {
                console.log(`❌ No file URL set`);
            }
            
            console.log('');
        }
        
        console.log('🎉 View modal PDF test completed!');
        
        console.log('\n📋 Manual Testing Instructions:');
        console.log('1. Go to https://zyntrotest.com/admin/manage-coas.html');
        console.log('2. Click "View" on any COA');
        console.log('3. Verify the modal shows:');
        console.log('   - COA details at the top');
        console.log('   - "Certificate of Analysis PDF" section');
        console.log('   - "Hide PDF" button (since PDF shows by default)');
        console.log('   - "Download PDF" button');
        console.log('   - PDF iframe displaying the actual PDF (not error)');
        console.log('4. Test the "Hide PDF" / "Show PDF" toggle');
        console.log('5. Test the "Download PDF" link');
        
    } catch (error) {
        console.error('💥 Test error:', error);
    }
}

testViewModalPDFs();
