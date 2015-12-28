var env = process.env;

module.exports = {
  port: env.PORT || env.ANION_PORT || 8081,
  env: env.ANION_ENV || 'production',
  database: {
    url : env.DATABASE_URL,
    ssl: !!env.DATABASE_USE_SSL,
  },
};
