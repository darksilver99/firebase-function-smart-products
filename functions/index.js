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
        await generateResidentService(documentID);


        console.log('createProvince done');
    });

async function generateParkCarAppMenu(documentID) {

    // type app เปิดในแอป path คือชื่อ route
    // type web เปิดในแอปหน้า web view "path_name" คือ url
    // type app_image เปิดในแอปหน้า DetailWithImagePage "path_name" คือ url รูป
    // type url เปิดลิงก์นอก

    var rsConfig = await db.doc("config/park_car_app").get();

    // เปลี่ยนไปทำจากหลังบ้ายแทนไม่ควรไว้ในแอปเดียว รปภ ตั้งเล่น
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
            'subject': "ต่ออายุการใช้งาน",
            'path_name': "PaymentAlertPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/park_car_menu_list').doc().set(
        {
            'status': 1,
            'seq': 60,
            'subject': "คู่มือการใช้งาน",
            'path_name': rsConfig.data()["guide_image_path"],
            'type': "app_image"
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
            'type': "app"
        }
    );

    const parkMenuRef = db.collection('project_list/' + documentID + '/behind_menu_list').doc();
    await parkMenuRef.set(
        {
            'status': 1,
            'seq': 20,
            'subject': "ข้อมูล รถเข้า-ออก",
            'path_name': "ParkPage",
            'type': "app"
        }
    );
    generateBehindSubMenu('project_list/' + documentID + '/behind_menu_list/' + parkMenuRef.id + "/sub_menu_list");

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 1,
            'seq': 30,
            'subject': "ต่ออายุการใช้งาน",
            'path_name': "PaymentAlertPage",
            'type': "app"
        }
    );
}

async function generateBehindSubMenu(path) {

    var rsConfig = await db.doc("config/park_car_app").get();

    await db.collection(path).doc().set(
        {
            'status': 1,
            'seq': 10,
            'subject': "ตั้งค่าระบบ 'บันทึกจอดรถ'",
            'path_name': "ParkSettingPage",
            'type': "app",
        }
    );
    await db.collection(path).doc().set(
        {
            'status': 1,
            'seq': 30,
            'subject': "คู่มือการใช้งานระบบ 'บันทึกจอดรถ'",
            'path_name': rsConfig.data()["guide_image_path"],
            'type': "app_image",
        }
    );
}

async function generateResidentService(documentID) {

    // type app เปิดในแอป path คือชื่อ route
    // type web เปิดในแอปหน้า web view "path_name" คือ url
    // type app_image เปิดในแอปหน้า DetailWithImagePage "path_name" คือ url รูป
    // type url เปิดลิงก์นอก

    await db.collection('project_list/' + documentID + '/resident_menu_list').doc().set(
        {
            'status': 0,
            'seq': 10,
            'subject': "ประทับตรา",
            'path_name': "StampPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/default_icon.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_menu_list').doc().set(
        {
            'status': 0,
            'seq': 20,
            'subject': "แจ้งปัญหา",
            'path_name': "ComplainPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/default_icon.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_menu_list').doc().set(
        {
            'status': 0,
            'seq': 30,
            'subject': "ข่าวสาร/กิจกรรม",
            'path_name': "NewsListPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/default_icon.png",
            'type': "app"
        }
    );

}

exports.onCreateTransaction = functions.firestore.document('project_list/{project_id}/transaction_list/{transaction_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const project_id = context.params.project_id;
        const transaction_id = context.params.transaction_id;

        const doc_path = "project_list/" + project_id + "/transaction_list/" + transaction_id;

        const contact_address = original.contact_address ?? "";
        if (isEmpty(contact_address)) {
            return;
        }

        const users_list = await getResidentUserRef(contact_address, project_id);

        for (let i = 0; i < users_list.length; i++) {
            const data = {
                "create_date": new Date(),
                "subject": "มีรถ" + original.car_type + " ทะเบียน " + original.car_registration + " กำลังเข้าไปหาท่าน เพื่อ" + original.objective,
                "detail": "กรุณาประทับตรารายการเมื่อต้องการจะออกจากโครงการ",
                "receiver": users_list[i][0],
                "resident_ref": users_list[i][1],
                "type": "park",
                "doc_path": doc_path,
            };
            db.collection("project_list/" + project_id + "/notification_list").add(data);
        }
    });

/* exports.onUpdateTransaction = functions.firestore.document('project_list/{project_id}/transaction_list/{transaction_id}')
    .onWrite(async (snap, context) => {

        const before = snap.before.data();
        const after = snap.after.data();
        const project_id = context.params.project_id;
        const transaction_id = context.params.transaction_id;

        if (isEmpty(before)) {
            return;
        }

        if (isEmpty(after)) {
            return;
        }

        // เมื่อมีการ stamp
        if (isEmpty(before.stamp) && !isEmpty(after.stamp)) {
            console.log("isStamp");
            const isHaveNotification = await checkIsHaveNotificationList("project_list/" + project_id + "/transaction_list/" + transaction_id, project_id);
            console.log("isHaveNotification : " + isHaveNotification);
        }

    });

async function checkIsHaveNotificationList(doc_path, project_id) {
    const data = await db.collection("project_list/" + project_id + "/notification_list").where("doc_path", "==", doc_path).get();
    return !data.empty;
} */

async function getResidentUserRef(contact_address, project_id) {
    const rs = await db.collection("project_list/" + project_id + "/resident_list").where("contact_address", '==', contact_address).get();
    if (rs.empty) {
        return;
    }
    let user_list = [];
    for (let i = 0; i < rs.size; i++) {
        /* const rsUser = await db.doc(rs.docs[i].data()["create_by"].path).get();
        if (isEmpty(rsUser)) {
            continue;
        }
        if (isEmpty(rsUser.data()["firebase_token"])) {
            return;
        } */
        user_list.push([rs.docs[i].data()["create_by"], rs.docs[i].ref]);
    }
    return user_list;
}

exports.onCreateNotification = functions.firestore.document('project_list/{project_id}/notification_list/{notification_id}')
    .onCreate(async (snap, context) => {
        const original = snap.data();
        const project_id = context.params.project_id;
        const transaction_id = context.params.transaction_id;

        const token = await getTokenByUserRef(original.receiver);

        if (isEmpty(token)) {
            return;
        }

        const payload = {
            notification: {
                title: original.subject,
                body: original.detail,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                id: "high_importance_channel",
                status: "done",
                sound: "default",
                title: original.subject,
                body: "",
                type: original.type
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        contentAvailable: true,
                    },
                },
                headers: {
                    'apns-priority': '10',
                },
            },
            android: {
                priority: 'high',
            },
            token: token,
        };
        admin
            .messaging()
            .send(payload);

        updateTotalNotification(original.receiver);
    });

async function updateTotalNotification(user_ref) {

    if (isEmpty(user_ref)) {
        return;
    }

    const userRef = db.doc(user_ref.path);

    await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error('User document does not exist');
        }

        const newTotalNotification = (userDoc.data().total_notification || 0) + 1;
        transaction.update(userRef, { total_notification: newTotalNotification });
    });
}

async function getTokenByUserRef(receiver) {
    const rs = await db.doc(receiver.path).get();
    if (isEmpty(rs.data()["firebase_token"])) {
        return '';
    }
    return rs.data()["firebase_token"];
}

exports.insertMenu = functions.region(REGION).https
    .onRequest(async (request, response) => {

        if (request.method !== 'POST') {
            return response.status(405).json({ error: 'Method Not Allowed' });
        }

        const path = request.body.path;
        const subject = request.body.subject;
        const path_name = request.body.path_name;
        const type = request.body.type;
        const seq = request.body.seq ?? 999;
        const icon = request.body.icon;

        if (isEmpty(path) || isEmpty(subject) || isEmpty(path_name) || isEmpty(type)) {
            response.json({ status: false, msg: "req field", data: [] });
        }

        console.log(path);

        await db.collection(path).doc().set(
            {
                'status': 1,
                'seq': seq,
                'subject': subject,
                'path_name': path_name,
                'icon': isEmpty(icon) ? null : icon,
                'type': type
            }
        );

        response.json({ status: true, data: [] });
    });

exports.onCreateResident = functions.firestore.document('project_list/{project_id}/resident_list/{resident_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const project_id = context.params.project_id;
        const resident_id = context.params.resident_id;

        let resident_name = '-';

        const userData = await getUserData(original.create_by);
        if (!isEmpty(userData)) {
            resident_name = userData.data().first_name + " " + userData.data().last_name;
        }
        db.doc(snap.ref.path).update({
            resident_name: resident_name,
        });

    });

async function getUserData(user_ref) {
    var userDoc = await db.doc(user_ref.path).get();
    return userDoc.exists ? userDoc : null;
}