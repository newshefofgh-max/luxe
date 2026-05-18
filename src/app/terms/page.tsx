import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export const metadata = {
  title: 'الشروط والأحكام | Accessory',
  description: 'شروط وأحكام الاستخدام وسياسة الاسترجاع الخاصة بمتجر Accessory',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16" dir="rtl">
          <h1 className="font-display text-4xl text-[var(--text)] mb-2">الشروط والأحكام</h1>
          <p className="text-[var(--text-faint)] text-sm mb-10">آخر تحديث: مايو 2026</p>

          <div className="space-y-8 text-[var(--text-muted)] leading-relaxed">

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">١. قبول الشروط</h2>
              <p>
                باستخدامك لموقع Accessory وإتمام أي طلب شراء، فإنك توافق على الشروط والأحكام المذكورة في هذه الصفحة.
                إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الموقع.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٢. الطلبات والدفع</h2>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>جميع الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة إن وُجدت.</li>
                <li>طريقة الدفع الوحيدة المتاحة حالياً هي الدفع عند الاستلام (COD).</li>
                <li>يتم تأكيد الطلب عبر رمز التحقق (OTP) المُرسل على رقم هاتفك.</li>
                <li>نحتفظ بالحق في إلغاء أي طلب في حالة نفاد المخزون أو وجود بيانات غير صحيحة.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٣. الشحن والتوصيل</h2>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>نوصل لجميع محافظات مصر عبر شركة Bosta للشحن.</li>
                <li>مدة التوصيل من ٢ إلى ٥ أيام عمل حسب المحافظة.</li>
                <li>رسوم الشحن محسوبة بناءً على المحافظة وتظهر عند الطلب.</li>
                <li>في حالة غياب المستلم، ستتواصل معك شركة الشحن لتحديد موعد بديل.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٤. سياسة الإرجاع والاستبدال</h2>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>يُقبل الإرجاع خلال <strong className="text-[var(--text)]">١٤ يوماً</strong> من تاريخ الاستلام.</li>
                <li>يجب أن يكون المنتج في حالته الأصلية غير مستخدم وبعبوته الأصلية.</li>
                <li>لا يُقبل إرجاع المنتجات التي تم استخدامها أو إزالة تغليفها.</li>
                <li>في حالة وجود عيب مصنعي، يتم الاستبدال مجاناً خلال ٣٠ يوماً.</li>
                <li>للإرجاع يرجى التواصل معنا عبر واتساب قبل إرسال المنتج.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٥. المنتجات والأسعار</h2>
              <p>
                نحرص على دقة المعلومات المعروضة، لكن قد تحدث أخطاء في الأسعار أو توصيف المنتجات.
                في حالة وجود خطأ في سعر منتج ما، سنتواصل معك قبل الشحن لإعلامك بالسعر الصحيح.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٦. الطلبات الوهمية</h2>
              <p>
                الطلبات الوهمية أو المكررة بنية التضليل تُلغى فوراً. في حالة تكرار الطلبات الوهمية،
                نحتفظ بالحق في حظر رقم الهاتف من الطلب مستقبلاً.
              </p>
            </section>

            <section>
              <h2 className="text-[var(--text)] font-semibold text-lg mb-3">٧. التواصل معنا</h2>
              <p>
                لأي استفسار أو شكوى، يمكنك التواصل معنا عبر واتساب أو البريد الإلكتروني المذكور
                في صفحة الفوتر. نرد على جميع الرسائل خلال ٢٤ ساعة في أيام العمل.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
