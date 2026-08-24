// ===================================
// AUDIO TRACKS MANAGEMENT ENDPOINTS
// ===================================

app.get('/api/admin/tracks', authenticateAdmin, async (req, res) => {
    try {
        const tracksSnapshot = await db.collection('audioTracks').get();
        const tracks = [];

        tracksSnapshot.forEach(doc => {
            tracks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(tracks);
    } catch (error) {
        console.error('Get tracks error:', error);
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

app.post('/api/admin/tracks', authenticateAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            waveType,
            duration,
            frequency,
            category,
            premium,
            active,
            audioUrl
        } = req.body;

        if (!name || !waveType || !duration) {
            return res.status(400).json({
                error: 'Missing required fields: name, waveType, duration'
            });
        }

        const trackData = {
            name,
            description: description || '',
            waveType,
            duration: Number(duration),
            frequency: frequency || (waveType === 'alpha' ? '10Hz' : '20Hz'),
            category: category || 'focus',
            premium: premium || false,
            active: active !== undefined ? active : true,
            audioUrl: audioUrl || '',
            plays: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const trackRef = await db.collection('audioTracks').add(trackData);

        // Log activity
        await logActivity(req.user.email, 'create', 'track', trackRef.id, {
            trackName: name
        });

        res.json({
            success: true,
            trackId: trackRef.id,
            ...trackData
        });
    } catch (error) {
        console.error('Create track error:', error);
        res.status(500).json({ error: 'Failed to create track' });
    }
});

app.put('/api/admin/tracks/:trackId', authenticateAdmin, async (req, res) => {
    try {
        const { trackId } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.plays;

        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('audioTracks').doc(trackId).update(updateData);

        // Log activity
        await logActivity(req.user.email, 'update', 'track', trackId, {
            updates: Object.keys(updateData)
        });

        res.json({ success: true, message: 'Track updated successfully' });
    } catch (error) {
        console.error('Update track error:', error);
        res.status(500).json({ error: 'Failed to update track' });
    }
});

app.patch('/api/admin/tracks/:trackId', authenticateAdmin, async (req, res) => {
    try {
        const { trackId } = req.params;
        const { active } = req.body;

        await db.collection('audioTracks').doc(trackId).update({
            active,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log activity
        await logActivity(req.user.email, 'toggle_status', 'track', trackId, {
            active
        });

        res.json({ success: true, message: 'Track status updated' });
    } catch (error) {
        console.error('Toggle track status error:', error);
        res.status(500).json({ error: 'Failed to update track status' });
    }
});

app.delete('/api/admin/tracks/:trackId', authenticateAdmin, async (req, res) => {
    try {
        const { trackId } = req.params;

        const trackDoc = await db.collection('audioTracks').doc(trackId).get();
        const trackName = trackDoc.data()?.name;

        await db.collection('audioTracks').doc(trackId).delete();

        // Log activity
        await logActivity(req.user.email, 'delete', 'track', trackId, {
            trackName
        });

        res.json({ success: true, message: 'Track deleted successfully' });
    } catch (error) {
        console.error('Delete track error:', error);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});

// ===================================
// USER SESSIONS ENDPOINTS
// ===================================

app.get('/api/admin/sessions', authenticateAdmin, async (req, res) => {
    try {
        const sessionsSnapshot = await db.collection('sessions')
            .orderBy('createdAt', 'desc')
            .limit(1000)
            .get();

        const sessions = [];

        sessionsSnapshot.forEach(doc => {
            sessions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// ===================================
// APP SETTINGS ENDPOINTS
// ===================================

app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settingsDoc = await db.collection('appSettings').doc('general').get();

        if (!settingsDoc.exists) {
            // Return default settings
            res.json({
                appName: 'Digital Coffee',
                appVersion: '1.0.0',
                maintenanceMode: false,
                monthlyPrice: 9.99,
                lifetimePrice: 99.00,
                trialDuration: 7,
                freeTrackLimit: 5,
                freeSessionsPerDay: 3,
                enablePushNotifications: true,
                enableAnalytics: true,
                enableFeedback: true,
                enablePromoCodes: true,
                enableOfflineMode: true,
                tipsRotationInterval: 24,
                quotesRotationInterval: 12,
                supportEmail: 'support@digitalcoffee.cafe',
                businessEmail: 'hello@digitalcoffee.cafe',
                technicalEmail: 'tech@digitalcoffee.cafe',
                minSessionDuration: 60,
                maxSessionDuration: 7200,
                welcomeEmailEnabled: true,
                subscriptionEmailEnabled: true,
                reminderNotificationsEnabled: true,
                trackingEnabled: true,
                dataRetentionDays: 365
            });
        } else {
            res.json({
                id: settingsDoc.id,
                ...settingsDoc.data()
            });
        }
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = req.body;

        // Remove metadata fields
        delete settings.id;
        delete settings.createdAt;

        settings.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        settings.updatedBy = req.user.email;

        await db.collection('appSettings').doc('general').set(settings, { merge: true });

        // Log activity
        await logActivity(req.user.email, 'update', 'app_settings', 'general', {
            updates: Object.keys(settings)
        });

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
