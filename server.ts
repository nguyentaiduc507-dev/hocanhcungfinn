import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Built-in fallback mnemonics for Unit 2 Healthy Living
const fallbackMnemonics: Record<string, string> = {
  health: "💡 Mẹo nhớ: 'Health' phát âm gần giống 'hít thờ' (thở) -> Hít thở sâu và đều đặn đem lại 'sức khỏe'.\nVí dụ: Good food and exercise are important for your health. (Thức ăn tốt và tập thể dục rất quan trọng cho sức khỏe của bạn).",
  healthy: "💡 Mẹo nhớ: Health + y (thêm tính từ) = Có nhiều sức khỏe, 'lành mạnh'.\nVí dụ: Eating lots of vegetables is a healthy habit. (Ăn nhiều rau là một thói quen lành mạnh).",
  exercise: "💡 Mẹo nhớ: 'Ex' (ra ngoài) + 'ercise' -> Ra ngoài vận động, 'tập luyện'.\nVí dụ: You should exercise for 30 minutes every morning. (Bạn nên tập thể dục 30 phút mỗi sáng).",
  suncream: "💡 Mẹo nhớ: 'Sun' (mặt trời) + 'cream' (kem) -> Kem thoa chống nắng.\nVí dụ: Always apply suncream before going to the beach. (Luôn thoa kem chống nắng trước khi đi biển).",
  sunburn: "💡 Mẹo nhớ: 'Sun' (mặt trời) + 'burn' (cháy, bỏng) -> Cháy nắng, rát da do nắng gắt.\nVí dụ: Put on a hat to avoid severe sunburn. (Hãy đội mũ để tránh bị cháy nắng nghiêm trọng).",
  "lip balm": "💡 Mẹo nhớ: 'Lip' (môi) + 'balm' (sáp thơm làm dịu) -> Son dưỡng giúp môi mềm mịn.\nVí dụ: My lips are dry, I need some lip balm. (Môi tôi bị khô, tôi cần chút son dưỡng môi).",
  chapped: "💡 Mẹo nhớ: Chapped phát âm giòn đanh như tiếng rạn vỡ -> Môi hay da bị 'nứt nẻ' trong mùa đông.\nVí dụ: Cold weather often causes chapped lips. (Thời tiết lạnh thường gây nứt nẻ môi).",
  acne: "💡 Mẹo nhớ: 'Acne' phát âm nghe như 'ác-nê' -> Những nốt mụn đáng ghét, 'mụn trứng cá'.\nVí dụ: Washing your face properly helps prevent acne. (Rửa mặt đúng cách giúp ngăn ngừa mụn trứng cá).",
  protein: "💡 Mẹo nhớ: Protein bắt đầu bằng 'Pro' -> Siêu chất dinh dưỡng 'chất đạm' giúp cơ bắp pro!\nVí dụ: Tofu, eggs, and beans are rich in protein. (Đậu hũ, trứng và các loại đậu rất giàu chất đạm).",
  tofu: "💡 Mẹo nhớ: Tofu bắt nguồn từ tiếng Á Đông -> Món 'đậu hũ' thanh đạm, tốt cho tim mạch.\nVí dụ: Vegetarians love eating fresh tofu. (Người ăn chay rất thích ăn đậu hũ tươi)."
};

// API: Generate Mnemonic for Flashcard
app.post('/api/gemini/mnemonic', async (req, res) => {
  const { word, meaning } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  const normalizedWord = word.trim().toLowerCase();

  if (ai) {
    try {
      const prompt = `Bạn là FINN 🦊 - người bạn đồng hành AI siêu đáng yêu và thông thái trong ứng dụng "Học Tiếng Anh Cùng FINN", hướng dẫn học sinh Việt Nam học từ vựng Unit 2: Healthy Living.
Hãy tạo nội dung ghi nhớ cho từ/cụm từ: "${word}" (nghĩa: "${meaning || ''}").
Yêu cầu định dạng ngắn gọn (tối đa 3 dòng):
1. 💡 FINN mách mẹo nhớ (mnemonic): Liên tưởng âm thanh, từ nguyên hoặc hình ảnh hài hước, dễ thuộc trong 5 giây.
2. 📝 Ví dụ cùng FINN: 1 câu tiếng Anh chuẩn, tự nhiên chủ đề sức khoẻ + dịch nghĩa tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text) {
        return res.json({ result: response.text.trim() });
      }
    } catch (err: any) {
      console.error('Error generating mnemonic with Gemini:', err?.message || err);
    }
  }

  // Fallback if AI not available or error occurred
  const fallback = fallbackMnemonics[normalizedWord] ||
    `💡 Mẹo nhớ: Liên tưởng từ "${word}" với lối sống lành mạnh hàng ngày.\nVí dụ: Maintaining a good lifestyle with "${word}" will keep your body fit and strong! (${meaning ? `Duy trì lối sống tốt sẽ giúp cơ thể luôn cân đối và khoẻ mạnh.` : ''})`;

  res.json({ result: fallback });
});

// API: AI Tutor Chat
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (ai) {
    try {
      const systemInstruction = `Bạn là FINN 🦊 - Người bạn đồng hành và Gia sư AI đáng yêu trong ứng dụng "Học Tiếng Anh Cùng FINN", chuyên sâu về Tiếng Anh Unit 2: Healthy Living (Lối sống lành mạnh) cho học sinh Việt Nam.
Nhiệm vụ của bạn:
- Luôn xưng là "FINN" (hoặc "mình") và gọi học sinh là "bạn". Giữ phong thái vui vẻ, nhiệt tình, ấm áp, thông thái và khích lệ.
- Giải thích từ vựng, phát âm, từ loại, collocations (go cycling, keep fit, have acne, avoid soft drinks...).
- Đặt câu ví dụ thực tế, tự nhiên và dịch nghĩa tiếng Việt.
- Sửa lỗi chính tả, ngữ pháp nếu học sinh hỏi.
- Dùng emoji sinh động (🦊, 🍎, 🚴‍♂️, 💡, ⭐), trả lời súc tích rõ ràng.`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      if (response.text) {
        return res.json({ reply: response.text.trim() });
      }
    } catch (err: any) {
      console.error('Error in chat with Gemini:', err?.message || err);
    }
  }

  // Fallback helpful assistant response with FINN persona
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `Chào bạn! FINN 🦊 đây! Về chủ đề **Unit 2: Healthy Living**, việc duy trì sức khỏe bao gồm ăn uống cân đối (balanced diet), tập thể dục đều đặn (regular exercise) và bảo vệ làn da khỏi ánh nắng (wear suncream to prevent sunburn). Bạn muốn FINN đặt câu ví dụ hay giải thích từ vựng cụ thể nào nè?`;

  if (lowerMsg.includes('suncream') || lowerMsg.includes('sunburn')) {
    fallbackReply = `☀️ **FINN mách bạn phân biệt Suncream & Sunburn nè:**\n- **Suncream** /ˈsʌn kriːm/ (danh từ): Kem chống nắng -> *Always put on suncream before swimming.* (Luôn thoa kem chống nắng trước khi bơi).\n- **Sunburn** /ˈsʌnbɜːn/ (danh từ): Vết cháy nắng, bỏng rát -> *Stay under the umbrella to avoid sunburn.* (Hãy ở dưới ô để tránh cháy nắng).`;
  } else if (lowerMsg.includes('fit') || lowerMsg.includes('keep fit')) {
    fallbackReply = `💪 **FINN chia sẻ về cụm từ "keep fit":**\n- Nghĩa là: Giữ dáng, duy trì thể trạng săn chắc khỏe mạnh.\n- Ví dụ: *Cycling and swimming are great activities to keep fit.* (Đạp xe và bơi lội là các hoạt động tuyệt vời để giữ dáng).`;
  } else if (lowerMsg.includes('chapped')) {
    fallbackReply = `❄️ **FINN giải thích từ "chapped" (adj):**\n- Nghĩa là: Nứt nẻ, khô rát (thường dùng cho da hoặc môi do lạnh hoặc hanh khô).\n- Cụm từ hay gặp: *chapped lips* (đôi môi nứt nẻ), *chapped skin* (da nứt nẻ).\n- Giải pháp: *Use lip balm for chapped lips!* (Dùng son dưỡng cho môi nứt nẻ nhé!).`;
  }

  res.json({ reply: fallbackReply });
});

// API: Generate AI Quiz
app.post('/api/gemini/quiz', async (req, res) => {
  if (ai) {
    try {
      const prompt = `Hãy tạo 1 câu hỏi trắc nghiệm tiếng Anh thông minh và thú vị về từ vựng Unit 2: Healthy Living.
Trả về định dạng JSON thuần tuý:
{
  "question": "Nội dung câu hỏi bằng tiếng Anh (hoặc câu hỏi điền từ trong ngữ cảnh)",
  "translation": "Dịch nghĩa câu hỏi tiếng Việt",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "A",
  "explanation": "Giải thích chi tiết vì sao chọn đáp án này bằng tiếng Việt"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ quiz: parsed });
        } catch {
          // JSON parse failed, proceed
        }
      }
    } catch (err: any) {
      console.error('Error generating AI quiz:', err?.message || err);
    }
  }

  // Pre-crafted fallback high-quality question
  res.json({
    quiz: {
      question: "You should wear a hat and apply ______ when doing outdoor activities on sunny days to avoid sunburn.",
      translation: "Bạn nên đội mũ và thoa ______ khi tham gia hoạt động ngoài trời vào ngày nắng để tránh bị cháy nắng.",
      options: ["A. lip balm", "B. suncream", "C. soft drinks", "D. acne"],
      correctAnswer: "B",
      explanation: "Đáp án đúng là B (suncream - kem chống nắng). 'Lip balm' là son dưỡng môi, 'soft drinks' là nước ngọt, 'acne' là mụn trứng cá."
    }
  });
});

// Serve frontend in dev via Vite middlewares, or static dist in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
