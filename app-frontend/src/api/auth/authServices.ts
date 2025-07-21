import axios from "@/lib/axios"; 
import { useAuthStore } from "@/store/authStore";


export const login = async (credentials: { username: string; password: string }) => {
  try {
    const res = await axios.post("/users/login", credentials);
    const { user, accessToken, refreshToken } = res.data.data;
    console.log("User Data:", user);
    const formattedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      profilePicture: user.profilePicture,
      role: user.role,
    };
    useAuthStore.getState().setAccessToken(accessToken);
    useAuthStore.getState().setUser(formattedUser);
    return { user: formattedUser, accessToken, refreshToken };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};



export const register = async (formData: FormData) => {
  try {
    const res = await axios.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const user = res?.data?.data?.user;

    const formattedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      profilePicture: user.profilePicture,
      role: user.role,
    };

    console.log("User after register:", formattedUser);

    useAuthStore.getState().setUser(formattedUser);

    return res.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};



export const logout = async () => {
  try {
    const res = await axios.post("/users/logout"); 
    useAuthStore.getState().logout();
    return res.data;
  } catch (error) {
    throw error;
  }
};
