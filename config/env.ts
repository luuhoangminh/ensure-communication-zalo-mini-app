// config/env.ts
// account info and other env variables

import { create } from "node:domain";
import { title } from "node:process";

export const API = {
  baseApiUrl: process.env.BASE_API_URL!,
  myProfile: process.env.MY_PROFILE_API_URL!
};

export const ENV = {
  baseUrl: process.env.BASE_URL!,
  username: process.env.ADMIN_USERNAME!,
  password: process.env.ADMIN_PASSWORD!
};

export const VALID_USER = {
  email: process.env.VALID_USER!,
  password: process.env.VALID_PASSWORD!
};

export const INVALID_USER = {
  email: process.env.INVALID_USER!,
  password: process.env.INVALID_PASSWORD!
};

export const LOGIN_PAGE = {
  url: process.env.LOGIN_URL!,
  email: process.env.LOGIN_EMAIL_SELECTOR!,
  password: process.env.LOGIN_PASSWORD_SELECTOR!,
  button: process.env.LOGIN_BUTTON_SELECTOR!,
  rememberMe: process.env.LOGIN_REMEMBER_ME_SELECTOR!,
  eyeIcon: process.env.LOGIN_EYE_ICON_SELECTOR!,
  errorMsg: process.env.LOGIN_ERROR_MSG_SELECTOR!,
  errorMsgPass: process.env.LOGIN_ERROR_MSG_PASS_SELECTOR!,
  errorMsgUser: process.env.LOGIN_ERROR_MSG_USER_SELECTOR!,
  forgotPasswordLink: process.env.LOGIN_FORGOT_PASSWORD_LINK_SELECTOR!,
  emailForgotPasswordInput: process.env.LOGIN_EMAIL_FORGOT_PASSWORD_INPUT_SELECTOR!
};

export const LOGOUT_PAGE = {
  userProfile: process.env.LOGOUT_USER_PROFILE_SELECTOR!,
  username: process.env.LOGOUT_USERNAME_SELECTOR!,
  role: process.env.LOGOUT_ROLE_SELECTOR!,
  changePassword: process.env.LOGOUT_CHANGE_PASSWORD_SELECTOR!,
  logoutButton: process.env.LOGOUT_BUTTON_SELECTOR!
};

export const ROLE_LIST_PAGE = {
  url: process.env.ROLE_LIST_URL!,
  apiUrl: process.env.ROLE_LIST_API_URL!,
  searchInput: process.env.ROLE_LIST_SEARCH_INPUT_SELECTOR!,
  // roleTypeDropdown: process.env.ROLE_LIST_ROLE_TYPE_DROPDOWN_SELECTOR!,
  // filterButton: process.env.ROLE_LIST_FILTER_BUTTON_SELECTOR!,
  clearFilterButton: process.env.ROLE_LIST_CLEAR_FILTER_BUTTON_SELECTOR!,
  createBtn: process.env.ROLE_LIST_CREATE_BUTTON_SELECTOR!,
  tableRows: process.env.ROLE_LIST_TABLE_ROWS_SELECTOR!,
  tableColumns: process.env.ROLE_LIST_TABLE_COLUMNS_SELECTOR!,
  tableColumnsHasSort: process.env.ROLE_LIST_TABLE_COLUMNS_HAS_SORT_SELECTOR!,
  editIcons: process.env.ROLE_LIST_EDIT_ICONS_SELECTOR!,
  nextPageButton: process.env.ROLE_LIST_NEXT_PAGE_BUTTON_SELECTOR!,
  prevPageButton: process.env.ROLE_LIST_PREV_PAGE_BUTTON_SELECTOR!,
  pageSizeDropdown: process.env.ROLE_LIST_PAGE_SIZE_DROPDOWN_SELECTOR!,
  pageSizeOption: process.env.ROLE_LIST_PAGE_SIZE_OPTION_SELECTOR!,
  roleNameField: process.env.ROLE_LIST_ROLE_NAME_FIELD_SELECTOR!,
  roleCodeField: process.env.ROLE_LIST_ROLE_CODE_FIELD_SELECTOR!,
  errorMsg: process.env.ROLE_LIST_ERROR_MSG_SELECTOR!,
  backButton: process.env.ROLE_LIST_BACK_BUTTON_SELECTOR!,
  saveButton: process.env.ROLE_LIST_SAVE_BUTTON_SELECTOR!
};

export const NEWS_LIST_PAGE = {
  url: process.env.NEWS_LIST_URL!,
  apiUrl: process.env.NEWS_LIST_API_URL!,
  createOrEditUrl: process.env.NEWS_LIST_CREATE_OR_EDIT_URL!,
  searchInput: process.env.NEWS_LIST_SEARCH_INPUT_SELECTOR!,
  roleTypeDropdown: process.env.NEWS_LIST_ROLE_TYPE_DROPDOWN_SELECTOR!,
  filterButton: process.env.NEWS_LIST_FILTER_BUTTON_SELECTOR!,
  clearFilterButton: process.env.NEWS_LIST_CLEAR_FILTER_BUTTON_SELECTOR!,
  createBtn: process.env.NEWS_LIST_CREATE_BUTTON_SELECTOR!,
  tableRows: process.env.NEWS_LIST_TABLE_ROWS_SELECTOR!,
  tableColumns: process.env.NEWS_LIST_TABLE_COLUMNS_SELECTOR!,
  tableColumnsHasSort: process.env.NEWS_LIST_TABLE_COLUMNS_HAS_SORT_SELECTOR!,
  rowActions: process.env.NEWS_LIST_ROW_ACTIONS_SELECTOR!,
  firstPageButton: process.env.NEWS_LIST_FIRST_PAGE_BUTTON_SELECTOR!,
  prevPageButton: process.env.NEWS_LIST_PREV_PAGE_BUTTON_SELECTOR!,
  pageActive: process.env.NEWS_LIST_PAGE_ACTIVE_SELECTOR!,
  nextPageButton: process.env.NEWS_LIST_NEXT_PAGE_BUTTON_SELECTOR!,
  lastPageButton: process.env.NEWS_LIST_LAST_PAGE_BUTTON_SELECTOR!,
  pageSizeDropdown: process.env.NEWS_LIST_PAGE_SIZE_DROPDOWN_SELECTOR!,
  titleField: process.env.NEWS_LIST_TITLE_FIELD_SELECTOR!,
  seoTitleField: process.env.NEWS_LIST_SEO_TITLE_FIELD_SELECTOR!,
  slugField: process.env.NEWS_LIST_SLUG_FIELD_SELECTOR!,
  shortDescriptionField: process.env.NEWS_LIST_SHORT_DESCRIPTION_FIELD_SELECTOR!,
  contentField: process.env.NEWS_LIST_CONTENT_FIELD_SELECTOR!,
  backButton: process.env.NEWS_LIST_BACK_BUTTON_SELECTOR!,
  saveButton: process.env.NEWS_LIST_SAVE_BUTTON_SELECTOR!
};