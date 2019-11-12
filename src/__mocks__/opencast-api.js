export const mockCheckConnection = jest.fn();
export const mockLoginAndUpload = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        checkConnection: mockCheckConnection,
        loginAndUpload: mockLoginAndUpload
    };
});

export default mock;
