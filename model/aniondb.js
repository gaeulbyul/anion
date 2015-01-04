var mongoose = require('mongoose');
var format = require('util').format;
RegExp.escape = function RegExp__escape (t) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	return t.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

var AniONDB = {};

AniONDB.connect = function(url, recon) {
	this.mongourl = 'mongodb://' + url;
	this.recon = !!recon;
	mongoose.connect(this.mongourl);
};

AniONDB.disconnect = function() {
	mongoose.disconnect();
};

mongoose.connection.on('disconnected', function() {
	if (AniONDB.recon) {
		AniONDB.connect(AniONDB.mongourl);
	}
});

AniONDB.rAniSchema = {
	index: Number,
	weekday: Number,
	id: {
		type: Number,
		unique: true,
		required: true
	},
	title: {
		type: String,
		unique: true,
		required: true
	},
	genre: [String],
	time: String,
	ended: Boolean,
	homepage: String,
	broaded: Boolean,
	startdate: String, // because invalid date like 20149999
	enddate: String,
	links: {
		rigveda: String,
		animeta: String,
		wiki_chan: String,
		onnada: Number,
		myanimelist: Number,
		ann: Number,
		anime_planet: String,
		anidb: Number,
		wiki_ko: String,
		wiki_en: String,
		wiki_ja: String
	},
	images: [String]
}

AniONDB.AniSchema = new mongoose.Schema(AniONDB.rAniSchema, {
	toObject: {
		virtuals: false
	},
	toJSON: {
		virtuals: true
	}
});

AniONDB.AniSchema.statics = {
	searchAni: function(condi, page, callback) {
		var self = this;
		page = page || 0;
		var ended = condi.ended = condi.weekday == 9;
		if (ended) {
			delete condi.weekday;
		}
		var fields = '-_id id title genre startdate enddate ended';
		if (condi.search) {
			var pattern = new RegExp('.*' +RegExp.escape(condi.search)+ '.*', 'i')
			condi.title = pattern;
			delete condi.search;
		}
		if (!ended) {
			fields += ' weekday time broaded';
		}
		this.count(condi)
			.exec(function (err_c, count) {
				self.find(condi)
					.skip(page * 30)
					.limit(30)
					.sort(condi.search ? 'ended weekday index' : 'index weekday')
					.select(fields)
					.exec(function (err_f, result) {
						callback(err_f, result, count);
					});
			});
	},
	getAni: function(id, callback) {
		this.findOne(
			{id: id},
			'-_id weekday title genre time ended homepage broaded startdate enddate links images'
		)
		.exec(callback);
	},
	updateAni: function updateAni(json) {
		var updates = {
			index: json.index,
			title: json.title,
			genre: json.genre,
			ended: json.ended,
			homepage: json.homepage,
			startdate: json.startdate,
			enddate: json.enddate
		};
		'weekday time broaded'.split(' ').forEach(function(k){
			if (k in json) {
				updates[k] = json[k];
			}
		});
		this.update(
			{id: json.id},
			updates,
			{upsert: true}
		).exec();
	}
}

AniONDB.AniSchema.methods.getLink = function(sitename) {
	var templates = {
		enha: {
			url: 'http://mirror.enha.kr/wiki/%s',
			name: '엔하위키(미러)'
		},
		rigveda: {
			url: 'http://rigvedawiki.net/r1/wiki.php/%s',
			name: '리그베다 위키'
		},
		animeta: {
			url: 'http://animeta.net/works/%s/',
			name: '애니메타'
		},
		wiki_chan: {
			url: 'http://wiki-chan.net/index.php/%s',
			name: '위키쨩'
		},
		onnada:  {
			url: 'http://anime.onnada.com/view.php?id=%s',
			sitename: '온나다 애니'
		},
		myanimelist:  {
			url: 'http://myanimelist.net/anime/%s',
			name: 'MyAnimeList'
		},
		ann:  {
			url: 'http://www.animenewsnetwork.com/encyclopedia/anime.php?id=%s',
			name: 'Anime News Network'
		},
		anime_planet:  {
			url: 'http://www.anime-planet.com/anime/%s',
			name: 'Anime-Planet'
		},
		anidb:  {
			url: 'http://anidb.net/perl-bin/animedb.pl?show=anime&aid=%s',
			name: 'AniDB'
		},
		wiki_ko:  {
			url: 'http://ko.wikipedia.org/wiki/%s',
			name: 'Wikipedia - 한국어'
		},
		wiki_en:  {
			url: 'http://en.wikipedia.org/wiki/%s',
			name: 'Wikipedia - 영어'
		},
		wiki_ja:  {
			url: 'http://ja.wikipedia.org/wiki/%s',
			name: 'Wikipedia - 일본어'
		}
	};
	var site = templates[sitename];
	var id_or_name = this.links[sitename];
	if (!site || !id_or_name) {
		return;
	}
	var url = format(site.url, id_or_name);
	return {
		name: site.name,
		url: url
	};
};

AniONDB.Ani = mongoose.model('Ani', AniONDB.AniSchema);

module.exports = AniONDB;