Visualizer đang gặp sự cố, để tôi trình bày thẳng ra đây:

---

## Plan chi tiết: Claude Vision API → Database 1,250 món

### Luồng chính

```
[Ảnh món ăn]
     ↓
[Claude Vision] → JSON: {tên món, gram ước tính, confidence}
     ↓
[Fuzzy Match] → Tìm món khớp nhất trong DB 1,250 món
     ↓
[Query DB] → kcal/100g × gram ước tính = kcal_total
     ↓
[Output] → Kcal + macro + gợi ý theo tuần thai
```

---

### Bước 1 — Prompt chuẩn gửi kèm ảnh

Điểm mấu chốt là bắt Claude trả về JSON cố định để parse dễ:

```js
const SYSTEM_PROMPT = `Bạn là chuyên gia dinh dưỡng Việt Nam.
Nhận diện món ăn trong ảnh và trả về JSON sau, KHÔNG giải thích thêm:
{
  "dishes": [
    {
      "name": "tên món chuẩn tiếng Việt",
      "estimated_grams": 250,
      "confidence": 0.85
    }
  ],
  "meal_context": "bữa sáng/trưa/tối/phụ"
}`;
```

Gọi API với ảnh base64:

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }
        },
        { type: "text", text: "Nhận diện món ăn trong ảnh này" }
      ]
    }]
  })
});
const data = await response.json();
const result = JSON.parse(data.content[0].text);
```

> **Tip:** Resize ảnh về max 1024×1024 trước khi encode base64, tiết kiệm ~60% token.

---

### Bước 2 — Fuzzy Match vào DB

Claude trả về tên như "phở bò tái" nhưng DB có thể lưu "phở bò". Cần fuzzy search:

```js
// fuse.js (frontend/Node) hoặc rapidfuzz (Python)
const fuse = new Fuse(foodDatabase, {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'aliases', weight: 0.3 } // tên biến thể vùng miền
  ],
  threshold: 0.3,
  includeScore: true
});

const matches = fuse.search(aiReturnedName);
if (matches[0]?.score < 0.25) {
  // Tự động khớp → tính kcal
} else {
  // Hiện top 3 cho user xác nhận
}
```

Quan trọng: thêm cột `aliases` vào DB của bạn — ví dụ "bánh mì" có aliases là ["bánh mì kẹp", "bánh mì ốp la", "bánh mì chả lụa"]. Đây là chìa khóa để match chính xác.

---

### Bước 3 — Tính Kcal

```js
const food = db.query("SELECT * FROM foods WHERE id = ?", [matchedId]);
const kcal = (food.kcal_per_100g * estimatedGrams) / 100;
const protein = (food.protein_g * estimatedGrams) / 100;
// tương tự carb, fat
```

---

### Schema DB nên bổ sung

Nếu DB hiện tại chưa có, thêm mấy cột này:

| Cột | Kiểu | Mục đích |
|---|---|---|
| `aliases` | JSON array | Tên biến thể để fuzzy match |
| `pregnancy_safe` | BOOLEAN | Cảnh báo món không an toàn |
| `pregnancy_notes` | TEXT | VD: "tránh ăn sống", "nhiều thủy ngân" |

---

### Chi phí API

| Model | Cost/lần quét | 1,000 lần |
|---|---|---|
| claude-sonnet-4 | ~$0.004 | ~$4 |
| claude-haiku-4.5 | ~$0.0006 | ~$0.6 |

**Gợi ý:** Dùng Haiku mặc định, chỉ fallback sang Sonnet khi `confidence < 0.6`. Tiết kiệm ~85% chi phí.

---

### Lộ trình

**Tuần 1:** Chuẩn hóa DB — thêm `aliases`, `pregnancy_safe`. Dùng Claude để tự động sinh aliases từ tên gốc (gọi 1 lần batch, không tốn nhiều).

**Tuần 2:** Build endpoint `POST /analyze-food` — nhận ảnh → Claude → fuzzy match → trả kcal.

**Tuần 3:** Xử lý edge case — confidence thấp thì hỏi user, món không có trong DB thì lưu vào `unknown_foods` để bổ sung dần.

**Tuần 4:** Layer mẹ bầu — tính nhu cầu theo trimester (T1: +0 kcal, T2: +340, T3: +450 kcal/ngày), cảnh báo thực phẩm cần tránh.

---

Bạn đang dùng stack gì cho backend (Node.js, Python/FastAPI, hay khác)? Tôi có thể viết code template chi tiết hơn cho phần nào bạn cần.