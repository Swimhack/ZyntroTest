const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkPDFSharing() {
    try {
        console.log('🔍 Checking for PDF file sharing between COAs...');
        
        const { data: coas, error } = await supabase
            .from('coas')
            .select('id, client, compound, file_url, file_name')
            .order('id');
            
        if (error) throw error;
        
        console.log(`📊 Found ${coas.length} COAs:\n`);
        
        coas.forEach(coa => {
            console.log(`${coa.id}: ${coa.file_name} (${coa.file_url})`);
        });
        
        // Check for duplicates
        const fileNames = coas.map(c => c.file_name).filter(Boolean);
        const duplicates = fileNames.filter((item, index) => fileNames.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
            console.log('\n❌ DUPLICATE PDF FILES FOUND:');
            duplicates.forEach(file => {
                const coasWithFile = coas.filter(c => c.file_name === file);
                console.log(`  ${file} used by: ${coasWithFile.map(c => c.id).join(', ')}`);
            });
        } else {
            console.log('\n✅ All PDF files are unique');
        }
        
        // Check for shared URLs
        const fileUrls = coas.map(c => c.file_url).filter(Boolean);
        const duplicateUrls = fileUrls.filter((item, index) => fileUrls.indexOf(item) !== index);
        
        if (duplicateUrls.length > 0) {
            console.log('\n❌ DUPLICATE PDF URLs FOUND:');
            duplicateUrls.forEach(url => {
                const coasWithUrl = coas.filter(c => c.file_url === url);
                console.log(`  ${url} used by: ${coasWithUrl.map(c => c.id).join(', ')}`);
            });
        } else {
            console.log('\n✅ All PDF URLs are unique');
        }
        
    } catch (error) {
        console.error('💥 Error checking PDF sharing:', error);
    }
}

checkPDFSharing();
