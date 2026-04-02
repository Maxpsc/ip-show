// 测各 API 延迟，按结果排序后输出可直接粘贴到 ipApis.ts 的 IP_APIS 数组顺序

const APIS = [
  { name: 'api.ip.sb', url: 'https://api.ip.sb/geoip/' },
  { name: 'whois.pconline.com.cn', url: 'https://whois.pconline.com.cn/ipJson.jsp?ip=&json=true' },
  { name: 'api.ip2location.io', url: 'https://api.ip2location.io/?key=demo' },
  { name: 'realip.cc', url: 'https://realip.cc/' },
  { name: 'ipapi.co', url: 'https://ipapi.co/json/' },
  { name: 'api.ipapi.is', url: 'https://api.ipapi.is' },
  { name: 'freeipapi.com', url: 'https://freeipapi.com/api/json' },
  { name: 'ipwhois.app', url: 'https://ipwhois.app/json/?format=json' },
  { name: 'ip.nc.gy', url: 'https://ip.nc.gy/json' },
];

const TIMES = 3; // 每个 API 测 3 次
const TIMEOUT = 5000;

async function ping(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  const start = performance.now();
  try {
    const res = await fetch(url, { signal: controller.signal });
    const ok = res.ok;
    clearTimeout(timer);
    return ok ? Math.round(performance.now() - start) : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

console.log('开始测速...\n');

const results = await Promise.all(
  APIS.map(async (api) => {
    const times = [];
    for (let i = 0; i < TIMES; i++) {
      const t = await ping(api.url);
      times.push(t);
      if (i < TIMES - 1) await new Promise(r => setTimeout(r, 200));
    }
    const valid = times.filter(t => t !== null);
    const avg = valid.length
      ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
      : null;
    return { ...api, times, avg };
  })
);

results.sort((a, b) => {
  if (a.avg === null && b.avg === null) return 0;
  if (a.avg === null) return 1;
  if (b.avg === null) return -1;
  return a.avg - b.avg;
});

console.log('测速结果（按平均延迟升序）：\n');
console.log('排名  | API                      | 第1次  | 第2次  | 第3次  | 平均');
console.log('------|--------------------------|--------|--------|--------|------');
results.forEach((r, i) => {
  const t1 = r.times[0] ?? 'X';
  const t2 = r.times[1] ?? 'X';
  const t3 = r.times[2] ?? 'X';
  const avg = r.avg ?? 'X';
  console.log(`${String(i + 1).padStart(4)} | ${r.name.padEnd(24)} | ${String(t1).padStart(6)} | ${String(t2).padStart(6)} | ${String(t3).padStart(6)} | ${String(avg).padStart(4)}`);
});

console.log('\n建议的 IP_APIS 顺序（粘贴到 ipApis.ts）：\n');
results.forEach((r, i) => {
  console.log(`  // ${i + 1}. ${r.name} (avg: ${r.avg ?? 'fail'}ms)`);
});
