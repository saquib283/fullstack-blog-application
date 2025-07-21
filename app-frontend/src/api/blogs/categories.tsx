import api from "../../lib/axios";

export const getAllCategories = async()=>{
    try {
        const res = await api.get("/category/all-categories");
        return res;
    } catch (error) {
        throw error;
    }
}