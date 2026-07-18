const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const DB_FILE = path.join(__dirname, 'data.json');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('⚡ Connected to Supabase via API Token Key!');
}

// Local Memory Store & Fallback Data
let dbData = {
  users: [],
  categories: [],
  posts: [],
  tenders: [],
  services: [],
  contacts: [],
  settings: {}
};

function saveLocal() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local database:', err);
  }
}

function initLocal() {
  if (fs.existsSync(DB_FILE)) {
    try {
      dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      seedDefaultLocalData();
    }
  } else {
    seedDefaultLocalData();
  }
}

function seedDefaultLocalData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('admin123', salt);

  dbData.users = [
    {
      id: 1,
      username: 'admin',
      password: hashedPassword,
      fullname: 'Quản trị viên Văn phòng Xã hội',
      email: 'admin@mythien.gov.vn',
      role: 'admin',
      created_at: '2026-07-01 08:00:00'
    }
  ];

  dbData.categories = [
    { id: 'an-sinh', name: 'An sinh Xã hội & Trợ cấp', icon: 'fa-hands-holding-child' },
    { id: 'nguoi-co-cong', name: 'Chăm sóc Người có công', icon: 'fa-medal' },
    { id: 'bao-hiem-y-te', name: 'Bảo hiểm Y tế & Y tế', icon: 'fa-notes-medical' },
    { id: 'tre-em-binh-dang', name: 'Bảo vệ Trẻ em & Gia đình', icon: 'fa-child-reaching' },
    { id: 'lao-dong', name: 'Lao động & Việc làm', icon: 'fa-briefcase' }
  ];

  dbData.settings = {
    site_title: 'CỔNG THÔNG TIN ĐIỆN TỬ VĂN PHÒNG XÃ HỘI XÃ MỸ THIỆN',
    sub_title: 'ỦY BAN NHÂN DÂN XÃ MỸ THIỆN - BỘ PHẬN MỘT CỬA & CHÍNH SÁCH XÃ HỘI',
    address: 'Trụ sở UBND Xã Mỹ Thiện, Ấp Mỹ Phú, Xã Mỹ Thiện, Huyện Cái Bè, Tỉnh Tiền Giang',
    phone: '0273 3855 123 - Hotline: 0918 456 789',
    email: 'vanphongxahoi@mythien.tiengiang.gov.vn',
    working_hours: 'Thứ 2 - Thứ 6: Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
    banner_announcement: 'Chào mừng Quý công dân đến với Cổng Dịch vụ công & Thông tin Văn phòng Xã hội Xã Mỹ Thiện.'
  };

  dbData.posts = [
    {
      id: 1,
      title: 'Xã Mỹ Thiện tổ chức thăm và trao quà cho các gia đình chính sách nhân ngày Thương binh - Liệt sĩ 27/7',
      slug: 'xa-my-thien-to-chuc-tham-va-trao-qua-cho-cac-gia-dinh-chinh-sach-27-7',
      category_id: 'nguoi-co-cong',
      type: 'news',
      summary: 'Sáng nay, đại diện UBND Xã Mỹ Thiện và Văn phòng Xã hội đã đến thăm hỏi, trao 45 phần quà ý nghĩa cho Thương bệnh binh, Thân nhân liệt sĩ và Mẹ Việt Nam Anh hùng trên địa bàn xã.',
      content: `<p>Hướng tới kỷ niệm Ngày Thương binh - Liệt sĩ 27/7, Đảng ủy, Hội đồng nhân dân, Ủy ban nhân dân và Mặt trận Tổ quốc xã Mỹ Thiện đã thành lập các đoàn đến thăm hỏi, động viên và trao tặng các phần quà cho các gia đình chính sách, người có công với cách mạng.</p>`,
      image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
      is_featured: true,
      views: 342,
      created_at: '2026-07-15 09:30:00',
      updated_at: '2026-07-15 09:30:00'
    },
    {
      id: 2,
      title: 'THÔNG BÁO: Lịch chi trả trợ cấp xã hội tháng 07/2026 tại Trụ sở UBND Xã Mỹ Thiện',
      slug: 'thong-bao-lich-chi-tra-tro-cap-xa-hoi-thang-07-2026',
      category_id: 'an-sinh',
      type: 'announcement',
      summary: 'Văn phòng Xã hội Xã Mỹ Thiện trân trọng thông báo lịch chi trả tiền trợ cấp bảo trợ xã hội và hỗ trợ người khuyết tật, người cao tuổi tháng 07/2026.',
      content: `<p><strong>Văn phòng Xã hội Xã Mỹ Thiện xin thông báo đến toàn thể nhân dân và các đối tượng thụ hưởng chính sách bảo trợ xã hội về lịch chi trả như sau:</strong></p>`,
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      is_featured: true,
      views: 520,
      created_at: '2026-07-16 14:00:00',
      updated_at: '2026-07-16 14:00:00'
    }
  ];

  dbData.tenders = [
    {
      id: 1,
      code: 'GT-MT-2026-01',
      title: 'Gói thầu số 01: Mua sắm trang thiết bị âm thanh, ánh sáng và bàn ghế phục vụ Nhà văn hóa cộng đồng xã Mỹ Thiện',
      budget: '350.000.000 VNĐ',
      investor: 'Ủy ban nhân dân Xã Mỹ Thiện',
      status: 'Đang mời thầu',
      field: 'Mua sắm hàng hóa',
      deadline: '2026-08-25 17:00:00',
      published_at: '2026-07-12 09:00:00',
      content: `Dự án trang bị cơ sở vật chất cho Nhà văn hóa cộng đồng Xã Mỹ Thiện.`
    }
  ];

  dbData.services = [
    {
      id: 1,
      code: 'TTHC-XH-01',
      title: 'Giải quyết trợ cấp xã hội hàng tháng đối với người cao tuổi, người khuyết tật và đối tượng bảo trợ xã hội',
      category: 'Bảo trợ Xã hội',
      level: 'Dịch vụ công Trực tuyến Toàn trình',
      time_limit: '15 ngày làm việc',
      fee: 'Miễn phí',
      authority: 'Ủy ban nhân dân Xã Mỹ Thiện',
      steps: ['Bước 1: Nộp hồ sơ', 'Bước 2: Thẩm định', 'Bước 3: Trả kết quả'],
      dossier: ['Tờ khai Mẫu 01', 'Bản sao CCCD']
    }
  ];

  dbData.contacts = [
    {
      id: 1,
      fullname: 'Nguyễn Văn An',
      phone: '0912345678',
      email: 'nguyenvanan@gmail.com',
      address: 'Ấp Mỹ Phú, Xã Mỹ Thiện',
      title: 'Hỏi về thời gian làm lại thẻ BHYT bị mất cho người cao tuổi',
      content: 'Cho tôi hỏi cha tôi 80 tuổi bị mất thẻ BHYT, làm lại cấp lại mất bao lâu?',
      status: 'Đã trả lời',
      reply: 'Chào ông An, ông vui lòng mang CCCD của cụ đến Bộ phận Một cửa xã Mỹ Thiện.',
      created_at: '2026-07-14 10:20:00'
    }
  ];

  saveLocal();
}

if (!supabase) {
  initLocal();
}

module.exports = {
  supabase: supabase,
  getData: () => dbData,

  // Users
  getUserByUsername: (username) => dbData.users.find(u => u.username === username),
  getUserById: (id) => dbData.users.find(u => u.id === parseInt(id)),

  // Categories
  getCategories: () => dbData.categories,

  // Posts
  getPosts: (filter = {}) => {
    let list = [...dbData.posts];
    if (filter.type) list = list.filter(p => p.type === filter.type);
    if (filter.category_id) list = list.filter(p => p.category_id === filter.category_id);
    if (filter.is_featured !== undefined) list = list.filter(p => p.is_featured === filter.is_featured);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getPostById: (id) => dbData.posts.find(p => p.id === parseInt(id)),
  getPostBySlug: (slug) => dbData.posts.find(p => p.slug === slug),
  createPost: (postData) => {
    const newId = dbData.posts.length > 0 ? Math.max(...dbData.posts.map(p => p.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newPost = {
      id: newId,
      title: postData.title,
      slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: postData.category_id || 'an-sinh',
      type: postData.type || 'news',
      summary: postData.summary || '',
      content: postData.content || '',
      image_url: postData.image_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
      is_featured: postData.is_featured === true || postData.is_featured === 'true' || postData.is_featured === 'on',
      views: 0,
      created_at: now,
      updated_at: now
    };
    dbData.posts.unshift(newPost);
    saveLocal();
    return newPost;
  },
  updatePost: (id, postData) => {
    const idx = dbData.posts.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      dbData.posts[idx] = {
        ...dbData.posts[idx],
        ...postData,
        id: parseInt(id),
        is_featured: postData.is_featured === true || postData.is_featured === 'true' || postData.is_featured === 'on',
        updated_at: now
      };
      saveLocal();
      return dbData.posts[idx];
    }
    return null;
  },
  deletePost: (id) => {
    const idx = dbData.posts.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      dbData.posts.splice(idx, 1);
      saveLocal();
      return true;
    }
    return false;
  },
  incrementPostViews: (id) => {
    const post = dbData.posts.find(p => p.id === parseInt(id));
    if (post) {
      post.views = (post.views || 0) + 1;
      saveLocal();
    }
  },

  // Tenders
  getTenders: (search = '') => {
    let list = [...dbData.tenders];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  },
  getTenderById: (id) => dbData.tenders.find(t => t.id === parseInt(id)),
  createTender: (data) => {
    const newId = dbData.tenders.length > 0 ? Math.max(...dbData.tenders.map(t => t.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTender = {
      id: newId,
      code: data.code || `GT-MT-2026-0${newId}`,
      title: data.title,
      budget: data.budget || 'Thỏa thuận',
      investor: data.investor || 'UBND Xã Mỹ Thiện',
      status: data.status || 'Đang mời thầu',
      field: data.field || 'Mua sắm công',
      deadline: data.deadline || now,
      published_at: now,
      content: data.content || ''
    };
    dbData.tenders.unshift(newTender);
    saveLocal();
    return newTender;
  },
  deleteTender: (id) => {
    const idx = dbData.tenders.findIndex(t => t.id === parseInt(id));
    if (idx !== -1) {
      dbData.tenders.splice(idx, 1);
      saveLocal();
      return true;
    }
    return false;
  },

  // Services
  getServices: (search = '', category = '') => {
    let list = [...dbData.services];
    if (category) list = list.filter(s => s.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    return list;
  },
  getServiceById: (id) => dbData.services.find(s => s.id === parseInt(id)),
  createService: (data) => {
    const newId = dbData.services.length > 0 ? Math.max(...dbData.services.map(s => s.id)) + 1 : 1;
    const newService = {
      id: newId,
      code: data.code || `TTHC-XH-0${newId}`,
      title: data.title,
      category: data.category || 'Chính sách Xã hội',
      level: data.level || 'Dịch vụ công Trực tuyến Toàn trình',
      time_limit: data.time_limit || '05 ngày làm việc',
      fee: data.fee || 'Miễn phí',
      authority: data.authority || 'Ủy ban nhân dân Xã Mỹ Thiện',
      steps: Array.isArray(data.steps) ? data.steps : (data.steps ? data.steps.split('\n') : []),
      dossier: Array.isArray(data.dossier) ? data.dossier : (data.dossier ? data.dossier.split('\n') : [])
    };
    dbData.services.push(newService);
    saveLocal();
    return newService;
  },
  deleteService: (id) => {
    const idx = dbData.services.findIndex(s => s.id === parseInt(id));
    if (idx !== -1) {
      dbData.services.splice(idx, 1);
      saveLocal();
      return true;
    }
    return false;
  },

  // Contacts
  getContacts: () => [...dbData.contacts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  createContact: (data) => {
    const newId = dbData.contacts.length > 0 ? Math.max(...dbData.contacts.map(c => c.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newContact = {
      id: newId,
      fullname: data.fullname,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
      title: data.title,
      content: data.content,
      status: 'Chờ xử lý',
      reply: '',
      created_at: now
    };
    dbData.contacts.unshift(newContact);
    saveLocal();
    return newContact;
  },
  replyContact: (id, replyText) => {
    const contact = dbData.contacts.find(c => c.id === parseInt(id));
    if (contact) {
      contact.reply = replyText;
      contact.status = 'Đã trả lời';
      saveLocal();
      return contact;
    }
    return null;
  },

  // Settings
  getSettings: () => dbData.settings
};
