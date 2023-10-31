import { registerController } from '@src/controllers/Guest/Auth/RegisterController';
import { RouterOptions } from '@src/global';
import { onlyGuest, onlyAuth } from '@src/middleware/auth';
import RegisterRequest from '@src/requests/RegisterRequest';
import LoginRequest from '@src/requests/LoginRequest';
import { loginController } from '@src/controllers/Guest/Auth/LoginController';

const registerRequest = new RegisterRequest();
const loginRequest = new LoginRequest();


export const router: RouterOptions = {
  'path': '/api/v1',
  children: [
    {
      path: '/auth',
      middleware: [
        onlyGuest,
      ],
      children: [
        {
          method: 'post',
          path: '/login',
          controller: loginController,
          request: loginRequest.validation,
        },
        {
          path: '/register',
          method: 'post',
          controller: registerController,
          request: registerRequest.validation,
        },
      ],
    },
  ],
};