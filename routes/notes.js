let path = require('path');
const GROUP_NAME = 'notes';
const Joi = require('joi');
const { jwtHeaderDefine } = require('../utils/router-helper');
const models = require('../models');

module.exports = [{
    method:'post',
    path:`/${GROUP_NAME}/saveNotes`,
    handler: async (req, reply) => {
        const { id, token, title, content,place, src } = req.payload;
        const users = await models.users.findAll({
            where: { jwt_token: token }
        });
        var openId = users[0].open_id || '';
        var updateStr = { open_id: openId, note_title: title, note_content: content, note_place: place,note_picture: src };
       
        if (id !== undefined) {
            await models.notes.update(updateStr, {
                where: { id: id },
            })
            reply({ result: true, msg: '更新成功' })
        } else if (openId != '') {
            await models.notes.create(updateStr);
            reply({ result: true, msg: '创建成功' })
        } else {   
            reply({ result: false, msg: '创建或保存失败' })
        }
       
       
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '保存日记接口',
        auth: false,
        validate: {
            payload: {
                id: Joi.number().description('日记id(可选)'),
                token: Joi.string().required().description('用户jwt_token'),
                title: Joi.string().required().description('日记标题'),
                content: Joi.string().required().description('日记内容')
            },
        },
    },
}, {
    method:'post',
    path:`/${GROUP_NAME}/deleteNotes`,
    handler: async (req, reply) => {
        const id = req.payload.id;
        await models.notes.destroy({
            where: { id: id },
        })
        reply({result:true,msg:'删除成功'})
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '删除日记接口',
        validate: {
            ...jwtHeaderDefine,
            payload: {
              id: Joi.number().required().description('日记ID'),
            },
        },
    },
},{
    method:'post',
    path:`/${GROUP_NAME}/getNotesList`,
    handler: async (req, reply) => {
        const token = req.payload.token;
        const users = await models.users.findAll({
            where: { jwt_token: token }
        });
        console.log('users');
        console.log(users[0].open_id);
        var openId = users[0].open_id || '';
        if (openId !== undefined) {
            const result = await models.notes.findAll({
                attributes: { exclude: ['open_id'] },
                where: { open_id: openId }
            });
            reply(result);

        } else{
            reply({list:[]})
         }
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '获取日记列表接口',
        auth: false,
        validate: {
            // ...jwtHeaderDefine, // 增加需要 jwt auth 认证的接口 header 校验
            payload: {
                token: Joi.string().required().description('用户jwt_token'),
            },
        },
    },
},{
    method:'post',
    path:`/${GROUP_NAME}/getNotesDetail`,
    handler: async (req, reply) => {
        const id = req.payload.id;
        const result = await models.notes.findAll({
            attributes: { exclude: ['open_id'] },
            where: { id: id }
        });
        reply(result);
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '获取日记详情接口',
        auth: false,
        validate: {
            // ...jwtHeaderDefine, // 增加需要 jwt auth 认证的接口 header 校验
            payload: {
                id: Joi.string().required().description('日记id'),
            },
        },
    },
},]




