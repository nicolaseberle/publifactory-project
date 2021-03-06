import Vue from 'vue'
import { lang, pageLimit } from '../../stored'
import { save } from '../../storage'
import { STORE_KEY_CONFIG_LANG, STORE_KEY_CONFIG_PAGE_LIMIT, STORE_KEY_CONFIG_SIDEBAR } from '../../constants'

const state = {
  lang: lang,
  langs: [{
    label: '中文',
    value: 'zh-CN'
  },
  {
    label: 'English',
    value: 'en'
  },
  {
    label: 'French',
    value: 'fr'
  }],
  pageLimit: pageLimit
}

const mutations = {
  UPDATE (state, config) {
    state.lang = config.lang || state.lang
    state.pageLimit = config.pageLimit || state.pageLimit
  },
  UPDATE_LANG (state, lang) {
    state.lang = lang || state.lang
  }
}

const actions = {
  changeLang ({ commit }, lang) {
    Vue.config.lang = lang
    commit('UPDATE_LANG', lang)
    save(STORE_KEY_CONFIG_LANG, lang)
  },
  changeSideBar ({ commit }, sidebar) {
    Vue.config.sidebar = sidebar
    commit('UPDATE_SIDEBAR', sidebar)
    save(STORE_KEY_CONFIG_SIDEBAR, sidebar)
  },
  updateGlobalConfig ({ commit, state, dispatch }, config) {
    if (config.lang !== state.lang) {
      Vue.config.lang = config.lang
      save(STORE_KEY_CONFIG_LANG, config.lang)
    }
    commit('UPDATE', config)
    save(STORE_KEY_CONFIG_LANG, state.lang)
    save(STORE_KEY_CONFIG_PAGE_LIMIT, state.pageLimit)
  }
}

const getters = {
  globalConfig (state) {
    return state
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
