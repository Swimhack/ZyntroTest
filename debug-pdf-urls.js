// Debug script to check PDF URLs in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPDFUrls() {
    try {
        console.log('🔍 Checking COAs in database...');
        
        const { data: coas, error } = await supabase
            .from('coas')
            .select('*');
            
        if (error) {
            console.error('❌ Database error:', error);
            return;
        }
        
        console.log(`📊 Found ${coas.length} COAs in database:`);
        
        coas.forEach((coa, index) => {
            console.log(`\n--- COA ${index + 1} ---`);
            console.log(`ID: ${coa.id}`);
            console.log(`Client: ${coa.client}`);
            console.log(`File URL: ${coa.file_url || 'NOT SET'}`);
            console.log(`File Name: ${coa.file_name || 'NOT SET'}`);
            console.log(`Created: ${coa.created_at}`);
            
            // Check if file URL is valid
            if (coa.file_url) {
                if (coa.file_url.includes('supabase.co')) {
                    console.log('✅ Supabase storage URL detected');
                } else if (coa.file_url.startsWith('./COAs/') || coa.file_url.startsWith('COAs/')) {
                    console.log('✅ Local file path detected');
                } else {
                    console.log('⚠️ Unknown URL format');
                }
            } else {
                console.log('❌ No file URL set');
            }
        });
        
        // Check storage bucket
        console.log('\n🔍 Checking storage bucket...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.error('❌ Bucket error:', bucketError);
        } else {
            console.log('📦 Available buckets:');
            buckets.forEach(bucket => {
                console.log(`- ${bucket.name} (public: ${bucket.public})`);
            });
            
            // Check coa-files bucket specifically
            const coaFilesBucket = buckets.find(b => b.name === 'coa-files');
            if (coaFilesBucket) {
                console.log('✅ coa-files bucket exists');
                console.log(`   Public: ${coaFilesBucket.public}`);
                
                // List files in bucket
                const { data: files, error: filesError } = await supabase.storage
                    .from('coa-files')
                    .list();
                    
                if (filesError) {
                    console.error('❌ Error listing files:', filesError);
                } else {
                    console.log(`📁 Files in coa-files bucket (${files.length}):`);
                    files.forEach(file => {
                        console.log(`- ${file.name}`);
                    });
                }
            } else {
                console.log('❌ coa-files bucket not found');
            }
        }
        
    } catch (error) {
        console.error('💥 Debug error:', error);
    }
}

debugPDFUrls();
