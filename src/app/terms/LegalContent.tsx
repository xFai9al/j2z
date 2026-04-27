'use client'
import { useState } from 'react'

type Lang = 'en' | 'ar'
type TabKey = 'terms' | 'privacy'

interface LegalSection {
  h: string
  p: string
  list?: string[]
}

const Logo = ({ s = 30 }: { s?: number }) => (
  <svg viewBox="0 0 60 60" width={s} height={s} fill="none">
    <rect width="60" height="60" rx="16" fill="#FBEDE8"/>
    <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
    <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
    <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
    <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
    <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
  </svg>
)

const TERMS_EN: LegalSection[] = [
  { h: '1. Acceptance of Terms', p: 'By accessing or using J2z.com (\'the Service\'), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is operated by [OPERATOR NAME] (\'we\', \'us\', \'our\') as an individual sole proprietor.' },
  { h: '2. Description of Service', p: 'J2z provides URL shortening, QR code generation, and bio-link page services. We may modify, suspend, or discontinue any part of the Service at any time without notice.' },
  { h: '3. Account Registration', p: 'Some features require an account. You agree to provide accurate information and keep it updated. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must be at least 13 years old to use the Service.' },
  { h: '4. Acceptable Use', p: 'You agree NOT to use the Service to create, share, or redirect to content that is:', list: [
    'Pornographic, sexually explicit, or adult content of any kind',
    'Related to gambling, betting, lotteries, or games of chance',
    'Promoting, selling, or distributing illegal drugs or controlled substances',
    'Phishing, fraud, deceptive practices, or attempts to steal user data',
    'Inciting violence, terrorism, or any form of harm to individuals or groups',
    'Containing malware, viruses, spyware, or any malicious software',
    'Infringing on intellectual property, copyright, or trademark rights',
    'Harassing, defamatory, hateful, or discriminatory toward any person or group',
    'Impersonating others or misrepresenting your identity',
    'Violating any applicable local, national, or international law',
  ] },
  { h: '5. Content Moderation', p: 'We reserve the right to disable, remove, or redirect any link, QR code, or bio page that violates these Terms, without notice. We may also suspend or terminate your account at our sole discretion for violations.' },
  { h: '6. Intellectual Property', p: 'All rights in the Service, including the J2z brand, logo, design, and software, belong to us. You retain ownership of content you create, but grant us a worldwide, non-exclusive, royalty-free license to host, display, and process it as needed to provide the Service.' },
  { h: '7. Analytics & Data', p: 'We collect click data (timestamp, country, device type, browser, referrer) for every short link and QR scan. This data is available to you in your dashboard. We do not sell personal data to third parties. See our Privacy Policy for details.' },
  { h: '8. Free Service & No Warranty', p: 'The Service is provided free of charge, \'as is\' and \'as available\', without warranties of any kind. We do not guarantee uptime, accuracy, or fitness for any particular purpose.' },
  { h: '9. Limitation of Liability', p: 'To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising from your use of the Service.' },
  { h: '10. Indemnification', p: 'You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these Terms.' },
  { h: '11. Termination', p: 'You may stop using the Service at any time by deleting your account. We may suspend or terminate your access at any time, with or without cause or notice. Upon termination, your data may be deleted.' },
  { h: '12. Changes to Terms', p: 'We may update these Terms from time to time. Material changes will be communicated via email or the Service. Continued use after changes means you accept them.' },
  { h: '13. Governing Law', p: 'These Terms are governed by the laws of [JURISDICTION]. Any disputes shall be resolved in the competent courts of [JURISDICTION].' },
  { h: '14. Contact', p: 'For questions about these Terms, contact us at: legal@j2z.com' },
]

const TERMS_AR: LegalSection[] = [
  { h: '١. قبول الشروط', p: 'بوصولك إلى J2z.com أو استخدامك له («الخدمة»)، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق، فلا تستخدم الخدمة. تُدار الخدمة بواسطة [اسم المشغّل] («نحن»، «لنا») كمالك فرد.' },
  { h: '٢. وصف الخدمة', p: 'يوفر J2z خدمات تقصير الروابط وتوليد أكواد QR وصفحات البايو. يحق لنا تعديل أو تعليق أو إيقاف أي جزء من الخدمة في أي وقت دون إشعار.' },
  { h: '٣. تسجيل الحساب', p: 'تتطلب بعض الميزات وجود حساب. أنت توافق على تقديم معلومات دقيقة وتحديثها. أنت مسؤول عن الحفاظ على سرية بيانات الدخول وعن جميع الأنشطة التي تتم من حسابك. يجب أن يكون عمرك ١٣ سنة على الأقل لاستخدام الخدمة.' },
  { h: '٤. الاستخدام المقبول', p: 'أنت توافق على عدم استخدام الخدمة لإنشاء أو مشاركة أو إعادة توجيه لمحتوى:', list: [
    'إباحي أو جنسي صريح أو محتوى للبالغين بأي شكل',
    'متعلق بالقمار أو المراهنات أو اليانصيب أو ألعاب الحظ',
    'يروّج أو يبيع أو يوزّع المخدرات أو المواد الخاضعة للرقابة',
    'احتيال أو تصيّد أو خداع أو محاولات سرقة بيانات المستخدمين',
    'يحرّض على العنف أو الإرهاب أو أي شكل من أشكال الأذى',
    'يحتوي على برمجيات خبيثة أو فيروسات أو برامج تجسس',
    'ينتهك حقوق الملكية الفكرية أو العلامات التجارية',
    'يتضمن تحرشاً أو تشهيراً أو خطاب كراهية أو تمييزاً',
    'ينتحل شخصية الغير أو يزوّر الهوية',
    'ينتهك أي قانون محلي أو وطني أو دولي',
  ] },
  { h: '٥. مراقبة المحتوى', p: 'نحتفظ بالحق في تعطيل أو إزالة أو إعادة توجيه أي رابط أو كود QR أو صفحة بايو تنتهك هذه الشروط، دون إشعار مسبق. كما يحق لنا تعليق أو إنهاء حسابك وفقاً لتقديرنا المطلق.' },
  { h: '٦. الملكية الفكرية', p: 'جميع الحقوق في الخدمة، بما في ذلك علامة J2z وشعارها وتصميمها وبرمجياتها، تعود لنا. أنت تحتفظ بملكية المحتوى الذي تنشئه، ولكنك تمنحنا ترخيصاً عالمياً غير حصري ومجانياً لاستضافته وعرضه ومعالجته لتقديم الخدمة.' },
  { h: '٧. التحليلات والبيانات', p: 'نجمع بيانات النقرات (الوقت، الدولة، نوع الجهاز، المتصفح، المصدر) لكل رابط قصير ومسح QR. هذه البيانات متاحة لك في لوحة التحكم. لا نبيع البيانات الشخصية لأطراف ثالثة. راجع سياسة الخصوصية للتفاصيل.' },
  { h: '٨. خدمة مجانية بلا ضمانات', p: 'تُقدَّم الخدمة مجاناً، «كما هي» و«حسب التوفر»، دون أي ضمانات. لا نضمن زمن التشغيل أو الدقة أو الملاءمة لأي غرض معين.' },
  { h: '٩. حدود المسؤولية', p: 'إلى أقصى حد يسمح به القانون، لسنا مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية، ولا عن أي خسارة للأرباح أو البيانات أو السمعة الناتجة عن استخدامك للخدمة.' },
  { h: '١٠. التعويض', p: 'أنت توافق على تعويضنا وإبقائنا في مأمن من أي مطالبات أو أضرار أو مصاريف ناشئة عن استخدامك للخدمة، أو محتواك، أو انتهاكك لهذه الشروط.' },
  { h: '١١. الإنهاء', p: 'يحق لك التوقف عن استخدام الخدمة في أي وقت بحذف حسابك. ويحق لنا تعليق أو إنهاء وصولك في أي وقت، بسبب أو بدون سبب أو إشعار. عند الإنهاء، قد تُحذف بياناتك.' },
  { h: '١٢. تغييرات الشروط', p: 'قد نقوم بتحديث هذه الشروط من وقت لآخر. سنُبلّغ عن التغييرات الجوهرية عبر البريد الإلكتروني أو الخدمة. استمرار استخدامك بعد التغييرات يعني قبولك لها.' },
  { h: '١٣. القانون المطبّق', p: 'تخضع هذه الشروط لقوانين [الجهة القضائية]. تُحلّ أي نزاعات في المحاكم المختصة في [الجهة القضائية].' },
  { h: '١٤. التواصل', p: 'للاستفسار عن هذه الشروط، تواصل معنا على: legal@j2z.com' },
]

const PRIVACY_EN: LegalSection[] = [
  { h: '1. Information We Collect', p: 'We collect: (a) account information you provide (name, email, password); (b) analytics data from link clicks and QR scans (timestamp, country, device type, browser, referrer); (c) technical data (IP address for anti-abuse and rate limiting).' },
  { h: '2. How We Use Your Information', p: 'We use your information to: provide and improve the Service, show you analytics, prevent abuse, respond to support requests, and comply with legal obligations.' },
  { h: '3. Data Sharing', p: 'We do NOT sell your personal information. We may share data with: (a) service providers who help operate the Service (hosting, email delivery); (b) law enforcement when required by valid legal process.' },
  { h: '4. Data Retention', p: 'We keep your data as long as your account is active. When you delete your account, we delete your data within 30 days, except where retention is required by law.' },
  { h: '5. Cookies & Tracking', p: 'We use essential cookies for authentication and session management. We do not use third-party advertising trackers.' },
  { h: '6. Your Rights', p: 'You have the right to access, correct, export, or delete your data. Email privacy@j2z.com to exercise these rights.' },
  { h: '7. Children\'s Privacy', p: 'The Service is not intended for users under 13. We do not knowingly collect data from children under 13.' },
  { h: '8. International Transfers', p: 'Your data may be processed in countries other than yours. We take steps to ensure appropriate protection regardless of location.' },
  { h: '9. Security', p: 'We use industry-standard security measures, but no system is 100% secure. You are responsible for keeping your password safe.' },
  { h: '10. Changes to This Policy', p: 'We may update this Privacy Policy. Material changes will be communicated via email or the Service.' },
  { h: '11. Contact', p: 'Questions? Email: privacy@j2z.com' },
]

const PRIVACY_AR: LegalSection[] = [
  { h: '١. المعلومات التي نجمعها', p: 'نجمع: (أ) معلومات الحساب التي تقدّمها (الاسم، البريد الإلكتروني، كلمة المرور)؛ (ب) بيانات التحليلات من نقرات الروابط ومسحات QR (الوقت، الدولة، نوع الجهاز، المتصفح، المصدر)؛ (ج) البيانات التقنية (عنوان IP لمنع الإساءة والحد من الاستخدام).' },
  { h: '٢. كيف نستخدم معلوماتك', p: 'نستخدم معلوماتك من أجل: تقديم الخدمة وتحسينها، عرض التحليلات لك، منع الإساءة، الرد على طلبات الدعم، والامتثال للالتزامات القانونية.' },
  { h: '٣. مشاركة البيانات', p: 'نحن لا نبيع معلوماتك الشخصية. قد نشارك البيانات مع: (أ) مقدمي الخدمات الذين يساعدون في تشغيل الخدمة (الاستضافة، إرسال البريد الإلكتروني)؛ (ب) جهات إنفاذ القانون عندما يُطلب ذلك بموجب إجراء قانوني صحيح.' },
  { h: '٤. الاحتفاظ بالبيانات', p: 'نحتفظ ببياناتك طالما حسابك نشط. عند حذف حسابك، نحذف بياناتك خلال ٣٠ يوماً، إلا حيث يُشترط الاحتفاظ قانونياً.' },
  { h: '٥. ملفات تعريف الارتباط والتتبع', p: 'نستخدم ملفات تعريف الارتباط الأساسية للمصادقة وإدارة الجلسات. لا نستخدم أدوات تتبع إعلانية لأطراف ثالثة.' },
  { h: '٦. حقوقك', p: 'لديك الحق في الوصول إلى بياناتك أو تصحيحها أو تصديرها أو حذفها. راسلنا على privacy@j2z.com لممارسة هذه الحقوق.' },
  { h: '٧. خصوصية الأطفال', p: 'الخدمة غير مخصصة للمستخدمين دون سن الـ ١٣. لا نجمع عن علم بيانات من الأطفال دون سن الـ ١٣.' },
  { h: '٨. التحويلات الدولية', p: 'قد تُعالج بياناتك في دول غير دولتك. نتخذ خطوات لضمان الحماية المناسبة بصرف النظر عن الموقع.' },
  { h: '٩. الأمان', p: 'نستخدم تدابير أمنية وفقاً لمعايير الصناعة، لكن لا يوجد نظام آمن بنسبة ١٠٠٪. أنت مسؤول عن الحفاظ على سرية كلمة المرور.' },
  { h: '١٠. تغييرات هذه السياسة', p: 'قد نحدّث سياسة الخصوصية. سنُبلّغ عن التغييرات الجوهرية عبر البريد الإلكتروني أو الخدمة.' },
  { h: '١١. التواصل', p: 'استفسارات؟ راسلنا: privacy@j2z.com' },
]

const today = 'April 22, 2026'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #FBFAF7; color: #2F2A24; font-family: 'Space Grotesk', 'Tajawal', sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6; }
.nav { background: rgba(251,250,247,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #E8E2D6; padding: 14px 20px; position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; }
.logo-row { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; color: inherit; }
.logo-name { font-size: 20px; font-weight: 700; letter-spacing: -0.04em; }
.lang-btn { background: #F5F2EC; border: 1px solid #E8E2D6; padding: 0 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; min-height: 44px; display: inline-flex; align-items: center; }
.lang-btn:hover { background: #EFEAE0; }
.page { max-width: 800px; margin: 0 auto; padding: 40px 24px 80px; }
.head { text-align: center; margin-bottom: 32px; }
.head h1 { font-family: 'Cal Sans', 'Tajawal', sans-serif; font-size: clamp(32px, 5vw, 44px); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 8px; }
.head-date { font-size: 13px; color: #A89F92; font-style: italic; }
.tabs { display: flex; gap: 6px; background: #F5F2EC; padding: 5px; border-radius: 12px; margin-bottom: 28px; max-width: 360px; margin-left: auto; margin-right: auto; }
.tab-btn { flex: 1; padding: 9px 16px; border: none; background: transparent; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; color: #6B6257; transition: all .15s; }
.tab-btn.active { background: white; color: #D45A3F; box-shadow: 0 1px 3px rgba(47,42,36,.08); }
.sect { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px dashed #E8E2D6; }
.sect:last-child { border-bottom: none; }
.sect h3 { font-family: 'Cal Sans', 'Tajawal', sans-serif; font-size: 18px; font-weight: 700; color: #D45A3F; margin-bottom: 10px; letter-spacing: -0.01em; }
.sect p { font-size: 15px; color: #2F2A24; line-height: 1.7; }
.sect ul { list-style: none; padding: 0; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.sect li { font-size: 14px; color: #2F2A24; padding: 10px 14px; background: #FDEAEA; border: 1px solid #F4A593; border-radius: 10px; display: flex; gap: 10px; align-items: flex-start; }
.sect li::before { content: '✕'; color: #D45A3F; font-weight: 700; flex-shrink: 0; font-size: 13px; margin-top: 1px; }
.contact-box { margin-top: 40px; padding: 20px; background: #EDF1EC; border: 1px solid #8FA68E; border-radius: 14px; text-align: center; font-size: 14px; color: #3E5F3C; }
.contact-box strong { color: #2F2A24; }
.back-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 32px; font-size: 14px; color: #6B6257; text-decoration: none; font-weight: 500; cursor: pointer; }
.back-link:hover { color: #D45A3F; }
`

export default function LegalContent({ defaultTab = 'terms' }: { defaultTab?: TabKey }) {
  const [lang, setLang] = useState<Lang>('en')
  const [tab, setTab] = useState<TabKey>(defaultTab)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const terms = lang === 'en' ? TERMS_EN : TERMS_AR
  const privacy = lang === 'en' ? PRIVACY_EN : PRIVACY_AR
  const sections = tab === 'terms' ? terms : privacy

  return (
    <>
      <style>{css}</style>
      <div dir={dir}>
        <nav className="nav">
          <a className="logo-row" href="/">
            <Logo s={30}/>
            <span className="logo-name">J2z</span>
          </a>
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} aria-label="Switch language">
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </nav>

        <div className="page">
          <div className="head">
            <h1>{lang === 'en' ? 'Legal' : 'القانون'}</h1>
            <div className="head-date">
              {lang === 'en' ? `Last updated: ${today}` : `آخر تحديث: ${today}`}
            </div>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${tab === 'terms' ? 'active' : ''}`} onClick={() => setTab('terms')}>
              {lang === 'en' ? 'Terms of Service' : 'شروط الاستخدام'}
            </button>
            <button className={`tab-btn ${tab === 'privacy' ? 'active' : ''}`} onClick={() => setTab('privacy')}>
              {lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
            </button>
          </div>

          <div key={tab + lang}>
            {sections.map((s, i) => (
              <div key={i} className="sect">
                <h3>{s.h}</h3>
                <p>{s.p}</p>
                {s.list && (
                  <ul>
                    {s.list.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="contact-box">
            {lang === 'en' ? (
              <>Questions? <strong>legal@j2z.com</strong> · <strong>privacy@j2z.com</strong></>
            ) : (
              <>استفسارات؟ <strong>legal@j2z.com</strong> · <strong>privacy@j2z.com</strong></>
            )}
          </div>

          <a className="back-link" href="/">
            {lang === 'en' ? '← Back to J2z.com' : '→ العودة إلى J2z.com'}
          </a>
        </div>
      </div>
    </>
  )
}
