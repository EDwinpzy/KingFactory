/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:34:26
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:34:27
 */
class FilterData {
    constructor() {
        this.charArr = ['>', '<', '>=', '<=', '==', '!=', 'like', 'not like', 'in', 'not in'];
    }
    filterData(filter, joinDataResult) {
        let childSql = this.splitChildFilter(filter);
        let retArrData = [];
        // 对子句进行处理
        let andArr = [];
        let orArr = [];
        if (childSql) {
            // step1 处理子句
            childSql.orArr.forEach((item) => {
                // and 子句 取交集
                if (item.includes(' and ')) {
                    let itemArr = item.split(' and ');
                    if (itemArr.length) {
                        itemArr.forEach((el) => {
                            let arr = this.parseChildFilter(this.getChar(el), el, JSON.parse(JSON.stringify(joinDataResult)));
                            arr = this.convertArrStructStr(arr);
                            if (andArr.length === 0) {
                                andArr = arr;
                            } else {
                                andArr = andArr.filter((item) => new Set(arr).has(item));
                            }
                        });
                    }
                } else {
                    // 不包含and的子句 取并集
                    let arr = this.parseChildFilter(this.getChar(item), item, JSON.parse(JSON.stringify(joinDataResult)));
                    arr = this.convertArrStructStr(arr);
                    orArr = Array.from(new Set([...orArr, ...arr]));
                }
            });
            retArrData = orArr.concat(andArr);
            // step2 去除重复
            retArrData = this.duplicateReArray(retArrData);
            retArrData = this.convertArrStructObj(retArrData);
            // step3 处理排序
            retArrData = this.sortArrayByVal(childSql.orderBy, retArrData);
            return retArrData;
        } else {
            return joinDataResult;
        }
    }
    sortArrayByVal(val, data) {
        if (val) {
            val = val.toLowerCase();
            let tableName, param;
            if (val.includes('asc')) {
                let str = val.split('asc')[0];
                if (str) {
                    // 去掉空格
                    str = str.replace(/\s*/g, '');
                    tableName = str.split('.')[0];
                    param = str.split('.')[1];
                    // 升序
                    for (let index = 0; index < data.length; index++) {
                        for (let index1 = 0; index1 < data.length; index1++) {
                            if (this.getValue(param, data[index]) > this.getValue(param, data[index1])) {
                                let temp = data[index];
                                data[index] = data[index1];
                                data[index1] = temp;
                            }
                        }
                    }
                }
            }
            if (val.includes('desc')) {
                let str = val.split('desc')[0];
                if (str) {
                    // 去掉空格
                    str = str.replace(/\s*/g, '');
                    tableName = str.split('.')[0];
                    param = str.split('.')[1];
                    // 降序
                    for (let index = 0; index < data.length; index++) {
                        for (let index1 = 0; index1 < data.length; index1++) {
                            if (this.getValue(param, data[index]) < this.getValue(param, data[index1])) {
                                let temp = data[index];
                                data[index] = data[index1];
                                data[index1] = temp;
                            }
                        }
                    }
                }
            }
        }
        return data;
    }
    /**
     * convertArrStructStr
     */
    convertArrStructStr(arrObj) {
        let arrStr = [];
        arrObj.forEach((item) => {
            arrStr.push(JSON.stringify(item));
        });
        return arrStr;
    }
    /**
     * convertArrStructStr
     */
    convertArrStructObj(arrStr) {
        let arrObj = [];
        arrStr.forEach((item) => {
            arrObj.push(JSON.parse(item));
        });
        return arrObj;
    }
    //获取多维数组嵌套对象的值
    getValue(param, data) {
        let value = undefined;
        data.forEach((el) => {
            if (el.name === param) {
                value = this.getDataValue(el);
            }
        });
        return value;
    }
    /**
     * @description 数组去重方法
     * @param {*} array
     */
    duplicateReArray(array) {
        return array.filter((value, index, self) => {
            return value && self.indexOf(value) === index;
        });
    }
    /**
     * @description 使用"ORDER BY""or"字段对过滤字符串进行解析
     * @param {*} filter
     */
    splitChildFilter(filter) {
        let childFilter = {
            orderBy: '',
            orArr: [],
        };
        if (!filter) {
            return childFilter;
        } else {
            // step1 使用ORDER BY 将字符传转译，解析出排序的子句
            if (filter.includes(' ORDER BY ')) {
                let orderByArr = filter.split(' ORDER BY ');
                if (orderByArr.length === 2) {
                    childFilter.orderBy = orderByArr[1];
                    let orArr = orderByArr[0].split(' or ');
                    childFilter.orArr = orArr;
                } else {
                    // filter语句解析错误
                    return false;
                }
            } else {
                let orArr = filter.split(' or ');
                childFilter.orArr = orArr;
            }
        }
        return childFilter;
    }
    /**
     * @description 获取当前的过滤字符
     */
    getChar(filter) {
        let char = '';
        for (let index = 0; index < this.charArr.length; index++) {
            const element = this.charArr[index];
            if (filter.includes(element)) {
                char = element;
                break;
            }
        }
        return char;
    }
    parseChildFilter(char, filter, data) {
        // 去掉空格
        filter = filter.replace(/\s*/g, '');
        // 使用过滤符号分割条件
        let filterArr = filter.split(char);
        if (filterArr.length === 2 && (filterArr[0].includes('.') || filterArr[1].includes('.'))) {
            // 解析出表名称 字段名 过滤的值
            let tableName, param, value;
            if (filterArr[0].includes('.')) {
                tableName = filterArr[0].split('.')[0];
                param = filterArr[0].split('.')[1];
                value = filterArr[1];
            }
            if (filterArr[1].includes('.')) {
                tableName = filterArr[0].split('.')[0];
                param = filterArr[0].split('.')[1];
                value = filterArr[1];
            }
            var retData = [];
            // 处理数据
            data.forEach((item) => {
                if (item.length) {
                    item.forEach((el) => {
                        if (el.name === param) {
                            if (this.checkItemInvalid(char, value, el)) {
                                retData.push(item);
                            }
                        }
                    });
                }
            });
            return retData;
        } else {
            // 过滤子句格式不配置 直接返回
            return data;
        }
    }
    getDataValue(el) {
        if (el.value.stringValue !== undefined) {
            return el.value.stringValue;
        } else if (el.value.boolValue !== undefined) {
            return el.value.boolValue;
        } else if (el.value.int64Value !== undefined) {
            return el.value.int64Value;
        } else if (el.value.int32Value !== undefined) {
            return el.value.int32Value;
        } else if (el.value.int16Value !== undefined) {
            return el.value.int16Value;
        } else if (el.value.int8Value !== undefined) {
            return el.value.int8Value;
        } else if (el.value.uint64Value !== undefined) {
            return el.value.uint64Value;
        } else if (el.value.uint32Value !== undefined) {
            return el.value.uint32Value;
        } else if (el.value.uint16Value !== undefined) {
            return el.value.uint16Value;
        } else if (el.value.uint8Value !== undefined) {
            return el.value.uint8Value;
        } else if (el.value.floatValue !== undefined) {
            return el.value.floatValue;
        } else if (el.value.doubleValue !== undefined) {
            return el.value.doubleValue;
        } else if (el.value.datetimeValue !== undefined) {
            return el.value.datetimeValue;
        }
    }
    checkItemInvalid(char, value, data) {
        let flag = false;
        switch (char) {
            case '==':
                flag = this.getDataValue(data) == value;
                break;
            case '!=':
                flag = !this.getDataValue(data) == value;
                break;
            case 'like':
                flag = this.getDataValue(data).includes(value);
                break;
            case 'not like':
                flag = !this.getDataValue(data).includes(value);
                break;
            case '>':
                flag = +this.getDataValue(data) > value;
                break;
            case '>=':
                flag = +this.getDataValue(data) >= value;
                break;
            case '<=':
                flag = +this.getDataValue(data) <= value;
                break;
            case '<':
                flag = +this.getDataValue(data) < value;
                break;
            case 'in':
                flag = this.getDataValue(data).includes(value);
                break;
            case 'not in':
                flag = !this.getDataValue(data).includes(value);
                break;
            default:
                break;
        }
        return flag;
    }
}
module.exports = new FilterData();
