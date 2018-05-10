var CONFIG = require('../config/global.js')
var yaml = require('write-yaml')

//var fileModel = require(CONFIG.path.models + '/file.js')
var categoryModel = require(CONFIG.path.models + '/file_category.js')
var organModel = require(CONFIG.path.models + '/organization.js')

module.exports = {
  generate_api_spec: function() {

    categoryModel.getAll({ column: 'id', sort_type: 'DESC' }, function(categories){
      var categories_id_array = [];
      var categories_string_array = []
      categories.forEach(function(item, index){
        categories_id_array.push(item.id)
        categories_string_array.push(item.category_name + '(' + item.id + ')')
      })
      var categories_string = categories_string_array.join(";")
      //console.log(categories_id_array)

      organModel.getAll({ column: 'id', sort_type: 'DESC' }, function(organs){
        var organs_id_array = [];
        organs.forEach(function(organ_item, organ_index){
          organs_id_array.push(organ_item.organ_id)
        })

        var schemes_type = 'http'
        if(CONFIG.appenv.env == 'production'){
          schemes_type = 'https'
        }


        var data = {
        	"swagger": "2.0",
        	"info": {
        		"title": "圖片API - 臺南市政府圖片資料庫平台",
        		"description": "提供圖片 API，包含：取得、新增、更新、刪除。\n透過 API Key 方能使用。",
        		"version": "1.0.0"
        	},
        	"schemes": [schemes_type],
        	"basePath": "",
        	"produces": [
        		"application/json"
        	],
        	"securityDefinitions": {
        		"APIKeyAuth": {
        			"type": "apiKey",
        			"in": "query",
        			"name": "api_key"
        		}
        	},
        	"security": [
        		{
        			"APIKeyAuth": []
        		}
        	],
        	"paths": {
        		"/api/v1.0/image/{u_id}": {
        			"get": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "透過短網址 id，取得檔案資料",
        				"description": "透過短網址 id，取得檔案資料",
        				"parameters": [
        					{
        						"name": "u_id",
        						"in": "path",
        						"description": "短網址 id",
        						"required": true,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳檔案網址及相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key、未經授權的 API Key、沒有相關資料、無權取得該檔案資料"
        					},
        					"404": {
        						"description": "找不到該檔案"
        					}
        				}
        			},
        			"put": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "更新檔案資料",
        				"description": "更新檔案資料",
        				"consumes": [
        					"multipart/form-data"
        				],
        				"parameters": [
        					{
        						"name": "u_id",
        						"in": "path",
        						"description": "短網址 id",
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "title",
        						"in": "formData",
        						"description": "檔案標題",
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "permissions",
        						"in": "formData",
        						"default": "1",
        						"enum": [
        							"1",
        							"2",
        							"3"
        						],
        						"description": "檔案權限：\n1 公開(此為預設，代表前台看得到)；\n2 隱藏(前台看不到，短網址只有原上傳者及平台管理者看得到)；\n3 共用(前台看不到，知道短網址的人，皆可看到)",
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "category",
        						"in": "formData",
        						"description": categories_string,
        						"default": "1",
        						"enum": categories_id_array,
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "tags",
        						"in": "formData",
        						"description": "以半形逗號(,)做分隔",
        						"required": false,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳圖片網址及相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key 或 未經授權的 API Key"
        					}
        				}
        			}
        		},
        		"/api/v1.0/image": {
        			"get": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "透過參數資料，來取得檔案",
        				"description": "透過標題、標籤、分類、局處、瀏覽量，取得檔案資料",
        				"parameters": [
        					{
        						"name": "title",
        						"in": "query",
        						"description": "檔案標題",
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "tag",
        						"in": "query",
        						"description": "Tag",
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "category_id",
        						"in": "query",
        						"description": categories_string,
        						"enum": categories_id_array,
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "organ_id",
        						"in": "query",
        						"description": "組織。因數量較多，請查閱組織id",
        						"enum": organs_id_array,
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "pageviews",
        						"in": "query",
        						"description": "瀏覽量，例否輸入100，會篩選出瀏覽量大於等於100的檔案",
        						"default": 0,
        						"required": false,
        						"type": "integer"
        					},
        					{
        						"name": "page",
        						"in": "query",
        						"description": "頁碼",
        						"default": 1,
        						"required": false,
        						"type": "integer"
        					},
        					{
        						"name": "items_per_page",
        						"in": "query",
        						"description": "每個 page 取得幾筆，最大為 30。",
        						"default": 10,
        						"required": false,
        						"type": "integer"
        					},
        					{
        						"name": "sort_type",
        						"in": "query",
        						"description": "created_at：建立的時間；pageviews：瀏覽量；like：按讚數",
        						"enum": [
        							"created_at",
        							"pageviews",
        							"like"
        						],
        						"default": "created_at",
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "sort_value",
        						"in": "query",
        						"description": "DESC：降冪；ASC：升冪",
        						"enum": [
        							"DESC",
        							"ASC"
        						],
        						"default": "DESC",
        						"required": true,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳檔案網址及相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key、未經授權的 API Key、沒有相關資料、無權取得該檔案資料"
        					},
        					"404": {
        						"description": "找不到該檔案"
        					}
        				}
        			},
        			"post": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "上傳檔案",
        				"description": "上傳檔案",
        				"consumes": [
        					"multipart/form-data"
        				],
        				"parameters": [
        					{
        						"name": "title",
        						"in": "formData",
        						"description": "檔案標題",
        						"required": false,
        						"type": "string"
        					},
        					{
        						"name": "upload",
        						"in": "formData",
        						"description": "選擇檔案",
        						"required": true,
        						"type": "file"
        					},
        					{
        						"name": "permissions",
        						"in": "formData",
        						"default": "1",
        						"enum": [
        							"1",
        							"2",
        							"3"
        						],
        						"description": "檔案權限：\n1 公開(此為預設，代表前台看得到)；\n2 隱藏(前台看不到，短網址只有原上傳者及平台管理者看得到)；\n3 共用(前台看不到，知道短網址的人，皆可看到)",
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "category",
        						"in": "formData",
        						"description": categories_string,
        						"default": "1",
        						"enum": categories_id_array,
        						"required": true,
        						"type": "string"
        					},
        					{
        						"name": "tags",
        						"in": "formData",
        						"description": "以半形逗號(,)做分隔",
        						"required": false,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳圖片網址及相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key 或 未經授權的 API Key"
        					}
        				}
        			}
        		},
        		"/api/v1.0/image/trash/{u_id}": {
        			"delete": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "將檔案丟到垃圾桶，實際未刪除",
        				"description": "透過短網址 id，將檔案丟到垃圾桶",
        				"parameters": [
        					{
        						"name": "u_id",
        						"in": "path",
        						"description": "短網址 id",
        						"required": true,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key、未經授權的 API Key、無權更新該檔案資料"
        					},
        					"404": {
        						"description": "找不到該檔案"
        					}
        				}
        			}
        		},
        		"/api/v1.0/image/trash/{u_id}/undo": {
        			"delete": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "將垃圾桶裡的檔案復原",
        				"description": "透過短網址 id，將垃圾桶裡的檔案復原",
        				"parameters": [
        					{
        						"name": "u_id",
        						"in": "path",
        						"description": "短網址 id",
        						"required": true,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key、未經授權的 API Key、無權更新該檔案資料、此檔案過去未被丟至垃圾桶"
        					},
        					"404": {
        						"description": "找不到該檔案"
        					}
        				}
        			}
        		},
        		"/api/v1.0/image/delete/{u_id}": {
        			"delete": {
        				"tags": [
        					"圖片"
        				],
        				"summary": "將檔案刪除，無法復原",
        				"description": "透過短網址 id，將檔案刪除，無法復原",
        				"parameters": [
        					{
        						"name": "u_id",
        						"in": "path",
        						"description": "短網址 id",
        						"required": true,
        						"type": "string"
        					}
        				],
        				"responses": {
        					"200": {
        						"description": "回傳相關資料"
        					},
        					"403": {
        						"description": "未提供 API Key、未經授權的 API Key、無權更新該檔案資料"
        					},
        					"404": {
        						"description": "找不到該檔案"
        					}
        				}
        			}
        		}
        	}
        }
        yaml(CONFIG.path.public + '/yaml/api_spec.yaml', data, function(err) {
          // do stuff with err
        })

      })



    })

  }
}
