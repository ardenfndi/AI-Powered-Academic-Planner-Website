type Lang = "EN" | "TR";

type TranslationKey =
  | "sidebar.planner"
  | "sidebar.saved"
  | "sidebar.admin"
  | "sidebar.grades"
  | "sidebar.help"
  | "page.plannerTitle"
  | "page.savedTitle"
  | "page.adminTitle"
  | "page.helpTitle"
  | "page.gradesTitle"
  | "page.profileTitle"
  | "page.settingsTitle"
  | "button.generateSchedule"
  | "button.addCourseSlot"
  | "menu.profile"
  | "menu.saved"
  | "menu.settings"
  | "menu.logout"
  | "admin.description"
  | "admin.notWired"
  | "settings.placeholder"
  | "badge.version"
  | "topbar.subtitle"
  | "saved.latest"
  | "saved.noSchedules"
  | "saved.reload"
  | "table.course"
  | "table.day"
  | "table.start"
  | "table.end"
  | "table.room"
  | "room.tbd"
  | "user.quickLinks"
  | "user.preferences"
  | "user.theme"
  | "user.dark"
  | "user.light"
  | "user.language"
  | "footer.privacy"
  | "footer.terms"
  | "image.readerTitle"
  | "action.loading"
  | "auth.registerTitle"
  | "auth.registerSubtitle"
  | "auth.loginTitle"
  | "auth.loginSubtitle"
  | "auth.placeholder.fullName"
  | "auth.placeholder.email"
  | "auth.placeholder.password"
  | "auth.placeholder.confirmPassword"
  | "auth.creating"
  | "auth.createAccount"
  | "auth.signIn"
  | "auth.signing"
  | "auth.registering"
  | "auth.errors.nameRequired"
  | "auth.errors.emailInvalid"
  | "auth.errors.passwordLength"
  | "auth.errors.passwordMismatch"
  | "auth.errors.registerFailed"
  | "auth.errors.loginFailed"
  | "user.guest"
  | "user.notSignedIn"
  | "action.saving"
  | "action.saved"
  | "action.saveFailed"
  | "planner.noCourses";

const dictionary: Record<Lang, Record<TranslationKey, string>> = {
  EN: {
    "sidebar.planner": "Planner",
    "sidebar.saved": "Saved schedules",
    "sidebar.admin": "Admin panel",
    "sidebar.grades": "Grade calculator",
    "sidebar.help": "Help / About",
    "page.plannerTitle": "Planner",
    "page.savedTitle": "Saved schedules",
    "page.adminTitle": "Admin panel",
    "page.helpTitle": "Help & About",
    "page.gradesTitle": "Grade calculator",
    "page.profileTitle": "My profile",
    "page.settingsTitle": "Account settings",
    "button.generateSchedule": "Generate Schedule",
    "button.addCourseSlot": "Add course slot",
    "menu.profile": "My profile",
    "menu.saved": "Saved schedules",
    "menu.settings": "Account settings",
    "menu.admin": "Admin panel",
    "menu.logout": "Log out",
    "topbar.subtitle": "Build and generate your weekly schedule with AI",
    "saved.latest": "Latest saved result from the planner.",
    "saved.noSchedules": "No saved schedules yet. Save a schedule from the planner.",
    "saved.reload": "Reload",
    "table.course": "Course",
    "table.day": "Day",
    "table.start": "Start",
    "table.end": "End",
    "table.room": "Room",
    "room.tbd": "Room TBD",
    "user.quickLinks": "Quick links",
    "user.preferences": "Preferences",
    "user.theme": "Theme",
    "user.dark": "Dark",
    "user.light": "Light",
    "user.language": "Language",
    "footer.privacy": "Privacy policy",
    "footer.terms": "Terms of use",
    "image.readerTitle": "Visual Course Reader (Beta)",
    "action.loading": "Loading...",
    "auth.registerTitle": "Register",
    "auth.registerSubtitle": "Create an account to save schedules.",
    "auth.loginTitle": "Login",
    "auth.loginSubtitle": "Sign in with your email and password.",
    "auth.placeholder.fullName": "Full name",
    "auth.placeholder.email": "Email",
    "auth.placeholder.password": "Password",
    "auth.placeholder.confirmPassword": "Confirm password",
    "auth.creating": "Creating...",
    "auth.createAccount": "Create account",
    "auth.signIn": "Sign in",
    "auth.signing": "Signing in...",
    "auth.registering": "Registering...",
    "auth.errors.nameRequired": "Name is required.",
    "auth.errors.emailInvalid": "Enter a valid email address.",
    "auth.errors.passwordLength": "Password must be at least 8 characters.",
    "auth.errors.passwordMismatch": "Passwords do not match.",
    "auth.errors.registerFailed": "Register failed",
    "auth.errors.loginFailed": "Login failed",
    "user.guest": "Guest",
    "user.notSignedIn": "Not signed in",
    "action.saving": "Saving...",
    "action.saved": "Saved",
    "action.saveFailed": "Failed to save",
    "planner.noCourses": "No courses or slots provided.",
    "admin.description": "Manage data sources, permissions and solver settings.",
    "admin.notWired": "Admin tools are not wired yet. Add controls here when backend endpoints are ready.",
    "admin.forbidden": "Access denied. Admins only.",
    "admin.overview": "Overview",
    "admin.smallDesc": "Quick stats about users and schedules.",
    "admin.totalUsers": "Total users",
    "admin.totalSchedules": "Total schedules",
    "admin.userList": "User list",
    "settings.placeholder": "Placeholder account settings. Wire to backend when ready.",
    "badge.version": "v1.0 - Student project",
  },
  TR: {
    "admin.forbidden": "Erişim reddedildi. Sadece yöneticiler.",
    "admin.overview": "Genel Bakış",
    "admin.smallDesc": "Kullanıcılar ve programlar hakkında hızlı istatistik.",
    "admin.totalUsers": "Toplam kullanıcı",
    "admin.totalSchedules": "Toplam program",
    "admin.userList": "Kullanıcı listesi",
    "sidebar.planner": "Planlayıcı",
    "sidebar.saved": "Kayıtlı programlar",
    "sidebar.admin": "Yönetim paneli",
    "sidebar.grades": "Not hesaplayıcı",
    "sidebar.help": "Yardım / Hakkında",
    "page.plannerTitle": "Planlayıcı",
    "page.savedTitle": "Kayıtlı programlar",
    "page.adminTitle": "Yönetim paneli",
    "page.helpTitle": "Yardım ve Hakkında",
    "page.gradesTitle": "Not hesaplayıcı",
    "page.profileTitle": "Profilim",
    "page.settingsTitle": "Hesap ayarları",
    "button.generateSchedule": "Program Oluştur",
    "button.addCourseSlot": "Ders saati ekle",
    "menu.profile": "Profilim",
    "menu.saved": "Kayıtlı programlar",
    "menu.settings": "Hesap ayarları",
    "menu.logout": "Çıkış yap",
    "menu.admin": "Yönetim paneli",
    "topbar.subtitle": "Haftalık programınızı yapay zeka ile oluşturun",
    "saved.latest": "Planlayıcıdan gelen son kayıtlı sonuç.",
    "saved.noSchedules": "Henüz kayıtlı program yok. Oluşturulan programları kaydedin.",
    "saved.reload": "Yenile",
    "table.course": "Ders",
    "table.day": "Gün",
    "table.start": "Başlangıç",
    "table.end": "Bitiş",
    "table.room": "Sınıf",
    "room.tbd": "Sınıf Bilgisi Yok",
    "user.quickLinks": "Hızlı erişim",
    "user.preferences": "Tercihler",
    "user.theme": "Tema",
    "user.dark": "Koyu",
    "user.light": "Açık",
    "user.language": "Dil",
    "footer.privacy": "Gizlilik politikası",
    "footer.terms": "Kullanım koşulları",
    "image.readerTitle": "Görsel Ders Okuyucu (Beta)",
    "action.loading": "Yükleniyor...",
    "auth.registerTitle": "Kayıt ol",
    "auth.registerSubtitle": "Programları kaydetmek için bir hesap oluşturun.",
    "auth.loginTitle": "Giriş",
    "auth.loginSubtitle": "E-posta ve parolanızla giriş yapın.",
    "auth.placeholder.fullName": "Ad Soyad",
    "auth.placeholder.email": "E-posta",
    "auth.placeholder.password": "Parola",
    "auth.placeholder.confirmPassword": "Parolayı doğrula",
    "auth.creating": "Oluşturuluyor...",
    "auth.createAccount": "Hesap oluştur",
    "auth.signIn": "Giriş yap",
    "auth.signing": "Giriş yapılıyor...",
    "auth.registering": "Kayıt olunuyor...",
    "auth.errors.nameRequired": "İsim gerekli.",
    "auth.errors.emailInvalid": "Geçerli bir e-posta adresi girin.",
    "auth.errors.passwordLength": "Parola en az 8 karakter olmalıdır.",
    "auth.errors.passwordMismatch": "Parolalar eşleşmiyor.",
    "auth.errors.registerFailed": "Kayıt başarısız",
    "auth.errors.loginFailed": "Giriş başarısız",
    "user.guest": "Misafir",
    "user.notSignedIn": "Giriş yapılmadı",
    "action.saving": "Kaydediliyor...",
    "action.saved": "Kaydedildi",
    "action.saveFailed": "Kaydetme başarısız",
    "planner.noCourses": "Ders veya slot yok.",
    "admin.description": "Veri kaynaklarını, izinleri ve çözüm ayarlarını yönetin.",
    "admin.notWired": "Yönetim araçları henüz bağlı değil. Backend uç noktaları hazır olduğunda kontroller ekleyin.",
    "settings.placeholder": "Yer tutucu hesap ayarları. Backend bağlı olduğunda düzenleyin.",
    "badge.version": "v1.0 - Öğrenci projesi",
  },
};

export function t(lang: Lang, key: TranslationKey): string {
  const table = dictionary[lang] || dictionary.EN;
  return table[key] ?? dictionary.EN[key];
}
