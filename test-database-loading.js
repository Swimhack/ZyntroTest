const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseLoading() {
    console.log('🔍 Testing database loading for all pages...\n');
    
    const pages = ['index', 'services', 'contact', 'blog', 'sample-submission', 'search'];
    
    for (const page of pages) {
        console.log(`📄 Testing page: ${page}`);
        
        try {
            // Test page content loading
            const { data: pageContent, error: pageError } = await supabase
                .from('page_content')
                .select('*')
                .eq('page', page);
            
            if (pageError) {
                console.error(`❌ Page content error for ${page}:`, pageError);
            } else {
                console.log(`✅ Page content loaded: ${pageContent?.length || 0} records`);
                if (pageContent && pageContent.length > 0) {
                    console.log(`   Sample content:`, pageContent[0]);
                }
            }
            
            // Test hero section loading
            const { data: heroSection, error: heroError } = await supabase
                .from('hero_sections')
                .select('*')
                .eq('page', page)
                .single();
            
            if (heroError && heroError.code !== 'PGRST116') {
                console.error(`❌ Hero section error for ${page}:`, heroError);
            } else {
                console.log(`✅ Hero section loaded: ${heroSection ? 'Yes' : 'No'}`);
                if (heroSection) {
                    console.log(`   Title: ${heroSection.title}`);
                    console.log(`   Stats: ${heroSection.stats ? heroSection.stats.length : 0} items`);
                }
            }
            
        } catch (error) {
            console.error(`❌ General error for ${page}:`, error);
        }
        
        console.log('---');
    }
    
    // Test services loading
    console.log('🔬 Testing services loading...');
    try {
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*');
        
        if (servicesError) {
            console.error('❌ Services error:', servicesError);
        } else {
            console.log(`✅ Services loaded: ${services?.length || 0} records`);
            if (services && services.length > 0) {
                console.log(`   Sample service:`, services[0].title);
            }
        }
    } catch (error) {
        console.error('❌ Services error:', error);
    }
    
    // Test blog posts loading
    console.log('📰 Testing blog posts loading...');
    try {
        const { data: blogPosts, error: blogError } = await supabase
            .from('blog_posts')
            .select('*');
        
        if (blogError) {
            console.error('❌ Blog posts error:', blogError);
        } else {
            console.log(`✅ Blog posts loaded: ${blogPosts?.length || 0} records`);
        }
    } catch (error) {
        console.error('❌ Blog posts error:', error);
    }
    
    // Test testimonials loading
    console.log('💬 Testing testimonials loading...');
    try {
        const { data: testimonials, error: testimonialsError } = await supabase
            .from('testimonials')
            .select('*');
        
        if (testimonialsError) {
            console.error('❌ Testimonials error:', testimonialsError);
        } else {
            console.log(`✅ Testimonials loaded: ${testimonials?.length || 0} records`);
        }
    } catch (error) {
        console.error('❌ Testimonials error:', error);
    }
    
    console.log('\n🎯 Database loading test completed!');
}

testDatabaseLoading();
