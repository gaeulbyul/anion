var Sequelize = require('sequelize');

function AniONDB (dbconfig) {
	this.seq = new Sequelize(dbconfig.url, {
		dialect: 'postgres',
		omitNull: true, // http://stackoverflow.com/a/14333057
		dialectOptions: {
			ssl: !!dbconfig.ssl, // http://stackoverflow.com/a/27688357
		},
	});
	this.seq.authenticate()
		.then(function(err) {
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
			allowNull: true,
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

AniONDB.Sequelize = Sequelize;

module.exports = AniONDB;
