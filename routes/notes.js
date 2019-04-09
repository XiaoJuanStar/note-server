let path = require('path');
const GROUP_NAME = 'notes';
const Joi = require('joi');
const { jwtHeaderDefine } = require('../utils/router-helper');
const models = require('../models');
const seq = require('sequelize');
const Op = seq.Op;

module.exports = [{
    method:'post',
    path:`/${GROUP_NAME}/saveNotes`,
    handler: async (req, reply) => {
        const { id, token, title, content,place, src } = req.payload;
        const users = await models.users.findAll({
            where: { jwt_token: token }
        });
        const openId = users[0].open_id || '';
        let updateStr = { open_id: openId, note_title: title, note_content: content, note_place: place,note_picture: src };
       
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
                content: Joi.string().required().description('日记内容'),
                src: Joi.string().allow('').description('图片链接(可选)'),
                place: Joi.string().allow('').description('日记地点(可选)'),
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
        const timeStart = req.payload.time;
        const users = await models.users.findAll({
            where: { jwt_token: token }
        });
        let openId = users[0].open_id || '';
        if (openId !== undefined) {
            let whereStr = { open_id: openId };
            if (timeStart !== '') {
                whereStr ={ open_id: openId, created_at: {[Op.gte]: timeStart+'', [Op.lte]: timeStart + ' 23:59:59'}}
            }
            const result = await models.notes.findAll({
                attributes: { exclude: ['open_id'] },
                where: whereStr
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
                time: Joi.string().allow('').description('日记筛选的时间')
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
            payload: {
                id: Joi.string().required().description('日记id'),
            },
        },
    },
},]




