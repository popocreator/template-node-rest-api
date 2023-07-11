import {
  Table,
  Column,
  Model,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate
} from "sequelize-typescript";
import bcrypt from "bcrypt";

@Table({ tableName: "user" }) // Default: TableName + 's' (Users)
class User extends Model {
  @BeforeUpdate
  static updateLog(instance: User) {
    console.log("Update user", instance.email);
  }

  @BeforeCreate
  static createLog(instance: User) {
    console.log("Create user", instance.email);
    instance.is_confirmed = false;
    instance.password_updated_at = new Date();
    instance.password = bcrypt.hashSync(
      instance.password || "",
      bcrypt.genSaltSync(10)
    );
  }

  @PrimaryKey
  @Column
  readonly id!: number;

  @Column
  email?: string;

  @Column
  password?: string;
  passwordConfirmation?: string;
  newPassword?: string;

  @Column
  email_confirm_token?: string;

  @Column
  reset_password_token?: string;

  @Column
  is_confirmed?: boolean;

  @Column
  password_updated_at?: Date;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}

export default User;
