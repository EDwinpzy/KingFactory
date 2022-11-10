/*
 * @Author: EDwin
 * @Date: 2022-09-06 09:56:00
 * @LastEditors: EDwin
 * @LastEditTime: 2022-09-06 09:56:01
 */
/*
 * @Author: EDwin
 * @Date: 2022-09-02 14:09:09
 * @LastEditors: EDwin
 * @LastEditTime: 2022-09-02 14:24:04
 */
/**
 * @type:
 * @description: ElementUI树控件模糊查询
 * @param {object} treeData - 树结构数据
 * @param {string} val - 筛选条件
 * @return {object} 筛选结果
 */
let onRecursionData = (arr, val) => {
    let newarr = [];
    arr.forEach((item) => {
        if (item.children && item.children.length) {
            let children = onRecursionData(item.children, val);
            let obj = {
                ...item,
                children,
            };
            if (children && children.length) {
                newarr.push(obj);
            } else if (item.label.includes(val)) {
                newarr.push({ ...item });
            }
        } else {
            if (item.label.includes(val)) {
                newarr.push(item);
            }
        }
    });
    return newarr;
};
