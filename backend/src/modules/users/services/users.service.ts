import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserStatus } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { UserRole } from "../entities/user-role.entity";

const DEFAULT_ROLE_SLUG = "customer";

/**
 * এই মুহূর্তে শুধু Authentication মডিউলের জন্য প্রয়োজনীয় মেথডগুলো আছে
 * (findByPhone, create, updateLastLogin)। পরের "User Management" ধাপে এখানে
 * পূর্ণাঙ্গ CRUD, প্রোফাইল আপডেট, soft-delete, addresses সম্পর্ক ইত্যাদি যুক্ত হবে —
 * ফাইলের নামের সাথে "repository-service" রাখা হয়েছে যাতে বোঝা যায় এটি এখনো
 * চূড়ান্ত UsersService নয়, বরং Auth-নির্ভর একটি প্রাথমিক সংস্করণ।
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ["userRoles", "userRoles.role"],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ["userRoles", "userRoles.role"],
    });
  }

  async createFromPhone(phone: string, name: string): Promise<User> {
    const user = this.userRepository.create({
      phone,
      name,
      status: UserStatus.ACTIVE,
      phoneVerifiedAt: new Date(),
    });
    const saved = await this.userRepository.save(user);
    await this.assignDefaultRole(saved.id);
    return (await this.findById(saved.id))!;
  }

  /**
   * নতুন রেজিস্ট্রেশনে ডিফল্টভাবে "customer" রোল অ্যাসাইন হয় (seed migration-এ এই রোল থাকতে হবে)।
   * "roles" টেবিল/RBAC-এর পূর্ণাঙ্গ ম্যানেজমেন্ট (রোল তৈরি/এডিট/পারমিশন অ্যাসাইনমেন্ট) আসবে
   * ভবিষ্যতের একটি ভিন্ন প্রশাসনিক মডিউলে (Admin/RBAC ম্যানেজমেন্ট), এখানে শুধু bootstrap লজিক।
   */
  private async assignDefaultRole(userId: string): Promise<void> {
    const defaultRole = await this.roleRepository.findOne({ where: { slug: DEFAULT_ROLE_SLUG } });
    if (!defaultRole) {
      this.logger.warn(
        `ডিফল্ট রোল "${DEFAULT_ROLE_SLUG}" পাওয়া যায়নি — সিড মাইগ্রেশন চালানো হয়েছে কিনা যাচাই করুন`
      );
      return;
    }
    const userRole = this.userRoleRepository.create({ userId, roleId: defaultRole.id });
    await this.userRoleRepository.save(userRole);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { lastLoginAt: new Date() });
  }
}
