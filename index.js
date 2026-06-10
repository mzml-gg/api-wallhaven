const axios = require('axios');

module.exports = async (req, res) => {
  // تفعيل هيدرز الـ CORS لمنع مشاكل الاتصال من البوت أو الموقع
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // استقبال نص البحث من معامل q أو prompt أو query
    const query = req.query.q || req.query.prompt || req.query.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        creator: "By Arab Top Dev",
        error: 'يرجى كتابة نص البحث في معامل q أو prompt'
      });
    }

    // الهيدرز والكوكيز الحصريّة الجديدة التي قمت باصطيادها من اللاب توب
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://spotify.downloaderize.com/',
      'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
      // كوكيز جدار الحماية cf_clearance وجوجل أدز الطازجة لتخطي الـ 403
      'cookie': 'cf_clearance=QMoVCRg3FflBP67d4AxQnJybusSn5oZWRQCxxYZSZxg-1781124395-1.2.1.1-S0EF9QKBYMy2kz4vt5nvorsqlC_hLm4MdeBFrutynyElvZXIXgxlAL6rJU47pqtXB6WO7a9SrpG4XW8jxgdAr1J_Okrb8F0KksMbYLlmQ.0iW_LnbLC04y3brH4kByCJSfEXBog2iKHQoic2vyt3cDtWPkV90lZtwB0TYmB.LTi9K1VTGnj3IuUNGBPAbb3bh6bRbTxQknJYPiHU9IHHCgQlBgITtn96IrTvOCuxuCbfJybBNr.MDofeVAOELB4AdFogaDVCfQgHWES.W2Z6yqSIAqBOSXqPAXMfKwg3OHcrlDw.AOlHHQnlUrIiR5HHlXjEy0.RE2t5T6k55S20Qw; __gads=ID=19074f39fb7967ea:T=1781124396:RT=1781124396:S=ALNI_MYwt21wYfq2C0rDUuUT3a3MgIu70g; __gpi=UID=00001427ba40b7ce:T=1781124396:RT=1781124396:S=ALNI_MZyvsCDcEAgnAAOHV3zMVvfX6GkqA; __eoi=ID=9c58200eb063b3ef:T=1781124396:RT=1781124396:S=AA-Afjb_kYp8cbsNPOt9Bp2TqRIM'
    };

    // تشفير كلمة البحث وتمريرها للسورس الجديد (Spotify Downloaderize)
    const targetUrl = `https://spotify.downloaderize.com/search.php?query=${encodeURIComponent(query)}`;

    // إرسال الطلب
    const apiRes = await axios.get(targetUrl, { headers, timeout: 15000 });

    // التحقق من الاستجابة (بما أننا لا نعلم هيكل جيسون هذا السورس بدقة بعد، قمت بعمل مرونة مريحة)
    let tracks = [];
    if (Array.isArray(apiRes.data)) {
      tracks = apiRes.data;
    } else if (apiRes.data && Array.isArray(apiRes.data.songs)) {
      tracks = apiRes.data.songs;
    } else if (apiRes.data && Array.isArray(apiRes.data.data)) {
      tracks = apiRes.data.data;
    } else if (apiRes.data && typeof apiRes.data === 'object') {
      tracks = apiRes.data.results || apiRes.data.tracks || [apiRes.data];
    }

    // فلترة وهيكلة البيانات لتعود نظيفة وموحدة لبوتك وموقعك
    const cleanResults = tracks.map(track => ({
      title: track.title || track.name || "بدون عنوان",
      artist: track.artist || track.artists || "فنان غير معروف",
      thumbnail: track.thumbnail || track.image || track.cover_url || "",
      url: track.url || track.spotify_url || track.link || "",
      duration: track.duration || "0:00"
    }));

    // إرجاع رد الـ JSON النهائي مختوم بحقوقك الحصرية
    return res.status(200).json({
      success: true,
      creator: "By Arab Top Dev",
      search_engine: "Spotify Downloaderize Search",
      results_count: cleanResults.length,
      results: cleanResults
    });

  } catch (error) {
    console.error('Downloaderize API Error:', error.message);
    return res.status(500).json({
      success: false,
      creator: "By Arab Top Dev",
      error: error.message || 'حدث خطأ داخلي أثناء معالجة البحث'
    });
  }
};
