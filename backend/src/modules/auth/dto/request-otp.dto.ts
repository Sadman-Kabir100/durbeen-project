import { Matches } from "class-validator";

export class RequestOtpDto {
  /**
   * বাংলাদেশি মোবাইল নম্বর ফরম্যাট: 01XXXXXXXXX (১১ ডিজিট, 013/014/015/016/017/018/019 দিয়ে শুরু)
   */
  @Matches(/^01[3-9]\d{8}$/, {
    message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)",
  })
  phone!: string;
}
