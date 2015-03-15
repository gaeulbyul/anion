var env = process.env;

module.exports = {
	port: env.ANION_PORT || 8081,
	env: env.ANION_ENV || 'development',
	useragent: env.ANION_USERAGENT || 'Ani-ON Crawler - TestVersion',
	database: {
		url : env.DATABASE_URL,
		host: env.ANION_DB_HOST,
		name: env.ANION_DB_NAME,
		username: env.ANION_DB_USERNAME,
		password: env.ANION_DB_PASSWORD,
	},
};
