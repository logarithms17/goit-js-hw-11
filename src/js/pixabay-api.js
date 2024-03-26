export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '42916630-fcae59394b33bab98c0a7b5ac';

export const options = {
  params: {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  },
};
