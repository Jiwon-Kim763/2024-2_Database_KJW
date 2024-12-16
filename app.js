const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('facilities.db', (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Database connected!');
});

// 정적 파일 제공 (HTML, CSS)
app.use(express.static('public'));

// 시설 종류별 테이블 이름 매핑
const tableMap = {
    clinics: 'clinics',
    pharmacies: 'pharmacies',
    disability: 'disability_facilities',
    foreigner_hospitals: 'foreigner_hospitals',
    night_pharmacies: 'night_pharmacies',
    sports_facilities: 'sports_facilities',
    stadiums: 'stadiums'
};

// 지역구와 시설 종류를 기반으로 데이터 조회 API
app.get('/search', (req, res) => {
    const region = req.query.region; // 입력받은 지역구
    const facility = req.query.facility; // 입력받은 시설 종류
    const table = tableMap[facility]; // 테이블 이름 가져오기

    if (!table) {
        return res.status(400).json({ error: 'Invalid facility type' });
    }

    // 테이블에서 지역구에 해당하는 데이터 조회
    db.all(`SELECT * FROM ${table} WHERE addr LIKE ?`, [`%${region}%`], (err, rows) => {
        if (err) {
            console.error(`Error querying table ${table}:`, err.message);
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.json(rows); // 조회된 데이터를 반환
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
