/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:36:28
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:36:29
 */
class App {
    onCreate(appGuid) {
        /** create script entry */
        global.__dir = __dirname;
        const appServer = require('./app/app');
        console.log('111');
        // GetAppInstancePortList(appGuid,res=>{
        //     console.log(res)
        //     try {
        //         let port = res.data.port_list[0].port;
        //         if(port){
        //             appServer.init(port);
        //         }else{
        //             appServer.init(30000)
        //         }
        //     } catch (error) {
        appServer.init(30000);
        //     }
        // })
    }

    onDestroy() {
        /** destroy script entry */
    }
}

module.exports = new App();
