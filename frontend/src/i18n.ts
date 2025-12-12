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
  | "menu.logout";

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
    "menu.logout": "Log out",
  },
  TR: {
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
  },
};

export function t(lang: Lang, key: TranslationKey): string {
  const table = dictionary[lang] || dictionary.EN;
  return table[key] ?? dictionary.EN[key];
}
