/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:34:15
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:34:16
 */

let FilterData = require('./filterData');

class QueryWOS {
    constructor() {}
    async multiTable(req, res) {
        try {
            let bodyData = req.body;
            let { primaryTable, filter, combineTable } = bodyData;

            debugger;
            // console.log("primaryTable.data.st",primaryTable.data.st)
            // console.log("primaryTable.data.et",primaryTable.data.et)
            let params = {
                tableName: primaryTable.name,
                tableID: primaryTable.id,
                tableType: primaryTable.data.type,
                tableKind: primaryTable.data.kind,
                tableFields: primaryTable.data.fields,
                tableFilter: primaryTable.data.filter ? primaryTable.data.filter : '',
                tableSt: primaryTable.data.st ? dateToUTCTime(new Date(primaryTable.data.st)) : '',
                tableEt: primaryTable.data.et ? dateToUTCTime(new Date(primaryTable.data.et)) : '',
                tableTr: primaryTable.data.timeRelation ? primaryTable.data.timeRelation : 0,
                tableIv: primaryTable.data.interval,
                tableVs: primaryTable.data.version ? primaryTable.data.version : 0,
                tableRst: primaryTable.data.retrievalSt ? dateToUTCTime(new Date(primaryTable.data.retrievalSt)) : primaryTable.data.st ? dateToUTCTime(new Date(primaryTable.data.st)) : '',
                tableRet: primaryTable.data.retrievalEt ? dateToUTCTime(new Date(primaryTable.data.retrievalEt)) : primaryTable.data.et ? dateToUTCTime(new Date(primaryTable.data.et)) : '',
            };
            let tableInfo = await this.checkTable(params);
            if (!tableInfo.status) {
                return;
            }
            let primaryTableData = await this.getData(params, tableInfo);
            let primaryTableDataObj = {
                tableName: params.tableName,
                data: primaryTableData,
            };
            let combineTableData = [];
            for (let i = 0; i < combineTable.length; i++) {
                const element = combineTable[i];
                let joinType = element.type;
                let condition = element.condition;
                let paramsIndex = {
                    tableName: element.name,
                    tableID: element.id,
                    tableType: element.data.type,
                    tableKind: element.data.kind,
                    tableFields: element.data.fields,
                    tableFilter: element.data.filter ? element.data.filter : '',
                    tableSt: element.data.st ? dateToUTCTime(new Date(element.data.st)) : '',
                    tableEt: element.data.et ? dateToUTCTime(new Date(element.data.et)) : '',
                    tableTr: element.data.timeRelation ? element.data.timeRelation : 0,
                    tableIv: element.data.interval,
                    tableVs: element.data.version ? element.data.version : 0,
                    tableRst: element.data.retrievalSt ? dateToUTCTime(new Date(element.data.retrievalSt)) : element.data.st ? dateToUTCTime(new Date(element.data.st)) : '',
                    tableRet: element.data.retrievalEt ? dateToUTCTime(new Date(element.data.retrievalEt)) : element.data.et ? dateToUTCTime(new Date(element.data.et)) : '',
                };
                let tableInfo = await this.checkTable(paramsIndex);
                if (!tableInfo.status) {
                    return;
                }
                let combineTableDataIndex = await this.getData(paramsIndex, tableInfo);
                let obj = {
                    joinType: joinType,
                    data: combineTableDataIndex,
                    condition: condition,
                    tableName: element.name,
                };
                combineTableData.push(obj);
            }

            let joinDataResult = this.joinData(primaryTableDataObj, combineTableData);
            let filterDataResult = FilterData.filterData(filter, joinDataResult);
            res.send(filterDataResult);
        } catch (err) {
            res.send(err);
        }
    }
    async checkTable(params) {
        if (params.tableID) {
            return {
                status: true,
                id: params.tableID,
            };
        } else {
            if (params.tableName) {
                let _id = '';
                let status = false;
                switch (params.tableType) {
                    case 'real':
                        let realtimeObjType;
                        let objName = params.tableName;
                        if (params.tableKind == 'entity') {
                            realtimeObjType = 1; //物
                        } else if (params.tableKind == 'thing') {
                            realtimeObjType = 2; //事
                        } else {
                            // 类型不支持
                        }
                        let realRet = await QueryObjID(realtimeObjType, objName, 0);
                        // 最后生成的实时事对象在数组的第一项
                        // _id = realRet.data.objIds[realRet.data.objIds.length - 1];
                        _id = realRet.data.objIds[0];
                        if (_id) {
                            status = true;
                        }
                        break;
                    case 'history':
                        let historyObjectType; // 历史对象类型
                        let historyObjectName = params.tableName; // 历史对象名称
                        if (params.tableKind == 'entity') {
                            historyObjectType = 1; //物
                        } else if (params.tableKind == 'thing') {
                            historyObjectType = 2; //事
                        } else {
                            // 类型不支持
                        }
                        let hisRet = await QueryHistoryObjectIDs(historyObjectType, historyObjectName);
                        _id = hisRet.data.objectIds[hisRet.data.objectIds.length - 1];
                        if (_id) {
                            status = true;
                        }
                        break;
                    case 'plan':
                        status = false;
                        _id = params.tableID;
                        break;
                    default:
                        break;
                }
                return {
                    status: status,
                    id: _id,
                };
            } else {
                return {
                    status: false,
                    id: params.tableID,
                };
            }
        }
    }
    async getData(params, tableInfo) {
        let tableData;
        let transactionID = 0;
        switch (params.tableType) {
            case 'real':
                if (params.tableKind == 'entity') {
                    var ret = await QueryRealtimeEntity(tableInfo.id, params.tableFields, transactionID);
                    tableData = this.pretreatmentRealEntityData(ret.data);
                } else if (params.tableKind == 'thing') {
                    var ret = await QueryAllRealtimeThingData(tableInfo.id, '', params.tableFields, transactionID);
                    tableData = this.pretreatmentRealThingData(ret.data);
                } else {
                    // 类型不支持
                }
                break;
            case 'history':
                if (params.tableKind == 'entity') {
                    let filesInfo = [];
                    for (let i = 0; i < params.tableFields.length; i++) {
                        const element = params.tableFields[i];
                        let obj = {
                            name: element,
                        };
                        filesInfo.push(obj);
                    }
                    var ret = await QueryHistoryEntityDataByID(tableInfo.id, params.tableVs, params.tableSt, params.tableEt, params.tableIv, params.tableFilter, filesInfo);
                    tableData = this.pretreatmentHistoryEntityData(ret.data);
                } else if (params.tableKind == 'thing') {
                    let filesInfo = [];
                    for (let i = 0; i < params.tableFields.length; i++) {
                        const element = params.tableFields[i];
                        let obj = {
                            name: element,
                        };
                        filesInfo.push(obj);
                    }
                    var ret = await QueryHistoryThingDatasByID(tableInfo.id, params.tableVs, params.tableSt, params.tableEt, params.tableTr, params.tableRst, params.tableRet, params.tableFilter, filesInfo);
                    tableData = this.pretreatmentHistoryThingData(ret.data);
                } else {
                    // 类型不支持
                }
                break;
            case 'plan':
                let param = {
                    filter: params.tableFilter,
                    timeRelation: params.tableTr,
                };
                if (params.tableKind == 'entity') {
                    var type = 1;
                    var ret = await QueryPlanObjRecordPlanById(type, tableInfo.id, params.tableSt, params.tableEt, param, params.tableFields);
                    tableData = this.pretreatmentData(ret.data);
                } else if (params.tableKind == 'thing') {
                    var type = 2;
                    var ret = await QueryPlanObjRecordPlanById(type, tableInfo.id, params.tableSt, params.tableEt, param, params.tableFields);
                    tableData = this.pretreatmentData(ret.data);
                } else {
                    // 类型不支持
                }
                break;
            default:
                // 类型不支持
                break;
        }
        return tableData;
    }
    joinData(primaryTableDataObj, combineTableData) {
        let primaryTableName = primaryTableDataObj.tableName;
        let primaryTableData = primaryTableDataObj.data;
        for (let i = 0; i < combineTableData.length; i++) {
            let temporaryTable = [];
            let primaryTableConditionField = '';
            let combineTableConditionField = '';
            let joinType = combineTableData[i].joinType;
            let combineTableDataIndex = combineTableData[i].data;
            let condition = combineTableData[i].condition;
            condition = condition.replace(/\s*/g, '');
            let combineTableName = combineTableData[i].name;
            let conditionField1, conditionField2;
            let conditionFlag = condition.indexOf('===');
            if (conditionFlag == -1) {
                conditionFlag = condition.indexOf('==');
                if (conditionFlag == -1) {
                    conditionFlag = conditionFlag.indexOf('=');
                    if (conditionFlag == -1) {
                        // 错误
                    } else {
                        conditionField2 = condition.slice(conditionFlag + 1, condition.length);
                    }
                } else {
                    conditionField2 = condition.slice(conditionFlag + 2, condition.length);
                }
            } else {
                conditionField2 = condition.slice(conditionFlag + 3, condition.length);
            }
            conditionField1 = condition.slice(0, conditionFlag);
            let tableName1 = conditionField1.slice(0, conditionField1.indexOf('.'));
            let tableName2 = conditionField2.slice(0, conditionField2.indexOf('.'));
            let tableField1 = conditionField1.slice(conditionField1.indexOf('.') + 1, conditionField1.length);
            let tableField2 = conditionField2.slice(conditionField2.indexOf('.') + 1, conditionField2.length);
            if (tableName1 !== combineTableName && tableName1 !== primaryTableName) {
                // 表名不存在
            }
            if (tableName2 !== combineTableName && tableName2 !== primaryTableName) {
                // 表名不存在
            }
            if (tableName1 == primaryTableName) {
                primaryTableConditionField = tableField1;
                combineTableConditionField = tableField2;
            } else {
                primaryTableConditionField = tableField2;
                combineTableConditionField = tableField1;
            }
            switch (joinType.toUpperCase()) {
                case 'INNERJOIN':
                    for (let j = 0; j < primaryTableData.length; j++) {
                        const primaryTableDataIndex = primaryTableData[j];
                        for (let k = 0; k < primaryTableDataIndex.length; k++) {
                            const primaryTableDataField = primaryTableDataIndex[k];
                            if (primaryTableDataField.name == primaryTableConditionField) {
                                for (let m = 0; m < combineTableDataIndex.length; m++) {
                                    const combineTableDataIndexData = combineTableDataIndex[m];
                                    for (let n = 0; n < combineTableDataIndexData.length; n++) {
                                        const combineTableDataIndexDataField = combineTableDataIndexData[n];
                                        if (combineTableDataIndexDataField.name == combineTableConditionField) {
                                            if (Object.values(primaryTableDataField.value)[0] == Object.values(combineTableDataIndexDataField.value)[0]) {
                                                temporaryTable.push(primaryTableDataIndex.concat(combineTableDataIndexData));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'LEFTJOIN':
                    console.log(primaryTableData);
                    console.log(combineTableData);
                    let primaryCount = [];
                    let primaryCountAll = [];
                    for (let j = 0; j < primaryTableData.length; j++) {
                        primaryCountAll.push(j);
                        const primaryTableDataIndex = primaryTableData[j];
                        for (let k = 0; k < primaryTableDataIndex.length; k++) {
                            const primaryTableDataField = primaryTableDataIndex[k];
                            if (primaryTableDataField.name == primaryTableConditionField) {
                                for (let m = 0; m < combineTableDataIndex.length; m++) {
                                    const combineTableDataIndexData = combineTableDataIndex[m];
                                    for (let n = 0; n < combineTableDataIndexData.length; n++) {
                                        const combineTableDataIndexDataField = combineTableDataIndexData[n];
                                        if (combineTableDataIndexDataField.name == combineTableConditionField) {
                                            if (Object.values(primaryTableDataField.value)[0] == Object.values(combineTableDataIndexDataField.value)[0]) {
                                                temporaryTable.push(primaryTableDataIndex.concat(combineTableDataIndexData));
                                                primaryCount.push(j);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let o = 0; o < primaryCountAll.length; o++) {
                        const element = primaryCountAll[o];
                        if (primaryCount.indexOf(element) == -1) {
                            temporaryTable.push(primaryTableData[element]);
                        }
                    }
                    break;
                case 'RIGHTJOIN':
                    console.log(primaryTableData);
                    console.log(combineTableData);
                    let primaryCountRight = [];
                    let combineCountAllRight = [];
                    for (let j = 0; j < combineTableDataIndex.length; j++) {
                        combineCountAllRight.push(j);
                        const combineTableDataIndexData = combineTableDataIndex[j];
                        for (let k = 0; k < combineTableDataIndexData.length; k++) {
                            const combineTableDataIndexDataField = combineTableDataIndexData[k];
                            if (combineTableDataIndexDataField.name == combineTableConditionField) {
                                for (let m = 0; m < primaryTableData.length; m++) {
                                    const primaryTableDataIndex = primaryTableData[m];

                                    for (let n = 0; n < primaryTableDataIndex.length; n++) {
                                        const primaryTableDataField = primaryTableDataIndex[n];
                                        if (primaryTableDataField.name == primaryTableConditionField) {
                                            if (Object.values(primaryTableDataField.value)[0] == Object.values(combineTableDataIndexDataField.value)[0]) {
                                                temporaryTable.push(combineTableDataIndexData.concat(primaryTableDataIndex));
                                                primaryCountRight.push(j);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let o = 0; o < combineCountAllRight.length; o++) {
                        const element = combineCountAllRight[o];
                        if (primaryCountRight.indexOf(element) == -1) {
                            temporaryTable.push(combineTableDataIndex[element]);
                        }
                    }
                    break;
                case 'FULLJOIN':
                    console.log(primaryTableData);
                    console.log(combineTableData);
                    let primaryCountFull = [];
                    let primaryCountAllFull = [];
                    for (let j = 0; j < primaryTableData.length; j++) {
                        primaryCountAllFull.push(j);
                        const primaryTableDataIndex = primaryTableData[j];
                        for (let k = 0; k < primaryTableDataIndex.length; k++) {
                            const primaryTableDataField = primaryTableDataIndex[k];

                            if (primaryTableDataField.name == primaryTableConditionField) {
                                for (let m = 0; m < combineTableDataIndex.length; m++) {
                                    const combineTableDataIndexData = combineTableDataIndex[m];

                                    for (let n = 0; n < combineTableDataIndexData.length; n++) {
                                        const combineTableDataIndexDataField = combineTableDataIndexData[n];
                                        if (combineTableDataIndexDataField.name == combineTableConditionField) {
                                            if (Object.values(primaryTableDataField.value)[0] == Object.values(combineTableDataIndexDataField.value)[0]) {
                                                temporaryTable.push(primaryTableDataIndex.concat(combineTableDataIndexData));
                                                primaryCountFull.push(j);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let o = 0; o < primaryCountAllFull.length; o++) {
                        const element = primaryCountAllFull[o];
                        if (primaryCountFull.indexOf(element) == -1) {
                            temporaryTable.push(primaryTableData[element]);
                        }
                    }
                    let primaryCountFull2 = [];
                    let combineCountAllFull = [];
                    for (let j = 0; j < combineTableDataIndex.length; j++) {
                        combineCountAllFull.push(j);
                        const combineTableDataIndexData = combineTableDataIndex[j];
                        for (let k = 0; k < combineTableDataIndexData.length; k++) {
                            const combineTableDataIndexDataField = combineTableDataIndexData[k];

                            if (combineTableDataIndexDataField.name == combineTableConditionField) {
                                for (let m = 0; m < primaryTableData.length; m++) {
                                    const primaryTableDataIndex = primaryTableData[m];

                                    for (let n = 0; n < primaryTableDataIndex.length; n++) {
                                        const primaryTableDataField = primaryTableDataIndex[n];
                                        if (primaryTableDataField.name == primaryTableConditionField) {
                                            if (Object.values(primaryTableDataField.value)[0] == Object.values(combineTableDataIndexDataField.value)[0]) {
                                                primaryCountFull2.push(j);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let o = 0; o < combineCountAllFull.length; o++) {
                        const element = combineCountAllFull[o];
                        if (primaryCountFull2.indexOf(element) == -1) {
                            temporaryTable.push(combineTableDataIndex[element]);
                        }
                    }
                    break;
                default:
                    break;
            }
            console.log(temporaryTable);
            primaryTableData = temporaryTable;
        }
        return primaryTableData;
    }
    // filterData(filter, joinDataResult) {
    //     if (!filter) {
    //         return joinDataResult;
    //     }

    //     // 排序运算符  /order by/asc/desc
    //     // like /not like /in /not in
    //     //  >/>=/<=
    //     // ==
    //     // !=
    //     // and
    //     // or
    //     filter = "Websites.count > 2000 or Websites.id == 1 ORDER BY access_log.count DESC";
    //     let calcFlag = [">", ">=", "<=", "==", "!=", "and", "or"];
    //     for (let i = 0; i < calcFlag.length; i++) {
    //         const calcFlagIndex = calcFlag[i];
    //         if (filter.indexOf(calcFlagIndex) == -1) {

    //         }
    //     }

    // }
    pretreatmentRealEntityData(data) {
        let entityData = [];
        entityData.push(data.objFields);
        return entityData;
    }
    pretreatmentRealThingData(data) {
        let dealData = [];
        let thingFieldSets = data.thingFieldSets;
        for (let i = 0; i < thingFieldSets.length; i++) {
            let propertyList = thingFieldSets[i].propertyList;
            let dealDataChild = [];
            for (let i = 0; i < propertyList.length; i++) {
                const element = propertyList[i];
                dealDataChild.push(element);
            }
            dealData.push(dealDataChild);
        }
        return dealData;
    }
    pretreatmentHistoryEntityData(data) {
        let dealData = [];
        let records = data.records;
        for (let i = 0; i < records.length; i++) {
            let fields = records[i].fields;
            let dealDataChild = [];
            for (let i = 0; i < fields.length; i++) {
                const element = fields[i];
                dealDataChild.push(element);
            }
            dealData.push(dealDataChild);
        }
        return dealData;
    }
    pretreatmentHistoryThingData(data) {
        let dealData = [];
        let records = data.records;
        for (let i = 0; i < records.length; i++) {
            let fields = records[i].fields;
            let dealDataChild = [];
            for (let i = 0; i < fields.length; i++) {
                const element = fields[i];
                dealDataChild.push(element);
            }
            dealData.push(dealDataChild);
        }
        return dealData;
    }
}

module.exports = new QueryWOS();
