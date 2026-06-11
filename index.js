const axios = require('axios');

module.exports = async (req, res) => {
  // إعدادات الـ CORS الكاملة لتفادي مشاكل الحظر في المتصفحات والبوتات
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // معالجة طلبات التحقق المسبق (Preflight OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // جلب اسم الأغنية من المعامل q أو prompt
    const query = req.query.q || req.query.prompt;

    if (!query) {
      return res.status(400).json({
        success: false,
        creator: "By Arab Top Dev",
        error: 'يرجى كتابة اسم الأغنية المراد البحث عنها في معامل q'
      });
    }

    // الرابط المباشر المستقر الذي نجح في أداة بايثون
    const url = "https://api-partner.spotify.com/pathfinder/v1/query";

    // الهيدرز الحية والشغالة 100%
    const headers = {
      'accept': 'application/json',
      'accept-language': 'ar',
      'app-platform': 'WebPlayer',
      'authorization': 'Bearer BQCO44sHz3KQCFttR-55IItl1OANwCK5Tc9BcafFLkZ-ZMi7PsLkQTHwhSCSRp6zYJXV4bpR2z_fyRCpfg6V26NG47OmbyQIm_17lPTg77V2fJzS_gv7ST-0goQzpJ4_tjSighq0wcDrtMVOZcrZkqKWGmjTkwBbmevEa6Ys0zc0JLfm_lgrdiYCfualuMeY9Mr3w_ktodTZtVgHecbmpVD2G-jHaJVRDQjBFCqPyHFouBn2GXS2WZFxLeJ9-M_ew_lqpZzqkWBDJl0YJmxx4hh0318DgaFxngtwqKunhi1ZN55en-XvTanaQpLejcgxcAwgvylI_Dom453Y0t-wNTGR_aIWdu9tOW7X1Dsy68tQU4etAtdYTO0QZ3E9mRunG7GKZ0ASp6SfA8zdd8Q',
      'client-token': 'AAAnMmsK258ommRyhCEglhWQ1RazmM/Zh69/+deNzo/B/G/iDWoons4tv02En0pPJje7i7ElOKw5uJtVlrNTgojx49YCuNP4p/bpNxbao4CPIkx99WmwqrYlwgYJ1ua5vl2+r5cz0beI7rZo6/otxNso1fy9iX/CCMdrS9CHRK0TnwV57Huyw5XotTgUi8Bf9yN7R4VVKH+5uxdY6EWmvXPa2BkobNjUq33RUjEXYNPwtQg/LXdXM90wUjHny7PHpWaedr2y3rtkranbPAQcS8rMFKvhUs2IdAzJ0NqqZCvBuhA8x2H9XGpL4NnJJ3T0qD6aQ6f4982C6CQa/M6nLHn8ZPtqTmE1BkNQ',
      'content-type': 'application/json;charset=UTF-8',
      'origin': 'https://open.spotify.com',
      'referer': 'https://open.spotify.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
    };

    // الـ Payload المطابق للأداة
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

    // إرسال الطلب عبر Axios بسعة انتظار 12 ثانية
    const searchRes = await axios({
      method: 'post',
      url: url,
      data: searchPayload,
      headers: headers,
      timeout: 12000
    });

    // سحب مصفوفة العناصر بناءً على الفرز الناجح للأداة
    const items = searchRes.data?.data?.searchV2?.topResultsV2?.itemsV2 || [];
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        creator: "By Arab Top Dev",
        error: "لم يعثر سيرفر سبوتيفاي على نتائج لهذا البحث."
      });
    }

    // إمساك بيانات العنصر الأول (أفضل تطابق)
    const firstItem = items[0]?.item?.data;

    if (!firstItem) {
      return res.status(404).json({
        success: false,
        creator: "By Arab Top Dev",
        error: "فشل قراءة تفاصيل النتيجة الأولى من المصفوفة."
      });
    }

    // تفكيك الـ URI برمجياً لمعرفة النوع والـ ID (نفس نظام البايثون)
    const uri = firstItem.uri || "";
    const uriParts = uri ? uri.split(':') : [];
    
    const itemType = uriParts[1] || "track";
    const itemId = firstItem.id || uriParts[2] || "";

    // استخراج رابط صورة الغلاف بدقة وتفادي الـ undefined
    const thumbnail = firstItem.albumOfTrack?.coverArt?.sources?.[0]?.url || 
                      firstItem.images?.items?.[0]?.sources?.[0]?.url || "";

    // الرد النهائي الجاهز للبوت واللوحة
    return res.status(200).json({
      success: true,
      creator: "By Arab Top Dev",
      result: {
        id: itemId,
        type: itemType,
        title: firstItem.name || "بدون عنوان",
        url: `https://open.spotify.com/track/3svMa5SZw4lzLmtUlWHDh7`,
        thumbnail: thumbnail
      }
    });

  } catch (error) {
    console.error('Vercel Core Error:', error.message);
    return res.status(500).json({
      success: false,
      creator: "By Arab Top Dev",
      error: error.message || 'حدث خطأ داخلي في السيرفر أثناء جلب البيانات'
    });
  }
};
