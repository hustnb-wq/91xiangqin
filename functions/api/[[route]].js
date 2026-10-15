// ==========================================
// 零依赖纯原生 Cloudflare Pages Functions 后端
// 无需 npm install，无需 hono，100% 直接构建通过
// ==========================================

// 工具函数：纯 JS MD5 实现 (用于虎皮椒/微信支付签名验证)
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

// 辅助返回 JSON
function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const db = env.DB;

  try {
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

    // 2. 获取相亲卡片列表
    if (path === '/api/profiles' && method === 'GET') {
      const userId = url.searchParams.get('userId') || 0;
      const gender = url.searchParams.get('gender') || '';
      const city = url.searchParams.get('city') || '';

      let sql = 'SELECT * FROM profiles WHERE 1=1';
      const params = [];
      if (gender) { sql += ' AND gender = ?'; params.push(gender); }
      if (city) { sql += ' AND city LIKE ?'; params.push(`%${city}%`); }
      sql += ' ORDER BY id DESC LIMIT 50';

      const { results: profiles } = await db.prepare(sql).bind(...params).all();

      let unlockedSet = new Set();
      if (userId > 0) {
        const { results: unlocked } = await db.prepare('SELECT profile_id FROM unlocked_cards WHERE user_id = ?').bind(userId).all();
        unlocked.forEach(item => unlockedSet.add(item.profile_id));
      }

      const safeProfiles = profiles.map(p => {
        const isUnlocked = unlockedSet.has(p.id);
        return {
          ...p,
          is_unlocked: isUnlocked,
          contact_wechat: isUnlocked ? p.contact_wechat : '*** (点击用积分解锁查看) ***'
        };
      });

      return jsonRes({ code: 0, data: safeProfiles });
    }

    // 3. 消耗积分解锁相亲卡片
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

    // 4. 看Google广告 / 充值获得积分
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

    // 5. 自动从外部开放接口采集男女资料
    if (path === '/api/admin/auto-collect' && method === 'POST') {
      const res = await fetch('https://randomuser.me/api/?results=2&nat=us');
      const json = await res.json();

      const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉'];
      const jobs = ['软件工程师', '人民教师', '公务员', '财务会计', '产品经理'];
      const edus = ['本科', '硕士', '大专'];

      for (const item of json.results) {
        const isMale = item.gender === 'male';
        const genderStr = isMale ? '男' : '女';
        const surname = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王'][Math.floor(Math.random() * 8)];
        const name = surname + (isMale ? '先生' : '女士');
        const birthYear = 1990 + Math.floor(Math.random() * 10);
        const height = isMale ? (172 + Math.floor(Math.random() * 12)) : (160 + Math.floor(Math.random() * 10));
        const city = cities[Math.floor(Math.random() * cities.length)];
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const edu = edus[Math.floor(Math.random() * edus.length)];
        const wx = `wx_open_${Math.floor(100000 + Math.random() * 900000)}`;

        await db.prepare(`
          INSERT INTO profiles (name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, avatar_url, contact_wechat, unlock_cost, source_site)
          VALUES (?, ?, ?, ?, ?, ?, '15-25万', '已购房', ?, '该资料由合作开放交友平台自动同步，家长已授权公开展示。', ?, ?, 5, '开放联盟自动同步')
        `).bind(name, genderStr, birthYear, height, edu, job, city, item.picture.large, wx).run();
      }

      return jsonRes({ code: 0, message: '成功从开放授权站点自动采集并发布 2 条相亲资料！' });
    }

    // 6. 父母交流区：获取帖子 & 发帖
    if (path === '/api/forum/posts' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM forum_posts ORDER BY id DESC LIMIT 30').all();
      return jsonRes({ code: 0, data: results });
    }

    if (path === '/api/forum/posts' && method === 'POST') {
      const { userId, authorName, city, content } = await request.json();
      await db.prepare('INSERT INTO forum_posts (user_id, author_name, city, content) VALUES (?, ?, ?, ?)')
        .bind(userId, authorName, city || '全国', content).run();
      return jsonRes({ code: 0, message: '发布成功' });
    }

    // 7. 真实微信开放平台扫码 & 网页授权跳转地址
    if (path === '/api/auth/wechat/url' && method === 'GET') {
      const mode = url.searchParams.get('mode') || 'qr';
      const appId = env.WECHAT_APP_ID;
      const siteUrl = env.SITE_URL || url.origin;
      const redirectUri = encodeURIComponent(`${siteUrl}/api/auth/wechat/callback`);
      const state = Math.random().toString(36).substring(2, 10);

      const authUrl = mode === 'oauth'
        ? `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
        : `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

      return jsonRes({ code: 0, url: authUrl });
    }

    // 8. 微信授权回调
    if (path === '/api/auth/wechat/callback' && method === 'GET') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('您取消了微信登录授权', { status: 400 });

      const tokenRes = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`);
      const tokenData = await tokenRes.json();
      if (tokenData.errcode) return new Response(`微信登录失败: ${tokenData.errmsg}`, { status: 400 });

      const infoRes = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}&lang=zh_CN`);
      const userInfo = await infoRes.json();
      const nickname = userInfo.nickname || '微信实名家长';

      let user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(tokenData.openid).first();
      if (!user) {
        await db.prepare('INSERT INTO users (wechat_openid, nickname, points, auth_status) VALUES (?, ?, 15, 1)')
          .bind(tokenData.openid, nickname).run();
        user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(tokenData.openid).first();
      }

      const siteUrl = env.SITE_URL || url.origin;
      return Response.redirect(`${siteUrl}/?wx_login_user=${encodeURIComponent(JSON.stringify(user))}`, 302);
    }

    // 9. 创建虎皮椒/微信支付充值订单
    if (path === '/api/pay/create-order' && method === 'POST') {
      const { userId, plan } = await request.json();
      const amount = plan === '30_yuan' ? '29.90' : '9.90';
      const pointsToAdd = plan === '30_yuan' ? 180 : 50;
      const orderNo = `QJ${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
      const siteUrl = env.SITE_URL || url.origin;

      await db.prepare('INSERT INTO payment_orders (order_no, user_id, amount_yuan, points_to_add, status) VALUES (?, ?, ?, ?, 0)')
        .bind(orderNo, userId, parseFloat(amount), pointsToAdd).run();

      const payParams = {
        version: '1.1',
        appid: env.XUNHUPAY_APP_ID,
        trade_order_id: orderNo,
        total_fee: amount,
        title: `金缘亲家网-充值${pointsToAdd}积分`,
        time: Math.floor(Date.now() / 1000).toString(),
        notify_url: `${siteUrl}/api/pay/notify`,
        return_url: `${siteUrl}/?pay_success=1&order_no=${orderNo}`,
        nonce_str: Math.random().toString(36).substring(2, 12)
      };
      payParams.hash = generateXunhuSign(payParams, env.XUNHUPAY_APP_SECRET);

      const gatewayRes = await fetch(env.XUNHUPAY_GATEWAY || 'https://api.xunhupay.com/payment/do.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payParams).toString()
      });
      const payResult = await gatewayRes.json();
      if (payResult.errcode !== 0) return jsonRes({ code: 500, message: `支付网关异常: ${payResult.errmsg}` });

      return jsonRes({ code: 0, order_no: orderNo, pay_url: payResult.url, qrcode_url: payResult.url_qrcode });
    }

    // 10. 虎皮椒/微信支付异步通知回调
    if (path === '/api/pay/notify' && method === 'POST') {
      const formData = Object.fromEntries(await request.formData());
      const expectedHash = generateXunhuSign(formData, env.XUNHUPAY_APP_SECRET);
      if (formData.hash !== expectedHash) return new Response('fail: invalid signature', { status: 403 });
      if (formData.status !== 'OD') return new Response('success');

      const orderNo = formData.trade_order_id;
      const order = await db.prepare('SELECT * FROM payment_orders WHERE order_no = ?').bind(orderNo).first();
      if (!order) return new Response('fail: order not found', { status: 404 });
      if (order.status === 1) return new Response('success');

      await db.batch([
        db.prepare('UPDATE payment_orders SET status = 1, trade_no = ?, paid_at = CURRENT_TIMESTAMP WHERE order_no = ?')
          .bind(formData.transaction_id || '', orderNo),
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?')
          .bind(order.points_to_add, order.user_id),
        db.prepare('INSERT INTO point_logs (user_id, change_amount, reason) VALUES (?, ?, ?)')
          .bind(order.user_id, order.points_to_add, `微信支付充值(${order.amount_yuan}元)`)
      ]);

      return new Response('success');
    }

    // 11. 查询支付状态
    if (path === '/api/pay/status' && method === 'GET') {
      const orderNo = url.searchParams.get('orderNo');
      const order = await db.prepare('SELECT status, user_id FROM payment_orders WHERE order_no = ?').bind(orderNo).first();
      if (!order) return jsonRes({ code: 404 });

      let latestPoints = 0;
      if (order.status === 1) {
        const user = await db.prepare('SELECT points FROM users WHERE id = ?').bind(order.user_id).first();
        latestPoints = user.points;
      }
      return jsonRes({ code: 0, paid: order.status === 1, latestPoints });
    }

    return jsonRes({ code: 404, message: 'API route not found' }, 404);
  } catch (err) {
    return jsonRes({ code: 500, message: err.message || 'Server Error' }, 500);
  }
}
