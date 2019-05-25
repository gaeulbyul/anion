'use strict'
/* global angular, moment */

var AniONUtils = {
  parseDate: function(date8) {
    if (date8.indexOf('999999') > -1 || date8.indexOf('000') > -1) {
      return moment(null)
    }
    return moment(date8, 'YYYYMMDD')
  },
  parseDate2: function(date8) {
    if (date8.indexOf('999999') > -1 || date8.indexOf('000') > -1) {
      return moment(null)
    }
    return moment(date8, 'YYYYMMDD YYYYMM YYYY'.split(' '))
  },
  formatDate: function(date8m) {
    if (typeof date8m === 'string') {
      date8m = AniONUtils.parseDate2(date8m)
    }
    if (moment.isMoment(date8m) && date8m.isValid()) {
      return date8m.format(
        {
          YYYYMMDD: 'YYYY/MM/DD',
          YYYYMM: 'YYYY/MM',
          YYYY: 'YYYY/??',
        }[date8m._f]
      )
    } else {
      return '???'
    }
  },
  formatDate2: function(date8m) {
    if (typeof date8m === 'string') {
      date8m = AniONUtils.parseDate2(date8m)
    }
    if (moment.isMoment(date8m) && date8m.isValid()) {
      return date8m.format(
        {
          YYYYMMDD: 'YYYY년 M월 DD일',
          YYYYMM: 'YYYY년 M월',
          YYYY: 'YYYY년?',
        }[date8m._f]
      )
    } else {
      return '???'
    }
  },
  formatTime: function(time4) {
    var mtime = moment(time4, 'HHmm')
    if (mtime.isValid()) {
      return mtime.format('A h:mm')
    } else {
      return '???'
    }
  },
  makeItem: function(ani, params) {
    var today = moment().format('YYYYMMDD')
    var item = {
      id: ani.id,
      weekday: ani.weekday,
      title: ani.title,
      title2: ani.title,
      genre: ani.genre,
      time: ani.time,
      ended: ani.ended,
      homepage: ani.homepage,
      state: '',
      startdate: ani.startdate,
      enddate: ani.enddate,
      amode: params.amode,
      query: params.query,
      genre_query: params.genre,
      comingsoon: false,
      completed: false,
      absent: false,
    }
    var startdate = AniONUtils.parseDate(ani.startdate)
    var enddate = AniONUtils.parseDate(ani.enddate)
    if (item.weekday < 7) {
      // coming soon
      if (startdate.isValid() && today < ani.startdate) {
        item.comingsoon = startdate.format('ll')
        if (params.amode !== 'd') {
          item.state = '[방영예정: ' + startdate.format('MM/DD') + ']'
          item.comingsoon = true
        }
      }
      // completed
      if (enddate.isValid() && today >= ani.enddate && !ani.ended) {
        item.state = '(완결)'
        item.completed = true
      }
      // absent
      if (!ani.ended && !ani.broaded) {
        item.state = '(결방)'
        item.absent = true
      }
    }
    item.notice = /anissia\.net/.test(ani.homepage)
    var title2 = ani.title
    var word_blacklist = '극장판,OVA,OAD,미방영화,()'
    title2 = title2.replace(/제?\d+기/, '')
    word_blacklist.split(',').forEach(function(w) {
      title2 = title2.replace(w, '')
    })
    item.title2 = title2.trim()
    return item
  },
  escapeRegexp: function(t) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    return t.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
  },
  reorderAnis: function(anilist) {
    var anis = [],
      anis_completed = [],
      anis_comingsoon = []
    anilist.forEach(function(ani) {
      var t = anis
      if (ani.comingsoon) {
        t = anis_comingsoon
      } else if (ani.completed) {
        t = anis_completed
      }
      t.push(ani)
    })
    var result = anis.concat(anis_comingsoon, anis_completed)
    return result
  },
}

angular.module('AniONFilters', []).filter({
  weekday1: function() {
    return function(input) {
      if (input === null) {
        return '종'
      }
      return '일월화수목금토외신'[input]
    }
  },
  weekday: function() {
    return function(input) {
      if (input === null) {
        return '종영'
      }
      return '일요일 월요일 화요일 수요일 목요일 금요일 토요일 기타 신작'.split(
        ' '
      )[input]
    }
  },
  time4: function() {
    return AniONUtils.formatTime
  },
  date8: function() {
    return AniONUtils.formatDate
  },
  date8_2: function() {
    return AniONUtils.formatDate2
  },
  startdate: function() {
    return function(input) {
      var startdate = AniONUtils.parseDate2(input)
      return startdate.format('YYYY년 MM월') + ' 방영'
    }
  },
  datetime14: function() {
    return function(input) {
      var m = moment(input, 'YYYYMMDDHHmmss')
      if (m.isValid()) {
        // return m.format('YYYY/MM/DD HH:mm:ss');
        return m.format('YYYY/MM/DD A h:mm')
      } else {
        return '???'
      }
    }
  },
  genre: function() {
    return function(input) {
      if (input) {
        return input.replace(/,/g, ', ')
      } else {
        return '장르 불명'
      }
    }
  },
  highlight: [
    '$sce',
    function($sce) {
      return function(input) {
        return $sce.trustAsHtml(
          input.replace(/``(.+?)``/g, '<span class="match">$1</span>')
        )
      }
    },
  ],
  matchQuery: function() {
    return function(input, word) {
      if (!word) {
        return input
      }
      var patt = new RegExp('(' + AniONUtils.escapeRegexp(word) + ')', 'gi')
      return input.replace(patt, '``$1``')
    }
  },
  urlhost: function() {
    return function(input) {
      var a = document.createElement('a')
      a.href = input
      var host = a.hostname
      if (host.length > 25) {
        host = host.substr(0, 25) + '…'
      }
      return host
    }
  },
  escapeHtml: function() {
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    }
    return function(input) {
      return String(input).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s]
      })
    }
  },
})

var AniON = angular.module('AniON', ['ngRoute', 'ngTouch', 'MainCtrlers'])

AniON.config([
  '$routeProvider',
  '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        template: document.getElementById('T-anilist').innerHTML,
        controller: 'AniListCtrler',
      })
      .when('/ani/:id', {
        template: document.getElementById('T-anidetail').innerHTML,
        controller: 'AniDetailCtrler',
        resolve: {
          aniDetail: [
            '$route',
            'AniDetailFactory',
            function($route, AniDetailFactory) {
              var id = $route.current.params.id
              return AniDetailFactory.getAniDetail(id)
            },
          ],
        },
      })
      .otherwise({
        redirectTo: '/',
      })
    // 2017-11-12: Angular.js v1.6 changed default hashPrefix to '!'
    // https://github.com/angular/angular.js/commit/aa077e81129c740041438688dff2e8d20c3d7b52
    $locationProvider.hashPrefix('')
  },
]).run([
  '$location',
  'AniListFactory',
  function($location, AniListFactory) {
    var path = $location.path()
    if (path === '' || path === '/') {
      AniListFactory.getTodayAniList()
    }
  },
])

AniON.factory('AniListFactory', [
  '$rootScope',
  '$http',
  function($rootScope, $http) {
    var current_weekday
    var current_query
    var current_genre
    return {
      recent: {},
      getRecentAniList: function() {
        if (this.recent.amode) {
          this.broadcastAniList(this.recent)
        }
      },
      getAniList: function(weekday, page) {
        var self = this
        if (weekday === -1) {
          weekday = current_weekday
        } else {
          current_weekday = weekday
        }
        if (typeof page === 'undefined') {
          page = 1
        }
        $rootScope.$broadcast('beforeAniList')
        return $http
          .get('api/anilist/?weekday=' + weekday + '&page=' + page)
          .then(function(response) {
            var data = response.data
            self.broadcastAniList({
              anis: data.result,
              amode: 'w',
              weekday: weekday,
              count: data.count,
              page: page,
            })
          })
      },
      getTodayAniList: function() {
        var weekday = new Date().getDay()
        return this.getAniList(weekday)
      },
      searchAniList: function(query, page) {
        var self = this
        if (query === -1) {
          query = current_query
        } else {
          current_query = query
        }
        if (typeof page === 'undefined') {
          page = 1
        }
        $rootScope.$broadcast('beforeAniList')
        return $http
          .get(
            'api/anilist/?search=' + encodeURIComponent(query) + '&page=' + page
          )
          .then(function(response) {
            var data = response.data
            self.broadcastAniList({
              anis: data.result,
              amode: 's',
              query: query,
              count: data.count,
              page: page,
            })
          })
      },
      getByGenreAniList: function(genre, page) {
        var self = this
        if (genre === -1) {
          genre = current_genre
        } else {
          current_genre = genre
        }
        if (typeof page === 'undefined') {
          page = 1
        }
        $rootScope.$broadcast('beforeAniList')
        return $http
          .get(
            'api/anilist/?genre=' + encodeURIComponent(genre) + '&page=' + page
          )
          .then(function(response) {
            var data = response.data
            self.broadcastAniList({
              anis: data.result,
              amode: 'g',
              genre: genre,
              count: data.count,
              page: page,
            })
          })
      },
      broadcastAniList: function(params) {
        // http://stackoverflow.com/a/11847277
        this.recent = params
        $rootScope.$broadcast('gotAniList', params)
      },
      getAniGenres: function() {
        return $http.get('api/genres').then(function(response) {
          var data = response.data
          $rootScope.$broadcast('gotAniGenres', data.sort())
        })
      },
    }
  },
])

AniON.factory('AniDetailFactory', [
  '$rootScope',
  '$http',
  function($rootScope, $http) {
    return {
      getAniDetail: function(id) {
        $rootScope.$broadcast('beforeAniDetail')
        // return $http.get('api/ani/?id=' + id);
        return $http({
          method: 'GET',
          url: 'api/ani',
          params: { id: id },
          cache: true,
        }).then(function(response) {
          var data = response.data
          $rootScope.$broadcast('gotAniDetail', data)
          return data
        })
      },
    }
  },
])

AniON.factory('AniCaptionFactory', [
  '$rootScope',
  '$http',
  '$q',
  function($rootScope, $http, $q) {
    var cache = {}
    return {
      getCaptions: function(id) {
        // return $http.get('api/cap/?id=' + id);
        return $http({
          method: 'GET',
          url: 'api/cap',
          params: { id: id },
          cache: true,
        }).then(function(response) {
          var data = response.data
          return data
        })
      },
    }
  },
])

AniON.controller('TitlebarCtrler', [
  '$scope',
  '$location',
  '$window',
  'AniListFactory',
  function($scope, $location, $window, AniListFactory) {
    //http://stackoverflow.com/q/12618342
    $scope.formdata = {}
    $scope.menuVisible = false
    $scope.searchFocused = false
    $scope.currentWeekday = null
    $scope.aniGenres = []
    $scope.goBack = function($event) {
      $event.preventDefault()
      $event.stopPropagation()
      $window.history.back()
    }
    $scope.toggleMenu = function($event) {
      $event.preventDefault()
      $event.stopPropagation()
      $scope.menuVisible = !$scope.menuVisible
      if ($scope.aniGenres.length === 0) {
        AniListFactory.getAniGenres()
      }
    }
    $scope.onFocusSearchbar = function($event) {
      $scope.searchFocused = true
    }
    $scope.onBlurSearchbar = function($event) {
      $scope.searchFocused = false
    }
    $scope.$on('gotAniList', function(event, params) {
      $scope.menuVisible = false
      var amode = params.amode
      if (amode !== 'g') {
        $scope.selectedGenre = ''
      }
      if (amode === 'w') {
        $scope.currentWeekday = params.weekday
      } else if (amode === 's' || amode === 'g') {
        $scope.currentWeekday = null
      }
    })
    $scope.$on('gotAniGenres', function(event, params) {
      if ($scope.aniGenres.length === 0) {
        $scope.aniGenres = params
      }
    })
    $scope.showWeekday = function($event, weekday) {
      $location.path('/')
      AniListFactory.getAniList(weekday, 1)
      window.scrollTo(0, 0)
    }
    $scope.searchAniList = function($event) {
      $location.path('/')
      AniListFactory.searchAniList($scope.formdata.query)
      window.scrollTo(0, 0)
      document.activeElement.blur()
    }
    $scope.showByGenres = function() {
      document.activeElement.blur()
      $location.path('/')
      var selectedGenre = $scope.selectedGenre
      if (selectedGenre !== '') {
        AniListFactory.getByGenreAniList(selectedGenre, 1)
      } else {
        AniListFactory.getTodayAniList()
      }
    }
  },
])

AniON.controller('MainViewCtrler', [
  '$scope',
  '$rootScope',
  function($scope, $rootScope) {
    $scope.loading = true
    $scope.currentWeekday = null
    $scope.$on('beforeAniList', function(event) {
      $scope.loading = true
    })
    $scope.$on('beforeAniDetail', function(event) {
      $scope.loading = true
    })
    $scope.$on('gotAniList', function(event, params) {
      $scope.loading = false
      if (params.amode === 'w') {
        $rootScope.title = 'Ani-ON'
        $scope.currentWeekday = params.weekday
      } else {
        $scope.currentWeekday = null
        if (params.amode === 's') {
          $rootScope.title = '"' + params.query + '"에 대한 검색 결과 – Ani-ON'
        }
      }
    })
    $scope.$on('gotAniDetail', function(event, ani) {
      $scope.loading = false
      $rootScope.title = ani.title + ' – Ani-ON'
    })
  },
])

var MainCtrlers = angular.module('MainCtrlers', ['AniONFilters'])

MainCtrlers.controller('AniListCtrler', [
  '$scope',
  'AniListFactory',
  function($scope, AniListFactory) {
    $scope.init = function() {
      AniListFactory.getRecentAniList()
    }
    $scope.$on('gotAniList', function(event, params) {
      var anis = params.anis
      if (anis.length > 0) {
        $scope.anis = AniONUtils.reorderAnis(
          anis.map(function(ani) {
            return AniONUtils.makeItem(ani, params)
          })
        )
      } else {
        $scope.anis = []
      }
      document.getElementById('main').className = 'main-ani-list'
    })
    $scope.swipeLeft = function($event) {
      var weekday = $scope.currentWeekday
      if (weekday !== null && weekday <= 6) {
        AniListFactory.getAniList(weekday < 6 ? weekday + 1 : 0)
      }
    }
    $scope.swipeRight = function($event) {
      var weekday = $scope.currentWeekday
      if (weekday !== null && weekday <= 6) {
        AniListFactory.getAniList(weekday > 0 ? weekday - 1 : 6)
      }
    }
  },
])

MainCtrlers.controller('AniListPageCtrler', [
  '$scope',
  'AniListFactory',
  function($scope, AniListFactory) {
    $scope.init = function() {
      AniListFactory.getRecentAniList()
    }
    $scope.$on('gotAniList', function(event, params) {
      var count = params.count
      $scope.current_page = params.page
      $scope.current_listmode = params.amode
      $scope.pages = []
      for (var p = 1; p <= Math.ceil(count / 30); p++) {
        $scope.pages.push(p)
      }
    })
    $scope.showPage = function($event, page) {
      var methodname
      switch ($scope.current_listmode) {
        case 'w':
          methodname = 'getAniList'
          break
        case 's':
          methodname = 'searchAniList'
          break
        case 'g':
          methodname = 'getByGenreAniList'
          break
      }
      AniListFactory[methodname](-1, page)
      window.scrollTo(0, 0)
    }
  },
])

MainCtrlers.directive('aniItem', [
  'AniCaptionFactory',
  function(AniCaptionFactory) {
    return {
      restrict: 'E',
      scope: true,
      controller: [
        '$scope',
        function($scope) {
          $scope.expanded = false
          $scope.expand = function($event, ani) {
            $event.preventDefault()
            $scope.expanded = !$scope.expanded
          }
        },
      ],
      template: document.getElementById('T-aniitem').innerHTML,
    }
  },
])

MainCtrlers.directive('capList', [
  '$window',
  'AniCaptionFactory',
  function($window, AniCaptionFactory) {
    return {
      restrict: 'E',
      scope: {
        aniID: '=aniid',
      },
      controller: [
        '$scope',
        function($scope) {
          $scope.caps = []
          $scope.caps_loading = true
          if ($scope.aniID) {
            AniCaptionFactory.getCaptions($scope.aniID).then(function(caps) {
              $scope.caps_loading = false
              $scope.caps = caps
            })
          }
          $scope.checklink = function($event, url) {
            $event.preventDefault()
            if (url) {
              $window.open(url, '_blank')
            } else {
              alert('주소가 등록되어있지 않습니다.')
            }
          }
        },
      ],
      template: document.getElementById('T-caplist').innerHTML,
    }
  },
])

MainCtrlers.controller('AniDetailCtrler', [
  '$scope',
  '$routeParams',
  '$window',
  'aniDetail',
  function($scope, $routeParams, $window, aniDetail) {
    $scope.ani = AniONUtils.makeItem(aniDetail, { amode: 'd' })
    $scope.$on('$routeChangeSuccess', function(event) {
      document.getElementById('main').className = 'main-ani-detail'
      $scope.loading = false
      /*
        AniDetailFactory.getAniDetail(id)
          .success(function (ani) {
            $scope.ani = AniONUtils.makeItem(ani, {amode: 'd'});
          })
          .error(function (r) {
            alert('찾을 수 없습니다!');
            $window.history.back();
          });
        */
    })
  },
])
