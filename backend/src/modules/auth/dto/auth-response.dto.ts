export class UserSummaryDto {
  id!: string;
  name!: string;
  phone!: string;
  email?: string | null;
  avatarUrl?: string | null;
  roles!: string[];

  static fromEntity(user: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    avatarUrl?: string | null;
    userRoles?: { role: { slug: string } }[];
  }): UserSummaryDto {
    const dto = new UserSummaryDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.phone = user.phone;
    dto.email = user.email ?? null;
    dto.avatarUrl = user.avatarUrl ?? null;
    dto.roles = user.userRoles?.map((ur) => ur.role.slug) ?? [];
    return dto;
  }
}

export class AuthResponseDto {
  accessToken!: string;
  expiresIn!: number;
  user!: UserSummaryDto;
  // refreshToken response body-তে পাঠানো হয় না — httpOnly cookie দিয়ে সেট হয়
  // (XSS থেকে সুরক্ষার জন্য, Authentication Flow ডকুমেন্টের সিদ্ধান্ত অনুযায়ী)
}

export class OtpRequestResponseDto {
  message!: string;
  expiresInSeconds!: number;
}
