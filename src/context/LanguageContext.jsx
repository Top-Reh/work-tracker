import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);
const translations = {
  'Currency': 'ငွေကြေး',
  'Currency changes formatting only; amounts are not converted.': 'ငွေကြေးပုံစံကိုသာ ပြောင်းလဲပါသည်။ ပမာဏများကို ငွေလဲနှုန်းဖြင့် ပြောင်းလဲမည်မဟုတ်ပါ။',
  'Settings': 'ဆက်တင်များ', 'Language': 'ဘာသာစကား', 'English': 'အင်္ဂလိပ်', 'Burmese (Myanmar)': 'မြန်မာဘာသာ',
  'Profile': 'ကိုယ်ရေးအချက်အလက်', 'Name': 'အမည်', 'Phone': 'ဖုန်း', 'Optional': 'မဖြစ်မနေမဟုတ်ပါ',
  'Salary Settings': 'လစာဆက်တင်များ', 'Hourly Rate': 'တစ်နာရီလုပ်ခ', 'Tax Rate': 'အခွန်နှုန်း',
  'Save Settings': 'ဆက်တင်များသိမ်းရန်', 'Saving...': 'သိမ်းဆည်းနေသည်…', 'Settings saved.': 'ဆက်တင်များသိမ်းပြီးပါပြီ။',
  'Calendar': 'ပြက္ခဒိန်', 'Statistics': 'စာရင်းအင်း', 'Home': 'ပင်မ', 'Stats': 'စာရင်း', 'Logout': 'ထွက်ရန်', 'Today': 'ယနေ့',
  'Previous month': 'ယခင်လ', 'Next month': 'နောက်လ', 'Previous year': 'ယခင်နှစ်', 'Next year': 'နောက်နှစ်', 'Close': 'ပိတ်ရန်',
  'No work records yet.': 'အလုပ်မှတ်တမ်းမရှိသေးပါ။',
  'Tap a date below to add your first work record.': 'အလုပ်မှတ်တမ်းထည့်ရန် အောက်ပါရက်စွဲကိုနှိပ်ပါ။',
  'Net Salary': 'အသားတင်လစာ', 'Hours': 'နာရီ', 'Gross': 'စုစုပေါင်းလစာ', 'Tax': 'အခွန်', 'Net': 'အသားတင်',
  'Year Total Net Salary': 'တစ်နှစ်တာ အသားတင်လစာ', 'No records': 'မှတ်တမ်းမရှိပါ',
  'Add Time': 'အချိန်ထည့်ရန်', 'Edit Time': 'အချိန်ပြင်ရန်', 'Enter hours': 'နာရီထည့်ပါ', 'Start & end time': 'စချိန်နှင့်ဆုံးချိန်',
  'Minutes': 'မိနစ်', 'Start Time': 'စချိန်', 'End Time': 'ဆုံးချိန်', 'Use current time': 'လက်ရှိအချိန်သုံးရန်',
  'Auto-calculated:': 'အလိုအလျောက်တွက်ချက်ထားသည်:', 'Note (optional)': 'မှတ်ချက် (မဖြစ်မနေမဟုတ်ပါ)',
  'e.g. Morning shift': 'ဥပမာ မနက်ပိုင်းအလုပ်ချိန်', 'Gross Salary': 'စုစုပေါင်းလစာ', 'Cancel': 'မလုပ်တော့ပါ',
  'Save Changes': 'ပြင်ဆင်ချက်များသိမ်းရန်', 'Save': 'သိမ်းရန်', 'Delete': 'ဖျက်ရန်',
  'Add another time': 'အချိန်တစ်ခုထပ်ထည့်ရန်', 'Day total': 'တစ်နေ့တာစုစုပေါင်း', 'Change': 'ပြောင်းရန်',
  'Apply': 'အသုံးပြုရန်', 'Yes, apply': 'ဟုတ်ကဲ့၊ အသုံးပြုမည်', 'Delete this time': 'ဤအချိန်ကိုဖျက်ရန်',
  'Delete this time entry?': 'ဤအချိန်မှတ်တမ်းကိုဖျက်မလား။',
  'This will permanently remove this time and its salary from the day.': 'ဤအချိန်နှင့် ၎င်း၏လစာကို ဤနေ့မှ အပြီးတိုင်ဖယ်ရှားမည်။',
  'Send verification link': 'အတည်ပြုလင့်ခ်ပို့ရန်', 'Sign In': 'ဝင်ရန်', 'Sign in to your account': 'သင့်အကောင့်သို့ဝင်ပါ',
  'Email': 'အီးမေးလ်', 'Password': 'စကားဝှက်', 'New Password': 'စကားဝှက်အသစ်',
  'Current Password': 'လက်ရှိစကားဝှက်', 'Confirm Password': 'စကားဝှက်အတည်ပြုရန်',
  'Confirm New Password': 'စကားဝှက်အသစ်ကိုအတည်ပြုပါ', 'Create your account': 'အကောင့်ဖန်တီးရန်',
  'Track your hours and salary in seconds': 'သင့်အလုပ်ချိန်နှင့်လစာကို စက္ကန့်ပိုင်းအတွင်း မှတ်တမ်းတင်ပါ',
  'Forgot password?': 'စကားဝှက်မေ့နေပါသလား။', 'Create one': 'အကောင့်ဖွင့်ရန်',
  'Confirm your email': 'သင့်အီးမေးလ်ကိုအတည်ပြုပါ', 'Confirm': 'အတည်ပြုရန်',
  'Finish setting up': 'စနစ်တည်ဆောက်မှုကိုအပြီးသတ်ပါ', 'Finish': 'ပြီးပြီ',
  'You can change these anytime in Settings.': 'ဤအရာများကို ဆက်တင်များတွင် အချိန်မရွေးပြောင်းနိုင်ပါ။',
  'Connect Google': 'Google ချိတ်ဆက်ရန်', 'or continue with': 'သို့မဟုတ် ဤနည်းဖြင့်ဆက်လုပ်ရန်',
  'Continue with Google': 'Google ဖြင့်ဆက်လုပ်ရန်', 'Continue with phone number': 'ဖုန်းနံပါတ်ဖြင့်ဆက်လုပ်ရန်',
  'Phone Number': 'ဖုန်းနံပါတ်', 'Verification Code': 'အတည်ပြုကုဒ်',
  'Send verification code': 'အတည်ပြုကုဒ်ပို့ရန်', 'Verify & sign in': 'အတည်ပြုပြီးဝင်ရန်',
  'Back to email sign-in': 'အီးမေးလ်ဖြင့်ဝင်ရန်နောက်သို့', 'Set password': 'စကားဝှက်သတ်မှတ်ရန်',
  'Password sign-in': 'စကားဝှက်ဖြင့်ဝင်ခြင်း', 'Update your sign-in password.': 'အကောင့်ဝင်ရန်စကားဝှက်ကိုပြောင်းပါ။',
  'Change password': 'စကားဝှက်ပြောင်းရန်', 'Update password': 'စကားဝှက်ပြောင်းရန်',
  'Resend': 'ထပ်ပို့ရန်', 'Verify': 'အတည်ပြုပါ', 'to keep your password sign-in safe.': 'သင့်စကားဝှက်ဖြင့်ဝင်ခြင်းကို လုံခြုံစေရန်။',
  'Verified': 'အတည်ပြုပြီး', 'Pending verification': 'အတည်ပြုရန်စောင့်ဆိုင်းနေသည်',
  'Add email': 'အီးမေးလ်ထည့်ရန်', 'Send link': 'လင့်ခ်ပို့ရန်'
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('work-tracker-language') || 'en');
  useEffect(() => {
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
    document.documentElement.dataset.language = language;
  }, [language]);
  const setLanguage = (next) => {
    localStorage.setItem('work-tracker-language', next);
    setLanguageState(next);
  };
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text) => language === 'my' ? (translations[text] || text) : text,
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
}
