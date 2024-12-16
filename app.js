const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // CORS 미들웨어 추가

const app = express();
const port = 3000;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('facilities.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database connected!');
    }
});

// CORS 설정 추가
app.use(cors());

// 정적 파일 제공 (HTML, CSS, JS)
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
    const region = req.query.region || ''; // 입력받은 지역구, 기본값은 빈 문자열
    const facility = req.query.facility;   // 입력받은 시설 종류
    const table = tableMap[facility];      // 테이블 이름 가져오기

    // 입력 검증: facility가 유효하지 않으면 에러 반환
    if (!table) {
        return res.status(400).json({ error: 'Invalid facility type' });
    }

    // SQL 쿼리 준비 (주소 필드가 있는 테이블만 조회)
    const query = region && region !== '전체'
        ? `SELECT * FROM ${table} WHERE addr LIKE ?` // 특정 지역 필터링
        : `SELECT * FROM ${table}`;                // 전체 데이터 조회

    const params = region && region !== '전체' ? [`%${region}%`] : []; // SQL 파라미터

    // 데이터 조회
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(`Error querying table ${table}:`, err.message);
            return res.status(500).json({ error: 'Database query failed' });
        }

        // 결과 반환
        res.json(rows);
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
