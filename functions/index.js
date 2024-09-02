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

exports.onCreateProject = functions.firestore.document('project_list/{doc_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const documentID = context.params.doc_id;

        await generateParkCarAppMenu(documentID);
        await generateBehindMenu(documentID);
        await generateResidentService(documentID);
        await generatePhoneProjectList(documentID, original);


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
            'seq': 35,
            'subject': "รายการขอความช่วยเหลือ",
            'path_name': "HelpPage",
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

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 1,
            'seq': 15,
            'subject': "QR Code สำหรับเข้าร่วมโครงการ",
            'path_name': "QRCodeProjectPage",
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
    await generateBehindSubMenu('project_list/' + documentID + '/behind_menu_list/' + parkMenuRef.id + "/sub_menu_list", "park");

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 30,
            'subject': "จัดการลูกบ้าน",
            'path_name': "ResidentPage",
            'type': "app"
        }
    );

    const waterPaymentMenuRef = db.collection('project_list/' + documentID + '/behind_menu_list').doc();
    await waterPaymentMenuRef.set(
        {
            'status': 0,
            'seq': 40,
            'subject': "รายการแจ้งชำระค่าน้ำ",
            'path_name': "WaterPaymentPage",
            'type': "app"
        }
    );
    await generateBehindSubMenu('project_list/' + documentID + '/behind_menu_list/' + waterPaymentMenuRef.id + "/sub_menu_list", "water_payment");

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 50,
            'subject': "จัดการพัสดุ",
            'path_name': "StockPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 60,
            'subject': "ประกาศข่าวสาร",
            'path_name': "NewsPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 70,
            'subject': "รายการแจ้งปัญหา",
            'path_name': "IssueProjectPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 80,
            'subject': "ประชาสัมพันธ์",
            'path_name': "BannerProjectPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 90,
            'subject': "เบอร์โทรศัพท์ฉุกเฉิน",
            'path_name': "PhoneProjectPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 0,
            'seq': 100,
            'subject': "รายการขอความช่วยเหลือ",
            'path_name': "HelpPage",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/behind_menu_list').doc().set(
        {
            'status': 1,
            'seq': 1000,
            'subject': "ต่ออายุการใช้งาน",
            'path_name': "PaymentAlertPage",
            'type': "app"
        }
    );
}

async function generateBehindSubMenu(path, type) {

    var rsConfig = await db.doc("config/park_car_app").get();

    if (type == "park") {
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
                'seq': 20,
                'subject': "คู่มือการใช้งานระบบ 'บันทึกจอดรถ'",
                'path_name': rsConfig.data()["guide_image_path"],
                'type': "app_image",
            }
        );
    } else if (type == "water_payment") {
        await db.collection(path).doc().set(
            {
                'status': 1,
                'seq': 10,
                'subject': "ตั้งค่าบริการ 'แจ้งชำระค่าน้ำ'",
                'path_name': "WaterPaymentSettingPage",
                'type': "app",
            }
        );
    }

}

async function generateResidentService(documentID) {

    // type app เปิดในแอป path คือชื่อ route
    // type web เปิดในแอปหน้า web view "path_name" คือ url
    // type app_image เปิดในแอปหน้า DetailWithImagePage "path_name" คือ url รูป
    // type url เปิดลิงก์นอก

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 10,
            'subject': "รายการผู้เข้าพบ",
            'path_name': "TransactionPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/park.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 20,
            'subject': "แจ้งปัญหาโครงการ",
            'path_name': "IssueProjectPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/issue.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 30,
            'subject': "รายการพัสดุ",
            'path_name': "StockPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/stock.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 40,
            'subject': "แจ้งข่าวสาร",
            'path_name': "NewsPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/news.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 50,
            'subject': "แจ้งชำระค่าน้ำ",
            'path_name': "WaterPaymentPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/water.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 60,
            'subject': "เบอร์โทรฉุกเฉิน",
            'path_name': "PhoneProjectPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/phone.png",
            'type': "app"
        }
    );

    await db.collection('project_list/' + documentID + '/resident_service_list').doc().set(
        {
            'status': 0,
            'seq': 70,
            'subject': "ขอความช่วยเหลือจาก รปภ.",
            'path_name': "HelpPage",
            'icon': "https://www.silver-api.com/smart-product/resident_app/icon/help.png",
            'type': "app"
        }
    );

}

async function generatePhoneProjectList(documentID, original) {
    await db.collection('project_list/' + documentID + '/phone_project_list').doc().set(
        {
            'status': 1,
            'subject': 'ตำรวจ',
            'phone': '191',
            'create_date': new Date(),
            'create_by': original.create_by,
        }
    );
    await db.collection('project_list/' + documentID + '/phone_project_list').doc().set(
        {
            'status': 1,
            'subject': 'ไฟไหม้ดับเพลิง',
            'phone': '1992',
            'create_date': new Date(),
            'create_by': original.create_by,
        }
    );
    await db.collection('project_list/' + documentID + '/phone_project_list').doc().set(
        {
            'status': 1,
            'subject': 'กู้ภัย',
            'phone': '1669',
            'create_date': new Date(),
            'create_by': original.create_by,
        }
    );
    await db.collection('project_list/' + documentID + '/phone_project_list').doc().set(
        {
            'status': 1,
            'subject': 'หน่วยแพทย์กู้ชีวิต',
            'phone': '1554',
            'create_date': new Date(),
            'create_by': original.create_by,
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
            let car_type = isEmpty(original.car_type) ? "" : original.car_type;
            let car_registration = isEmpty(original.car_registration) ? "" : original.car_registration;
            let objective = isEmpty(original.objective) ? "" : original.objective;
            const data = {
                "create_date": new Date(),
                "subject": "มีรถ" + car_type + " ทะเบียน " + car_registration + " กำลังเข้าไปหาท่าน เพื่อ" + objective,
                "detail": "กรุณาประทับตรารายการเมื่อต้องการจะออกจากโครงการ",
                "receiver_list": [users_list[i][0]],
                "resident_ref_list": [users_list[i][1]],
                "type": "park",
                "doc_path": doc_path,
            };
            db.collection("project_list/" + project_id + "/notification_list").add(data);
        }
    });

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
        const notification_id = context.params.notification_id;

        if (isEmpty(original.receiver_topic)) {
            console.log("notiToToken : " + notification_id);
            await notiToToken(original);
        } else {
            console.log("notiToTopic : " + notification_id);
            await notiToTopic(original, project_id);
        }

    });

async function notiToTopic(original, project_id) {
    const condition = `'${project_id}' in topics`;

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
        condition: condition,
    };
    admin
        .messaging()
        .send(payload);

    for (let i = 0; i < original.receiver_list.length; i++) {
        await updateTotalNotification(original.receiver_list[i]);
    }

}

async function notiToToken(original) {
    const token = await getTokenByUserRef(original.receiver_list[0]);

    if (isEmpty(token)) {
        return;
    }
    console.log(token);
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
        /* apns: {
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
        token: token, */
    };

    admin
        .messaging()
        .sendToDevice(token, payload);

    await updateTotalNotification(original.receiver_list[0]);

}

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

exports.onCreateNews = functions.firestore.document('project_list/{project_id}/news_list/{news_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const project_id = context.params.project_id;
        const news_id = context.params.news_id;

        const doc_path = "project_list/" + project_id + "/news_list/" + news_id;

        const data_list = await getResidentRefList(project_id);

        const data = {
            "create_date": new Date(),
            "subject": original.subject ?? '',
            "detail": original.detail ?? '',
            "receiver_topic": project_id,
            "receiver_list": data_list["receiver_list"],
            "resident_ref_list": data_list["resident_ref_list"],
            "type": "news",
            "doc_path": doc_path,
        };
        db.collection("project_list/" + project_id + "/notification_list").add(data);

    });

async function getResidentRefList(project_id) {
    const rs = await db.collection("project_list/" + project_id + "/resident_list").where("status", '==', 1).get();
    let resident_ref_list = [];
    let receiver_list = [];

    if (rs.empty) {
        return {
            "receiver_list": receiver_list,
            "resident_ref_list": resident_ref_list
        };
    }

    for (let i = 0; i < rs.size; i++) {
        receiver_list.push(rs.docs[i].data()["create_by"]);
        resident_ref_list.push(rs.docs[i].ref);
    }

    return {
        "receiver_list": receiver_list,
        "resident_ref_list": resident_ref_list
    };
}

exports.onUpdateUsers = functions.firestore.document('users/{user_id}')
    .onWrite(async (snap, context) => {

        const after = snap.after.data();
        const before = snap.before.data();
        const user_id = context.params.user_id;

        if (isEmpty(before)) {
            console.log("this is create");
            return;
        }

        if (isEmpty(after)) {
            console.log("this is delete");
            return;
        }

        // if update first_name or last_name
        if (after.first_name != before.first_name || after.last_name != before.last_name) {
            console.log("this is update first_name, last_name");
            await updateResidentName(snap.after);
        }


    });

async function updateResidentName(user) {
    try {
        const querySnapshot = await db.collectionGroup('resident_list')
            .where('create_by', '==', user.ref)
            .get();
        querySnapshot.forEach(doc => {
            const resident_name = user.data().first_name + " " + user.data().last_name;
            console.log("resident_name : " + resident_name);
            console.log("doc.ref.path : " + doc.ref.path);
            db.doc(doc.ref.path).update({
                resident_name: resident_name,
            });
        });
    } catch (error) {
        console.error('Error querying residents:', error);
    }

}

exports.onCreateStock = functions.firestore.document('project_list/{project_id}/stock_list/{stock_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const project_id = context.params.project_id;
        const stock_id = context.params.stock_id;

        if (isEmpty(original.resident_ref_list)) {
            return;
        }

        if (original.resident_ref_list.length == 0) {
            return;
        }

        const doc_path = "project_list/" + project_id + "/stock_list/" + stock_id;

        for (let i = 0; i < original.resident_ref_list.length; i++) {
            const userRef = await getUserByResidentRef(original.resident_ref_list[i].path);
            if (isEmpty(userRef)) {
                continue;
            }
            const data = {
                "create_date": new Date(),
                "subject": 'มีรายการพัสดุเข้ามา',
                "detail": 'กรุณาตรวจสอบและรับพัสดุของท่าน',
                "receiver_list": [userRef],
                "resident_ref_list": [original.resident_ref_list[i]],
                "type": "stock",
                "doc_path": doc_path,
            };
            db.collection("project_list/" + project_id + "/notification_list").add(data);
        }

    });

async function getUserByResidentRef(path) {
    console.log("getUserByResidentRef");
    console.log(path);
    const residentData = await db.doc(path).get();
    return isEmpty(residentData) ? null : residentData.data().create_by;
}

async function getProjectData(project_id) {
    const projectData = await db.doc("project_list/" + project_id).get();
    return isEmpty(projectData) ? null : projectData.data();
}

exports.onCreateHelpList = functions.firestore.document('project_list/{project_id}/help_list/{doc_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const project_id = context.params.project_id;
        const doc_id = context.params.doc_id;

        const doc_path = "project_list/" + project_id + "/help_list/" + doc_id;


        const projectData = await getProjectData(project_id);

        let detail = '';
        if (!isEmpty(original.subject)) {
            detail = original.subject;
        }
        if (!isEmpty(original.detail)) {
            detail = detail + " " + original.detail;
        }

        const data = {
            "create_date": new Date(),
            "subject": "มีแจ้งขอความช่วยเหลือจากลูกบ้าน",
            "detail": detail,
            "receiver_list": [projectData.create_by],
            "resident_ref_list": [],
            "type": "for_guard",
            "doc_path": doc_path,
        };

        db.collection("project_list/" + project_id + "/notification_list").add(data);

    });