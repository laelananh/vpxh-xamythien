require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'vpxh_my_thien_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Global locals for templates
app.use((req, res, next) => {
  res.locals.settings = db.getSettings();
  res.locals.categories = db.getCategories();
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/admin/login?error=unauthorized');
}

/* ==========================================
   PUBLIC ROUTES
   ========================================== */

// 1. Trang Chủ
app.get('/', (req, res) => {
  const featuredPosts = db.getPosts({ is_featured: true });
  const latestNews = db.getPosts({ type: 'news' }).slice(0, 6);
  const announcements = db.getPosts({ type: 'announcement' }).slice(0, 4);
  const tenders = db.getTenders().slice(0, 3);
  const services = db.getServices().slice(0, 4);

  res.render('index', {
    title: 'Trang Chủ',
    featuredPosts,
    latestNews,
    announcements,
    tenders,
    services
  });
});

// 2. Giới Thiệu
app.get('/gioi-thieu', (req, res) => {
  res.render('about', {
    title: 'Giới Thiệu Văn Phòng Văn hóa Xã hội Xã Mỹ Thiện'
  });
});

// 3. Gói Thầu
app.get('/goi-thau', (req, res) => {
  const search = req.query.q || '';
  const tenders = db.getTenders(search);

  res.render('tenders', {
    title: 'Thông Tin Gói Thầu Mua Sắm Công',
    tenders,
    search
  });
});

// 4. Tin Tức - Sự Kiện
app.get('/tin-tuc', (req, res) => {
  const categoryId = req.query.cat || '';
  const search = req.query.q || '';
  const posts = db.getPosts({ type: 'news', category_id: categoryId, search });

  res.render('news', {
    title: 'Tin Tức - Sự Kiện',
    posts,
    selectedCategory: categoryId,
    search
  });
});

// Chi tiết bài viết Tin tức / Thông báo
app.get('/tin-tuc/:slug', (req, res) => {
  const post = db.getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render('404', { title: 'Không tìm thấy bài viết' });
  }

  db.incrementPostViews(post.id);
  const relatedPosts = db.getPosts({ type: post.type }).filter(p => p.id !== post.id).slice(0, 4);

  res.render('news-detail', {
    title: post.title,
    post,
    relatedPosts
  });
});

// 5. Thông Báo
app.get('/thong-bao', (req, res) => {
  const search = req.query.q || '';
  const announcements = db.getPosts({ type: 'announcement', search });

  res.render('announcements', {
    title: 'Thông Báo Chính Thức',
    announcements,
    search
  });
});

// 6. Dịch Vụ Công
app.get('/dich-vu-cong', (req, res) => {
  const search = req.query.q || '';
  const category = req.query.cat || '';
  const services = db.getServices(search, category);

  res.render('services', {
    title: 'Cổng Dịch Vụ Công & Thủ Tục Hành Chính',
    services,
    search,
    category
  });
});

// Tra cứu hồ sơ dịch vụ công giả lập
app.get('/dich-vu-cong/tra-cuu', (req, res) => {
  const code = req.query.code || '';
  let result = null;

  if (code) {
    // Demo Dossier Lookup logic
    result = {
      code: code,
      applicant: 'Nguyễn Văn ' + (code.length > 3 ? 'A' : 'B'),
      service_name: 'Giải quyết trợ cấp xã hội hàng tháng đối với người cao tuổi',
      submitted_date: '2026-07-10',
      expected_date: '2026-07-25',
      status: code.endsWith('9') ? 'Đã duyệt kết quả - Sẵn sàng trả kết quả' : 'Đang xử lý - Đang thẩm định hồ sơ',
      department: 'Văn phòng Xã hội Xã Mỹ Thiện'
    };
  }

  res.render('service-lookup', {
    title: 'Tra Cứu Hồ Sơ Dịch Vụ Công',
    code,
    result
  });
});

// Chi tiết Thủ tục Dịch vụ công
app.get('/dich-vu-cong/:id', (req, res) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).render('404', { title: 'Không tìm thấy thủ tục hành chính' });
  }

  res.render('service-detail', {
    title: service.title,
    service
  });
});

// 7. Liên Hệ
app.get('/lien-he', (req, res) => {
  const msg = req.query.msg || '';
  res.render('contact', {
    title: 'Liên Hệ & Phản Ánh Kiến Nghị',
    msg
  });
});

app.post('/lien-he', (req, res) => {
  const { fullname, phone, email, address, title, content } = req.body;
  if (fullname && phone && title && content) {
    db.createContact({ fullname, phone, email, address, title, content });
    return res.redirect('/lien-he?msg=success');
  }
  res.redirect('/lien-he?msg=error');
});

/* ==========================================
   ADMIN ROUTES (TRANG QUẢN TRỊ)
   ========================================== */

// Admin Login View
app.get('/admin/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }
  const error = req.query.error || '';
  res.render('admin/login', {
    title: 'Đăng Nhập Quản Trị Hệ Thống',
    error
  });
});

// Admin Login Action
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.getUserByUsername(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role
    };
    return res.redirect('/admin');
  }

  res.redirect('/admin/login?error=invalid');
});

// Admin Logout Action
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Admin Dashboard Overview
app.get('/admin', requireAuth, (req, res) => {
  const postsCount = db.getPosts().length;
  const tendersCount = db.getTenders().length;
  const servicesCount = db.getServices().length;
  const contactsCount = db.getContacts().length;
  const recentPosts = db.getPosts().slice(0, 5);
  const recentContacts = db.getContacts().slice(0, 5);

  res.render('admin/dashboard', {
    title: 'Trang Quản Trị Hệ Thống',
    postsCount,
    tendersCount,
    servicesCount,
    contactsCount,
    recentPosts,
    recentContacts
  });
});

// Post Management - List
app.get('/admin/posts', requireAuth, (req, res) => {
  const type = req.query.type || '';
  const posts = db.getPosts(type ? { type } : {});

  res.render('admin/posts', {
    title: 'Quản Lý Bài Viết & Thông Báo',
    posts,
    type
  });
});

// Post Management - Create View
app.get('/admin/posts/create', requireAuth, (req, res) => {
  res.render('admin/post-form', {
    title: 'Đăng Bài Viết Mới',
    post: null
  });
});

// Post Management - Create Action
app.post('/admin/posts/create', requireAuth, (req, res) => {
  const { title, category_id, type, summary, content, image_url, is_featured } = req.body;
  if (title && content) {
    const newPost = db.createPost({ title, category_id, type, summary, content, image_url, is_featured });
    return res.redirect(`/admin/posts?msg=created`);
  }
  res.redirect('/admin/posts/create?error=missing');
});

// Post Management - Edit View
app.get('/admin/posts/edit/:id', requireAuth, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.redirect('/admin/posts');

  res.render('admin/post-form', {
    title: 'Chỉnh Sửa Bài Viết',
    post
  });
});

// Post Management - Edit Action
app.post('/admin/posts/edit/:id', requireAuth, (req, res) => {
  const { title, category_id, type, summary, content, image_url, is_featured } = req.body;
  db.updatePost(req.params.id, { title, category_id, type, summary, content, image_url, is_featured });
  res.redirect('/admin/posts?msg=updated');
});

// Post Management - Delete Action
app.post('/admin/posts/delete/:id', requireAuth, (req, res) => {
  db.deletePost(req.params.id);
  res.redirect('/admin/posts?msg=deleted');
});

// Tender Management - List & Create View
app.get('/admin/tenders', requireAuth, (req, res) => {
  const tenders = db.getTenders();
  res.render('admin/tenders', {
    title: 'Quản Lý Gói Thầu Mua Sắm Công',
    tenders
  });
});

app.post('/admin/tenders/create', requireAuth, (req, res) => {
  const { code, title, budget, investor, status, field, deadline, content } = req.body;
  if (title) {
    db.createTender({ code, title, budget, investor, status, field, deadline, content });
  }
  res.redirect('/admin/tenders?msg=saved');
});

app.post('/admin/tenders/delete/:id', requireAuth, (req, res) => {
  db.deleteTender(req.params.id);
  res.redirect('/admin/tenders?msg=deleted');
});

// Service Management - List & Create View
app.get('/admin/services', requireAuth, (req, res) => {
  const services = db.getServices();
  res.render('admin/services', {
    title: 'Quản Lý Thủ Tục Dịch Vụ Công',
    services
  });
});

app.post('/admin/services/create', requireAuth, (req, res) => {
  const { code, title, category, level, time_limit, fee, authority, steps, dossier } = req.body;
  if (title) {
    db.createService({ code, title, category, level, time_limit, fee, authority, steps, dossier });
  }
  res.redirect('/admin/services?msg=saved');
});

app.post('/admin/services/delete/:id', requireAuth, (req, res) => {
  db.deleteService(req.params.id);
  res.redirect('/admin/services?msg=deleted');
});

// Contacts Management
app.get('/admin/contacts', requireAuth, (req, res) => {
  const contacts = db.getContacts();
  res.render('admin/contacts', {
    title: 'Quản Lý Phản Ánh Kiến Nghị Nhân Dân',
    contacts
  });
});

app.post('/admin/contacts/reply/:id', requireAuth, (req, res) => {
  const { reply } = req.body;
  if (reply) {
    db.replyContact(req.params.id, reply);
  }
  res.redirect('/admin/contacts?msg=replied');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Trang không tồn tại' });
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CỔNG THÔNG TIN ĐIỆN TỬ VĂN PHÒNG VĂN HOÁ XÃ HỘI XÃ MỸ THIỆN`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin/login`);
  console.log(` Admin Credentials: admin / admin123`);
  console.log(`=======================================================`);
});
