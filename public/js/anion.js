'use strict';

var AniONUtils = {
	parseDate: function (date8) {
		if (date8.indexOf('999999') > 0) {
			return moment(null);
		}
		return moment(date8, 'YYYYMMDD');
	},
	parseDate2: function (date8) {
		if (date8.indexOf('999999') > 0) {
			return moment(null);
		}
		return moment(date8, 'YYYYMMDD YYYYMM YYYY'.split(' '));
	},
	formatDate: function (date8m) {
		if (typeof date8m == 'string') {
			date8m = AniONUtils.parseDate2(date8m);
		}
		if (moment.isMoment(date8m) && date8m.isValid()) {
			return date8m.format({
				'YYYYMMDD': 'YYYY년 MM월 DD일',
				'YYYYMM': 'YYYY년 MM월',
				'YYYY': 'YYYY년',
			}[date8m._f]);
		} else {
			return '???';
		}
	},
	formatTime: function (time4) {
		var mtime = moment(time4, 'HHmm');
		if (mtime.isValid()) {
			return mtime.format('A h:mm');
		} else {
			return '???';
		}
	},
	makeItem: function (ani, params) {
		var today = moment().format('YYYYMMDD');
		var item = {
			// json: JSON.stringify(ani,null,2), // DEBUG
			id: ani.id,
			weekday: ani.weekday,
			title: ani.title,
			genre: ani.genres,
			time: ani.time,
			ended: ani.ended,
			state: '',
			startdate: ani.startdate,
			enddate: ani.enddate,
			amode: params.amode,
		};
		var startdate = AniONUtils.parseDate(ani.startdate);
		var enddate = AniONUtils.parseDate(ani.enddate);
		if (ani.weekday < 7) {
			// coming soon
			if (startdate.isValid() && today < ani.startdate) {
				item.comingsoon = startdate.format('ll');
				if (params.amode != 'd') {
					item.state = '[' + (
						startdate.format('MM/DD')
					) + ']';
				}
			}
			//completed
			if (enddate.isValid() && today >= ani.enddate) {
				item.state = '(완결)';
			}
			// absent
			if (!ani.ended && !ani.broaded) {
				item.state = '(결방)';
			}
		}
		/*
		else {
			startdate = AniONUtils.parseDate2(ani.startdate);
			enddate = AniONUtils.parseDate2(ani.enddate);
			if (startdate.isValid()) {
				item.startdate = AniONUtils.formatDate(startdate);
			} else {
				item.startdate = '방영일 불명';
			}
		}
		*/
		return item;
	},
}


angular.module('AniONFilters', []).filter({
	weekday1: function () {return function (input) {
		return '일월화수목금토외신종'[input];
	}},
	weekday: function() {return function (input) {
		return '일요일 월요일 화요일 수요일 목요일 금요일 토요일 기타 신작 종영'.split(' ')[input];
	}},
	time4: function() {return AniONUtils.formatTime},
	date8: function() {return AniONUtils.formatDate},
	datetime14: function (){return function (input) {
		var m = moment(input, 'YYYYMMDDHHmmss');
		if (m.isValid()) {
			// return m.format('YYYY/MM/DD HH:mm:ss');
			return m.format('YYYY/MM/DD A h:mm:ss');
		} else {
			return '???';
		}
	}},
	genre: function() {return function (input) {
		if (Array.isArray(input) && input.length > 0 && !!input[0]) {
			return input.join(' / ');
		} else {
			return '장르 미정';
		}
	}},
});

var AniON = angular.module('AniON', [
	'ngRoute',
	'MainCtrlers',
]);

AniON
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				template: document.getElementById('T-anilist').innerHTML,
				controller: 'AniListCtrler',
			})
			.when('/ani/:id', {
				template: document.getElementById('T-anidetail').innerHTML,
				controller: 'AniDetailCtrler',
			})
			.otherwise({
				redirectTo: '/',
			});
	})
	.run(function ($location, AniListFactory) {
		var path = $location.path();
		if (path == '' || path == '/') {
			AniListFactory.getTodayAniList();
		}
	})
;;

AniON.factory('AniListFactory', function($rootScope, $http) {
	var current_weekday;
	var current_query;
	return {
		anis: [],
		recent: {},
		getRecentAniList: function () {
			this.broadcastAniList(this.recent);
		},
		getAniList: function (weekday, page) {
			var self = this;
			if (weekday == -1) {
				weekday = current_weekday;
			} else {
				current_weekday = weekday;
			}
			if (typeof page == 'undefined') {
				page = 1;
			}
			return $http.get('api/anilist/?weekday='+weekday+'&page='+page)
				.success(function(r){
					self.anis = r.result;
					self.broadcastAniList({
						amode: 'w',
						weekday: weekday,
						count: r.count,
						page: page
					});
				})
				.error(function(r) {
					//console.error(r);
				})
			;;
		},
		getTodayAniList: function () {
			var weekday = new Date().getDay();
			return this.getAniList(weekday);
		},
		searchAniList: function (query, page) {
			var self = this;
			if (query === -1) {
				query = current_query;
			} else {
				current_query = query;
			}
			if (typeof page == 'undefined') {
				page = 1;
			}
			return $http.get('api/anilist/?search='+encodeURIComponent(query)+'&page='+page)
				.success(function(r){
					self.anis = r.result;
					self.broadcastAniList({
						amode: 's',
						query: query,
						count: r.count,
						page: page
					});
				})
				.error(function(r) {
					console.error(r);
				})
			;;
		},
		broadcastAniList: function (params) {
			// http://stackoverflow.com/a/11847277
			// console.log('recent? %s', this.recent.recent); XXX
			this.recent = params;
			$rootScope.$broadcast('gotAniList', params);
			this.recent.recent = true;
		},
	};
});

AniON.factory('AniDetailFactory', function ($rootScope, $http) {
	return {
		ani: [],
		getAniDetail: function (id) {
			var self = this;
			return $http.get('api/ani/?id='+id)
				.success(function(r){
					self.ani = r;
					self.broadcastAniDetail();
				})
				.error(function(r) {
					// console.error(r);
				})
			;;
		},
		broadcastAniDetail: function (params) {
			$rootScope.$broadcast('gotAniDetail' /*, params */);
		},
	};
});

AniON.factory('AniCaptionFactory', function ($rootScope, $http) {
	return {
		caps: [],
		getCaptions: function (id) {
			var self = this;
			return $http.get('api/cap/?id='+id)
				.success(function(r){
					self.caps = r;
					self.broadcastAniCaptions();
				})
				.error(function(r) {
					console.error(r);
				})
			;;
		},
		broadcastAniCaptions: function (params) {
			$rootScope.$broadcast('gotAniCaptions' /*, params */);
		},
	};
});

AniON.controller('TitlebarCtrler', function ($scope, $location, $window, AniListFactory) {
	//http://stackoverflow.com/q/12618342
	$scope.formdata = {};
	$scope.menuVisible = false;
	$scope.toggleMenu = function ($event) {
		$scope.menuVisible = !$scope.menuVisible;
	}
	$scope.currentMode = null;
	$scope.currentWeekday = null;
	$scope.currentPage = null;
	$scope.currentQuery = null;
	$scope.$on('gotAniList', function (event, params) {
		$scope.currentPage = params.page;
		$scope.currentMode = params.amode;
		if (params.amode == 'w') {
			$scope.currentWeekday = params.weekday;
			$scope.currentQuery = null;
		} else if (params.amode == 's') {
			$scope.currentWeekday = null;
			$scope.currentQuery = params.query;
		}
		$scope.menuVisible = false;
		$scope.leftIsBack = false;
	});
	$scope.goBack = function ($event) {
		$window.history.back();
	};
	$scope.showWeekday = function ($event, weekday) {
		// var target = $event.currentTarget;
		AniListFactory.getAniList(weekday, 1);
		window.scrollTo(0, 0);
	};
	$scope.searchAniList = function ($event) {
		// var target = $event.currentTarget;
		$location.path('/');
		AniListFactory.searchAniList($scope.formdata.query);
		window.scrollTo(0, 0);
	};
});

var MainCtrlers = angular.module('MainCtrlers', ['AniONFilters']);

MainCtrlers.controller('AniListCtrler', function ($scope, AniListFactory) {
	// $scope.anis = [];
	$scope.init = function () {
		//AniListFactory.getRecentAniList();
	}
	$scope.$on('gotAniList', function (event, params) {
		if (AniListFactory.anis.length > 0) {
			$scope.anis = AniListFactory.anis.map(function (ani) {
				return AniONUtils.makeItem(ani, params);
			});
		} else {
			// problem here..
			//AniListFactory.getTodayAniList();
		}
		document.getElementById('main').className = 'main-ani-list';
	});
});

MainCtrlers.controller('AniListPageCtrler', function ($scope, AniListFactory) {
	// $scope.pages = [];
	// $scope.current_page = null;
	$scope.init = function () {
		//AniListFactory.getRecentAniList();
	}
	$scope.$on('gotAniList', function (event, params) {
		var count = params.count;
		$scope.current_page = params.page;
		$scope.current_listmode = params.amode;
		$scope.pages = [];
		for (var p=1; p<=Math.ceil(count / 30); p++) {
			$scope.pages.push(p);
		}
	});
	$scope.showPage = function ($event, page) {
		AniListFactory[($scope.current_listmode == 'w' ? 'get' : 'search')+'AniList'](-1, page);
		window.scrollTo(0, 0);
	}
});

MainCtrlers.controller('AniDetailCtrler',
	function ($scope, $routeParams, $window, AniDetailFactory, AniCaptionFactory)
{
	$scope.nourl = 'javascript:'
	$scope.ani = {};
	$scope.caps = [];
	$scope.checklink = function (event, url) {
		if (!url) {
			event.preventDefault();
			alert('주소가 등록되어있지 않습니다.');
		}
	}
	$scope.$on('$routeChangeSuccess', function (event) {
		var id = $routeParams.id;
		AniDetailFactory.getAniDetail(id)
			.error(function (r) {
				alert('찾을 수 없습니다!');
				$window.history.back();
			})
		;;
		AniCaptionFactory.getCaptions(id);
	});
	$scope.$on('gotAniDetail', function (event) {
		$scope.ani = AniONUtils.makeItem(AniDetailFactory.ani, {amode: 'd'});
		document.getElementById('main').className = 'main-ani-detail';
	});
	$scope.$on('gotAniCaptions', function (event) {
		// $scope.caps = AniCaptionFactory.caps;
		$scope.caps = AniCaptionFactory.caps.map(function (c) {
			c.json = JSON.stringify(c,null,2);
			return c;
		});
	})
});