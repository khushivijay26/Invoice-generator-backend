const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
const upload = multer();

const PORT = 3000;
const EXCEL_FILE = 'data.xlsx';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST API — Excel me form data add karo
app.post('/submit', upload.none(), async function (req, res) {
  const name = req.body.name;
  const email = req.body.email;

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(EXCEL_FILE)) {
    await workbook.xlsx.readFile(EXCEL_FILE);
  } else {
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.addRow(['Name', 'Email']); // Header row
  }

  const sheet = workbook.getWorksheet('Sheet1');
  sheet.addRow([name, email]);
  await workbook.xlsx.writeFile(EXCEL_FILE);

  res.send('Data Excel me save ho gaya.');
});

// GET API — Excel file se data padho aur bhejo
app.get('/data', async function (req, res) {
  const workbook = new ExcelJS.Workbook();

  if (!fs.existsSync(EXCEL_FILE)) {
    return res.status(404).send('Excel file nahi mila.');
  }

  await workbook.xlsx.readFile(EXCEL_FILE);
  const sheet = workbook.getWorksheet('Sheet1');

  const result = [];

  sheet.eachRow(function (row, index) {
    if (index === 1) return; // Header skip karo

    const name = row.getCell(1).value;
    const email = row.getCell(2).value;

    result.push({ name: name, email: email });
  });

  res.json(result);
});

app.listen(PORT, function () {
  console.log('Server chalu ho gaya at http://localhost:' + PORT);
});
