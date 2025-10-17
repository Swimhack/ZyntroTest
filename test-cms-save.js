const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCMSSave() {
    console.log('🧪 Testing CMS save functionality...\n');
    
    try {
        // Test saving page content
        const testData = [
            { 
                page: 'index', 
                section_key: 'page_title', 
                content_type: 'text', 
                content_value: 'Test Title - Updated via CMS' 
            },
            { 
                page: 'index', 
                section_key: 'meta_description', 
                content_type: 'text', 
                content_value: 'Test Description - Updated via CMS' 
            }
        ];
        
        console.log('📝 Saving test page content...');
        const { data: pageData, error: pageError } = await supabase
            .from('page_content')
            .upsert(testData, { onConflict: 'page,section_key' });
        
        if (pageError) {
            console.error('❌ Page content save error:', pageError);
        } else {
            console.log('✅ Page content saved successfully');
        }
        
        // Test saving hero section
        console.log('🎯 Saving test hero section...');
        const { data: heroData, error: heroError } = await supabase
            .from('hero_sections')
            .upsert({
                page: 'index',
                title: 'Test Hero Title - Updated via CMS',
                subtitle: 'Test Hero Subtitle - Updated via CMS',
                description: 'Test Hero Description - Updated via CMS',
                image_url: 'https://example.com/test-image.jpg'
            }, { onConflict: 'page' });
        
        if (heroError) {
            console.error('❌ Hero section save error:', heroError);
        } else {
            console.log('✅ Hero section saved successfully');
        }
        
        // Test reading the data back
        console.log('📖 Reading saved data...');
        const { data: readPageData, error: readPageError } = await supabase
            .from('page_content')
            .select('*')
            .eq('page', 'index');
        
        if (readPageError) {
            console.error('❌ Page content read error:', readPageError);
        } else {
            console.log('✅ Page content read successfully:', readPageData?.length || 0, 'records');
            if (readPageData && readPageData.length > 0) {
                console.log('Sample data:', readPageData[0]);
            }
        }
        
        const { data: readHeroData, error: readHeroError } = await supabase
            .from('hero_sections')
            .select('*')
            .eq('page', 'index');
        
        if (readHeroError) {
            console.error('❌ Hero section read error:', readHeroError);
        } else {
            console.log('✅ Hero section read successfully:', readHeroData?.length || 0, 'records');
            if (readHeroData && readHeroData.length > 0) {
                console.log('Sample data:', readHeroData[0]);
            }
        }
        
    } catch (error) {
        console.error('❌ General error:', error);
    }
}

testCMSSave();
