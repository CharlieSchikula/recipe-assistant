function base64UrlDecode(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRkNWMwYTkzOWQyMmJiZDQ1MTliNWYiLCJlbWFpbCI6InMuc2NoaWt1bGFAZ21haWwuY29tIiwiaWF0IjoxNzMzMjk1ODI5LCJleHAiOjE3MzMyOTk0Mjl9.5Sx6Zwz4Y_zEmF0PChzli4pHLPkTtWSX7XRTIL5aIrM';
const header = jwt.split('.')[0];
const payload = jwt.split('.')[1];
const decodedHeader = base64UrlDecode(header);
const decodedPayload = base64UrlDecode(payload);
console.log(decodedHeader);
console.log(decodedPayload);