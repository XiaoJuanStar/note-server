const Joi = require('joi');
const AipOcrClient = require("baidu-aip-sdk").ocr;
// const fs = require('fs');
const { jwtHeaderDefine } = require('../utils/router-helper');
const config = require('../config');

const GROUP_NAME = 'ocr';

// 设置APPID/AK/SK
const APP_ID = config.bdAppid;
const API_KEY = config.bdApiKey;
const SECRET_KEY = config.bdSecretKey;

// 新建一个对象，建议只保存一个对象调用服务接口
let client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);


module.exports = [{
    method:'post',
    path: `/${GROUP_NAME}/distinguish`,
    handler: async (request, reply) => { 
        let url = request.payload.src || '';
        // 调用通用文字识别, 图片参数为远程url图片
        if (url !== '') {
            const ocr = await client.generalBasicUrl(url).then(function (result) {
                console.log(JSON.stringify(result));
                return JSON.stringify(result)
            }).catch(function (err) {
                // 如果发生网络错误
                return err;
            });
            reply(ocr);
        } else { 
            reply({ 'msg': '图片为空' });
        }
        
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '识别图片转换成文字接口',
        validate: {
            ...jwtHeaderDefine, // 增加需要 jwt auth 认证的接口 header 校验
            payload: {
              src: Joi.string().required().description('需要识别的图片链接'),
            },
        },
    }
}]
