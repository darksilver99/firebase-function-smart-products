const functions = require("firebase-functions");
const admin = require("firebase-admin");
const request = require('request');

const REGION = "asia-east1";

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

function isEmpty(checkValue) {
    if (checkValue === undefined || checkValue === null || checkValue === "" || checkValue + "" === "null") {
        return true;
    }
    return false;
}


exports.helloWorld = functions.region(REGION).https
    .onRequest((request, response) => {
        let provinces = [];
        for (let i = 0; i < 15; i++) {
            provinces[i] = 'กทม' + i;
        }
        response.json({ status: true, data: provinces });
    });

exports.onCreateProject = functions.firestore.document('project_list/{doc_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const documentID = context.params.doc_id;

        await generateParkCarAppMenu(documentID);
        await generateBehindMenu(documentID);



        console.log('createProvince done');
    });

async function generateParkCarAppMenu(documentID) {
    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 0,
            'seq': 10,
            'subject': "ตั้งค่าโครงการ",
            'path_name': "SettingProjectPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 1,
            'seq': 20,
            'subject': "ตั้งค่าเครื่องพิมพ์",
            'path_name': "SettingPrinterPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 1,
            'seq': 30,
            'subject': "ตั้งค่าอื่นๆ",
            'path_name': "SettingGeneralPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 1,
            'seq': 40,
            'subject': "แจ้งปัญหาการใช้งาน",
            'path_name': "IssuePage",
            'type': "app"
        }
    );
    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 1,
            'seq': 50,
            'subject': "คู่มือการใช้งาน",
            'path_name': "https://silver-api.com/smart-product/guide/index.html",
            'type': "web"
        }
    );
}

async function generateBehindMenu(documentID) {
    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 1,
            'seq': 10,
            'subject': "Dash board",
            'path_name': "DashboardPage",
            'icon': "https://www.silver-api.com/smart-product/icon/behind_menu/dashboard.png"
        }
    );

    const parkMenuRef = db.collection('project_list/' + documentID + '/behind_menu_list').doc();
    await parkMenuRef.set(
        {
            'status': 1,
            'seq': 20,
            'subject': "ข้อมูล รถเข้า-ออก",
            'path_name': "ParkPage",
            'icon': "https://www.silver-api.com/smart-product/icon/behind_menu/carpark.png"
        }
    );
    generateBehindSubMenu('project_list/' + documentID + '/behind_menu_list/' + parkMenuRef.id + "/sub_menu_list");
}

async function generateBehindSubMenu(path) {
    await db.collection(path).doc().set(
        {
            'status': 1,
            'seq': 10,
            'subject': "ตั้งค่าระบบ 'บันทึกจอดรถ'",
            'path_name': "ParkSettingPage"
        }
    );
}