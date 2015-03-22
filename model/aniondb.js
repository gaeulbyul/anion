var Sequelize = require('sequelize');

RegExp.escape = function RegExp__escape (t) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	return t.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function AniONDB (dbconfig) {
	this.config = dbconfig;
	var seqoptions = {
		dialect: 'postgres',
		omitNull: true, // http://stackoverflow.com/a/14333057
		dialectOptions: {
			ssl: !!dbconfig.ssl, // http://stackoverflow.com/a/27688357
		},
	};
	if (this.config.url) {
		this.seq = new Sequelize(this.config.url, seqoptions);
	} else {
		seqoptions.host = dbconfig.host;
		this.seq = new Sequelize(this.config.name, this.config.username, this.config.password, seqoptions);
	}
	this.seq.authenticate()
		.complete(function(err) {
			if (err) {
				console.error('Error on connection db: %s', err);
			}
		})
	;;
	this.Ani = this.seq.define('Ani', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		index: {
			type: Sequelize.INTEGER,
			//allowNull: false,
		},
		weekday: {
			type: Sequelize.INTEGER,
			allowNull: true, // for ended ani
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		time: {
			type: Sequelize.STRING(4),
			defaultValue: '0000',
		},
		ended: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
		homepage: Sequelize.STRING,
		genre: Sequelize.STRING,
		broaded: Sequelize.BOOLEAN,
		startdate: {
			type: Sequelize.STRING(8),
			defaultValue: '00000000',
		},
		enddate: {
			type: Sequelize.STRING(8),
			defaultValue: '00000000',
		},
	}, {
		freezeTableName: true,
		tableName: 'ani',
		createdAt: false,
		updatedAt: false,
	});

	this.Genre = this.seq.define('Genre', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		ani_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		genre: {
			type: Sequelize.STRING(30),
			allowNull: false,
		},
	}, {
		freezeTableName: true,
		tableName: 'ani_genres',
		createdAt: false,
		updatedAt: false,
	});
};



/*

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
*/

module.exports = AniONDB;

