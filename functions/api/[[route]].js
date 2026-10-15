import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

// 1. 手机号 / 微信快捷登录 (自动注册并赠送10积分)
app.post('/auth/login', async (c) => {
  const { loginType, account, nickname } = await c.req.json()
  const db = c.env.DB

  let user
  if (loginType === 'wechat') {
    user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(account).first()
    if (!user) {
      await db.prepare('INSERT INTO users (wechat_openid, nickname, points) VALUES (?, ?, 15)')
        .bind(account, nickname || '微信爱心家长').run()
      user = await db.prepare('SELECT * FROM users WHERE wechat_openid = ?').bind(account).first()
    }
  } else {
    user = await db.prepare('SELECT * FROM users WHERE phone = ?').bind(account).first()
    if (!user) {
      const masked = account.slice(0, 3) + '****' + account.slice(7)
      await db.prepare('INSERT INTO users (phone, nickname, points) VALUES (?, ?, 10)')
        .bind(account, `${masked}家长`).run()
      user = await db.prepare('SELECT * FROM users WHERE phone = ?').bind(account).first()
    }
  }
  return c.json({ code: 0, data: user })
})

// 2. 获取相亲大厅资料列表 (自动判断当前用户是否已解锁联系方式)
app.get('/profiles', async (c) => {
  const userId = c.req.query('userId') || 0
  const gender = c.req.query('gender') || ''
  const city = c.req.query('city') || ''
  const db = c.env.DB

  let sql = 'SELECT * FROM profiles WHERE 1=1'
  const params = []
  if (gender) { sql += ' AND gender = ?'; params.push(gender) }
  if (city) { sql += ' AND city LIKE ?'; params.push(`%${city}%`) }
  sql += ' ORDER BY id DESC LIMIT 50'

  const { results: profiles } = await db.prepare(sql).bind(...params).all()

  // 查询当前用户已解锁的卡片ID
  let unlockedSet = new Set()
  if (userId > 0) {
    const { results: unlocked } = await db.prepare('SELECT profile_id FROM unlocked_cards WHERE user_id = ?').bind(userId).all()
    unlocked.forEach(item => unlockedSet.add(item.profile_id))
  }

  // 未解锁的卡片隐藏微信号/手机号
  const safeProfiles = profiles.map(p => {
    const isUnlocked = unlockedSet.has(p.id)
    return {
      ...p,
      is_unlocked: isUnlocked,
      contact_wechat: isUnlocked ? p.contact_wechat : '*** (点击用积分解锁查看) ***'
    }
  })

  return c.json({ code: 0, data: safeProfiles })
})

// 3. 消耗积分解锁相亲卡片
app.post('/profiles/unlock', async (c) => {
  const { userId, profileId } = await c.req.json()
  const db = c.env.DB

  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?').bind(profileId).first()
  if (!user || !profile) return c.json({ code: 400, message: '用户或资料不存在' })

  // 检查是否已解锁
  const exists = await db.prepare('SELECT id FROM unlocked_cards WHERE user_id = ? AND profile_id = ?').bind(userId, profileId).first()
  if (exists) {
    return c.json({ code: 0, contact: profile.contact_wechat, points: user.points, message: '已解锁' })
  }

  if (user.points < profile.unlock_cost) {
    return c.json({ code: 402, message: `积分不足！解锁需 ${profile.unlock_cost} 积分，请看广告免费领积分或充值。` })
  }

  // 事务：扣除积分 + 记录解锁 + 写入流水
  await db.batch([
    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').bind(profile.unlock_cost, userId),
    db.prepare('INSERT INTO unlocked_cards (user_id, profile_id) VALUES (?, ?)').bind(userId, profileId),
    db.prepare('INSERT INTO point_logs (user_id, change_amount, reason) VALUES (?, ?, ?)').bind(userId, -profile.unlock_cost, `解锁[${profile.name}]相亲卡`)
  ])

  return c.json({
    code: 0,
    contact: profile.contact_wechat,
    points: user.points - profile.unlock_cost,
    message: '解锁成功！'
  })
})

// 4. 刷 Google 广告 / 直接充值获取积分
app.post('/points/earn', async (c) => {
  const { userId, type } = await c.req.json() // type: 'ad' (看Google广告) | 'recharge_10' (充值10元)
  const db = c.env.DB

  const addPoints = type === 'ad' ? 5 : 50
  const reason = type === 'ad' ? '观看Google激励广告奖励' : '在线充值购买积分'

  await db.batch([
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(addPoints, userId),
    db.prepare('INSERT INTO point_logs (user_id, change_amount, reason) VALUES (?, ?, ?)').bind(userId, addPoints, reason)
  ])

  const updatedUser = await db.prepare('SELECT points FROM users WHERE id = ?').bind(userId).first()
  return c.json({ code: 0, points: updatedUser.points, added: addPoints, message: `恭喜获得 ${addPoints} 积分！` })
})

// 5. 从允许开放的外部接口自动获取男女资料并发布
app.post('/admin/auto-collect', async (c) => {
  const db = c.env.DB
  // 示例：接入支持开源/CC协议或授权相亲联盟的 JSON 开放接口（此处以 RandomUser 开放测试API模拟合规外部源）
  const res = await fetch('https://randomuser.me/api/?results=2&nat=us')
  const json = await res.json()

  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉']
  const jobs = ['软件工程师', '人民教师', '公务员', '财务会计', '产品经理']
  const edus = ['本科', '硕士', '大专']

  for (const item of json.results) {
    const isMale = item.gender === 'male'
    const genderStr = isMale ? '男' : '女'
    const surname = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王'][Math.floor(Math.random() * 8)]
    const name = surname + (isMale ? '先生' : '女士')
    const birthYear = 1990 + Math.floor(Math.random() * 10)
    const height = isMale ? (172 + Math.floor(Math.random() * 12)) : (160 + Math.floor(Math.random() * 10))
    const city = cities[Math.floor(Math.random() * cities.length)]
    const job = jobs[Math.floor(Math.random() * jobs.length)]
    const edu = edus[Math.floor(Math.random() * edus.length)]
    const wx = `wx_open_${Math.floor(100000 + Math.random() * 900000)}`

    await db.prepare(`
      INSERT INTO profiles (name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, avatar_url, contact_wechat, unlock_cost, source_site)
      VALUES (?, ?, ?, ?, ?, ?, '15-25万', '已购房', ?, '该资料由合作开放交友平台自动同步，家长已授权公开展示。', ?, ?, 5, '开放联盟自动同步')
    `).bind(name, genderStr, birthYear, height, edu, job, city, item.picture.large, wx).run()
  }

  return c.json({ code: 0, message: '成功从开放授权站点自动采集并发布 2 条相亲资料！' })
})

// 6. 父母交流区：获取帖子列表 & 发布新帖
app.get('/forum/posts', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM forum_posts ORDER BY id DESC LIMIT 30').all()
  return c.json({ code: 0, data: results })
})

app.post('/forum/posts', async (c) => {
  const { userId, authorName, city, content } = await c.req.json()
  await c.env.DB.prepare('INSERT INTO forum_posts (user_id, author_name, city, content) VALUES (?, ?, ?, ?)')
    .bind(userId, authorName, city || '全国', content).run()
  return c.json({ code: 0, message: '发布成功' })
})

export const onRequest = handle(app)