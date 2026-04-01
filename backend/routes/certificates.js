const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const auth = require('../middleware/auth'); // Use the middleware file
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Import Notification model

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Helper to create notification
const createNotification = async (userId, message, type = 'info') => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      type
    });
    await notification.save();
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};

// ============ STUDENT ROUTES ============

// UPLOAD CERTIFICATE
router.post('/upload', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can upload' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { companyName, duration } = req.body;

    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    // Fetch full user details to ensure we have name and email
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const certificate = new Certificate({
      studentId: req.user.id,
      studentName: student.name,
      studentEmail: student.email,
      companyName,
      duration: duration || '3 months',
      pdfPath: req.file.path,
      status: 'pending',
      stage: 'faculty_review'
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      certificate
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// GET STUDENT'S OWN CERTIFICATES
router.get('/student/my-certificates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const myCertificates = await Certificate.find({ studentId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: myCertificates
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
});

// ============ FACULTY ROUTES ============

// GET PENDING CERTIFICATES FOR FACULTY
router.get('/faculty/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Faculty sees certificates that are pending and in faculty_review stage
    const pending = await Certificate.find({
      stage: 'faculty_review',
      status: { $in: ['pending'] }
    });

    res.json({
      success: true,
      data: pending
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
});

// APPROVE CERTIFICATE (FACULTY) -> Moves to HOD
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (req.user.role === 'faculty') {
      if (certificate.stage !== 'faculty_review') {
        return res.status(400).json({ success: false, message: 'Certificate is not in faculty review stage' });
      }
      certificate.stage = 'hod_review';
      certificate.remarks.push({
        role: 'faculty',
        comment: 'Approved by Faculty, forwarded to HOD',
        date: Date.now()
      });

      await certificate.save();

      // Notify Student
      await createNotification(certificate.studentId, `Your certificate for ${certificate.companyName} was approved by Faculty and is now with HOD.`, 'info');

      return res.json({ success: true, message: 'Approved by Faculty. Forwarded to HOD.' });

    } else if (req.user.role === 'hod') {
      if (certificate.stage !== 'hod_review') {
        return res.status(400).json({ success: false, message: 'Certificate is not in HOD review stage' });
      }
      certificate.status = 'approved';
      certificate.stage = 'completed';
      certificate.approvedBy = req.user.id; // Record who approved it
      certificate.remarks.push({
        role: 'hod',
        comment: 'Final Approval by HOD',
        date: Date.now()
      });

      await certificate.save();

      // Notify Student
      await createNotification(certificate.studentId, `Your certificate for ${certificate.companyName} has been FINALLY APPROVED by HOD.`, 'success');

      return res.json({ success: true, message: 'Final Approval Granted.' });

    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve certificate' });
  }
});

// REJECT CERTIFICATE (FACULTY OR HOD)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark) {
      return res.status(400).json({ success: false, message: 'Remark is required for rejection' });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (req.user.role === 'faculty' && certificate.stage === 'faculty_review') {
      certificate.status = 'rejected';
      certificate.stage = 'completed'; // Ends here
      certificate.rejectedBy = req.user.id; // Record who rejected it
      certificate.remarks.push({
        role: 'faculty',
        comment: `Rejected: ${remark}`,
        date: Date.now()
      });
    } else if (req.user.role === 'hod' && certificate.stage === 'hod_review') {
      certificate.status = 'rejected';
      certificate.stage = 'completed'; // Ends here
      certificate.rejectedBy = req.user.id; // Record who rejected it
      certificate.remarks.push({
        role: 'hod',
        comment: `Rejected: ${remark}`,
        date: Date.now()
      });
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await certificate.save();

    // Notify Student
    await createNotification(certificate.studentId, `Your certificate for ${certificate.companyName} was REJECTED by ${req.user.role.toUpperCase()}. Reason: ${remark}`, 'error');

    res.json({
      success: true,
      message: 'Certificate rejected successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject certificate' });
  }
});

// ============ HOD ROUTES ============

// GET PENDING CERTIFICATES FOR HOD
router.get('/hod/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hod') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const pending = await Certificate.find({
      stage: 'hod_review',
      status: { $ne: 'rejected' } // Only show things that are not rejected (should be pending usually)
    });

    res.json({
      success: true,
      data: pending
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
});

module.exports = router;