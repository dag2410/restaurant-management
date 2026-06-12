import http from "@/lib/http";
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";

export const accountApiRequest = {
  me: () => http.get<AccountResType>("/accounts/me"),

  sMe: (accessToken: string) =>
    http.get<AccountResType>("/accounts/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  updateMe: (body: UpdateMeBodyType) =>
    http.put<AccountResType>("/accounts/me", body),

  changePassword: (body: ChangePasswordBodyType) =>
    http.put<AccountResType>("/accounts/change-password", body),

  list: () => http.get<AccountListResType>("/accounts"),

  getEmployee: (id: number) =>
    http.get<AccountResType>(`/accounts/detail/${id}`),

  addEmployee: (body: CreateEmployeeAccountBodyType) =>
    http.post<AccountResType>("/accounts", body),

  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`/accounts/detail/${id}`, body),

  deleteEmployee: (id: number) =>
    http.delete<AccountResType>(`/accounts/detail/${id}`),
};
