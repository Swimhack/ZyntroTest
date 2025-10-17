// Script to test PDF display functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testPDFDisplay() {
    try {
        console.log('🧪 Testing PDF display functionality...');
        
        // Get all COAs
        const { data: coas, error } = await supabase
            .from('coas')
            .select('*');
            
        if (error) {
            console.error('❌ Database error:', error);
            return;
        }
        
        console.log(`📊 Found ${coas.length} COAs to test:`);
        
        for (const coa of coas) {
            console.log(`\n--- Testing COA ${coa.id} ---`);
            console.log(`Client: ${coa.client}`);
            console.log(`File URL: ${coa.file_url}`);
            console.log(`File Name: ${coa.file_name}`);
            
            if (coa.file_url) {
                // Test the file URL
                try {
                    const response = await fetch(coa.file_url);
                    if (response.ok) {
                        console.log('✅ PDF file is accessible');
                        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
                        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
                    } else {
                        console.log(`❌ PDF file not accessible: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.log(`❌ Error fetching PDF: ${error.message}`);
                }
            } else {
                console.log('❌ No file URL set');
            }
        }
        
        // Test the search page functionality
        console.log('\n🔍 Testing search page functionality...');
        
        // Simulate the getProperFileUrl function logic
        function getProperFileUrl(coa) {
            let fileUrl = coa.fileUrl || coa.file_url || coa.fileName;
            
            if (fileUrl) {
                // Case 1: Supabase storage URL (contains supabase)
                if (fileUrl.includes('supabase.co') || fileUrl.includes('supabase.in')) {
                    console.log('   Using Supabase storage URL:', fileUrl);
                    return fileUrl;
                }
                
                // Case 2: Local file path - Fix path if it doesn't start with ./
                if (fileUrl.startsWith('COAs/')) {
                    fileUrl = './' + fileUrl;
                }
                
                // Case 3: Validate local path format
                if (fileUrl.startsWith('./COAs/') || fileUrl.startsWith('COAs/')) {
                    console.log('   Using local file path:', fileUrl);
                    return fileUrl;
                }
                
                // Case 4: Absolute URL (http/https)
                if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
                    console.log('   Using absolute URL:', fileUrl);
                    return fileUrl;
                }
                
                // Unknown format - log warning but try to use it anyway
                console.warn('   Unknown file URL format, attempting to use:', fileUrl);
                return fileUrl;
            }
            
            return null;
        }
        
        // Test each COA with the getProperFileUrl function
        for (const coa of coas) {
            console.log(`\n--- Testing getProperFileUrl for ${coa.id} ---`);
            const properUrl = getProperFileUrl(coa);
            if (properUrl) {
                console.log(`   Result: ${properUrl}`);
                
                // Test if the URL is accessible
                try {
                    const response = await fetch(properUrl);
                    if (response.ok) {
                        console.log('   ✅ URL is accessible');
                    } else {
                        console.log(`   ❌ URL not accessible: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Error testing URL: ${error.message}`);
                }
            } else {
                console.log('   ❌ No proper URL found');
            }
        }
        
        console.log('\n🎉 PDF display testing complete!');
        
    } catch (error) {
        console.error('💥 Test error:', error);
    }
}

testPDFDisplay();
