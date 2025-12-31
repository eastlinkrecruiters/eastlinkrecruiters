// Blog Module - Load posts, comments, admin editor
import { onSnapshot, addDoc, collection, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { apiCall } from './api.js';
import { initAnimations } from './animations.js'; // For carousel

const { db } = FirebaseApp;
const role = localStorage.getItem('role');

export function initBlog() {
  if (window.location.pathname.includes('admin-blog')) {
    initAdminBlog();
  } else {
    loadBlogPosts();
  }
  loadComments();
  generateRSS();
}

async function loadBlogPosts() {
  const postsQuery = query(collection(db, 'blog'), orderBy('publishDate', 'desc'), limit(10));
  onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const container = document.getElementById('blog-posts') || document.getElementById('recent-blog'); // Index or full
    container.innerHTML = posts.map(post => `
      <article class="blog-card card" data-aos="fade-up">
        <img src="${post.imageUrl || '/assets/images/blog/placeholder.jpg'}" alt="${post.title}" style="width:100%; height:200px; object-fit:cover; border-radius: var(--border-radius);">
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <small>By Admin | ${formatDate(post.publishDate.toDate())} | Category: ${post.category}</small>
        <a href="/blog.html?id=${post.id}" class="button">Read More</a>
      </article>
    `).join('');
    // Carousel for index recent
    if (container.id === 'recent-blog') {
      gsap.to('.blog-card', { duration: 0.5, xPercent: -100 * (container.children.length - 1), ease: "none", repeat: -1 });
    }
  });
}

function loadComments() {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (!postId) return;

  const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('timestamp', 'asc'));
  onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const commentsEl = document.getElementById('comments');
    commentsEl.innerHTML = comments.map(comment => `
      <div class="comment card">
        <p>${comment.text}</p>
        <small>By ${comment.userName} | ${formatDate(comment.timestamp.toDate())}</small>
        ${role === 'admin' ? `<button onclick="deleteComment('${comment.id}')">Delete</button>` : ''}
      </div>
    `).join('');
  });

  // Add comment form
  document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    await addDoc(collection(db, 'comments'), {
      postId,
      text,
      userName: localStorage.getItem('userName') || 'Anonymous',
      uid: FirebaseApp.auth.currentUser?.uid,
      timestamp: serverTimestamp()
    });
    e.target.reset();
    showToast('Comment added', 'success');
  });
}

function initAdminBlog() {
  // WYSIWYG - Simple textarea for MVP; use CKEditor if added
  const editor = document.getElementById('blog-editor');
  if (editor) {
    editor.addEventListener('input', () => gsap.to(editor, { duration: 0.2, boxShadow: '0 0 10px rgba(0,123,255,0.3)' }));
  }

  document.getElementById('publish-blog').addEventListener('click', async () => {
    const title = document.getElementById('blog-title').value;
    const content = editor.value;
    const category = document.getElementById('blog-category').value;
    const image = document.getElementById('blog-image').files[0];

    let imageUrl = '';
    if (image) {
      imageUrl = await apiCall('uploadFile', { file: image, path: 'blog/' }); // Storage via api
    }

    await apiCall('addBlogPost', { title, content, category, imageUrl, publishDate: serverTimestamp(), author: 'Admin' });
    showToast('Post published', 'success');
    // FCM announce to subscribers
    apiCall('sendAnnouncement', { title: 'New Blog Post', message: `Read: ${title}`, target: 'all' });
  });
}

function generateRSS() {
  // Simple client-side; for full, use Functions
  apiCall('getAllPosts').then((posts) => {
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>EastLink Recruiters Blog</title>
    <link>https://yourgithubpages.com/blog.html</link>
    <description>Job tips and updates</description>
    ${posts.map(post => `
      <item>
        <title>${post.title}</title>
        <link>https://yourgithubpages.com/blog.html?id=${post.id}</link>
        <description>${post.excerpt}</description>
        <pubDate>${post.publishDate.toDate().toUTCString()}</pubDate>
      </item>
    `).join('')}
  </channel>
</rss>`;
    // Save as blob or link to /rss.xml
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rss], { type: 'application/xml' }));
    a.download = 'rss.xml';
    a.click();
  });
}

window.deleteComment = async (id) => {
  if (confirm('Delete comment?')) {
    await apiCall('deleteComment', id);
    showToast('Deleted', 'success');
  }
};

function showToast(msg, type) {
  // As above
}
