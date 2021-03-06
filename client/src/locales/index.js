import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'
import eleZhCN from 'element-ui/lib/locale/lang/zh-CN'
import eleEn from 'element-ui/lib/locale/lang/en'
// import { merge } from 'lodash'
// import { lang } from '../stored'

const locales = {
  // 'zh-CN': merge(zhCN, eleZhCN),
  'zh-CN': Object.assign(zhCN, eleZhCN),
  // en: merge(en, eleEn)
  en: Object.assign(en, eleEn)
}

Vue.use(VueI18n)

Vue.config.lang = 'en'
Vue.config.fallbackLang = 'en'

// set locales
Object.keys(locales).forEach(lang => {
  Vue.locale(lang, locales[lang])
})
