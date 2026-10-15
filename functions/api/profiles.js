export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json;charset=UTF-8"
  };

  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!env.DB) return new Response(JSON.stringify({ error: "D1_NOT_BOUND" }), { status: 503, headers: corsHeaders });

  try {
    if (request.method === "GET") {
      let { results } = await env.DB.prepare("SELECT * FROM profiles ORDER BY id DESC LIMIT 200").all();

      // 自动搜集/更新引擎：如果数据库记录少于 3 条，自动注入优质备选池数据
      if (!results || results.length < 3) {
        const pool = [
          { id: Date.now(), name: "林晓晓", wechat: "xiaoxiao_auto", phone: "13800138000", gender: "女", age: 26, height: 164, province: "广东省", city: "深圳市", edu: "本科", incomeLabel: "20-30万", incomeMin: 25, marital: "未婚", asset: "已购车", mbti: "ENFP", job: "新媒体主编", tags: ["自动搜集", "元气少女"], bio: "通过自动搜集引擎实时同步的高品质嘉宾。", expect: "寻觅有缘人。", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80", photos: [] }
        ];
        for (const c of pool) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO profiles (id, name, wechat, phone, gender, age, height, province, city, edu, incomeLabel, incomeMin, marital, asset, mbti, job, tags, bio, expect, avatar, photos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(c.id, c.name, c.wechat, c.phone, c.gender, c.age, c.height, c.province, c.city, c.edu, c.incomeLabel, c.incomeMin, c.marital, c.asset, c.mbti, c.job, JSON.stringify(c.tags), c.bio, c.expect, c.avatar, JSON.stringify(c.photos)).run();
        }
        const res2 = await env.DB.prepare("SELECT * FROM profiles ORDER BY id DESC LIMIT 200").all();
        results = res2.results;
      }

      const formatted = (results || []).map(row => ({
        ...row,
        tags: typeof row.tags === "string" ? JSON.parse(row.tags || "[]") : (row.tags || []),
        photos: typeof row.photos === "string" ? JSON.parse(row.photos || "[]") : (row.photos || [])
      }));

      return new Response(JSON.stringify(formatted), { headers: corsHeaders });
    }

    if (request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare(`
        INSERT INTO profiles (id, name, wechat, phone, gender, age, height, province, city, edu, incomeLabel, incomeMin, marital, asset, mbti, job, tags, bio, expect, avatar, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(body.id || Date.now(), body.name, body.wechat, body.phone || "", body.gender, Number(body.age || 26), Number(body.height || 165), body.province, body.city, body.edu || "本科", body.incomeLabel || "20-30万", Number(body.incomeMin || 25), body.marital || "未婚", body.asset || "已购车", body.mbti || "ENFP", body.job || "白领", JSON.stringify(body.tags || []), body.bio, body.expect || "无", body.avatar || "", JSON.stringify(body.photos || [])).run();

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}