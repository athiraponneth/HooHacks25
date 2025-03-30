const API_KEY = 'INSERT_API_KEY';

export async function searchOutfitPhotos(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`;

  const response = await fetch(url, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const data = await response.json();

  if (!data.photos) return [];

  return data.photos.map((photo) => ({
    id: photo.id,
    title: photo.alt,
    imageUrl: photo.src.medium,
    link: photo.url,
  }));
}
