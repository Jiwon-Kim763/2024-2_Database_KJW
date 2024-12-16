const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('facilities.db', (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Database connected!');
});

// CSV 파일이 있는 절대 경로
const basePath = path.join(__dirname); // 현재 스크립트 경로 기준
console.log(`Base path: ${basePath}`);

// CSV 파일과 테이블 매핑
const filesAndTables = [
    { file: path.join(basePath, 'clinics.csv'), table: 'clinics' },
    { file: path.join(basePath, 'pharmacies.csv'), table: 'pharmacies' },
    { file: path.join(basePath, 'disability_facilities.csv'), table: 'disability_facilities' },
    { file: path.join(basePath, 'foreigner_hospitals.csv'), table: 'foreigner_hospitals' },
    { file: path.join(basePath, 'night_pharmacies.csv'), table: 'night_pharmacies' },
    { file: path.join(basePath, 'sports_facilities.csv'), table: 'sports_facilities' },
    { file: path.join(basePath, 'stadiums.csv'), table: 'stadiums' }
];

// 비동기 작업을 동기적으로 처리하기 위해 Promise 사용
const processFile = ({ file, table }) => {
    return new Promise((resolve, reject) => {
        console.log(`Processing file: ${file}`);

        if (fs.existsSync(file)) {
            console.log(`File exists: ${file}`);
            fs.createReadStream(file)
                .pipe(csv())
                .on('headers', (headers) => {
                    const columns = headers.map(h => `${h} TEXT`).join(", ");
                    console.log(`Creating table: ${table} with columns: ${columns}`);
                    db.run(`CREATE TABLE IF NOT EXISTS ${table} (${columns})`, (err) => {
                        if (err) reject(err);
                    });
                })
                .on('data', (row) => {
                    const placeholders = Object.values(row).map(() => '?').join(",");
                    db.run(`INSERT INTO ${table} VALUES (${placeholders})`, Object.values(row), (err) => {
                        if (err) console.error(`Error inserting into table ${table}:`, err.message);
                    });
                })
                .on('end', () => {
                    console.log(`File processing complete: ${file}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error(`Error reading file ${file}:`, err.message);
                    reject(err);
                });
        } else {
            console.error(`File not found: ${file}`);
            resolve();
        }
    });
};

// 모든 파일 처리
const processFiles = async () => {
    for (const fileAndTable of filesAndTables) {
        await processFile(fileAndTable);
    }
    db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        else console.log('Database connection closed.');
    });
};

processFiles();
