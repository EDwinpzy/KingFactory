debugger;
// var 作业计划方案记录ID = "3787527286618590038"; //在此先写死 本应存入主页的页面变量
var 作业计划方案记录ID = $System.$PicManager.KingMES_自动制定作业计划APP_作业计划方案管理.$Variable.tableClick_dataRecID_workPlan; //在此先写死 本应存入主页的页面变量
var 作业计划预定义id = $System.$PicManager.KingMES_自动制定作业计划APP_计划结果查看.$Variable.workPlanDefID;
QueryData(作业计划预定义id);
async function QueryData(作业计划预定义id) {
    let type1 = 2;

    let param1 = {
        filter: '',
        storageLocation: 1,
    };
    let fieldName1 = ['ID', 'Name'];

    var res1 = await QueryRootPlanObjByDef(type1, 作业计划预定义id, param1, fieldName1); // 查询所有作业计划对象

    let param2 = {
        timeRelation: 1,
        dataVersionName: 'v1',
        filter: '',
    };

    let fieldNames2 = ['所属作业计划生产工单ID', '锁定状态', '计划流转时间', '计划结束时间', '计划开始时间', '生产数量', '型号物预定义', 'DataName', 'DataID', 'Space'];
    let startTime1 = dateToUTCTime(new Date('2002-07-31 00:00:00.00'));
    let endTime1 = dateToUTCTime(new Date('2032-09-31 00:00:00.00'));
    //动态查询指定对象的一定时间范围内的计划事记录
    let type2 = 6;

    var objArr = [];
    var dataArr = [];
    if (!res1.errorCode) {
        let queryRes1 = res1.data.objFieldValues; // 数组
        if (queryRes1.length) {
            for (let i = 0; i < queryRes1.length; i++) {
                let queryID = queryRes1[i].queryID;
                var res2 = await QueryPlanObjRecordByIdByTime(type2, queryID, startTime1, endTime1, param2, fieldNames2);
                if (!res2.errorCode && res2.data.queryValues.objectDatas.length > 0) {
                    let finalFlag = res2.data.finalFlag;
                    let objectDatas = res2.data.queryValues.objectDatas[0].objectFieldValues.fieldValues;
                    for (let j = 0; j < objectDatas.length; j++) {
                        objArr.push(objectDatas[j]);
                    }
                }
            }

            let startTime2 = dateToUTCTime(new Date('2002-07-31 00:00:00.00'));
            let endTime2 = dateToUTCTime(new Date('2032-09-31 00:00:00.00'));

            // 前置：创建父子对象-CreatePlanObj;创建父子记录-AddPlanObjRecord;给父记录更改基准时间-UpdatePlanThingPlanTime;添加数据版本-CreatePlanThingDataVersion;按父记录查询子记录-QueryChildPlanObjRecordByTime
            let type3 = 6;
            let parentRecordId = 作业计划方案记录ID;
            // let startTime1 = dateToUTCTime(new Date("2022-08-28 13:12:10.00"));
            // let endTime1 = dateToUTCTime(new Date("2022-08-28 13:15:10.00"));
            let param3 = {
                filter: '',
                timeRelation: 0,
            };
            let fieldName = ['DataID'];
            var res3 = await QueryChildPlanObjRecordByTime(type3, parentRecordId, startTime2, endTime2, param3, fieldName); //  根据作业计划方案记录ID查询子记录
            // res3.data.queryValues.objectDatas[0].objectId
            if (!res3.errorCode) {
                // let queryRes2 = res3.data.queryValues.objectDatas[0].objectFieldValues.fieldValues;
                let queryRes2 = res3.data.queryValues.objectDatas;
                if (queryRes2.length) {
                    for (let i = 0; i < queryRes2.length; i++) {
                        for (let j = 0; j < queryRes2[i].objectFieldValues.fieldValues.length; j++) {
                            dataArr.push(queryRes2[i].objectFieldValues.fieldValues[j].fieldValues[0].value.int64Value);
                        }
                    }
                }
            }

            var table_Data = [];
            for (let i = 0; i < objArr.length; i++) {
                for (let j = 0; j < dataArr.length; j++) {
                    if (objArr[i].fieldValues[0].value.int64Value == dataArr[j]) {
                        let gantt_Array = {};
                        gantt_Array.作业计划名称 = objArr[i].fieldValues[7].value.stringValue;
                        // table_Array.产品编号 = objArr[i].fieldValues[7].value.stringValue;
                        // table_Array.产品名称 = objArr[i].fieldValues[7].value.stringValue;
                        gantt_Array.生产数量 = objArr[i].fieldValues[5].value.floatValue;
                        gantt_Array.计划开始时间 = UTCTimeToDate(objArr[i].fieldValues[4].value.datetimeValue);
                        gantt_Array.计划结束时间 = UTCTimeToDate(objArr[i].fieldValues[3].value.datetimeValue);
                        gantt_Array.计划流转时间 = UTCTimeToDate(objArr[i].fieldValues[2].value.datetimeValue);
                        gantt_Array.所属作业计划生产工单ID = objArr[i].fieldValues[0].value.int64Value;
                        gantt_Array.作业计划数据ID = objArr[i].fieldValues[8].value.int64Value;
                        // table_Array.所属生产工单 = objArr[i].fieldValues[7].value.stringValue;

                        /*****************************这里缺少逻辑，需根据所属生产工单数据ID查到工单编号***************************/

                        // let fieldName3 = ['工单编号', 'DataName'];
                        // let id3 = [table_Array.所属作业计划生产工单ID];
                        // let type3 = 6;
                        // var res5 = await QueryPlanObjRecordByRecordId(type1, id1, param1, fieldName3);
                        // table_Array.所属生产工单  = res1.data.dataFieldValues[0].fieldValues[0].value.stringValue;
                        /*********************************************************************************************************/
                        gantt_Array.锁定状态 = objArr[i].fieldValues[1].value.boolValue;

                        let 物理工厂ObjID = objArr[i].fieldValues[9].value.int64Value;

                        if (物理工厂ObjID != '') {
                            var entityID = '1459167378779668482';
                            var fields = ['ID', 'Name'];
                            var res5 = await QueryRealtimeEntity(物理工厂ObjID, fields, 0);
                        }

                        //

                        if (!res5.errorCode) {
                            gantt_Array.物理工厂Name = res5.data.objFields[1].value.stringValue;
                        }

                        let definitionId = objArr[i].fieldValues[6].value.nameIdValue.name;
                        var fields = {
                            fieldIds: [1, 2, 3, 4, 5],
                            memberNames: ['数量单位', '编码', '名称', '所属系列'],
                        };
                        var res4 = await QueryEntityDefinitionFields(definitionId, fields); // 查询型号物
                        if (!res4.errorCode) {
                            gantt_Array.产品编码 = res4.data.memberValues[1].value.stringValue;
                            gantt_Array.产品名称 = res4.data.memberValues[2].value.stringValue;
                        }
                        table_Data.push(gantt_Array);
                    }
                }
            }

            /***********************甘特图数据配置*************************/
            var taskData = [];
            for (let i = 0; i < table_Data.length; i++) {
                var existKey = false;
                for (let j = 0; j < taskData.length; j++) {
                    if (table_Data[i].物理工厂Name == taskData[j].name) {
                        var d1 = new Date(table_Data[i].计划开始时间.toString()).format('yyyy-MM-dd hh:mm:ss');
                        /*****************如果作业计划不早甘特图中，需要添加物理工厂信息，并添加作业计划*********************/
                        let taskColor;
                        if (table_Data[i].锁定状态 == false) {
                            taskColor = 'green';
                        } else {
                            taskColor = '#660000';
                        }
                        /***********如果作业计划工厂已经在甘特图中，只需给工厂添加作业计划，存在标志位变为true**********/
                        let taskSingle = {
                            //开始时间
                            // "start_date": new Date(table_Data[i].计划开始时间.toString()).format("yyyy-MM-dd hh:mm:ss"),
                            start_date: d1,
                            // 持续时间
                            duration: '2',
                            //进度
                            progress: 0,
                            //taskId
                            taskId: table_Data[i].作业计划名称,
                            //projectId可省略
                            projectId: 'project1',
                            //显示在任务上的名称:taskName
                            taskName: table_Data[i].作业计划名称,
                            //
                            fill: 1,
                            //任务的背景色（未完成任务的颜色）
                            fillColor: taskColor,
                            //已完成任务颜色
                            progressColor: 'green',
                            //鼠标移入任务时展示的content内容
                            content:
                                `<div>
                                        <p>编码:<br>` +
                                `${table_Data[i].产品编码}</p>
                                        <p>名称:<br>` +
                                `${table_Data[i].产品名称}</p> 
                                        <p>开始时间:<br>` +
                                `${table_Data[i].计划开始时间}</p>
                                        <p>结束时间:<br>` +
                                `${table_Data[i].计划结束时间}</p>
                                        <p>生产数量:<br>` +
                                `${table_Data[i].生产数量}</p>
                                        </div>`,
                        };
                        taskData[j].tasks.push(taskSingle);
                        existKey = true;
                        break;
                    }
                }
                if (!existKey) {
                    var d1 = new Date(table_Data[i].计划开始时间.toString()).format('yyyy-MM-dd hh:mm:ss');
                    /*****************如果作业计划不早甘特图中，需要添加物理工厂信息，并添加作业计划*********************/
                    let taskColor;
                    if (table_Data[i].锁定状态 == false) {
                        taskColor = 'green';
                    } else {
                        taskColor = '#660000';
                    }
                    let taskDataSingle = {
                        id: i.toString(),
                        name: table_Data[i].物理工厂Name,
                        open: true,
                        parentId: 'root', // 行信息，即左侧数据网格中填入的数据，属性值为columns中每一个prop的值，是为了将数据对应上去
                        // 每一行中需要渲染的task数据
                        tasks: [
                            {
                                //开始时间
                                start_date: d1,
                                // "start_date": "2018-3-30 12:00:00",
                                // 持续时间
                                duration: '2',
                                //进度
                                progress: 0,
                                //taskId
                                taskId: table_Data[i].作业计划名称,
                                //projectId可省略
                                projectId: 'project1',
                                //显示在任务上的名称:taskName
                                taskName: table_Data[i].作业计划名称,
                                //
                                fill: 1,
                                //任务的背景色（未完成任务的颜色）
                                fillColor: taskColor,
                                //已完成任务颜色
                                progressColor: 'green',
                                //鼠标移入任务时展示的content内容
                                content:
                                    `<div>
                                        <p>编码:<br>` +
                                    `${table_Data[i].产品编码}</p>
                                        <p>名称:<br>` +
                                    `${table_Data[i].产品名称}</p> 
                                        <p>开始时间:<br>` +
                                    `${table_Data[i].计划开始时间}</p>
                                        <p>结束时间:<br>` +
                                    `${table_Data[i].计划结束时间}</p>
                                        <p>生产数量:<br>` +
                                    `${table_Data[i].生产数量}</p>
                                        </div>`,
                            },
                        ],
                    };
                    taskData.push(taskDataSingle);
                }
            }
            ElementGantt1.UpdateData(taskData);
            debugger;
        }
    }
}
// var taskData = [{
//         "id": "1",
//         "name": "project1",
//         "open": true,
//         "parentId": "root", // 行信息，即左侧数据网格中填入的数据，属性值为columns中每一个prop的值，是为了将数据对应上去
//         // 每一行中需要渲染的task数据
//         "tasks": [{
//                 //开始时间
//                 "start_date": "2018-3-30 12:00:00",
//                 // 持续时间
//                 "duration": "2",
//                 //进度
//                 "progress": 0.6,
//                 //taskId
//                 'taskId': 'task1',
//                 //projectId可省略
//                 "projectId": "project1",
//                 //显示在任务上的名称:taskName
//                 "taskName": 'task1',
//                 //
//                 "fill": 1,
//                 //任务的背景色（未完成任务的颜色）
//                 "fillColor": "#660000",
//                 //已完成任务颜色
//                 "progressColor": "green",
//                 //鼠标移入任务时展示的content内容
//                 "content": `<div>
//                                     <p>开始时间:<br>` + `fdhgfdshsgf</p></div>`
//             },
//             {
//                 "start_date": "2018-4-02 03:00:00",
//                 "duration": "2",
//                 "progress": 0.6,
//                 'taskId': 'task2',
//                 "projectId": "project2",
//                 "taskName": 'task2',
//                 "fill": 2,
//                 "fillColor": "red",
//                 "progressColor": "#330099",
//                 "content": `<div>
//                                     <p>开始时间:<br>` + `fdhgfdshsgf</p>
//                                   </div>`
//             }
//         ],
//     },
//     {
//         "id": "2",
//         "name": "children 1-1",
//         "open": true,
//         "parentId": "1", // 行信息，即左侧数据网格中填入的数据，属性值为columns中每一个prop的值，是为了将数据对应上去
//         // 每一行中需要渲染的task数据
//         "tasks": [{
//             "start_date": "2018-4-02 03:00:00",
//             "duration": "2",
//             "progress": 0.6,
//             'taskId': 'task3',
//             "taskName": 'task3',
//             "fillColor": "#660000",
//             "progressColor": "red",
//         }],
//     },
//     {

//         "id": "3",
//         "name": "ttttttttttttttttttttttchildren 1-1-1",
//         "open": true,
//         "parentId": "2", // 行信息，即左侧数据网格中填入的数据，属性值为columns中每一个prop的值，是为了将数据对应上去
//         // 每一行中需要渲染的task数据
//         "tasks": [{
//             "start_date": "2018-4-02 03:00:00",
//             "duration": "2",
//             "progress": 0.6,
//             'taskId': 'task4',
//             "projectId": "project1000",
//             "taskName": 'task4',
//             "fillColor": "blue",
//             "progressColor": "yellow",
//         }],
//     },
//     {
//         "id": "4",
//         "name": "ttttttttttttttttttttttchildren 1-1-1",
//         "open": true,
//         "parentId": "root", // 行信息，即左侧数据网格中填入的数据，属性值为columns中每一个prop的值，是为了将数据对应上去
//         // 每一行中需要渲染的task数据
//         "tasks": [{
//             "start_date": "2018-4-02 03:00:00",
//             "duration": "2",
//             "progress": 0.6,
//             'taskId': 'task7',
//             "projectId": "project1002",
//             "taskName": 'task7',
//             "fillColor": "green",
//             "progressColor": "red",
//         }],
//     },
// ]

// ElementGantt1.UpdateData(taskData);
