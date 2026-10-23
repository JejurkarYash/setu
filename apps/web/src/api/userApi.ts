import api from "../lib/api";

interface UserResponse {
  ID: string;
  Email: string;
  Name: string;
  AvatarUrl?: string | { String?: string; Valid?: boolean };
}

interface GetUserProfileResponse {
  user: UserResponse;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response =
    await api.get<GetUserProfileResponse>("/user/profile");
  const user = response.data.user;
  const avatarUrl =
    typeof user.AvatarUrl === "string"
      ? user.AvatarUrl
      : user.AvatarUrl?.String ?? "";

  return {
    id: user.ID,
    email: user.Email,
    name: user.Name,
    avatarUrl,
  };
}
