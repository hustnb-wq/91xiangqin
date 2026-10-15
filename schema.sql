-- 1. 用户与积分表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE,
  wechat_openid TEXT UNIQUE,
  nickname TEXT DEFAULT '爱心家长',
  identity_role TEXT DEFAULT '父母',
  points INTEGER DEFAULT 10, -- 注册默认送10积分
  auth_status INTEGER DEFAULT 0, -- 0-未实名, 1-已实名
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 相亲资料卡表 (支持用户发布 + 外部开放接口自动采集)
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 0, -- 0代表系统从开放接口自动同步的资料
  name TEXT NOT NULL,
  gender TEXT NOT NULL, -- '男' 或 '女'
  birth_year INTEGER NOT NULL,
  height_cm INTEGER NOT NULL,
  education TEXT NOT NULL,
  profession TEXT NOT NULL,
  income TEXT NOT NULL,
  housing TEXT NOT NULL,
  city TEXT NOT NULL,
  intro TEXT,
  avatar_url TEXT,
  contact_wechat TEXT NOT NULL, -- 加密/需积分解锁的微信号或电话
  unlock_cost INTEGER DEFAULT 5, -- 解锁该卡片所需积分
  source_site TEXT DEFAULT '本站实名', -- 来源标识
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 积分解锁记录表 (防止重复扣费)
CREATE TABLE IF NOT EXISTS unlocked_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, profile_id)
);

-- 4. 积分流水表 (看Google广告、充值、消耗记录)
CREATE TABLE IF NOT EXISTS point_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- '观看Google广告奖励' / '在线充值' / '解锁相亲卡'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 父母交流区帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  author_name TEXT NOT NULL,
  city TEXT DEFAULT '全国',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入几条初始测试数据
INSERT INTO profiles (name, gender, birth_year, height_cm, education, profession, income, housing, city, intro, avatar_url, contact_wechat, unlock_cost, source_site) VALUES 
('张先生', '男', 1993, 178, '硕士', '国企工程师', '25-35万', '有房无贷', '北京', '孩子性格稳重，不抽烟不喝酒，父母均已退休有养老金，希望找一位温柔顾家的姑娘。', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'wx_zhang1993_bj', 5, '本站实名认证'),
('李女士', '女', 1996, 165, '本科', '公立小学教师', '15-20万', '与父母同住', '上海', '独生女，知书达理，喜欢做饭和旅游，周末双休，希望男方有上进心、家庭和睦。', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'wx_li1996_teacher', 5, '本站实名认证'),
('王先生', '男', 1991, 180, '本科', '三甲医院医生', '30-40万', '已购房(有贷)', '广州', '工作稳定，人品端正，家风淳朴，希望能遇到互相理解的伴侣。', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'wx_doctor_wang91', 5, '合作开放平台同步');

INSERT INTO forum_posts (user_id, author_name, city, content, likes) VALUES 
(1, '北京张阿姨(93年男宝妈)', '北京', '各位亲家好！我家儿子在海淀国企工作，平时工作太忙没时间社交，有在北京工作的94-98年姑娘的家长吗？欢迎互相交流！', 18),
(2, '上海李叔叔(96年女宝爸)', '上海', '大家觉得孩子们第一次见面约在什么地方比较好？现在的年轻人不喜欢太正式的饭局，各位老哥老姐支支招。', 25);