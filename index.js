const axios = require('axios');

module.exports = async (req, res) => {
  // تفعيل هيدرز الـ CORS لتجنب مشاكل الاتصال من أي بوت أو موقع
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // استقبال المتغير الصافي q أو prompt من الرابط مباشرة
    const query = req.query.q || req.query.prompt;

    if (!query) {
      return res.status(400).json({
        success: false,
        creator: "By Arab Top Dev",
        error: 'يرجى كتابة نص البحث في معامل q أو prompt'
      });
    }

    // هيدرز الـ curl السليمة والشغالة 100% اللي جربتها على اللاب توب
    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
      'x-session-token': 'a576f0ac7fdf19f463c22ef4da0651ff9199a67972d5687182eb3cfd1282e51e',
      'cookie': 'cf_clearance=0yzvyAwzLQymqXC0_2eMbrFpsoj.I42SSkhcZ1Ak7Uk-1781116057-1.2.1.1-uw5dCeWNbqm8sxRqidCjyClTyv5jYALptg455TEcg1wmSwRsCMAStz4eaUvafl_7ZJ5finmvMfQ6tyVgv1ku0QkS5CLTjqGN9KS0A_sj2lswPYAK.HAXE5e3dg2h25.Ijz.C.fuKkkTozBtxKC.QakNBj8j4_WW8ssXbURH2w1ApEWzeHN.SlCtX8jPdfQKKBs0DUEFxc7xgexLNuijYA5VOuseZ0DtjaQS3SasOm6jqz3ILLjvJ_o.p7_sZcUN5OIvkDW2Un.rKsIXwr0GsVjh_jL5PEL3CBv4lQcxLj.OcxZ94vXDGeDSMpu5UKOerBw4L7dOmMvoOuhUNlurR4Q; connect.sid=s%3Acaf77eb0-cdb3-469a-91b2-32357c20a1ba.IwMYZRIA%2BiQRzTl%2BKGVHYV4yGUJvaXyq2Aa7OV%2Fxdsw'
    };

    // إرسال الطلب للسورس المباشر مع تشتيت الكاش بـ Timestamp
    const targetUrl = `https://spotdown.org/apinew/song-details?url=${encodeURIComponent(query)}&_=${Date.now()}`;
    const apiRes = await axios.get(targetUrl, { headers, timeout: 15000 });

    if (!apiRes.data || !apiRes.data.songs || !Array.isArray(apiRes.data.songs)) {
      return res.status(502).json({
        success: false,
        creator: "By Arab Top Dev",
        error: 'لم يتم العثور على نتائج من المصدر الأساسي.'
      });
    }

    // تصفية المصفوفة القادمة واستخراج الداتا المطلوبة فقط للـ Bot/Site عندك
    const cleanResults = apiRes.data.songs.map(track => ({
      title: track.title || "بدون عنوان",
      artist: track.artist || "فنان غير معروف",
      thumbnail: track.thumbnail || "",
      url: track.url || "",
      duration: track.duration || "0:00"
    }));

    return res.status(200).json({
      success: true,
      creator: "By Arab Top Dev",
      search_engine: "Spotify Custom Vercel API",
      results_count: cleanResults.length,
      results: cleanResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      creator: "By Arab Top Dev",
      error: error.message
    });
  }
};
