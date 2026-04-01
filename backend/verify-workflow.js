const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

// create a dummy pdf file if not exists
const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
if (!fs.existsSync(dummyPdfPath)) {
    fs.writeFileSync(dummyPdfPath, 'Dummy PDF Content');
}

let studentToken, facultyToken, hodToken;
let certificateId;

const login = async (email, password, role) => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
        console.log(`✅ [${role.toUpperCase()}] Login Successful`);
        return res.data.token;
    } catch (err) {
        console.error(`❌ [${role.toUpperCase()}] Login Failed:`, err.response?.data?.msg || err.message);
        process.exit(1);
    }
};

const runVerification = async () => {
    console.log('🚀 Starting Workflow Verification...');

    // 1. Login Users
    studentToken = await login('student@test.com', '123456', 'student');
    facultyToken = await login('faculty@test.com', '123456', 'faculty');
    hodToken = await login('hod@test.com', '123456', 'hod');

    // 2. Student Uploads Certificate
    console.log('\n--- Step 1: Student Upload ---');
    try {
        const form = new FormData();
        form.append('companyName', 'Test Corp');
        form.append('duration', '3 Months');
        form.append('certificate', fs.createReadStream(dummyPdfPath));

        const res = await axios.post(`${API_URL}/certificates/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'x-auth-token': studentToken // using x-auth-token as per auth middleware
            }
        });
        certificateId = res.data.certificate._id;
        console.log(`✅ Certificate Uploaded. ID: ${certificateId}`);
        console.log(`   Status: ${res.data.certificate.status}`);
        console.log(`   Stage: ${res.data.certificate.stage}`);
    } catch (err) {
        console.error('❌ Upload Failed:', err.response?.data || err.message);
        process.exit(1);
    }

    // 3. Faculty Approves
    console.log('\n--- Step 2: Faculty Approval ---');
    try {
        // First check if faculty can see it
        const pendingRes = await axios.get(`${API_URL}/certificates/faculty/pending`, {
            headers: { 'x-auth-token': facultyToken }
        });
        const found = pendingRes.data.data.find(c => c._id === certificateId);
        if (!found) {
            console.error('❌ Certificate not found in Faculty Pending list');
            process.exit(1);
        }
        console.log('✅ Certificate found in Faculty Pending list');

        // Approve
        await axios.put(`${API_URL}/certificates/${certificateId}/approve`,
            { remark: 'Good job via script' },
            { headers: { 'x-auth-token': facultyToken } }
        );
        console.log('✅ Faculty Approved');
    } catch (err) {
        console.error('❌ Faculty Action Failed:', err.response?.data || err.message);
        process.exit(1);
    }

    // 4. HOD Approves
    console.log('\n--- Step 3: HOD Approval ---');
    try {
        // Check if HOD can see it
        const pendingRes = await axios.get(`${API_URL}/certificates/hod/pending`, {
            headers: { 'x-auth-token': hodToken }
        });
        const found = pendingRes.data.data.find(c => c._id === certificateId);
        if (!found) {
            console.error('❌ Certificate not found in HOD Pending list');
            process.exit(1);
        }
        console.log('✅ Certificate found in HOD Pending list');

        // Approve
        await axios.put(`${API_URL}/certificates/${certificateId}/approve`,
            { remark: 'Final Approval via script' },
            { headers: { 'x-auth-token': hodToken } }
        );
        console.log('✅ HOD Approved');
    } catch (err) {
        console.error('❌ HOD Action Failed:', err.response?.data || err.message);
        process.exit(1);
    }

    // 5. Verify Final Status & Notifications
    console.log('\n--- Step 4: Final Verification ---');
    try {
        // Check Certificate Status
        const certRes = await axios.get(`${API_URL}/certificates/student/my-certificates`, {
            headers: { 'x-auth-token': studentToken }
        });
        const cert = certRes.data.data.find(c => c._id === certificateId);
        console.log(`   Final Status: ${cert.status.toUpperCase()}`);
        console.log(`   Final Stage: ${cert.stage.toUpperCase()}`);

        if (cert.status !== 'approved' || cert.stage !== 'completed') {
            console.error('❌ Final status check failed');
            process.exit(1);
        }

        // Check Notifications
        const notifRes = await axios.get(`${API_URL}/notifications`, {
            headers: { 'x-auth-token': studentToken }
        });
        console.log(`   Notifications count: ${notifRes.data.length}`);
        const latestNotif = notifRes.data[0];
        console.log(`   Latest Notification: "${latestNotif.message}"`);

        console.log('\n✨✨ WORKFLOW VERIFICATION SUCCESSFUL ✨✨');

    } catch (err) {
        console.error('❌ Final Verification Failed:', err.response?.data || err.message);
    }
};

// Wait for server to potentially start if run manually, but here we assume it's running
setTimeout(runVerification, 1000);
