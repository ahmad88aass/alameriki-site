const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const vouchers = {
    'SHAM-5USD-1122': 5.00,
    'SHAM-10USD-3344': 10.00
};

app.post('/api/redeem', (req, res) => {
    const { code } = req.body || {};
    if (vouchers[code]) {
        return res.json({ success: true, amount: vouchers[code], message: 'تم الشحن بنجاح!' });
    }
    return res.json({ success: false, message: 'الكود غير صحيح.' });
});

app.listen(PORT, () => console.log('SERVER_RUNNING_OK'));
