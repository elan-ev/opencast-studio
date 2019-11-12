const axios = jest.fn().mockResolvedValue({ data: {} });
axios.get = jest.fn().mockResolvedValue({ data: {} });
export default axios;
