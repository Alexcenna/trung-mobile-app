const GEMINI_API_KEY = 'Dán API key ở đây nha';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(promptText, base64File, mimeType, retries = 2) {
  const parts = [{ text: promptText }];
  if (base64File) {
    parts.push({ inline_data: { mime_type: mimeType, data: base64File } });
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    const data = await response.json();

    if (!data.error) {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi từ AI.';
    }

    const isOverloaded = data.error.message?.includes('high demand') || response.status === 503;
    if (isOverloaded && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    throw new Error(data.error.message);
  }
}

export async function summarizeDocument(documentData, level = 'Trung bình') {
  const prompt = `Tóm tắt nội dung sau ở mức độ "${level}". Trình bày theo cấu trúc rõ ràng, đánh số từng ý chính.`;

  if (documentData.base64Content) {
    return callGemini(prompt, documentData.base64Content, 'application/pdf');
  } else if (documentData.textContent) {
    return callGemini(`${prompt}\n\nNội dung:\n${documentData.textContent}`);
  }
  throw new Error('Tài liệu không có nội dung để tóm tắt.');
}

export async function askQuestionAboutDocument(documentData, chatHistory, newQuestion) {
  const historyText = chatHistory
    .map((m) => `${m.role === 'user' ? 'Sinh viên' : 'AI'}: ${m.text}`)
    .join('\n');

  const basePrompt = `Dựa trên tài liệu, hãy trả lời câu hỏi của sinh viên. Ưu tiên thông tin trong tài liệu.\n\nLịch sử hội thoại:\n${historyText}\n\nCâu hỏi mới: ${newQuestion}`;

  if (documentData?.base64Content) {
    return callGemini(basePrompt, documentData.base64Content, 'application/pdf');
  } else if (documentData?.textContent) {
    return callGemini(`${basePrompt}\n\nNội dung tài liệu:\n${documentData.textContent}`);
  }
  return callGemini(basePrompt);
}

export async function extractTextFromImage(base64Image) {
  const prompt = `Đọc và trích xuất toàn bộ nội dung văn bản, công thức toán học trong ảnh này. Chỉ trả về nội dung đã nhận dạng, giữ nguyên định dạng công thức (dùng ký hiệu thông thường như x^2, sqrt(x)...), không thêm giải thích hay bình luận gì khác.`;
  return callGemini(prompt, base64Image, 'image/jpeg');
}

export async function analyzeProblem(ocrText) {
  const prompt = `Đây là đề bài:\n\n${ocrText}\n\nHãy: 1) Xác định loại bài toán/chủ đề liên quan. 2) Đưa ra gợi ý từng bước (không giải luôn đáp án). 3) Giải thích ngắn gọn khái niệm liên quan.`;
  return callGemini(prompt);
}