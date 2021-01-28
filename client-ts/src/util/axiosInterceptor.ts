import axios from 'axios';
//https://chorydev.tistory.com/18

const baseURL = 'http://localhost:4000';

const axiosInstance = axios.create({
  baseURL
});

//https://hydev.tistory.com/3
// request 시 토큰 만료기간 확인해서 리프레시 요청해도 됨
axiosInstance.interceptors.request.use(
  async (config) => {
    const userInfo = localStorage.getItem('userInfo');
    const accessToken = userInfo ? JSON.parse(userInfo).access_token : null;
    if (!userInfo || !accessToken){
      alert('로그인 후 사용 가능합니다. 로그인 해주세요');
      window.location.href ='/login';
    }
    config.headers = {
      Authorization: `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
  
)

axiosInstance.interceptors.response.use(response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry){
      originalRequest._retry = true;
      const userInfoString = localStorage.getItem('userInfo');
      const userInfo = userInfoString? JSON.parse(userInfoString) : null;
      const refreshToken = userInfo.refresh_token;
      if (userInfo){
        try{
          const result = await axios.post(`${baseURL}/auth/refresh-token`, {refreshToken});
          const newAccessToken = result.data.accessToken;
          userInfo.access_token = newAccessToken;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch(e) {
          if (error.response.status === 400){
            alert('토큰이 만료되었습니다. 다시 로그인 해주세요')
            window.location.href = '/login';
          }
          return Promise.reject(e);
        }
      }
    }
    console.log(error);
    return Promise.reject(error);
  }
);


export default axiosInstance;
