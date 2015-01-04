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
		return date8m.format({
			'YYYYMMDD': 'YYYY/MM/DD',
			'YYYYMM': 'YYYY/MM',
			'YYYY': 'YYYY'
		}[date8m._f]);
	},
	formatTime: function (time4) {
		var mtime = moment(time4, 'HHmm');
		if (mtime.isValid()) {
			return mtime.format('A h:mm');
		} else {
			return '???';
		}
	},
}

var AniON = angular.module('AniON', []);

AniON.factory('AniListFactory', function($rootScope, $http) {
	var current_weekday;
	var current_query;
	return {
		anis: [],
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
			return $http.get('/api/anilist/?weekday='+weekday+'&page='+page)
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
					console.error(r);
				})
			;;
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
			return $http.get('/api/anilist/?search='+encodeURIComponent(query)+'&page='+page)
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
			$rootScope.$broadcast('gotAniList', params);
		}
	};
});

AniON.controller('AniListCtrler', function ($scope, AniListFactory) {
	var weekday = new Date().getDay();
	AniListFactory.getAniList(weekday);
	$scope.$on('gotAniList', function (event, params) {
		var today = moment().format('YYYYMMDD');
		$scope.anis = AniListFactory.anis.map(function (ani) {
			var item = {
				// json: JSON.stringify(ani,null,2), // DEBUG
				id: ani.id,
				state: '',
				title: ani.title,
				genre: ani.genre.join(' / '),
				time: '',
				startdate: '',
				enddate: '',
				weekday: '',
			};
			var startdate = AniONUtils.parseDate(ani.startdate);
			var enddate = AniONUtils.parseDate(ani.enddate);
			if (params.amode == 's') {
				item.weekday = '일월화수목금토외신'.split('')[ani.weekday];
			}
			if (params.weekday < 7) {
				item.time = AniONUtils.formatTime(ani.time);
				// coming soon
				if (startdate.isValid() && today < ani.startdate) {
					item.state = '[' + (
						startdate.format('MM/DD')
					) + ']';
				}
				//completed
				if (enddate.isValid() && today >= ani.enddate) {
					item.state = '(완결)';
				}
				// absent
				if (!ani.ended && !ani.broaded) {
					item.state = '(결방)';
				}
			} else {
				startdate = AniONUtils.parseDate2(ani.startdate);
				enddate = AniONUtils.parseDate2(ani.enddate);
				if (startdate.isValid()) {
					item.time = AniONUtils.formatDate(startdate);
				} else {
					item.time = '방영일 불명';
				}
			}
			return item;
		});
	});
	// $scope.showAniList = function (data) {
	// 	$scope.anis = data;
	// }
});

AniON.controller('TitlebarCtrler', function ($scope, AniListFactory) {
	//http://stackoverflow.com/q/12618342
	$scope.formdata = {};
	$scope.menuVisible = false;
	$scope.toggleMenu = function (h) {
		$scope.menuVisible = !$scope.menuVisible;
	}
	$scope.currentWeekday = null;
	$scope.$on('gotAniList', function (e, params) {
		$scope.currentWeekday = params.weekday;
		$scope.menuVisible = false;
	});
	$scope.showWeekday = function ($event, weekday) {
		// var target = $event.currentTarget;
		AniListFactory.getAniList(weekday, 1);
		window.scrollTo(0, 0);
	}
	$scope.searchAniList = function ($event) {
		// var target = $event.currentTarget;
		AniListFactory.searchAniList($scope.formdata.query);
		window.scrollTo(0, 0);
	}
});

AniON.controller('AniListPageCtrler', function ($scope, AniListFactory) {
	$scope.pages = [];
	$scope.current_page = null;
	$scope.$on('gotAniList', function (e, params) {
		// TODO: fix current-page highlight on switch weekday
		// TODO: hide page when pages.length < 2
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
