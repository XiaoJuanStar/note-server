const JWT = require('jsonwebtoken');
const Joi = require('joi');
const axios = require('axios');
const config = require('../config');
var Logger = require('../utils/logger');
const models = require('../models');
const decryptData = require('../utils/decrypted-data');

const GROUP_NAME = 'users';
var logger = Logger.getLogger('users');

module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}/createJWT`,
    handler: async (request, reply) => {
      const generateJWT = (jwtInfo) => {
        const payload = {
          userId: jwtInfo.userId,
          exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
        };
        return JWT.sign(payload, config.jwtSecret);
      };
      reply(generateJWT({ userId: 1,}));
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '用于测试的用户 JWT 签发',
      auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
    },
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/wxLogin`,
    handler: async (req, reply) => {
      const appid = config.wxAppid; //  appId
      const secret = config.wxSecret; //  appSecret
      const {
        code,
        encryptedData,
        iv
      } = req.payload;

      // 向微信小程序开放平台 换取 openid 与 session_key
      const response = await axios({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
          appid: appid,
          secret: secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      // response 中返回 openid 与 session_key
      const { openid,session_key: sessionKey } = response.data;

      console.log(response.data);

      // 基于 openid 查找或创建一个用户
      if (openid != undefined) {
        var user = await models.users.findOrCreate({
          where: {
            open_id: openid
          },
        });
      }
      // decrypt 解码用户信息
      const userInfo = decryptData(encryptedData, iv, sessionKey, appid);

      //  签发 jwt
      const generateJWT = (jwtInfo) => {
        const payload = {
          userId: jwtInfo.userId,
          exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
        };
        return JWT.sign(payload, config.jwtSecret);
      };
      var jwt = generateJWT({
        userId: user[0].id,
      });

      // 更新user表中的用户的资料信息
      const nic_kname = Buffer.from(userInfo.nickName).toString('base64');
      await models.users.update({
        nick_name: nic_kname,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        open_id: openid,
        session_key: sessionKey,
        jwt_token: jwt
      }, {
        where: {
          open_id: openid
        },
      });
      
      reply(jwt);


    },
    config: {
      auth: false, // 不需要用户验证
      tags: ['api', GROUP_NAME],
      validate: {
        payload: {
          code: Joi.string().required().description('微信用户登录的临时code'),
          encryptedData: Joi.string().required().description('微信用户信息encryptedData'),
          iv: Joi.string().required().description('微信用户信息iv'),
        },
      },
    },
  },
];