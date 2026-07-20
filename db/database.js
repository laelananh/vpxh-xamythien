const fs = require('fs'); // wait, syntax fix
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const DB_FILE = path.join(__dirname, 'data.json');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('⚡ Connected to Supabase via API Token Key!');
  } catch (e) {
    console.error('Supabase connection error:', e);
  }
}

// Default Sample Seed Data
const sampleCategories = [
  { id: 'an-sinh', name: 'An sinh Xã hội & Trợ cấp', icon: 'fa-hands-holding-child' },
  { id: 'nguoi-co-cong', name: 'Chăm sóc Người có công', icon: 'fa-medal' },
  { id: 'bao-hiem-y-te', name: 'Bảo hiểm Y tế & Y tế', icon: 'fa-notes-medical' },
  { id: 'tre-em-binh-dang', name: 'Bảo vệ Trẻ em & Gia đình', icon: 'fa-child-reaching' },
  { id: 'lao-dong', name: 'Lao động & Việc làm', icon: 'fa-briefcase' }
];

const samplePosts = [
  {
    id: 1,
    title: 'Xã Mỹ Thiện tổ chức thăm và trao quà cho các gia đình chính sách nhân ngày Thương binh - Liệt sĩ 27/7',
    slug: 'xa-my-thien-to-chuc-tham-va-trao-qua-cho-cac-gia-dinh-chinh-sach-27-7',
    category_id: 'nguoi-co-cong',
    type: 'news',
    summary: 'Sáng nay, đại diện UBND Xã Mỹ Thiện và Văn phòng Xã hội đã đến thăm hỏi, trao 45 phần quà ý nghĩa cho Thương bệnh binh, Thân nhân liệt sĩ và Mẹ Việt Nam Anh hùng trên địa bàn xã.',
    content: `<p>Hướng tới kỷ niệm Ngày Thương binh - Liệt sĩ 27/7, Đảng ủy, Hội đồng nhân dân, Ủy ban nhân dân và Mặt trận Tổ quốc xã Mỹ Thiện đã thành lập các đoàn đến thăm hỏi, động viên và trao tặng các phần quà cho các gia đình chính sách, người có công với cách mạng.</p>
    <p>Tại các nơi đến thăm, đại diện lãnh đạo xã Mỹ Thiện đã ân cần hỏi thăm sức khỏe, đời sống của các thương bệnh binh, gia đình liệt sĩ; đồng thời bày tỏ lòng biết ơn sâu sắc trước những cống hiến, sinh của các thế hệ cha anh đi trước vì sự nghiệp giải phóng dân tộc, thống nhất đất nước.</p>
    <p>Mỗi phần quà trị giá 1.000.000 đồng cùng các nhu yếu phẩm đã được trao tận tay các hộ gia đình. Đại diện các gia đình chính sách cũng bày tỏ niềm xúc động và cảm ơn sự quan tâm chu đáo của chính quyền xã Mỹ Thiện.</p>`,
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
    content: `<p><strong>Văn phòng Xã hội Xã Mỹ Thiện xin thông báo đến toàn thể nhân dân và các đối tượng thụ hưởng chính sách bảo trợ xã hội về lịch chi trả như sau:</strong></p>
    <ul>
      <li><strong>Thời gian chi trả:</strong> Ngày 20/07/2026 và 21/07/2026 (Buổi sáng: 08h00 - 11h00 | Buổi chiều: 14h00 - 16h30).</li>
      <li><strong>Địa điểm:</strong> Hội trường Bộ phận Một cửa - UBND Xã Mỹ Thiện.</li>
      <li><strong>Giấy tờ mang theo:</strong> Căn cước công dân (CCCD) gắn chip bản gốc, Sổ nhận trợ cấp hoặc giấy ủy quyền hợp lệ.</li>
    </ul>`,
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    views: 520,
    created_at: '2026-07-16 14:00:00',
    updated_at: '2026-07-16 14:00:00'
  },
  {
    id: 3,
    title: 'Hướng dẫn làm thủ tục cấp thẻ Bảo hiểm Y tế miễn phí cho người cao tuổi từ 75 tuổi trở lên',
    slug: 'huong-dan-lam-thu-tuc-cap-the-bhyt-mien-phi-cho-nguoi-cao-tuoi',
    category_id: 'bao-hiem-y-te',
    type: 'news',
    summary: 'Theo quy định mới về chính sách bảo vệ sức khỏe người cao tuổi, tất cả công dân từ 75 tuổi trở lên thường trú tại xã Mỹ Thiện được ngân sách hỗ trợ 100% tiền đóng BHYT.',
    content: `<p>Thực hiện chính sách an sinh xã hội nâng cao chăm sóc sức khỏe người cao tuổi, UBND Xã Mỹ Thiện phối hợp với Bảo hiểm Xã hội triển khai cấp thẻ BHYT miễn phí cho công dân từ 75 tuổi trở lên.</p>
    <h3>Hồ sơ chuẩn bị:</h3>
    <ol>
      <li>Tờ khai tham gia BHYT (Mẫu TK1-TS) - Cung cấp miễn phí tại bộ phận Một cửa.</li>
      <li>Bản sao Căn cước công dân.</li>
    </ol>`,
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    views: 289,
    created_at: '2026-07-10 10:15:00',
    updated_at: '2026-07-10 10:15:00'
  },
  {
    id: 4,
    title: 'Tuyên truyền kỹ năng phòng chống đuối nước và bảo vệ an toàn cho trẻ em trong mùa hè 2026',
    slug: 'tuyen-truyen-ky-nang-phong-chong-duoi-nuoc-tre-em-he-2026',
    category_id: 'tre-em-binh-dang',
    type: 'news',
    summary: 'Nhằm đảm bảo an toàn tuyệt đối cho trẻ em trong dịp nghỉ hè, Văn phòng Xã hội phối hợp với Đoàn Thanh niên xã Mỹ Thiện tổ chức chuỗi hoạt động trang bị kỹ năng sống.',
    content: `<p>Dịp hè là thời gian học sinh nghỉ học, nguy cơ xảy ra tai nạn thương tích, đặc biệt là tai nạn đuối nước tại các vùng sông nước sông rạch gia tăng.</p>`,
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    views: 198,
    created_at: '2026-07-08 16:45:00',
    updated_at: '2026-07-08 16:45:00'
  },
  {
    id: 5,
    title: 'Thông báo tiếp nhận đăng ký nhu cầu học nghề và giới thiệu việc làm đợt 2 năm 2026',
    slug: 'thong-bao-tiep-nhan-dang-ky-hoc-nghe-viec-lam-dot-2-2026',
    category_id: 'lao-dong',
    type: 'announcement',
    summary: 'Chương trình hỗ trợ đào tạo nghề ngắn hạn cho lao động nông thôn (May công nghiệp, Kỹ thuật điện dân dụng, Trồng cây ăn trái chất lượng cao) hoàn toàn miễn học phí.',
    content: `<p>Văn phòng Xã hội Xã Mỹ Thiện thông báo tuyển sinh các lớp học nghề ngắn hạn dành cho người lao động có hộ khẩu thường trú tại địa phương.</p>`,
    image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    views: 310,
    created_at: '2026-07-05 08:30:00',
    updated_at: '2026-07-05 08:30:00'
  }
];

const sampleTenders = [
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
  },
  {
    id: 2,
    code: 'GT-MT-2026-02',
    title: 'Gói thầu số 02: Nâng cấp, sửa chữa Hạng mục Sân chơi vận động và Dụng cụ thể thao ngoài trời cho trẻ em xã Mỹ Thiện',
    budget: '480.000.000 VNĐ',
    investor: 'Ủy ban nhân dân Xã Mỹ Thiện',
    status: 'Đang mời thầu',
    field: 'Xây lắp & Thiết bị',
    deadline: '2026-08-10 16:30:00',
    published_at: '2026-07-05 10:00:00',
    content: `Thi công lắp đặt cụm thiết bị thể thao công cộng ngoài trời.`
  }
];

const sampleServices = [
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
  },
  {
    id: 2,
    code: 'TTHC-XH-02',
    title: 'Cấp thẻ Bảo hiểm Y tế miễn phí cho đối tượng bảo trợ xã hội, người thuộc hộ nghèo và cận nghèo',
    category: 'Bảo hiểm Y tế',
    level: 'Dịch vụ công Trực tuyến Một phần',
    time_limit: '05 ngày làm việc',
    fee: 'Miễn phí',
    authority: 'UBND Xã Mỹ Thiện phối hợp BHXH Huyện',
    steps: ['Bước 1: Nộp tờ khai TK1-TS', 'Bước 2: Cấp thẻ'],
    dossier: ['Tờ khai TK1-TS', 'Giấy tờ chứng minh']
  }
];

const sampleContacts = [
  {
    id: 1,
    fullname: 'Nguyễn Văn An',
    phone: '0912345678',
    email: 'nguyenvanan@gmail.com',
    address: 'Trụ sở UBND Xã Mỹ Thiện, Tổ 10, Ấp 3, Xã Mỹ Thiện, Tỉnh Đồng Tháp',
    title: 'Hỏi về thời gian làm lại thẻ BHYT bị mất cho người cao tuổi',
    content: 'Cho tôi hỏi cha tôi 80 tuổi bị mất thẻ BHYT, làm lại cấp lại mất bao lâu?',
    status: 'Đã trả lời',
    reply: 'Chào ông An, ông vui lòng mang CCCD của cụ đến Bộ phận Một cửa xã Mỹ Thiện.',
    created_at: '2026-07-14 10:20:00'
  }
];

// Local Data Object
let dbData = {
  posts: [],
  tenders: [],
  services: [],
  contacts: [],
  settings: {
    site_title: 'CỔNG THÔNG TIN ĐIỆN TỬ PHÒNG VĂN HOÁ XÃ HỘI XÃ MỸ THIỆN',
    sub_title: 'ỦY BAN NHÂN DÂN XÃ MỸ THIỆN - BỘ PHẬN MỘT CỬA & PHÒNG VĂN HOÁ XÃ HỘI',
    address: 'Trụ sở UBND Xã Mỹ Thiện, Tổ 10, Ấp 3, Xã Mỹ Thiện, Tỉnh Đồng Tháp',
    phone: '0273 3855 123 - Hotline: 0918 456 789',
    email: 'phongvanhoaxahoi@mythien.tiengiang.gov.vn',
    working_hours: 'Thứ 2 - Thứ 6: Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
    banner_announcement: 'Chào mừng Quý công dân đến với Cổng Dịch vụ công & Thông tin Phòng Văn hóa Xã hội Xã Mỹ Thiện.'
  }
};

// Auto Sync Supabase if connected
async function syncWithSupabase() {
  if (!supabase) return;
  try {
    const { data: posts, error } = await supabase.from('posts').select('*').order('id', { ascending: false });
    if (posts) dbData.posts = posts;

    const { data: tenders } = await supabase.from('tenders').select('*').order('id', { ascending: false });
    if (tenders) dbData.tenders = tenders;

    const { data: services } = await supabase.from('services').select('*');
    if (services) dbData.services = services;

    const { data: contacts } = await supabase.from('contacts').select('*').order('id', { ascending: false });
    if (contacts) dbData.contacts = contacts;
    
    // Fetch users
    const { data: users } = await supabase.from('users').select('*');
    if (users) dbData.users = users;

    // Fetch categories
    const { data: categories } = await supabase.from('categories').select('*');
    if (categories) dbData.categories = categories;

    saveLocal();
    console.log('Successfully loaded latest database from Supabase!');
  } catch (err) {
    console.error('Error syncing with Supabase:', err);
  }
}

syncWithSupabase();

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
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      dbData = { ...dbData, ...parsed };
    } catch (e) {
      console.error('Error parsing DB_FILE, recreating...');
    }
  }
  
  // Ensure arrays exist in all cases
  dbData.posts = dbData.posts || [];
  dbData.tenders = dbData.tenders || [];
  dbData.services = dbData.services || [];
  dbData.contacts = dbData.contacts || [];
  dbData.users = dbData.users || [];
  dbData.categories = dbData.categories || [];
  dbData.settings = dbData.settings || {};

  saveLocal();
}

initLocal();

module.exports = {
  init: async () => {
    await syncWithSupabase();
  },
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
      list = list.filter(p => (p.title && p.title.toLowerCase().includes(q)) || (p.summary && p.summary.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getPostById: (id) => dbData.posts.find(p => p.id === parseInt(id)),
  getPostBySlug: (slug) => dbData.posts.find(p => p.slug === slug),
  createPost: async (postData) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const insertPayload = {
      title: postData.title,
      slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category_id: postData.category_id || 'an-sinh',
      type: postData.type || 'news',
      summary: postData.summary || '',
      content: postData.content || '',
      image_url: postData.image_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
      pdf_url: postData.pdf_url || '',
      pdf_name: postData.pdf_name || '',
      is_featured: postData.is_featured === true || postData.is_featured === 'true' || postData.is_featured === 'on',
      views: 0,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('posts').insert([insertPayload]).select();
        if (error) {
          console.error('❌ Supabase Insert Error:', error.message);
          const maxId = dbData.posts.length > 0 ? Math.max(...dbData.posts.map(p => p.id)) + 1 : 1;
          insertPayload.id = maxId;
          const { data: data2, error: error2 } = await supabase.from('posts').upsert([insertPayload]).select();
          if (error2) console.error('❌ Supabase Upsert Error:', error2.message);
          else if (data2 && data2[0]) insertPayload.id = data2[0].id;
        } else if (data && data[0]) {
          insertPayload.id = data[0].id;
          console.log('✅ Supabase Insert Successful with ID:', insertPayload.id);
        }
      } catch (err) {
        console.error('Supabase exception on createPost:', err.message);
      }
    }

    if (!insertPayload.id) {
      insertPayload.id = dbData.posts.length > 0 ? Math.max(...dbData.posts.map(p => p.id)) + 1 : 1;
    }

    dbData.posts.unshift(insertPayload);
    saveLocal();
    return insertPayload;
  },
  updatePost: async (id, postData) => {
    const numericId = parseInt(id);
    const idx = dbData.posts.findIndex(p => p.id === numericId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const updatedItem = {
      ...(idx !== -1 ? dbData.posts[idx] : {}),
      ...postData,
      id: numericId,
      is_featured: postData.is_featured === true || postData.is_featured === 'true' || postData.is_featured === 'on',
      updated_at: now
    };

    if (idx !== -1) {
      dbData.posts[idx] = updatedItem;
    } else {
      dbData.posts.unshift(updatedItem);
    }
    saveLocal();

    if (supabase) {
      try {
        const { error } = await supabase.from('posts').upsert([updatedItem]);
        if (error) console.error('❌ Supabase Update Error:', error.message);
        else console.log('✅ Supabase Update Successful!');
      } catch (e) {
        console.error('Supabase update exception:', e.message);
      }
    }

    return updatedItem;
  },
  deletePost: async (id) => {
    const numericId = parseInt(id);
    const idx = dbData.posts.findIndex(p => p.id === numericId);
    if (idx !== -1) {
      dbData.posts.splice(idx, 1);
      saveLocal();
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('posts').delete().eq('id', numericId);
        if (error) console.error('❌ Supabase Delete Error:', error.message);
      } catch (e) {
        console.error('Supabase delete exception:', e.message);
      }
    }

    return true;
  },
  incrementPostViews: (id) => {
    const post = dbData.posts.find(p => p.id === parseInt(id));
    if (post) {
      post.views = (post.views || 0) + 1;
      saveLocal();

      if (supabase) {
        supabase.from('posts').update({ views: post.views }).eq('id', parseInt(id)).then();
      }
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
  createTender: async (data) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const insertPayload = {
      code: data.code || `GT-2026-${Math.floor(Math.random()*1000)}`,
      title: data.title,
      budget: data.budget || 'Thỏa thuận',
      investor: data.investor || 'UBND Xã',
      status: data.status || 'Đang mời thầu',
      field: data.field || 'Mua sắm công',
      deadline: data.deadline || now,
      published_at: now,
      content: data.content || ''
    };
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('tenders').insert([insertPayload]).select();
        if (error) console.error("Tender insert error:", error);
        else if (inserted && inserted.length > 0) {
          dbData.tenders.unshift(inserted[0]);
          saveLocal();
          return inserted[0];
        }
      } catch(err){}
    }
    return null;
  },
  deleteTender: async (id) => {
    if (supabase) {
      await supabase.from('tenders').delete().eq('id', parseInt(id));
    }
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
  createService: async (data) => {
    const insertPayload = {
      code: data.code || `TTHC-0${Math.floor(Math.random()*1000)}`,
      title: data.title,
      category: data.category || 'Chính sách Xã hội',
      level: data.level || 'Dịch vụ công Trực tuyến',
      time_limit: data.time_limit || '05 ngày',
      fee: data.fee || 'Miễn phí',
      authority: data.authority || 'UBND Xã',
      steps: Array.isArray(data.steps) ? data.steps : (data.steps ? data.steps.split('\n') : []),
      dossier: Array.isArray(data.dossier) ? data.dossier : (data.dossier ? data.dossier.split('\n') : [])
    };
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase.from('services').insert([insertPayload]).select();
        if (error) console.error("Service insert error:", error);
        else if (inserted && inserted.length > 0) {
          dbData.services.push(inserted[0]);
          saveLocal();
          return inserted[0];
        }
      } catch(err){}
    }
    return null;
  },
  deleteService: async (id) => {
    if (supabase) {
      await supabase.from('services').delete().eq('id', parseInt(id));
    }
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

    if (supabase) {
      supabase.from('contacts').insert([newContact]).then();
    }

    return newContact;
  },
  replyContact: (id, replyText) => {
    const contact = dbData.contacts.find(c => c.id === parseInt(id));
    if (contact) {
      contact.reply = replyText;
      contact.status = 'Đã trả lời';
      saveLocal();

      if (supabase) {
        supabase.from('contacts').update({ reply: replyText, status: 'Đã trả lời' }).eq('id', parseInt(id)).then();
      }

      return contact;
    }
    return null;
  },

  // Settings
  getSettings: () => dbData.settings
};
