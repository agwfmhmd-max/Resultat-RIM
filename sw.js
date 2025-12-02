// تغيير الرقم هنا هو ما يجبر المتصفح على التحديث
// غيرناه من v8 إلى v9
const CACHE_NAME = 'resultat-rim-v2';

// قائمة الملفات التي سيتم حفظها للعمل بدون إنترنت
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // المكتبات الخارجية المستخدمة في الموقع
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 1. تثبيت Service Worker وحفظ الملفات
self.addEventListener('install', (event) => {
    // تخطي الانتظار لتفعيل التحديث فوراً
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('جاري حفظ ملفات الموقع...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. تفعيل وحذف الكاش القديم (هذا الجزء يحل مشكلة عدم ظهور التحديثات)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('تم حذف النسخة القديمة:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // جعل الخدمة تسيطر على الصفحة فوراً
    return self.clients.claim();
});

// 3. جلب الملفات (أولاً من الكاش، ثم من الإنترنت)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // إذا وجد الملف في الكاش، ارجعه
            if (response) {
                return response;
            }
            // إذا لم يوجد، اطلبه من الإنترنت
            return fetch(event.request).catch(() => {
                // هنا يمكن إضافة صفحة "لا يوجد اتصال" مخصصة إذا أردت
                // لكن حالياً سيكتفي بعرض ما تم حفظه
            });
        })
    );
});