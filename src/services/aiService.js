const GEMINI_API_KEY = 'DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(promptText, base64File, mimeType) {
  const parts = [{ text: promptText }];
  if (base64File) {
    parts.push({ inline_data: { mime_type: mimeType, data: base64File } });
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi từ AI.';
}

export async function summarizeDocument(base64Pdf, level = 'Trung bình') {
  const prompt = `Đọc nội dung tài liệu PDF đính kèm và tóm tắt ở mức độ "${level}". Trình bày theo cấu trúc rõ ràng, đánh số từng ý chính.`;
  return callGemini(prompt, base64Pdf, 'application/pdf');
}

export async function askQuestionAboutDocument(base64Pdf, chatHistory, newQuestion) {
  const historyText = chatHistory
    .map((m) => `${m.role === 'user' ? 'Sinh viên' : 'AI'}: ${m.text}`)
    .join('\n');
  const prompt = `Dựa trên tài liệu PDF đính kèm, hãy trả lời câu hỏi của sinh viên. Ưu tiên thông tin trong tài liệu.\n\nLịch sử hội thoại:\n${historyText}\n\nCâu hỏi mới: ${newQuestion}`;
  return callGemini(prompt, base64Pdf, 'application/pdf');
}

export async function extractTextFromImage(base64Image) {
  const prompt = `Đọc và trích xuất toàn bộ nội dung văn bản, công thức toán học trong ảnh này. Chỉ trả về nội dung đã nhận dạng, giữ nguyên định dạng công thức (dùng ký hiệu thông thường như x^2, sqrt(x)...), không thêm giải thích hay bình luận gì khác.`;
  return callGemini(prompt, base64Image, 'image/jpeg');
}

export async function analyzeProblem(ocrText) {
  const prompt = `Đây là đề bài:\n\n${ocrText}\n\nHãy: 1) Xác định loại bài toán/chủ đề liên quan. 2) Đưa ra gợi ý từng bước (không giải luôn đáp án). 3) Giải thích ngắn gọn khái niệm liên quan.`;
  return callGemini(prompt);
}