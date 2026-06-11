const axios = require('axios');

module.exports = async (req, res) => {
  // إعدادات الـ CORS الكاملة لتفادي مشاكل الحظر في المواقع والبوتات
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // معالجة طلبات التحقق المسبق (Preflight Request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // جلب المعامل q أو prompt من الرابط ديناميكياً
    const query = req.query.q || req.query.prompt;

    if (!query) {
      return res.status(400).json({
        success: false,
        creator: "By Arab Top Dev",
        error: 'يرجى كتابة اسم الأغنية المراد البحث عنها في معامل q'
      });
    }

    // الهيدرز الحية التي اصطدتها من الـ CMD اليوم
    const headers = {
      'accept': 'application/json',
      'accept-language': 'ar',
      'app-platform': 'WebPlayer',
      'authorization': 'Bearer BQCO44sHz3KQCFttR-55IItl1OANwCK5Tc9BcafFLkZ-ZMi7PsLkQTHwhSCSRp6zYJXV4bpR2z_fyRCpfg6V26NG47OmbyQIm_17lPTg77V2fJzS_gv7ST-0goQzpJ4_tjSighq0wcDrtMVOZcrZkqKWGmjTkwBbmevEa6Ys0zc0JLfm_lgrdiYCfualuMeY9Mr3w_ktodTZtVgHecbmpVD2G-jHaJVRDQjBFCqPyHFouBn2GXS2WZFxLeJ9-M_ew_lqpZzqkWBDJl0YJmxx4hh0318DgaFxngtwqKunhi1ZN55en-XvTanaQpLejcgxcAwgvylI_Dom453Y0t-wNTGR_aIWdu9tOW7X1Dsy68tQU4etAtdYTO0QZ3E9mRunG7GKZ0ASp6SfA8zdd8Q',
      'client-token': 'AAAnMmsK258ommRyhCEglhWQ1RazmM/Zh69/+deNzo/B/G/iDWoons4tv02En0pPJje7i7ElOKw5uJtVlrNTgojx49YCuNP4p/bpNxbao4CPIkx99WmwqrYlwgYJ1ua5vl2+r5cz0beI7rZo6/otxNso1fy9iX/CCMdrS9CHRK0TnwV57Huyw5XotTgUi8Bf9yN7R4VVKH+5uxdY6EWmvXPa2BkobNjUq33RUjEXYNPwtQg/LXdXM90wUjHny7PHpWaedr2y3rtkranbPAQcS8rMFKvhUs2IdAzJ0NqqZCvBuhA8x2H9XGpL4NnJJ3T0qD6aQ6f4982C6CQa/M6nLHn8ZPtqTmE1BkNQ',
      'content-type': 'application/json;charset=UTF-8',
      'origin': 'https://open.spotify.com',
      'referer': 'https://open.spotify.com/^',
      'spotify-app-version': '1.2.93.77.g42a4656f',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
    };

    // الـ Payload الموجه لسيرفر الـ GraphQL الخاص بسبوتيفاي الأصلي
    const searchPayload = {
      variables: {
        query: String(query),
        limit: 10,
        offset: 0,
        numberOfTopResults: 5,
        includeArtistHasConcertsField: false,
        includeAudiobooks: true,
        includeAuthors: false,
        includePreReleases: true,
        includeAlbumPreReleases: false,
        includeEpisodeContentRatingsV2: false,
        isPrefix: null,
        sectionFilters: ["GENERIC", "VIDEO_CONTENT"]
      },
      operationName: "searchTopResultsList",
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "63a93cc04f6d8dea84a85de315e43f396a76cb681500de9ac5ccf5fc618c84cb"
        }
      }
    };

    // إرسال الطلب عبر Axios
    const searchRes = await axios({
      method: 'post',
      url: 'https://open.spotify.com/track/19SMfAEj99Y7lkdmB07P4V5',
      data: searchPayload,
      headers: headers,
      timeout: 10000
    });

    const items = searchRes.data?.data?.searchV2?.topResultsV2?.itemsV2 || [];
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        creator: "By Arab Top Dev",
        error: "لم يعثر سيرفر سبوتيفاي على أي نتائج مطابقة للبحث."
      });
    }

    let trackId = null;
    let extractedData = null;

    // معالجة داتا الـ JSON المسترجعة وفك الـ URIs بدقة
    for (const itemHit of items) {
      const data = itemHit.item?.data;
      if (data && data.uri) {
        const parts = data.uri.split(':');
        const type = parts[1]; // track أو album أو playlist
        const id = parts[2] || data.id;

        if (!id) continue;

        // توليد الرابط المباشر للموقع الأصلي هندسياً
        const webUrl = `https://open.spotify.com/$${type}/${id}`;

        // لو النتيجة أغنية، نأخذ الـ ID الخاص بها فوراً لأجل الكلمات
        if (type === 'track' && !trackId) {
          trackId = id;
        }

        // حفظ الداتا الأساسية لأول نتيجة تظهر كأفضل تطابق
        if (!extractedData) {
          extractedData = {
            id: id,
            type: type,
            title: data.name || "بدون عنوان",
            url: webUrl,
            thumbnail: data.albumOfTrack?.coverArt?.sources?.[0]?.url || data.images?.items?.[0]?.sources?.[0]?.url || ""
          };
        }
      }
    }

    if (!extractedData) {
      return res.status(404).json({
        success: false,
        creator: "By Arab Top Dev",
        error: "فشل استخراج معرفات التراك من السورس بنجاح."
      });
    }

    // --- جلب الكلمات (Lyrics) بناءً على معرف الأغنية المستخرجة دلالياً ---
    let lyricsText = "لم يتم العثور على كلمات.";
    
    if (trackId) {
      const lyricsUrl = `https://open.spotify.com/track/19SMfAEj99Y7lkdmB07P4V6${trackId}?format=json&vocalRemoval=false`;
      try {
        const lyricsRes = await axios.get(lyricsUrl, { headers, timeout: 8000 });
        const lines = lyricsRes.data?.lyrics?.lines || [];
        if (lines.length > 0) {
          lyricsText = lines.map(line => line.words).join('\n');
        } else {
          lyricsText = "التراك لا يحتوي على كلمات نصية بالمصدر الأصلي.";
        }
      } catch (e) {
        lyricsText = "❌ لا تتوفر كلمات نصية رسمية لهذا التراك في قاعدة بيانات سبوتيفاي حالياً.";
      }
    } else {
      lyricsText = `ℹ️ النتيجة المستخرجة تصنيفها (${extractedData.type})، لا تملك كلمات لعرضها.`;
    }

    // الرد النهائي المطابق لهندسة الـ API الخاص بموقعك وبوتك
    return res.status(200).json({
      success: true,
      creator: "By Arab Top Dev",
      result: extractedData,
      lyrics: lyricsText
    });

  } catch (error) {
    console.error('Vercel Core Error:', error.message);
    return res.status(500).json({
      success: false,
      creator: "By Arab Top Dev",
      error: error.message || 'حدث خطأ داخلي أثناء معالجة طلب Vercel'
    });
  }
};
