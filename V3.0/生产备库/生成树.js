var data = [
    { id: 1, name: '负极工厂', parentId: 0 },
    { id: 2, name: '三偏心', parentId: 1 },
    { id: 3, name: '包装', parentId: 1 },
    { id: 4, name: '1#三偏心', parentId: 2 },
    // { id: 5, name: '正极工厂', parentId: 0 },
    // { id: 6, name: '除磁', parentId: 5 },
    // { id: 7, name: '1#除磁', parentId: 6 },
    // { id: 8, name: '2#除磁', parentId: 6 },
];
/**
 * @type:
 * @description:
 * @param {*} list - 输入父子结构数据
 * @param {*} rootValue 根节点
 * @return {*}
 */
function transListToTreeData(list, rootValue) {
    var arr = [];
    list.forEach((item) => {
        if (item.parentId === rootValue) {
            const children = transListToTreeData(list, item.id);
            if (children.length) {
                item.children = children;
            }
            arr.push(item);
        }
    });
    return arr;
}
var res = transListToTreeData(data, 0);
console.log(res);
