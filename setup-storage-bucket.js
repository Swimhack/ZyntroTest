// Script to create and configure the coa-files storage bucket
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBucket() {
    try {
        console.log('🔧 Setting up coa-files storage bucket...');
        
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
            
            // Create the bucket
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
        
        // Upload a test file to verify everything works
        console.log('📤 Uploading test file...');
        const testContent = 'This is a test PDF file for COA storage verification.';
        const testFile = new Blob([testContent], { type: 'application/pdf' });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('coa-files')
            .upload('test-file.pdf', testFile);
            
        if (uploadError) {
            console.error('❌ Error uploading test file:', uploadError);
        } else {
            console.log('✅ Test file uploaded successfully');
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('coa-files')
                .getPublicUrl('test-file.pdf');
                
            console.log('🔗 Test file public URL:', publicUrl);
            
            // Clean up test file
            const { error: deleteError } = await supabase.storage
                .from('coa-files')
                .remove(['test-file.pdf']);
                
            if (deleteError) {
                console.warn('⚠️ Could not delete test file:', deleteError);
            } else {
                console.log('🧹 Test file cleaned up');
            }
        }
        
        console.log('🎉 Storage bucket setup complete!');
        
    } catch (error) {
        console.error('💥 Setup error:', error);
    }
}

setupStorageBucket();
