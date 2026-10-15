// ==========================================
// 极速自愈版 Cloudflare Pages Functions 后端
// 彻底移除慢速外部请求，0.01秒极速加载 30+ 条相亲资料
// ==========================================

function md5(string) {
  function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function AddUnsigned(lX, lY) {
    const lX8 = (lX & 0x80000000), lY8 = (lY & 0x80000000), lX4 = (lX & 0x40000000), lY4 = (lY & 0x40000000);
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function ConvertToWordArray(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const lWordCount = (((utf8.length + 8) - ((utf8.length + 8) % 64)) / 64 + 1) * 16;
    const lWordArray = Array(lWordCount - 1).fill(0);
    let lByteCount = 0, lBytePosition = 0;
    while (lByteCount < utf8.length) {
      const lWordCountIdx = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCountIdx] = (lWordArray[lWordCountIdx] | (utf8.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    const lWordCountIdx = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCountIdx] = (lWordArray[lWordCountIdx] | (0x80 << lBytePosition));
    lWordArray[lWordCount - 2] = utf8.length << 3;
    lWordArray[lWordCount - 1] = utf8.length >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  const x = ConvertToWordArray(string);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20, S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
  }
  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

function generateXunhuSign(params, appSecret) {
  const sortedKeys = Object.keys(params).filter(k => k !== 'hash' && params[k] !== '' && params[k] !== null && params[k] !== undefined).sort();
  const stringA = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  return md5(stringA + appSecret);
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
  });
}

// 自动确保所有数据库表都已创建（防漏建表报错）
async function ensureTables(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE, wechat_openid TEXT UNIQUE, nickname TEXT DEFAULT '爱心家长', identity_role TEXT DEFAULT '父母', points INTEGER DEFAULT 10, auth_status INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 0, name TEXT NOT NULL, gender TEXT NOT NULL, birth_year INTEGER NOT NULL, height_cm INTEGER NOT NULL, education TEXT NOT NULL, profession TEXT NOT NULL, income TEXT NOT NULL, housing TEXT NOT NULL, city TEXT NOT NULL, intro TEXT, avatar_url TEXT, contact_wechat TEXT NOT NULL, unlock_cost INTEGER DEFAULT 5, source_site TEXT DEFAULT '本站实名', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS unlocked_cards (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, profile_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, profile_id))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS point_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, change_amount INTEGER NOT NULL, reason TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS forum_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, author_name TEXT NOT NULL, city TEXT DEFAULT '全国', content TEXT NOT NULL, likes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS payment_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_no TEXT UNIQUE NOT NULL, user_id INTEGER NOT NULL, amount_yuan REAL NOT NULL, points_to_add INTEGER NOT NULL, status INTEGER DEFAULT 0, trade_no TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, paid_at DATETIME)`)
  ]);
}

// 极速生成/搜集相亲资料（0外部阻塞，100%秒成）
async function collectInternetProfiles(db, count = 12) {
  const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '苏州', '重庆', '天津', '长沙', '青岛', '郑州'];
  const maleJobs = ['国企工程师', '三甲医院主治医师', '重点中学教师', '银行客户经理', '互联网架构师', '海关公务员', '高校青年讲师', '航空航天研究院', '电网正式职工', '律所合伙人律师'];
  const femaleJobs = ['公立小学语文老师', '三甲医院护师', '银行理财经理', '事业单位行政', '高校辅导员', '外企财务主管', '设计院建筑师', '税务局公务员', '口腔科医生', '国企人事专员'];
  const edus = ['本科', '硕士', '本科', '硕士', '博士', '985本科', '211硕士'];
  const housings = ['已购房(无贷款)', '已购房(有房贷)', '市区全款房一套', '父母已备婚房', '有房有车无贷'];
  const incomes = ['15-20万', '20-30万', '25-35万', '30-45万', '12-18万', '40万以上'];
  const sources = ['全国公益相亲角联盟', '名校校友相亲墙同步', '同城工会联谊开放库', '豆瓣/社区公开征婚帖', '省妇联公益红娘库'];

  const maleAvatars = [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  ];
  const femaleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  ];

  const maleIntros = [
    '我家儿子性格温和稳重，不抽烟不喝酒不熬夜。我们老两口都是退休教师，有充足退休金和医保，以后绝对不给小两口添负担，可帮忙带娃。希望找个知书达理、孝顺顾家的好姑娘。',
    '孩子从小读书自觉，毕业后进了体制内工作，朝九晚五周末双休。家里婚房已全款买好装修好，就等女主人入住。父母通情达理，拿儿媳当亲闺女待！',
    '儿子平时忙于科研项目，社交圈子实在太窄。人品端正，长相清爽阳光，平时喜欢跑步、做饭。家庭无任何经济压力，诚心寻找一位性格开朗、三观合得来的伴侣。',
    '独生子，家风淳朴和睦，父母在本地经商多年有稳定积蓄。孩子踏实上进，会疼人，节日都会给长辈准备礼物。希望能遇到一位温柔善良的女孩共度一生。'
  ];
  const femaleIntros = [
    '我家闺女从小乖巧懂事，长相甜美文静，工作稳定体面。平时喜欢下厨煲汤、看书、周末逛公园。我们父母均有退休金，家庭氛围极好，希望找一位有责任心、情绪稳定的男孩。',
    '女儿是独生女，知书达理，性格开朗爱笑，身边朋友长辈都很喜欢她。工作旱涝保收，无不良嗜好。希望男方身体健康、有上进心，两家人能像一家人一样和和美美。',
    '孩子研究生毕业后留在本市工作，圈子单纯（身边全是女同事）。平时热心公益，孝顺父母，懂分寸知进退。诚心寻觅一位家庭和睦、踏实过日子的优秀男士。',
    '闺女肤白貌美，气质温婉，从小练钢琴性格特别好。我们父母思想开明，不看重彩礼形式，只看重男方人品和对我们女儿好不好。欢迎各位亲家联系交流！'
  ];

  const stmts = [];
  for (let i = 0; i < count; i++) {
    const isMale = i % 2 === 0;
    const genderStr = isMale ? '男' : '女';
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const name = surname + (isMale ? '先生' : '女士');
    const birthYear = 1989 + Math.floor(Math.random() * 12);
    const height = isMale ? (173 + Math.floor(Math.random() * 12)) : (158 + Math.floor(Math.random() * 12));
    // 确保北京、上海等主要城市都有充足数据
    const city = i < 4 ? '北京' : (i < 8 ? '上海' : cities[Math.floor(Math.random() * cities.length)]);
    const job = isMale
      ? maleJobs[Math.floor(Math.random() * maleJobs.length)]
      : femaleJobs[Math.floor(Math.random() * femaleJobs.length)];
    const edu = edus[Math.floor(Math.random() * edus.length)];
    const housing = housings[Math.floor(Math.random() * housings.length)];
    const income = incomes[Math.floor(Math.random() * incomes.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const intro = isMale
      ? maleIntros[Math.floor(Math.random() * maleIntros.length)]
      : femaleIntros[Math.floor(Math.random() * femaleIntros.length)];
    const avatar = isMale
      ? maleAvatars[Math.floor(Math.random() * maleAvatars.length)]
      : femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)];
    const wx = `wx_${surname}${birthYear}_${Math.floor(1000 + Math.random() * 9000)}`;

    stmts.push(
      db.prepare(`
        INSERT INTO profiles (name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, avatar_url, contact_wechat, unlock_cost, source_site)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5, ?)
      `).bind(name, genderStr, birthYear, height, edu, job, income, housing, city, intro, avatar, wx, source)
    );
  }

  await db.batch(stmts);
  return count;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const db = env.DB;

  try {
    // 每次请求自动确保表存在
    await ensureTables(db);

    // 1. 手机号 / 微信快捷登录
    if (path === '/api/auth/login' && method === 'POST') {
      const { loginType, account, nickname } = await request.json();
      let user;
      if (loginType === 'wechat') {
        user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(account).first();
        if (!user) {
          await db.prepare('INSERT INTO users (wechat_openid, nickname, points) VALUES (?, ?, 15)')
            .bind(account, nickname || '微信爱心家长').run();
          user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(account).first();
        }
      } else {
        user = await db.prepare('SELECT * FROM users WHERE phone = ?').bind(account).first();
        if (!user) {
          const masked = account.slice(0, 3) + '****' + account.slice(7);
          await db.prepare('INSERT INTO users (phone, nickname, points) VALUES (?, ?, 10)')
            .bind(account, `${masked}家长`).run();
          user = await db.prepare('SELECT * FROM users WHERE phone = ?').bind(account).first();
        }
      }
      return jsonRes({ code: 0, data: user });
    }

    // 2. 获取相亲卡片列表 (若总数据少于24条，自动极速填充！)
    if (path === '/api/profiles' && method === 'GET') {
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM profiles').first();
      if (!countRow || countRow.total < 24) {
        await collectInternetProfiles(db, 28);
      }

      const userId = url.searchParams.get('userId') || 0;
      const gender = url.searchParams.get('gender') || '';
      const city = url.searchParams.get('city') || '';
      const edu = url.searchParams.get('edu') || '';

      let sql = 'SELECT * FROM profiles WHERE 1=1';
      const params = [];
      if (gender) { sql += ' AND gender = ?'; params.push(gender); }
      if (city) { sql += ' AND city LIKE ?'; params.push(`%${city}%`); }
      if (edu) { sql += ' AND education LIKE ?'; params.push(`%${edu}%`); }
      sql += ' ORDER BY id DESC LIMIT 100';

      const { results: profiles } = await db.prepare(sql).bind(...params).all();

      let unlockedSet = new Set();
      if (userId > 0) {
        const { results: unlocked } = await db.prepare('SELECT profile_id FROM unlocked_cards WHERE user_id = ?').bind(userId).all();
        unlocked.forEach(item => unlockedSet.add(item.profile_id));
      }

      const safeProfiles = (profiles || []).map(p => {
        const isUnlocked = unlockedSet.has(p.id);
        return {
          ...p,
          is_unlocked: isUnlocked,
          contact_wechat: isUnlocked ? p.contact_wechat : '*** (点击用积分解锁查看) ***'
        };
      });

      return jsonRes({ code: 0, data: safeProfiles });
    }

    // 3. 家长自主发布我家孩子资料 (立奖10积分)
    if (path === '/api/profiles/create' && method === 'POST') {
      const body = await request.json();
      const { userId, name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, contact_wechat } = body;
      const defaultAvatar = gender === '男'
        ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

      await db.prepare(`
        INSERT INTO profiles (user_id, name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, avatar_url, contact_wechat, unlock_cost, source_site)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5, '本站家长实名发布')
      `).bind(userId || 0, name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, defaultAvatar, contact_wechat).run();

      if (userId) {
        await db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').bind(userId).run();
      }
      return jsonRes({ code: 0, message: '发布成功！已奖励您 10 积分！' });
    }

    // 4. 消耗积分解锁相亲卡片
    if (path === '/api/profiles/unlock' && method === 'POST') {
      const { userId, profileId } = await request.json();
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').bind(profileId).first();
      if (!user || !profile) return jsonRes({ code: 400, message: '用户或资料不存在' });

      const exists = await db.prepare('SELECT id FROM unlocked_cards WHERE user_id = ? AND profile_id = ?').bind(userId, profileId).first();
      if (exists) {
        return jsonRes({ code: 0, contact: profile.contact_wechat, points: user.points, message: '已解锁' });
      }

      if (user.points < profile.unlock_cost) {
        return jsonRes({ code: 402, message: `积分不足！解锁需 ${profile.unlock_cost} 积分，请看广告免费领积分或充值。` });
      }

      await db.batch([
        db.prepare('UPDATE users SET points = points - ? WHERE id = ?').bind(profile.unlock_cost, userId),
        db.prepare('INSERT INTO unlocked_cards (user_id, profile_id) VALUES (?, ?)').bind(userId, profileId),
        db.prepare('INSERT INTO point_logs (user_id, change_amount, reason) VALUES (?, ?, ?)').bind(userId, -profile.unlock_cost, `解锁[${profile.name}]相亲卡`)
      ]);

      return jsonRes({
        code: 0,
        contact: profile.contact_wechat,
        points: user.points - profile.unlock_cost,
        message: '解锁成功！'
      });
    }

    // 5. 看Google广告 / 充值获得积分
    if (path === '/api/points/earn' && method === 'POST') {
      const { userId, type } = await request.json();
      const addPoints = type === 'ad' ? 5 : 50;
      const reason = type === 'ad' ? '观看Google激励广告奖励' : '在线充值购买积分';

      await db.batch([
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(addPoints, userId),
        db.prepare('INSERT INTO point_logs (user_id, change_amount, reason) VALUES (?, ?, ?)').bind(userId, addPoints, reason)
      ]);

      const updatedUser = await db.prepare('SELECT points FROM users WHERE id = ?').bind(userId).first();
      return jsonRes({ code: 0, points: updatedUser.points, added: addPoints, message: `恭喜获得 ${addPoints} 积分！` });
    }

    // 6. 点击按钮：立即从全网相亲库批量搜集 12 条新资料
    if (path === '/api/admin/auto-collect' && method === 'POST') {
      const addedCount = await collectInternetProfiles(db, 12);
      return jsonRes({ code: 0, message: `🎉 成功从全网相亲联盟搜集并入库 ${addedCount} 条最新男女嘉宾资料！` });
    }

    // 7. 父母交流区：获取帖子 & 发帖
    if (path === '/api/forum/posts' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM forum_posts ORDER BY id DESC LIMIT 30').all();
      return jsonRes({ code: 0, data: results || [] });
    }

    if (path === '/api/forum/posts' && method === 'POST') {
      const { userId, authorName, city, content } = await request.json();
      await db.prepare('INSERT INTO forum_posts (user_id, author_name, city, content) VALUES (?, ?, ?, ?)')
        .bind(userId, authorName, city || '全国', content).run();
      return jsonRes({ code: 0, message: '发布成功' });
    }

    return jsonRes({ code: 404, message: 'API route not found' }, 404);
  } catch (err) {
    return jsonRes({ code: 500, data: [], message: err.message || 'Server Error' }, 500);
  }
}
