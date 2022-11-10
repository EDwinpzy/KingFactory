/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:33:36
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:33:59
 */
/**
 * @file  		    index.js
 * @description   	路由控制处理入口
 * @author 		    sheng.hou
 * @createDate 	  	2022/09/16
 * @version   	   	1.0
 */

const controllers = {};
controllers.queryWos = require('./queryWos');

module.exports = controllers;
