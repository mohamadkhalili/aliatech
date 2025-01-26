import aliatechApi from "./api";

const URLS = {
    prefixAliatech: "/main",
    prefixLogin: "/signup",
    prefixRefresh: "/refresh",
    prefixForms: "/forms",
};

export const postLogin = (email: string, password: string) => {
    return aliatechApi.post(URLS.prefixAliatech + URLS.prefixLogin, { email, password })
};

export const postRefresh = (token: string) => {
    return aliatechApi.post(URLS.prefixAliatech + URLS.prefixRefresh, { token })
};

export const getForms = ({ page = 1, per_page = 15 }: { page?: number, per_page?: number }) => {
    return aliatechApi.get(URLS.prefixAliatech + URLS.prefixForms, { params: { page, per_page } })
};