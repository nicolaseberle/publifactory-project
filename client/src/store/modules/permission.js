import { constantRouterMap } from '../../router'

/**
 * @param roles
 * @param route
 */
function hasPermission (roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter (routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRouter(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    UPDATE_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = routers
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        if (roles.includes('admin')) {
          accessedRouters = constantRouterMap
        } else {
          accessedRouters = filterAsyncRouter(constantRouterMap, roles)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    updateRoutes ({commit}, data) {
      return new Promise((resolve,reject)=>{
        //TO DO, inout needs to be the array of journals
        const followedJournals = [
            {'id': '5d0264a4d0738816c96658ca', 'title':'Genetics'},
            {'id':'5d0264a4d0738816c96658c9','title':'Dev Biology'}
          ]

        let  routes = filterAsyncRouter(constantRouterMap, data)
        routes.forEach((parentRoute)=>{
          if(parentRoute.path==='/feeds'){

              parentRoute.children = [
                {
                  'path': 'feeds',
                  'hidden': 'true',
                  'component': "() => import('../view/journals/index.vue')"
                }]

              for (let i = 0; i < followedJournals.length; i++){
                let componentRoute = '../view/journals/' + followedJournals[i].id
                let _route = {
                  'path': '/journals/' + followedJournals[i].id,
                  'name':  followedJournals[i].title,
                  'meta': { 'title': followedJournals[i].title, 'icon': 'book', 'noCache': 'true' },
                }
                parentRoute.children.push(_route)
              }
              //we add a route to add other journals

              const journal = () => import('../../view/journals/index.vue')
              parentRoute.children.push(
              {
                'path': '/journal',
                'name': 'Add Journals',
                'meta': { 'title': 'Add Journals', 'icon': 'plus', 'noCache': 'true' },
                "component": journal
              })
          }
        })
        commit('UPDATE_ROUTERS', routes)
        resolve()
      })
    }
  }
}

export default permission
