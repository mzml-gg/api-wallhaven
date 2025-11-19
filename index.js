import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const query = req.query.query;

    if (!query) {
      return res.json({
        status: "error",
        message: "اكتب كلمة البحث — ?query="
      });
    }

    const searchUrl = `https://wallhaven.cc/search?q=${encodeURIComponent(query)}&sorting=random`;

    const response = await fetch(searchUrl);
    const html = await response.text();

    const regex = /href="https:\/\/wallhaven\.cc\/w\/([a-z0-9]{6})"/g;
    let match;
    const ids = new Set();

    while ((match = regex.exec(html)) !== null) {
      ids.add(match[1]);
      if (ids.size >= 10) break;
    }

    if (ids.size === 0) {
      return res.json({
        status: "error",
        message: "لم يتم العثور على صور"
      });
    }

    const images = [...ids].map(id => {
      const prefix = id.substring(0, 2);
      return `https://w.wallhaven.cc/full/${prefix}/wallhaven-${id}.jpg`;
    });

    res.json({
      status: "ok",
      count: images.length,
      results: images
    });
  } catch (err) {
    res.json({
      status: "error",
      message: err.message
    });
  }
}
