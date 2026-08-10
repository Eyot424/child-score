/**
 * Cloudflare Pages Function —— 数据同步 API
 *
 * GET  /api/data   取回 {rev, data}
 * PUT  /api/data   传入 {rev, data}；rev 对不上返回 409 + 服务端最新数据，由客户端合并后重试
 *
 * 需要两个绑定（见 DEPLOY.md）：
 *   KV 命名空间  STARS
 *   环境变量     FAMILY_PASS   家庭密码
 */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

// 定长比较，避免通过响应时间猜密码
function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

  if (!env.FAMILY_PASS) return json({ error: '服务端还没设置 FAMILY_PASS' }, 500);
  if (!env.STARS)       return json({ error: '服务端还没绑定 KV 命名空间 STARS' }, 500);

  if (!sameSecret(request.headers.get('x-pass') || '', env.FAMILY_PASS))
    return json({ error: '密码不对' }, 401);

  const read = async () => {
    const raw = await env.STARS.get('data');
    return raw ? JSON.parse(raw) : { rev: 0, data: null, at: null };
  };

  if (request.method === 'GET') return json(await read());

  if (request.method === 'PUT') {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: '请求体不是合法 JSON' }, 400); }

    if (!body || typeof body.data !== 'object' || body.data === null)
      return json({ error: '缺少 data' }, 400);

    const cur = await read();

    // 乐观并发：基于的版本对不上，就把服务端最新的还回去让客户端合并
    if (Number(body.rev) !== cur.rev)
      return json({ conflict: true, rev: cur.rev, data: cur.data }, 409);

    const next = { rev: cur.rev + 1, data: body.data, at: new Date().toISOString() };
    await env.STARS.put('data', JSON.stringify(next));
    return json({ rev: next.rev, at: next.at });
  }

  return json({ error: '不支持的方法' }, 405);
}
