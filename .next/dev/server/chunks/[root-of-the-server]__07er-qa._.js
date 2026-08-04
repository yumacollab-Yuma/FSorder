module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "maxDuration",
    ()=>maxDuration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
;
;
;
const maxDuration = 60;
const dynamic = 'force-dynamic';
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function parseDate(val) {
    if (!val) return null;
    const s = String(val).trim();
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    const m2 = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m2) return m2[1];
    return null;
}
function rateStr(val) {
    if (val == null || val === '') return '';
    return String(val).trim();
}
async function POST(req) {
    const password = req.headers.get('x-upload-password');
    if (password !== process.env.UPLOAD_PASSWORD) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: '密码错误'
        }, {
            status: 401
        });
    }
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: '未收到文件'
    }, {
        status: 400
    });
    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: 'buffer'
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(ws, {
        defval: null
    });
    const productMap = {};
    // daily_orders buffer
    const dayBuf = {};
    // creator_daily buffer: key = productId__date__creator__channel
    const creatorBuf = {};
    // creator_commission buffer: key = productId__date__creator__type__rate
    const commBuf = {};
    let skipped = 0;
    for (const row of rows){
        const payDate = parseDate(row['支付时间']);
        if (!payDate) {
            skipped++;
            continue;
        }
        const pid = String(row['商品 ID'] || row['商品ID'] || '').trim();
        const fullName = String(row['商品名称 '] || row['商品名称'] || '').trim();
        const units = parseInt(String(row['下单件数'] || '1')) || 1;
        const estComm = parseFloat(String(row['预估计佣金额'] || '0')) || 0;
        const unitPrice = Math.round(estComm / units * 100) / 100;
        const isRefund = row['已全部退货或全额退款'] === '是';
        const stdRate = rateStr(row['标准佣金率']);
        const adRate = rateStr(row['店铺广告佣金率']);
        const isOrganic = !isRefund && stdRate !== '';
        const isPaid = !isRefund && adRate !== '';
        const creator = String(row['达人用户名'] || '').trim();
        const channel = String(row['内容形式'] || '').trim() // 视频 / 直播
        ;
        if (!pid) {
            skipped++;
            continue;
        }
        if (!productMap[pid]) productMap[pid] = {
            id: pid,
            fullName
        };
        // ── daily_orders ──────────────────────────────────────────
        const dayKey = `${pid}__${payDate}`;
        if (!dayBuf[dayKey]) dayBuf[dayKey] = {
            productId: pid,
            date: payDate,
            orders: []
        };
        dayBuf[dayKey].orders.push({
            units,
            price: unitPrice,
            isOrganic,
            isPaid,
            isRefund
        });
        // ── creator_daily ─────────────────────────────────────────
        if (creator) {
            const ck = `${pid}__${payDate}__${creator}__${channel}`;
            if (!creatorBuf[ck]) creatorBuf[ck] = {
                productId: pid,
                date: payDate,
                creator,
                channel,
                orders: 0,
                organic: 0,
                paid: 0,
                refund: 0
            };
            creatorBuf[ck].orders++;
            if (isOrganic) creatorBuf[ck].organic++;
            if (isPaid) creatorBuf[ck].paid++;
            if (isRefund) creatorBuf[ck].refund++;
            // ── creator_commission ──────────────────────────────────
            if (!isRefund && stdRate) {
                const commKey = `${pid}__${payDate}__${creator}__organic__${stdRate}`;
                if (!commBuf[commKey]) commBuf[commKey] = {
                    productId: pid,
                    date: payDate,
                    creator,
                    commissionType: 'organic',
                    commissionRate: stdRate,
                    orders: 0
                };
                commBuf[commKey].orders++;
            }
            if (!isRefund && adRate) {
                const commKey = `${pid}__${payDate}__${creator}__paid__${adRate}`;
                if (!commBuf[commKey]) commBuf[commKey] = {
                    productId: pid,
                    date: payDate,
                    creator,
                    commissionType: 'paid',
                    commissionRate: adRate,
                    orders: 0
                };
                commBuf[commKey].orders++;
            }
        }
    }
    // Upsert products
    for (const p of Object.values(productMap)){
        const { data: existing } = await supabaseAdmin.from('products').select('id').eq('id', p.id).single();
        if (!existing) {
            await supabaseAdmin.from('products').insert({
                id: p.id,
                full_name: p.fullName,
                internal_name: ''
            });
        } else if (p.fullName) {
            await supabaseAdmin.from('products').update({
                full_name: p.fullName
            }).eq('id', p.id);
        }
    }
    // Build daily_orders rows
    const dailyRows = [];
    const priceRows = [];
    for (const buf of Object.values(dayBuf)){
        const { productId, date, orders } = buf;
        let totalOrders = 0, totalUnits = 0, totalOrganic = 0, totalPaid = 0, totalRefund = 0;
        const priceMap = {};
        for (const o of orders){
            totalOrders++;
            if (!o.isRefund) totalUnits += o.units;
            if (o.isOrganic) totalOrganic++;
            if (o.isPaid) totalPaid++;
            if (o.isRefund) totalRefund++;
            if (!priceMap[o.price]) priceMap[o.price] = {
                orders: 0,
                units: 0,
                organic: 0,
                paid: 0,
                refund: 0
            };
            priceMap[o.price].orders++;
            if (!o.isRefund) priceMap[o.price].units += o.units;
            if (o.isOrganic) priceMap[o.price].organic++;
            if (o.isPaid) priceMap[o.price].paid++;
            if (o.isRefund) priceMap[o.price].refund++;
        }
        dailyRows.push({
            product_id: productId,
            date,
            total_orders: totalOrders,
            total_units: totalUnits,
            organic_orders: totalOrganic,
            paid_orders: totalPaid,
            refund_orders: totalRefund
        });
        for (const [price, pd] of Object.entries(priceMap)){
            priceRows.push({
                product_id: productId,
                date,
                unit_price: parseFloat(price),
                ...pd
            });
        }
    }
    const creatorRows = Object.values(creatorBuf).map((c)=>({
            product_id: c.productId,
            date: c.date,
            creator: c.creator,
            channel: c.channel,
            orders: c.orders,
            organic_orders: c.organic,
            paid_orders: c.paid,
            refund_orders: c.refund
        }));
    const commRows = Object.values(commBuf).map((c)=>({
            product_id: c.productId,
            date: c.date,
            creator: c.creator,
            commission_type: c.commissionType,
            commission_rate: c.commissionRate,
            orders: c.orders
        }));
    const batchUpsert = async (table, data, conflict)=>{
        for(let i = 0; i < data.length; i += 500){
            const { error } = await supabaseAdmin.from(table).upsert(data.slice(i, i + 500), {
                onConflict: conflict
            });
            if (error) throw new Error(`${table}: ${error.message}`);
        }
    };
    await batchUpsert('daily_orders', dailyRows, 'product_id,date');
    await batchUpsert('daily_prices', priceRows, 'product_id,date,unit_price');
    await batchUpsert('creator_daily', creatorRows, 'product_id,date,creator,channel');
    await batchUpsert('creator_commission', commRows, 'product_id,date,creator,commission_type,commission_rate');
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        imported: Object.values(dayBuf).reduce((s, b)=>s + b.orders.length, 0),
        skipped,
        days: dailyRows.length,
        creators: creatorRows.length
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07er-qa._.js.map