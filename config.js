var env = process.env;

module.exports = {
	port: env.ANION_PORT || 8081,
	env: env.ANION_ENV || 'development',
	database: {
		host: env.ANION_DB_HOST || 'localhost',
		name: env.ANION_DB_NAME || 'anion',
		username: env.ANION_DB_USERNAME || 'zn1707',
		password: env.ANION_DB_PASSWORD || 'dbfflfkffl',
	},
};
