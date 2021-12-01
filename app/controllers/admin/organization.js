var CONFIG = require('../../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')
var formidable = require('formidable')
var csv = require('csv-parser')
var fs = require('graceful-fs')
var organizationModel = require(CONFIG.path.models + '/organization.js')

exports.import_data = function(options) {
  return function(req, res) {
    organizationModel.getAll({ column: 'id', sort_type: 'ASC' }, function(organs_result){
      //console.log(organs_result)
      res.render('admin/organization/import_data', { organizations: organs_result, csrfToken: req.csrfToken() })
    })
  }
}

exports.show_index_status = function(options) {
  return function(req, res) {

    if(req.body.checked == "true"){
      organizationModel.update({ show_index: 1 }, {id: req.body.id}, false, function(show_index_result){
        res.json({result: true})
      })
    }else{
      organizationModel.update({ show_index: 0 }, {id: req.body.id}, false, function(show_index_result){
        res.json({result: true})
      })
    }

  }
}

exports.import_data_post = function(options) {
  return function(req, res) {
    var form = formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
      if(err) return res.redirect('/admin/management/organization/import_data')

      //console.log('received fields:');
      //console.log(fields);
      //console.log('received files:');
      //console.log(files.organization_csv);
      fs.createReadStream(files.organization_csv.path)
        .pipe(csv(['organ_id', 'organ_name', 'organ_name_abbr', 'level', 'parent_organ_id']))
        .on('data', function (data) {
          if(data.organ_id != "單位代碼"){
            if(data.organ_id == undefined){
              data.organ_id = ""
            }
            if(data.organ_name == undefined){
              data.organ_name = ""
            }
            if(data.organ_name_abbr == undefined){
              data.organ_name_abbr = ""
            }
            if(data.level == undefined){
              data.level = ""
            }
            if(data.parent_organ_id == undefined){
              data.parent_organ_id = ""
            }

            organizationModel.getOne('organ_id', data.organ_id, function(results){
              if(results.length == 1){
                update_obj = {
                  "organ_name": data.organ_name,
                  "organ_name_abbr": data.organ_name_abbr,
                  "level": data.level,
                  "parent_organ_id": data.parent_organ_id
                }
                //console.log(insert_obj)

                organizationModel.update(update_obj, {"organ_id": data.organ_id}, true, function(){})
              }else{
                insert_obj = {
                  "organ_id": data.organ_id,
                  "organ_name": data.organ_name,
                  "organ_name_abbr": data.organ_name_abbr,
                  "level": data.level,
                  "parent_organ_id": data.parent_organ_id,
                  "sort_index": 0,
                  "show_index": 0
                }
                //console.log(insert_obj)

                organizationModel.save(insert_obj, true, function(){})
              }
            })
          }
        })
      res.redirect('/admin/management/organization/import_data')
    });



    //res.render('admin/organization/import_data')
  }
}
