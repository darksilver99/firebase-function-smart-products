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

        await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
            {
                'status': 1,
                'seq': 10,
                'subject': "Dash board",
                'path_name': "DashboardPage",
                'icon': "https://www.silver-api.com/smart-product/icon/behind_menu/dashboard.png"
            }
        );

        await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
            {
                'status': 1,
                'seq': 20,
                'subject': "ข้อมูล รถเข้า-ออก",
                'path_name': "ParkPage",
                'icon': "https://www.silver-api.com/smart-product/icon/behind_menu/carpark.png"
            }
        );

        console.log('createProvince done');
    });