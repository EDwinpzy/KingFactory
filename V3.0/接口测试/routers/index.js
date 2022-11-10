/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:34:49
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:34:51
 */
const router = require('express').Router();
const queryWos = require('../controllers/queryWos');
router.post('/api/v1/get-multi-table', (req, res) => {
    queryWos.multiTable(req, res);
});

module.exports = router;
