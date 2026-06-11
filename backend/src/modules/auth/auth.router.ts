import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { requireAuth } from '../../middleware/requireAuth';
import { loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';
import { clearAuthCookie, setAuthCookie } from './auth.cookies';

/**
 * /api/auth routes – registration, login, logout and session lookup.
 * Handlers stay thin: validation via middleware, business logic in the service.
 */
export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
});

authRouter.post('/login', validateBody(loginSchema), async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.status(200).json({ user });
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getCurrentUser(req.userId!);
  res.status(200).json({ user });
});
