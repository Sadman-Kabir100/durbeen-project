import { IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class VerifyOtpDto {
  @Matches(/^01[3-9]\d{8}$/, {
    message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)",
  })
  phone!: string;

  @IsString()
  @Length(4, 8, { message: "OTP কোড ৪-৮ ডিজিটের মধ্যে হতে হবে" })
  otp!: string;

  /**
   * নতুন ইউজার হলে (প্রথমবার লগইন) নাম দরকার — ঐচ্ছিক,
   * বিদ্যমান ইউজারের ক্ষেত্রে এই ফিল্ড উপেক্ষা করা হবে।
   */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;
}
