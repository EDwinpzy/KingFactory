/*
 * @Author: EDwin
 * @Date: 2022-09-06 09:56:29
 * @LastEditors: EDwin
 * @LastEditTime: 2022-09-06 16:50:00
 */
/**
 * @type:
 * @description: ElementUI表格控件模糊查询
 * @param {object} dataSet 需要筛选的数据集
 * @param {object} member 需要筛选的成员
 * @param {string} filter 筛选条件
 * @return {*}
 */
function dataFilter(dataSet, member, filter) {
    try {
        if ((typeof filter !== 'string' && typeof filter !== 'number') || typeof dataSet !== 'object' || (dataSet.length === undefined && member.length === undefined)) throw new Error('[错误]：输入参数有误！');
        if (filter != '') {
            for (var i = dataSet.length - 1; i >= 0; i--) {
                filter = filter.replace(/\+/g, '\\+');
                filter = filter.replace(/\(/g, '\\(');
                filter = filter.replace(/\)/g, '\\)');
                var reg = eval('/' + filter + '/ig');
                var flag = false;
                for (key in dataSet[i]) {
                    if (member.indexOf(key) > -1 && reg.test(dataSet[i][key]) === true) {
                        flag = true;
                        continue;
                    }
                }
                if (!flag) dataSet.splice(i, 1);
            }
            return dataSet;
        } else {
            return dataSet;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}
