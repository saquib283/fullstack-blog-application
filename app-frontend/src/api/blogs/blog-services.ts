import api from "@/lib/axios";


export const saveBlog = async (data: FormData) => {
  try {
    const response = await api.post("/blogs/create-blog", data, {
      withCredentials: true, 
      headers:{
        'Content-Type':'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to save blog:", error.response?.data || error.message);
    throw error;
  }
};
