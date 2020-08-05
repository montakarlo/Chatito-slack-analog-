import api from '../common/helpers/apiHelper';
import { string } from 'yup';
import { IUser } from '../common/models/user/user';
import { ISignServerResponse } from '../common/models/signIn-signUp/user';

interface ISignUpFields {
  email: string;
  password: string;
  fullName: string;
}

interface ISignInFields {
  email: string;
  password: string;
}

export const login = async (userInput: ISignInFields) => {
  const userData = {
    userData: JSON.stringify(userInput)
  };
  const response: ISignServerResponse & Response = await api.post('/api/auth/login', userData);

  return response.json();
};

export const registration = async (userInput: ISignUpFields): Promise<IUser> => {
  const { email, password, fullName } = userInput;
  const mappedFields = {
    email,
    password,
    fullName
  };
  const userData = {
    userData: JSON.stringify(mappedFields)
  };
  const response: ISignServerResponse & Response = await api.post('/api/auth/register', userData);

  return response.json();
};
