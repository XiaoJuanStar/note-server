const { env } = process;

const config = {
  host: env.HOST,
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  wxSecret: env.WX_SECRET,
  wxAppid: env.WX_APPID,
  bdAppid: env.BD_APPID,
  bdApiKey: env.BD_API_KEY,
  bdSecretKey:env.BD_SECRET_KEY,
};
module.exports = config;