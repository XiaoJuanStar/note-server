let path = require('path');
const GROUP_NAME = 'notes';
const Joi = require('joi');

const models = require('../models');

module.exports = [{
    method:'post',
    path:`/${GROUP_NAME}/saveNotes`,
    handler: async (req, reply) => {
        const { id, token, title, content, src } = req.payload;
        const users = await models.users.findAll({
            where: { jwt_token: token }
        });
        var openId = users.openId;
        var updateStr = { open_id: openId, note_title: title, note_content: content, note_picture: src };
        if (id !== undefined) {
            await models.notes.update(updateStr, {
                where: { id: id },
            })
        } else{
            await models.notes.create(updateStr);
         }
        reply('ok');
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '新建日记接口',
        auth: false,
        validate: {
            payload: {
                sessionkey: Joi.string().required().description('用户sessionkey'),
                title: Joi.string().required().description('日记标题'),
                content: Joi.string().required().description('日记内容'),
                src: Joi.string().description('日记图片'),
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
        reply('ok')
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: '删除日记接口',
        auth: false,
        validate: {
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
        var openId = users.openId;
        if (openId !== undefined) {
            const result = await models.notes.findAll({
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
            payload: {
                sessionkey: Joi.string().required().description('用户sessionkey'),
            },
        },
    },
},]




