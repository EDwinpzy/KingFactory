/*
 * @Author: EDwin
 * @Date: 2022-07-16 16:21:23
 * @LastEditors: EDwin
 * @LastEditTime: 2022-07-16 16:42:48
 */
model = {
    模型管理事件对象ID: XXX,
    模型ID: XXX,
};
predefine = {
    模型管理事件对象ID: XXX,
    预定义ID: XXX,
};
object = {
    模型管理事件对象ID: XXX,
    对象ID: XXX,
};
/**
 * @type:
 * @description: 删除模型。预定义，对象函数
 * @param {object} model - 删除模型信息 {模型管理事件对象ID: XXX, 模型ID: XXX}，可为空
 * @param {object} predefine - 删除预定义信息 {模型管理事件对象ID: XXX, 模型ID: XXX}，可为空
 * @param {object} object - 删除对象信息 {模型管理事件对象ID: XXX, 模型ID: XXX}，可为空
 * @return {boolean} true:成功 flase:失败
 */
function Delete(model, predefine, object) {
    var 删除类型 = 根据输入参数判断删除类型;
    switch (删除类型) {
        case 删除模型:
            var 模型管理事件对象ID = model.模型管理事件对象ID;
            var res = update((模型管理事件对象ID下的所有数据.是否删除 = 是), (model.模型ID = 模型管理事件对象ID下的所有数据.));
    }
}