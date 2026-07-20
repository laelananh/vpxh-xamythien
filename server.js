require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB to accommodate document PDFs
});

const postUpload = upload.fields([
  { name: 'image_file', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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
    title: 'Giới Thiệu Phòng Văn hóa Xã hội Xã Mỹ Thiện'
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
app.post('/admin/posts/create', requireAuth, postUpload, async (req, res) => {
  const { title, category_id, type, summary, content, is_featured } = req.body;
  let image_url = req.body.image_url;
  let pdf_url = req.body.pdf_url;
  let pdf_name = req.body.pdf_name || '';

  if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
    const imgFile = req.files['image_file'][0];
    const imgData = fs.readFileSync(imgFile.path);
    const uploadedUrl = await db.uploadFileToStorage(imgData, imgFile.mimetype, imgFile.originalname);
    image_url = uploadedUrl || `data:${imgFile.mimetype};base64,${imgData.toString('base64')}`;
  }

  if (req.files && req.files['pdf_file'] && req.files['pdf_file'][0]) {
    const pFile = req.files['pdf_file'][0];
    const pData = fs.readFileSync(pFile.path);
    const uploadedUrl = await db.uploadFileToStorage(pData, pFile.mimetype, pFile.originalname);
    pdf_url = uploadedUrl || `data:${pFile.mimetype};base64,${pData.toString('base64')}`;
    if (!pdf_name) {
      pdf_name = pFile.originalname;
    }
  }

  if (title && content) {
    const result = await db.createPost({ title, category_id, type, summary, content, image_url, pdf_url, pdf_name, is_featured });
    if (result && result.error) {
      return res.send(`<h2>Lỗi lưu vào Supabase</h2><p><strong>Lỗi:</strong> ${result.error}</p><p>Chi tiết: ${result.details || ''}</p><p>Gợi ý: ${result.hint || ''}</p><p>Vui lòng chụp lại màn hình này và gửi cho AI.</p><br><a href="/admin/posts/create">Quay lại</a>`);
    }
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
app.post('/admin/posts/edit/:id', requireAuth, postUpload, async (req, res) => {
  const { title, category_id, type, summary, content, is_featured } = req.body;
  let image_url = req.body.image_url;
  let pdf_url = req.body.pdf_url;
  let pdf_name = req.body.pdf_name || '';

  if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
    const imgFile = req.files['image_file'][0];
    const imgData = fs.readFileSync(imgFile.path);
    const uploadedUrl = await db.uploadFileToStorage(imgData, imgFile.mimetype, imgFile.originalname);
    image_url = uploadedUrl || `data:${imgFile.mimetype};base64,${imgData.toString('base64')}`;
  }

  if (req.files && req.files['pdf_file'] && req.files['pdf_file'][0]) {
    const pFile = req.files['pdf_file'][0];
    const pData = fs.readFileSync(pFile.path);
    const uploadedUrl = await db.uploadFileToStorage(pData, pFile.mimetype, pFile.originalname);
    pdf_url = uploadedUrl || `data:${pFile.mimetype};base64,${pData.toString('base64')}`;
    if (!pdf_name) {
      pdf_name = pFile.originalname;
    }
  }

  await db.updatePost(req.params.id, { title, category_id, type, summary, content, image_url, pdf_url, pdf_name, is_featured });
  res.redirect('/admin/posts?msg=updated');
});

// Post Management - Delete Action
app.post('/admin/posts/delete/:id', requireAuth, async (req, res) => {
  await db.deletePost(req.params.id);
  res.redirect('/admin/posts?msg=deleted');
});

// Quick Upload API for PDF & Images (AJAX endpoint)
app.post('/admin/upload-api', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Chưa chọn file' });
  }
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype
  });
});

// Tender Management - List & Create View
app.get('/admin/tenders', requireAuth, (req, res) => {
  const tenders = db.getTenders();
  res.render('admin/tenders', {
    title: 'Quản Lý Gói Thầu Mua Sắm Công',
    tenders
  });
});

app.post('/admin/tenders/create', requireAuth, async (req, res) => {
  const { code, title, budget, investor, status, field, deadline, content } = req.body;
  if (title) {
    await db.createTender({ code, title, budget, investor, status, field, deadline, content });
  }
  res.redirect('/admin/tenders?msg=saved');
});

app.post('/admin/tenders/delete/:id', requireAuth, async (req, res) => {
  await db.deleteTender(req.params.id);
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

app.post('/admin/services/create', requireAuth, async (req, res) => {
  const { code, title, category, level, time_limit, fee, authority, steps, dossier } = req.body;
  if (title) {
    await db.createService({ code, title, category, level, time_limit, fee, authority, steps, dossier });
  }
  res.redirect('/admin/services?msg=saved');
});

app.post('/admin/services/delete/:id', requireAuth, async (req, res) => {
  await db.deleteService(req.params.id);
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
  console.log(` CỔNG THÔNG TIN ĐIỆN TỬ PHÒNG VĂN HOÁ XÃ HỘI XÃ MỸ THIỆN`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin/login`);
  console.log(` Admin Credentials: admin / admin123`);
  console.log(`=======================================================`);
});
