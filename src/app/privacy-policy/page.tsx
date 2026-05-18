import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export const metadata = {
  title: 'سياسة الخصوصية | Accessory',
  description: 'سياسة الخصوصية وحماية البيانات الخاصة بمتجر Accessory',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16" dir="rtl">
          <h1 className="font-display text-4xl text-[var(--text)] mb-2">سياسة الخصوصية</h1>
          <p className="text-[var(--text-faint)] text-sm mb-10">آخر تحديث: مايو 2026</p>

          <div className="space-y-8 text-[var(--text-muted)] leading-relaxed">

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">١. المعلومات التي نجمعها</h2>
              <p>عند إتمام طلبك، نقوم بجمع المعلومات التالية:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pr-4">
                <li>الاسم الكامل ورقم الهاتف</li>
                <li>عنوان الشحن (المحافظة والمدينة والعنوان التفصيلي)</li>
                <li>البريد الإلكتروني (اختياري)</li>
                <li>تفاصيل الطلب والمنتجات المختارة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٢. كيف نستخدم معلوماتك</h2>
              <p>نستخدم بياناتك فقط للأغراض التالية:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pr-4">
                <li>معالجة وتوصيل طلبك</li>
                <li>التواصل معك بشأن حالة الطلب</li>
                <li>إرسال رمز التحقق (OTP) للتأكيد</li>
                <li>تحسين تجربة التسوق لديك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٣. مشاركة البيانات</h2>
              <p>
                لا نبيع بياناتك الشخصية لأي طرف ثالث. نشارك معلومات الشحن فقط مع شركة التوصيل (Bosta)
                لإتمام عملية التوصيل إلى عنوانك.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٤. ملفات تعريف الارتباط (Cookies)</h2>
              <p>
                نستخدم ملفات تعريف الارتباط لحفظ محتويات سلة التسوق وتحسين أداء الموقع.
                يمكنك تعطيلها من إعدادات متصفحك، لكن ذلك قد يؤثر على بعض وظائف الموقع.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٥. الإعلانات وتتبع الأداء</h2>
              <p>
                نستخدم Meta Pixel وTikTok Pixel لقياس أداء الإعلانات وتحسينها. هذه الأدوات قد تجمع
                بيانات익익ة مجهولة الهوية عن زياراتك للموقع. لا تُستخدم هذه البيانات لتحديد هويتك شخصياً.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٦. أمان البيانات</h2>
              <p>
                نحرص على حماية بياناتك من خلال تشفير الاتصالات (HTTPS) وتقييد الوصول إلى قاعدة البيانات.
                بياناتك لا تُشارك أو تُباع لأي جهة تسويقية.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٧. حقوقك</h2>
              <p>يحق لك في أي وقت:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pr-4">
                <li>طلب حذف بياناتك الشخصية</li>
                <li>الاطلاع على البيانات المحفوظة لدينا عنك</li>
                <li>تصحيح أي معلومات غير صحيحة</li>
              </ul>
              <p className="mt-3">
                للتواصل بشأن بياناتك، يرجى مراسلتنا عبر واتساب أو البريد الإلكتروني المذكور في صفحة التواصل.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٨. تحديثات السياسة</h2>
              <p>
                قد نحدث هذه السياسة من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ آخر مراجعة.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
