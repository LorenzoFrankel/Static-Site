const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

const contentDir = path.join(__dirname, 'src/content');
const publicDir = path.join(__dirname, 'public');

async function copyStaticFiles() {
    // Copy HTML, CSS, and JS files
    await fs.copyFile(path.join(__dirname, 'src/index.html'), path.join(publicDir, 'index.html'));
    
    // Create directories if they don't exist
    await fs.mkdir(path.join(publicDir, 'css'), { recursive: true });
    await fs.mkdir(path.join(publicDir, 'js'), { recursive: true });
    
    // Copy CSS and JS files
    await fs.copyFile(path.join(__dirname, 'src/css/styles.css'), path.join(publicDir, 'css/styles.css'));
    await fs.copyFile(path.join(__dirname, 'src/js/main.js'), path.join(publicDir, 'js/main.js'));
}

async function convertMarkdownFiles() {
    const template = await fs.readFile(path.join(__dirname, 'src/template.html'), 'utf-8');
    
    // Convert blog posts
    const blogDir = path.join(contentDir, 'blog');
    const posts = await fs.readdir(blogDir);
    
    await fs.mkdir(path.join(publicDir, 'blog'), { recursive: true });
    
    for (const post of posts) {
        if (post.endsWith('.md')) {
            const content = await fs.readFile(path.join(blogDir, post), 'utf-8');
            const html = marked(content);
            const finalHtml = template.replace('{{content}}', html);
            
            const outputPath = path.join(publicDir, 'blog', post.replace('.md', '.html'));
            await fs.writeFile(outputPath, finalHtml);
        }
    }
    
    // Convert other pages
    const pages = ['about', 'faq'];
    for (const page of pages) {
        const pagePath = path.join(contentDir, `${page}.md`);
        try {
            const content = await fs.readFile(pagePath, 'utf-8');
            const html = marked(content);
            const finalHtml = template.replace('{{content}}', html);
            
            await fs.writeFile(path.join(publicDir, `${page}.html`), finalHtml);
        } catch (error) {
            console.log(`Warning: ${page}.md not found`);
        }
    }
}

async function build() {
    try {
        // Create public directory
        await fs.mkdir(publicDir, { recursive: true });
        
        // Copy static files and convert markdown
        await Promise.all([
            copyStaticFiles(),
            convertMarkdownFiles()
        ]);
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 