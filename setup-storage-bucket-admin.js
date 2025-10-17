// Script to create storage bucket using service role key (admin privileges)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMTY2MCwiZXhwIjoyMDc1Njk3NjYwfQ.V4Xr2nGmXO4Y9TJe51X1wAILIIAVL5ha61JoW9XmeV0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorageBucketAdmin() {
    try {
        console.log('🔧 Setting up coa-files storage bucket with admin privileges...');
        
        // Check if bucket already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            return;
        }
        
        const coaFilesBucket = buckets.find(b => b.name === 'coa-files');
        
        if (coaFilesBucket) {
            console.log('✅ coa-files bucket already exists');
            console.log(`   Public: ${coaFilesBucket.public}`);
        } else {
            console.log('📦 Creating coa-files bucket...');
            
            // Create the bucket with admin privileges
            const { data, error } = await supabase.storage.createBucket('coa-files', {
                public: true,
                allowedMimeTypes: ['application/pdf'],
                fileSizeLimit: 10485760 // 10MB
            });
            
            if (error) {
                console.error('❌ Error creating bucket:', error);
                return;
            }
            
            console.log('✅ coa-files bucket created successfully');
        }
        
        // Test bucket access
        console.log('🧪 Testing bucket access...');
        const { data: files, error: filesError } = await supabase.storage
            .from('coa-files')
            .list();
            
        if (filesError) {
            console.error('❌ Error accessing bucket:', filesError);
        } else {
            console.log('✅ Bucket access confirmed');
            console.log(`📁 Files in bucket: ${files.length}`);
        }
        
        console.log('🎉 Storage bucket setup complete!');
        
    } catch (error) {
        console.error('💥 Setup error:', error);
    }
}

setupStorageBucketAdmin();
