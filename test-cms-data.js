const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdzwmlkgnuxcuhjooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCMSData() {
    console.log('🔍 Testing CMS data...\n');
    
    try {
        // Check page_content table
        const { data: pageContent, error: pageError } = await supabase
            .from('page_content')
            .select('*');
        
        if (pageError) {
            console.error('❌ Page content error:', pageError);
        } else {
            console.log('📄 Page Content Records:', pageContent?.length || 0);
            if (pageContent && pageContent.length > 0) {
                console.log('Sample records:', pageContent.slice(0, 3));
            }
        }
        
        // Check hero_sections table
        const { data: heroSections, error: heroError } = await supabase
            .from('hero_sections')
            .select('*');
        
        if (heroError) {
            console.error('❌ Hero sections error:', heroError);
        } else {
            console.log('🎯 Hero Sections Records:', heroSections?.length || 0);
            if (heroSections && heroSections.length > 0) {
                console.log('Sample records:', heroSections.slice(0, 3));
            }
        }
        
        // Check services table
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*');
        
        if (servicesError) {
            console.error('❌ Services error:', servicesError);
        } else {
            console.log('🔧 Services Records:', services?.length || 0);
            if (services && services.length > 0) {
                console.log('Sample records:', services.slice(0, 3));
            }
        }
        
        // Check blog_posts table
        const { data: blogPosts, error: blogError } = await supabase
            .from('blog_posts')
            .select('*');
        
        if (blogError) {
            console.error('❌ Blog posts error:', blogError);
        } else {
            console.log('📝 Blog Posts Records:', blogPosts?.length || 0);
            if (blogPosts && blogPosts.length > 0) {
                console.log('Sample records:', blogPosts.slice(0, 3));
            }
        }
        
    } catch (error) {
        console.error('❌ General error:', error);
    }
}

testCMSData();
