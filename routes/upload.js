let path = require('path');
const GROUP_NAME = 'upload';
let fs = require('fs');
let multiparty = require('multiparty');
const Joi = require('joi');

var upload = function(files, reply) {
    fs.readFile(files.file[0].path, function(err, data) {
        fs.writeFile(files.file[0].originalFilename, data, function(err) {
            if (err) return reply(err);
            else return reply('File uploaded to: ' + files.file[0].originalFilename);

        });
    });
};

module.exports = [{
    method:'post',
    path:`/${GROUP_NAME}/uploadImg`,
    handler: function (request, reply) {
        var upload=request.payload.upload || '';
        if (upload !== '') {
            var uploadname = path.basename(request.payload.upload.hapi.filename);
            console.log(uploadname);
            if (/.(jpg|jpeg|png)$/.test(uploadname)) {
                var des = path.join(__dirname, '../uploads', uploadname);
                upload.pipe(fs.createWriteStream(des));
                reply({ result: true, code: 0 });
            } else { 
                reply({ result: false, msg: '请上传jpg或jpeg或png格式图片' });
            }
        } else {
            reply({ result: false, msg: '上传图片为空' });
        }
    },
    config: {
        payload: {
            maxBytes: 209715200,
            output: 'stream',
            parse: true,
        },
        tags: ['api', GROUP_NAME],
        description: '图片上传接口',
        auth: false,
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        },
        validate: {
            payload: {
                upload: Joi.any()
                    .meta({ swaggerType: 'file' })
                    .description('json file')
            }
        },
    },
}]




